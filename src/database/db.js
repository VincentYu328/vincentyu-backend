import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Open SQLite connection
const db = new Database(process.env.DB_FILE);

// PRAGMA configurations
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// Auto-run init-db.sql
const initSqlPath = path.resolve('src/database/init-db.sql');

try {
  const initSql = fs.readFileSync(initSqlPath, 'utf-8');
  db.exec(initSql);
  console.log('📦 Database initialized using init-db.sql');
} catch (err) {
  console.error('❌ Failed to load init-db.sql:', err);
}

export default db;