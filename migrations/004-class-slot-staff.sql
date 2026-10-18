CREATE TABLE IF NOT EXISTS class_slot_staff (
  class_id INT NOT NULL,
  slot VARCHAR(100) NOT NULL,
  teacher VARCHAR(255) NOT NULL DEFAULT '',
  ta VARCHAR(255) NOT NULL DEFAULT '',
  PRIMARY KEY (class_id, slot),
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);
