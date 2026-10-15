import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { api } from '../lib/api';

export function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([api('/api/dashboard/stats', { signal: controller.signal }), api('/api/classes', { signal: controller.signal })])
      .then(([stats, classes]) => setData({ stats, classes })).catch(e => { if (!controller.signal.aborted) setError(e.message); });
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => { controller.abort(); clearInterval(timer); };
  }, []);
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const part = type => parts.find(p => p.type === type)?.value;
  const day = { Mon: 'Thứ 2', Tue: 'Thứ 3', Wed: 'Thứ 4', Thu: 'Thứ 5', Fri: 'Thứ 6', Sat: 'Thứ 7', Sun: 'Chủ nhật' }[part('weekday')];
  const currentMinutes = Number(part('hour')) * 60 + Number(part('minute'));
  const upcoming = (data?.classes || []).flatMap(cls => (cls.schedule || '').split(', ').flatMap(slot => {
    const match = slot.match(/(.+) \((\d{2}:\d{2}) - (\d{2}:\d{2})\)/);
    if (!match || match[1] !== day) return [];
    const minutes = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
    if (minutes(match[3]) <= currentMinutes) return [];
    return [{ ...cls, start: match[2], end: match[3], active: minutes(match[2]) <= currentMinutes }];
  })).sort((a, b) => a.start.localeCompare(b.start));
  return <div className="dashboard"><div className="page-header"><h1 className="text-h1">Tổng quan</h1><p className="text-muted mt-2">{now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} · Giờ Việt Nam</p></div>
    {error && <p role="alert" className="feedback-error">{error}</p>}
    {!data && !error && <p role="status">Đang tải tổng quan...</p>}
    {data && <><div className="stats-grid">{[
      ['Tổng học sinh', data.stats.totalStudents], ['Lớp hiện có', data.stats.totalClasses], ['Học phí đã thu', new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.stats.revenue)]
    ].map(([label, value]) => <div className="stat-card glass-panel" key={label}><div><p className="text-muted">{label}</p><h2 className="text-h2">{value}</h2></div></div>)}</div>
    <div className="dashboard-content grid-2"><section className="dashboard-card glass-panel"><h2 className="text-h3 mb-4">Lớp đang hoặc sắp học hôm nay</h2><p className="text-muted mb-4">Theo lịch mặc định. Người dạy thực tế được ghi ở từng buổi.</p>
      {upcoming.length ? upcoming.map(cls => <Link key={`${cls.id}-${cls.start}`} to={`/classes/${cls.id}`} className="class-item"><strong>{cls.start}–{cls.end}</strong><div><h3>{cls.name}</h3><p className="text-muted">{cls.teacher || 'Chưa phân công'}</p></div><span>{cls.active ? 'Đang học' : 'Sắp bắt đầu'}</span></Link>) : <p className="text-muted">Không còn lớp theo lịch trong hôm nay.</p>}
    </section><section className="dashboard-card glass-panel"><h2 className="text-h3 mb-4">Ghi nhận công giảng dạy</h2><p>Vào lớp học để ghi buổi dạy và chọn người thực tế đứng lớp. Đối chiếu buổi đã xác nhận trong bảng công trước khi phát lương.</p><p className="mt-4"><Link className="text-primary" to="/classes">Mở danh sách lớp</Link></p><p className="mt-4"><Link className="text-primary" to="/payroll">Xem bảng công tháng</Link></p></section></div></>}
  </div>;
}
