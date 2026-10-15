import { useEffect, useId, useRef, useState } from 'react';
import './DateFields.css';

function dateParts(value) {
  const [year = '', month = '', day = ''] = value.split('-');
  return { day, month, year };
}

function isoDate(parts) {
  if (!/^\d{1,2}$/.test(parts.day) || !/^\d{1,2}$/.test(parts.month) || !/^\d{4}$/.test(parts.year) || Number(parts.year) < 1000) return '';
  const value = `${parts.year}-${parts.month.padStart(2, '0')}-${parts.day.padStart(2, '0')}`;
  const time = Date.parse(value);
  return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value ? value : '';
}

export function DateFields({ value, onChange, label, disabled = false }) {
  const id = useId();
  const dayRef = useRef(null);
  const [parts, setParts] = useState(() => dateParts(value));
  const valid = Boolean(isoDate(parts));
  const complete = parts.day && parts.month && parts.year.length === 4;
  useEffect(() => { if (value) setParts(current => isoDate(current) === value ? current : dateParts(value)); }, [value]);
  useEffect(() => { dayRef.current?.setCustomValidity(valid ? '' : 'Vui lòng nhập ngày, tháng, năm hợp lệ.'); }, [valid]);
  const change = (field, text) => {
    const next = { ...parts, [field]: text.replace(/\D/g, '') };
    setParts(next); onChange(isoDate(next));
  };
  return <fieldset className="date-fields" disabled={disabled}>
    <legend>{label}</legend>
    <div className="date-fields-row">{[['day', 'Ngày', 'DD', 2], ['month', 'Tháng', 'MM', 2], ['year', 'Năm', 'YYYY', 4]].map(([field, title, placeholder, length]) => <label key={field} htmlFor={`${id}-${field}`}>
      <span>{title}</span><input ref={field === 'day' ? dayRef : undefined} id={`${id}-${field}`} aria-label={`${title} - ${label}`} aria-describedby={!valid && complete ? `${id}-error` : undefined} aria-invalid={Boolean(!valid && complete)} className="form-input" type="text" inputMode="numeric" pattern={field === 'year' ? '[0-9]{4}' : '[0-9]{1,2}'} maxLength={length} placeholder={placeholder} required value={parts[field]} onChange={e => change(field, e.target.value)} />
    </label>)}</div>
    {!valid && complete && <p id={`${id}-error`} role="alert" className="date-fields-error">Ngày không hợp lệ. Vui lòng kiểm tra lại.</p>}
  </fieldset>;
}
