import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authRequired } from '../middleware/auth.js';
import { 
  createUser, 
  verifyUser, 
  getUserByEmail, 
  getUserById 
} from '../data/user-dao.js';
import { generateToken } from '../utils/jwt.js';
import { hashPassword } from '../utils/password.js';

const router = express.Router();

// -------------------------------------------------------
// POST /api/auth/register
// -------------------------------------------------------
router.post('/register', asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  
  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({ 
      error: 'Missing required fields: username, email, password' 
    });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Password strength validation
  if (password.length < 8) {
    return res.status(400).json({ 
      error: 'Password must be at least 8 characters long' 
    });
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password);
  
  // Create user (will throw if email/username exists)
  const user = await createUser({
    username,
    email,
    hashedPassword,
    role: 'user'  // Default role
  });
  
  // Generate token
  const token = generateToken(user);
  
  res.status(201).json({
    message: 'User registered successfully',
    token,
    user
  });
}));

// -------------------------------------------------------
// POST /api/auth/login
// -------------------------------------------------------
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Missing required fields: email, password' 
    });
  }
  
  // Verify user credentials
  const user = await verifyUser(email, password);
  
  if (!user) {
    return res.status(401).json({ 
      error: 'Invalid email or password' 
    });
  }
  
  // Generate token
  const token = generateToken(user);
  
  res.json({
    message: 'Login successful',
    token,
    user
  });
}));

// -------------------------------------------------------
// GET /api/auth/me (get current user info)
// -------------------------------------------------------
router.get('/me', authRequired, asyncHandler(async (req, res) => {
  // req.user is set by authRequired middleware
  const user = await getUserById(req.user.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ user });
}));

// -------------------------------------------------------
// POST /api/auth/refresh (optional - refresh token)
// -------------------------------------------------------
router.post('/refresh', authRequired, asyncHandler(async (req, res) => {
  // Generate new token for current user
  const newToken = generateToken(req.user);
  
  res.json({
    message: 'Token refreshed',
    token: newToken
  });
}));

// -------------------------------------------------------
// POST /api/auth/logout (optional - client-side only)
// -------------------------------------------------------
router.post('/logout', (req, res) => {
  // JWT tokens are stateless, so logout is handled client-side
  // by deleting the token from localStorage/cookies
  res.json({ 
    message: 'Logout successful. Please delete token from client.' 
  });
});

export default router;