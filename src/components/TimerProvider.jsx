import { useEffect, useState, useSyncExternalStore } from 'react';
import { remainingTime } from '../../shared/teaching-tools';
import { dispatchTimer, playTimerAlarmOnce, subscribeTimer, timerCanSync, timerSnapshot } from '../lib/teaching-timer';
import { TimerContext } from '../lib/TimerContext';

export function TimerProvider({ children }) {
  const timer = useSyncExternalStore(subscribeTimer, timerSnapshot);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (timer.status !== 'running') return;
    const tick = () => setNow(Date.now());
    tick();
    const interval = setInterval(tick, 200);
    window.addEventListener('focus', tick);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(interval); window.removeEventListener('focus', tick); document.removeEventListener('visibilitychange', tick); };
  }, [timer.status]);
  const remaining = remainingTime(timer, Math.max(now, Date.now()));
  useEffect(() => {
    if (timer.status === 'running' && remaining === 0) {
      dispatchTimer({ type: 'finish' });
    }
  }, [timer.status, remaining]);
  useEffect(() => {
    if (timer.status === 'finished' && timer.sound && timer.finishedAt && Date.now() - timer.finishedAt < 5000) playTimerAlarmOnce(timer.runId);
  }, [timer.status, timer.sound, timer.finishedAt, timer.runId]);
  return <TimerContext.Provider value={{ timer, remaining, synced: timerCanSync() }}>{children}</TimerContext.Provider>;
}

