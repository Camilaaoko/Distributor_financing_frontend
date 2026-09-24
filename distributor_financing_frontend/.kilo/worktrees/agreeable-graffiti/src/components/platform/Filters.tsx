'use client';

import {
  Search,
  Download,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Trash2,
} from 'lucide-react';
import type { UsePlatformAdminReturn } from '@/hooks/usePlatformAdmin';

// Backend supports exactly these 4 statuses for bank admins.
const STATUS_OPTIONS = ['Active', 'Pending', 'Inactive', 'Locked'] as const;
const DATE_OPTIONS: { value: 'all' | '7d' | '30d' | '90d'; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
];

interface FiltersProps {
  admin: UsePlatformAdminReturn;
  onRequestBulkDelete: () => void;
}

export function Filters({ admin, onRequestBulkDelete }: FiltersProps) {
  const {
    search, setSearch,
    bankFilter, setBankFilter,
    statusFilter, setStatusFilter,
    dateFilter, setDateFilter,
    banks, refresh, exportRows,
    selectedIds, bulkSetStatus, isMutating,
  } = admin;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 space-y-3">
      {/* Row 1: Search and Export / Refresh actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bank admin by name, email, or phone..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40 focus:border-[#1F4DA8] transition-all shadow-2xs"
            aria-label="Search bank admins"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => exportRows('csv')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download size={13} /> CSV
          </button>
          <button
            onClick={() => exportRows('excel')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <FileSpreadsheet size={13} /> Excel
          </button>
          <button
            onClick={() => refresh()}
            disabled={isMutating}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={13} className={isMutating ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Row 2: 3 Dropdown Filters Arranged Horizontally */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Bank Filter */}
        <div>
          <select
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40 focus:border-[#1F4DA8] shadow-2xs cursor-pointer"
            aria-label="Filter by bank"
          >
            <option value="all">All Partner Banks</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40 focus:border-[#1F4DA8] shadow-2xs cursor-pointer"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Date Filter */}
        <div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40 focus:border-[#1F4DA8] shadow-2xs cursor-pointer"
            aria-label="Filter by date created"
          >
            {DATE_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Selection Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 pt-2.5 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            {selectedIds.length} selected
          </span>
          <button
            onClick={() => bulkSetStatus('Active')}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-100 cursor-pointer"
          >
            <CheckCircle2 size={14} /> Activate
          </button>
          <button
            onClick={() => bulkSetStatus('Inactive')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-200 cursor-pointer"
          >
            <XCircle size={14} /> Deactivate
          </button>
          <button
            onClick={() => exportRows('csv')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-200 cursor-pointer"
          >
            <Download size={14} /> Export Selected
          </button>
          <button
            onClick={onRequestBulkDelete}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5 hover:bg-rose-100 cursor-pointer"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
