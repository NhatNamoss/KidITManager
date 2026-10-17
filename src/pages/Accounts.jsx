import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api, jsonBody } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/Button';
import '../components/TeachingSessions.css';
import { usernameFromName } from '../../shared/accounts';

export function Accounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const [a, t] = await Promise.all([api('/api/accounts'), api('/api/teachers')]); setAccounts(a); setTeachers(t); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { if (user.role === 'admin') load(); }, [load, user.role]);
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  const change = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const save = async e => {
    e.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      await api(`/api/accounts${form.id ? `/${form.id}` : ''}`, jsonBody(form, form.id ? 'PUT' : 'POST'));
      setForm(null); await load(); setNotice('Đã lưu tài khoản. Đổi mật khẩu sẽ yêu cầu tài khoản đó đăng nhập lại.');
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };
  const available = teachers.filter(t => !accounts.some(a => a.teacher_id === t.id));
  return <div className="account-page"><h1 className="text-h1">Tài khoản</h1>
    <p className="text-muted mt-2">Thêm giáo viên sẽ tự tạo tài khoản theo họ tên không dấu viết liền, mật khẩu kidit. Tên trùng được thêm số. Đổi họ tên giáo viên không làm đổi tên đăng nhập.</p>
    <div className="flex gap-2 mt-4"><Button disabled={loading || !!form} onClick={() => { setForm({ teacher_id: '', name: '', role: 1, phone: '', username: '', password: 'kidit' }); setNotice(''); }}>Tạo tài khoản giáo viên</Button><Button variant="secondary" disabled={saving} onClick={load}>Tải lại</Button></div>
    {error && <p role="alert" className="feedback-error">{error}</p>}{notice && <p role="status" className="feedback-success">{notice}</p>}
    {form && <form className="account-form" onSubmit={save}><h2 className="text-h2">{form.id ? `Sửa tài khoản ${form.name}` : 'Tạo tài khoản giáo viên'}</h2>
      {!form.id && <><label>Hồ sơ giáo viên<select className="form-input" value={form.teacher_id} onChange={e => {
        const teacher = available.find(t => t.id === Number(e.target.value));
        setForm(f => ({ ...f, teacher_id: teacher?.id || '', name: teacher?.name || '', username: teacher ? usernameFromName(teacher.name) : '' }));
      }}><option value="">Tạo giáo viên mới</option>{available.map(t => <option key={t.id} value={t.id}>{t.name} (#{t.id})</option>)}</select></label>
      {!form.teacher_id && <><label>Họ tên giáo viên<input required className="form-input" maxLength={255} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, username: usernameFromName(e.target.value) }))} /></label>
      <label>Vai trò<select className="form-input" value={form.role} onChange={e => change('role', Number(e.target.value))}><option value={1}>Giáo viên</option><option value={2}>Trợ giảng</option></select></label>
      <label>Số điện thoại<input type="tel" className="form-input" maxLength={255} value={form.phone} onChange={e => change('phone', e.target.value)} /></label></>}</>}
      <label>Tên đăng nhập<input required className="form-input" pattern="[a-z0-9][a-z0-9._-]{0,99}" maxLength={100} autoCapitalize="none" autoComplete="off" value={form.username} onChange={e => change('username', e.target.value)} /></label>
      <label>{form.id ? 'Mật khẩu mới (để trống để giữ nguyên)' : 'Mật khẩu'}<input required={!form.id} type="password" maxLength={128} className="form-input" autoComplete="new-password" value={form.password} onChange={e => change('password', e.target.value)} /></label>
      <div className="flex gap-2"><Button disabled={saving} type="submit">{saving ? 'Đang lưu...' : 'Lưu tài khoản'}</Button><Button disabled={saving} type="button" variant="ghost" onClick={() => setForm(null)}>Hủy</Button></div>
    </form>}
    {loading ? <p role="status">Đang tải tài khoản...</p> : <div className="table-scroll mt-4"><table className="data-table"><thead><tr><th>Họ tên</th><th>Tên đăng nhập</th><th>Quyền</th><th>Thao tác</th></tr></thead><tbody>{accounts.map(a => <tr key={a.id}><td>{a.name}</td><td>{a.username}</td><td>{a.role === 'admin' ? 'Admin' : 'Giáo viên'}</td><td><Button variant="secondary" disabled={!!form} onClick={() => { setForm({ ...a, password: '' }); setNotice(''); }}>Đổi tên / mật khẩu</Button></td></tr>)}</tbody></table></div>}
  </div>;
}
