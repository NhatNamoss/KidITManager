import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFixture } from './fixture.js';
import { validateSession, monthRange, validDate } from '../server/session-domain.js';
import { summarizeSessionWork } from '../shared/payroll.js';

const session = (patch = {}) => ({ date: '2026-10-01', start_time: '15:15', end_time: '17:15', status: 'completed', notes: 'Dạy thay', staff: [{ teacher_id: 3, role: 'teacher' }], ...patch });
async function serve(app, t) {
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return async (path, body, method = 'POST') => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, data: await response.json() };
  };
}

test('validation rejects impossible dates, duplicate staff, invalid roles and future completion', () => {
  assert.equal(validDate('2026-02-30'), false);
  for (const patch of [ { end_time: '14:00' }, { date: '2099-01-01' }, { staff: [] }, { staff: [{ teacher_id: 1, role: 'unknown' }] }, { staff: [{ teacher_id: 1, role: 'teacher' }, { teacher_id: 1, role: 'ta' }] } ]) assert.throws(() => validateSession(session(patch)));
  assert.deepEqual(validateSession(session({ staff: [{ teacher_id: 3, role: 'teacher', minutes: -100, work_units: 999 }] })).staff, [{ teacher_id: 3, role: 'teacher' }]);
  assert.equal(validateSession(session({ date: '2099-01-01', status: 'draft' })).status, 'draft');
  assert.deepEqual(monthRange('2026-12'), ['2026-12-01', '2027-01-01']);
  assert.throws(() => monthRange('2026-13'));
});

test('actual substitute, multiple shifts, roles, status and revisions feed session-based payroll correctly', async t => {
  const { app, sqlite } = createFixture(); t.after(() => sqlite.close()); const request = await serve(app, t);
  const first = await request('/api/classes/1/sessions', session()); assert.equal(first.status, 200);
  const repeated = await request('/api/classes/1/sessions', session()); assert.equal(repeated.status, 409);
  const second = await request('/api/classes/1/sessions', session({ start_time: '17:15', end_time: '17:45', staff: [{ teacher_id: 1, role: 'teacher' }, { teacher_id: 2, role: 'ta' }] })); assert.equal(second.status, 200);
  await request('/api/classes/1/sessions', session({ date: '2026-10-02', status: 'draft' }));
  const report = await request('/api/payroll?month=2026-10', null, 'GET');
  assert.equal(report.data.basis, 'session');
  assert.equal(report.data.rows.length, 3); assert.equal(report.data.rows.reduce((n, r) => n + r.work_units, 0), 3);
  assert.ok(report.data.rows.every(row => !('minutes' in row)));
  assert.equal(report.data.rows[0].teacher_name, 'GV dạy thay C'); assert.equal(report.data.legacy.length, 1);
  const cancel = await request(`/api/classes/1/sessions/${first.data.id}`, session({ status: 'cancelled', version: 1 }), 'PUT'); assert.equal(cancel.status, 200);
  const stale = await request(`/api/classes/1/sessions/${first.data.id}`, session({ version: 1 }), 'PUT'); assert.equal(stale.status, 409);
  const after = await request('/api/payroll?month=2026-10', null, 'GET'); assert.equal(after.data.rows.length, 2);
  assert.equal(sqlite.prepare('SELECT count(*) AS n FROM session_revisions').get().n, 4);
  assert.equal(sqlite.prepare('SELECT teacher FROM classes WHERE id=1').get().teacher, 'GV kiểm thử A');
});

test('invalid teacher and audit write failure roll back the entire save', async t => {
  const { app, sqlite, state } = createFixture(); t.after(() => sqlite.close()); const request = await serve(app, t);
  assert.equal((await request('/api/classes/1/sessions', session({ staff: [{ teacher_id: 99, role: 'teacher' }] }))).status, 400);
  state.failRevision = true;
  assert.equal((await request('/api/classes/1/sessions', session())).status, 500);
  assert.equal(sqlite.prepare('SELECT count(*) AS n FROM teaching_sessions').get().n, 0);
  assert.equal(sqlite.prepare('SELECT count(*) AS n FROM session_staff').get().n, 0);
});

test('short and long sessions each count as one work unit, regardless of legacy minute values', async t => {
  const { app, sqlite } = createFixture(); t.after(() => sqlite.close()); const request = await serve(app, t);
  await request('/api/classes/1/sessions', session({ start_time: '07:00', end_time: '08:00' }));
  await request('/api/classes/1/sessions', session({ start_time: '09:00', end_time: '12:00', staff: [{ teacher_id: 3, role: 'teacher', minutes: 10000, work_units: 5 }] }));
  sqlite.prepare('UPDATE session_staff SET minutes=? WHERE session_id=?').run(1, 1);
  sqlite.prepare('UPDATE session_staff SET minutes=? WHERE session_id=?').run(9999, 2);
  const report = await request('/api/payroll?month=2026-10', null, 'GET');
  assert.deepEqual(report.data.rows.map(row => row.work_units), [1, 1]);
  assert.deepEqual(summarizeSessionWork([...report.data.rows, report.data.rows[0]]), [{ id: '3-teacher', name: 'GV dạy thay C (#3)', role: 'teacher', count: 2 }]);
  const sessions = await request('/api/classes/1/sessions', null, 'GET');
  assert.ok(sessions.data.every(row => row.staff.every(person => !('minutes' in person))));
});

test('reading and recording teaching sessions requires no login or cookie', async t => {
  const { app, sqlite } = createFixture(); t.after(() => sqlite.close()); const request = await serve(app, t);
  assert.equal((await request('/api/classes', null, 'GET')).status, 200);
  assert.equal((await request('/api/classes/1/sessions', session())).status, 200);
  assert.equal((await request('/api/payroll?month=2026-10', null, 'GET')).data.rows.length, 1);
});
