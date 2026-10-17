import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, jsonBody, localDate } from '../lib/api';
import { useAuth } from '../lib/auth';
import { scheduleSlots } from '../../shared/class-schedule';
import { Button } from './ui/Button';
import { DateFields } from './DateFields';
import './TeachingSessions.css';

const labels = { draft: 'Chưa xác nhận', completed: 'Đã dạy, tính công', cancelled: 'Đã hủy, không tính công' };
export function TeachingSessions({ classInfo }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [legacy, setLegacy] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [rows, old] = await Promise.all([api(`/api/classes/${classInfo.id}/personal-attendance`), api(`/api/classes/${classInfo.id}/sessions`)]);
      setEntries(rows); setLegacy(old);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [classInfo.id]);
  useEffect(() => { load(); }, [load]);
  const slots = form ? scheduleSlots(classInfo.schedule, form.date) : [];
  if (form?.id && form.slot && entries.some(e => e.id === form.id && e.date === form.date && e.slot === form.slot && e.start_time === form.start_time && e.end_time === form.end_time) && !slots.some(s => s.label === form.slot)) slots.push({ label: form.slot, start_time: form.start_time, end_time: form.end_time });
  const change = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const startNew = () => {
    const date = localDate(); const slot = scheduleSlots(classInfo.schedule, date)[0];
    setForm({ date, slot: slot?.label || '', start_time: slot?.start_time || '', end_time: slot?.end_time || '', lesson: '', role: user.teacher_role === 2 ? 'ta' : 'teacher', status: 'completed', notes: '', version: 0 });
    setError(''); setNotice('');
  };
  const save = async e => {
    e.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      await api(`/api/classes/${classInfo.id}/personal-attendance${form.id ? `/${form.id}` : ''}`, jsonBody(form, form.id ? 'PUT' : 'POST'));
      setForm(null); await load(); setNotice('Đã lưu công cá nhân của bạn. Người cùng ca tự chấm bằng tài khoản của họ.');
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };
  return <section className="teaching-panel glass-panel p-6" aria-labelledby="teaching-title">
    <div className="session-heading"><div><h2 id="teaching-title" className="text-h2">Chấm công cá nhân</h2><p className="text-muted">Mỗi giáo viên tự chấm bằng tài khoản của mình. Mọi tài khoản đều xem được tổng công.</p></div>
      {user.teacher_id && <Button onClick={startNew} disabled={loading || !!form}>Chấm công của tôi</Button>}</div>
    {!user.teacher_id && <p className="text-muted mt-2">Admin xem công và quản lý tài khoản. Để chấm công, đăng nhập bằng tài khoản giáo viên.</p>}
    <p className="mt-2"><Link className="text-primary" to="/payroll">Xem bảng công theo tháng</Link></p>
    {error && <div role="alert" className="feedback-error">{error} <button type="button" disabled={saving} onClick={() => { setForm(null); load(); }}>Bỏ chỉnh sửa và tải lại</button></div>}
    {notice && <p role="status" className="feedback-success">{notice}</p>}
    {form && <form onSubmit={save} className="session-form" aria-label="Chấm công cá nhân">
      <h3 className="text-h3">{form.id ? 'Sửa công của tôi' : 'Ghi công mới'} · {user.name}</h3>
      <fieldset disabled={saving}><div className="session-fields">
        <DateFields label="Ngày dạy" value={form.date} onChange={date => {
          const slot = scheduleSlots(classInfo.schedule, date)[0];
          setForm(f => ({ ...f, date, slot: slot?.label || '', start_time: slot?.start_time || '', end_time: slot?.end_time || '' }));
        }} />
        <label>Suất theo lịch lớp<select required className="form-input" value={form.slot} onChange={e => {
          const slot = slots.find(s => s.label === e.target.value);
          setForm(f => ({ ...f, slot: slot?.label || '', start_time: slot?.start_time || '', end_time: slot?.end_time || '' }));
        }}><option value="">Chọn suất</option>{slots.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}</select></label>
        <label>Vai trò<select className="form-input" value={form.role} onChange={e => change('role', e.target.value)}><option value="teacher">Dạy chính</option><option value="ta">Trợ giảng</option></select></label>
        <label>Trạng thái<select className="form-input" value={form.status} onChange={e => change('status', e.target.value)}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>
      {!slots.length && <p className="feedback-error">Lớp chưa có suất trong ngày đã chọn. Hãy chọn ngày đúng lịch hoặc cập nhật lịch lớp.</p>}
      <label className="session-notes">Tên bài học<input required className="form-input" maxLength={255} value={form.lesson} onChange={e => change('lesson', e.target.value)} /></label>
      <label className="session-notes">Ghi chú<textarea className="form-input" maxLength={2000} rows={2} value={form.notes} onChange={e => change('notes', e.target.value)} /></label>
      <p className="text-muted">Lớp: {classInfo.name}. Giờ dạy lấy theo suất đã chọn. Mỗi suất đã xác nhận được 1 công; chỉ xác nhận sau khi kết thúc.</p>
      <div className="flex gap-2 mt-4"><Button type="submit" disabled={!form.date || !form.slot}>{saving ? 'Đang lưu...' : 'Lưu công của tôi'}</Button><Button type="button" variant="ghost" onClick={() => setForm(null)}>Hủy chỉnh sửa</Button></div>
      </fieldset></form>}
    {loading ? <p role="status">Đang tải công...</p> : entries.length === 0 ? <p className="empty-message">Chưa có lượt chấm công cá nhân trong lớp này.</p> :
      <div className="session-list">{entries.map(s => <article className="session-item" key={s.id}>
        <div><strong>{s.date.split('-').reverse().join('/')} · {s.start_time}–{s.end_time}</strong><p>{s.teacher_name} · {s.role === 'teacher' ? 'Dạy chính' : 'Trợ giảng'}</p><p>Bài học: {s.lesson}</p><p className="text-muted">{labels[s.status]} · {s.status === 'completed' ? '1 công' : 'Chưa tính công'}</p>{s.notes && <p className="session-note-text text-muted">{s.notes}</p>}</div>
        {s.teacher_id === user.teacher_id && <Button variant="secondary" disabled={!!form} onClick={() => { setForm({ ...s }); setError(''); setNotice(''); }}>Sửa / hủy công của tôi</Button>}
      </article>)}</div>}
    {!!legacy.length && <details className="mt-4"><summary>Buổi dạy trước khi chuyển sang tài khoản cá nhân ({legacy.length})</summary><p className="text-muted">Giữ nguyên để đối chiếu; công đã xác nhận vẫn có trong bảng tổng. Không chấm lại suất đã có công cũ.</p>{legacy.map(s => <article className="session-item" key={s.id}><div><strong>{s.date} · {s.start_time}–{s.end_time}</strong><p>{labels[s.status]}</p>{s.staff.map(p => <p key={p.id}>{p.teacher_name} · {p.role === 'teacher' ? 'Dạy chính' : 'Trợ giảng'}</p>)}{s.notes && <p>{s.notes}</p>}</div></article>)}</details>}
  </section>;
}
