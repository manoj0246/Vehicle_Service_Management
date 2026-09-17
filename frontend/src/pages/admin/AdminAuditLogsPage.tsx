import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  ShieldAlert,
  Search,
  Database,
  User,
  Code2,
  X,
  AlertCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import type { AuditLogItem } from '../../types/admin';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableFilter, setTableFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAuditLogs(tableFilter === 'All' ? undefined : tableFilter);
      setLogs(data);
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(errorMsg ?? 'Failed to load system audit trail');
    } finally {
      setIsLoading(false);
    }
  }, [tableFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getActionBadge = (action: string) => {
    switch (action?.toUpperCase()) {
      case 'INSERT':
      case 'CREATE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'UPDATE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DELETE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredLogs = logs.filter((l) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      l.tableName?.toLowerCase().includes(searchLower) ||
      l.action?.toLowerCase().includes(searchLower) ||
      l.changedBy?.toLowerCase().includes(searchLower) ||
      l.recordId?.toString().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pt-6 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200/60 mb-2">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Security & Compliance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              System Audit Logs
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Immutable ledger of database mutations, role updates, booking state changes, and user activities.
            </p>
          </div>

          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition self-start md:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Logs</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit trail by actor, table name, or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {['All', 'Users', 'Vehicles', 'ServiceRequests', 'Technicians', 'ServiceCenters'].map((table) => (
                <button
                  key={table}
                  onClick={() => setTableFilter(table)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    tableFilter === table
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {table}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-10 bg-slate-100 rounded"></div>
            <div className="h-10 bg-slate-100 rounded"></div>
            <div className="h-10 bg-slate-100 rounded"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No audit records found</h3>
            <p className="text-xs text-slate-500 mt-1">Audit events will automatically appear when records are created or updated.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Log ID</th>
                    <th className="py-3.5 px-4">Table / Entity</th>
                    <th className="py-3.5 px-4">Record ID</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Changed By</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">#{l.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{l.tableName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">#{l.recordId}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full font-bold border text-[10px] ${getActionBadge(l.action)}`}>
                          {l.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>{l.changedBy || 'System'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(l.changedAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(l)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedLog && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Audit Inspection: {selectedLog.tableName} #{selectedLog.recordId}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Action</span>
                    <div className="font-bold text-slate-800">{selectedLog.action}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Actor</span>
                    <div className="font-bold text-slate-800">{selectedLog.changedBy}</div>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-700 mb-1">Old Values (Previous State)</div>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-36">
                    {selectedLog.oldValues || '(None - Newly Created Record)'}
                  </pre>
                </div>

                <div>
                  <div className="font-bold text-slate-700 mb-1">New Values (Applied State)</div>
                  <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-36">
                    {selectedLog.newValues || '(None - Deleted Record)'}
                  </pre>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-slate-100 mt-4">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogsPage;

