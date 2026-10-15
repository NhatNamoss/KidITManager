import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { TeachingSessions } from '../components/TeachingSessions';
import { api, jsonBody, localDate } from '../lib/api';
import './ClassDetail.css';

export function ClassDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [date, setDate] = useState(localDate());
  const [attendance, setAttendance] = useState({});
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [studentId, setStudentId] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setData(null); setError('');
    Promise.all([api(`/api/classes/${id}`, { signal: controller.signal }), api(`/api/classes/${id}/students`, { signal: controller.signal }), api('/api/students', { signal: controller.signal })])
      .then(([cls, students, allStudents]) => setData({ cls, students, allStudents }))
      .catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [id, reload]);
  useEffect(() => {
    const controller = new AbortController(); setAttendance({}); setLoadingAttendance(true);
    api(`/api/classes/${id}/attendance?date=${date}`, { signal: controller.signal })
      .then(rows => setAttendance(Object.fromEntries(rows.map(r => [r.student_id, r.status]))))
      .catch(e => { if (!controller.signal.aborted) setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoadingAttendance(false); });
    return () => controller.abort();
  }, [id, date, reload]);
  const act = async action => {
    setBusy(true); setError('');
    try { await action(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <div className="class-detail-page">
    <Link className="back-link text-primary mb-4" to="/classes">Quay lại danh sách lớp</Link>
    {error && <div role="alert" className="feedback-error">{error} <button onClick={() => setReload(n => n + 1)}>Thử lại</button></div>}
    {!data ? !error && <p role="status">Đang tải thông tin lớp...</p> : <>
      <h1 className="text-h1">{data.cls.name}</h1><p className="text-muted mt-2">Phân công mặc định: {data.cls.teacher || 'Chưa có giáo viên'}{data.cls.ta ? ` · Trợ giảng: ${data.cls.ta}` : ''} · Phòng: {data.cls.room || 'Chưa xếp'}</p>
      <TeachingSessions key={id} classInfo={data.cls} />
      <section className="glass-panel p-6"><div className="session-heading"><div><h2 className="text-h2">Điểm danh học sinh theo ngày</h2><p className="text-muted">Phần học sinh vẫn theo ngày; công giảng dạy được lưu riêng theo từng buổi ở trên.</p></div>
        <label>Ngày điểm danh<input aria-label="Ngày điểm danh học sinh" type="date" className="form-input" value={date} disabled={busy} onChange={e => { if (e.target.value) setDate(e.target.value); }} /></label></div>
        {loadingAttendance && <p role="status">Đang tải điểm danh...</p>}
        <div className="enrolled-list mt-4">{data.students.map(student => <div className="enrolled-item" key={student.id}>
          <div className="enrolled-info"><strong>{student.name}</strong><p className="text-muted">{attendance[student.id] === 'present' ? 'Có mặt' : attendance[student.id] === 'absent' ? 'Vắng mặt' : 'Chưa điểm danh'}</p></div>
          <div className="student-actions"><Button variant={attendance[student.id] === 'present' ? 'primary' : 'secondary'} disabled={busy || loadingAttendance} onClick={() => act(async () => {
            await api(`/api/classes/${id}/attendance`, jsonBody({ date, student_id: student.id, status: 'present' })); setAttendance(a => ({ ...a, [student.id]: 'present' }));
          })}>Có mặt</Button>
          <Button variant={attendance[student.id] === 'absent' ? 'primary' : 'secondary'} disabled={busy || loadingAttendance} onClick={() => act(async () => {
            await api(`/api/classes/${id}/attendance`, jsonBody({ date, student_id: student.id, status: 'absent' })); setAttendance(a => ({ ...a, [student.id]: 'absent' }));
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
