import { changeTimer, DEFAULT_TIMER, validTimer } from '../../shared/teaching-tools';

const KEY = 'kidit-teaching-timer-v1';
const EVENT = 'kidit-teaching-timer-changed';
let cachedRaw = null;
let cachedTimer = DEFAULT_TIMER;
let memoryRaw = null;
let storageAvailable = true;
let audioContext;
let lastAlarmRun = '';

export function timerSnapshot() {
  let raw = memoryRaw;
  if (storageAvailable) {
    try { raw = localStorage.getItem(KEY); }
    catch { storageAvailable = false; }
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try { const value = JSON.parse(raw); cachedTimer = validTimer(value) ? value : DEFAULT_TIMER; }
    catch { cachedTimer = DEFAULT_TIMER; }
  }
  return cachedTimer;
}

export function timerCanSync() { return storageAvailable; }

export function subscribeTimer(callback) {
  const storage = event => { if (event.key === KEY || event.key === null) callback(); };
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', storage);
  return () => { window.removeEventListener(EVENT, callback); window.removeEventListener('storage', storage); };
}

export function dispatchTimer(action) {
  const current = timerSnapshot();
  const next = changeTimer(current, { ...action, runId: action.runId || crypto.randomUUID() });
  if (next === current) return false;
  cachedTimer = next;
  cachedRaw = memoryRaw = JSON.stringify(next);
  if (storageAvailable) {
    try { localStorage.setItem(KEY, cachedRaw); }
    catch { storageAvailable = false; }
  }
  window.dispatchEvent(new Event(EVENT));
  return true;
}

export async function enableTimerAudio() {
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return false;
    audioContext ||= new Audio();
    await audioContext.resume();
    return audioContext.state === 'running';
  } catch { return false; }
}

export function playTimerAlarm() {
  if (audioContext?.state !== 'running') return false;
  for (let index = 0; index < 3; index++) {
    const tone = audioContext.createOscillator();
    const volume = audioContext.createGain();
    const start = audioContext.currentTime + index * .35;
    tone.frequency.value = 880;
    volume.gain.setValueAtTime(0, start);
    volume.gain.linearRampToValueAtTime(.15, start + .02);
    volume.gain.exponentialRampToValueAtTime(.001, start + .22);
    tone.connect(volume); volume.connect(audioContext.destination);
    tone.start(start); tone.stop(start + .25);
    tone.onended = () => { tone.disconnect(); volume.disconnect(); };
  }
  return true;
}

export async function playTimerAlarmOnce(runId) {
  if (!runId || audioContext?.state !== 'running') return;
  const play = () => {
    if (lastAlarmRun === runId) return;
    const current = timerSnapshot();
    if (current.runId !== runId || current.status !== 'finished' || !current.sound) return;
    try {
      if (localStorage.getItem('kidit-timer-alarm-run') === runId) return;
      localStorage.setItem('kidit-timer-alarm-run', runId);
    } catch { /* A local alarm still works when shared browser storage is unavailable. */ }
    lastAlarmRun = runId;
    playTimerAlarm();
  };
  if (navigator.locks?.request) {
    try { await navigator.locks.request('kidit-timer-alarm', play); }
    catch { play(); }
  } else play();
}
