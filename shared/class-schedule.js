export const ATTENDANCE_START_DATE = '2026-10-01';
export const WEEKDAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export function isCalendarDate(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
}

export function scheduledWeekdays(schedule) {
  const days = new Set();
  for (const match of (schedule || '').normalize('NFC').matchAll(/(Thứ [2-7]|Chủ nhật)\s*\(\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})\s*\)/gu)) {
    if (/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(match[2]) && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(match[3]) && match[2] < match[3]) days.add(WEEKDAYS.indexOf(match[1]));
  }
  return days;
}

export function isScheduledAttendanceDate(schedule, date) {
  return isCalendarDate(date) && date >= ATTENDANCE_START_DATE && scheduledWeekdays(schedule).has(new Date(`${date}T00:00:00Z`).getUTCDay());
}

export function attendanceDatesInMonth(schedule, month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month < ATTENDANCE_START_DATE.slice(0, 7)) return [];
  const days = scheduledWeekdays(schedule);
  if (!days.size) return [];
  const [year, m] = month.split('-').map(Number);
  const count = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const dates = [];
  for (let day = 1; day <= count; day++) {
    const date = `${month}-${String(day).padStart(2, '0')}`;
    if (date >= ATTENDANCE_START_DATE && days.has(new Date(`${date}T00:00:00Z`).getUTCDay())) dates.push(date);
  }
  return dates;
}

export function preferredAttendanceDate(dates, reference) {
  return dates.filter(date => date <= reference).at(-1) || dates[0] || '';
}

export function weekdayLabel(date) {
  return isCalendarDate(date) ? WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()] : '';
}
