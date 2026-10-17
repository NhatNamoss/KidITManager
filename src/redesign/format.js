export const weekdays = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
export const money = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value) || 0);
export const dateLabel = value => {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00+07:00` : value);
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
};
export const weekday = date => new Date(`${date}T12:00:00+07:00`).getUTCDay();
export const initials = name => (name || '?').trim().split(/\s+/).slice(-2).map(part => part[0]).join('');
export const workStatus = { completed: ['Đã xác nhận', 'good'], draft: ['Chưa xác nhận', 'wait'], cancelled: ['Đã hủy', 'neutral'] };
export const invoiceStatus = { paid: ['Đã thu', 'good'], pending: ['Chờ thu', 'wait'], overdue: ['Quá hạn', 'danger'] };

export function normalizePayroll(data) {
  const personal = (data.entries || []).map(row => ({
    ...row, id: `personal-${row.id}`, entryId: row.id, source: 'personal',
    teacherId: row.teacher_id, teacherName: row.teacher_name, classId: row.class_id,
    start: row.start_time, end: row.end_time, rawRole: row.role,
    role: row.role === 'ta' ? 'Trợ giảng' : 'Dạy chính',
  }));
  const historic = data.rows.filter(row => !String(row.session_id).startsWith('personal-')).map(row => ({
    ...row, id: `historic-${row.session_id}-${row.teacher_id}`, source: 'historic',
    teacherId: row.teacher_id, teacherName: row.teacher_name, classId: row.class_id,
    start: row.start_time, end: row.end_time, rawRole: row.role,
    role: row.role === 'ta' ? 'Trợ giảng' : 'Dạy chính', status: 'completed',
    lesson: row.lesson || 'Buổi dạy đã xác nhận trước khi dùng tài khoản cá nhân',
  }));
  return [...personal, ...historic].sort((a, b) => b.date.localeCompare(a.date) || a.start.localeCompare(b.start));
}

export function studentClasses(studentId, enrollments, classes) {
  const ids = new Set(enrollments.filter(row => row.student_id === studentId).map(row => row.class_id));
  return classes.filter(cls => ids.has(cls.id));
}
