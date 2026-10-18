import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFixture } from './fixture.js';
import { classSlots, classPayload, buildScheduleBlocks, classStaff } from '../src/redesign/schedule.js';
import { validateScheduleRows, staffSummary } from '../src/redesign/schedule.js';

async function setup(t) {
  const fixture = createFixture();
  const server = fixture.app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(async () => { await new Promise(resolve => server.close(resolve)); fixture.sqlite.close(); });
  const request = async (path, body, method = body ? 'PUT' : 'GET') => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api${path}`, { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, data: await response.json() };
  };
  return { ...fixture, request };
}

const payload = () => classPayload({ name: 'KID 3', teacher: 'GV cũ', ta: 'TG cũ', scheduleRows: [
  { day: 1, time: '15:15-17:15', teacher: 'GV A', ta: 'TG A' },
  { day: 3, time: '15:15-17:15', teacher: 'GV B', ta: 'TG B' },
] });

test('each weekday keeps its own staff after save, reload, edit and clearing a role', async t => {
  const { request } = await setup(t);
  const created = await request('/classes', payload(), 'POST');
  assert.equal(created.status, 200);
  const path = `/classes/${created.data.id}`;
  const saved = (await request(path)).data;
  assert.deepEqual(classSlots(saved).map(s => [s.teacher, s.ta]), [['GV A', 'TG A'], ['GV B', 'TG B']]);
  saved.slot_staff[0].ta = '';
  assert.equal((await request(path, saved)).status, 200);
  const reloaded = (await request('/classes')).data.find(c => c.id === saved.id);
  assert.deepEqual(classSlots(reloaded).map(s => s.ta), ['', 'TG B']);
  const blocks = buildScheduleBlocks([reloaded], name => name || 'Chưa phân công');
  assert.deepEqual(blocks.map(b => [b.dayIndex, b.teacher, b.ta]), [[1, 'GV A', ''], [3, 'GV B', 'TG B']]);
  assert.equal(blocks.filter(b => b.ta === 'TG B').length, 1);
  assert.equal(classStaff(reloaded).some(s => s.ta === 'TG cũ'), false);
});

test('legacy staff is preserved until edited and new slots can stay unassigned', async t => {
  const { request } = await setup(t);
  const legacy = (await request('/classes/1')).data;
  assert.deepEqual(classSlots(legacy).map(s => [s.teacher, s.ta]), [['GV kiểm thử A', 'GV kiểm thử B']]);
  const rows = classSlots(legacy).map(s => ({ day: s.day, time: s.key, teacher: s.teacher, ta: s.ta }));
  rows.push({ day: 6, time: '09:00-11:00', teacher: '', ta: '' });
  assert.equal((await request('/classes/1', classPayload({ ...legacy, scheduleRows: rows }))).status, 200);
  assert.deepEqual(classSlots((await request('/classes/1')).data).map(s => s.ta), ['GV kiểm thử B', '']);
});

test('invalid assignments roll back and removed slots do not resurrect old assignments', async t => {
  const { request, sqlite } = await setup(t);
  await request('/classes/1', payload());
  const original = (await request('/classes/1')).data;
  for (const slot_staff of [null, {}, [original.slot_staff[0], original.slot_staff[0]], [{ ...original.slot_staff[0], slot: 'Thứ 7 (09:00 - 11:00)' }], [{ ...original.slot_staff[0], teacher: {} }]]) {
    assert.equal((await request('/classes/1', { ...original, name: 'Không được lưu', slot_staff })).status, 400);
    assert.equal((await request('/classes/1')).data.name, 'KID 3');
  }
  sqlite.exec("CREATE TRIGGER fail_staff BEFORE INSERT ON class_slot_staff BEGIN SELECT RAISE(FAIL, 'injected failure'); END;");
  assert.equal((await request('/classes/1', { ...original, name: 'Không được lưu' })).status, 500);
  assert.deepEqual((await request('/classes/1')).data, original);
  sqlite.exec('DROP TRIGGER fail_staff');
  assert.equal((await request('/classes/1', { schedule: original.slot_staff[1].slot })).status, 200);
  assert.deepEqual((await request('/classes/1')).data.slot_staff, [original.slot_staff[1]]);
  assert.equal((await request('/classes/1', { schedule: original.schedule })).status, 200);
  assert.equal(classSlots((await request('/classes/1')).data)[0].ta, original.ta);
});

test('multiple teachers and assistants keep their per-slot roles through save, reload and partial edits', async t => {
  const { request } = await setup(t);
  const staff = [{ name: 'GV kiểm thử A', role: 'teacher' }, { name: 'GV kiểm thử B', role: 'teacher' }, { name: 'GV dạy thay C', role: 'ta' }];
  const body = classPayload({ name: 'KID 3', scheduleRows: [
    { day: 1, time: '15:15-17:15', staff },
    { day: 3, time: '15:15-17:15', staff: [{ name: 'GV kiểm thử B', role: 'ta' }] },
  ] });
  assert.equal((await request('/classes/1', body)).status, 200);
  let saved = (await request('/classes/1')).data;
  assert.deepEqual(classSlots(saved)[0].staff, staff);
  assert.equal(classSlots(saved)[0].teacher, 'GV kiểm thử A, GV kiểm thử B');
  assert.equal(classSlots(saved)[1].ta, 'GV kiểm thử B');
  assert.equal(staffSummary(saved, 'teacher'), 'GV kiểm thử A, GV kiểm thử B');
  assert.equal(classStaff(saved).some(s => s.teacher === 'GV kiểm thử B'), true);
  const blocks = buildScheduleBlocks([saved], name => name);
  assert.equal(blocks[0].teacher, 'GV kiểm thử A, GV kiểm thử B');
  assert.equal(blocks.filter(b => b.staff.some(p => p.name === 'GV kiểm thử B')).length, 2);
  assert.equal((await request('/classes/1', { room: '2' })).status, 200);
  saved = (await request('/classes/1')).data;
  assert.deepEqual(classSlots(saved)[0].staff, staff);
  saved.slot_staff[0].staff[1].role = 'ta';
  assert.equal((await request('/classes/1', saved)).status, 200);
  saved = (await request('/classes/1')).data;
  assert.equal(classSlots(saved)[0].teacher, 'GV kiểm thử A');
  assert.equal(classSlots(saved)[0].ta, 'GV kiểm thử B, GV dạy thay C');
  assert.deepEqual(classSlots(saved)[1].staff, [{ name: 'GV kiểm thử B', role: 'ta' }]);
  saved.slot_staff[0].staff = [];
  assert.equal((await request('/classes/1', saved)).status, 200);
  assert.deepEqual(classSlots((await request('/classes/1')).data)[0].staff, []);
});

test('invalid or duplicate per-slot people are rejected before updating the class', async t => {
  const { request } = await setup(t);
  const body = payload();
  const slot = body.slot_staff[0].slot;
  for (const staff of [null, {}, [{ name: '', role: 'teacher' }], [{ name: 'A', role: 'admin' }], [{ name: 'A', role: 'teacher' }, { name: ' A ', role: 'ta' }], Array.from({ length: 21 }, (_, i) => ({ name: `GV ${i}`, role: 'teacher' }))]) {
    assert.equal((await request('/classes/1', { ...body, slot_staff: [{ slot, staff }] })).status, 400);
    assert.equal((await request('/classes/1')).data.name, 'Lớp kiểm thử');
  }
  assert.match(validateScheduleRows([{ day: 1, time: '15:15-17:15', staff: [{ name: 'A', role: 'teacher' }, { name: 'A', role: 'ta' }] }]), /một lần/);
});

test('person write failure rolls back the class, previous slots and assigned roles together', async t => {
  const { request, sqlite } = await setup(t);
  await request('/classes/1', payload());
  const original = (await request('/classes/1')).data;
  sqlite.exec("CREATE TRIGGER fail_people BEFORE INSERT ON class_slot_people BEGIN SELECT RAISE(FAIL, 'injected failure'); END;");
  const body = classPayload({ name: 'Không được lưu', scheduleRows: [{ day: 1, time: '15:15-17:15', staff: [{ name: 'A', role: 'teacher' }, { name: 'B', role: 'teacher' }] }] });
  assert.equal((await request('/classes/1', body)).status, 500);
  assert.deepEqual((await request('/classes/1')).data, original);
});
