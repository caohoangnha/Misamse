import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Search,
  Table,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';

export const MisaConnectionView: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [server, setServer] = useState('localhost');
  const [port, setPort] = useState(1433);
  const [databaseName, setDatabaseName] = useState('MISA_SME_2022_DEMO');
  const [user, setUser] = useState('sa');
  const [password, setPassword] = useState('');
  const [misaVersion, setMisaVersion] = useState('MISA_SME_2022');
  const [timeout, setTimeoutVal] = useState(15000);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    serverVersion?: string;
    databaseName?: string;
    errorDetails?: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Schema Inspector state
  const [schemaTables, setSchemaTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [schemaSearch, setSchemaSearch] = useState('');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await api.getMisaConfig();
        if (res.misa) {
          setConfig(res);
          setServer(res.misa.database.server || 'localhost');
          setPort(res.misa.database.port || 1433);
          setDatabaseName(res.misa.database.databaseName || '');
          setUser(res.misa.database.user || 'sa');
          setPassword(res.misa.database.password || '');
          setMisaVersion(res.misa.version || 'MISA_SME_2022');
          setTimeoutVal(res.misa.database.connectionTimeout || 15000);
        }
      } catch {
        // handled
      }
    };
    loadConfig();
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testMisaConnection({
        server,
        port: Number(port),
        databaseName,
        user,
        password,
        connectionTimeout: Number(timeout),
      });
      setTestResult(res);
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: 'Lỗi kiểm tra kết nối: ' + (err instanceof Error ? err.message : String(err)),
        errorDetails: 'Hãy đảm bảo dịch vụ SQL Server đang chạy và cổng 1433 đã được kích hoạt.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const updatedConfig = {
        ...config,
        misa: {
          ...config?.misa,
          version: misaVersion,
          database: {
            ...config?.misa?.database,
            server,
            port: Number(port),
            databaseName,
            user,
            password,
            connectionTimeout: Number(timeout),
            readOnly: true,
          },
        },
      };

      await api.updateMisaConfig(updatedConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      alert('Lỗi lưu cấu hình: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleInspectSchema = async () => {
    setLoadingSchema(true);
    try {
      const res = await api.inspectMisaSchema();
      if (res.tables) {
        setSchemaTables(res.tables);
        if (res.tables.length > 0) {
          setSelectedTable(res.tables[0]);
        }
      }
    } catch {
      // handled
    } finally {
      setLoadingSchema(false);
    }
  };

  const filteredSchemaTables = schemaTables.filter((t) =>
    t.tableName.toLowerCase().includes(schemaSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-600" />
          Cấu Hình Kết Nối Cơ Sở Dữ Liệu MISA SME
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quản lý thông số kết nối SQL Server MISA trong mạng nội bộ. Mọi kết nối đều tuân thủ nguyên tắc <strong>READ ONLY 100%</strong>.
        </p>
      </div>

      {/* Main Grid: Form + Test Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Phiên bản MISA SME
                </label>
                <select
                  value={misaVersion}
                  onChange={(e) => setMisaVersion(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MISA_SME_2023">MISA SME 2023</option>
                  <option value="MISA_SME_2022">MISA SME 2022</option>
                  <option value="MISA_SME_2021">MISA SME 2021</option>
                  <option value="MISA_SME_2020">MISA SME.NET 2020</option>
                  <option value="CUSTOM">Tùy biến / Tự động nhận diện</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Adapter sẽ tự động áp dụng cấu trúc bảng tương ứng.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Địa chỉ Máy chủ SQL (Server / Host)
                </label>
                <input
                  type="text"
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  placeholder="localhost hoặc 127.0.0.1"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Nhập IP nội bộ nếu SQL Server ở máy khác trong mạng LAN.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Tên Cơ sở dữ liệu MISA (Database Name)
                </label>
                <input
                  type="text"
                  value={databaseName}
                  onChange={(e) => setDatabaseName(e.target.value)}
                  placeholder="Ví dụ: MISA_SME_2022_DEMO"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Cổng kết nối SQL (Port)
                </label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  placeholder="1433"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cổng TCP/IP mặc định của SQL Server là 1433.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Tên đăng nhập SQL (Username)
                </label>
                <input
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="sa hoặc misa_portal_reader"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Nên tạo user SQL riêng chỉ có quyền db_datareader.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Mật khẩu SQL (Password)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Mật khẩu được lưu trữ an toàn trong /config/misa.config.json.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                id="btn-test-misa-connection"
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                {testing ? 'Đang kiểm tra kết nối...' : 'Kiểm tra kết nối (Test Connection)'}
              </button>

              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Đã lưu cấu hình!
                  </span>
                )}
                <button
                  id="btn-save-misa-config"
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Diagnostic Status Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            Kết Quả Kiểm Tra Mạng & Dịch Vụ
          </h3>

          {testResult ? (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-start gap-2 font-bold">
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span className="text-sm">{testResult.message}</span>
              </div>

              {testResult.latencyMs !== undefined && (
                <div className="flex justify-between py-1 border-t border-current/10">
                  <span>Độ trễ truy vấn (Latency):</span>
                  <span className="font-bold">{testResult.latencyMs} ms</span>
                </div>
              )}

              {testResult.serverVersion && (
                <div className="py-1 border-t border-current/10 text-[11px]">
                  <span className="block font-semibold">Phiên bản SQL Server:</span>
                  <span className="font-mono text-[10px] block truncate">{testResult.serverVersion}</span>
                </div>
              )}

              {testResult.errorDetails && (
                <div className="p-2.5 rounded bg-white/60 border border-amber-300/60 text-[11px] mt-2">
                  <strong className="block mb-1">Hướng dẫn khắc phục:</strong>
                  <span>{testResult.errorDetails}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-2">
              <p>
                Nhấn nút <strong>[Kiểm tra kết nối]</strong> để hệ thống thực hiện kết nối thử nghiệm đến SQL Server MISA SME.
              </p>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-400 space-y-1">
                <div>✓ Chế độ kết nối: READ ONLY</div>
                <div>✓ Cơ chế đọc: READ UNCOMMITTED (Không lock)</div>
                <div>✓ Cổng kết nối an toàn: 1433 nội bộ</div>
              </div>
            </div>
          )}

          {/* Guidelines Box */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Lưu ý an toàn:
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Tuyệt đối không mở cổng 1433 trực tiếp ra Internet trên Router modem mạng công ty. Hãy dùng Cloudflare Tunnel hoặc VPN nội bộ theo tài liệu hướng dẫn.
            </p>
          </div>
        </div>
      </div>

      {/* Schema Inspector (Requirement 22: công cụ kiểm tra schema READ ONLY) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Table className="w-5 h-5 text-indigo-600" />
              Khảo Sát Cấu Trúc Bảng MISA (Schema Inspector - Read Only)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Đọc danh sách bảng và cột thực tế từ cơ sở dữ liệu MISA SME thông qua <code>INFORMATION_SCHEMA</code>.
            </p>
          </div>

          <button
            onClick={handleInspectSchema}
            disabled={loadingSchema}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Search className="w-4 h-4" />
            {loadingSchema ? 'Đang khảo sát...' : 'Bắt đầu khảo sát Schema'}
          </button>
        </div>

        {schemaTables.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            {/* Table List */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-2.5 bg-slate-50 border-b border-slate-200">
                <input
                  type="text"
                  value={schemaSearch}
                  onChange={(e) => setSchemaSearch(e.target.value)}
                  placeholder="Lọc tên bảng..."
                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                />
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                {filteredSchemaTables.map((t) => (
                  <button
                    key={t.tableName}
                    onClick={() => setSelectedTable(t)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      selectedTable?.tableName === t.tableName ? 'bg-indigo-50 font-bold text-indigo-900' : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{t.tableName}</span>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">{t.columnCount} cột</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Columns Details */}
            <div className="md:col-span-2 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              {selectedTable ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Cột dữ liệu của bảng: <span className="font-mono text-indigo-700">{selectedTable.tableName}</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">Loại: {selectedTable.tableType}</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                      <thead className="bg-slate-50 font-semibold text-slate-600">
                        <tr>
                          <th className="py-2 px-3">Tên Cột (Column Name)</th>
                          <th className="py-2 px-3">Kiểu Dữ Liệu</th>
                          <th className="py-2 px-3">Nullable</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedTable.columns?.map((c: any) => (
                          <tr key={c.columnName} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 font-mono font-bold text-slate-800">{c.columnName}</td>
                            <td className="py-1.5 px-3 font-mono text-slate-600">{c.dataType} {c.maxLength ? `(${c.maxLength})` : ''}</td>
                            <td className="py-1.5 px-3 text-slate-500">{c.isNullable}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-slate-400">
                  Chọn một bảng từ danh sách bên trái để xem cấu trúc cột.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
