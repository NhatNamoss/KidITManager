export class InputError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function validateSession(body) {
  const { date, start_time, end_time, status, staff, notes = '', version = 0 } = body ?? {};
  if (!validDate(date)) throw new InputError('Ngày dạy không hợp lệ.');
  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timePattern.test(start_time) || !timePattern.test(end_time) || end_time <= start_time)
    throw new InputError('Giờ kết thúc phải sau giờ bắt đầu trong cùng ngày.');
  const now = new Date();
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(now);
  const currentTime = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
  if (!['draft', 'completed', 'cancelled'].includes(status)) throw new InputError('Trạng thái buổi dạy không hợp lệ.');
  if (status === 'completed' && (date > today || (date === today && end_time > currentTime))) throw new InputError('Chỉ xác nhận công sau khi buổi dạy kết thúc (giờ Việt Nam).');
  if (typeof notes !== 'string' || notes.length > 2000) throw new InputError('Ghi chú tối đa 2.000 ký tự.');
  if (!Number.isInteger(version) || version < 0) throw new InputError('Phiên bản không hợp lệ.');
  if (!Array.isArray(staff) || staff.length > 20 || (status === 'completed' && !staff.length))
    throw new InputError('Buổi đã dạy cần ít nhất một người thực tế đứng lớp.');
  const ids = new Set();
  for (const row of staff) {
    if (!Number.isSafeInteger(row.teacher_id) || row.teacher_id < 1 || ids.has(row.teacher_id))
      throw new InputError('Mỗi nhân sự chỉ được ghi một lần trong một buổi.');
    ids.add(row.teacher_id);
    if (!['teacher', 'ta'].includes(row.role)) throw new InputError('Vai trò trong buổi dạy không hợp lệ.');
  }
  return { date, start_time, end_time, status, staff: staff.map(({ teacher_id, role }) => ({ teacher_id, role })), notes, version };
}

export function monthRange(month) {
  if (typeof month !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new InputError('Tháng không hợp lệ.');
  const [year, m] = month.split('-').map(Number);
  return [`${month}-01`, `${m === 12 ? year + 1 : year}-${String(m === 12 ? 1 : m + 1).padStart(2, '0')}-01`];
}
