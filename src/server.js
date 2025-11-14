import app from './app.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testEmailConnection } from './services/emailService.js';
import { startAutoBackup, createBackup } from './services/backupService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载 .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 8080;

// -------------------------------------------------------
// 启动前检查和初始化
// -------------------------------------------------------

// 测试邮件服务连接
testEmailConnection();

// 启用自动备份（生产环境）
if (process.env.NODE_ENV === 'production') {
  console.log('🔄 Enabling automatic database backups...');
  startAutoBackup();
  
  // 启动时立即创建一次备份
  createBackup()
    .then(() => console.log('✅ Initial backup completed'))
    .catch(err => console.error('⚠️  Initial backup failed:', err.message));
}

// 开发环境提醒
if (process.env.NODE_ENV === 'development') {
  console.log('💡 Tip: Run "node backup-now.js" to create manual backup');
}

// -------------------------------------------------------
// 启动服务器
// -------------------------------------------------------
app.listen(PORT, () => {
  console.log('═'.repeat(50));
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_ORIGIN}`);
  console.log('═'.repeat(50));
});

// -------------------------------------------------------
// 优雅关闭
// -------------------------------------------------------
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, creating final backup...');
  
  createBackup()
    .then(() => {
      console.log('✅ Final backup completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Final backup failed:', err.message);
      process.exit(1);
    });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received (Ctrl+C), creating final backup...');
  
  createBackup()
    .then(() => {
      console.log('✅ Final backup completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Final backup failed:', err.message);
      process.exit(1);
    });
});