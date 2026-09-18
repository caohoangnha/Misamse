import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Users,
  Building2,
  ReceiptText,
  BarChart3,
  Settings,
  ShieldCheck,
  FileSpreadsheet,
  X,
  Server,
  UserCog,
  FileClock,
  Cpu,
  ShoppingBag,
} from 'lucide-react';
import { AuthUser, Permission, UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  user: AuthUser;
  isOpen: boolean;
  onClose: () => void;
  onSwitchRoleDemo?: (role: UserRole) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  user,
  isOpen,
  onClose,
  onSwitchRoleDemo,
}) => {
  const hasPermission = (permission: Permission) => {
    if (user.role === 'ADMIN') return true;
    return user.permissions.includes(permission);
  };

  const navSections = [
    {
      title: 'TỔNG QUAN',
      items: [
        {
          id: 'dashboard',
          label: 'Tổng quan (Dashboard)',
          icon: LayoutDashboard,
          visible: hasPermission('VIEW_DASHBOARD'),
        },
      ],
    },
    {
      title: 'KHO HÀNG',
      items: [
        {
          id: 'inventory',
          label: 'Tra cứu tồn kho',
          icon: Boxes,
          visible: hasPermission('VIEW_INVENTORY'),
          badge: 'Ưu tiên',
        },
        {
          id: 'products',
          label: 'Danh mục hàng hóa',
          icon: FileSpreadsheet,
          visible: hasPermission('VIEW_PRODUCTS'),
        },
      ],
    },
    {
      title: 'BÁN HÀNG',
      items: [
        {
          id: 'customers',
          label: 'Khách hàng',
          icon: Users,
          visible: hasPermission('VIEW_CUSTOMERS'),
        },
        {
          id: 'sales',
          label: 'Đơn hàng & Doanh thu',
          icon: ShoppingBag,
          visible: hasPermission('VIEW_SALES'),
        },
      ],
    },
    {
      title: 'MUA HÀNG',
      items: [
        {
          id: 'suppliers',
          label: 'Nhà cung cấp',
          icon: Building2,
          visible: hasPermission('VIEW_SUPPLIERS'),
        },
        {
          id: 'purchases',
          label: 'Phiếu nhập kho',
          icon: ReceiptText,
          visible: hasPermission('VIEW_PURCHASES'),
        },
      ],
    },
    {
      title: 'CÔNG NỢ',
      items: [
        {
          id: 'receivables',
          label: 'Phải thu khách hàng',
          icon: ReceiptText,
          visible: hasPermission('VIEW_RECEIVABLES'),
        },
        {
          id: 'payables',
          label: 'Phải trả nhà cung cấp',
          icon: ReceiptText,
          visible: hasPermission('VIEW_PAYABLES'),
        },
      ],
    },
    {
      title: 'BÁO CÁO',
      items: [
        {
          id: 'reports',
          label: 'Báo cáo quản trị',
          icon: BarChart3,
          visible: hasPermission('VIEW_REPORTS'),
        },
      ],
    },
    {
      title: 'HỆ THỐNG',
      items: [
        {
          id: 'misa-connection',
          label: 'Kết nối MISA SME',
          icon: Server,
          visible: hasPermission('MANAGE_MISA_CONFIG') || hasPermission('TEST_MISA_CONNECTION'),
          badge: 'Cấu hình',
        },
        {
          id: 'users',
          label: 'Người dùng & Phân quyền',
          icon: UserCog,
          visible: hasPermission('MANAGE_USERS'),
        },
        {
          id: 'audit-logs',
          label: 'Nhật ký kiểm toán',
          icon: FileClock,
          visible: hasPermission('VIEW_AUDIT_LOGS'),
        },
        {
          id: 'system-config',
          label: 'Cấu hình & Cache',
          icon: Cpu,
          visible: user.role === 'ADMIN' || user.role === 'KỸ THUẬT',
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">MISA SME PORTAL</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
          {navSections.map((section) => {
            const visibleItems = section.items.filter((item) => item.visible);
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <p className="px-3 text-[11px] font-bold text-slate-400 tracking-wider">
                  {section.title}
                </p>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-${item.id}`}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            isActive
                              ? 'bg-blue-700 text-white'
                              : 'bg-slate-800 text-blue-300 border border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Demo Fast Role Switcher (For testing permissions instantly) */}
        {onSwitchRoleDemo && (
          <div className="p-3 border-t border-slate-800 bg-slate-950/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                THỬ NGHIỆM PHÂN QUYỀN
              </span>
              <Settings className="w-3 h-3 text-slate-500" />
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              {(['ADMIN', 'KẾ TOÁN', 'KHO', 'KINH DOANH', 'GIÁM ĐỐC', 'KỸ THUẬT'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onSwitchRoleDemo(r)}
                  className={`px-2 py-1 rounded text-left truncate transition-colors ${
                    user.role === r
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
