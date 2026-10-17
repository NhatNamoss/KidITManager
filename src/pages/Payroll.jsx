import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, downloadCsv, localDate } from '../lib/api';
import { Button } from '../components/ui/Button';
import '../components/TeachingSessions.css';
import { summarizeSessionWork } from '../../shared/payroll';

export function Payroll() {
  const [month, setMonth] = useState(localDate().slice(0, 7));
  const [data, setData] = useState({ rows: [], legacy: [] });
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError(''); setData({ rows: [], legacy: [] });
    api(`/api/payroll?month=${month}`, { signal: controller.signal }).then(setData).catch(e => { if (!controller.signal.aborted) setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [month, reload]);
  const people = useMemo(() => Array.from(new Map(data.rows.map(r => [String(r.teacher_id), r.teacher_name])).entries()), [data]);
  const rows = data.rows.filter(r => !teacherId || String(r.teacher_id) === teacherId);
  const summary = summarizeSessionWork(rows);
  const exportRows = () => downloadCsv(`Bang-cong-${month}.csv`, [
    ['Ngày', 'Lớp', 'Bắt đầu', 'Kết thúc', 'Mã nhân sự', 'Người thực tế dạy', 'Vai trò', 'Số công (buổi)', 'Ghi chú', 'Bài học', 'Suất'],
    ...rows.map(r => [r.date, r.class_name, r.start_time, r.end_time, r.teacher_id, r.teacher_name, r.role === 'teacher' ? 'Dạy chính' : 'Trợ giảng', 1, r.notes, r.lesson, r.slot])
  ]);
  return <div className="payroll-page"><h1 className="text-h1">Bảng công giảng dạy</h1>
    <p className="text-muted mt-2">Tổng công công khai cho mọi tài khoản. Giáo viên tự chấm từng suất bằng tài khoản cá nhân tại trang lớp học; mỗi suất đã xác nhận được 1 công. Buổi nháp/hủy không tính công.</p>
    <div className="payroll-filters"><label>Tháng<input type="month" required className="form-input" value={month} onChange={e => { if (e.target.value) { setMonth(e.target.value); setTeacherId(''); } }} /></label>
      <label>Nhân sự<select className="form-input" value={teacherId} onChange={e => setTeacherId(e.target.value)}><option value="">Tất cả nhân sự</option>{people.map(([id, name]) => <option key={id} value={id}>{name} (#{id})</option>)}</select></label>
      <Button onClick={exportRows} disabled={loading || Boolean(error) || !rows.length}>Xuất CSV mở bằng Excel</Button><Button variant="secondary" onClick={() => setReload(n => n + 1)}>Tải lại</Button>
    </div>
    {error && <p role="alert" className="feedback-error">{error}</p>}
    {loading ? <p role="status">Đang tổng hợp công...</p> : !error && <>
      <div className="table-scroll glass-panel"><table className="data-table payroll-summary"><caption>Tổng hợp công tháng {month}</caption><thead><tr><th>Nhân sự</th><th>Vai trò</th><th>Số công (buổi)</th></tr></thead><tbody>
        {summary.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.role === 'teacher' ? 'Dạy chính' : 'Trợ giảng'}</td><td>{s.count}</td></tr>)}
        {!summary.length && <tr><td colSpan="3">Chưa có công đã xác nhận trong tháng này.</td></tr>}
      </tbody></table></div>
      <h2 className="text-h2 mt-6">Chi tiết buổi dạy</h2><div className="table-scroll"><table className="data-table"><thead><tr><th>Ngày / ca dạy</th><th>Lớp</th><th>Người dạy</th><th>Vai trò</th><th>Số công (buổi)</th><th>Ghi chú</th></tr></thead><tbody>
        {rows.map(r => <tr key={`${r.session_id}-${r.teacher_id}`}><td>{r.date}<br />{r.start_time}–{r.end_time}{r.slot && <p>{r.slot}</p>}</td><td><Link className="text-primary" to={`/classes/${r.class_id}`}>{r.class_name}</Link>{r.lesson && <p>Bài học: {r.lesson}</p>}</td><td>{r.teacher_name}</td><td>{r.role === 'teacher' ? 'Dạy chính' : 'Trợ giảng'}</td><td>1</td><td className="session-note-text">{r.notes || 'Không có'}</td></tr>)}
        {!rows.length && <tr><td colSpan="6">Không có buổi dạy đã xác nhận cho bộ lọc này.</td></tr>}
      </tbody></table></div>
      {data.legacy.length > 0 && <details className="mt-6"><summary>Điểm danh cũ cần đối chiếu ({data.legacy.length} dòng, chưa tính vào công)</summary><p className="text-muted">Dữ liệu cũ thiếu giờ dạy. Vào từng lớp ghi buổi dạy có ngày, giờ và người thực tế dạy để xác nhận.</p><ul>{data.legacy.map(r => <li key={r.id}>{r.date} · <Link className="text-primary" to={`/classes/${r.class_id}`}>{r.class_name}</Link> · {r.teacher_name} · {r.role === 'teacher' ? 'Giáo viên' : 'Trợ giảng'} · {r.status === 'present' ? 'Có mặt' : 'Vắng'}</li>)}</ul></details>}
    </>}
  </div>;
}
