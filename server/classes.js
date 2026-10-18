import { scheduleSlots } from '../shared/class-schedule.js';
import { InputError } from './session-domain.js';

export function validateSlotStaff(staff, schedule) {
  if (!Array.isArray(staff)) throw new InputError('Phân công theo suất phải là danh sách.');
  const slots = scheduleSlots(schedule);
  const used = new Set();
  return staff.map(row => {
    if (!row || !slots.some(s => s.label === row.slot) || used.has(row.slot)) throw new InputError('Suất phân công không có trong lịch hoặc bị trùng.');
    used.add(row.slot);
    for (const key of ['teacher', 'ta']) {
      if (typeof row[key] !== 'string' || row[key].length > 255) throw new InputError('Tên nhân sự không hợp lệ.');
    }
    return { slot: row.slot, teacher: row.teacher.trim(), ta: row.ta.trim() };
  });
}

export function registerClasses(app, pool) {
  const db = pool.promise();
  const withStaff = async rows => {
    const [staff] = await db.query('SELECT * FROM class_slot_staff');
    return rows.map(row => ({ ...row, slot_staff: staff.filter(s => s.class_id === row.id).map(({ slot, teacher, ta }) => ({ slot, teacher, ta })) }));
  };
  app.get('/api/classes', async (req, res) => {
    const [rows] = await db.query('SELECT c.*, COUNT(cs.student_id) AS enrolledCount FROM classes c LEFT JOIN class_students cs ON c.id=cs.class_id GROUP BY c.id');
    res.json(await withStaff(rows));
  });
  app.get('/api/classes/:id', async (req, res) => {
    const [[row]] = await db.query('SELECT * FROM classes WHERE id=?', [req.params.id]);
    if (!row) throw new InputError('Không tìm thấy lớp.', 404);
    res.json((await withStaff([row]))[0]);
  });
  const save = async (req, res, next) => {
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      let current = {};
      if (req.params.id) {
        const [[row]] = await connection.query('SELECT * FROM classes WHERE id=? FOR UPDATE', [req.params.id]);
        if (!row) throw new InputError('Không tìm thấy lớp.', 404);
        current = row;
      }
      const value = { teacher: '', ta: '', schedule: '', room: '', capacity: null, ...current, ...req.body };
      for (const key of ['teacher', 'ta', 'schedule', 'room']) value[key] ??= '';
      if (typeof value.name !== 'string' || !value.name.trim() || value.name.length > 255) throw new InputError('Tên lớp không hợp lệ.');
      for (const key of ['teacher', 'ta', 'schedule', 'room']) if (typeof value[key] !== 'string' || value[key].length > 2000) throw new InputError(`Trường ${key} không hợp lệ.`);
      const capacity = value.capacity === '' || value.capacity == null ? null : Number(value.capacity);
      if (capacity !== null && (!Number.isInteger(capacity) || capacity < 1)) throw new InputError('Sĩ số phải là số nguyên dương.');
      let staff;
      if (value.slot_staff !== undefined) staff = validateSlotStaff(value.slot_staff, value.schedule);
      else if (req.params.id) {
        const [saved] = await connection.query('SELECT slot,teacher,ta FROM class_slot_staff WHERE class_id=?', [req.params.id]);
        staff = saved.filter(s => scheduleSlots(value.schedule).some(slot => slot.label === s.slot));
      } else staff = [];
      const params = [value.name.trim(), value.teacher, value.ta, value.schedule, value.room, capacity];
      let id = req.params.id;
      if (id) await connection.query('UPDATE classes SET name=?,teacher=?,ta=?,schedule=?,room=?,capacity=? WHERE id=?', [...params, id]);
      else {
        const [result] = await connection.query('INSERT INTO classes (name,teacher,ta,schedule,room,capacity) VALUES (?,?,?,?,?,?)', params);
        id = result.insertId;
      }
      await connection.query('DELETE FROM class_slot_staff WHERE class_id=?', [id]);
      for (const row of staff) await connection.query('INSERT INTO class_slot_staff (class_id,slot,teacher,ta) VALUES (?,?,?,?)', [id, row.slot, row.teacher, row.ta]);
      await connection.commit();
      res.json(req.params.id ? { success: true } : { id });
    } catch (error) { if (connection) await connection.rollback(); next(error); }
    finally { connection?.release(); }
  };
  app.post('/api/classes', save);
  app.put('/api/classes/:id', save);
}
