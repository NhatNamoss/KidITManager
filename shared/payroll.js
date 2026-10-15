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
