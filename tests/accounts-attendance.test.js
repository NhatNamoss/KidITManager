import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFixture } from './fixture.js';
import { usernameFromName, createTeacherAccount, hashPassword, verifyPassword } from '../server/accounts.js';
import { scheduleSlots } from '../shared/class-schedule.js';

async function serve(t) {
  const fixture = createFixture({ auth: true });
  const server = fixture.app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(async () => { await new Promise(resolve => server.close(resolve)); fixture.sqlite.close(); });
  const request = async (path, body, cookie = '', method = body ? 'POST' : 'GET') => {
    const res = await fetch(`http://127.0.0.1:${server.address().port}/api${path}`, { method, headers: { 'Content-Type': 'application/json', Cookie: cookie }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: res.status, data: await res.json(), cookie: res.headers.get('set-cookie')?.split(';')[0] };
  };
  const login = async (username, password = 'kidit') => (await request('/auth/login', { username, password })).cookie;
  return { ...fixture, request, login };
}
const entry = (patch = {}) => ({ date: '2026-10-01', start_time: '15:15', end_time: '17:15', slot: 'Thứ 5 (15:15 - 17:15)', lesson: 'Lập trình vòng lặp', role: 'teacher', status: 'completed', notes: '', version: 0, ...patch });

test('Vietnamese login names, salted password hashes and schedule choices', async () => {
  assert.equal(usernameFromName('Nguyễn Đăng Phát'), 'nguyendangphat');
  assert.equal(usernameFromName('  ĐỖ THỊ ÁNH  '), 'dothianh');
  const hash = hashPassword('kidit');
  assert.ok(verifyPassword('kidit', hash)); assert.equal(verifyPassword('wrong', hash), false); assert.notEqual(hash, hashPassword('kidit'));
  assert.deepEqual(scheduleSlots('Thứ 5 (15:15 - 17:15), Thứ 5 (18:00 - 19:00), Thứ 6 (09:00 - 10:00)', '2026-10-01').map(s => s.start_time), ['15:15', '18:00']);
});

test('two teachers claim the same shift independently, cannot edit each other, report is shared', async t => {
  const { request, login, sqlite } = await serve(t);
  assert.equal((await request('/classes')).status, 401);
  assert.equal((await request('/auth/login', { username: 'gv1', password: 'wrong' })).status, 401);
  const a = await login('gv1'), b = await login('gv2');
  assert.equal((await request('/classes/1/sessions', entry(), a)).status, 410);
  const first = await request('/classes/1/personal-attendance', entry({ teacher_id: 2, staff: [{ teacher_id: 2, role: 'teacher' }] }), a);
  assert.equal(first.status, 200); assert.equal(sqlite.prepare('SELECT teacher_id FROM personal_attendance').get().teacher_id, 1);
  assert.equal((await request('/classes/1/personal-attendance', entry({ role: 'ta' }), b)).status, 200);
  assert.equal((await request('/classes/1/personal-attendance', entry(), a)).status, 409);
  assert.equal((await request(`/classes/1/personal-attendance/${first.data.id}`, entry({ version: 1 }), b, 'PUT')).status, 403);
  const report = await request('/payroll?month=2026-10', null, a);
  assert.equal(report.data.rows.length, 2); assert.ok(report.data.rows.every(r => r.lesson === 'Lập trình vòng lặp'));
  const cancelled = await request(`/classes/1/personal-attendance/${first.data.id}`, entry({ status: 'cancelled', version: 1 }), a, 'PUT');
  assert.equal(cancelled.status, 200);
  assert.equal((await request(`/classes/1/personal-attendance/${first.data.id}`, entry({ version: 1 }), a, 'PUT')).status, 409);
  assert.equal((await request('/payroll?month=2026-10', null, b)).data.rows.length, 1);
  assert.equal((await request('/classes', null, a)).status, 200);
});

test('schedule validation, lesson, future confirmation, legacy duplicates and admin cannot claim', async t => {
  const { request, login, sqlite } = await serve(t); const a = await login('gv1');
  for (const patch of [{ lesson: '' }, { slot: 'Tự nhập' }, { start_time: '15:00' }, { date: '2026-10-02' }, { date: '2099-01-01' }]) {
    assert.equal((await request('/classes/1/personal-attendance', entry(patch), a)).status, 400);
  }
  const admin = await login('admin', 'admin');
  assert.equal((await request('/classes/1/personal-attendance', entry(), admin)).status, 403);
  sqlite.exec("INSERT INTO teaching_sessions (id,class_id,date,start_time,end_time,status,notes) VALUES (1,1,'2026-10-01','15:15','17:15','completed',''); INSERT INTO session_staff (session_id,teacher_id,teacher_name,role,minutes) VALUES (1,1,'GV kiểm thử A','teacher',0)");
  assert.equal((await request('/classes/1/personal-attendance', entry(), a)).status, 409);
  assert.equal((await request('/payroll?month=2026-10', null, a)).data.rows.length, 1);
});

test('admin creates teacher accounts, changes login and password, invalidates sessions', async t => {
  const { request, login, sqlite } = await serve(t);
  const admin = await login('admin', 'admin'), teacher = await login('gv1');
  assert.equal((await request('/accounts', null, teacher)).status, 403);
  assert.equal((await request('/accounts/2', { username: 'changed', password: 'changed' }, teacher, 'PUT')).status, 403);
  assert.equal((await request('/accounts/2', { username: 'teacherone', password: '' }, admin, 'PUT')).status, 200);
  assert.equal((await request('/auth/me', null, teacher)).data.username, 'teacherone');
  assert.ok(await login('teacherone'));
  assert.equal((await request('/accounts', { name: 'Nguyễn Đăng Phát', username: 'nguyendangphat', password: 'kidit' }, teacher)).status, 403);
  const created = await request('/accounts', { name: 'Nguyễn Đăng Phát', username: 'nguyendangphat', password: 'kidit' }, admin);
  assert.equal(created.status, 200);
  const account = sqlite.prepare("SELECT * FROM accounts WHERE username='nguyendangphat'").get();
  assert.ok(account.teacher_id); assert.ok(verifyPassword('kidit', account.password_hash));
  const oldCookie = await login('nguyendangphat');
  assert.equal((await request(`/accounts/${account.id}`, { username: 'phat', password: 'newpass' }, admin, 'PUT')).status, 200);
  assert.equal((await request('/auth/me', null, oldCookie)).status, 401);
  assert.equal((await request('/auth/login', { username: 'nguyendangphat', password: 'kidit' })).status, 401);
  const newCookie = await login('phat', 'newpass'); assert.ok(newCookie);
  assert.equal((await request('/auth/logout', {}, newCookie)).status, 200);
  assert.equal((await request('/auth/me', null, newCookie)).status, 401);
  assert.equal((await request('/accounts', { name: 'Trùng tên', username: 'phat' }, admin)).status, 409);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM teachers WHERE name='Trùng tên'").get().n, 0);
});

test('own historic slot stays editable after schedule changes, other dates use the new schedule', async t => {
  const { request, login, sqlite } = await serve(t); const cookie = await login('gv1');
  const saved = await request('/classes/1/personal-attendance', entry(), cookie);
  sqlite.prepare('UPDATE classes SET schedule=? WHERE id=1').run('Thứ 5 (18:00 - 19:00)');
  const path = `/classes/1/personal-attendance/${saved.data.id}`;
  assert.equal((await request(path, entry({ lesson: 'Bài học cập nhật', version: 1 }), cookie, 'PUT')).status, 200);
  assert.equal((await request(path, entry({ date: '2026-10-08', version: 2 }), cookie, 'PUT')).status, 400);
  assert.equal(sqlite.prepare('SELECT lesson FROM personal_attendance').get().lesson, 'Bài học cập nhật');
});

test('automatic accounts disambiguate matching names and default to kidit', async () => {
  const rows = new Map();
  const connection = { async query(sql, params) {
    if (sql.startsWith('SELECT')) return [[...(rows.has(params[0]) ? [{ id: 1 }] : [])]];
    rows.set(params[0], params[1]); return [{}];
  } };
  assert.equal(await createTeacherAccount(connection, 1, 'Nguyễn Đăng Phát'), 'nguyendangphat');
  assert.equal(await createTeacherAccount(connection, 2, 'Nguyễn Đăng Phát'), 'nguyendangphat2');
  assert.ok(verifyPassword('kidit', rows.get('nguyendangphat2')));
});
