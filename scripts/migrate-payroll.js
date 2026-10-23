import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { databaseConfig } from '../server/database-config.js';

const db = await mysql.createConnection({ ...databaseConfig, connectTimeout: 10000 });
try {
  const sql = await readFile(new URL('../migrations/006-attendance-payroll.sql', import.meta.url), 'utf8');
  await db.query(sql);
  console.log('Đã tạo bảng lưu đội hình tính lương. Công đã có giữ nguyên, cần bổ sung đội hình khi sửa.');
} finally { await db.end(); }
