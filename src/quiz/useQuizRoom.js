import { useCallback, useEffect, useRef, useState } from 'react';

export async function quizRequest(url, body, token, signal) {
  let response;
  try {
    response = await fetch(url, {
      method: body === undefined ? 'GET' : 'POST', signal,
      headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Mất kết nối với phòng. Kiểm tra mạng; hệ thống sẽ tự kết nối lại.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Không thực hiện được thao tác. Hãy thử lại.');
  return data;
}

export function useQuizRoom(code, token, host = false) {
  const [room, setRoom] = useState(null);
  const [connectionError, setConnectionError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(Date.now());
  const latest = useRef(null);
  const pending = useRef(false);
  const offset = useRef(0);
  const lastSeen = useRef(0);
  const endpoint = host ? `/api/quiz/rooms/${code}` : `/api/play/${code}`;
  const accept = useCallback(view => {
    if (latest.current && view.code === latest.current.code && view.revision < latest.current.revision) return;
    if (latest.current && (view.index !== latest.current.index || view.phase !== latest.current.phase)) setActionError('');
    latest.current = view;
    offset.current = view.serverNow - Date.now();
    lastSeen.current = Date.now();
    setRoom(view);
  }, []);
  useEffect(() => {
    latest.current = null; setRoom(null); setConnectionError(''); setActionError(''); lastSeen.current = 0;
    if (!code || (!host && !token)) return;
    let stopped = false;
    let timer;
    const controller = new AbortController();
    const poll = async () => {
      if (!pending.current) {
        try { const view = await quizRequest(endpoint, undefined, token, controller.signal); if (!stopped) { accept(view); setConnectionError(''); } }
        catch (e) { if (!stopped) setConnectionError(e.message); }
      }
      if (!stopped) timer = setTimeout(poll, 900);
    };
    poll();
    return () => { stopped = true; clearTimeout(timer); controller.abort(); };
  }, [code, token, host, endpoint, accept]);
  useEffect(() => { const timer = setInterval(() => setTick(Date.now()), 200); return () => clearInterval(timer); }, []);
  const act = async (action, body) => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setActionError('');
    try { const view = await quizRequest(`${endpoint}/${action}`, body, token); accept(view); return true; }
    catch (e) { setActionError(e.message); return false; }
    finally { pending.current = false; setBusy(false); }
  };
  const now = tick + offset.current;
  return { room, error: actionError || connectionError, busy, act, now, stale: !lastSeen.current || tick - lastSeen.current > 5000 };
}

export function readQuizStorage(key) { try { return sessionStorage.getItem(key) || ''; } catch { return ''; } }
export function writeQuizStorage(key, value) { try { sessionStorage.setItem(key, value); return true; } catch { return false; } }
