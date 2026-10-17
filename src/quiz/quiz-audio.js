const CUES = {
  round: [[392, .12], [523.25, .12], [659.25, .22]],
  answer: [[659.25, .09]],
  correct: [[523.25, .12], [659.25, .12], [783.99, .26]],
  incorrect: [[293.66, .16], [220, .24]],
  reveal: [[440, .15], [329.63, .25]],
  tick: [[880, .06]],
  freeze: [[880, .1], [659.25, .1], [440, .2]],
  fire: [[196, .09], [146.83, .11], [98, .22]],
  shield: [[659.25, .12], [987.77, .26]],
  finish: [[523.25, .13], [659.25, .13], [783.99, .13], [1046.5, .4]],
};
const MELODY = [261.63, 0, 329.63, 392, 293.66, 0, 349.23, 440, 329.63, 0, 392, 329.63, 293.66, 0, 261.63, 0];

export function quizSoundSnapshot(room, now) {
  return {
    code: room.code, index: room.index, phase: room.phase, now,
    remaining: Math.max(0, Math.ceil((room.deadline - now) / 1000)),
    choice: room.me?.answer?.choice ?? null, correct: room.me?.answer?.correct,
    team: room.teams.find(team => team.id === room.me?.teamId)?.name,
    host: room.host, events: room.events,
  };
}

export function quizSoundCues(previous, current) {
  if (!previous || previous.code !== current.code) return [];
  const cues = [];
  if (current.phase === 'finished' && previous.phase !== 'finished') return ['finish'];
  if (current.phase === 'question') {
    if (current.index !== previous.index || previous.phase !== 'question') cues.push('round');
    if (current.index === previous.index && previous.choice === null && current.choice !== null) cues.push('answer');
    if (current.remaining > 0 && current.remaining <= 5 && current.remaining !== previous.remaining) cues.push('tick');
  } else if (current.phase === 'reveal' && (previous.phase !== 'reveal' || current.index !== previous.index)) {
    cues.push(current.correct === true ? 'correct' : current.correct === false ? 'incorrect' : 'reveal');
  }
  for (const event of current.events) {
    if (previous.events.some(old => old.id === event.id) || current.now - event.at > 5000 || event.at > current.now + 1000) continue;
    if (!current.host && event.from !== current.team && event.to !== current.team) continue;
    cues.push(event.blocked ? 'shield' : event.skill);
  }
  return [...new Set(cues)];
}

export function createQuizAudio({
  createContext = () => new (window.AudioContext || window.webkitAudioContext)(),
  repeat = (callback, ms) => setInterval(callback, ms),
  cancelRepeat = id => clearInterval(id),
} = {}) {
  let context;
  let master;
  let musicTimer = null;
  let disposed = false;
  const voices = new Map();
  const silence = kind => {
    for (const [oscillator, voice] of voices) {
      if (kind && voice.kind !== kind) continue;
      try { oscillator.stop(); } catch { /* A scheduled voice may already have ended. */ }
      oscillator.disconnect(); voice.envelope.disconnect(); voices.delete(oscillator);
    }
  };
  const stopMusic = () => {
    if (musicTimer !== null) cancelRepeat(musicTimer);
    musicTimer = null; silence('music');
  };
  const tone = (frequency, duration, delay, kind, type = 'sine') => {
    if (!context || context.state !== 'running' || disposed) return;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, start);
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(kind === 'music' ? .035 : .13, start + .008);
    envelope.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(envelope); envelope.connect(master);
    voices.set(oscillator, { envelope, kind });
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); voices.delete(oscillator); };
    oscillator.start(start); oscillator.stop(start + duration + .02);
  };
  return {
    async enable() {
      if (disposed) return false;
      try {
        if (!context) { context = createContext(); master = context.createGain(); master.gain.value = .35; master.connect(context.destination); }
        if (context.state !== 'running') await context.resume();
        return !disposed && context.state === 'running';
      } catch { return false; }
    },
    isRunning: () => context?.state === 'running' && !disposed,
    setVolume(value) { if (master) master.gain.setTargetAtTime(Math.max(0, Math.min(1, value)), context.currentTime, .02); },
    play(cue) {
      let delay = 0;
      for (const [frequency, duration] of CUES[cue] || []) {
        tone(frequency, duration, delay, 'cue', cue === 'fire' ? 'triangle' : 'sine');
        delay += duration + .025;
      }
    },
    startMusic(remainingMs) {
      stopMusic();
      if (!context || context.state !== 'running' || remainingMs <= 0 || disposed) return;
      const until = context.currentTime + remainingMs / 1000;
      let beat = 0;
      const step = () => {
        if (context.currentTime >= until || context.state !== 'running') { stopMusic(); return; }
        const frequency = MELODY[beat++ % MELODY.length];
        if (frequency) tone(frequency, .18, 0, 'music');
      };
      step(); musicTimer = repeat(step, 480);
    },
    stopMusic,
    silence() { stopMusic(); silence(); },
    dispose() {
      disposed = true; stopMusic(); silence();
      if (context && context.state !== 'closed') context.close().catch(() => {});
    },
  };
}
