import React, { useState, useEffect } from 'react';
import { Building2, Search, Phone, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { SupplierItem } from '../types';

export const SuppliersView: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const res = await api.getSuppliers({ search: search.trim() || undefined });
        setSuppliers(res.data);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Danh Sách Nhà Cung Cấp
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Thông tin liên hệ đối tác cung ứng trong MISA SME.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <div className="relative">
            <Search className="absolute inset-y-0 left-0 pl-3 my-auto h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm nhà cung cấp..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Đang tải dữ liệu nhà cung cấp...
          </div>
        ) : suppliers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Không tìm thấy nhà cung cấp nào.
          </div>
        ) : (
          suppliers.map((s) => (
            <div key={s.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {s.code}
                </span>
                {s.taxCode && (
                  <span className="text-[10px] text-slate-400 font-mono">MST: {s.taxCode}</span>
                )}
              </div>
              <h3 className="mt-2 text-sm font-bold text-slate-900 line-clamp-2" title={s.name}>
                {s.name}
              </h3>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                {s.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{s.phone}</span>
                  </div>
                )}
                {s.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-[11px] text-slate-500">{s.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
