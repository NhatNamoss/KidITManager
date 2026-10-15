import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Classes } from './pages/Classes';
import { ClassDetail } from './pages/ClassDetail';
import { Teachers } from './pages/Teachers';
import { Finance } from './pages/Finance';
import { Schedule } from './pages/Schedule';
import { Payroll } from './pages/Payroll';
import { TeachingTools, TimerPopupPage } from './pages/TeachingTools';
import { TimerProvider } from './components/TimerProvider';
import './index.css';

function App() {
  return (
    <TimerProvider><BrowserRouter>
      <Routes>
          <Route path="tools/timer" element={<TimerPopupPage />} />
          <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="students" element={<Students />} />
          <Route path="classes" element={<Classes />} />
          <Route path="classes/:id" element={<ClassDetail />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="tools" element={<TeachingTools />} />
          <Route path="courses" element={<div><h1 className="text-h1">Khóa học</h1><p>Chưa có chức năng quản lý khóa học. Vui lòng sử dụng mục Lớp học.</p></div>} />
          <Route path="finance" element={<Finance />} />
          <Route path="*" element={<div><h1 className="text-h1">Không tìm thấy trang</h1><a href="/">Về tổng quan</a></div>} />
        </Route>
      </Routes>
    </BrowserRouter></TimerProvider>
  );
}

export default App;
