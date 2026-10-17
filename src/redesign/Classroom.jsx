import { Check, Circle, Minus } from 'lucide-react';
import { Icon } from './ui';
import './classroom.css';

function Desk({ occupied }) {
  return <svg viewBox="0 0 160 140" aria-hidden="true" focusable="false">
    <ellipse cx="80" cy="121" rx="59" ry="12" className="desk-shadow"/>
    <path d="M65 84v30m30-30v30" className="chair-legs"/>
    <path d="m54 69 27-9 27 9v22l-27 10-27-10Z" className="chair-back"/>
    {occupied && <g className="seated-student">
      <path d="m70 95-2 20 9 3 6-22m5-1 3 20 9-2-2-20" className="student-trousers"/>
      <path d="M58 81q0-26 22-26t22 26v18H58Z" className="student-shirt"/>
      <path d="M75 53v9q5 5 10 0v-9" className="student-skin"/>
      <circle cx="80" cy="39" r="19" className="student-skin"/>
      <path d="M61 40q-5-26 19-25 25 0 19 28l-7-18q-12 10-29 6Z" className="student-hair"/>
      <path d="M73 42h1m12 0h1" className="student-face"/>
      <path d="M76 50q4 3 8 0" className="student-face"/>
    </g>}
    <path d="M31 93v30m98-30v30M79 106v27" className="desk-legs"/>
    <path d="m24 82 55-17 57 17-57 21Z" className="desk-top"/>
    <path d="m24 82 55 21 57-21v8l-57 21-55-21Z" className="desk-edge"/>
    <path d="m51 81 23-7 20 7-23 8Z" className="desk-book"/>
    {occupied && <path d="m60 72 10 8m30-8-10 8" className="student-arms"/>}
  </svg>;
}

export default function Classroom({ students, attendance, disabled, onPresent, onAbsent, className, date }) {
  return <div className="classroom" aria-label={`Mô phỏng phòng học ${className}`}>
    <div className="classroom-guide"><p>Chạm bàn trống để ghi có mặt. Chạm học sinh đang ngồi để ghi vắng.</p><span>Sơ đồ minh họa · chỗ ngồi theo danh sách lớp</span></div>
    <div className="classroom-stage">
      <div className="classroom-board"><small>PHÒNG HỌC KIDIT</small><strong>{className}</strong><span>Buổi học · {date}</span></div>
      <div className="classroom-front"><span>Bảng &amp; khu vực giáo viên</span></div>
      <div className="classroom-seats" aria-label="Chỗ ngồi học sinh" aria-busy={disabled}>
        {students.map((student, index) => {
          const status = attendance[student.id];
          const present = status === 'present';
          const label = present ? 'Có mặt' : status === 'absent' ? 'Vắng' : 'Chưa điểm danh';
          return <button type="button" key={student.id} className={`classroom-seat ${present ? 'occupied' : status === 'absent' ? 'away' : 'unmarked'}`} disabled={disabled}
            aria-label={`${student.name}: ${label}. ${present ? 'Ghi vắng' : 'Ghi có mặt'}`} aria-pressed={present}
            onClick={() => present ? onAbsent(student.id) : onPresent(student.id)}>
            <span className="seat-number">{String(index + 1).padStart(2, '0')}</span>
            <Desk occupied={present}/><strong className="seat-name">{student.name}</strong>
            <span className="seat-status"><Icon icon={present ? Check : status === 'absent' ? Minus : Circle} size={14}/>{label}</span>
          </button>;
        })}
      </div>
    </div>
    <p className="classroom-note">Điểm danh được lưu tự động cho buổi đang chọn. Có thể chuyển sang danh sách để đối chiếu hoặc quản lý học sinh.</p>
  </div>;
}
