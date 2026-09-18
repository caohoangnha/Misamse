import {
  AuthUser,
  DashboardStats,
  ProductItem,
  CustomerItem,
  SupplierItem,
  ReceivableItem,
  PayableItem,
  SaleOrderItem,
  SystemHealth,
  AuditLog,
  UserAccount,
} from '../types';

const TOKEN_KEY = 'misa_portal_token';
const USER_KEY = 'misa_portal_user';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      authStorage.clear();
      // Optional callback or event
    }
    throw new Error(data.error || data.message || 'Lỗi xử lý yêu cầu.');
  }

  return data;
}

export const api = {
  // Auth
  async login(username: string, password: string):Promise<{ success: boolean; data: { accessToken: string; user: AuthUser } }> {
    const res = await request<{ success: boolean; data: { accessToken: string; user: AuthUser } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.data?.accessToken) {
      authStorage.setToken(res.data.accessToken);
      authStorage.setUser(res.data.user);
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      authStorage.clear();
    }
  },

  async getCurrentUser(): Promise<AuthUser> {
    const res = await request<{ success: boolean; data: AuthUser }>('/api/auth/me');
    authStorage.setUser(res.data);
    return res.data;
  },

  // Health
  async getHealth(): Promise<SystemHealth> {
    return request<SystemHealth>('/api/health');
  },

  // Dashboard
  async getDashboard(): Promise<{ success: boolean; data: DashboardStats }> {
    return request<{ success: boolean; data: DashboardStats }>('/api/dashboard');
  },

  // Products & Inventory
  async getProducts(params: { page?: number; limit?: number; search?: string; filterStatus?: string } = {}): Promise<{ data: ProductItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.filterStatus) query.set('filterStatus', params.filterStatus);
    return request<{ data: ProductItem[]; total: number }>(`/api/products?${query.toString()}`);
  },

  async getInventory(params: { page?: number; limit?: number; search?: string; filterStatus?: string } = {}): Promise<{ data: ProductItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.filterStatus) query.set('filterStatus', params.filterStatus);
    return request<{ data: ProductItem[]; total: number }>(`/api/inventory?${query.toString()}`);
  },

  async getInventoryByCode(code: string): Promise<ProductItem> {
    const res = await request<{ success: boolean; data: ProductItem }>(`/api/inventory/${encodeURIComponent(code)}`);
    return res.data;
  },

  // Customers & Sales
  async getCustomers(params: { page?: number; limit?: number; search?: string } = {}): Promise<{ data: CustomerItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    return request<{ data: CustomerItem[]; total: number }>(`/api/customers?${query.toString()}`);
  },

  async getSales(params: { page?: number; limit?: number; search?: string } = {}): Promise<{ data: SaleOrderItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    return request<{ data: SaleOrderItem[]; total: number }>(`/api/sales?${query.toString()}`);
  },

  // Suppliers
  async getSuppliers(params: { page?: number; limit?: number; search?: string } = {}): Promise<{ data: SupplierItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    return request<{ data: SupplierItem[]; total: number }>(`/api/suppliers?${query.toString()}`);
  },

  // Debt
  async getReceivables(params: { page?: number; limit?: number; search?: string } = {}): Promise<{ data: ReceivableItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    return request<{ data: ReceivableItem[]; total: number }>(`/api/receivables?${query.toString()}`);
  },

  async getPayables(params: { page?: number; limit?: number; search?: string } = {}): Promise<{ data: PayableItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    return request<{ data: PayableItem[]; total: number }>(`/api/payables?${query.toString()}`);
  },

  // Admin & System
  async getUsers(): Promise<UserAccount[]> {
    const res = await request<{ success: boolean; data: UserAccount[] }>('/api/admin/users');
    return res.data;
  },

  async createUser(userData: any): Promise<UserAccount> {
    const res = await request<{ success: boolean; data: UserAccount }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return res.data;
  },

  async updateUser(id: string, updates: any): Promise<UserAccount> {
    const res = await request<{ success: boolean; data: UserAccount }>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.data;
  },

  async deleteUser(id: string): Promise<void> {
    await request(`/api/admin/users/${id}`, { method: 'DELETE' });
  },

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    const res = await request<{ success: boolean; data: AuditLog[] }>(`/api/admin/audit-logs?limit=${limit}`);
    return res.data;
  },

  async getMisaConfig(): Promise<any> {
    const res = await request<{ success: boolean; data: any }>('/api/admin/misa-config');
    return res.data;
  },

  async updateMisaConfig(config: any): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/admin/misa-config', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  async testMisaConnection(customDbConfig?: any): Promise<any> {
    return request<any>('/api/admin/misa-test', {
      method: 'POST',
      body: JSON.stringify(customDbConfig || {}),
    });
  },

  async inspectMisaSchema(tableName?: string): Promise<any> {
    const query = tableName ? `?tableName=${encodeURIComponent(tableName)}` : '';
    return request<any>(`/api/admin/misa-schema${query}`);
  },

  async clearCache(): Promise<void> {
    await request('/api/admin/cache-clear', { method: 'POST' });
  },
};
