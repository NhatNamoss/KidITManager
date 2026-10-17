import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createQuizAudio, quizSoundCues, quizSoundSnapshot } from '../src/quiz/quiz-audio.js';

const room = (patch = {}) => ({ code: '123456', index: 0, phase: 'question', deadline: 20000, teams: [{ id: 0, name: 'Đội 1' }, { id: 1, name: 'Đội 2' }], events: [], me: { teamId: 0, answer: null }, ...patch });
const snapshot = (patch = {}, now = 10000) => quizSoundSnapshot(room(patch), now);

test('round audio follows transitions, hides correctness until reveal and never repeats for polling snapshots', () => {
  const initial = snapshot();
  assert.deepEqual(quizSoundCues(null, initial), []);
  assert.deepEqual(quizSoundCues(initial, snapshot()), []);
  assert.deepEqual(quizSoundCues(snapshot({ phase: 'lobby', index: -1 }), initial), ['round']);
  const answered = snapshot({ me: { teamId: 0, answer: { choice: 2 } } });
  assert.deepEqual(quizSoundCues(initial, answered), ['answer']);
  assert.deepEqual(quizSoundCues(answered, answered), []);
  const correct = snapshot({ phase: 'reveal', me: { teamId: 0, answer: { choice: 2, correct: true } } });
  assert.deepEqual(quizSoundCues(answered, correct), ['correct']);
  assert.deepEqual(quizSoundCues(correct, correct), []);
  assert.deepEqual(quizSoundCues(answered, snapshot({ phase: 'reveal', me: { teamId: 0, answer: { choice: 2, correct: false } } })), ['incorrect']);
  assert.deepEqual(quizSoundCues(initial, snapshot({ phase: 'reveal' })), ['reveal']);
  assert.deepEqual(quizSoundCues(correct, snapshot({ index: 1 })), ['round']);
  const finished = snapshot({ phase: 'finished' });
  assert.deepEqual(quizSoundCues(initial, finished), ['finish']);
  assert.deepEqual(quizSoundCues(finished, finished), []);
  assert.deepEqual(quizSoundCues(initial, { ...initial, code: '654321' }), []);
});

test('last-five-second ticks follow server time without replaying skipped seconds or expired countdowns', () => {
  const six = snapshot({}, 14000);
  const five = snapshot({}, 15000);
  assert.deepEqual(quizSoundCues(six, five), ['tick']);
  assert.deepEqual(quizSoundCues(five, snapshot({}, 15400)), []);
  const two = snapshot({}, 18000);
  assert.deepEqual(quizSoundCues(five, two), ['tick']);
  assert.deepEqual(quizSoundCues(two, snapshot({}, 20500)), []);
  assert.deepEqual(quizSoundCues(two, snapshot({ phase: 'reveal' }, 19000)), ['reveal']);
});

test('skill sounds only announce fresh events involving the player team; shields have their own cue', () => {
  const before = snapshot();
  const event = { id: 'a', at: 10000, from: 'Đội 2', to: 'Đội 1', skill: 'freeze', blocked: false };
  const hit = snapshot({ events: [event] }, 11000);
  assert.deepEqual(quizSoundCues(before, hit), ['freeze']);
  assert.deepEqual(quizSoundCues(hit, snapshot({ events: [event] }, 11200)), []);
  assert.deepEqual(quizSoundCues(before, snapshot({ events: [{ ...event, blocked: true }] })), ['shield']);
  assert.deepEqual(quizSoundCues(before, snapshot({ events: [{ ...event, skill: 'fire' }] })), ['fire']);
  assert.deepEqual(quizSoundCues(before, snapshot({ events: [event], deadline: 30000 }, 16000)), []);
  assert.deepEqual(quizSoundCues(before, snapshot({ events: [{ ...event, at: 20000 }] })), []);
  const unrelated = { ...event, from: 'Đội 3', to: 'Đội 4' };
  assert.deepEqual(quizSoundCues(before, snapshot({ events: [unrelated] })), []);
  assert.deepEqual(quizSoundCues(before, snapshot({ host: true, me: null, events: [unrelated] })), ['freeze']);
});

function fakeAudio() {
  const nodes = [], intervals = new Map();
  let timerId = 0, created = 0, closed = 0;
  const parameter = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime(value) { this.value = value; } });
  const context = {
    state: 'suspended', currentTime: 10, destination: {},
    createGain() { const node = { gain: parameter(), connect() {}, disconnect() { this.disconnected = true; } }; nodes.push(node); return node; },
    createOscillator() { const node = { frequency: parameter(), starts: [], stops: [], connect() {}, start(time) { this.starts.push(time); }, stop(time) { this.stops.push(time); }, disconnect() { this.disconnected = true; } }; nodes.push(node); return node; },
    async resume() { this.state = 'running'; },
    async close() { closed++; this.state = 'closed'; },
  };
  const audio = createQuizAudio({ createContext: () => { created++; return context; }, repeat: callback => { const id = ++timerId; intervals.set(id, callback); return id; }, cancelRepeat: id => intervals.delete(id) });
  return { audio, context, nodes, intervals, get created() { return created; }, get closed() { return closed; } };
}

test('audio waits for activation, stops all scheduled voices on mute and releases its context on leaving', async () => {
  const f = fakeAudio();
  f.audio.play('round'); f.audio.startMusic(10000);
  assert.equal(f.created, 0); assert.equal(f.nodes.length, 0);
  assert.equal(await f.audio.enable(), true);
  assert.equal(f.audio.isRunning(), true);
  f.audio.setVolume(9); assert.equal(f.nodes[0].gain.value, 1);
  f.audio.setVolume(-2); assert.equal(f.nodes[0].gain.value, 0);
  f.audio.setVolume(.35); assert.equal(f.nodes[0].gain.value, .35);
  f.audio.play('finish');
  assert.equal(f.nodes.filter(n => n.starts).length, 4);
  f.audio.startMusic(10000); assert.equal(f.intervals.size, 1);
  f.audio.silence(); assert.equal(f.intervals.size, 0);
  assert.ok(f.nodes.filter(n => n.starts).every(n => n.stops.includes(undefined) && n.disconnected));
  assert.equal(await f.audio.enable(), true); assert.equal(f.created, 1);
  f.audio.dispose(); f.audio.dispose();
  assert.equal(f.closed, 1); assert.equal(f.audio.isRunning(), false);
  const count = f.nodes.length;
  f.audio.play('fire'); f.audio.startMusic(10000);
  assert.equal(await f.audio.enable(), false); assert.equal(f.nodes.length, count);
});

test('round music ends at its deadline or browser suspension, and a denied audio context fails gracefully', async () => {
  const f = fakeAudio(); await f.audio.enable();
  f.audio.startMusic(3000); const callback = [...f.intervals.values()][0];
  f.context.currentTime = 13.1; callback(); assert.equal(f.intervals.size, 0);
  f.audio.startMusic(5000); f.context.state = 'suspended';
  [...f.intervals.values()][0](); assert.equal(f.intervals.size, 0);
  f.audio.dispose();
  const denied = createQuizAudio({ createContext: () => { throw new Error('unsupported'); } });
  assert.equal(await denied.enable(), false);
  assert.doesNotThrow(() => { denied.play('round'); denied.silence(); denied.dispose(); });
});
