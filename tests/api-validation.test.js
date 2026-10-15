import { test } from 'node:test';
import assert from 'node:assert/strict';

test('production API rejects invalid CRUD payloads before reaching database', async t => {
  process.env.NODE_ENV = 'production';
  process.env.INIT_DB = 'false';
  process.env.DB_HOST = '127.0.0.1';
  process.env.DB_PORT = '1';
  process.env.DB_USER = 'fixture';
  process.env.DB_PASSWORD = 'fixture-unused';
  process.env.APP_PASSWORD = 'test-api-validation-password';
  process.env.SESSION_SECRET = 'test-api-validation-secret-at-least-32-characters';
  const { default: app } = await import('../api/index.js');
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const login = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: process.env.APP_PASSWORD }) });
  const cookie = login.headers.get('set-cookie').split(';')[0];
  for (const [path, body] of [
    ['/students', { name: '   ' }], ['/students', { name: 'Test', phone: {} }],
    ['/teachers', { name: 'Test', role: 99 }], ['/classes', { name: 'Test', capacity: -1 }],
    ['/invoices', { amount: -100, status: 'paid' }], ['/invoices', { amount: 100, status: 'unknown' }],
    ['/classes/1/attendance', { date: '2026-02-30', status: 'present', student_id: 1 }]
  ]) {
    const response = await fetch(`${base}/api${path}`, { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    assert.equal(response.status, 400, path);
  }
  const foreign = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { Origin: 'https://other.example', 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(foreign.status, 403);
  const missing = await fetch(`${base}/api/does-not-exist`, { headers: { Cookie: cookie } });
  assert.equal(missing.status, 404); assert.match(missing.headers.get('content-type'), /json/);
});
