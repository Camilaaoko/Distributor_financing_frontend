'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Search, ShieldAlert, History } from 'lucide-react';
import { auditLogsApi } from '@/services/onboarding-api.service';
import type { AuditLogResponse } from '@/types/onboarding';

const CATEGORY_STYLES: Record<string, string> = {
  created: 'bg-green-50 text-[#16A34A] border-green-200',
  updated: 'bg-blue-50 text-[#1F4DA8] border-blue-200',
  deleted: 'bg-red-50 text-[#DC2626] border-red-200',
  security: 'bg-purple-50 text-purple-700 border-purple-200',
  warning: 'bg-orange-50 text-[#F58220] border-orange-200',
  AUTH: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  BANK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MANUFACTURER: 'bg-amber-50 text-amber-700 border-amber-200',
  DISTRIBUTOR: 'bg-sky-50 text-sky-700 border-sky-200',
  ROLE: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await auditLogsApi.getAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    return (
      !search ||
      (log.action || '').toLowerCase().includes(term) ||
      (log.userFullName || log.userId || '').toLowerCase().includes(term) ||
      (log.details || '').toLowerCase().includes(term) ||
      (log.actionCategory || '').toLowerCase().includes(term) ||
      (log.tenantType || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-[#1F4DA8]" />
            Audit Logs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            A complete, tamper-evident record of administrative and lifecycle actions across the platform.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin text-[#1F4DA8]' : 'text-slate-500'} />
          Refresh
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter logs by actor, action, tenant, or details..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Details</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-5 py-3.5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-5 py-4">
                      <div className="h-4 bg-slate-100 rounded w-3/4 mb-1.5" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    <ShieldAlert size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No audit records found</p>
                    <p className="text-xs text-slate-400 mt-1">Activity logs will appear here in real-time.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badgeClass = CATEGORY_STYLES[log.actionCategory || ''] || 'bg-slate-50 text-slate-600 border-slate-200';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors text-xs">
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {log.userFullName || log.userId || 'System'}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-800">
                        {log.action}
                      </td>
                      <td className="px-4 py-4 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                        {log.details || '—'}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                          {log.actionCategory || 'GENERAL'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
