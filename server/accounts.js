import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { InputError } from './session-domain.js';
import { usernameFromName } from '../shared/accounts.js';
export { usernameFromName } from '../shared/accounts.js';

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function verifyPassword(password, hash) {
  const [salt, value] = hash.split(':');
  const expected = Buffer.from(value, 'hex');
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
const digest = value => createHash('sha256').update(value).digest('hex');
const cookieOptions = req => `Path=/; HttpOnly; SameSite=Lax${req.secure || req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : ''}`;
const publicUser = row => ({ id: row.id, username: row.username, role: row.account_role, teacher_id: row.teacher_id, name: row.name || 'Quản trị viên', teacher_role: row.teacher_role });
export function validateCredentials(username, password) {
  if (typeof username !== 'string' || !/^[a-z0-9][a-z0-9._-]{0,99}$/.test(username)) throw new InputError('Tên tài khoản gồm 1–100 chữ thường không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.');
  if (typeof password !== 'string' || !password.length || password.length > 128) throw new InputError('Mật khẩu cần từ 1 đến 128 ký tự.');
}

export async function createTeacherAccount(connection, teacherId, name, username, password = 'kidit') {
  const base = username || usernameFromName(name);
  let chosen = base;
  for (let suffix = 2; ; suffix++) {
    const [[existing]] = await connection.query('SELECT id FROM accounts WHERE username=?', [chosen]);
    if (!existing) break;
    if (username) throw new InputError('Tên tài khoản đã được sử dụng.', 409);
    chosen = `${base}${suffix}`;
  }
  validateCredentials(chosen, password);
  await connection.query("INSERT INTO accounts (username,password_hash,account_role,teacher_id) VALUES (?,?,'teacher',?)", [chosen, hashPassword(password), teacherId]);
  return chosen;
}

export function registerAccounts(app, pool) {
  const db = pool.promise();
  const userSql = 'SELECT a.*, t.name, t.role AS teacher_role FROM accounts a LEFT JOIN teachers t ON t.id=a.teacher_id';
  const attempts = new Map();
  app.post('/api/auth/login', async (req, res, next) => {
    try {
      const key = req.ip;
      const now = Date.now();
      for (const [ip, entry] of attempts) if (entry.until <= now) attempts.delete(ip);
      const attempt = attempts.get(key) || { count: 0, until: now + 15 * 60_000 };
      if (attempt.count >= 20) return res.status(429).json({ error: 'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.' });
      const { username, password } = req.body || {};
      validateCredentials(username, password);
      const [[row]] = await db.query(`${userSql} WHERE a.username=?`, [username]);
      if (!verifyPassword(password, row?.password_hash || hashPassword('invalid-login'))) {
        attempt.count++; attempts.set(key, attempt);
        return res.status(401).json({ error: 'Tên tài khoản hoặc mật khẩu không đúng.' });
      }
      attempts.delete(key);
      const token = randomBytes(32).toString('hex');
      await db.query('INSERT INTO account_sessions (token_hash,account_id,expires_at) VALUES (?,?,?)', [digest(token), row.id, new Date(now + 7 * 86400_000)]);
      res.setHeader('Set-Cookie', `kidit_session=${token}; Max-Age=604800; ${cookieOptions(req)}`);
      res.json(publicUser(row));
    } catch (error) { next(error); }
  });
  app.use('/api', async (req, res, next) => {
    try {
      const token = req.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith('kidit_session='))?.slice(14);
      if (!token || !/^[a-f0-9]{64}$/.test(token)) return res.status(401).json({ error: 'Vui lòng đăng nhập.' });
      const [[row]] = await db.query(`${userSql} JOIN account_sessions s ON s.account_id=a.id WHERE s.token_hash=? AND s.expires_at>CURRENT_TIMESTAMP`, [digest(token)]);
      if (!row) return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
      req.user = publicUser(row); req.sessionHash = digest(token); next();
    } catch (error) { next(error); }
  });
  app.get('/api/auth/me', (req, res) => res.json(req.user));
  app.post('/api/auth/logout', async (req, res, next) => {
    try {
      await db.query('DELETE FROM account_sessions WHERE token_hash=?', [req.sessionHash]);
      res.setHeader('Set-Cookie', `kidit_session=; Max-Age=0; ${cookieOptions(req)}`);
      res.json({ success: true });
    } catch (error) { next(error); }
  });
  app.use('/api/accounts', (req, res, next) => req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Chỉ admin được quản lý tài khoản.' }));
  app.get('/api/accounts', async (req, res, next) => {
    try { const [rows] = await db.query(`${userSql} ORDER BY a.id`); res.json(rows.map(publicUser)); } catch (error) { next(error); }
  });
  app.post('/api/accounts', async (req, res, next) => {
    let connection;
    try {
      const { teacher_id, username, password = 'kidit', name, role = 1, phone = '' } = req.body;
      if (username != null && typeof username !== 'string') throw new InputError('Tên tài khoản không hợp lệ.');
      validateCredentials(username || 'auto', password);
      if (teacher_id && (!Number.isSafeInteger(teacher_id) || teacher_id < 1)) throw new InputError('Mã giáo viên không hợp lệ.');
      connection = await db.getConnection(); await connection.beginTransaction();
      await connection.query("SELECT id FROM accounts WHERE account_role='admin' ORDER BY id LIMIT 1 FOR UPDATE");
      let teacher;
      if (teacher_id) {
        [[teacher]] = await connection.query('SELECT id,name FROM teachers WHERE id=? FOR UPDATE', [teacher_id]);
      } else {
        if (typeof name !== 'string' || !name.trim() || name.length > 255 || ![1, 2].includes(Number(role)) || typeof phone !== 'string' || phone.length > 255) throw new InputError('Họ tên, vai trò hoặc số điện thoại không hợp lệ.');
        const [result] = await connection.query('INSERT INTO teachers (name,role,phone) VALUES (?,?,?)', [name.trim(), Number(role), phone]);
        teacher = { id: result.insertId, name: name.trim() };
      }
      if (!teacher) throw new InputError('Hãy chọn giáo viên có trong danh sách.');
      const [[linked]] = await connection.query('SELECT id FROM accounts WHERE teacher_id=?', [teacher.id]);
      if (linked) throw new InputError('Giáo viên đã có tài khoản. Hãy sửa tài khoản hiện có.', 409);
      const chosen = await createTeacherAccount(connection, teacher.id, teacher.name, username || undefined, password);
      await connection.commit(); res.json({ success: true, username: chosen });
    } catch (error) { if (connection) await connection.rollback(); next(error); } finally { connection?.release(); }
  });
  app.put('/api/accounts/:id', async (req, res, next) => {
    let connection;
    try {
      const { username, password } = req.body;
      validateCredentials(username, password || 'unchanged');
      if (password != null && typeof password !== 'string') throw new InputError('Mật khẩu không hợp lệ.');
      connection = await db.getConnection(); await connection.beginTransaction();
      const [[row]] = await connection.query('SELECT id FROM accounts WHERE id=? FOR UPDATE', [req.params.id]);
      if (!row) throw new InputError('Không tìm thấy tài khoản.', 404);
      await connection.query('UPDATE accounts SET username=? WHERE id=?', [username, row.id]);
      if (password) {
        await connection.query('UPDATE accounts SET password_hash=? WHERE id=?', [hashPassword(password), row.id]);
        await connection.query('DELETE FROM account_sessions WHERE account_id=?', [row.id]);
      }
      await connection.commit(); res.json({ success: true });
    } catch (error) { if (connection) await connection.rollback(); next(error); } finally { connection?.release(); }
  });
}
