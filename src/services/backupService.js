import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const DB_FILE = process.env.DB_FILE || './src/database/app.db';
const MAX_LOCAL_BACKUPS = 30; // 保留最近30天

// 确保备份目录存在
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 创建数据库备份
export function createBackup() {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const backupFile = path.join(BACKUP_DIR, `app-${timestamp}.db`);
    
    // 复制数据库文件
    fs.copyFileSync(DB_FILE, backupFile);
    
    console.log('✅ Database backup created:', backupFile);
    
    // 清理旧备份
    cleanOldBackups();
    
    return backupFile;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

// 清理旧备份（只保留最近的）
function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('app-') && f.endsWith('.db'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
    
    // 删除超过限制的旧备份
    if (files.length > MAX_LOCAL_BACKUPS) {
      files.slice(MAX_LOCAL_BACKUPS).forEach(file => {
        fs.unlinkSync(file.path);
        console.log('🗑️ Deleted old backup:', file.name);
      });
    }
  } catch (error) {
    console.error('⚠️ Failed to clean old backups:', error);
  }
}

// 导出为 SQL 格式（便于跨平台恢复）
export function exportToSQL() {
  try {
    const db = new Database(DB_FILE);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const sqlFile = path.join(BACKUP_DIR, `export-${timestamp}.sql`);
    
    const tables = ['user', 'blog', 'project', 'messages'];
    let sqlDump = `-- Database Export\n-- Generated: ${new Date().toISOString()}\n\n`;
    
    tables.forEach(table => {
      const rows = db.prepare(`SELECT * FROM ${table}`).all();
      
      if (rows.length > 0) {
        sqlDump += `\n-- Data for table: ${table}\n`;
        sqlDump += `DELETE FROM ${table};\n`;
        
        rows.forEach(row => {
          const columns = Object.keys(row).join(', ');
          const values = Object.values(row)
            .map(v => v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`)
            .join(', ');
          
          sqlDump += `INSERT INTO ${table} (${columns}) VALUES (${values});\n`;
        });
      }
    });
    
    fs.writeFileSync(sqlFile, sqlDump);
    console.log('✅ SQL export created:', sqlFile);
    
    db.close();
    return sqlFile;
  } catch (error) {
    console.error('❌ SQL export failed:', error);
    throw error;
  }
}

// 定时备份任务
export function startAutoBackup() {
  // 每天凌晨 2 点备份
  const scheduleTime = new Date();
  scheduleTime.setHours(2, 0, 0, 0);
  
  const now = new Date();
  let msUntilBackup = scheduleTime.getTime() - now.getTime();
  
  // 如果今天的时间已过，安排到明天
  if (msUntilBackup < 0) {
    msUntilBackup += 24 * 60 * 60 * 1000;
  }
  
  console.log(`🕐 Auto backup scheduled in ${Math.round(msUntilBackup / 1000 / 60)} minutes`);
  
  setTimeout(() => {
    createBackup();
    exportToSQL();
    
    // 每 24 小时重复一次
    setInterval(() => {
      createBackup();
      exportToSQL();
    }, 24 * 60 * 60 * 1000);
  }, msUntilBackup);
}