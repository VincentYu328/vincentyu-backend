import bcrypt from "bcrypt";
import db from './src/database/db.js';
import readline from 'readline';

// ============================================
// 配置区
// ============================================
const ADMIN_USERNAME = 'admin';
const ADMIN_EMAIL = 'vincent_yu@bbm.co.nz';
// ============================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askPassword() {
  return new Promise((resolve) => {
    rl.question('🔑 Enter admin password (or press Enter for "Admin123!"): ', (answer) => {
      resolve(answer.trim() || 'Admin123!');
    });
  });
}

console.log('🔐 Admin User Setup\n');

// 交互式输入密码
const password = await askPassword();
rl.close();

console.log('\n⏳ Generating hash and updating database...\n');

// 生成密码哈希
const hash = await bcrypt.hash(password, 10);

// 检查用户是否存在
const existingUser = await db.get(
  'SELECT id, username, email FROM user WHERE email = ?',
  [ADMIN_EMAIL]
);

if (existingUser) {
  // 用户已存在，更新密码
  await db.run(
    'UPDATE user SET password = ?, username = ? WHERE email = ?',
    [hash, ADMIN_USERNAME, ADMIN_EMAIL]
  );
  console.log('✅ Admin password updated!');
  console.log('👤 User ID:', existingUser.id);
} else {
  // 用户不存在，创建新用户
  const result = await db.run(
    'INSERT INTO user (username, email, password, role) VALUES (?, ?, ?, ?)',
    [ADMIN_USERNAME, ADMIN_EMAIL, hash, 'admin']
  );
  console.log('✅ Admin user created!');
  console.log('👤 User ID:', result.lastID);
}

console.log('📧 Email:', ADMIN_EMAIL);
console.log('🔑 Password:', password);
console.log('🔒 Hash:', hash.substring(0, 20) + '...');

process.exit(0);