import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'misa_portal_default_secret_key_change_in_prod_12345';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

export async function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  permissions: string[];
}

export function generateAccessToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    permissions: user.permissions,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: (JWT_EXPIRES_IN as any) });
}

export function generateRefreshToken(user: User): string {
  return jwt.sign(
    { userId: user.id, tokenVersion: 1 },
    JWT_SECRET,
    { expiresIn: (REFRESH_EXPIRES_IN as any) }
  );
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
