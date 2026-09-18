import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../security/crypto.js';
import { userDb } from '../database/users.js';
import { Permission, UserRole } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Yêu cầu đăng nhập. Phiên làm việc không có token hợp lệ.',
    });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
    });
    return;
  }

  const user = userDb.getUserById(payload.userId);
  if (!user || !user.isActive) {
    res.status(403).json({
      success: false,
      error: 'Tài khoản đã bị khóa hoặc không tồn tại trong hệ thống.',
    });
    return;
  }

  // Refresh permissions in case admin modified them
  req.user = {
    userId: user.id,
    username: user.username,
    role: user.role,
    permissions: user.permissions,
  };

  next();
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Chưa xác thực danh tính.' });
      return;
    }

    if (req.user.role === 'ADMIN' || req.user.permissions.includes(permission)) {
      return next();
    }

    // Log unauthorized attempt
    userDb.addAuditLog({
      username: req.user.username,
      userId: req.user.userId,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      device: (req.headers['user-agent'] as string) || 'unknown',
      module: 'PHÂN QUYỀN',
      action: 'TRUY CẬP TRÁI PHÉP',
      api: req.originalUrl,
      statusCode: 403,
      status: 'BLOCKED',
      details: `Từ chối quyền: thiếu quyền [${permission}]`,
    });

    res.status(403).json({
      success: false,
      error: `Bạn không có quyền thực hiện thao tác này (yêu cầu quyền: ${permission}).`,
    });
  };
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Chưa xác thực danh tính.' });
      return;
    }

    if (allowedRoles.includes(req.user.role as UserRole)) {
      return next();
    }

    res.status(403).json({
      success: false,
      error: `Yêu cầu vai trò: ${allowedRoles.join(', ')}.`,
    });
  };
}
