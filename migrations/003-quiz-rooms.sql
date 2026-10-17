CREATE TABLE IF NOT EXISTS quiz_rooms (
  code VARCHAR(6) PRIMARY KEY,
  owner_id INT NOT NULL,
  state MEDIUMTEXT NOT NULL,
  version INT NOT NULL DEFAULT 0,
  expires_at BIGINT NOT NULL,
  INDEX quiz_rooms_owner_expiry (owner_id, expires_at)
);
