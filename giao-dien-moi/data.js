export const teachersSeed = [
  { id: 1, name: 'Phan Đình Phát', role: 'Giáo viên', phone: '', username: 'phandinhphat' },
  { id: 2, name: 'Trần Thị Phương Nhi', role: 'Giáo viên', phone: '', username: 'tranthiphuongnhi' },
  { id: 3, name: 'Đặng Hoàng Nghĩa', role: 'Giáo viên', phone: '', username: 'danghoangnghia' },
  { id: 4, name: 'Nguyễn Đăng Phát', role: 'Giáo viên', phone: '', username: 'nguyendangphat' },
  { id: 5, name: 'Phan Thị Hồng Quỳnh', role: 'Trợ giảng', phone: '', username: 'phanthihongquynh' },
  { id: 6, name: 'Nhữ Thị Khánh Linh', role: 'Trợ giảng', phone: '', username: 'nhuthikhanhlinh' },
  { id: 7, name: 'Châu Nguyên Phúc', role: 'Giáo viên', phone: '', username: 'chaunguyenphuc' },
  { id: 8, name: 'Hoàng Thị Ngọc Ánh', role: 'Trợ giảng', phone: '', username: 'hoangthingocanh' },
];
export const classesSeed = [
  { id: 1, name: 'KID 1', teacher: 2, ta: 6, schedule: 'Thứ 3 (17:15 - 19:15), Thứ 6 (17:15 - 19:15)', room: 'Phòng 1', capacity: 10 },
  { id: 2, name: 'KID 2', teacher: 3, ta: 8, schedule: 'Thứ 4 (07:00 - 09:00), Thứ 7 (07:00 - 09:00)', room: 'Phòng 2', capacity: 10 },
  { id: 3, name: 'KID 3', teacher: 1, ta: 5, schedule: 'Thứ 2 (15:15 - 17:15), Thứ 5 (15:15 - 17:15)', room: 'Phòng 1', capacity: 10 },
  { id: 4, name: 'KID 5', teacher: 4, ta: 5, schedule: 'Thứ 6 (19:15 - 21:15), Thứ 7 (17:15 - 19:15)', room: 'Phòng 1', capacity: 10 },
  { id: 5, name: 'KID 7', teacher: 2, ta: 6, schedule: 'Thứ 4 (09:00 - 11:00), Thứ 7 (09:00 - 11:00)', room: 'Phòng 2', capacity: 10 },
  { id: 6, name: 'KID 1 dự phòng', teacher: 3, ta: 8, schedule: 'Thứ 7 (09:00 - 11:00)', room: 'Phòng 3', capacity: 10 },
];
export const studentsSeed = ['Nguyễn Ngọc Bảo Trân', 'Bảo Châu', 'Trần Thị Thanh Thảo', 'Nguyễn Hữu Minh Thiện', 'Nguyễn Ngọc Khánh Đan', 'Nguyễn Huỳnh Bảo Nhi', 'Nguyễn Thiên Ân', 'Nguyễn Ngọc Thùy Trang', 'Gia Hân', 'Nhật Minh', 'Võ Ngọc Minh Hằng', 'Huỳnh Minh Quân', 'Hồ Nguyễn Minh Thư', 'Đặng Hoàng Vũ Minh', 'Đặng Hoàng Tuyết Mẫn', 'Nguyễn Thành Gia Hưng', 'Đăng Khôi', 'Thiện Nhân'].map((name, index) => ({ id: index + 1, name, classId: index < 10 ? 4 : index < 14 ? 1 : 5, parent: '', phone: '' }));
export const workSeed = [
  { id: 1, teacherId: 4, classId: 4, date: '2026-10-10', lesson: 'Làm quen với biến', role: 'Dạy chính', status: 'completed', start: '17:15', end: '19:15', notes: '' },
  { id: 2, teacherId: 5, classId: 4, date: '2026-10-10', lesson: 'Làm quen với biến', role: 'Trợ giảng', status: 'completed', start: '17:15', end: '19:15', notes: '' },
  { id: 3, teacherId: 2, classId: 1, date: '2026-10-13', lesson: 'Câu lệnh điều kiện', role: 'Dạy chính', status: 'completed', start: '17:15', end: '19:15', notes: '' },
  { id: 4, teacherId: 4, classId: 4, date: '2026-10-16', lesson: 'Vẽ hình bằng vòng lặp', role: 'Dạy chính', status: 'completed', start: '19:15', end: '21:15', notes: '' },
  { id: 5, teacherId: 3, classId: 2, date: '2026-10-17', lesson: 'Robot dò đường', role: 'Dạy chính', status: 'draft', start: '07:00', end: '09:00', notes: '' },
];
export const invoicesSeed = [
  { id: 1, studentId: 1, amount: 1200000, status: 'paid', date: '2026-10-02' },
  { id: 2, studentId: 2, amount: 1200000, status: 'pending', date: '2026-10-04' },
  { id: 3, studentId: 11, amount: 1500000, status: 'overdue', date: '2026-10-01' },
  { id: 4, studentId: 12, amount: 1500000, status: 'paid', date: '2026-10-06' },
];
export const TODAY = '2026-10-17';
export const weekdays = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
export const shortDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
export const money = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
export const dateLabel = date => new Date(`${date}T12:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
export const weekday = date => new Date(`${date}T12:00:00`).getDay();
export const addDays = (date, days) => { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); };
export const initials = name => name.trim().split(/\s+/).slice(-2).map(n => n[0]).join('');
