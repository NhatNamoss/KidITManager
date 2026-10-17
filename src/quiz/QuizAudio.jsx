import { useEffect, useRef, useState } from 'react';
import { createQuizAudio, quizSoundCues, quizSoundSnapshot } from './quiz-audio';

function initialVolume() {
  try { const value = localStorage.getItem('kidit-quiz-volume'); return value !== null && Number.isFinite(Number(value)) ? Math.max(0, Math.min(100, Number(value))) : 35; }
  catch { return 35; }
}

export function QuizAudio({ room, now, stale }) {
  const engine = useRef(null);
  const previous = useRef(null);
  const audible = useRef(false);
  const clock = useRef(now);
  const mounted = useRef(true);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [music, setMusic] = useState(true);
  const [volume, setVolume] = useState(initialVolume);
  const [visible, setVisible] = useState(() => !document.hidden);
  const [error, setError] = useState('');
  useEffect(() => {
    mounted.current = true;
    const visibility = () => {
      setVisible(!document.hidden);
      if (document.hidden) engine.current?.silence();
      else if (engine.current && !engine.current.isRunning()) {
        setEnabled(false); setError('Trình duyệt đã tạm ngừng âm thanh. Bấm Bật âm thanh để nghe tiếp.');
      }
    };
    document.addEventListener('visibilitychange', visibility);
    return () => { mounted.current = false; document.removeEventListener('visibilitychange', visibility); engine.current?.dispose(); engine.current = null; };
  }, []);
  useEffect(() => {
    engine.current?.setVolume(volume / 100);
    try { localStorage.setItem('kidit-quiz-volume', String(volume)); } catch { /* Volume still applies for this tab when storage is unavailable. */ }
  }, [volume]);
  useEffect(() => {
    clock.current = now;
  }, [now]);
  useEffect(() => {
    const current = quizSoundSnapshot(room, now);
    const cues = quizSoundCues(previous.current, current);
    previous.current = current;
    const active = enabled && visible && !stale;
    const wasActive = audible.current;
    audible.current = active;
    if (!active) { engine.current?.silence(); return; }
    if (!wasActive) return;
    for (const cue of cues) engine.current?.play(cue);
  }, [room, now, enabled, visible, stale]);
  useEffect(() => {
    if (enabled && music && visible && !stale && room.phase === 'question') engine.current?.startMusic(room.deadline - clock.current);
    else engine.current?.stopMusic();
    return () => engine.current?.stopMusic();
  }, [enabled, music, visible, stale, room.phase, room.index, room.deadline]);
  const toggle = async () => {
    if (enabled) { engine.current?.silence(); setEnabled(false); setError(''); return; }
    setBusy(true); setError('');
    const audio = engine.current || createQuizAudio(); engine.current = audio;
    const ready = await audio.enable();
    if (!mounted.current) return;
    if (ready) { audio.setVolume(volume / 100); setEnabled(true); audio.play('round'); }
    else { audio.dispose(); engine.current = null; setError('Chưa phát được âm thanh. Kiểm tra quyền âm thanh của trình duyệt rồi thử bật lại.'); }
    setBusy(false);
  };
  return <section className="quiz-audio" aria-label="Âm thanh trận đấu">
    <button type="button" className="quiz-button quiz-secondary" aria-pressed={enabled} disabled={busy} onClick={toggle}>{busy ? 'Đang bật âm thanh...' : enabled ? 'Tắt âm thanh' : 'Bật âm thanh'}</button>
    <p className="quiz-muted">{enabled ? 'Âm thanh đang bật trên máy này.' : 'Bật để nghe nhạc vòng chơi, báo giờ và hiệu ứng kỹ năng.'}</p>
    <details className="quiz-audio-settings"><summary>Tùy chỉnh âm thanh</summary><div>
      <label>Âm lượng: {volume}%<input type="range" min="0" max="100" step="5" aria-label="Âm lượng trò chơi" value={volume} onChange={e => setVolume(Number(e.target.value))} /></label>
      <label className="quiz-audio-check"><input type="checkbox" checked={music} onChange={e => setMusic(e.target.checked)} />Nhạc nền mỗi câu</label>
      <button type="button" className="quiz-button quiz-secondary" disabled={!enabled || busy} onClick={() => engine.current?.play('correct')}>Nghe thử</button>
    </div></details>
    {error && <p className="quiz-error" role="alert">{error}</p>}
  </section>;
}
