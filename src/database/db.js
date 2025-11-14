import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Open SQLite connection using DB_FILE from .env
const db = await open({
  filename: process.env.DB_FILE,
  driver: sqlite3.Database
});

// PRAGMA configurations: improve consistency & performance
await db.exec('PRAGMA foreign_keys = ON;');
await db.exec('PRAGMA journal_mode = WAL;');
await db.exec('PRAGMA synchronous = NORMAL;');

// Auto-run init-db.sql
const initSqlPath = path.resolve('src/database/init-db.sql');

try {
  const initSql = fs.readFileSync(initSqlPath, 'utf-8');
  await db.exec(initSql);

  console.log('📦 Database initialized using init-db.sql');
} catch (err) {
  console.error('❌ Failed to load init-db.sql:', err);
}

export default db;
