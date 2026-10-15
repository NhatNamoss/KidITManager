import { useEffect, useState } from 'react';
import { api, jsonBody } from '../lib/api';
import { Button } from './ui/Button';

export function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const expired = () => setSession({ authenticated: false, configured: true });
    window.addEventListener('session-expired', expired);
    api('/api/auth/session').then(setSession).catch(e => setError(e.message));
    return () => window.removeEventListener('session-expired', expired);
  }, []);
  if (session?.authenticated) return children;
  return <main className="login-page"><form className="login-card glass-panel" onSubmit={async e => {
    e.preventDefault(); setBusy(true); setError('');
    try { await api('/api/auth/login', jsonBody({ password })); setPassword(''); setSession({ authenticated: true }); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }}>
    <h1 className="text-h1">KidIT Manager</h1>
    <p className="text-muted">Đăng nhập để quản lý lớp học và công giảng dạy.</p>
    {error && <p role="alert" className="feedback-error">{error}</p>}
    {session?.configured === false ? <p role="alert">Máy chủ cần được cấu hình APP_PASSWORD và SESSION_SECRET trước khi sử dụng.</p> :
      <><label htmlFor="password">Mật khẩu quản lý</label><input id="password" type="password" autoComplete="current-password" className="form-input" required value={password} onChange={e => setPassword(e.target.value)} />
      <Button type="submit" disabled={busy || !session}>{busy ? 'Đang đăng nhập...' : 'Đăng nhập'}</Button></>}
  </form></main>;
}
