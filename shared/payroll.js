export function staffingCounts(staff = []) {
  return {
    teacher_count: staff.filter(person => person.role === 'teacher').length,
    ta_count: staff.filter(person => person.role === 'ta').length,
  };
}

export function validStaffing(teacherCount, taCount, role) {
  return Number.isInteger(teacherCount) && teacherCount >= 1 && teacherCount <= 20
    && Number.isInteger(taCount) && taCount >= 0 && teacherCount + taCount <= 20
    && (role === 'teacher' || (role === 'ta' && taCount >= 1));
}

export function sessionPay(role, teacherCount, taCount) {
  if (!validStaffing(teacherCount, taCount, role)) return null;
  return (role === 'ta' ? 500000 : teacherCount === 1 && taCount > 0 ? 1000000 : 1500000) / 8;
}

export function withSessionPay(row) {
  const rate = sessionPay(row.role, row.teacher_count, row.ta_count);
  return { ...row, pay_rate: rate, pay_amount: row.status === 'cancelled' ? 0 : rate };
}

export function summarizePay(rows) {
  return rows.reduce((total, row) => ({
    amount: total.amount + (row.pay_amount ?? 0),
    missing: total.missing + (row.pay_amount == null ? 1 : 0),
  }), { amount: 0, missing: 0 });
}

export function summarizeSessionWork(rows) {
  const summary = new Map();
  const counted = new Set();
  for (const row of rows) {
    const attendanceKey = `${row.session_id}-${row.teacher_id}`;
    if (counted.has(attendanceKey)) continue;
    counted.add(attendanceKey);
    const key = `${row.teacher_id}-${row.role}`;
    const item = summary.get(key) || { id: key, name: `${row.teacher_name} (#${row.teacher_id})`, role: row.role, count: 0 };
    item.count++;
    summary.set(key, item);
  }
  return Array.from(summary.values());
}
