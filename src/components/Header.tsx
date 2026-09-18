import React from 'react';
import {
  Database,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Menu,
  Server,
  UserCheck,
} from 'lucide-react';
import { AuthUser, SystemHealth } from '../types';

interface HeaderProps {
  user: AuthUser;
  health: SystemHealth | null;
  onLogout: () => void;
  onToggleSidebar: () => void;
  onRefreshData: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  health,
  onLogout,
  onToggleSidebar,
  onRefreshData,
  isRefreshing = false,
}) => {
  const isMisaConnected = health?.components.misaAdapter.status === 'CONNECTED';

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800 border-red-200',
    'GIÁM ĐỐC': 'bg-purple-100 text-purple-800 border-purple-200',
    'KẾ TOÁN': 'bg-blue-100 text-blue-800 border-blue-200',
    KHO: 'bg-amber-100 text-amber-800 border-amber-200',
    'KINH DOANH': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'KỸ THUẬT': 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  MISA SME Portal
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  READ ONLY
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Cổng tra cứu dữ liệu nội bộ an toàn
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live MISA Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs">
          <Server className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-600 font-medium">MISA SQL:</span>
          {isMisaConnected ? (
            <span className="inline-flex items-center text-emerald-700 font-semibold gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ĐÃ KẾT NỐI ({health?.components.misaAdapter.latencyMs ?? 1}ms)
            </span>
          ) : (
            <span className="inline-flex items-center text-amber-700 font-medium gap-1.5" title="Đang chạy chế độ an toàn qua Adapter dự phòng">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              CHẾ ĐỘ DỰ PHÒNG (READ ONLY)
            </span>
          )}
        </div>

        {/* Right: Quick Refresh, User info & Logout */}
        <div className="flex items-center gap-3">
          <button
            id="btn-refresh-cache"
            onClick={onRefreshData}
            disabled={isRefreshing}
            className={`p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors ${
              isRefreshing ? 'opacity-50' : ''
            }`}
            title="Làm mới bộ nhớ đệm (Cache)"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 leading-tight flex items-center justify-end gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                {user.fullName}
              </div>
              <span
                className={`inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-semibold border ${
                  roleColors[user.role] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {user.role}
              </span>
            </div>

            <button
              id="btn-logout"
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
