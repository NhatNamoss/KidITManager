import { DatabaseSync } from 'node:sqlite';
import express from 'express';
import { registerTeachingSessions } from '../server/teaching-sessions.js';
import { registerStudentAttendance } from '../server/student-attendance.js';

export function createFixture() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(`
    PRAGMA foreign_keys=ON;
    CREATE TABLE classes (id INTEGER PRIMARY KEY, name TEXT, teacher TEXT, ta TEXT, schedule TEXT, room TEXT, capacity INTEGER);
    CREATE TABLE teachers (id INTEGER PRIMARY KEY, name TEXT, role INTEGER, phone TEXT);
    CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, phone TEXT, parentName TEXT, parentPhone TEXT);
    CREATE TABLE class_students (id INTEGER PRIMARY KEY, class_id INTEGER REFERENCES classes(id), student_id INTEGER REFERENCES students(id));
    CREATE TABLE attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id INTEGER REFERENCES classes(id), student_id INTEGER REFERENCES students(id), date TEXT, status TEXT, UNIQUE(class_id, student_id, date));
    CREATE TABLE teaching_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id INTEGER REFERENCES classes(id), date TEXT, start_time TEXT, end_time TEXT, status TEXT, notes TEXT, version INTEGER DEFAULT 1);
    CREATE TABLE session_staff (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id INTEGER REFERENCES teaching_sessions(id), teacher_id INTEGER, teacher_name TEXT, role TEXT, minutes INTEGER, UNIQUE(session_id, teacher_id));
    CREATE TABLE session_revisions (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id INTEGER REFERENCES teaching_sessions(id), payload TEXT);
    CREATE TABLE teacher_attendance (id INTEGER PRIMARY KEY, class_id INTEGER, teacher_name TEXT, role TEXT, date TEXT, status TEXT);
    INSERT INTO classes VALUES (1,'Lớp kiểm thử','GV kiểm thử A','GV kiểm thử B','Thứ 5 (15:15 - 17:15)','1',10);
    INSERT INTO teachers VALUES (1,'GV kiểm thử A',1,''),(2,'GV kiểm thử B',2,''),(3,'GV dạy thay C',1,'');
    INSERT INTO students VALUES (1,'Học sinh kiểm thử','','','');
    INSERT INTO class_students VALUES (1,1,1);
    INSERT INTO teacher_attendance VALUES (1,1,'GV kiểm thử A','teacher','2026-10-01','present');
  `);
  const state = { failRevision: false };
  const connection = {
    async query(sql, params = []) {
      if (state.failRevision && sql.startsWith('INSERT INTO session_revisions')) throw new Error('injected failure');
      const statement = sqlite.prepare(sql.replaceAll(' FOR UPDATE', '').replace(/ON DUPLICATE KEY UPDATE status = VALUES\(status\)/, 'ON CONFLICT(class_id, student_id, date) DO UPDATE SET status=excluded.status'));
      if (/^SELECT/i.test(sql.trim())) return [statement.all(...params)];
      const result = statement.run(...params);
      return [{ insertId: Number(result.lastInsertRowid), affectedRows: result.changes }];
    },
    async beginTransaction() { sqlite.exec('BEGIN'); },
    async commit() { sqlite.exec('COMMIT'); },
    async rollback() { sqlite.exec('ROLLBACK'); },
    release() {}
  };
  const pool = { promise: () => ({ query: connection.query, getConnection: async () => connection }) };
  const app = express(); app.use(express.json());
  app.get('/api/classes', async (req, res) => res.json((await connection.query('SELECT * FROM classes'))[0]));
  app.get('/api/classes/:id', async (req, res) => res.json((await connection.query('SELECT * FROM classes WHERE id=?', [Number(req.params.id)]))[0][0]));
  app.put('/api/classes/:id', async (req, res) => {
    const { name, teacher, ta, schedule, room, capacity } = req.body;
    await connection.query('UPDATE classes SET name=COALESCE(?,name),teacher=COALESCE(?,teacher),ta=COALESCE(?,ta),schedule=?,room=COALESCE(?,room),capacity=COALESCE(?,capacity) WHERE id=?',
      [name ?? null, teacher ?? null, ta ?? null, schedule, room ?? null, capacity ?? null, Number(req.params.id)]);
    res.json({ success: true });
  });
  app.get('/api/teachers', async (req, res) => res.json((await connection.query('SELECT * FROM teachers'))[0]));
  app.get('/api/students', async (req, res) => res.json((await connection.query('SELECT * FROM students'))[0]));
  app.get('/api/classes/:id/students', async (req, res) => res.json((await connection.query('SELECT s.* FROM students s JOIN class_students cs ON cs.student_id=s.id WHERE cs.class_id=?', [Number(req.params.id)]))[0]));
  app.get('/api/invoices', (req, res) => res.json([]));
  app.get('/api/dashboard/stats', (req, res) => res.json({ totalStudents: 0, totalClasses: 1, revenue: 0 }));
  registerTeachingSessions(app, pool);
  registerStudentAttendance(app, pool);
  app.use((error, req, res, _next) => res.status(error.status || 500).json({ error: error.message }));
  return { app, sqlite, state };
}
