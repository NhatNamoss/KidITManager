import { scheduleSlots, WEEKDAYS } from '../../shared/class-schedule.js';

export const SCHEDULE_DAYS = [1, 2, 3, 4, 5, 6, 0];
export const TIME_SLOTS = ['07:00-09:00', '09:00-11:00', '15:15-17:15', '17:15-19:15', '19:15-21:15'];

export function classSlots(cls, date) {
  return scheduleSlots(cls?.schedule || '', date).map(slot => ({
    ...(cls?.slot_staff?.find(row => row.slot === slot.label) || { teacher: cls?.teacher || '', ta: cls?.ta || '' }),
    day: WEEKDAYS.findIndex(day => slot.label.startsWith(`${day} (`)),
    start: slot.start_time, end: slot.end_time,
    key: `${slot.start_time}-${slot.end_time}`, label: slot.label,
  }));
}

export function scheduleText(rows) {
  return rows.map(row => `${WEEKDAYS[Number(row.day)]} (${row.time.replace('-', ' - ')})`).join(', ');
}

export function classStaff(cls) {
  const slots = classSlots(cls);
  return slots.length ? slots : [{ teacher: cls.teacher || '', ta: cls.ta || '' }];
}

export function staffSummary(cls, role) {
  return [...new Set(classStaff(cls).map(s => s[role]).filter(Boolean))].join(', ');
}

export function validateScheduleRows(rows, { allowEmpty = false } = {}) {
  if (Array.isArray(rows) && !rows.length && allowEmpty) return '';
  if (!Array.isArray(rows) || !rows.length) return 'Hãy chọn ít nhất một suất học.';
  const used = [];
  for (const row of rows) {
    if (!SCHEDULE_DAYS.includes(Number(row.day)) || !/^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/.test(row.time)) return 'Thứ hoặc suất học không hợp lệ.';
    const [start, end] = row.time.split('-');
    if (end <= start) return 'Giờ kết thúc phải sau giờ bắt đầu.';
    if (used.some(s => s.day === Number(row.day) && start < s.end && end > s.start)) return 'Lớp có suất học trùng giờ trong cùng ngày.';
    used.push({ day: Number(row.day), start, end });
  }
  return '';
}

export function classPayload(values) {
  return { name: values.name.trim(), teacher: values.teacher || '', ta: values.ta || '', schedule: scheduleText(values.scheduleRows), slot_staff: values.scheduleRows.map(row => ({ slot: scheduleText([row]), teacher: row.teacher ?? values.teacher ?? '', ta: row.ta ?? values.ta ?? '' })), room: values.room || '', capacity: values.capacity == null || values.capacity === '' ? null : Number(values.capacity) };
}

export function buildScheduleBlocks(classes, person) {
  return classes.flatMap(cls => classSlots(cls).map(slot => ({
    id: `${cls.id}-${slot.day}-${slot.key}`, classId: cls.id, className: cls.name,
    teacher: person(slot.teacher), ta: slot.ta ? person(slot.ta) : '', room: cls.room,
    day: WEEKDAYS[slot.day], dayIndex: slot.day, timeKey: slot.key,
  })));
}
