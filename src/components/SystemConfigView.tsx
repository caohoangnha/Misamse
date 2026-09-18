import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Zap, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { SystemHealth } from '../types';

export const SystemConfigView: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleClearCache = async () => {
    setClearing(true);
    try {
      await api.clearCache();
      setCleared(true);
      setTimeout(() => setCleared(false), 3000);
      fetchHealth();
    } catch (err: unknown) {
      alert('Lỗi xóa cache: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            Cấu Hình Hệ Thống, Bộ Nhớ Đệm (Cache) & An Ninh
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý hiệu năng, giảm tải truy vấn cho SQL Server MISA và kiểm soát an toàn bảo mật.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Kiểm tra tình trạng
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cache Management Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Bộ Nhớ Đệm Bộ Nhớ RAM (In-Memory Cache)
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ĐANG HOẠT ĐỘNG
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Dữ liệu tồn kho và danh mục được lưu tạm thời trong bộ nhớ đệm (Cache TTL = 60 giây). Điều này giúp 90% các thao tác tìm kiếm của nhân viên trên điện thoại diễn ra tức thì (&lt; 0.1s) mà không cần truy vấn lại SQL Server MISA.
          </p>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Thời gian lưu bộ nhớ đệm (TTL):</span>
              <strong className="text-slate-800">60 giây (Mặc định)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mục tiêu hiệu năng:</span>
              <strong className="text-emerald-700">Giảm tải &gt;90% cho máy chủ MISA</strong>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {cleared ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Đã làm sạch bộ nhớ đệm!
              </span>
            ) : (
              <span className="text-xs text-slate-400">Xóa cache khi vừa cập nhật giá hoặc nhập kho</span>
            )}

            <button
              id="btn-clear-cache"
              onClick={handleClearCache}
              disabled={clearing}
              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {clearing ? 'Đang xóa...' : 'Xóa sạch Cache ngay'}
            </button>
          </div>
        </div>

        {/* Security Policies */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Chính Sách Bảo Mật Đang Kích Hoạt
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-800">Chống tấn công Brute-Force & Rate Limiting:</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Giới hạn tối đa 120 yêu cầu/phút trên mỗi địa chỉ IP. Tự động tạm khóa 15 phút nếu nhập sai mật khẩu quá 5 lần liên tiếp.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-800">Mã Hóa Mật Khẩu Chuẩn Bcrypt:</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mật khẩu người dùng được băm bằng thuật toán bcrypt với 10 vòng salt, không thể dịch ngược.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-800">Nguyên Tắc Bất Khả Xâm Phạm MISA (Zero Write):</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mọi truy vấn SQL đều đi qua bộ lọc Regex chống mọi câu lệnh ghi (INSERT, UPDATE, DELETE, DROP, ALTER...).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
