import db from '../database/db.js';
import bcrypt from 'bcrypt'; 

// ------------------------------------------------------------
// Helper: Remove password from user object
// ------------------------------------------------------------
function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// ------------------------------------------------------------
// Create a new user (password must already be hashed!!)
// ------------------------------------------------------------
export async function createUser({ username, email, hashedPassword, role }) {
  // Check for duplicate email
  const existingEmail = await getUserByEmail(email);
  if (existingEmail) {
    throw new Error(`User with email '${email}' already exists`);
  }
  
  // Check for duplicate username
  const existingUsername = await getUserByUsername(username);
  if (existingUsername) {
    throw new Error(`Username '${username}' is already taken`);
  }
  
  const result = await db.run(`
    INSERT INTO user (username, email, password, role)
    VALUES (?, ?, ?, ?)
  `, [username, email, hashedPassword, role ?? 'user']);
  
  // Return created user without password
  return {
    id: result.lastID,
    username,
    email,
    role: role ?? 'user'
  };
}

// ------------------------------------------------------------
// Find by ID (for auth middleware)
// ------------------------------------------------------------
export async function getUserById(id) {
  const user = await db.get(`
    SELECT * FROM user WHERE id = ?
  `, [id]);
  
  return sanitizeUser(user);
}

// ------------------------------------------------------------
// Find by email (internal use - includes password for auth)
// ------------------------------------------------------------
export function getUserByEmail(email) {
  return db.get(`
    SELECT * FROM user
    WHERE email = ?
  `, [email]);
}

// ------------------------------------------------------------
// Find by username (internal use - includes password for auth)
// ------------------------------------------------------------
export function getUserByUsername(username) {
  return db.get(`
    SELECT * FROM user
    WHERE username = ?
  `, [username]);
}

// ------------------------------------------------------------
// Verify user password (returns sanitized user object or null)
// ------------------------------------------------------------
export async function verifyUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const match = await bcrypt.compare(password, user.password);
  
  // Return user without password if authentication succeeds
  return match ? sanitizeUser(user) : null;
}

// ------------------------------------------------------------
// Get all users (admin use - no passwords)
// ------------------------------------------------------------
export async function getAllUsers() {
  return db.all(`
    SELECT id, username, email, role, created_at, updated_at
    FROM user
    ORDER BY created_at DESC
  `);
}

// ------------------------------------------------------------
// Update user (admin use - can change role, etc.)
// ------------------------------------------------------------
export async function updateUser(id, updates) {
  const { username, email, role } = updates;
  
  // Check if user exists
  const existing = await getUserById(id);
  if (!existing) {
    throw new Error(`User with id '${id}' not found`);
  }
  
  // Check email conflict (if changing email)
  if (email && email !== existing.email) {
    const emailExists = await getUserByEmail(email);
    if (emailExists) {
      throw new Error(`Email '${email}' is already in use`);
    }
  }
  
  // Check username conflict (if changing username)
  if (username && username !== existing.username) {
    const usernameExists = await getUserByUsername(username);
    if (usernameExists) {
      throw new Error(`Username '${username}' is already taken`);
    }
  }
  
  const result = await db.run(`
    UPDATE user
    SET username = COALESCE(?, username),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [username, email, role, id]);
  
  if (result.changes === 0) {
    throw new Error(`Failed to update user with id '${id}'`);
  }
  
  // Return updated user
  return getUserById(id);
}

// ------------------------------------------------------------
// Delete user (admin use)
// ------------------------------------------------------------
export async function deleteUser(id) {
  const result = await db.run(`
    DELETE FROM user WHERE id = ?
  `, [id]);
  
  if (result.changes === 0) {
    throw new Error(`User with id '${id}' not found`);
  }
  
  return { deleted: true, id };
}

// ------------------------------------------------------------
// Change user password
// ------------------------------------------------------------
export async function changePassword(userId, oldPassword, newHashedPassword) {
  // Get user with password for verification
  const user = await db.get(`
    SELECT * FROM user WHERE id = ?
  `, [userId]);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify old password
  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) {
    throw new Error('Current password is incorrect');
  }
  
  // Update password
  await db.run(`
    UPDATE user
    SET password = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [newHashedPassword, userId]);
  
  return { success: true };
}