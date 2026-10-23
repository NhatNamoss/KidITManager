import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sessionPay, summarizePay, withSessionPay } from '../shared/payroll.js';

test('the four staffing arrangements pay each person separately', () => {
  for (const [teachers, assistants, teacherPay, total] of [[1, 0, 187500, 187500], [2, 0, 187500, 375000], [1, 1, 125000, 187500], [2, 1, 187500, 437500]]) {
    assert.equal(sessionPay('teacher', teachers, assistants), teacherPay);
    const assistantPay = assistants ? sessionPay('ta', teachers, assistants) : 0;
    if (assistants) assert.equal(assistantPay, 62500);
    assert.equal(teachers * teacherPay + assistants * assistantPay, total);
  }
});

test('invalid or missing staffing never silently contributes salary', () => {
  for (const [teachers, assistants, role] of [[null, null, 'teacher'], [0, 1, 'ta'], [1, 0, 'ta'], [1.5, 1, 'teacher'], [20, 1, 'teacher'], [1, -1, 'teacher'], [1, 1, 'invalid']]) assert.equal(sessionPay(role, teachers, assistants), null);
  assert.deepEqual(summarizePay([{ pay_amount: null }, { pay_amount: 187500 }]), { amount: 187500, missing: 1 });
  assert.equal(withSessionPay({ role: 'teacher', teacher_count: 1, ta_count: 1, status: 'cancelled' }).pay_amount, 0);
  assert.equal(withSessionPay({ role: 'teacher', teacher_count: 1, ta_count: 1, status: 'draft' }).pay_amount, 125000);
});
