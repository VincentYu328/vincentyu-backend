import jwt from 'jsonwebtoken';

// ------------------------------------------------------------
// Generate JWT token
// ------------------------------------------------------------
export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
}

// ------------------------------------------------------------
// Verify JWT token
// ------------------------------------------------------------
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}