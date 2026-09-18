import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Calendar, CheckCircle, Clock } from 'lucide-react';
import { api } from '../services/api';
import { SaleOrderItem } from '../types';

export const SalesView: React.FC = () => {
  const [sales, setSales] = useState<SaleOrderItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const res = await api.getSales({ search: search.trim() || undefined });
        setSales(res.data);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [search]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            Đơn Hàng & Doanh Thu Bán Hàng (MISA SME)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi chứng từ bán hàng và tình trạng thực hiện đơn hàng.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <div className="relative">
            <Search className="absolute inset-y-0 left-0 pl-3 my-auto h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo số đơn, tên khách..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Số Đơn Hàng</th>
                <th className="py-3 px-4">Ngày Đặt Hàng</th>
                <th className="py-3 px-4">Tên Khách Hàng</th>
                <th className="py-3 px-4 text-center">Số Mặt Hàng</th>
                <th className="py-3 px-4 text-right">Tổng Tiền Đơn Hàng</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              ) : (
                sales.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{item.orderNo}</td>
                    <td className="py-3 px-4 text-slate-600 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {item.orderDate}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{item.customerName}</td>
                    <td className="py-3 px-4 text-center font-medium text-slate-700">{item.itemCount}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                      {formatCurrency(item.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          Hoàn tất
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Đang xử lý
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
