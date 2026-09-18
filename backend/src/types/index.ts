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

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  passwordHash?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface AuditLogEntry {
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

export interface MisaDatabaseConfig {
  type: string;
  server: string;
  port: number;
  databaseName: string;
  companyDatabase?: string;
  user: string;
  password?: string;
  connectionTimeout?: number;
  requestTimeout?: number;
  encrypt?: boolean;
  trustServerCertificate?: boolean;
  readOnly?: boolean;
}

export interface MisaTableMappings {
  products: {
    tableName: string;
    idField: string;
    codeField: string;
    nameField: string;
    unitField: string;
    barcodeField: string;
    costPriceField: string;
    unitPriceField: string;
    minStockField: string;
    isActiveField: string;
  };
  inventory: {
    tableName: string;
    itemCodeField: string;
    stockCodeField: string;
    stockNameField: string;
    quantityField: string;
    amountField: string;
  };
  customers: {
    tableName: string;
    typeCondition: string;
    idField: string;
    codeField: string;
    nameField: string;
    phoneField: string;
    addressField: string;
    taxCodeField: string;
    emailField: string;
  };
  suppliers: {
    tableName: string;
    typeCondition: string;
    idField: string;
    codeField: string;
    nameField: string;
    phoneField: string;
    addressField: string;
    taxCodeField: string;
  };
  receivables: {
    tableName: string;
    customerCodeField: string;
    customerNameField: string;
    amountField: string;
    dueDateField: string;
    voucherNoField: string;
  };
  payables: {
    tableName: string;
    supplierCodeField: string;
    supplierNameField: string;
    amountField: string;
    dueDateField: string;
    voucherNoField: string;
  };
}

export interface MisaConfigFile {
  misa: {
    version: string;
    versionName: string;
    description: string;
    database: MisaDatabaseConfig;
    cache: {
      enabled: boolean;
      ttlSeconds: number;
    };
    mappings: MisaTableMappings;
  };
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

export interface PurchaseVoucherItem {
  id: string;
  voucherNo: string;
  voucherDate: string;
  supplierName: string;
  totalAmount: number;
  status: 'RECEIVED' | 'IN_TRANSIT';
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
