import express from 'express';
import * as userDao from '../data/user-dao.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { hashPassword } from '../utils/password.js';

const router = express.Router();

// ⚠️ 所有用户管理路由都需要 admin 权限

// -------------------------------------------------------
// GET /api/users - Get all users (admin only)
// -------------------------------------------------------
router.get('/', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const users = await userDao.getAllUsers();
  res.json({
    count: users.length,
    users
  });
}));

// -------------------------------------------------------
// GET /api/users/:id - Get user by ID (admin only)
// -------------------------------------------------------
router.get('/:id', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  const user = await userDao.getUserById(userId);
  
  if (!user) {
    return res.status(404).json({ 
      error: `User with ID ${userId} not found` 
    });
  }
  
  res.json(user);
}));

// -------------------------------------------------------
// PUT /api/users/:id - Update user (admin only)
// -------------------------------------------------------
router.put('/:id', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  const { username, email, role } = req.body;
  
  // Validation
  if (!username && !email && !role) {
    return res.status(400).json({ 
      error: 'At least one field must be provided for update' 
    });
  }
  
  // Validate role if provided
  if (role && !['user', 'admin'].includes(role)) {
    return res.status(400).json({ 
      error: 'Role must be either "user" or "admin"' 
    });
  }
  
  // Update user (will throw if user not found or conflicts)
  const updatedUser = await userDao.updateUser(userId, req.body);
  
  res.json({
    message: 'User updated successfully',
    user: updatedUser
  });
}));

// -------------------------------------------------------
// DELETE /api/users/:id - Delete user (admin only)
// -------------------------------------------------------
router.delete('/:id', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  // Prevent admin from deleting themselves
  if (userId === req.user.id) {
    return res.status(400).json({ 
      error: 'You cannot delete your own account' 
    });
  }
  
  // Delete user (will throw if user not found)
  await userDao.deleteUser(userId);
  
  res.json({ 
    message: 'User deleted successfully',
    id: userId
  });
}));

// -------------------------------------------------------
// PATCH /api/users/:id/role - Change user role (admin only)
// -------------------------------------------------------
router.patch('/:id/role', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { role } = req.body;
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  // Validation
  if (!role || !['user', 'admin'].includes(role)) {
    return res.status(400).json({ 
      error: 'Role must be either "user" or "admin"' 
    });
  }
  
  // Prevent admin from changing their own role
  if (userId === req.user.id) {
    return res.status(400).json({ 
      error: 'You cannot change your own role' 
    });
  }
  
  // Update role
  const updatedUser = await userDao.updateUser(userId, { role });
  
  res.json({
    message: 'User role updated successfully',
    user: updatedUser
  });
}));

// -------------------------------------------------------
// PATCH /api/users/:id/password - Change user password (admin only)
// -------------------------------------------------------
router.patch('/:id/password', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { newPassword } = req.body;
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  // Validation
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ 
      error: 'New password must be at least 8 characters long' 
    });
  }
  
  // Hash new password
  const hashedPassword = await hashPassword(newPassword);
  
  // Update password directly (admin bypass)
  await userDao.db.run(`
    UPDATE user
    SET password = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [hashedPassword, userId]);
  
  res.json({
    message: 'User password reset successfully'
  });
}));

export default router;