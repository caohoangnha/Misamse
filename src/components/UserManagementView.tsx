import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Plus,
  Shield,
  Key,
  X,
  UserCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { UserAccount, UserRole } from '../types';

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('KHO');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !fullName) return;

    try {
      await api.createUser({
        username,
        password,
        fullName,
        email,
        role,
      });
      setShowAddModal(false);
      setUsername('');
      setPassword('');
      setFullName('');
      setEmail('');
      fetchUsers();
    } catch (err: unknown) {
      alert('Lỗi tạo người dùng: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleToggleActive = async (user: UserAccount) => {
    try {
      await api.updateUser(user.id, { isActive: !user.isActive });
      fetchUsers();
    } catch (err: unknown) {
      alert('Lỗi cập nhật trạng thái: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800 border-red-200',
    'GIÁM ĐỐC': 'bg-purple-100 text-purple-800 border-purple-200',
    'KẾ TOÁN': 'bg-blue-100 text-blue-800 border-blue-200',
    KHO: 'bg-amber-100 text-amber-800 border-amber-200',
    'KINH DOANH': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'KỸ THUẬT': 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-blue-600" />
            Quản Trị Người Dùng & Phân Quyền (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý tài khoản truy cập cổng MISA SME Portal theo vai trò và quyền hạn chặt chẽ.
          </p>
        </div>

        <button
          id="btn-add-user"
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Thêm Tài Khoản Mới
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Tên Đăng Nhập</th>
                <th className="py-3 px-4">Họ & Tên</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Vai Trò (Role)</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4">Đăng Nhập Gần Nhất</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      {u.username}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{u.fullName}</td>
                    <td className="py-3 px-4 text-slate-500">{u.email || '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${roleColors[u.role] || 'bg-gray-100'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {u.isActive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          HOẠT ĐỘNG
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-300">
                          VÔ HIỆU
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] font-mono">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {u.username !== 'admin' && (
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            u.isActive
                              ? 'text-amber-700 hover:bg-amber-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {u.isActive ? 'Khóa' : 'Kích hoạt'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCog className="w-5 h-5 text-blue-600" />
              Thêm Tài Khoản Người Dùng Mới
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Phân quyền truy cập đúng vai trò nghiệp vụ (Kho, Kế toán, Kinh doanh...).
            </p>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Tên đăng nhập *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ví dụ: kho_nam"
                  className="mt-1 block w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Họ và tên *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Nam"
                  className="mt-1 block w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Mật khẩu *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="mt-1 block w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Email (tùy chọn)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nam@congty.com"
                  className="mt-1 block w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Vai trò (Role) *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="mt-1 block w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="KHO">KHO (Chỉ tra cứu tồn kho, ẩn giá vốn)</option>
                  <option value="KINH DOANH">KINH DOANH (Tra cứu khách hàng, đơn hàng, tồn kho)</option>
                  <option value="KẾ TOÁN">KẾ TOÁN (Toàn quyền nghiệp vụ tài chính, công nợ, giá vốn)</option>
                  <option value="GIÁM ĐỐC">GIÁM ĐỐC (Xem toàn bộ báo cáo doanh thu, tồn kho, giá vốn)</option>
                  <option value="KỸ THUẬT">KỸ THUẬT (Cấu hình hệ thống, kiểm tra mạng)</option>
                  <option value="ADMIN">ADMIN (Toàn quyền hệ thống)</option>
                </select>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Tạo người dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
