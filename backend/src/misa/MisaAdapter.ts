import {
  ProductItem,
  CustomerItem,
  SupplierItem,
  ReceivableItem,
  PayableItem,
  SaleOrderItem,
  PurchaseVoucherItem,
  DashboardStats,
  MisaConfigFile,
} from '../types/index.js';

export interface QueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filterStatus?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  serverVersion?: string;
  databaseName?: string;
  errorDetails?: string;
}

export interface SchemaTableInfo {
  tableName: string;
  tableType: string;
  columnCount: number;
  columns?: Array<{
    columnName: string;
    dataType: string;
    isNullable: string;
    maxLength?: number;
  }>;
}

export interface IMisaAdapter {
  init(config: MisaConfigFile): Promise<void>;
  testConnection(customConfig?: Partial<MisaConfigFile['misa']['database']>): Promise<ConnectionTestResult>;
  inspectSchema(tableName?: string): Promise<{ success: boolean; tables: SchemaTableInfo[]; error?: string }>;
  getHealth(): Promise<{ connected: boolean; latencyMs: number; message: string }>;
  getProducts(options?: QueryOptions): Promise<PaginatedResult<ProductItem>>;
  getInventory(options?: QueryOptions): Promise<PaginatedResult<ProductItem>>;
  getInventoryByCode(code: string): Promise<ProductItem | null>;
  getCustomers(options?: QueryOptions): Promise<PaginatedResult<CustomerItem>>;
  getSuppliers(options?: QueryOptions): Promise<PaginatedResult<SupplierItem>>;
  getReceivables(options?: QueryOptions): Promise<PaginatedResult<ReceivableItem>>;
  getPayables(options?: QueryOptions): Promise<PaginatedResult<PayableItem>>;
  getSales(options?: QueryOptions): Promise<PaginatedResult<SaleOrderItem>>;
  getPurchases(options?: QueryOptions): Promise<PaginatedResult<PurchaseVoucherItem>>;
  getDashboardStats(): Promise<DashboardStats>;
  getConfig(): MisaConfigFile;
  updateConfig(newConfig: MisaConfigFile): Promise<void>;
}
