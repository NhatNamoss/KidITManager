import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { LayoutDashboard, CalendarDays, BookOpen, Users, UserRound, ClipboardCheck, Wallet, Wrench, Settings2, Search, Plus, ArrowUpRight, ChevronRight, X, Menu, Sun, Moon, Check, Download, LogOut, ArrowLeft, SlidersHorizontal, CheckCheck, CircleAlert, RotateCcw, Play, Pause, Dices, Timer, Trophy, UserRoundPlus, DoorOpen } from 'lucide-react';
import { teachersSeed, classesSeed, studentsSeed, workSeed, invoicesSeed, TODAY, weekdays, money, dateLabel, weekday, initials } from './data';
import { WEEKDAYS, isScheduledAttendanceDate } from '../shared/class-schedule';
import { ScheduleExportTemplate } from '../src/pages/ScheduleExportTemplate';
import AttendancePicker from './AttendancePicker';
import { classSlots, SCHEDULE_DAYS, TIME_SLOTS, scheduleText, validateScheduleRows, buildScheduleBlocks } from './schedule';
import './style.css';

const Demo = createContext(null);
const useDemo = () => useContext(Demo);
const nav = [
  ['overview', 'Tổng quan', LayoutDashboard, ''], ['schedule', 'Lịch dạy', CalendarDays, 'Giảng dạy'], ['classes', 'Lớp học', BookOpen, ''], ['students', 'Học sinh', Users, ''], ['payroll', 'Chấm công', ClipboardCheck, ''], ['teachers', 'Giáo viên', UserRound, 'Trung tâm'], ['finance', 'Học phí', Wallet, ''], ['tools', 'Công cụ trên lớp', Wrench, ''], ['accounts', 'Tài khoản', Settings2, ''],
];
const workStatus = { completed: ['Đã xác nhận', 'good'], draft: ['Chưa xác nhận', 'wait'], cancelled: ['Đã hủy', 'neutral'] };
const invoiceStatus = { paid: ['Đã thu', 'good'], pending: ['Chờ thu', 'wait'], overdue: ['Quá hạn', 'danger'] };
function Icon({ icon: Component, ...props }) { return <Component size={19} strokeWidth={1.8} aria-hidden="true" {...props} />; }
function Button({ children, variant = '', icon, className = '', ...props }) { return <button className={`button ${variant} ${className}`} {...props}>{icon && <Icon icon={icon} />}{children}</button>; }
function Badge({ value, type = 'work' }) { const [label, tone] = (type === 'work' ? workStatus : invoiceStatus)[value] || ['Chưa cập nhật', 'neutral']; return <span className={`badge ${tone}`}>{tone === 'good' && <Icon icon={Check} size={13} />}{label}</span>; }
function Avatar({ name, large = false }) { return <span className={`avatar ${large ? 'large' : ''}`} aria-hidden="true">{initials(name)}</span>; }
function Empty({ title = 'Chưa có dữ liệu', text = 'Thử đổi bộ lọc hoặc thêm bản ghi đầu tiên.', action }) { return <div className="empty"><Icon icon={BookOpen} size={30} /><h3>{title}</h3><p>{text}</p>{action}</div>; }
function PageHead({ title, description, children, eyebrow }) { return <header className="page-head"><div>{eyebrow && <p className="breadcrumb">{eyebrow}</p>}<h1>{title}</h1><p>{description}</p></div>{children && <div className="head-actions">{children}</div>}</header>; }
function PanelHead({ title, caption, children }) { return <div className="panel-head"><div><h2>{title}</h2>{caption && <p>{caption}</p>}</div>{children}</div>; }
function Find({ value, onChange, placeholder = 'Tìm theo tên...' }) { return <label className="find"><Icon icon={Search} /><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />{value && <button aria-label="Xóa tìm kiếm" onClick={() => onChange('')}><Icon icon={X} size={16} /></button>}</label>; }
function Select({ label, children, ...props }) { return <label className="filter-select"><span>{label}</span><select aria-label={label} {...props}>{children}</select></label>; }
function csv(name, rows) {
  const text = rows.map(r => r.map(v => `"${String(v ?? '').replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function EditDialog({ model, close }) {
  const ref = useRef(null);
  const [values, setValues] = useState(model.initial || {});
  const [error, setError] = useState('');
  useEffect(() => {
    const previous = document.activeElement; const dialog = ref.current;
    dialog.showModal();
    return () => { dialog.close(); previous?.focus(); };
  }, []);
  const fields = typeof model.fields === 'function' ? model.fields(values) : model.fields;
  const setField = (field, value) => {
    setValues(v => ({ ...v, [field.key]: value, ...(field.resetSlot && v[field.key] !== value ? { slot: '' } : {}) }));
    setError('');
  };
  return <dialog ref={ref} className={`dialog ${model.wide ? 'wide' : ''}`} aria-labelledby="dialog-title" onCancel={e => { e.preventDefault(); close(); }} onClick={e => { if (e.target === ref.current) close(); }}>
    <div className="dialog-head"><div><p className="muted">{model.caption || 'Dữ liệu minh họa · Không lưu lên web'}</p><h2 id="dialog-title">{model.title}</h2></div><button className="icon-button" aria-label="Đóng hộp thoại" onClick={close}><Icon icon={X} /></button></div>
    <form onSubmit={e => {
      e.preventDefault();
      if (fields?.some(f => f.required && typeof values[f.key] === 'string' && !values[f.key].trim())) { setError('Hãy nhập đủ các trường bắt buộc.'); return; }
      const message = model.validate?.(values); if (message) { setError(message); return; }
      model.save?.(values); close();
    }}>
      {model.content && <div className="dialog-content">{model.content}</div>}
      {fields && <div className="form-grid">{fields.map(f => f.type === 'scheduled-date' ? <div className="full" key={f.key}><AttendancePicker label={f.label} schedule={f.schedule} disabled={!f.schedule} value={values[f.key] || ''} onChange={value => setField(f, value)} />{!f.schedule && <p className="picker-help">Chọn lớp để hiện các buổi học có sẵn.</p>}</div> : <label key={f.key} className={f.full ? 'full' : ''}>{f.label}{f.required && <span className="required"> *</span>}
        {f.type === 'select' ? <select aria-label={f.label} required={f.required} value={values[f.key] ?? ''} onChange={e => setField(f, e.target.value)}>{f.options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}</select> : f.type === 'textarea' ? <textarea aria-label={f.label} rows={3} maxLength={2000} value={values[f.key] || ''} onChange={e => setField(f, e.target.value)} /> : <input aria-label={f.label} required={f.required} readOnly={f.readOnly} min={f.min} max={f.max} maxLength={f.maxLength || 255} type={f.type || 'text'} autoComplete={f.type === 'password' ? 'new-password' : 'off'} value={values[f.key] ?? ''} placeholder={f.placeholder} onChange={e => setField(f, e.target.value)} />}
        {f.help && <small>{f.help}</small>}</label>)}</div>}
      {model.scheduleEditor && <fieldset className="class-schedule-editor"><legend>Lịch học theo tuần</legend><p className="muted">Chọn thứ và suất có sẵn như web hiện tại. Có thể thêm nhiều suất, giờ từng ngày có thể khác nhau.</p>
        {values.scheduleRows.map((row, index) => <div className="schedule-editor-row" key={index}>
          <label>Thứ<select aria-label={`Thứ của suất ${index + 1}`} value={row.day} onChange={e => setField({ key: 'scheduleRows' }, values.scheduleRows.map((s, i) => i === index ? { ...s, day: Number(e.target.value) } : s))}>{SCHEDULE_DAYS.map(day => <option key={day} value={day}>{WEEKDAYS[day]}</option>)}</select></label>
          <label>Suất học<select aria-label={`Giờ của suất ${index + 1}`} value={row.time} onChange={e => setField({ key: 'scheduleRows' }, values.scheduleRows.map((s, i) => i === index ? { ...s, time: e.target.value } : s))}>{[...new Set([...TIME_SLOTS, row.time])].sort().map(time => <option key={time} value={time}>{time.replace('-', ' - ')}</option>)}</select></label>
          <Button type="button" variant="ghost" disabled={values.scheduleRows.length === 1} onClick={() => setField({ key: 'scheduleRows' }, values.scheduleRows.filter((_, i) => i !== index))}>Bỏ suất {index + 1}</Button>
        </div>)}<Button type="button" variant="secondary" icon={Plus} onClick={() => setField({ key: 'scheduleRows' }, [...values.scheduleRows, { day: 1, time: '15:15-17:15' }])}>Thêm suất học</Button>
      </fieldset>}
      {error && <div className="error-note" role="alert"><Icon icon={CircleAlert} />{error}</div>}
      <div className="dialog-footer"><span>{model.footer || 'Thay đổi chỉ có trong lần xem này.'}</span><Button variant="secondary" type="button" onClick={close}>{model.save ? 'Hủy' : 'Đóng'}</Button>{model.save && <Button type="submit" icon={Check}>{model.submit || 'Lưu minh họa'}</Button>}</div>
    </form>
  </dialog>;
}

export default function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || 'overview');
  const [theme, setTheme] = useState('light');
  const [role, setRole] = useState('teacher');
  const [menu, setMenu] = useState(false);
  const [state, setState] = useState('normal');
  const [model, setModel] = useState(null);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [classes, setClasses] = useState(classesSeed);
  const [teachers, setTeachers] = useState(teachersSeed);
  const [students, setStudents] = useState(studentsSeed);
  const [work, setWork] = useState(workSeed);
  const [invoices, setInvoices] = useState(invoicesSeed);
  const [attendance, setAttendance] = useState({});
  const mainRef = useRef(null);
  useEffect(() => {
    const hash = () => { setRoute(location.hash.slice(1) || 'overview'); setMenu(false); setQuery(''); setState('normal'); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', hash); return () => window.removeEventListener('hashchange', hash);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(''), 5000); return () => clearTimeout(t); }, [notice]);
  const go = page => { location.hash = page; };
  const user = role === 'admin' ? { name: 'Quản trị viên', username: 'admin', id: null } : { name: teachers.find(t => t.id === 4)?.name || 'Nguyễn Đăng Phát', username: teachers.find(t => t.id === 4)?.username || 'nguyendangphat', id: 4 };
  const person = id => teachers.find(t => t.id === Number(id))?.name || 'Chưa phân công';
  const cls = id => classes.find(c => c.id === Number(id));
  const notify = text => setNotice(text);
  const open = value => setModel(value);
  const addWork = (classId = '', selectedDate = TODAY, record) => {
    if (role === 'admin') { notify('Admin xem tổng công. Chọn vai trò Giáo viên ở thanh bản duyệt để thử tự chấm công.'); go('payroll'); return; }
    const initial = record ? { ...record } : { teacher: user.name, classId, date: selectedDate, role: 'Dạy chính', status: 'completed', lesson: '', notes: '' };
    open({ title: record ? 'Sửa công của tôi' : 'Chấm công của tôi', initial, wide: true, submit: record ? 'Lưu thay đổi' : 'Xác nhận công',
      fields: v => {
        const selected = cls(v.classId); const available = v.date ? classSlots(selected, v.date) : [];
        return [
          { key: 'teacher', label: 'Người chấm công', readOnly: true, full: true, help: 'Lấy từ tài khoản cá nhân. Mỗi người tự chấm công của mình.' },
          { key: 'classId', label: 'Lớp học', type: 'select', required: true, resetSlot: true, full: true, options: [{ value: '', label: 'Chọn lớp' }, ...classes.map(c => ({ value: c.id, label: c.name }))] },
          { key: 'date', label: 'Ngày dạy theo lịch lớp', type: 'scheduled-date', schedule: selected?.schedule || '', required: true, resetSlot: true },
          { key: 'slot', label: 'Suất theo lịch lớp', type: 'select', required: true, options: [{ value: '', label: available.length ? 'Chọn suất' : 'Ngày này chưa có lịch lớp' }, ...available.map(s => ({ value: s.key, label: `${WEEKDAYS[s.day]} · ${s.start} - ${s.end}` }))] },
          { key: 'role', label: 'Vai trò trong buổi', type: 'select', options: ['Dạy chính', 'Trợ giảng'] },
          { key: 'lesson', label: 'Tên bài học', required: true, full: true, placeholder: 'Nhập bài đã dạy trong suất này' },
          { key: 'status', label: 'Trạng thái', type: 'select', full: true, options: [{ value: 'completed', label: 'Đã dạy, tính công' }, { value: 'draft', label: 'Chưa xác nhận' }, { value: 'cancelled', label: 'Đã hủy, không tính công' }] },
          { key: 'notes', label: 'Ghi chú (không bắt buộc)', type: 'textarea', full: true },
        ];
      },
      validate: v => {
        const c = cls(v.classId);
        const slot = classSlots(c, v.date).find(s => s.key === v.slot);
        if (!c || !isScheduledAttendanceDate(c.schedule, v.date) || !slot) return 'Ngày và suất cần đúng lịch của lớp đã chọn.';
        if (v.status === 'completed' && v.date > TODAY) return 'Chỉ xác nhận sau khi buổi dạy kết thúc. Ngày tham chiếu của bản mẫu là 17/10/2026.';
        if (work.some(w => w.id !== record?.id && w.teacherId === 4 && w.date === v.date && w.start < slot.end && w.end > slot.start && w.status !== 'cancelled') && v.status !== 'cancelled') return 'Bạn đã có bản ghi công trùng giờ. Hãy sửa bản ghi hiện có.';
        if (!v.lesson?.trim()) return 'Hãy nhập tên bài học.';
      },
      save: v => { const slot = classSlots(cls(v.classId), v.date).find(s => s.key === v.slot); const row = { ...v, teacherId: 4, classId: Number(v.classId), start: slot.start, end: slot.end, id: record?.id || Date.now() }; setWork(rows => record ? rows.map(w => w.id === record.id ? row : w) : [...rows, row]); notify('Đã lưu công minh họa của bạn. Công của người cùng ca được ghi riêng.'); },
    });
  };
  const teacherEditor = record => open({ title: record ? 'Sửa hồ sơ giáo viên' : 'Thêm giáo viên', initial: record || { name: '', role: 'Giáo viên', phone: '' }, fields: [
    { key: 'name', label: 'Họ và tên', required: true, full: true }, { key: 'role', label: 'Vai trò', type: 'select', options: ['Giáo viên', 'Trợ giảng'] }, { key: 'phone', label: 'Số điện thoại', type: 'tel' },
  ], footer: record ? 'Tên đăng nhập được quản lý riêng ở mục Tài khoản.' : 'Tự tạo tài khoản theo họ tên, mật khẩu ban đầu kidit.', save: v => {
    const base = v.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]/g, '') || 'giaovien';
    let username = base; let i = 2; while (teachers.some(t => t.username === username)) username = `${base}${i++}`;
    setTeachers(rows => record ? rows.map(t => t.id === record.id ? { ...t, ...v } : t) : [...rows, { ...v, id: Date.now(), username }]); notify(record ? 'Đã sửa hồ sơ minh họa.' : `Đã thêm giáo viên minh họa. Tài khoản: ${username} / kidit`);
  } });
  const studentEditor = record => open({ title: record ? 'Sửa thông tin học sinh' : 'Thêm học sinh', initial: record || { name: '', parent: '', phone: '', classId: '' }, fields: [
    { key: 'name', label: 'Họ tên học sinh', required: true, full: true }, { key: 'parent', label: 'Tên phụ huynh' }, { key: 'phone', label: 'Điện thoại phụ huynh', type: 'tel' },
    { key: 'classId', label: 'Lớp học', type: 'select', full: true, options: [{ value: '', label: 'Chưa xếp lớp' }, ...classes.map(c => ({ value: c.id, label: c.name }))] },
  ], validate: v => v.classId && students.filter(s => s.classId === Number(v.classId) && s.id !== record?.id).length >= cls(v.classId)?.capacity ? 'Lớp đã đủ chỗ. Hãy chọn lớp khác hoặc để Chưa xếp lớp.' : '',
  save: v => { setStudents(rows => record ? rows.map(s => s.id === record.id ? { ...s, ...v, classId: Number(v.classId) } : s) : [...rows, { ...v, id: Date.now(), classId: Number(v.classId) }]); notify('Đã lưu học sinh minh họa.'); } });
  const classEditor = record => open({ title: record ? 'Sửa thông tin lớp' : 'Tạo lớp học', initial: { ...(record || { name: '', teacher: '', ta: '', capacity: 10, room: 'Phòng 1' }), scheduleRows: record ? classSlots(record).map(s => ({ day: s.day, time: s.key })) : [{ day: 1, time: '15:15-17:15' }] }, wide: true, scheduleEditor: true,
    fields: [
      { key: 'name', label: 'Tên lớp', required: true, full: true, placeholder: 'Ví dụ: KID 1' },
      { key: 'teacher', label: 'Giáo viên phụ trách', type: 'select', required: true, options: [{ value: '', label: 'Chọn giáo viên' }, ...teachers.map(t => ({ value: t.id, label: t.name }))] },
      { key: 'ta', label: 'Trợ giảng', type: 'select', options: [{ value: '', label: 'Chưa phân công' }, ...teachers.map(t => ({ value: t.id, label: t.name }))] },
      { key: 'room', label: 'Phòng học', required: true }, { key: 'capacity', label: 'Sĩ số tối đa', type: 'number', min: 1, max: 100, required: true },
    ], validate: v => validateScheduleRows(v.scheduleRows) || (v.teacher === v.ta && v.ta ? 'Giáo viên và trợ giảng cần là hai người khác nhau.' : ''),
    save: v => { const { scheduleRows, ...details } = v; const row = { ...details, id: record?.id || Date.now(), teacher: Number(v.teacher), ta: Number(v.ta), capacity: Number(v.capacity), schedule: scheduleText(scheduleRows) }; setClasses(rows => record ? rows.map(c => c.id === record.id ? row : c) : [...rows, row]); notify('Đã lưu lớp học minh họa.'); },
  });
  const ctx = { role, user, go, notify, open, classes, teachers, students, work, invoices, attendance, setAttendance, setClasses, setTeachers, setStudents, setWork, setInvoices, person, cls, addWork, teacherEditor, studentEditor, classEditor, query, setQuery };
  const current = nav.find(n => n[0] === route.split('/')[0]) || nav[2];
  const sidebar = <><a className="brand" href="#overview"><span className="brand-mark">KI</span><span><strong>KidIT</strong><small>Sổ điều phối trung tâm</small></span></a><div className="center-label"><span>Cơ sở KidIT</span><small>Không gian quản lý</small></div><nav aria-label="Điều hướng chính">{nav.filter(n => n[0] !== 'accounts' || role === 'admin').map(([path, title, icon, group]) => <React.Fragment key={path}>{group && <p className="nav-group">{group}</p>}<a href={`#${path}`} className={route === path || (path === 'classes' && route.startsWith('class/')) ? 'nav-link active' : 'nav-link'} aria-current={route === path ? 'page' : undefined}><Icon icon={icon} /><span>{title}</span>{path === 'classes' && <small>{classes.length}</small>}</a></React.Fragment>)}</nav><div className="sidebar-bottom"><p>Cùng giữ lớp học gọn gàng.</p><small>KidIT Manager · Bản đề xuất 01</small></div></>;
  const view = route === 'overview' ? <Overview /> : route === 'schedule' ? <Schedule /> : route === 'classes' ? <Classes /> : route.startsWith('class/') ? <ClassDetail id={Number(route.split('/')[1])} /> : route === 'students' ? <Students /> : route === 'teachers' ? <Teachers /> : route === 'payroll' ? <Payroll /> : route === 'finance' ? <Finance /> : route === 'tools' ? <Tools /> : route === 'accounts' ? <Accounts /> : <Empty title="Không tìm thấy trang" action={<Button onClick={() => go('overview')}>Về tổng quan</Button>} />;
  if (route === 'login') return <Demo.Provider value={ctx}><div className="login-shell"><div className="login-story"><a className="brand" href="#overview"><span className="brand-mark">KI</span><strong>KidIT</strong></a><p className="login-statement">Một nơi cho<br />mỗi ngày đứng lớp.</p><p>Lịch học, học sinh và công giảng dạy.<br />Gọn gàng từ buổi đầu đến buổi cuối.</p><div className="login-foot">Bản duyệt giao diện · Dữ liệu minh họa</div></div><div className="login-side"><form className="login-form" onSubmit={e => { e.preventDefault(); setRole('teacher'); go('overview'); notify('Đã vào chế độ xem giáo viên minh họa.'); }}><p className="breadcrumb">KidIT Manager</p><h1>Chào bạn trở lại.</h1><p>Đăng nhập để bắt đầu một ngày giảng dạy.</p><label>Tên tài khoản<input required autoComplete="off" placeholder="Tên đăng nhập của bạn" /></label><label>Mật khẩu<input required type="password" autoComplete="off" placeholder="Nhập mật khẩu" /></label><Button type="submit">Xem giao diện giáo viên</Button><p className="login-demo-note">Đây là bản mẫu giao diện. Không xác thực tài khoản thật. Bạn có thể nhập giá trị bất kỳ để thử bố cục.</p><a className="text-link" href="#overview">Trở lại bản duyệt</a></form></div></div></Demo.Provider>;
  return <Demo.Provider value={ctx}>
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); mainRef.current?.focus(); }}>Đến nội dung chính</a>
    <div className="preview-bar"><span><strong>Bản duyệt 01</strong><span className="preview-description">Dữ liệu minh họa · Tách biệt với web hiện tại</span></span><div><label><span className="sr-only">Vai trò để duyệt</span><select aria-label="Vai trò để duyệt" value={role} onChange={e => { setRole(e.target.value); if (route === 'accounts') go('overview'); }}><option value="teacher">Xem như Giáo viên</option><option value="admin">Xem như Admin</option></select></label><select aria-label="Trạng thái dữ liệu để duyệt" value={state} onChange={e => setState(e.target.value)}><option value="normal">Dữ liệu mẫu</option><option value="loading">Thử trạng thái tải</option><option value="empty">Thử trạng thái trống</option><option value="error">Thử trạng thái lỗi</option></select></div></div>
    <div className="app-shell"><aside className="sidebar">{sidebar}</aside><div className="workspace">
      <header className="topbar"><div className="topbar-left"><Button variant="ghost mobile-menu" icon={Menu} onClick={() => setMenu(true)}>Menu</Button><span className="location-label">Không gian làm việc <span>/</span> <strong>{route.startsWith('class/') ? 'Chi tiết lớp' : current[1]}</strong></span></div><div className="topbar-right"><button className="icon-button theme-button" aria-label={theme === 'light' ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng'} onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}><Icon icon={theme === 'light' ? Moon : Sun} /></button><div className="user-identity"><Avatar name={user.name} /><div><strong>{user.name}</strong><small>{role === 'admin' ? 'Quản trị viên' : 'Giáo viên'}</small></div></div><a className="icon-button signout" href="#login" aria-label="Xem màn hình đăng nhập"><Icon icon={LogOut} /></a></div></header>
      <main id="main-content" ref={mainRef} tabIndex={-1}>
        {state === 'loading' ? <div className="state-panel" role="status"><span className="loading-mark" /><h1>Đang tải thông tin lớp học...</h1><p>Nội dung sẽ xuất hiện tại đây sau khi tải xong.</p><Button variant="secondary" onClick={() => setState('normal')}>Kết thúc mô phỏng</Button></div> : state === 'error' ? <div className="state-panel" role="alert"><Icon icon={CircleAlert} size={34} /><h1>Chưa tải được dữ liệu</h1><p>Kiểm tra kết nối rồi thử lại. Nội dung bạn đang nhập sẽ được giữ lại.</p><Button icon={RotateCcw} onClick={() => setState('normal')}>Thử lại</Button></div> : state === 'empty' ? <div className="state-panel"><Empty title="Mọi thứ đã sẵn sàng cho lớp đầu tiên" text="Khi có lớp và học sinh, lịch dạy và danh sách sẽ xuất hiện ở đây." action={<Button icon={Plus} onClick={() => { setState('normal'); classEditor(); }}>Tạo lớp đầu tiên</Button>} /></div> : view}
        <footer className="page-footer"><span>KidIT · Sổ điều phối trung tâm</span><span>Bản xem thử, dữ liệu không lưu lên hệ thống</span></footer>
      </main>
    </div></div>
    <nav className="bottom-nav" aria-label="Điều hướng trên điện thoại">{nav.filter(n => ['overview', 'schedule', 'payroll'].includes(n[0])).map(([path, title, icon]) => <a key={path} href={`#${path}`} className={route === path ? 'active' : ''}><Icon icon={icon} /><span>{title}</span></a>)}<button onClick={() => setMenu(true)}><Icon icon={Menu} /><span>Tất cả</span></button></nav>
    {menu && <MobileMenu close={() => setMenu(false)}>{sidebar}</MobileMenu>}
    {model && <EditDialog key={model.title} model={model} close={() => setModel(null)} />}
    {notice && <div className="toast" role="status"><Icon icon={CheckCheck} /><p>{notice}</p><button className="icon-button" aria-label="Đóng thông báo" onClick={() => setNotice('')}><Icon icon={X} size={16} /></button></div>}
  </Demo.Provider>;
}

function MobileMenu({ children, close }) {
  const ref = useRef(null);
  useEffect(() => { const previous = document.activeElement; ref.current.showModal(); return () => previous?.focus(); }, []);
  return <dialog className="mobile-drawer" ref={ref} aria-label="Menu chức năng" onCancel={close} onClick={e => { if (e.target === ref.current) close(); }}><button className="drawer-close icon-button" onClick={close} aria-label="Đóng menu"><Icon icon={X} /></button><div onClick={e => { if (e.target.closest('a')) close(); }}>{children}</div></dialog>;
}

function Overview() {
  const d = useDemo();
  const [date, setDate] = useState(TODAY);
  const todayClasses = d.classes.flatMap(c => classSlots(c, date).map(slot => ({ ...c, slot }))).sort((a, b) => a.slot.start.localeCompare(b.slot.start));
  const mine = d.work.filter(w => w.teacherId === d.user.id && w.status === 'completed');
  const roster = todayClasses.reduce((n, c) => n + d.students.filter(s => s.classId === c.id).length, 0);
  return <><PageHead title="Một ngày ở KidIT" description="Lịch hôm nay, lớp cần mở và những việc còn lại."><Button icon={Plus} onClick={() => d.role === 'teacher' ? d.addWork() : d.classEditor()}>{d.role === 'teacher' ? 'Chấm công của tôi' : 'Tạo lớp học'}</Button></PageHead>
    <section className="day-strip" aria-label="Tóm tắt ngày"><div className="date-block"><span className="date-number">{date.slice(8)}</span><div><strong>{weekdays[weekday(date)]}</strong><span>Tháng {Number(date.slice(5, 7))}, {date.slice(0, 4)}</span></div></div><div className="day-stat"><strong>{todayClasses.length.toString().padStart(2, '0')}</strong><span>lớp trong ngày</span></div><div className="day-stat"><strong>{roster.toString().padStart(2, '0')}</strong><span>lượt học sinh</span></div><div className="day-caption"><span>Đang xem ngày minh họa</span><input aria-label="Ngày xem tổng quan" type="date" value={date} onChange={e => e.target.value && setDate(e.target.value)} /></div></section>
    <div className="overview-layout"><section className="panel agenda"><PanelHead title="Lịch trong ngày" caption="Mở lớp để điểm danh và theo dõi buổi học."><a className="text-link" href="#schedule">Lịch cả tuần <Icon icon={ArrowUpRight} size={16} /></a></PanelHead>
      {todayClasses.length ? <div className="agenda-list">{todayClasses.map((c, i) => <article className="agenda-row" key={`${c.id}-${c.slot.key}`}><div className="agenda-time"><strong>{c.slot.start}</strong><span>{c.slot.end}</span></div><div className="agenda-content"><div className="row-title"><a href={`#class/${c.id}`}>{c.name}</a><span className="room"><Icon icon={DoorOpen} size={14} />{c.room}</span></div><div className="agenda-meta"><Avatar name={d.person(c.teacher)} /><span>{d.person(c.teacher)}</span><span className="student-count">{d.students.filter(s => s.classId === c.id).length}/{c.capacity} học sinh</span></div></div><div className="agenda-action"><span className={`plain-status ${i === 0 ? 'marked' : ''}`}>{i === 0 ? 'Ca đầu ngày' : 'Theo lịch'}</span><a className="button secondary small" href={`#class/${c.id}`}>Mở lớp <Icon icon={ChevronRight} size={15} /></a></div></article>)}</div> : <Empty title="Ngày này chưa có lớp" text="Chọn ngày khác hoặc thêm lịch cho một lớp." />}
      <div className="panel-foot"><span><Icon icon={CalendarDays} size={16} />Giờ học theo lịch mặc định của lớp</span><a href="#classes" className="text-link">Quản lý lớp</a></div>
    </section><aside className="overview-aside"><section className="personal-work"><div className="personal-work-head"><Icon icon={ClipboardCheck} /><span>Tháng 10 / 2026</span></div><h2>{d.role === 'teacher' ? 'Công giảng dạy của tôi' : 'Công giảng dạy toàn trung tâm'}</h2><div className="work-number">{d.role === 'teacher' ? mine.length.toString().padStart(2, '0') : d.work.filter(w => w.status === 'completed').length.toString().padStart(2, '0')}<span>suất đã xác nhận</span></div><p>{d.role === 'teacher' ? 'Từng suất dạy được ghi riêng bằng tài khoản cá nhân của bạn.' : 'Đối chiếu số công theo giáo viên và từng suất đã dạy.'}</p><a className="button light" href="#payroll">{d.role === 'teacher' ? 'Xem công của tôi' : 'Xem bảng tổng công'}<Icon icon={ChevronRight} size={16} /></a></section>
      <section className="reminders"><h2>Trước khi kết thúc ngày</h2><a href="#payroll"><span className="reminder-symbol"><Icon icon={ClipboardCheck} /></span><div><strong>Kiểm tra công đã ghi</strong><p>Ngày, suất và tên bài học.</p></div><Icon icon={ChevronRight} size={16} /></a><a href="#finance"><span className="reminder-symbol"><Icon icon={Wallet} /></span><div><strong>{d.invoices.filter(i => i.status !== 'paid').length} khoản học phí cần xem</strong><p>Theo dữ liệu minh họa.</p></div><Icon icon={ChevronRight} size={16} /></a></section>
    </aside></div>
    <section className="quick-strip"><div><h2>Vào đúng việc, ít thao tác hơn.</h2><p>Danh sách và công cụ dùng thường xuyên.</p></div><a href="#students"><Icon icon={UserRoundPlus} />Hồ sơ học sinh<Icon icon={ArrowUpRight} size={15} /></a><a href="#tools"><Icon icon={Timer} />Công cụ trên lớp<Icon icon={ArrowUpRight} size={15} /></a></section>
  </>;
}

function Schedule() {
  const d = useDemo(); const [teacher, setTeacher] = useState(''); const [view, setView] = useState('grid');
  const [exporting, setExporting] = useState(''); const [error, setError] = useState('');
  const [exported, setExported] = useState({});
  const parentRef = useRef(null); const teacherRef = useRef(null);
  const blocks = buildScheduleBlocks(d.classes, d.person);
  const visible = blocks.filter(b => !teacher || d.cls(b.classId).teacher === Number(teacher) || d.cls(b.classId).ta === Number(teacher));
  const slots = [...new Set([...TIME_SLOTS, ...blocks.map(b => b.timeKey)])].sort();
  const exportSchedule = async (staff = false) => {
    if (exporting) return;
    setExporting(staff ? 'teachers' : 'parents'); setError('');
    try {
      const target = staff ? teacherRef.current : parentRef.current;
      await document.fonts.ready;
      await Promise.all(Array.from(target.querySelectorAll('img')).map(img => img.decode()));
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(target, { scale: 2, useCORS: true, backgroundColor: null, onclone: doc => {
        doc.querySelectorAll('.export-template-wrapper').forEach(wrapper => { wrapper.style.opacity = '1'; });
        doc.documentElement.style.colorScheme = 'light';
      } });
      const filename = `Lich_Hoc_${staff ? 'GV_' : ''}Minh_Hoa.png`;
      const image = canvas.toDataURL('image/png');
      setExported(images => ({ ...images, [staff ? 'teachers' : 'parents']: { image, filename } }));
      const link = document.createElement('a'); link.download = filename; link.href = image; link.click();
      d.notify(staff ? 'Đã xuất ảnh TKB cho giáo viên theo mẫu cũ, có GV và trợ giảng.' : 'Đã xuất ảnh lịch cho phụ huynh theo mẫu cũ, chỉ có tên lớp.');
    } catch (error) { console.error('Không xuất được ảnh lịch:', error); setError('Không xuất được ảnh. Hãy thử lại bằng nút xuất ảnh.'); }
    finally { setExporting(''); }
  };
  return <><PageHead title="Thời khóa biểu toàn trung tâm" description="Lịch cố định theo thứ và suất học, như web hiện tại."><Button icon={Download} disabled={!!exporting} onClick={() => exportSchedule()}>{exporting === 'parents' ? 'Đang xuất ảnh...' : 'Xuất ảnh cho phụ huynh'}</Button><Button variant="secondary" icon={Download} disabled={!!exporting} onClick={() => exportSchedule(true)}>{exporting === 'teachers' ? 'Đang xuất TKB...' : 'Xuất TKB cho GV'}</Button></PageHead>
    <div className="schedule-controls"><p className="muted">Hai ảnh xuất luôn dùng lịch toàn trung tâm. Bộ lọc chỉ áp dụng khi xem trên màn hình.</p><div className="toolbar-end"><Select label="Người dạy" value={teacher} onChange={e => setTeacher(e.target.value)}><option value="">Tất cả giáo viên</option>{d.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</Select><div className="segmented" aria-label="Cách xem lịch"><button className={view === 'grid' ? 'selected' : ''} onClick={() => setView('grid')}>Thời khóa biểu</button><button className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')}>Danh sách</button></div></div></div>
    {error && <p className="error-note" role="alert">{error}</p>}
    {!!Object.keys(exported).length && <section className="schedule-export-results" aria-label="Ảnh lịch vừa xuất">{Object.entries(exported).map(([type, item]) => <figure key={type}><img alt={type === 'parents' ? 'Ảnh lịch cho phụ huynh' : 'Ảnh TKB cho giáo viên'} src={item.image} /><figcaption><strong>{type === 'parents' ? 'Lịch cho phụ huynh' : 'TKB cho giáo viên'}</strong><p>Giữ mẫu xuất của web hiện tại.</p><a className="text-link" href={item.image} download={item.filename}>{type === 'parents' ? 'Tải ảnh phụ huynh PNG' : 'Tải ảnh giáo viên PNG'}<Icon icon={Download} size={15} /></a></figcaption></figure>)}<Button variant="ghost" onClick={() => setExported({})}>Ẩn ảnh đã xuất</Button></section>}
    {view === 'grid' ? <><p className="timetable-hint">Có thể cuộn trong bảng để xem đủ 7 ngày.</p><div className="timetable-scroll" role="region" aria-label="Thời khóa biểu theo thứ và suất" tabIndex={0}><table className="legacy-timetable"><thead><tr><th scope="col">Giờ / Ngày</th>{SCHEDULE_DAYS.map(day => <th scope="col" key={day}>{WEEKDAYS[day]}</th>)}</tr></thead><tbody>{slots.map(time => <tr key={time}><th scope="row">{time.replace('-', ' - ')}</th>{SCHEDULE_DAYS.map(day => <td key={day}>{visible.filter(b => b.dayIndex === day && b.timeKey === time).map(b => <a className="timetable-class" key={b.id} href={`#class/${b.classId}`}><strong>{b.className}</strong><span>GV: {b.teacher}</span><small>TG: {b.ta || 'Chưa phân công'}</small><small>{b.room}</small></a>)}</td>)}</tr>)}</tbody></table></div></> : <div className="weekly-slot-list">{SCHEDULE_DAYS.map(day => <section className="panel" key={day}><PanelHead title={WEEKDAYS[day]} /><div className="weekly-day-classes">{visible.filter(b => b.dayIndex === day).sort((a, b) => a.timeKey.localeCompare(b.timeKey)).map(b => <a className="schedule-event" key={b.id} href={`#class/${b.classId}`}><span className="event-time">{b.timeKey.replace('-', ' - ')}</span><strong>{b.className}</strong><small>GV: {b.teacher}</small><small>TG: {b.ta || 'Chưa phân công'}</small><span>{b.room}</span></a>)}{!visible.some(b => b.dayIndex === day) && <p className="no-event">Không có lớp</p>}</div></section>)}</div>}
    <div className="info-line"><Icon icon={CalendarDays} size={17} /><p>Lịch thể hiện phân công mặc định. Công thực tế được ghi riêng bởi từng giáo viên.</p></div>
    <ScheduleExportTemplate ref={parentRef} scheduleBlocks={blocks} applyDate={dateLabel(TODAY)} />
    <ScheduleExportTemplate ref={teacherRef} scheduleBlocks={blocks} applyDate={dateLabel(TODAY)} includeStaff />
  </>;
}

function Classes() {
  const d = useDemo(); const [teacher, setTeacher] = useState('');
  const visible = d.classes.filter(c => c.name.toLocaleLowerCase('vi').includes(d.query.toLocaleLowerCase('vi')) && (!teacher || c.teacher === Number(teacher)));
  return <><PageHead title="Lớp học" description="Một hồ sơ cho lịch học, học sinh và từng suất dạy."><Button icon={Plus} onClick={() => d.classEditor()}>Tạo lớp học</Button></PageHead><div className="filters"><Find value={d.query} onChange={d.setQuery} placeholder="Tìm tên lớp..." /><Select label="Phụ trách" value={teacher} onChange={e => setTeacher(e.target.value)}><option value="">Tất cả giáo viên</option>{d.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</Select><span className="result-count">{visible.length} lớp</span></div>
    <div className="class-grid">{visible.map(c => { const count = d.students.filter(s => s.classId === c.id).length; return <article className="class-card" key={c.id}><div className="class-card-top"><h2><a href={`#class/${c.id}`}>{c.name}</a></h2><span className="room">{c.room}</span></div><div className="class-teacher"><Avatar name={d.person(c.teacher)} /><div><strong>{d.person(c.teacher)}</strong><small>Trợ giảng: {d.person(c.ta)}</small></div></div><div className="class-times"><Icon icon={CalendarDays} size={16} /><div>{classSlots(c).map(s => <p key={`${s.day}-${s.key}`}>{WEEKDAYS[s.day]} · {s.start} - {s.end}</p>)}</div></div><div className="capacity"><div><span>{count}/{c.capacity} học sinh</span><strong>{count >= c.capacity ? 'Đủ lớp' : `Còn ${c.capacity - count} chỗ`}</strong></div><progress aria-label={`Sĩ số ${c.name}`} value={count} max={c.capacity} /></div><footer><Button variant="ghost small" onClick={() => d.classEditor(c)}>Sửa thông tin</Button><a className="text-link" href={`#class/${c.id}`}>Mở lớp<Icon icon={ChevronRight} size={16} /></a></footer></article>; })}</div>{!visible.length && <Empty title="Không tìm thấy lớp phù hợp" text="Thử tên lớp khác hoặc bỏ bộ lọc giáo viên." />}
  </>;
}

function ClassDetail({ id }) {
  const d = useDemo(); const c = d.cls(id); const [tab, setTab] = useState('attendance'); const [date, setDate] = useState(TODAY);
  if (!c) return <Empty title="Lớp không còn trong bản mẫu" action={<a className="button" href="#classes">Về danh sách lớp</a>} />;
  const students = d.students.filter(s => s.classId === id); const records = d.work.filter(w => w.classId === id); const valid = isScheduledAttendanceDate(c.schedule, date);
  const attended = students.filter(s => d.attendance[`${id}:${date}:${s.id}`] === 'present').length;
  return <><a className="back-link" href="#classes"><Icon icon={ArrowLeft} size={16} />Danh sách lớp học</a><PageHead title={c.name} description={`${d.person(c.teacher)} · Trợ giảng: ${d.person(c.ta)}`}><Button variant="secondary" icon={SlidersHorizontal} onClick={() => d.classEditor(c)}>Thông tin lớp</Button><Button icon={Plus} onClick={() => d.addWork(id, date)}>Chấm công của tôi</Button></PageHead>
    <div className="class-facts"><span><Icon icon={CalendarDays} /><span>{classSlots(c).map(s => <span className="class-fact-slot" key={`${s.day}-${s.key}`}>{s.label}</span>)}</span></span><span><Icon icon={DoorOpen} />{c.room}</span><span><Icon icon={Users} />{students.length}/{c.capacity} học sinh</span></div>
    <div className="page-tabs" aria-label="Nội dung lớp"><button className={tab === 'attendance' ? 'active' : ''} onClick={() => setTab('attendance')}>Điểm danh học sinh <span>{students.length}</span></button><button className={tab === 'work' ? 'active' : ''} onClick={() => setTab('work')}>Công giảng dạy <span>{records.length}</span></button></div>
    {tab === 'attendance' ? <section className="panel"><PanelHead title="Điểm danh buổi học" caption="Chỉ chọn các buổi có sẵn theo lịch lớp, giống web hiện tại."><AttendancePicker schedule={c.schedule} value={date} onChange={setDate} /></PanelHead>
      {!valid ? <Empty title="Chưa có buổi học để điểm danh" text="Chọn tháng/năm có lịch hoặc cập nhật lịch của lớp." /> : <><div className="attendance-summary"><span><strong>{attended}</strong> có mặt</span><span>{students.length - attended} chưa xác nhận / vắng</span><Button variant="secondary small" icon={CheckCheck} onClick={() => { d.setAttendance(values => ({ ...values, ...Object.fromEntries(students.map(s => [`${id}:${date}:${s.id}`, 'present'])) })); d.notify('Đã đánh dấu cả lớp có mặt trong bản mẫu.'); }}>Cả lớp có mặt</Button></div>
        <div className="attendance-list">{students.map((s, i) => { const value = d.attendance[`${id}:${date}:${s.id}`]; return <div className="attendance-row" key={s.id}><span className="row-number">{String(i + 1).padStart(2, '0')}</span><Avatar name={s.name} /><div><strong>{s.name}</strong><small>HS{String(s.id).padStart(3, '0')}</small></div><div className="attendance-buttons"><button aria-pressed={value === 'present'} className={value === 'present' ? 'present' : ''} onClick={() => d.setAttendance(v => ({ ...v, [`${id}:${date}:${s.id}`]: value === 'present' ? '' : 'present' }))}><Icon icon={Check} size={16} />Có mặt</button><button aria-pressed={value === 'absent'} className={value === 'absent' ? 'absent' : ''} onClick={() => d.setAttendance(v => ({ ...v, [`${id}:${date}:${s.id}`]: value === 'absent' ? '' : 'absent' }))}>Vắng</button></div></div>; })}</div>{!students.length && <Empty title="Lớp chưa có học sinh" action={<Button onClick={() => d.studentEditor()}>Thêm học sinh</Button>} />}</>}
      <div className="panel-foot"><span>Mọi thay đổi chỉ dùng để duyệt giao diện.</span><Button variant="ghost small" icon={UserRoundPlus} onClick={() => d.studentEditor()}>Thêm học sinh</Button></div></section> : <section className="panel"><PanelHead title="Công của lớp" caption="Mỗi người tự ghi công bằng tài khoản cá nhân." /><WorkRows rows={records} />{!records.length && <Empty title="Chưa có lượt chấm công" action={<Button onClick={() => d.addWork(id)}>Ghi công đầu tiên</Button>} />}</section>}
  </>;
}

function Students() {
  const d = useDemo(); const [classId, setClassId] = useState('');
  const rows = d.students.filter(s => `${s.name} ${s.phone}`.toLocaleLowerCase('vi').includes(d.query.toLocaleLowerCase('vi')) && (!classId || (classId === 'none' ? !s.classId : s.classId === Number(classId))));
  return <><PageHead title="Học sinh" description="Tìm đúng học sinh, xem lớp và thông tin phụ huynh."><Button icon={UserRoundPlus} onClick={() => d.studentEditor()}>Thêm học sinh</Button></PageHead><div className="filters"><Find value={d.query} onChange={d.setQuery} placeholder="Tìm tên học sinh, số điện thoại..." /><Select label="Lớp" value={classId} onChange={e => setClassId(e.target.value)}><option value="">Tất cả lớp</option><option value="none">Chưa xếp lớp</option>{d.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select><span className="result-count">{rows.length} học sinh</span></div>
    <div className="panel table-panel"><table className="responsive-table"><thead><tr><th>Học sinh</th><th>Lớp đang học</th><th>Phụ huynh</th><th>Liên hệ</th><th><span className="sr-only">Thao tác</span></th></tr></thead><tbody>{rows.map(s => <tr key={s.id}><td data-label="Học sinh"><div className="table-person"><Avatar name={s.name} /><div><strong>{s.name}</strong><small>HS{String(s.id).padStart(3, '0')}</small></div></div></td><td data-label="Lớp">{d.cls(s.classId) ? <a className="class-tag" href={`#class/${s.classId}`}>{d.cls(s.classId).name}</a> : <span className="muted">Chưa xếp lớp</span>}</td><td data-label="Phụ huynh">{s.parent || <span className="muted">Chưa cập nhật</span>}</td><td data-label="Liên hệ">{s.phone || <span className="muted">Chưa cập nhật</span>}</td><td><Button variant="ghost small" onClick={() => d.studentEditor(s)}>Xem / sửa</Button></td></tr>)}</tbody></table>{!rows.length && <Empty title="Không có học sinh phù hợp" text="Thử bỏ bộ lọc hoặc tìm bằng tên khác." />}</div>
  </>;
}

function Teachers() {
  const d = useDemo(); const [role, setRole] = useState('');
  const rows = d.teachers.filter(t => `${t.name} ${t.username}`.toLocaleLowerCase('vi').includes(d.query.toLocaleLowerCase('vi')) && (!role || role === t.role));
  return <><PageHead title="Giáo viên & trợ giảng" description="Hồ sơ nhân sự, lớp phụ trách và tài khoản cá nhân."><Button icon={Plus} onClick={() => d.teacherEditor()}>Thêm nhân sự</Button></PageHead><div className="filters"><Find value={d.query} onChange={d.setQuery} placeholder="Tìm tên, tài khoản giáo viên..." /><Select label="Vai trò" value={role} onChange={e => setRole(e.target.value)}><option value="">Tất cả nhân sự</option><option>Giáo viên</option><option>Trợ giảng</option></Select><span className="result-count">{rows.length} nhân sự</span></div>
    <section className="panel"><div className="teacher-list">{rows.map(t => <article className="teacher-row" key={t.id}><Avatar name={t.name} large /><div className="teacher-name"><h2>{t.name}</h2><p>{t.role} <span>·</span> {t.username}</p></div><div className="teacher-classes">{d.classes.filter(c => c.teacher === t.id || c.ta === t.id).map(c => <a className="class-tag" href={`#class/${c.id}`} key={c.id}>{c.name}</a>)}{!d.classes.some(c => c.teacher === t.id || c.ta === t.id) && <span className="muted">Chưa phân công lớp</span>}</div><Button variant="secondary small" onClick={() => d.teacherEditor(t)}>Sửa hồ sơ</Button></article>)}</div>{!rows.length && <Empty title="Không tìm thấy nhân sự" />}</section><div className="info-line"><Icon icon={UserRound} /><p>Thêm giáo viên sẽ tạo tài khoản không dấu viết liền, mật khẩu ban đầu kidit. Admin có thể đổi thông tin tại mục Tài khoản.</p></div>
  </>;
}

function WorkRows({ rows }) {
  const d = useDemo();
  return <div className="work-list">{rows.map(w => <article className="work-row" key={w.id}><div className="work-date"><strong>{w.date.slice(8)}</strong><span>{w.date.slice(5, 7)}/{w.date.slice(0, 4)}</span></div><div className="work-info"><div><a className="class-tag" href={`#class/${w.classId}`}>{d.cls(w.classId)?.name || 'Lớp học'}</a><span className="muted">{w.start} - {w.end}</span></div><h3>{w.lesson}</h3><p>{d.person(w.teacherId)} <span>·</span> {w.role}</p></div><div className="work-status"><Badge value={w.status} /><span>{w.status === 'completed' ? '1 công / suất' : 'Chưa tính công'}</span></div>{w.teacherId === d.user.id && <Button variant="ghost small" onClick={() => d.addWork(w.classId, w.date, { ...w, teacher: d.user.name, slot: `${w.start}-${w.end}` })}>Sửa công</Button>}</article>)}</div>;
}
function Payroll() {
  const d = useDemo(); const [tab, setTab] = useState(d.role === 'admin' ? 'all' : 'mine'); const [month, setMonth] = useState('2026-10'); const [teacher, setTeacher] = useState(''); const [status, setStatus] = useState('');
  useEffect(() => { setTab(d.role === 'admin' ? 'all' : 'mine'); setTeacher(''); }, [d.role]);
  const rows = d.work.filter(w => w.date.startsWith(month) && (tab === 'all' || w.teacherId === d.user.id) && (!teacher || w.teacherId === Number(teacher)) && (!status || w.status === status)).sort((a, b) => b.date.localeCompare(a.date));
  const completed = rows.filter(w => w.status === 'completed');
  const exportWork = () => { csv('Bang-cong-minh-hoa.csv', [['Ngày', 'Người dạy', 'Lớp', 'Bắt đầu', 'Kết thúc', 'Bài học', 'Vai trò', 'Số công'], ...completed.map(w => [w.date, d.person(w.teacherId), d.cls(w.classId)?.name, w.start, w.end, w.lesson, w.role, 1])]); d.notify('Đã xuất bảng công minh họa.'); };
  return <><PageHead title="Sổ công giảng dạy" description="Ghi nhận đúng người, đúng suất và đúng bài đã dạy."><Button variant="secondary" icon={Download} onClick={exportWork} disabled={!completed.length}>Xuất bảng công</Button>{d.role === 'teacher' && <Button icon={Plus} onClick={() => d.addWork()}>Chấm công của tôi</Button>}</PageHead>
    <div className="page-tabs"><button className={tab === 'mine' ? 'active' : ''} onClick={() => { setTab('mine'); setTeacher(''); }}>Công của tôi</button><button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>Tổng công toàn trung tâm</button></div>
    <div className="payroll-summary"><div><p>{tab === 'mine' ? 'Công đã xác nhận của bạn' : 'Tổng công đã xác nhận'}</p><strong>{completed.length.toString().padStart(2, '0')}<small>suất</small></strong></div><div><p>Chưa xác nhận</p><strong>{rows.filter(w => w.status === 'draft').length.toString().padStart(2, '0')}<small>suất</small></strong></div><div className="payroll-note"><Icon icon={ClipboardCheck} /><p>Mỗi người tự ghi công.<br />Tổng công công khai cho mọi tài khoản.</p></div></div>
    <div className="filters"><label className="inline-date">Tháng<input aria-label="Tháng bảng công" type="month" value={month} onChange={e => e.target.value && setMonth(e.target.value)} /></label>{tab === 'all' && <Select label="Giáo viên" value={teacher} onChange={e => setTeacher(e.target.value)}><option value="">Tất cả nhân sự</option>{d.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</Select>}<Select label="Trạng thái" value={status} onChange={e => setStatus(e.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(workStatus).map(([value, [label]]) => <option key={value} value={value}>{label}</option>)}</Select><span className="result-count">{rows.length} bản ghi</span></div>
    {tab === 'all' && <section className="panel summary-table"><PanelHead title="Theo từng giáo viên" caption="Chỉ cộng những suất đã xác nhận." /><div className="summary-grid">{d.teachers.filter(t => completed.some(w => w.teacherId === t.id)).map(t => <div key={t.id}><Avatar name={t.name} /><span>{t.name}</span><strong>{completed.filter(w => w.teacherId === t.id).length}<small> công</small></strong></div>)}</div>{!completed.length && <p className="inset muted">Chưa có công đã xác nhận theo bộ lọc.</p>}</section>}
    <section className="panel"><PanelHead title="Chi tiết suất dạy" caption="Ngày, lớp và bài học trong cùng một bản ghi." /><WorkRows rows={rows} />{!rows.length && <Empty title="Chưa có công theo bộ lọc này" text={tab === 'mine' ? 'Sau mỗi buổi học, ghi ngày, suất và tên bài học để xác nhận công.' : 'Thử thay đổi tháng, giáo viên hoặc trạng thái.'} action={d.role === 'teacher' && <Button onClick={() => d.addWork()}>Ghi công của tôi</Button>} />}</section>
  </>;
}

function Finance() {
  const d = useDemo(); const [status, setStatus] = useState('');
  const rows = d.invoices.filter(i => (!status || i.status === status) && (d.students.find(s => s.id === i.studentId)?.name || '').toLocaleLowerCase('vi').includes(d.query.toLocaleLowerCase('vi')));
  const create = () => d.open({ title: 'Tạo phiếu học phí', initial: { studentId: '', amount: '', status: 'pending', date: TODAY }, fields: [
    { key: 'studentId', label: 'Học sinh', type: 'select', full: true, required: true, options: [{ value: '', label: 'Chọn học sinh' }, ...d.students.map(s => ({ value: s.id, label: s.name }))] }, { key: 'amount', label: 'Số tiền (đồng)', type: 'number', min: 1, required: true }, { key: 'date', label: 'Ngày lập', type: 'date', required: true }, { key: 'status', label: 'Trạng thái', type: 'select', full: true, options: [{ value: 'pending', label: 'Chờ thu' }, { value: 'paid', label: 'Đã thu' }, { value: 'overdue', label: 'Quá hạn' }] },
  ], save: v => { d.setInvoices(items => [...items, { ...v, studentId: Number(v.studentId), amount: Number(v.amount), id: Date.now() }]); d.notify('Đã tạo phiếu minh họa. Không phát sinh thu tiền thật.'); } });
  return <><PageHead title="Học phí" description="Đối chiếu khoản đã thu và những khoản cần theo dõi."><Button icon={Plus} onClick={create}>Tạo phiếu học phí</Button></PageHead><div className="finance-summary">{[['paid', 'Đã thu', 'good'], ['pending', 'Chờ thu', 'wait'], ['overdue', 'Quá hạn', 'danger']].map(([value, label, tone]) => <button key={value} className={status === value ? 'chosen' : ''} onClick={() => setStatus(v => v === value ? '' : value)}><span className={tone}>{label}</span><strong>{money(d.invoices.filter(i => i.status === value).reduce((n, i) => n + i.amount, 0))}</strong><small>{d.invoices.filter(i => i.status === value).length} phiếu minh họa</small></button>)}</div><div className="filters"><Find value={d.query} onChange={d.setQuery} placeholder="Tìm theo tên học sinh..." /><Select label="Trạng thái" value={status} onChange={e => setStatus(e.target.value)}><option value="">Tất cả phiếu</option>{Object.entries(invoiceStatus).map(([v, [label]]) => <option key={v} value={v}>{label}</option>)}</Select><span className="result-count">{rows.length} phiếu</span></div>
    <section className="panel table-panel"><table className="responsive-table"><thead><tr><th>Học sinh / mã phiếu</th><th>Ngày lập</th><th>Số tiền</th><th>Trạng thái</th><th><span className="sr-only">Chi tiết</span></th></tr></thead><tbody>{rows.map(i => <tr key={i.id}><td data-label="Học sinh"><strong>{d.students.find(s => s.id === i.studentId)?.name}</strong><small>HP{String(i.id).slice(-5).padStart(4, '0')}</small></td><td data-label="Ngày lập">{dateLabel(i.date)}</td><td data-label="Số tiền"><strong className="amount">{money(i.amount)}</strong></td><td data-label="Trạng thái"><Badge type="invoice" value={i.status} /></td><td><Button variant="ghost small" onClick={() => d.open({ title: `Phiếu HP${String(i.id).slice(-5).padStart(4, '0')}`, content: <dl className="detail-dl"><dt>Học sinh</dt><dd>{d.students.find(s => s.id === i.studentId)?.name}</dd><dt>Số tiền</dt><dd>{money(i.amount)}</dd><dt>Ngày lập</dt><dd>{dateLabel(i.date)}</dd><dt>Trạng thái</dt><dd><Badge type="invoice" value={i.status} /></dd></dl> })}>Chi tiết</Button></td></tr>)}</tbody></table>{!rows.length && <Empty title="Không có phiếu phù hợp" text="Thử đổi trạng thái hoặc tên học sinh." />}</section>
  </>;
}

function Accounts() {
  const d = useDemo();
  if (d.role !== 'admin') return <Empty title="Quản lý tài khoản dành cho admin" text="Chọn Xem như Admin trên thanh bản duyệt để xem màn hình này." />;
  const change = account => d.open({ title: `Thông tin đăng nhập · ${account.name}`, initial: { username: account.username, password: '' }, fields: [
    { key: 'username', label: 'Tên đăng nhập', required: true, full: true }, { key: 'password', label: 'Mật khẩu mới', type: 'password', full: true, help: 'Để trống nếu giữ nguyên. Bản mẫu không lưu mật khẩu.' },
  ], validate: v => !/^[a-z0-9][a-z0-9._-]*$/.test(v.username) ? 'Dùng chữ thường không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.' : d.teachers.some(t => t.id !== account.id && t.username === v.username) ? 'Tên đăng nhập đã được sử dụng.' : '', save: v => { d.setTeachers(rows => rows.map(t => t.id === account.id ? { ...t, username: v.username } : t)); d.notify('Đã cập nhật tên đăng nhập minh họa. Mật khẩu không được lưu trong bản mẫu.'); } });
  const rows = d.teachers.filter(t => `${t.name} ${t.username}`.toLocaleLowerCase('vi').includes(d.query.toLocaleLowerCase('vi')));
  return <><PageHead title="Tài khoản" description="Mỗi giáo viên một tài khoản để ghi công rõ ràng."><Button icon={UserRoundPlus} onClick={() => d.teacherEditor()}>Tạo tài khoản giáo viên</Button></PageHead><div className="account-guidance"><Icon icon={Settings2} size={24} /><div><h2>Ít bước để bắt đầu.</h2><p>Thêm giáo viên sẽ tự tạo tên đăng nhập không dấu viết liền, mật khẩu ban đầu <strong>kidit</strong>. Bạn có thể đổi lại bên dưới.</p></div></div><div className="filters"><Find value={d.query} onChange={d.setQuery} placeholder="Tìm giáo viên, tên đăng nhập..." /><span className="result-count">{rows.length} tài khoản giáo viên</span></div><section className="panel table-panel"><table className="responsive-table"><thead><tr><th>Giáo viên</th><th>Tên đăng nhập</th><th>Quyền sử dụng</th><th><span className="sr-only">Thao tác</span></th></tr></thead><tbody>{rows.map(t => <tr key={t.id}><td><div className="table-person"><Avatar name={t.name} /><strong>{t.name}</strong></div></td><td data-label="Tên đăng nhập"><span className="login-name">{t.username}</span></td><td data-label="Quyền">Giáo viên · Các chức năng hiện có</td><td><Button variant="secondary small" onClick={() => change(t)}>Đổi tên / mật khẩu</Button></td></tr>)}</tbody></table>{!rows.length && <Empty title="Không tìm thấy tài khoản" />}</section><div className="info-line"><Icon icon={UserRound} /><p>Tài khoản admin được giữ riêng. Chuyển vai trò trên thanh bản duyệt chỉ để kiểm tra giao diện.</p></div>
  </>;
}

function Tools() {
  const d = useDemo(); const [tab, setTab] = useState('timer'); const [seconds, setSeconds] = useState(300); const [minutes, setMinutes] = useState(5); const [running, setRunning] = useState(false);
  const deadline = useRef(0);
  const [roster, setRoster] = useState(d.students.filter(s => s.classId === 4).map(s => s.name).join('\n')); const [selected, setSelected] = useState(''); const [groups, setGroups] = useState([]); const [count, setCount] = useState(2); const [scores, setScores] = useState([0, 0]);
  useEffect(() => { if (!running) return; const interval = setInterval(() => { const next = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)); setSeconds(next); if (!next) setRunning(false); }, 200); return () => clearInterval(interval); }, [running]);
  const names = [...new Set(roster.split('\n').map(s => s.trim()).filter(Boolean))];
  return <><PageHead title="Công cụ trên lớp" description="Mở khi cần, giữ sự chú ý cho buổi học." /><div className="tool-navigation">{[['timer', 'Đếm ngược', Timer], ['picker', 'Bốc thăm', Dices], ['groups', 'Chia nhóm', Users], ['scores', 'Bảng điểm', Trophy]].map(([key, title, icon]) => <button className={tab === key ? 'selected' : ''} key={key} onClick={() => setTab(key)}><Icon icon={icon} />{title}</button>)}</div>
    {tab === 'timer' ? <section className="panel timer-panel"><p className="muted">Dành một khoảng tập trung</p><output className="timer-number" aria-live={running ? 'off' : 'polite'}>{String(Math.floor(seconds / 60)).padStart(2, '0')}<span>:</span>{String(seconds % 60).padStart(2, '0')}</output><p>{running ? 'Đang đếm ngược' : seconds === 0 ? 'Hết giờ. Hoàn thành hoạt động nhé.' : 'Sẵn sàng cho hoạt động tiếp theo'}</p><div className="timer-presets">{[3, 5, 10, 15].map(m => <button key={m} className={minutes === m ? 'selected' : ''} onClick={() => { setMinutes(m); setSeconds(m * 60); setRunning(false); }}>{m} phút</button>)}</div><div className="timer-actions"><Button icon={running ? Pause : Play} onClick={() => { const value = seconds || minutes * 60; deadline.current = Date.now() + value * 1000; setSeconds(value); setRunning(v => !v); }}>{running ? 'Tạm dừng' : 'Bắt đầu'}</Button><Button variant="secondary" icon={RotateCcw} onClick={() => { setRunning(false); setSeconds(minutes * 60); }}>Đặt lại</Button><Button variant="ghost" onClick={() => { if (running) deadline.current += 60000; setSeconds(s => s + 60); }}>+1 phút</Button></div></section> : tab === 'scores' ? <section className="panel scoreboard"><PanelHead title="Bảng điểm thi đua"><Button variant="secondary" onClick={() => setScores(scores.map(() => 0))}>Đưa điểm về 0</Button></PanelHead><div className="score-teams">{scores.map((score, i) => <div key={i}><h3>Đội {i + 1}</h3><output>{score}</output><div><button aria-label={`Trừ điểm đội ${i + 1}`} className="icon-button" onClick={() => setScores(rows => rows.map((s, j) => j === i ? s - 1 : s))}>−1</button><Button onClick={() => setScores(rows => rows.map((s, j) => j === i ? s + 1 : s))}>+1 điểm</Button></div></div>)}</div></section> : <div className="roster-layout"><section className="panel roster-panel"><PanelHead title="Danh sách học sinh" caption="Mỗi tên một dòng; có thể chỉnh sửa để thử." /><label>Danh sách<textarea rows={10} value={roster} onChange={e => setRoster(e.target.value)} /></label><p className="muted">{names.length} học sinh trong danh sách minh họa.</p></section><section className="panel picker-panel">{tab === 'picker' ? <><h2>Đến lượt bạn nào?</h2><div className="picked-name" role="status">{selected || 'Tên được chọn sẽ hiện ở đây'}</div><Button icon={Dices} disabled={!names.length} onClick={() => setSelected(names[Math.floor(Math.random() * names.length)])}>Bốc thăm học sinh</Button></> : <><h2>Chia nhóm cho hoạt động</h2><label>Số nhóm<input type="number" min={1} max={Math.min(10, names.length)} value={count} onChange={e => setCount(Number(e.target.value))} /></label><Button icon={Users} disabled={!names.length || count < 1 || count > Math.min(10, names.length)} onClick={() => {
          const shuffled = [...names]; for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
          setGroups(Array.from({ length: count }, (_, i) => shuffled.filter((_, j) => j % count === i)));
        }}>Chia nhóm</Button><div className="group-results">{groups.map((g, i) => <div key={i}><h3>Nhóm {i + 1}</h3><p>{g.join(', ')}</p></div>)}</div></>}</section></div>}
  </>;
}

