// src/database.ts
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Bawlyw12!',
  database: 'bakery_db', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
