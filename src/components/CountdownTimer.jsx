import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCountdown } from '../../shared/teaching-tools';
import { useTeachingTimer } from '../lib/TimerContext';
import { dispatchTimer, enableTimerAudio, playTimerAlarm } from '../lib/teaching-timer';
import { Button } from './ui/Button';
import { Modal } from './Modal';

const statusText = { idle: 'Sẵn sàng', running: 'Đang đếm ngược', paused: 'Đã tạm dừng', finished: 'Hết giờ!' };

export function TimerIndicator() {
  const { timer, remaining } = useTeachingTimer();
  if (timer.status === 'idle') return null;
  return <Link to="/tools" className={`timer-indicator ${timer.status === 'finished' ? 'timer-indicator-finished' : ''}`} aria-label="Mở công cụ đếm ngược">
    {timer.status === 'finished' ? 'Hết giờ!' : `Đếm ngược ${formatCountdown(remaining)}`}
  </Link>;
}

export function CountdownTimer({ popup = false, expanded = false }) {
  const { timer, remaining, synced } = useTeachingTimer();
  const [minutes, setMinutes] = useState(String(Math.floor(timer.durationMs / 60000)));
  const [seconds, setSeconds] = useState(String((timer.durationMs / 1000) % 60));
  const [error, setError] = useState('');
  const [showLarge, setShowLarge] = useState(false);
  useEffect(() => {
    setMinutes(String(Math.floor(timer.durationMs / 60000)));
    setSeconds(String((timer.durationMs / 1000) % 60));
  }, [timer.durationMs]);
  const running = timer.status === 'running';
  const enteredDuration = () => {
    const m = Number(minutes), s = Number(seconds);
    if (minutes === '' || seconds === '' || !Number.isInteger(m) || !Number.isInteger(s) || m < 0 || m > 1440 || s < 0 || s > 59)
      throw new Error('Nhập số phút và giây hợp lệ; số giây từ 0 đến 59.');
    return (m * 60 + s) * 1000;
  };
  const applyDuration = ms => {
    dispatchTimer({ type: 'duration', ms });
    setMinutes(String(Math.floor(ms / 60000)));
    setSeconds(String((ms / 1000) % 60));
    setError('');
  };
  const action = async type => {
    try {
      if (type === 'start') {
        if (timer.status !== 'paused') {
          const ms = enteredDuration();
          if (ms !== timer.durationMs) applyDuration(ms);
        }
        await enableTimerAudio();
      }
      dispatchTimer({ type }); setError('');
      if (type === 'reset') {
        setMinutes(String(Math.floor(timer.durationMs / 60000)));
        setSeconds(String((timer.durationMs / 1000) % 60));
      }
    } catch (e) { setError(e.message); }
  };
  return <section className={`countdown-tool ${expanded || popup ? 'countdown-tool-large' : ''}`} aria-label="Đồng hồ đếm ngược">
    <div className="tool-section-heading"><div><h2>Đếm ngược giờ</h2><p className="text-muted">Dùng cho bài tập, hoạt động nhóm hoặc giờ nghỉ.</p></div>
      {!expanded && !popup && <div className="tool-actions"><Button variant="secondary" onClick={() => setShowLarge(true)}>Phóng to</Button><Button variant="secondary" onClick={() => {
        const child = window.open('/tools/timer', 'kidit-teaching-timer', 'popup=yes,width=680,height=740,resizable=yes,scrollbars=yes');
        if (!child) setError('Trình duyệt đang chặn popup. Bạn có thể dùng nút Phóng to hoặc cho phép cửa sổ bật lên.');
        else { child.focus(); setError(''); }
      }}>Mở popup riêng</Button></div>}
    </div>
    {!synced && <p role="status" className="tool-error">Trình duyệt không cho lưu dữ liệu, đồng hồ chỉ hoạt động trong trang này.</p>}
    <p className={`timer-status ${timer.status === 'finished' ? 'timer-finished' : ''}`} role="status">{statusText[timer.status]}</p>
    <div className={`timer-digits ${remaining <= 30000 && timer.status !== 'idle' ? 'timer-finishing' : ''}`} role="timer" aria-label={`Thời gian còn lại ${formatCountdown(remaining)}`} aria-live="off">{formatCountdown(remaining)}</div>
    <p className="timer-unit-label">phút : giây</p>
    <progress className="timer-progress" max={timer.durationMs} value={Math.max(0, timer.durationMs - remaining)} aria-label="Tiến độ đếm ngược" />
    <div className="timer-controls"><Button onClick={() => action(running ? 'pause' : 'start')}>{running ? 'Tạm dừng' : timer.status === 'paused' ? 'Tiếp tục' : timer.status === 'finished' ? 'Chạy lại' : 'Bắt đầu'}</Button><Button variant="secondary" onClick={() => action('reset')}>Đặt lại</Button><Button variant="secondary" onClick={() => action('add')}>+1 phút</Button></div>
    <form className="timer-settings" onSubmit={event => {
      event.preventDefault();
      try { applyDuration(enteredDuration()); }
      catch (e) { setError(e.message); }
    }}>
      <label>Phút<input className="form-input" type="number" min="0" max="1440" step="1" required disabled={running} value={minutes} onChange={e => setMinutes(e.target.value)} /></label>
      <label>Giây<input className="form-input" type="number" min="0" max="59" step="1" required disabled={running} value={seconds} onChange={e => setSeconds(e.target.value)} /></label>
      <Button type="submit" variant="secondary" disabled={running}>Áp dụng</Button>
    </form>
    <div className="timer-presets" aria-label="Chọn thời gian nhanh">{[1, 3, 5, 10, 15, 30].map(value => <button key={value} disabled={running} onClick={() => applyDuration(value * 60000)}>{value} phút</button>)}</div>
    <div className="timer-sound"><label><input type="checkbox" checked={timer.sound} onChange={async e => { dispatchTimer({ type: 'sound', enabled: e.target.checked }); if (e.target.checked) await enableTimerAudio(); }} /> Bật chuông khi hết giờ</label><button onClick={async () => { if (await enableTimerAudio()) { playTimerAlarm(); setError(''); } else setError('Trình duyệt chưa phát được âm thanh. Đồng hồ vẫn báo hết giờ trên màn hình.'); }}>Thử chuông</button></div>
    {error && <p role="alert" className="tool-error">{error}</p>}
    {popup && <p className="text-muted timer-popup-note">Đồng hồ đồng bộ với trang công cụ. Có thể thu nhỏ cửa sổ hoặc kéo sang màn hình đang trình chiếu.</p>}
    {showLarge && <Modal title="Đồng hồ đếm ngược phóng to" onClose={() => setShowLarge(false)}><div className="timer-large-dialog"><div className="timer-dialog-close"><Button variant="secondary" onClick={() => setShowLarge(false)}>Đóng</Button></div><CountdownTimer expanded /></div></Modal>}
  </section>;
}
