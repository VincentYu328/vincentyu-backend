import bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

// ------------------------------------------------------------
// Hash password
// ------------------------------------------------------------
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// ------------------------------------------------------------
// Compare password
// ------------------------------------------------------------
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}