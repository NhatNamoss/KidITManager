export const DEFAULT_TIMER = { durationMs: 300000, remainingMs: 300000, endsAt: null, status: 'idle', sound: true, runId: '', finishedAt: null };
const MAX_TIMER_MS = 24 * 60 * 60 * 1000;

export function remainingTime(timer, now = Date.now()) {
  return Math.max(0, timer.status === 'running' ? timer.endsAt - now : timer.remainingMs);
}

export function formatCountdown(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function validTimer(timer) {
  return timer && Number.isInteger(timer.durationMs) && timer.durationMs >= 1000 && timer.durationMs <= MAX_TIMER_MS &&
    Number.isInteger(timer.remainingMs) && timer.remainingMs >= 0 && timer.remainingMs <= MAX_TIMER_MS &&
    ['idle', 'running', 'paused', 'finished'].includes(timer.status) && typeof timer.sound === 'boolean' && typeof timer.runId === 'string' &&
    (timer.finishedAt == null || Number.isFinite(timer.finishedAt)) &&
    (timer.status !== 'running' || (Number.isFinite(timer.endsAt) && timer.endsAt > 0 && timer.endsAt <= Date.now() + MAX_TIMER_MS));
}

export function changeTimer(timer, action, now = Date.now()) {
  const remaining = remainingTime(timer, now);
  switch (action.type) {
    case 'duration':
      if (!Number.isInteger(action.ms) || action.ms < 1000 || action.ms > MAX_TIMER_MS) throw new Error('Thời gian từ 1 giây đến 24 giờ.');
      return { ...timer, durationMs: action.ms, remainingMs: action.ms, endsAt: null, status: 'idle', runId: '', finishedAt: null };
    case 'start': {
      if (timer.status === 'running' && remaining > 0) return timer;
      const ms = remaining || timer.durationMs;
      return { ...timer, remainingMs: ms, endsAt: now + ms, status: 'running', runId: timer.status === 'paused' ? timer.runId : action.runId || String(now), finishedAt: null };
    }
    case 'pause':
      return timer.status !== 'running' ? timer : { ...timer, remainingMs: remaining, endsAt: null, status: remaining ? 'paused' : 'finished', finishedAt: remaining ? null : now };
    case 'reset':
      return { ...timer, remainingMs: timer.durationMs, endsAt: null, status: 'idle', runId: '', finishedAt: null };
    case 'add': {
      const ms = Math.min(MAX_TIMER_MS, remaining + 60000);
      return { ...timer, durationMs: timer.status === 'finished' ? ms : Math.min(MAX_TIMER_MS, timer.durationMs + 60000), remainingMs: ms,
        endsAt: timer.status === 'running' ? now + ms : null, status: timer.status === 'finished' ? 'idle' : timer.status, finishedAt: null };
    }
    case 'sound': return { ...timer, sound: Boolean(action.enabled) };
    case 'finish':
      return timer.status === 'running' && remaining === 0 ? { ...timer, remainingMs: 0, endsAt: null, status: 'finished', finishedAt: now } : timer;
    default: return timer;
  }
}

export function parseNames(text) {
  const seen = new Set();
  return text.split(/\r?\n/).map(name => name.trim()).filter(name => {
    const key = name.normalize('NFC').toLocaleLowerCase('vi');
    if (!key || seen.has(key)) return false;
    seen.add(key); return true;
  });
}

export function shuffleNames(names, random = Math.random) {
  const shuffled = [...names];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function makeGroups(names, count, random = Math.random) {
  if (!Number.isInteger(count) || count < 1 || count > names.length || count > 20) throw new Error('Số nhóm từ 1 đến số học sinh, tối đa 20 nhóm.');
  const groups = Array.from({ length: count }, () => []);
  shuffleNames(names, random).forEach((name, index) => groups[index % count].push(name));
  return groups;
}
