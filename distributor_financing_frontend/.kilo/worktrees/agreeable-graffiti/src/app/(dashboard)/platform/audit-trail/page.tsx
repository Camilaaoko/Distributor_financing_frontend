'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ListChecks,
  Search,
  RefreshCw,
  AlertCircle,
  Clock,
  User,
  Shield,
  Building,
  Factory,
  Store,
  CheckCircle2,
  Calendar,
  Activity,
  FileText,
} from 'lucide-react';
import { auditLogsApi } from '@/services/onboarding-api.service';
import type { AuditLogResponse } from '@/types/onboarding';
import { TextInput, Select } from '@/components/ui/FormField';
import { DateRangePicker, type DateRange } from '@/components/ui/DateRangePicker';
import { getErrorMessage } from '@/lib/errors';

const CATEGORY_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  AUTH: { label: 'Authentication', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Shield },
  BANK: { label: 'Bank Entity', badgeClass: 'bg-blue-50 text-[#1F4DA8] border-blue-200', icon: Building },
  MANUFACTURER: { label: 'Manufacturer', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', icon: Factory },
  DISTRIBUTOR: { label: 'Distributor', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Store },
  ROLE: { label: 'Role & Perms', badgeClass: 'bg-violet-50 text-violet-700 border-violet-200', icon: Shield },
  SECURITY: { label: 'Security', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200', icon: Shield },
  SYSTEM: { label: 'System', badgeClass: 'bg-slate-50 text-slate-700 border-slate-200', icon: Activity },
};

function getCategoryConfig(category?: string) {
  if (!category) return { label: 'General', badgeClass: 'bg-slate-50 text-slate-700 border-slate-200', icon: Activity };
  const key = category.toUpperCase();
  return CATEGORY_CONFIG[key] || {
    label: category,
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: Activity,
  };
}

export default function PlatformAuditTrailPage() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: '',
    preset: 'ALL',
  });

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await auditLogsApi.getAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch platform audit logs from backend.'));
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      const date = new Date(iso);
      if (isNaN(date.getTime())) return iso;
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(date);
    } catch {
      return iso;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      (log.action || '').toLowerCase().includes(term) ||
      (log.userFullName || log.userId || '').toLowerCase().includes(term) ||
      (log.userRole || '').toLowerCase().includes(term) ||
      (log.details || '').toLowerCase().includes(term) ||
      (log.actionCategory || '').toLowerCase().includes(term);

    const isMatchCategory =
      categoryFilter === 'ALL' ||
      (log.actionCategory || '').toUpperCase() === categoryFilter.toUpperCase();

    let matchesDate = true;
    if (log.timestamp && (dateRange.startDate || dateRange.endDate)) {
      try {
        const logDate = new Date(log.timestamp);
        if (!isNaN(logDate.getTime())) {
          if (dateRange.startDate) {
            const start = new Date(dateRange.startDate);
            start.setHours(0, 0, 0, 0);
            if (logDate < start) matchesDate = false;
          }
          if (dateRange.endDate) {
            const end = new Date(dateRange.endDate);
            end.setHours(23, 59, 59, 999);
            if (logDate > end) matchesDate = false;
          }
        }
      } catch {
        // ignore date parse errors
      }
    }

    return matchesSearch && isMatchCategory && matchesDate;
  });

  const totalLogs = logs.length;
  const authCount = logs.filter((l) => (l.actionCategory || '').toUpperCase() === 'AUTH' || (l.actionCategory || '').toUpperCase() === 'SECURITY').length;
  const entityCount = logs.filter((l) => ['BANK', 'MANUFACTURER', 'DISTRIBUTOR'].includes((l.actionCategory || '').toUpperCase())).length;
  const roleCount = logs.filter((l) => (l.actionCategory || '').toUpperCase() === 'ROLE').length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <ListChecks className="h-7 w-7 text-[#1F4DA8]" />
              Platform Audit Trail
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#1F4DA8] border border-blue-200">
              Live Audit Logs
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Tamper-evident, chronological log of all administrative actions, entity on-boardings, status modifications, and security events.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin text-[#1F4DA8]' : 'text-slate-500'} />
          Refresh Audit Trail
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Audit Events</p>
            <p className="text-2xl font-black text-slate-900">{totalLogs}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Security &amp; Auth</p>
            <p className="text-2xl font-black text-indigo-600">{authCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Building size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Entity Modifications</p>
            <p className="text-2xl font-black text-emerald-600">{entityCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Role &amp; Perm Events</p>
            <p className="text-2xl font-black text-violet-600">{roleCount}</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-rose-800 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchLogs}
            className="text-xs font-bold text-rose-700 hover:underline px-3 py-1 bg-white border border-rose-200 rounded-lg"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Bar with DateRangePicker */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, user, role, entity, or details..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Calendar Date Range Picker */}
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          {/* Event Category Filter */}
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-44 text-xs font-semibold"
          >
            <option value="ALL">All Categories</option>
            <option value="AUTH">Authentication</option>
            <option value="BANK">Bank Management</option>
            <option value="MANUFACTURER">Manufacturer</option>
            <option value="DISTRIBUTOR">Distributor</option>
            <option value="ROLE">Role &amp; Permissions</option>
            <option value="SECURITY">Security Actions</option>
          </Select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Actor / User</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Action Performed</th>
                <th className="px-4 py-3.5">Target / Details</th>
                <th className="px-5 py-3.5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <ListChecks size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No audit trail records found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your date range, search query, or category filters.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const catConfig = getCategoryConfig(log.actionCategory);
                  const Icon = catConfig.icon;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Timestamp */}
                      <td className="px-5 py-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Calendar size={12} className="text-slate-400 shrink-0" />
                          <span>{formatDate(log.timestamp)}</span>
                        </div>
                      </td>

                      {/* Actor / User */}
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <User size={12} className="text-slate-400 shrink-0" />
                          <span>{log.userFullName || log.userId || 'System'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {log.userRole || 'PLATFORM_ADMIN'}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${catConfig.badgeClass}`}
                        >
                          <Icon size={10} />
                          {catConfig.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-800 text-xs">
                          {log.action}
                        </div>
                      </td>

                      {/* Details / Target */}
                      <td className="px-4 py-4 text-slate-600 max-w-xs">
                        <p className="truncate text-xs" title={log.details || '—'}>
                          {log.details || '—'}
                        </p>
                      </td>

                      {/* Verification Status */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={11} /> Recorded
                        </span>
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
