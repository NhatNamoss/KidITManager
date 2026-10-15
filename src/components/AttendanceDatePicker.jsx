import { useEffect, useId, useMemo, useState } from 'react';
import { attendanceDatesInMonth, preferredAttendanceDate, weekdayLabel } from '../../shared/class-schedule';
import { localDate } from '../lib/api';
import './DateFields.css';

export function AttendanceDatePicker({ schedule, value, onChange, disabled = false }) {
  const id = useId();
  const initialMonth = value?.slice(0, 7) || (localDate().slice(0, 7) < '2026-10' ? '2026-10' : localDate().slice(0, 7));
  const [month, setMonth] = useState(initialMonth.slice(5));
  const [year, setYear] = useState(initialMonth.slice(0, 4));
  const selectedMonth = `${year}-${month}`;
  const dates = useMemo(() => attendanceDatesInMonth(schedule, selectedMonth), [schedule, selectedMonth]);
  useEffect(() => {
    if (value && dates.includes(value)) return;
    const next = preferredAttendanceDate(dates, localDate());
    if (next !== value) onChange(next);
  }, [dates, value, onChange]);
  const validYear = /^\d{4}$/.test(year) && Number(year) >= 2026;
  const firstMonth = year === '2026' ? 10 : 1;
  return <fieldset className="date-fields attendance-date-picker" disabled={disabled}>
    <legend>Ngày điểm danh học sinh</legend><div className="date-fields-row">
      <label htmlFor={`${id}-day`}><span>Ngày có học</span><select id={`${id}-day`} aria-label="Ngày có học" className="form-input" value={dates.includes(value) ? value : ''} disabled={!dates.length} onChange={e => onChange(e.target.value)}>
        {!dates.length && <option value="">Không có ngày học</option>}
        {dates.map(date => <option key={date} value={date}>{date.slice(8)} · {weekdayLabel(date)}</option>)}
      </select></label>
      <label htmlFor={`${id}-month`}><span>Tháng</span><select id={`${id}-month`} aria-label="Tháng điểm danh" className="form-input" value={month} onChange={e => setMonth(e.target.value)}>
        {Array.from({ length: 13 - firstMonth }, (_, i) => String(i + firstMonth).padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
      </select></label>
      <label htmlFor={`${id}-year`}><span>Năm</span><input id={`${id}-year`} aria-label="Năm điểm danh" type="text" inputMode="numeric" pattern="[0-9]{4}" maxLength="4" className="form-input" value={year} onChange={e => {
        const next = e.target.value.replace(/\D/g, ''); setYear(next);
        if (next === '2026' && Number(month) < 10) setMonth('10');
      }} /></label>
    </div>
    {!validYear && <p role="alert" className="date-fields-error">Nhập năm từ 2026 trở đi.</p>}
    {validYear && !dates.length && <p className="text-muted mt-2">Lớp chưa có lịch học trong tháng này. Hãy cập nhật lịch lớp.</p>}
  </fieldset>;
}
