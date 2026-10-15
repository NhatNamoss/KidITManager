import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, jsonBody, localDate } from '../lib/api';
import { Button } from './ui/Button';
import './TeachingSessions.css';

const labels = { draft: 'Chưa xác nhận', completed: 'Đã dạy, tính công', cancelled: 'Đã hủy, không tính công' };
const empty = () => ({ date: localDate(), start_time: '15:15', end_time: '17:15', status: 'draft', notes: '', staff: [], version: 0 });
export function TeachingSessions({ classInfo }) {
  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [rows, people] = await Promise.all([api(`/api/classes/${classInfo.id}/sessions`), api('/api/teachers')]);
      setSessions(rows); setTeachers(people);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [classInfo.id]);
  useEffect(() => { load(); }, [load]);
  const change = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const changeStaff = (index, key, value) => setForm(f => ({ ...f, staff: f.staff.map((s, i) => i === index ? { ...s, [key]: value } : s) }));
  const startNew = () => {
    const initial = empty();
    const schedule = classInfo.schedule?.match(/\((\d{2}:\d{2}) - (\d{2}:\d{2})\)/);
    if (schedule) { initial.start_time = schedule[1]; initial.end_time = schedule[2]; }
    const minutes = t => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
    for (const [role, name] of [['teacher', classInfo.teacher], ['ta', classInfo.ta]]) {
      const teacher = teachers.find(t => t.name === name);
      if (teacher && !initial.staff.some(s => s.teacher_id === teacher.id)) initial.staff.push({ teacher_id: teacher.id, role, minutes: minutes(initial.end_time) - minutes(initial.start_time) });
    }
    setForm(initial); setError(''); setNotice('');
  };
  const save = async e => {
    e.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      const { id, ...payload } = form;
      await api(`/api/classes/${classInfo.id}/sessions${id ? `/${id}` : ''}`, jsonBody(payload, id ? 'PUT' : 'POST'));
      setForm(null); await load(); setNotice('Đã lưu buổi dạy và công của người thực tế đứng lớp.');
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };
  return <section className="teaching-panel glass-panel p-6" aria-labelledby="teaching-title">
    <div className="session-heading"><div><h2 id="teaching-title" className="text-h2">Buổi dạy & chấm công</h2><p className="text-muted">Chọn người thực tế dạy từng ca. Chỉ buổi đã xác nhận mới được tổng hợp công.</p></div>
      <Button onClick={startNew} disabled={loading || Boolean(form)}>Ghi buổi dạy</Button></div>
    <p className="mt-2"><Link className="text-primary" to="/payroll">Xem bảng công theo tháng</Link></p>
    {error && <div role="alert" className="feedback-error">{error} <button type="button" disabled={saving} onClick={() => { setForm(null); load(); }}>Bỏ chỉnh sửa và tải lại</button></div>}
    {notice && <p role="status" className="feedback-success">{notice}</p>}
    {form && <form onSubmit={save} className="session-form" aria-label="Thông tin buổi dạy">
      <h3 className="text-h3">{form.id ? 'Sửa buổi dạy' : 'Ghi buổi dạy mới'}</h3>
      <fieldset disabled={saving}><div className="session-fields">
        <label>Ngày dạy<input required type="date" className="form-input" value={form.date} onChange={e => change('date', e.target.value)} /></label>
        <label>Bắt đầu<input required type="time" className="form-input" value={form.start_time} onChange={e => change('start_time', e.target.value)} /></label>
        <label>Kết thúc<input required type="time" className="form-input" value={form.end_time} onChange={e => change('end_time', e.target.value)} /></label>
        <label>Trạng thái<select className="form-input" value={form.status} onChange={e => change('status', e.target.value)}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>
      <p className="text-muted mt-4">Có thể chọn bất kỳ nhân sự cho vai trò dạy chính hoặc trợ giảng. Nếu chia ca, nhập số phút thực tế của mỗi người.</p>
      {form.staff.map((s, i) => <div className="staff-row" key={i}>
        <label>Người thực tế dạy<select required className="form-input" value={s.teacher_id || ''} onChange={e => changeStaff(i, 'teacher_id', Number(e.target.value))}><option value="">Chọn nhân sự</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name} (#{t.id})</option>)}</select></label>
        <label>Vai trò trong buổi<select className="form-input" value={s.role} onChange={e => changeStaff(i, 'role', e.target.value)}><option value="teacher">Dạy chính</option><option value="ta">Trợ giảng</option></select></label>
        <label>Số phút công<input required type="number" min="1" max="1439" className="form-input" value={s.minutes} onChange={e => changeStaff(i, 'minutes', Number(e.target.value))} /></label>
        <Button type="button" variant="ghost" onClick={() => change('staff', form.staff.filter((_, index) => index !== i))}>Bỏ người</Button>
      </div>)}
      <Button type="button" variant="secondary" onClick={() => change('staff', [...form.staff, { teacher_id: '', role: 'teacher', minutes: 120 }])}>Thêm người dạy / dạy thay</Button>
      {!teachers.length && <p className="text-muted">Hãy thêm nhân sự ở mục Giáo viên trước khi xác nhận công.</p>}
      <label className="session-notes">Ghi chú dạy thay / chia ca<textarea className="form-input" maxLength="2000" rows="3" value={form.notes} onChange={e => change('notes', e.target.value)} /></label>
      <div className="flex gap-2"><Button type="submit">{saving ? 'Đang lưu...' : 'Lưu buổi dạy'}</Button><Button type="button" variant="ghost" onClick={() => setForm(null)}>Hủy chỉnh sửa</Button></div>
      </fieldset></form>}
    {loading ? <p role="status">Đang tải buổi dạy...</p> : sessions.length === 0 ? <p className="empty-message">Chưa ghi buổi dạy nào. Lịch phân công chỉ là gợi ý khi tạo buổi mới.</p> :
      <div className="session-list">{sessions.map(s => <article className="session-item" key={s.id}>
        <div><strong>{s.date.split('-').reverse().join('/')} · {s.start_time}–{s.end_time}</strong><p className="text-muted">{labels[s.status]}</p>
          {s.staff.map(person => <p key={person.id}>{person.teacher_name} · {person.role === 'teacher' ? 'Dạy chính' : 'Trợ giảng'} · {person.minutes} phút</p>)}
          {s.notes && <p className="session-note-text text-muted">{s.notes}</p>}</div>
        <Button variant="secondary" disabled={Boolean(form)} onClick={() => { setForm({ ...s, staff: s.staff.map(p => ({ teacher_id: p.teacher_id, role: p.role, minutes: p.minutes })) }); setError(''); setNotice(''); }}>Sửa / hủy buổi</Button>
      </article>)}</div>}
  </section>;
}
