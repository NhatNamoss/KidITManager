import { useEffect, useId, useMemo, useState } from 'react';
import { attendanceDatesInMonth, preferredAttendanceDate, weekdayLabel } from '../shared/class-schedule.js';
import { TODAY } from './data';

export default function AttendancePicker({ schedule, value, onChange, label = 'Buổi điểm danh', disabled = false }) {
  const id = useId();
  const initial = value?.slice(0, 7) || TODAY.slice(0, 7);
  const [month, setMonth] = useState(initial.slice(5));
  const [year, setYear] = useState(initial.slice(0, 4));
  const dates = useMemo(() => attendanceDatesInMonth(schedule, `${year}-${month}`), [schedule, year, month]);
  useEffect(() => {
    if (dates.includes(value)) return;
    const next = preferredAttendanceDate(dates, TODAY);
    if (next !== value) onChange(next);
  }, [dates, value, onChange]);
  const validYear = /^\d{4}$/.test(year) && Number(year) >= 2026;
  const firstMonth = year === '2026' ? 10 : 1;
  return <fieldset className="scheduled-date-picker" disabled={disabled}>
    <legend>{label}</legend>
    <div className="scheduled-date-fields">
      <label htmlFor={`${id}-day`}>Ngày có học<select id={`${id}-day`} aria-label="Ngày có học" value={dates.includes(value) ? value : ''} disabled={!dates.length} onChange={e => onChange(e.target.value)}>
        {!dates.length && <option value="">Không có ngày học</option>}
        {dates.map(date => <option key={date} value={date}>{date.slice(8)} · {weekdayLabel(date)}</option>)}
      </select></label>
      <label htmlFor={`${id}-month`}>Tháng<select id={`${id}-month`} aria-label="Tháng điểm danh" value={month} onChange={e => setMonth(e.target.value)}>
        {Array.from({ length: 13 - firstMonth }, (_, i) => String(i + firstMonth).padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
      </select></label>
      <label htmlFor={`${id}-year`}>Năm<input id={`${id}-year`} aria-label="Năm điểm danh" type="text" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={year} onChange={e => {
        const next = e.target.value.replace(/\D/g, ''); setYear(next);
        if (next === '2026' && Number(month) < 10) setMonth('10');
      }} /></label>
    </div>
    {!validYear && <p className="picker-error" role="alert">Nhập năm từ 2026 trở đi.</p>}
    {validYear && !dates.length && !disabled && <p className="picker-help">Lớp chưa có lịch học trong tháng này. Hãy kiểm tra lịch lớp.</p>}
  </fieldset>;
}
