import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  CreditCard,
  Settings,
  LogOut,
  Calendar,
  UserCheck,
  Menu,
  X
} from 'lucide-react';
import './MainLayout.css';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/schedule', icon: Calendar, label: 'Thời khóa biểu' },
    { path: '/teachers', icon: UserCheck, label: 'Giáo viên' },
    { path: '/students', icon: Users, label: 'Học sinh' },
    { path: '/classes', icon: GraduationCap, label: 'Lớp học' },
    { path: '/courses', icon: BookOpen, label: 'Khóa học' },
    { path: '/finance', icon: CreditCard, label: 'Học phí' },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-container">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">KI</div>
          <h2 className="logo-text">KidIT Manager</h2>
          <button className="sidebar-close-btn" onClick={closeSidebar}>
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

        <div className="sidebar-footer">
          <button className="nav-item">
            <Settings size={20} />
            <span>Cài đặt</span>
          </button>
          <button className="nav-item text-danger" style={{ color: 'var(--color-danger)' }}>
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header glass-panel">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="header-search">
            <input type="text" placeholder="Tìm kiếm học sinh, lớp học..." className="search-input" />
          </div>
          <div className="header-user">
            <div className="user-avatar">A</div>
            <div className="user-info">
              <p className="user-name">Admin</p>
              <p className="user-role">Quản lý</p>
            </div>
          </div>
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
