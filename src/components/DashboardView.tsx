import React from 'react';
import {
  Boxes,
  TrendingUp,
  AlertTriangle,
  XCircle,
  CreditCard,
  Building2,
  Users,
  ShieldCheck,
  Server,
  ArrowRight,
} from 'lucide-react';
import { DashboardStats, AuthUser } from '../types';

interface DashboardViewProps {
  stats: DashboardStats | null;
  user: AuthUser;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ stats, user, onNavigate }) => {
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '***';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const hasCostPermission = user.role === 'ADMIN' || user.permissions.includes('VIEW_COST_PRICE');
  const hasReceivablesPermission = user.role === 'ADMIN' || user.permissions.includes('VIEW_RECEIVABLES');
  const hasPayablesPermission = user.role === 'ADMIN' || user.permissions.includes('VIEW_PAYABLES');
  const hasSalesPermission = user.role === 'ADMIN' || user.permissions.includes('VIEW_SALES');

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500 text-white tracking-wide uppercase">
                An Toàn Tuyệt Đối
              </span>
              <span className="text-xs text-blue-200">
                Phiên làm việc: {user.fullName} ({user.role})
              </span>
            </div>
            <h1 className="mt-1 text-lg sm:text-xl font-bold">
              Cổng Tra Cứu Dữ Liệu Nội Bộ MISA SME
            </h1>
            <p className="mt-0.5 text-xs text-blue-200 max-w-2xl">
              Hệ thống hoạt động ở chế độ READ ONLY, chỉ đọc dữ liệu từ SQL Server MISA trong mạng nội bộ, kết nối an toàn ra Internet qua Cloudflare Tunnel / VPN.
            </p>
          </div>
          <button
            id="btn-dash-quick-inventory"
            onClick={() => onNavigate('inventory')}
            className="shrink-0 px-3.5 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Boxes className="w-4 h-4" />
            Tra cứu tồn kho ngay
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Mặt hàng quản lý</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatNumber(stats?.totalProducts)}
          </div>
          <div className="mt-1 flex items-center text-xs text-slate-500">
            <span>Tổng tồn kho: </span>
            <strong className="ml-1 text-slate-700">{formatNumber(stats?.totalInventoryQty)}</strong>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Giá trị tồn kho (Giá vốn)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {hasCostPermission ? formatCurrency(stats?.totalInventoryValue) : '*** (Bảo mật)'}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {hasCostPermission ? 'Theo giá vốn MISA SME' : 'Chỉ cấp quyền cho Giám Đốc/Kế Toán'}
          </div>
        </div>

        {/* Total Receivables */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Công nợ phải thu</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {hasReceivablesPermission ? formatCurrency(stats?.totalReceivables) : '*** (Bảo mật)'}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Khách hàng chưa thanh toán
          </div>
        </div>

        {/* Total Payables */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Công nợ phải trả</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {hasPayablesPermission ? formatCurrency(stats?.totalPayables) : '*** (Bảo mật)'}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Nợ nhà cung cấp đến hạn
          </div>
        </div>
      </div>

      {/* Second Row: Stock Alerts & Customers/Suppliers Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Alerts Card */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Cảnh Báo Tồn Kho Cần Lưu Ý
            </h3>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem chi tiết →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
              <div className="p-2 rounded-md bg-amber-100 text-amber-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-amber-900 block">
                  Tồn kho dưới mức tối thiểu
                </span>
                <span className="text-2xl font-bold text-amber-950 mt-1 block">
                  {formatNumber(stats?.lowStockCount)} <span className="text-xs font-normal">mặt hàng</span>
                </span>
                <p className="text-[11px] text-amber-800 mt-1">
                  Số lượng tồn &le; mức tối thiểu quy định trong MISA SME. Cần xem xét đặt hàng.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-red-50/70 border border-red-200/80 flex items-start gap-3">
              <div className="p-2 rounded-md bg-red-100 text-red-700 shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-red-900 block">
                  Hàng hóa đã hết tồn kho
                </span>
                <span className="text-2xl font-bold text-red-950 mt-1 block">
                  {formatNumber(stats?.outOfStockCount)} <span className="text-xs font-normal">mặt hàng</span>
                </span>
                <p className="text-[11px] text-red-800 mt-1">
                  Số lượng tồn = 0. Không thể giao hàng ngay cho khách nếu có đơn mới.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                Khách hàng: <strong>{formatNumber(stats?.totalCustomers)}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                Nhà cung cấp: <strong>{formatNumber(stats?.totalSuppliers)}</strong>
              </span>
            </div>
            {hasSalesPermission && (
              <span className="text-slate-600">
                Doanh thu tháng này: <strong className="text-emerald-600 font-semibold">{formatCurrency(stats?.monthlyRevenue)}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Security & Health Card */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Server className="w-4 h-4 text-blue-600" />
            Trạng Thái Kết Nối & An Ninh
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>SQL Server MISA:</span>
                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-800 font-bold">
                  READ ONLY
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {stats?.connectionStatus.message || 'Chế độ dự phòng an toàn (MISA SME Adapter)'}
              </p>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Database server:</span>
              <span className="font-medium text-slate-800">{stats?.connectionStatus.server || 'localhost'}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Database name:</span>
              <span className="font-medium text-slate-800">{stats?.connectionStatus.database || 'MISA_SME_2022'}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Mã hóa kết nối:</span>
              <span className="font-semibold text-emerald-600">TLS 1.3 / HTTPS</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Cổng SQL Server ra Internet:</span>
              <span className="font-bold text-red-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                ĐÃ ĐÓNG (Không public)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
