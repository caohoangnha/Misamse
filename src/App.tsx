import React, { useState, useEffect, useCallback } from 'react';
import { api, authStorage } from './services/api';
import { AuthUser, DashboardStats, SystemHealth, UserRole } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { CustomersView } from './components/CustomersView';
import { SuppliersView } from './components/SuppliersView';
import { DebtView } from './components/DebtView';
import { SalesView } from './components/SalesView';
import { ReportsView } from './components/ReportsView';
import { MisaConnectionView } from './components/MisaConnectionView';
import { UserManagementView } from './components/UserManagementView';
import { AuditLogsView } from './components/AuditLogsView';
import { SystemConfigView } from './components/SystemConfigView';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      const savedToken = authStorage.getToken();
      if (savedToken) {
        try {
          const currentUser = await api.getCurrentUser();
          setUser(currentUser);
        } catch {
          authStorage.clear();
          setUser(null);
        }
      }
      setInitialLoading(false);
    };
    initSession();
  }, []);

  // Fetch health and dashboard metrics
  const fetchOverviewData = useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const [healthRes, dashRes] = await Promise.allSettled([
        api.getHealth(),
        api.getDashboard(),
      ]);

      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value);
      }
      if (dashRes.status === 'fulfilled' && dashRes.value.success) {
        setStats(dashRes.value.data);
      }
    } catch {
      // Handled
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchOverviewData();
    }
  }, [user, fetchOverviewData]);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setActiveTab('dashboard');
  };

  // Demo role switcher helper for immediate evaluation
  const handleSwitchRoleDemo = async (targetRole: UserRole) => {
    const roleCredentialMap: Record<UserRole, { u: string; p: string }> = {
      ADMIN: { u: 'admin', p: 'Admin@123456' },
      'GIÁM ĐỐC': { u: 'giamdoc', p: 'Giamdoc@123456' },
      'KẾ TOÁN': { u: 'ketoan', p: 'Ketoan@123456' },
      KHO: { u: 'kho', p: 'Kho@123456' },
      'KINH DOANH': { u: 'kinhdoanh', p: 'Sale@123456' },
      'KỸ THUẬT': { u: 'admin', p: 'Admin@123456' },
    };

    const cred = roleCredentialMap[targetRole];
    if (cred) {
      try {
        const res = await api.login(cred.u, cred.p);
        setUser(res.data.user);
        // If current tab is not accessible, go back to inventory or dashboard
        if (targetRole === 'KHO') {
          setActiveTab('inventory');
        } else if (targetRole === 'KINH DOANH') {
          setActiveTab('customers');
        }
      } catch (err) {
        console.error('Lỗi chuyển role demo:', err);
      }
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400 text-xs">Đang tải MISA SME Portal...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginModal onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        user={user}
        health={health}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onRefreshData={fetchOverviewData}
        isRefreshing={isRefreshing}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          user={user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSwitchRoleDemo={handleSwitchRoleDemo}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {activeTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                user={user}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {(activeTab === 'inventory' || activeTab === 'products') && (
              <InventoryView user={user} />
            )}

            {activeTab === 'customers' && <CustomersView />}

            {activeTab === 'sales' && <SalesView />}

            {(activeTab === 'suppliers' || activeTab === 'purchases') && <SuppliersView />}

            {activeTab === 'receivables' && (
              <DebtView user={user} defaultTab="receivables" />
            )}

            {activeTab === 'payables' && (
              <DebtView user={user} defaultTab="payables" />
            )}

            {activeTab === 'reports' && <ReportsView stats={stats} user={user} />}

            {activeTab === 'misa-connection' && <MisaConnectionView />}

            {activeTab === 'users' && <UserManagementView />}

            {activeTab === 'audit-logs' && <AuditLogsView />}

            {activeTab === 'system-config' && <SystemConfigView />}
          </div>
        </main>
      </div>
    </div>
  );
}
