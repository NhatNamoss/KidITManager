CREATE TABLE IF NOT EXISTS teaching_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  date VARCHAR(10) NOT NULL,
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  notes TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX session_class_date (class_id, date),
  FOREIGN KEY (class_id) REFERENCES classes(id)
);
CREATE TABLE IF NOT EXISTS session_staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  teacher_id INT NOT NULL,
  teacher_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  minutes INT NOT NULL,
  UNIQUE (session_id, teacher_id),
  FOREIGN KEY (session_id) REFERENCES teaching_sessions(id)
);
CREATE TABLE IF NOT EXISTS session_revisions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  payload JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES teaching_sessions(id)
);
