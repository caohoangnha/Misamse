import bcrypt from 'bcryptjs';
import { User, UserRole, Permission, AuditLogEntry } from '../types/index.js';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'VIEW_DASHBOARD',
    'VIEW_INVENTORY',
    'VIEW_PRODUCTS',
    'VIEW_COST_PRICE',
    'VIEW_CUSTOMERS',
    'VIEW_SUPPLIERS',
    'VIEW_RECEIVABLES',
    'VIEW_PAYABLES',
    'VIEW_SALES',
    'VIEW_PURCHASES',
    'VIEW_REPORTS',
    'MANAGE_USERS',
    'MANAGE_ROLES',
    'VIEW_AUDIT_LOGS',
    'MANAGE_MISA_CONFIG',
    'TEST_MISA_CONNECTION',
    'INSPECT_MISA_SCHEMA',
  ],
  'GIÁM ĐỐC': [
    'VIEW_DASHBOARD',
    'VIEW_INVENTORY',
    'VIEW_PRODUCTS',
    'VIEW_COST_PRICE',
    'VIEW_CUSTOMERS',
    'VIEW_SUPPLIERS',
    'VIEW_RECEIVABLES',
    'VIEW_PAYABLES',
    'VIEW_SALES',
    'VIEW_PURCHASES',
    'VIEW_REPORTS',
  ],
  'KẾ TOÁN': [
    'VIEW_DASHBOARD',
    'VIEW_INVENTORY',
    'VIEW_PRODUCTS',
    'VIEW_COST_PRICE',
    'VIEW_CUSTOMERS',
    'VIEW_SUPPLIERS',
    'VIEW_RECEIVABLES',
    'VIEW_PAYABLES',
    'VIEW_SALES',
    'VIEW_PURCHASES',
    'VIEW_REPORTS',
  ],
  KHO: [
    'VIEW_DASHBOARD',
    'VIEW_INVENTORY',
    'VIEW_PRODUCTS',
    // Specifically excluded: VIEW_COST_PRICE, VIEW_SALES, VIEW_RECEIVABLES, VIEW_PAYABLES
  ],
  'KINH DOANH': [
    'VIEW_DASHBOARD',
    'VIEW_PRODUCTS',
    'VIEW_INVENTORY',
    'VIEW_CUSTOMERS',
    'VIEW_SALES',
    // Specifically excluded: VIEW_COST_PRICE, VIEW_PAYABLES, SENSITIVE ACCOUNTING
  ],
  'KỸ THUẬT': [
    'VIEW_DASHBOARD',
    'TEST_MISA_CONNECTION',
    'INSPECT_MISA_SCHEMA',
    'VIEW_AUDIT_LOGS',
  ],
};

// Default pre-seeded users
const initialUsers: User[] = [
  {
    id: 'usr_admin',
    username: 'admin',
    fullName: 'Quản trị viên Hệ thống',
    email: 'admin@congty.vn',
    role: 'ADMIN',
    permissions: ROLE_PERMISSIONS['ADMIN'],
    isActive: true,
    // Password is Admin@123456
    passwordHash: bcrypt.hashSync('Admin@123456', 10),
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_giamdoc',
    username: 'giamdoc',
    fullName: 'Ban Giám Đốc',
    email: 'giamdoc@congty.vn',
    role: 'GIÁM ĐỐC',
    permissions: ROLE_PERMISSIONS['GIÁM ĐỐC'],
    isActive: true,
    // Password is Giamdoc@123456
    passwordHash: bcrypt.hashSync('Giamdoc@123456', 10),
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_ketoan',
    username: 'ketoan',
    fullName: 'Trần Thị Mai (Kế toán trưởng)',
    email: 'ketoan@congty.vn',
    role: 'KẾ TOÁN',
    permissions: ROLE_PERMISSIONS['KẾ TOÁN'],
    isActive: true,
    // Password is Ketoan@123456
    passwordHash: bcrypt.hashSync('Ketoan@123456', 10),
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_kho',
    username: 'kho',
    fullName: 'Nguyễn Văn Tuấn (Quản lý kho)',
    email: 'kho@congty.vn',
    role: 'KHO',
    permissions: ROLE_PERMISSIONS['KHO'],
    isActive: true,
    // Password is Kho@123456
    passwordHash: bcrypt.hashSync('Kho@123456', 10),
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_sale',
    username: 'kinhdoanh',
    fullName: 'Lê Hoàng Nam (Phòng Kinh doanh)',
    email: 'sale@congty.vn',
    role: 'KINH DOANH',
    permissions: ROLE_PERMISSIONS['KINH DOANH'],
    isActive: true,
    // Password is Sale@123456
    passwordHash: bcrypt.hashSync('Sale@123456', 10),
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_it',
    username: 'it_support',
    fullName: 'Vũ Quốc Huy (Chuyên viên IT)',
    email: 'it@congty.vn',
    role: 'KỸ THUẬT',
    permissions: ROLE_PERMISSIONS['KỸ THUẬT'],
    isActive: true,
    // Password is IT@123456
    passwordHash: bcrypt.hashSync('IT@123456', 10),
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

let usersStore: User[] = [...initialUsers];
const auditLogsStore: AuditLogEntry[] = [
  {
    id: 'log_init',
    timestamp: new Date().toISOString(),
    username: 'system',
    ip: '127.0.0.1',
    device: 'Windows Server 2022 (Localhost)',
    module: 'HỆ THỐNG',
    action: 'KHỞI ĐỘNG',
    api: '/api/health',
    statusCode: 200,
    status: 'SUCCESS',
    details: 'Hệ thống MISA SME Portal khởi động an toàn ở chế độ READ ONLY',
  }
];

export const userDb = {
  getAllUsers(): Omit<User, 'passwordHash'>[] {
    return usersStore.map(({ passwordHash, ...user }) => user);
  },

  getUserByUsername(username: string): User | undefined {
    return usersStore.find((u) => u.username.toLowerCase() === username.toLowerCase());
  },

  getUserById(id: string): User | undefined {
    return usersStore.find((u) => u.id === id);
  },

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    usersStore.push(newUser);
    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): User | null {
    const index = usersStore.findIndex((u) => u.id === id);
    if (index === -1) return null;

    usersStore[index] = { ...usersStore[index], ...updates };
    return usersStore[index];
  },

  deleteUser(id: string): boolean {
    const index = usersStore.findIndex((u) => u.id === id);
    if (index === -1) return false;
    // Don't delete last admin
    if (usersStore[index].username === 'admin') return false;
    usersStore.splice(index, 1);
    return true;
  },

  updateLastLogin(id: string): void {
    const user = usersStore.find((u) => u.id === id);
    if (user) {
      user.lastLogin = new Date().toISOString();
    }
  },

  addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const log: AuditLogEntry = {
      ...entry,
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
    };
    auditLogsStore.unshift(log);
    // Keep max 2000 log records in memory
    if (auditLogsStore.length > 2000) {
      auditLogsStore.pop();
    }
  },

  getAuditLogs(limit: number = 100): AuditLogEntry[] {
    return auditLogsStore.slice(0, limit);
  },
};
