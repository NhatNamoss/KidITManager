import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { TeachingSessions } from '../components/TeachingSessions';
import { AttendanceDatePicker } from '../components/AttendanceDatePicker';
import { isScheduledAttendanceDate } from '../../shared/class-schedule';
import { CLASS_SCHEDULE_STORAGE_KEY } from '../lib/class-events';
import { api, jsonBody, localDate } from '../lib/api';
import './ClassDetail.css';

export function ClassDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [date, setDate] = useState(localDate());
  const [attendance, setAttendance] = useState({});
  const [loadedAttendanceKey, setLoadedAttendanceKey] = useState('');
  const [attendanceError, setAttendanceError] = useState('');
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [studentId, setStudentId] = useState('');
  const [reload, setReload] = useState(0);
  const [attendanceReload, setAttendanceReload] = useState(0);
  const schedule = data?.cls.schedule || '';
  const availableDate = String(data?.cls.id) === id && isScheduledAttendanceDate(schedule, date) ? date : '';
  const attendanceKey = `${id}:${availableDate}`;
  const attendanceReady = Boolean(availableDate) && loadedAttendanceKey === attendanceKey;
  const displayedAttendance = attendanceReady ? attendance : {};
  const refreshClass = useCallback(async () => {
    try {
      const cls = await api(`/api/classes/${id}`);
      setData(current => String(current?.cls.id) === id ? { ...current, cls } : current);
    } catch (e) { setError(e.message); }
  }, [id]);
  useEffect(() => {
    const visible = () => { if (document.visibilityState === 'visible') refreshClass(); };
    const storage = e => { if (e.key === CLASS_SCHEDULE_STORAGE_KEY) refreshClass(); };
    window.addEventListener('focus', refreshClass);
    window.addEventListener('class-schedule-updated', refreshClass);
    window.addEventListener('storage', storage);
    document.addEventListener('visibilitychange', visible);
    return () => {
      window.removeEventListener('focus', refreshClass);
      window.removeEventListener('class-schedule-updated', refreshClass);
      window.removeEventListener('storage', storage);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [refreshClass]);
  useEffect(() => {
    const controller = new AbortController(); setData(null); setError('');
    Promise.all([api(`/api/classes/${id}`, { signal: controller.signal }), api(`/api/classes/${id}/students`, { signal: controller.signal }), api('/api/students', { signal: controller.signal })])
      .then(([cls, students, allStudents]) => setData({ cls, students, allStudents }))
      .catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [id, reload]);
  useEffect(() => {
    const controller = new AbortController(); setAttendance({}); setLoadedAttendanceKey(''); setAttendanceError(''); setLoadingAttendance(true);
    if (!availableDate) { setLoadingAttendance(false); return () => controller.abort(); }
    api(`/api/classes/${id}/attendance?date=${availableDate}`, { signal: controller.signal })
      .then(rows => { if (!controller.signal.aborted) { setAttendance(Object.fromEntries(rows.map(r => [r.student_id, r.status]))); setLoadedAttendanceKey(`${id}:${availableDate}`); } })
      .catch(e => { if (!controller.signal.aborted) { setAttendanceError(e.message); if (e.status === 409) refreshClass(); } })
      .finally(() => { if (!controller.signal.aborted) setLoadingAttendance(false); });
    return () => controller.abort();
  }, [id, availableDate, reload, attendanceReload, schedule, refreshClass]);
  const act = async action => {
    setBusy(true); setError('');
    try { await action(); } catch (e) { setError(e.message); if (e.status === 409) await refreshClass(); } finally { setBusy(false); }
  };
  return <div className="class-detail-page">
    <Link className="back-link text-primary mb-4" to="/classes">Quay lại danh sách lớp</Link>
    {error && <div role="alert" className="feedback-error">{error} <button onClick={() => setReload(n => n + 1)}>Thử lại</button></div>}
    {!data ? !error && <p role="status">Đang tải thông tin lớp...</p> : <>
      <h1 className="text-h1">{data.cls.name}</h1><p className="text-muted mt-2">Phân công mặc định: {data.cls.teacher || 'Chưa có giáo viên'}{data.cls.ta ? ` · Trợ giảng: ${data.cls.ta}` : ''} · Phòng: {data.cls.room || 'Chưa xếp'}</p>
      <TeachingSessions key={id} classInfo={data.cls} />
      <section className="glass-panel p-6"><div className="session-heading"><div><h2 className="text-h2">Điểm danh học sinh theo ngày</h2><p className="text-muted">Chỉ hiện ngày có học theo lịch lớp, từ 01/10/2026 (thứ Năm). Danh sách tự cập nhật khi sửa lịch.</p><p className="text-muted mt-2">Lịch lớp: {schedule || 'Chưa xếp lịch'}</p></div>
        <AttendanceDatePicker key={id} schedule={schedule} value={date} disabled={busy} onChange={setDate} /></div>
        {attendanceError && <p role="alert" className="feedback-error">{attendanceError} <button onClick={() => setReload(n => n + 1)}>Thử lại</button></p>}
        {loadingAttendance && <p role="status">Đang tải điểm danh...</p>}
        <div className="enrolled-list mt-4">{data.students.map(student => <div className="enrolled-item" key={student.id}>
          <div className="enrolled-info"><strong>{student.name}</strong><p className="text-muted">{!availableDate ? 'Chọn ngày có học để điểm danh' : displayedAttendance[student.id] === 'present' ? 'Có mặt' : displayedAttendance[student.id] === 'absent' ? 'Vắng mặt' : 'Chưa điểm danh'}</p></div>
          <div className="student-actions"><Button variant={displayedAttendance[student.id] === 'present' ? 'primary' : 'secondary'} disabled={busy || loadingAttendance || !attendanceReady} onClick={() => act(async () => {
            await api(`/api/classes/${id}/attendance`, jsonBody({ date: availableDate, student_id: student.id, status: 'present' })); setLoadedAttendanceKey(''); setAttendanceReload(n => n + 1);
          })}>Có mặt</Button>
          <Button variant={displayedAttendance[student.id] === 'absent' ? 'primary' : 'secondary'} disabled={busy || loadingAttendance || !attendanceReady} onClick={() => act(async () => {
            await api(`/api/classes/${id}/attendance`, jsonBody({ date: availableDate, student_id: student.id, status: 'absent' })); setLoadedAttendanceKey(''); setAttendanceReload(n => n + 1);
          })}>Vắng</Button>
          <Button variant="ghost" disabled={busy} onClick={() => {
            if (window.confirm(`Bỏ ${student.name} khỏi danh sách lớp? Điểm danh cũ vẫn được giữ.`)) act(async () => { await api(`/api/classes/${id}/students/${student.id}`, { method: 'DELETE' }); setReload(n => n + 1); });
          }}>Bỏ khỏi lớp</Button></div>
        </div>)}{!data.students.length && <p className="empty-message">Chưa có học sinh trong lớp.</p>}</div>
        <h3 className="text-h3 mt-6">Thêm học sinh vào lớp ({data.students.length}/{data.cls.capacity || 'Chưa giới hạn'})</h3>
        <form className="payroll-filters" onSubmit={e => { e.preventDefault(); act(async () => {
          await api(`/api/classes/${id}/students`, jsonBody({ student_id: Number(studentId) })); setStudentId(''); setReload(n => n + 1);
        }); }}><label>Học sinh<select required className="form-input" value={studentId} onChange={e => setStudentId(e.target.value)}><option value="">Chọn học sinh chưa có trong lớp</option>{data.allStudents.filter(s => !data.students.some(es => es.id === s.id)).map(s => <option key={s.id} value={s.id}>{s.name} (#{s.id})</option>)}</select></label><Button type="submit" disabled={busy || !studentId}>Thêm vào lớp</Button></form>
      </section>
    </>}
  </div>;
}
