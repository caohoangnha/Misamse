export type UserRole = 'ADMIN' | 'KẾ TOÁN' | 'KHO' | 'KINH DOANH' | 'GIÁM ĐỐC' | 'KỸ THUẬT';

export type Permission =
  | 'VIEW_DASHBOARD'
  | 'VIEW_INVENTORY'
  | 'VIEW_PRODUCTS'
  | 'VIEW_COST_PRICE'
  | 'VIEW_CUSTOMERS'
  | 'VIEW_SUPPLIERS'
  | 'VIEW_RECEIVABLES'
  | 'VIEW_PAYABLES'
  | 'VIEW_SALES'
  | 'VIEW_PURCHASES'
  | 'VIEW_REPORTS'
  | 'MANAGE_USERS'
  | 'MANAGE_ROLES'
  | 'VIEW_AUDIT_LOGS'
  | 'MANAGE_MISA_CONFIG'
  | 'TEST_MISA_CONNECTION'
  | 'INSPECT_MISA_SCHEMA';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  barcode?: string;
  costPrice?: number;
  unitPrice?: number;
  minStock?: number;
  inventoryQuantity: number;
  inventoryAmount?: number;
  stockName?: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface CustomerItem {
  id: string;
  code: string;
  name: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  email?: string;
  currentDebt?: number;
}

export interface SupplierItem {
  id: string;
  code: string;
  name: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  currentPayable?: number;
}

export interface ReceivableItem {
  id: string;
  customerCode: string;
  customerName: string;
  voucherNo: string;
  dueDate: string;
  remainingAmount: number;
  daysOverdue: number;
}

export interface PayableItem {
  id: string;
  supplierCode: string;
  supplierName: string;
  voucherNo: string;
  dueDate: string;
  remainingAmount: number;
  daysOverdue: number;
}

export interface SaleOrderItem {
  id: string;
  orderNo: string;
  orderDate: string;
  customerName: string;
  totalAmount: number;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  itemCount: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalInventoryQty: number;
  totalInventoryValue?: number;
  totalReceivables?: number;
  totalPayables?: number;
  monthlyRevenue?: number;
  totalCustomers: number;
  totalSuppliers: number;
  lowStockCount: number;
  outOfStockCount: number;
  connectionStatus: {
    connected: boolean;
    server: string;
    database: string;
    latencyMs?: number;
    lastChecked: string;
    message?: string;
  };
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  components: {
    web: { status: string; message: string };
    api: { status: string; port: number };
    misaAdapter: { status: string; latencyMs: number; message: string };
    database: { status: string; type: string; mode: string };
    cache: { status: string; stats: any };
    security: { rateLimiter: string; jwtAuth: string; auditLogger: string };
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  userId?: string;
  ip: string;
  device: string;
  module: string;
  action: string;
  api: string;
  statusCode: number;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  details?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}
