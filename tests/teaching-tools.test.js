import { test } from 'node:test';
import assert from 'node:assert/strict';
import { changeTimer, DEFAULT_TIMER, formatCountdown, makeGroups, parseNames, remainingTime, shuffleNames, validTimer } from '../shared/teaching-tools.js';

test('countdown follows its deadline across delayed ticks, pauses and resumes', () => {
  const idle = changeTimer(DEFAULT_TIMER, { type: 'duration', ms: 5000 }, 1000);
  const running = changeTimer(idle, { type: 'start', runId: 'test-run' }, 1000);
  assert.equal(running.endsAt, 6000);
  assert.equal(remainingTime(running, 3400), 2600);
  assert.equal(remainingTime(running, 99000), 0);
  const paused = changeTimer(running, { type: 'pause' }, 3000);
  assert.equal(remainingTime(paused, 100000), 3000);
  const resumed = changeTimer(paused, { type: 'start' }, 100000);
  assert.equal(resumed.endsAt, 103000); assert.equal(resumed.runId, 'test-run');
  const extended = changeTimer(resumed, { type: 'add' }, 101000);
  assert.equal(remainingTime(extended, 101000), 62000);
  const finished = changeTimer(extended, { type: 'finish' }, 200000);
  assert.equal(finished.status, 'finished'); assert.equal(finished.remainingMs, 0);
  assert.equal(finished.finishedAt, 200000);
  assert.equal(changeTimer(finished, { type: 'finish' }, 200001), finished);
  const reset = changeTimer(finished, { type: 'reset' }, 200002);
  assert.equal(reset.status, 'idle'); assert.equal(reset.remainingMs, 65000);
  const addedAfterFinish = changeTimer(finished, { type: 'add' }, 200002);
  assert.equal(addedAfterFinish.durationMs, 60000); assert.equal(addedAfterFinish.remainingMs, 60000); assert.equal(addedAfterFinish.status, 'idle');
  assert.equal(DEFAULT_TIMER.durationMs, 300000);
});

test('timer formatting and saved-state validation handle boundaries and corrupt data', () => {
  assert.equal(formatCountdown(1), '00:01'); assert.equal(formatCountdown(60001), '01:01'); assert.equal(formatCountdown(0), '00:00');
  assert.equal(formatCountdown(7200000), '120:00');
  assert.equal(Boolean(validTimer(null)), false); assert.equal(validTimer(DEFAULT_TIMER), true);
  assert.equal(validTimer({ ...DEFAULT_TIMER, remainingMs: -1 }), false);
  assert.equal(validTimer({ ...DEFAULT_TIMER, status: 'running', endsAt: Infinity }), false);
  for (const ms of [0, -1000, 86400001, NaN]) assert.throws(() => changeTimer(DEFAULT_TIMER, { type: 'duration', ms }));
});

test('rosters ignore empty and repeated lines but preserve distinct student IDs', () => {
  assert.deepEqual(parseNames(' An \n\nBình\r\nan\n An (#1)\nAn (#2)\n'), ['An', 'Bình', 'An (#1)', 'An (#2)']);
  assert.deepEqual(parseNames(''), []);
});

test('random grouping preserves every student once and balances group sizes', () => {
  const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const original = [...names];
  const groups = makeGroups(names, 3, () => .25);
  assert.deepEqual(groups.flat().sort(), [...names].sort());
  assert.deepEqual(groups.map(g => g.length), [3, 2, 2]);
  assert.deepEqual(names, original);
  assert.equal(new Set(shuffleNames(names)).size, names.length);
  assert.throws(() => makeGroups(names, 0)); assert.throws(() => makeGroups(names, 8)); assert.throws(() => makeGroups([], 1));
});
