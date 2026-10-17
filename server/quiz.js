import { randomInt } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { InputError } from './session-domain.js';
import { answerQuestion, createRoom, hostAction, joinRoom, newQuizToken, roomView, settleRoom, tokenDigest, useSkill } from './quiz-domain.js';

export function createQuizService(pool, { now = Date.now } = {}) {
  const db = pool.promise();
  const find = async code => {
    if (!/^\d{6}$/.test(code)) throw new InputError('Mã phòng gồm 6 chữ số.');
    const [[row]] = await db.query('SELECT * FROM quiz_rooms WHERE code=?', [code]);
    if (!row || Number(row.expires_at) <= now()) throw new InputError('Phòng không tồn tại hoặc đã hết hạn sau 24 giờ.', 404);
    return row;
  };
  const identify = (row, room, req, host) => {
    if (host) {
      if (!req.user || Number(row.owner_id) !== req.user.id) throw new InputError('Bạn không quản lý phòng này.', 403);
      return null;
    }
    const token = req.headers.authorization?.replace(/^Bearer /, '');
    if (!token || !/^[a-f0-9]{64}$/.test(token)) throw new InputError('Phiên chơi không hợp lệ. Hãy vào phòng lại.', 403);
    const player = room.players.find(p => p.tokenHash === tokenDigest(token));
    if (!player) throw new InputError('Phiên chơi không còn trong phòng. Hãy vào phòng lại.', 403);
    return player;
  };
  const update = async (req, host, operation, joining = false) => {
    for (let attempt = 0; attempt < 24; attempt++) {
      const row = await find(req.params.code);
      const room = JSON.parse(row.state);
      const player = joining ? null : identify(row, room, req, host);
      const time = now();
      const changed = settleRoom(room, time);
      let result;
      // Read requests only write when a timed question needs to be settled.
      if (operation) result = operation(room, player, time);
      if (operation || changed) {
        const [saved] = await db.query('UPDATE quiz_rooms SET state=?,version=version+1 WHERE code=? AND version=?', [JSON.stringify(room), row.code, row.version]);
        if (!saved.affectedRows) {
          await delay(randomInt(5, Math.min(200, 20 * (attempt + 1))));
          continue;
        }
      }
      return { room: { ...roomView(room, row.code, time, joining ? result : player, host), revision: row.version + (operation || changed ? 1 : 0) }, result };
    }
    throw new InputError('Phòng đang nhận nhiều thao tác. Vui lòng thử lại.', 409);
  };
  const wrap = handler => async (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    try { await handler(req, res); }
    catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes('no such table: quiz_rooms')) return res.status(503).json({ error: 'Đấu trường chưa được khởi tạo trên máy chủ. Quản trị viên cần chạy migration 003-quiz-rooms.sql.' });
      next(error);
    }
  };
  return {
    registerPublic(app) {
      app.post('/api/play/:code/join', wrap(async (req, res) => {
        const token = newQuizToken();
        const { room } = await update(req, false, state => joinRoom(state, req.body?.name, token), true);
        res.json({ token, room });
      }));
      app.get('/api/play/:code', wrap(async (req, res) => res.json((await update(req, false)).room)));
      app.post('/api/play/:code/answer', wrap(async (req, res) => res.json((await update(req, false, (room, player, time) => answerQuestion(room, player, req.body, time))).room)));
      app.post('/api/play/:code/skill', wrap(async (req, res) => res.json((await update(req, false, (room, player, time) => useSkill(room, player, req.body, time))).room)));
    },
    registerHost(app) {
      app.use('/api/quiz', (req, res, next) => req.user ? next() : res.status(401).json({ error: 'Giáo viên cần đăng nhập.' }));
      app.get('/api/quiz/rooms', wrap(async (req, res) => {
        const [rows] = await db.query('SELECT code,state FROM quiz_rooms WHERE owner_id=? AND expires_at>? ORDER BY expires_at DESC LIMIT 15', [req.user.id, now()]);
        res.json(rows.map(row => { const room = JSON.parse(row.state); return { code: row.code, title: room.title, phase: room.phase }; }));
      }));
      app.post('/api/quiz/rooms', wrap(async (req, res) => {
        const time = now();
        const room = createRoom(req.body, time);
        for (let attempt = 0; attempt < 10; attempt++) {
          const code = String(randomInt(100000, 1000000));
          try {
            await db.query('INSERT INTO quiz_rooms (code,owner_id,state,version,expires_at) VALUES (?,?,?,0,?)', [code, req.user.id, JSON.stringify(room), time + 86400_000]);
            return res.status(201).json({ ...roomView(room, code, time, null, true), revision: 0 });
          } catch (error) { if (error.code !== 'ER_DUP_ENTRY' && !error.message?.includes('UNIQUE constraint failed: quiz_rooms.code')) throw error; }
        }
        throw new InputError('Chưa tạo được mã phòng. Vui lòng thử lại.', 409);
      }));
      app.get('/api/quiz/rooms/:code', wrap(async (req, res) => res.json((await update(req, true)).room)));
      app.post('/api/quiz/rooms/:code/action', wrap(async (req, res) => res.json((await update(req, true, (room, _player, time) => hostAction(room, req.body, time))).room)));
    },
  };
}
