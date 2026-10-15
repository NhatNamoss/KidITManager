import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import './Finance.css';
import { api } from '../lib/api';
import { Modal } from '../components/Modal';

export function Finance() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [details, setDetails] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ student_id: '', amount: '', status: 'paid' });
  const [stats, setStats] = useState({ revenue: 0, pending: 0, overdue: 0 });

  const fetchData = async () => {
    try {
      setError('');
      const data = await api('/api/invoices');
        setInvoices(data);
        
        let rev = 0, pen = 0, over = 0;
        data.forEach(i => {
          if (i.status === 'paid') rev += Number(i.amount);
          if (i.status === 'pending') pen += Number(i.amount);
          if (i.status === 'overdue') over += Number(i.amount);
        });
        setStats({ revenue: rev, pending: pen, overdue: over });
      setStudents(await api('/api/students'));
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await fetchData();
        setIsModalOpen(false);
        setFormData({ student_id: '', amount: '', status: 'paid' });
      } else { const data = await res.json(); throw new Error(data.error || 'Không lưu được hóa đơn.'); }
    } catch (error) {
      setError(error.message);
    } finally { setSaving(false); }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="finance-page">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-h1">Quản lý Tài chính</h1>
          <p className="text-muted mt-2">Theo dõi học phí, hóa đơn và tình trạng thanh toán của học sinh.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="mr-2" />
          Tạo Hóa đơn
        </Button>
      </div>

      <div className="finance-stats-grid mb-6">
         <div className="stat-card glass-panel">
            <p className="text-muted text-small uppercase tracking-wide">Tổng thu dự kiến</p>
            <h3 className="text-h2 mt-2">{formatCurrency(stats.revenue + stats.pending + stats.overdue)}</h3>
         </div>
         <div className="stat-card glass-panel">
            <p className="text-muted text-small uppercase tracking-wide">Đã thu</p>
            <h3 className="text-h2 text-success mt-2">{formatCurrency(stats.revenue)}</h3>
         </div>
         <div className="stat-card glass-panel">
            <p className="text-muted text-small uppercase tracking-wide">Công nợ</p>
            <h3 className="text-h2 text-danger mt-2">{formatCurrency(stats.pending + stats.overdue)}</h3>
         </div>
      </div>

      {error && <p role="alert" className="feedback-error">{error}</p>}
      <div className="glass-panel table-container">
        <div className="finance-tabs">
          <h2 className="text-h3 p-4">Hóa đơn học phí</h2>
        </div>

        <div className="table-actions">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input aria-label="Tìm hóa đơn" type="search" placeholder="Tìm kiếm hóa đơn, tên học sinh..." className="table-search-input" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-actions">
            <select aria-label="Lọc trạng thái hóa đơn" className="form-input" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Chưa thanh toán</option>
              <option value="overdue">Quá hạn</option>
            </select>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Mã HĐ</th>
              <th>Học sinh</th>
              <th>Số tiền (VNĐ)</th>
              <th>Ngày lập</th>
              <th>Trạng thái</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-4">Chưa có hóa đơn nào</td></tr>
            ) : invoices.filter(inv => (!statusFilter || inv.status === statusFilter) && `${inv.invoice_code} ${inv.student_name}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))).map((inv) => (
              <tr key={inv.id}>
                <td className="font-medium text-primary">{inv.invoice_code}</td>
                <td>{inv.student_name}</td>
                <td className="font-medium">{formatCurrency(inv.amount)}</td>
                <td>{new Date(inv.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <span className={`status-badge ${inv.status}`}>
                    {inv.status === 'paid' && <CheckCircle size={14} className="mr-1" inline="true" />}
                    {inv.status === 'pending' && <Clock size={14} className="mr-1" inline="true" />}
                    {inv.status === 'overdue' && <FileText size={14} className="mr-1" inline="true" />}
                    {inv.status === 'paid' ? 'Đã thu' : inv.status === 'pending' ? 'Chưa thu' : 'Quá hạn'}
                  </span>
                </td>
                <td className="text-right">
                  <button className="action-btn" onClick={() => setDetails(inv)}>Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {details && <Modal title="Chi tiết hóa đơn" onClose={() => setDetails(null)}><div className="modal-content glass-panel"><h2 className="text-h2">{details.invoice_code}</h2><p>{details.student_name}</p><p>{formatCurrency(details.amount)}</p><p>{details.status === 'paid' ? 'Đã thu' : details.status === 'pending' ? 'Chưa thu' : 'Quá hạn'}</p><Button onClick={() => setDetails(null)}>Đóng</Button></div></Modal>}
      {isModalOpen && (
        <Modal title="Tạo hóa đơn" onClose={() => { if (!saving) setIsModalOpen(false); }}>
          <div className="modal-content glass-panel animate-fade-in">
            <h2 className="text-h2 mb-4">Tạo Hóa đơn mới</h2>
            <form onSubmit={handleSubmit} className="form-layout">
              {error && <p role="alert" className="feedback-error">{error}</p>}
              <div className="form-group">
                <label>Chọn Học sinh (*)</label>
                <select 
                  required
                  className="form-input" 
                  value={formData.student_id} 
                  onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                >
                  <option value="">-- Chọn học sinh --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Số tiền (VNĐ) (*)</label>
                <input 
                  required 
                  type="number" 
                  min="1"
                  step="1"
                  className="form-input" 
                  value={formData.amount} 
                  onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select 
                  className="form-input" 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="paid">Đã thu</option>
                  <option value="pending">Chưa thu</option>
                  <option value="overdue">Quá hạn</option>
                </select>
              </div>
              <div className="modal-actions mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu Hóa đơn'}</Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
