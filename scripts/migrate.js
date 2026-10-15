import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD) throw new Error('Thiếu DB_HOST, DB_USER hoặc DB_PASSWORD.');
const db = await mysql.createConnection({
  host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'kidit', port: Number(process.env.DB_PORT || 4000),
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
});
try {
  const sql = await readFile(new URL('../migrations/001-teaching-sessions.sql', import.meta.url), 'utf8');
  for (const statement of sql.split(';').map(s => s.trim()).filter(Boolean)) await db.query(statement);
  console.log('Đã tạo các bảng buổi dạy, công giảng dạy và lịch sử chỉnh sửa.');
} finally { await db.end(); }
