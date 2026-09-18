import { Request, Response, NextFunction } from 'express';

interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, LoginAttempt>();
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const MAX_LOGIN_FAILS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const API_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 150;
const API_LIMIT_WINDOW = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000; // 1 minute

export function checkLoginLockout(identifier: string): { isLocked: boolean; remainingMinutes: number } {
  const attempt = loginAttempts.get(identifier);
  if (!attempt) return { isLocked: false, remainingMinutes: 0 };

  const now = Date.now();
  if (attempt.lockedUntil && attempt.lockedUntil > now) {
    const remainingMs = attempt.lockedUntil - now;
    return { isLocked: true, remainingMinutes: Math.ceil(remainingMs / 60000) };
  }

  // If lockout expired, reset
  if (attempt.lockedUntil && attempt.lockedUntil <= now) {
    loginAttempts.delete(identifier);
  }

  return { isLocked: false, remainingMinutes: 0 };
}

export function recordLoginFailure(identifier: string): { isLocked: boolean; remainingAttempts: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier) || { count: 0, lastAttempt: now };

  attempt.count += 1;
  attempt.lastAttempt = now;

  if (attempt.count >= MAX_LOGIN_FAILS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION_MS;
    loginAttempts.set(identifier, attempt);
    return { isLocked: true, remainingAttempts: 0 };
  }

  loginAttempts.set(identifier, attempt);
  return { isLocked: false, remainingAttempts: MAX_LOGIN_FAILS - attempt.count };
}

export function resetLoginAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

export function apiRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + API_LIMIT_WINDOW });
    return next();
  }

  entry.count += 1;
  if (entry.count > API_LIMIT_MAX) {
    res.status(429).json({
      success: false,
      error: 'Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau giây lát.',
      retryAfterSeconds: Math.ceil((entry.resetTime - now) / 1000)
    });
    return;
  }

  next();
}
