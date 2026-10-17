import React, { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CreditCard,
  Calendar,
  UserCheck,
  Menu,
  X,
  Wrench
} from 'lucide-react';
import './MainLayout.css';
import { TimerIndicator } from '../components/CountdownTimer';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/Button';

export function MainLayout() {
  const { user, logout, busy } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches);
  const menuRef = useRef(null);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const changed = () => setMobile(media.matches);
    const escape = e => { if (e.key === 'Escape' && sidebarOpen) { setSidebarOpen(false); menuRef.current?.focus(); } };
    media.addEventListener('change', changed); window.addEventListener('keydown', escape);
    return () => { media.removeEventListener('change', changed); window.removeEventListener('keydown', escape); };
  }, [sidebarOpen]);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/schedule', icon: Calendar, label: 'Thời khóa biểu' },
    { path: '/teachers', icon: UserCheck, label: 'Giáo viên' },
    { path: '/students', icon: Users, label: 'Học sinh' },
    { path: '/classes', icon: GraduationCap, label: 'Lớp học' },
    { path: '/payroll', icon: UserCheck, label: 'Chấm công' },
    { path: '/finance', icon: CreditCard, label: 'Học phí' },
    { path: '/tools', icon: Wrench, label: 'Công cụ hỗ trợ' },
  ];
  if (user.role === 'admin') navItems.push({ path: '/accounts', icon: UserCheck, label: 'Tài khoản' });

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-container">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      {/* Sidebar */}
      <aside id="main-navigation" inert={mobile && !sidebarOpen} className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">KI</div>
          <h2 className="logo-text">KidIT Manager</h2>
          <button aria-label="Đóng menu" className="sidebar-close-btn" onClick={closeSidebar}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header glass-panel">
          <button ref={menuRef} aria-label="Mở menu" aria-expanded={sidebarOpen} aria-controls="main-navigation" className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="header-search">
            <span className="font-medium">Quản lý trung tâm KidIT</span>
          </div>
          <TimerIndicator />
          <div className="account-identity"><span>{user.name} ({user.username})</span><Button variant="ghost" disabled={busy} onClick={logout}>Đăng xuất</Button></div>
        </header>

        <div className="page-wrapper animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
