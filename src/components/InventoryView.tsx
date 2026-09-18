import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Barcode,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import { ProductItem, AuthUser } from '../types';

interface InventoryViewProps {
  user: AuthUser;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ user }) => {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<ProductItem | null>(null);

  const hasCostPermission = user.role === 'ADMIN' || user.permissions.includes('VIEW_COST_PRICE');

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getInventory({
        page,
        limit: 20,
        search: search.trim() || undefined,
        filterStatus: filterStatus === 'ALL' ? undefined : filterStatus,
      });
      setItems(res.data);
      setTotal(res.total);
    } catch {
      // Handled by api service
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInventory();
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '***';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            Tra Cứu Tồn Kho & Hàng Hóa MISA SME
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tìm kiếm theo Mã hàng, Tên hàng, Barcode mã vạch. Chế độ READ ONLY trực tiếp từ cơ sở dữ liệu.
          </p>
        </div>

        {/* Cost Price Permission Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border border-slate-200 bg-slate-50">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-600">Giá vốn:</span>
          {hasCostPermission ? (
            <span className="text-emerald-700 font-semibold">HIỂN THỊ</span>
          ) : (
            <span className="text-amber-700 font-semibold" title="Tài khoản không được cấp quyền xem giá vốn">
              ẨN BẢO MẬT (***)
            </span>
          )}
        </div>
      </div>

      {/* Search Bar & Status Filter Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="input-inventory-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nhập Mã hàng, Tên hàng hoặc Barcode quét mã vạch..."
              className="block w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            id="btn-search-inventory"
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Search className="w-4 h-4" />
            Tìm kiếm
          </button>
        </form>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium mr-1">Trạng thái:</span>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'IN_STOCK', label: 'Còn hàng', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
            { id: 'LOW_STOCK', label: 'Tồn thấp (≤ Tối thiểu)', color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { id: 'OUT_OF_STOCK', label: 'Hết hàng', color: 'text-red-700 bg-red-50 border-red-200' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterStatus(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filterStatus === tab.id
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                  : tab.color || 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="ml-auto text-slate-500 font-medium">
            Tổng cộng: <strong>{formatNumber(total)}</strong> mặt hàng
          </span>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3.5">Mã hàng</th>
                <th className="py-3 px-3.5">Tên hàng hóa</th>
                <th className="py-3 px-3.5">ĐVT</th>
                <th className="py-3 px-3.5">Barcode</th>
                <th className="py-3 px-3.5 text-right">Tồn kho</th>
                <th className="py-3 px-3.5 text-right">Tối thiểu</th>
                <th className="py-3 px-3.5 text-right">Giá bán</th>
                {hasCostPermission && <th className="py-3 px-3.5 text-right">Giá vốn</th>}
                <th className="py-3 px-3.5 text-center">Trạng thái</th>
                <th className="py-3 px-3.5 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={hasCostPermission ? 10 : 9} className="py-12 text-center text-slate-400">
                    Đang truy vấn dữ liệu từ MISA SME Adapter...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={hasCostPermission ? 10 : 9} className="py-12 text-center text-slate-500">
                    Không tìm thấy mặt hàng nào phù hợp với từ khóa tìm kiếm.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isLow = item.status === 'LOW_STOCK';
                  const isOut = item.status === 'OUT_OF_STOCK';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isLow ? 'bg-amber-50/30' : isOut ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5 font-bold text-blue-700 whitespace-nowrap">
                        {item.code}
                      </td>
                      <td className="py-3 px-3.5 font-medium text-slate-900 max-w-xs">
                        <div className="truncate" title={item.name}>
                          {item.name}
                        </div>
                        {item.stockName && (
                          <div className="text-[11px] text-slate-600">
                            Kho: {item.stockName}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                        {item.unit}
                      </td>
                      <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {item.barcode ? (
                          <span className="flex items-center gap-1 text-slate-700">
                            <Barcode className="w-3.5 h-3.5 text-slate-400" />
                            {item.barcode}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <span
                          className={`font-bold text-sm ${
                            isOut
                              ? 'text-red-600'
                              : isLow
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {formatNumber(item.inventoryQuantity)}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right text-slate-500 whitespace-nowrap">
                        {item.minStock !== undefined ? formatNumber(item.minStock) : '—'}
                      </td>
                      <td className="py-3 px-3.5 text-right font-medium text-slate-700 whitespace-nowrap">
                        {item.unitPrice ? formatCurrency(item.unitPrice) : '—'}
                      </td>
                      {hasCostPermission && (
                        <td className="py-3 px-3.5 text-right text-slate-500 whitespace-nowrap">
                          {item.costPrice ? formatCurrency(item.costPrice) : '—'}
                        </td>
                      )}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200">
                            <XCircle className="w-3 h-3" />
                            Hết hàng
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200" title="Tồn kho ≤ mức tối thiểu">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Tồn thấp
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Còn hàng
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Boxes className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Thông Tin Mặt Hàng MISA</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{selectedItem.name}</h3>
            <p className="text-xs text-blue-700 font-mono font-semibold mt-0.5">Mã hàng: {selectedItem.code}</p>

            <div className="mt-4 space-y-2.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Đơn vị tính (ĐVT):</span>
                <span className="font-semibold text-slate-800">{selectedItem.unit}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Mã vạch (Barcode):</span>
                <span className="font-mono text-slate-800">{selectedItem.barcode || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Kho lưu trữ:</span>
                <span className="font-semibold text-slate-800">{selectedItem.stockName || 'Kho Mặc Định'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Số lượng tồn kho:</span>
                <span className="font-bold text-blue-700 text-sm">{formatNumber(selectedItem.inventoryQuantity)} {selectedItem.unit}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Mức tồn tối thiểu:</span>
                <span className="font-medium text-slate-800">{formatNumber(selectedItem.minStock)} {selectedItem.unit}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Giá bán niêm yết:</span>
                <span className="font-bold text-slate-900">{formatCurrency(selectedItem.unitPrice)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Giá vốn MISA:</span>
                <span className="font-bold text-emerald-700">
                  {hasCostPermission ? formatCurrency(selectedItem.costPrice) : '*** (Không có quyền)'}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
