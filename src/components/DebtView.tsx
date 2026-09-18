import React, { useState, useEffect } from 'react';
import { ReceiptText, CreditCard, Building2, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { ReceivableItem, PayableItem, AuthUser } from '../types';

interface DebtViewProps {
  user: AuthUser;
  defaultTab?: 'receivables' | 'payables';
}

export const DebtView: React.FC<DebtViewProps> = ({ user, defaultTab = 'receivables' }) => {
  const [activeTab, setActiveTab] = useState<'receivables' | 'payables'>(defaultTab);
  const [receivables, setReceivables] = useState<ReceivableItem[]>([]);
  const [payables, setPayables] = useState<PayableItem[]>([]);
  const [loading, setLoading] = useState(false);

  const canViewReceivables = user.role === 'ADMIN' || user.permissions.includes('VIEW_RECEIVABLES');
  const canViewPayables = user.role === 'ADMIN' || user.permissions.includes('VIEW_PAYABLES');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'receivables' && canViewReceivables) {
          const res = await api.getReceivables();
          setReceivables(res.data);
        } else if (activeTab === 'payables' && canViewPayables) {
          const res = await api.getPayables();
          setPayables(res.data);
        }
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, canViewReceivables, canViewPayables]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const totalReceivables = receivables.reduce((acc, curr) => acc + curr.remainingAmount, 0);
  const totalPayables = payables.reduce((acc, curr) => acc + curr.remainingAmount, 0);

  return (
    <div className="space-y-4">
      {/* Header & Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-blue-600" />
            Quản Lý & Tra Cứu Công Nợ (MISA SME)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Chi tiết công nợ phải thu của khách hàng và phải trả nhà cung cấp.
          </p>
        </div>

        <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs">
          {canViewReceivables && (
            <button
              onClick={() => setActiveTab('receivables')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'receivables'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Phải Thu Khách Hàng
            </button>
          )}

          {canViewPayables && (
            <button
              onClick={() => setActiveTab('payables')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'payables'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Phải Trả Nhà Cung Cấp
            </button>
          )}
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-slate-400">
            {activeTab === 'receivables' ? 'Tổng số tiền khách hàng còn nợ:' : 'Tổng số tiền cần trả nhà cung cấp:'}
          </span>
          <div className="text-2xl font-bold mt-0.5">
            {formatCurrency(activeTab === 'receivables' ? totalReceivables : totalPayables)}
          </div>
        </div>
        <div className="text-xs text-slate-300">
          Dữ liệu trích xuất trực tiếp từ sổ chi tiết công nợ MISA SME.
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Mã ĐT</th>
                <th className="py-3 px-4">Tên Đối Tượng</th>
                <th className="py-3 px-4">Số Chứng Từ</th>
                <th className="py-3 px-4">Hạn Thanh Toán</th>
                <th className="py-3 px-4 text-right">Số Tiền Còn Nợ</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Đang tải danh sách công nợ...
                  </td>
                </tr>
              ) : activeTab === 'receivables' ? (
                receivables.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Không có khoản nợ phải thu nào.
                    </td>
                  </tr>
                ) : (
                  receivables.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{r.customerCode}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{r.customerName}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{r.voucherNo}</td>
                      <td className="py-3 px-4 text-slate-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {r.dueDate}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                        {formatCurrency(r.remainingAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {r.daysOverdue > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            <AlertCircle className="w-3 h-3" />
                            Quá hạn {r.daysOverdue} ngày
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Trong hạn
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )
              ) : (
                payables.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Không có khoản nợ phải trả nào.
                    </td>
                  </tr>
                ) : (
                  payables.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-600">{p.supplierCode}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{p.supplierName}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{p.voucherNo}</td>
                      <td className="py-3 px-4 text-slate-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {p.dueDate}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                        {formatCurrency(p.remainingAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {p.daysOverdue > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            <AlertCircle className="w-3 h-3" />
                            Quá hạn {p.daysOverdue} ngày
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Trong hạn
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
