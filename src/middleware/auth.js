// backend/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import { getUserById } from '../data/user-dao.js';

// ------------------------------------------------------------
// 环境变量检查
// ------------------------------------------------------------
if (!process.env.JWT_SECRET) {
  throw new Error('❌ JWT_SECRET environment variable is not defined');
}

// ------------------------------------------------------------
// 身份认证：从 Cookie 或 Authorization header 读取 JWT
// ------------------------------------------------------------
export async function authRequired(req, res, next) {
  let token = null;

  // 1. 尝试从 Cookie 读取
  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // 2. 尝试从 Authorization: Bearer xxx 读取
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // 未提供 token
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // 解析 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 从数据库重新获取用户（确保仍然存在）
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user; // 附加到请求
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ------------------------------------------------------------
// 管理员权限要求
// ------------------------------------------------------------
export function adminRequired(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}
