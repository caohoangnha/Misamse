import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { DashboardStats, AuthUser } from '../types';

interface ReportsViewProps {
  stats: DashboardStats | null;
  user: AuthUser;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ stats, user }) => {
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '***';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const hasCostPermission = user.role === 'ADMIN' || user.permissions.includes('VIEW_COST_PRICE');

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Báo Cáo Quản Trị & Phân Tích (MISA SME)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tổng hợp dữ liệu tồn kho, doanh thu và cảnh báo nghiệp vụ theo thời gian thực.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
            <TrendingUp className="w-4 h-4" />
            Doanh Thu Tháng Hiện Tại
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {stats?.monthlyRevenue ? formatCurrency(stats.monthlyRevenue) : '*** (Ẩn bảo mật)'}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Tổng giá trị đơn hàng bán ra đã xuất hóa đơn trong tháng.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold">
            <TrendingUp className="w-4 h-4" />
            Tổng Giá Trị Tồn Kho (Giá Vốn)
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {hasCostPermission ? formatCurrency(stats?.totalInventoryValue) : '*** (Ẩn bảo mật)'}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Giá vốn tính theo phương pháp bình quân gia quyền từ MISA.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4" />
            Tỷ Lệ Tồn Kho Cần Bổ Sung
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {stats ? Math.round(((stats.lowStockCount + stats.outOfStockCount) / (stats.totalProducts || 1)) * 100) : 0}%
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Số mặt hàng đang ở mức báo động tồn thấp hoặc hết hàng.
          </p>
        </div>
      </div>

      {/* Breakdown Breakdown Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Tình Trạng Sức Khỏe Kho Hàng
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Hàng hóa an toàn (Tồn trên mức tối thiểu)
              </span>
              <span>
                {stats ? stats.totalProducts - stats.lowStockCount - stats.outOfStockCount : 0} mặt hàng
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 rounded-full"
                style={{
                  width: stats ? `${((stats.totalProducts - stats.lowStockCount - stats.outOfStockCount) / stats.totalProducts) * 100}%` : '0%',
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span className="flex items-center gap-1.5 text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" />
                Hàng hóa tồn thấp (Cần đặt hàng thêm)
              </span>
              <span>{stats?.lowStockCount || 0} mặt hàng</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-amber-500 h-2.5 rounded-full"
                style={{
                  width: stats ? `${(stats.lowStockCount / stats.totalProducts) * 100}%` : '0%',
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span className="flex items-center gap-1.5 text-red-700">
                <XCircle className="w-3.5 h-3.5" />
                Hàng hóa hết hàng trong kho
              </span>
              <span>{stats?.outOfStockCount || 0} mặt hàng</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-red-500 h-2.5 rounded-full"
                style={{
                  width: stats ? `${(stats.outOfStockCount / stats.totalProducts) * 100}%` : '0%',
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
