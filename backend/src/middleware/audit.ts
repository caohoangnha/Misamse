import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { userDb } from '../database/users.js';

export function auditLogger(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Exclude health checks from flooding logs
  if (req.originalUrl === '/api/health') {
    return next();
  }

  const start = Date.now();
  const originalSend = res.send;

  res.send = function (body) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    // Determine module from URL
    let moduleName = 'HỆ THỐNG';
    const path = req.originalUrl.toLowerCase();
    if (path.includes('/auth')) moduleName = 'XÁC THỰC';
    else if (path.includes('/inventory') || path.includes('/products')) moduleName = 'KHO HÀNG';
    else if (path.includes('/customers') || path.includes('/sales')) moduleName = 'BÁN HÀNG';
    else if (path.includes('/suppliers') || path.includes('/purchases')) moduleName = 'MUA HÀNG';
    else if (path.includes('/receivables') || path.includes('/payables')) moduleName = 'CÔNG NỢ';
    else if (path.includes('/dashboard')) moduleName = 'TỔNG QUAN';
    else if (path.includes('/misa')) moduleName = 'MISA ADAPTER';
    else if (path.includes('/admin/users')) moduleName = 'NGƯỜI DÙNG';

    // Action
    const action = `${req.method} ${req.path}`;
    const status = statusCode >= 400 ? (statusCode === 403 ? 'BLOCKED' : 'FAILURE') : 'SUCCESS';

    const username = req.user?.username || (req.body?.username ? String(req.body.username).replace(/[^a-zA-Z0-9_]/g, '') : 'anonymous');

    // Only log meaningful non-GET or important read actions
    userDb.addAuditLog({
      username,
      userId: req.user?.userId,
      ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || req.socket.remoteAddress || '127.0.0.1',
      device: (req.headers['user-agent'] as string)?.substring(0, 150) || 'Unknown Device',
      module: moduleName,
      action,
      api: req.originalUrl,
      statusCode,
      status,
      details: `Thời gian phản hồi: ${duration}ms`,
    });

    return originalSend.call(this, body);
  };

  next();
}
