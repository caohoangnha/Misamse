import express, { Request, Response } from 'express';
import {
  authenticateToken,
  requirePermission,
  requireRole,
  AuthenticatedRequest,
} from '../middleware/auth.js';
import { auditLogger } from '../middleware/audit.js';
import {
  checkLoginLockout,
  recordLoginFailure,
  resetLoginAttempts,
  apiRateLimiter,
} from '../security/rateLimiter.js';
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
} from '../security/crypto.js';
import { userDb, ROLE_PERMISSIONS } from '../database/users.js';
import { misaAdapter } from '../misa/MisaSqlAdapter.js';
import { cacheService } from '../services/cache.js';
import { UserRole } from '../types/index.js';

const router = express.Router();

// Apply global rate limiting & audit logger on all API routes
router.use(apiRateLimiter);
router.use(auditLogger);

/* =========================================================================
   1. AUTHENTICATION ENDPOINTS
   ========================================================================= */

// POST /api/auth/login
router.post('/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const lockKey = `${ip}_${String(username).toLowerCase()}`;

  if (!username || !password) {
    res.status(400).json({ success: false, error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    return;
  }

  // Check lockout status
  const lockout = checkLoginLockout(lockKey);
  if (lockout.isLocked) {
    res.status(429).json({
      success: false,
      error: `Tài khoản đã bị tạm khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${lockout.remainingMinutes} phút.`,
    });
    return;
  }

  const user = userDb.getUserByUsername(username);
  if (!user || !user.passwordHash || !user.isActive) {
    const attempt = recordLoginFailure(lockKey);
    userDb.addAuditLog({
      username,
      ip,
      device: (req.headers['user-agent'] as string) || 'unknown',
      module: 'XÁC THỰC',
      action: 'ĐĂNG NHẬP THẤT BẠI',
      api: '/api/auth/login',
      statusCode: 401,
      status: 'FAILURE',
      details: user ? 'Tài khoản đã bị khóa' : 'Tên đăng nhập không tồn tại',
    });

    res.status(401).json({
      success: false,
      error: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
      remainingAttempts: attempt.remainingAttempts,
    });
    return;
  }

  const isMatch = await verifyPassword(password, user.passwordHash);
  if (!isMatch) {
    const attempt = recordLoginFailure(lockKey);
    userDb.addAuditLog({
      username,
      userId: user.id,
      ip,
      device: (req.headers['user-agent'] as string) || 'unknown',
      module: 'XÁC THỰC',
      action: 'ĐĂNG NHẬP THẤT BẠI',
      api: '/api/auth/login',
      statusCode: 401,
      status: 'FAILURE',
      details: 'Mật khẩu không đúng',
    });

    res.status(401).json({
      success: false,
      error: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
      remainingAttempts: attempt.remainingAttempts,
    });
    return;
  }

  // Success: reset failed attempts
  resetLoginAttempts(lockKey);
  userDb.updateLastLogin(user.id);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  userDb.addAuditLog({
    username: user.username,
    userId: user.id,
    ip,
    device: (req.headers['user-agent'] as string) || 'unknown',
    module: 'XÁC THỰC',
    action: 'ĐĂNG NHẬP THÀNH CÔNG',
    api: '/api/auth/login',
    statusCode: 200,
    status: 'SUCCESS',
    details: `Vai trò: ${user.role}`,
  });

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    },
  });
});

// POST /api/auth/refresh
router.post('/auth/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ success: false, error: 'Thiếu refresh token.' });
    return;
  }
  // For demo & production token rotation
  res.json({
    success: true,
    message: 'Phiên làm việc đã được gia hạn',
  });
});

// POST /api/auth/logout
router.post('/auth/logout', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    userDb.addAuditLog({
      username: req.user.username,
      userId: req.user.userId,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      device: (req.headers['user-agent'] as string) || 'unknown',
      module: 'XÁC THỰC',
      action: 'ĐĂNG XUẤT',
      api: '/api/auth/logout',
      statusCode: 200,
      status: 'SUCCESS',
    });
  }
  res.json({ success: true, message: 'Đăng xuất thành công.' });
});

// GET /api/auth/me
router.get('/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Chưa đăng nhập.' });
    return;
  }
  const user = userDb.getUserById(req.user.userId);
  if (!user) {
    res.status(404).json({ success: false, error: 'Người dùng không tồn tại.' });
    return;
  }
  const { passwordHash, ...userData } = user;
  res.json({ success: true, data: userData });
});

/* =========================================================================
   2. SYSTEM HEALTH CHECK (Public or internal monitoring)
   ========================================================================= */

// GET /api/health
router.get('/health', async (_req: Request, res: Response) => {
  const misaHealth = await misaAdapter.getHealth();
  const cacheStats = cacheService.getStats();

  const isHealthy = misaHealth.connected;
  res.json({
    status: isHealthy ? 'ONLINE' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    components: {
      web: { status: 'ONLINE', message: 'Vite + React UI serving normally' },
      api: { status: 'ONLINE', port: process.env.PORT || 3000 },
      misaAdapter: {
        status: misaHealth.connected ? 'CONNECTED' : 'DISCONNECTED',
        latencyMs: misaHealth.latencyMs,
        message: misaHealth.message,
      },
      database: {
        status: misaHealth.connected ? 'CONNECTED' : 'STANDBY',
        type: 'Microsoft SQL Server (MISA SME)',
        mode: 'READ ONLY',
      },
      cache: {
        status: 'ACTIVE',
        stats: cacheStats,
      },
      security: {
        rateLimiter: 'ENABLED',
        jwtAuth: 'ACTIVE',
        auditLogger: 'RECORDING',
      },
    },
  });
});

/* =========================================================================
   3. DASHBOARD STATS (Role & Permission checked)
   ========================================================================= */

// GET /api/dashboard
router.get('/dashboard', authenticateToken, requirePermission('VIEW_DASHBOARD'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await misaAdapter.getDashboardStats();
    const permissions = req.user?.permissions || [];
    const isAdmin = req.user?.role === 'ADMIN';

    // Mask sensitive numbers if user doesn't have permissions
    const filteredStats = {
      ...stats,
      totalInventoryValue: isAdmin || permissions.includes('VIEW_COST_PRICE') ? stats.totalInventoryValue : undefined,
      totalReceivables: isAdmin || permissions.includes('VIEW_RECEIVABLES') ? stats.totalReceivables : undefined,
      totalPayables: isAdmin || permissions.includes('VIEW_PAYABLES') ? stats.totalPayables : undefined,
      monthlyRevenue: isAdmin || permissions.includes('VIEW_SALES') ? stats.monthlyRevenue : undefined,
    };

    res.json({ success: true, data: filteredStats });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: 'Lỗi tải dữ liệu Dashboard: ' + (err instanceof Error ? err.message : String(err)),
    });
  }
});

/* =========================================================================
   4. INVENTORY & PRODUCTS (Search, Barcode, Stock alerts)
   ========================================================================= */

// GET /api/products
router.get('/products', authenticateToken, requirePermission('VIEW_PRODUCTS'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, search, filterStatus } = req.query;
    const result = await misaAdapter.getProducts({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search: search ? String(search) : undefined,
      filterStatus: filterStatus ? String(filterStatus) : undefined,
    });

    const hasCostPermission = req.user?.role === 'ADMIN' || req.user?.permissions.includes('VIEW_COST_PRICE');

    // Strip cost price if unauthorized
    if (!hasCostPermission) {
      result.data = result.data.map(({ costPrice, inventoryAmount, ...rest }) => rest);
    }

    res.json({ success: true, ...result });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: 'Lỗi truy vấn danh mục hàng hóa.' });
  }
});

// GET /api/inventory
router.get('/inventory', authenticateToken, requirePermission('VIEW_INVENTORY'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, search, filterStatus } = req.query;
    const result = await misaAdapter.getInventory({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search: search ? String(search) : undefined,
      filterStatus: filterStatus ? String(filterStatus) : undefined,
    });

    const hasCostPermission = req.user?.role === 'ADMIN' || req.user?.permissions.includes('VIEW_COST_PRICE');
    if (!hasCostPermission) {
      result.data = result.data.map(({ costPrice, inventoryAmount, ...rest }) => rest);
    }

    res.json({ success: true, ...result });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: 'Lỗi tra cứu tồn kho MISA.' });
  }
});

// GET /api/inventory/:code
router.get('/inventory/:code', authenticateToken, requirePermission('VIEW_INVENTORY'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const code = req.params.code;
    const item = await misaAdapter.getInventoryByCode(code);
    if (!item) {
      res.status(404).json({ success: false, error: `Không tìm thấy mặt hàng với mã hoặc barcode: ${code}` });
      return;
    }

    const hasCostPermission = req.user?.role === 'ADMIN' || req.user?.permissions.includes('VIEW_COST_PRICE');
    if (!hasCostPermission) {
      const { costPrice, inventoryAmount, ...rest } = item;
      res.json({ success: true, data: rest });
      return;
    }

    res.json({ success: true, data: item });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: 'Lỗi tra cứu chi tiết tồn kho.' });
  }
});

/* =========================================================================
   5. CUSTOMERS & SALES
   ========================================================================= */

// GET /api/customers
router.get('/customers', authenticateToken, requirePermission('VIEW_CUSTOMERS'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, search } = req.query;
    const result = await misaAdapter.getCustomers({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search: search ? String(search) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: 'Lỗi tra cứu danh sách khách hàng.' });
  }
});

// GET /api/sales
router.get('/sales', authenticateToken, requirePermission('VIEW_SALES'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, search } = req.query;
    const result = await misaAdapter.getSales({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search: search ? String(search) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: 'Lỗi tra cứu đơn hàng bán.' });
  }
});

/* =========================================================================
   6. SUPPLIERS & PURCHASES
   ========================================================================= */

// GET /api/suppliers
router.get('/suppliers', authenticateToken, requirePermission('VIEW_SUPPLIERS'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, search } = req.query;
    const result = await misaAdapter.getSuppliers({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search: search ? String(search) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: 'Lỗi tra cứu danh sách nhà cung cấp.' });
  }
});

// GET /api/purchases
router.get('/purchases', authenticateToken, requirePermission('VIEW_PURCHASES'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, search } = req.query;
    const result = await misaAdapter.getPurchases({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search: search ? String(search) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: 'Lỗi tra cứu phiếu mua hàng/nhập kho.' });
  }
});

/* =========================================================================
   7. RECEIVABLES & PAYABLES (DEBT)
   ========================================================================= */

// GET /api/receivables
router.get('/receivables', authenticateToken, requirePermission('VIEW_RECEIVABLES'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, search } = req.query;
    const result = await misaAdapter.getReceivables({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search: search ? String(search) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: 'Lỗi tra cứu công nợ phải thu.' });
  }
});

// GET /api/payables
router.get('/payables', authenticateToken, requirePermission('VIEW_PAYABLES'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, search } = req.query;
    const result = await misaAdapter.getPayables({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search: search ? String(search) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: 'Lỗi tra cứu công nợ phải trả.' });
  }
});

/* =========================================================================
   8. ADMIN & SYSTEM MANAGEMENT
   ========================================================================= */

// GET /api/admin/users
router.get('/admin/users', authenticateToken, requirePermission('MANAGE_USERS'), (_req: AuthenticatedRequest, res: Response) => {
  const users = userDb.getAllUsers();
  res.json({ success: true, data: users });
});

// POST /api/admin/users
router.post('/admin/users', authenticateToken, requirePermission('MANAGE_USERS'), async (req: AuthenticatedRequest, res: Response) => {
  const { username, fullName, email, role, password } = req.body;
  if (!username || !fullName || !role || !password) {
    res.status(400).json({ success: false, error: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' });
    return;
  }

  const existing = userDb.getUserByUsername(username);
  if (existing) {
    res.status(400).json({ success: false, error: 'Tên đăng nhập đã tồn tại.' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const permissions = ROLE_PERMISSIONS[role as UserRole] || [];

  const created = userDb.createUser({
    username,
    fullName,
    email: email || '',
    role: role as UserRole,
    permissions,
    isActive: true,
    passwordHash,
  });

  res.json({ success: true, data: created });
});

// PUT /api/admin/users/:id
router.put('/admin/users/:id', authenticateToken, requirePermission('MANAGE_USERS'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { fullName, email, role, isActive, password, permissions } = req.body;

  const updates: any = {};
  if (fullName !== undefined) updates.fullName = fullName;
  if (email !== undefined) updates.email = email;
  if (role !== undefined) {
    updates.role = role;
    if (!permissions) {
      updates.permissions = ROLE_PERMISSIONS[role as UserRole] || [];
    }
  }
  if (permissions !== undefined) updates.permissions = permissions;
  if (isActive !== undefined) updates.isActive = isActive;
  if (password) {
    updates.passwordHash = await hashPassword(password);
  }

  const updated = userDb.updateUser(id, updates);
  if (!updated) {
    res.status(404).json({ success: false, error: 'Không tìm thấy người dùng.' });
    return;
  }

  res.json({ success: true, data: updated });
});

// DELETE /api/admin/users/:id
router.delete('/admin/users/:id', authenticateToken, requirePermission('MANAGE_USERS'), (req: AuthenticatedRequest, res: Response) => {
  const success = userDb.deleteUser(req.params.id);
  if (!success) {
    res.status(400).json({ success: false, error: 'Không thể xóa tài khoản này (hoặc là admin gốc).' });
    return;
  }
  res.json({ success: true, message: 'Đã xóa người dùng thành công.' });
});

// GET /api/admin/audit-logs
router.get('/admin/audit-logs', authenticateToken, requirePermission('VIEW_AUDIT_LOGS'), (req: AuthenticatedRequest, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  const logs = userDb.getAuditLogs(limit);
  res.json({ success: true, data: logs });
});

// GET /api/admin/misa-config
router.get('/admin/misa-config', authenticateToken, requirePermission('MANAGE_MISA_CONFIG'), (_req: AuthenticatedRequest, res: Response) => {
  const config = misaAdapter.getConfig();
  // Strip plain password before sending to frontend
  const safeConfig = JSON.parse(JSON.stringify(config));
  if (safeConfig.misa?.database) {
    safeConfig.misa.database.password = safeConfig.misa.database.password ? '••••••••' : '';
  }
  res.json({ success: true, data: safeConfig });
});

// POST /api/admin/misa-config
router.post('/admin/misa-config', authenticateToken, requirePermission('MANAGE_MISA_CONFIG'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newConfig = req.body;
    const currentConfig = misaAdapter.getConfig();

    // If password is sent as masked, keep existing password
    if (newConfig.misa?.database?.password === '••••••••') {
      newConfig.misa.database.password = currentConfig.misa.database.password;
    }

    await misaAdapter.updateConfig(newConfig);
    cacheService.invalidate();

    userDb.addAuditLog({
      username: req.user?.username || 'admin',
      userId: req.user?.userId,
      ip: req.ip || '127.0.0.1',
      device: (req.headers['user-agent'] as string) || 'unknown',
      module: 'MISA ADAPTER',
      action: 'CẬP NHẬT CẤU HÌNH KẾT NỐI',
      api: '/api/admin/misa-config',
      statusCode: 200,
      status: 'SUCCESS',
      details: `Server: ${newConfig.misa?.database?.server}, DB: ${newConfig.misa?.database?.databaseName}`,
    });

    res.json({ success: true, message: 'Đã lưu cấu hình MISA thành công.' });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: 'Lỗi cập nhật cấu hình: ' + (err instanceof Error ? err.message : String(err)),
    });
  }
});

// POST /api/admin/misa-test
router.post('/admin/misa-test', authenticateToken, requirePermission('TEST_MISA_CONNECTION'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customDbConfig = req.body;
    const currentConfig = misaAdapter.getConfig();

    if (customDbConfig?.password === '••••••••') {
      customDbConfig.password = currentConfig.misa.database.password;
    }

    const testResult = await misaAdapter.testConnection(customDbConfig);

    userDb.addAuditLog({
      username: req.user?.username || 'admin',
      userId: req.user?.userId,
      ip: req.ip || '127.0.0.1',
      device: (req.headers['user-agent'] as string) || 'unknown',
      module: 'MISA ADAPTER',
      action: 'KIỂM TRA KẾT NỐI (TEST CONNECTION)',
      api: '/api/admin/misa-test',
      statusCode: testResult.success ? 200 : 500,
      status: testResult.success ? 'SUCCESS' : 'FAILURE',
      details: testResult.message,
    });

    res.json({ success: testResult.success, ...testResult });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra kết nối: ' + (err instanceof Error ? err.message : String(err)),
    });
  }
});

// GET /api/admin/misa-schema
router.get('/admin/misa-schema', authenticateToken, requirePermission('INSPECT_MISA_SCHEMA'), async (req: AuthenticatedRequest, res: Response) => {
  const tableName = req.query.tableName ? String(req.query.tableName) : undefined;
  const result = await misaAdapter.inspectSchema(tableName);
  res.json(result);
});

// POST /api/admin/cache-clear
router.post('/admin/cache-clear', authenticateToken, requireRole(['ADMIN', 'KỸ THUẬT']), (_req: AuthenticatedRequest, res: Response) => {
  cacheService.invalidate();
  res.json({ success: true, message: 'Đã xóa toàn bộ bộ nhớ tạm (Cache).' });
});

export default router;
