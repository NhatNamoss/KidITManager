CREATE TABLE IF NOT EXISTS attendance_payroll (
  attendance_id INT PRIMARY KEY,
  teacher_count INT NOT NULL,
  ta_count INT NOT NULL,
  FOREIGN KEY (attendance_id) REFERENCES personal_attendance(id) ON DELETE CASCADE
);
