import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classesSeed } from './data.js';
import { classSlots, scheduleText, validateScheduleRows, buildScheduleBlocks, TIME_SLOTS } from './schedule.js';
import { attendanceDatesInMonth } from '../shared/class-schedule.js';

test('class names contain no invented curriculum field', () => {
  assert.ok(classesSeed.every(c => !('course' in c) && c.name.startsWith('KID ')));
});
test('legacy schedule keeps distinct hours for Friday and Saturday', () => {
  const cls = classesSeed.find(c => c.id === 4);
  assert.equal(classSlots(cls, '2026-10-16')[0].key, '19:15-21:15');
  assert.equal(classSlots(cls, '2026-10-17')[0].key, '17:15-19:15');
  assert.deepEqual(classSlots(cls, '2026-10-18'), []);
});
test('existing attendance rules only offer scheduled dates from October 2026', () => {
  const cls = classesSeed.find(c => c.id === 4);
  assert.deepEqual(attendanceDatesInMonth(cls.schedule, '2026-10'), ['2026-10-02','2026-10-03','2026-10-09','2026-10-10','2026-10-16','2026-10-17','2026-10-23','2026-10-24','2026-10-30','2026-10-31']);
  assert.deepEqual(attendanceDatesInMonth(cls.schedule, '2026-09'), []);
});
test('multiple preset shifts serialize in the original schedule format and reject overlaps', () => {
  assert.equal(TIME_SLOTS.length, 5);
  const rows = [{ day: 5, time: '19:15-21:15' }, { day: 6, time: '17:15-19:15' }, { day: 6, time: '19:15-21:15' }];
  assert.equal(validateScheduleRows(rows), '');
  const cls = { schedule: scheduleText(rows) };
  assert.equal(cls.schedule, 'Thứ 6 (19:15 - 21:15), Thứ 7 (17:15 - 19:15), Thứ 7 (19:15 - 21:15)');
  assert.equal(classSlots(cls, '2026-10-17').length, 2);
  assert.match(validateScheduleRows([...rows, rows[0]]), /trùng giờ/);
});
test('both original image templates receive all classes and staff assignment', () => {
  const blocks = buildScheduleBlocks(classesSeed, id => `Nhân sự ${id}`);
  assert.equal(blocks.length, 11);
  const friday = blocks.find(b => b.classId === 4 && b.day === 'Thứ 6');
  assert.equal(friday.timeKey, '19:15-21:15');
  assert.equal(friday.className, 'KID 5');
  assert.equal(friday.teacher, 'Nhân sự 4');
  assert.equal(friday.ta, 'Nhân sự 5');
  assert.ok(blocks.every(b => !('course' in b)));
});
