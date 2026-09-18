import React, { useState } from 'react';
import { Database, ShieldCheck, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { AuthUser } from '../types';

interface LoginModalProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.login(username, password);
      if (res.data?.user) {
        onLoginSuccess(res.data.user);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Quản trị viên (ADMIN)', user: 'admin', pass: 'Admin@123456', desc: 'Toàn quyền, cấu hình kết nối MISA, quản lý user' },
    { label: 'Ban Giám Đốc', user: 'giamdoc', pass: 'Giamdoc@123456', desc: 'Xem doanh thu, công nợ, giá vốn, tồn kho' },
    { label: 'Kế toán trưởng', user: 'ketoan', pass: 'Ketoan@123456', desc: 'Quản trị công nợ phải thu/trả, báo cáo bán hàng' },
    { label: 'Thủ kho', user: 'kho', pass: 'Kho@123456', desc: 'Tra cứu tồn kho (Tự động ẩn giá vốn & doanh thu)' },
    { label: 'Kinh doanh', user: 'kinhdoanh', pass: 'Sale@123456', desc: 'Xem khách hàng, đơn hàng, tồn kho (Ẩn giá vốn)' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
            <Database className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          MISA SME PORTAL
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Cổng thông tin quản lý & tra cứu dữ liệu nội bộ an toàn
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-100">
          <div className="mb-5 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Chế độ READ ONLY - Không can thiệp dữ liệu MISA</span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Tên đăng nhập</label>
              <div className="mt-1 relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="input-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="Nhập tên đăng nhập"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Mật khẩu</label>
              <div className="mt-1 relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="input-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
            </button>
          </form>

          {/* Quick Fill Test Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-2.5 text-center">
              Tài khoản dùng thử nhanh theo phân quyền:
            </p>
            <div className="space-y-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.user}
                  type="button"
                  onClick={() => {
                    setUsername(acc.user);
                    setPassword(acc.pass);
                  }}
                  className={`w-full text-left p-2 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                    username === acc.user
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-semibold block">{acc.label}</span>
                    <span className="text-[11px] text-slate-500">{acc.desc}</span>
                  </div>
                  {username === acc.user && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
