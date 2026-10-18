CREATE TABLE IF NOT EXISTS class_slot_people (
  class_id INT NOT NULL,
  slot VARCHAR(100) NOT NULL,
  position INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  PRIMARY KEY (class_id, slot, position),
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);
