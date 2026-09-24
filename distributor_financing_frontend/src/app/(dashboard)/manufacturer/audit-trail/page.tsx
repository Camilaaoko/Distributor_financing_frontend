'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ListChecks,
  Search,
  RefreshCw,
  AlertCircle,
  Factory,
  Clock,
} from 'lucide-react';
import { auditLogsApi } from '@/services/onboarding-api.service';
import type { AuditLogResponse } from '@/types/onboarding';
import { TextInput, Select } from '@/components/ui/FormField';
import { DateRangePicker, type DateRange } from '@/components/ui/DateRangePicker';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';

export default function ManufacturerAuditTrailPage() {
  const toast = useToast();
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

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await auditLogsApi.getAuditLogs();
      setLogs(data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load manufacturer audit trail.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const categories = Array.from(new Set(logs.map((l) => l.actionCategory).filter(Boolean)));

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      log.action.toLowerCase().includes(term) ||
      (log.userFullName || '').toLowerCase().includes(term) ||
      (log.userRole || '').toLowerCase().includes(term) ||
      (log.details || '').toLowerCase().includes(term);

    const matchesCategory = categoryFilter === 'ALL' || log.actionCategory === categoryFilter;

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

    return matchesSearch && matchesCategory && matchesDate;
  });

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ListChecks className="h-7 w-7 text-[#1F4DA8]" />
            Manufacturer Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Recent activity logs and compliance history relevant to your anchor enterprise.
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Log
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, user, or details..."
            className="pl-9 text-xs w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Date Range Picker */}
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          {/* Category Filter */}
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold w-auto min-w-[140px]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c!}>
                {c}
              </option>
            ))}
          </Select>

          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'Event' : 'Events'}
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#1F4DA8] mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading audit trail...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700 shadow-xs">
          <AlertCircle className="h-6 w-6 mx-auto mb-2 text-rose-500" />
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={loadLogs}
            className="mt-3 px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs space-y-3">
          <ListChecks className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Audit Events Logged</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || categoryFilter !== 'ALL' || dateRange.preset !== 'ALL' || dateRange.startDate
              ? 'No audit log entries match your search and date criteria.'
              : 'Audit events will appear here as users perform invoice submissions, approvals, and distributor recommendations.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                          {log.userFullName?.charAt(0) || log.userId?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{log.userFullName || log.userId}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{log.userRole}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-slate-800">{log.action}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {log.actionCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate" title={log.details}>
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
