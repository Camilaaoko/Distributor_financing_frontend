'use client';

import {
  Search, Download, FileSpreadsheet, RefreshCw, Plus,
  CheckCircle2, XCircle, Trash2,
} from 'lucide-react';
import { Select, TextInput } from '@/components/ui/FormField';
import type { UsePlatformAdminReturn } from '@/hooks/usePlatformAdmin';
import { BANK_ADMIN_ROLES } from '@/lib/bank-admin-options';

// Backend supports exactly these 4 statuses for bank admins.
const STATUS_OPTIONS = ['Active', 'Pending', 'Inactive', 'Locked'] as const;
const DATE_OPTIONS: { value: 'all' | '7d' | '30d' | '90d'; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

interface FiltersProps {
  admin: UsePlatformAdminReturn;
  onAddClick: () => void;
  onRequestBulkDelete: () => void;
}

export function Filters({ admin, onAddClick, onRequestBulkDelete }: FiltersProps) {
  const {
    search, setSearch,
    bankFilter, setBankFilter,
    statusFilter, setStatusFilter,
    roleFilter, setRoleFilter,
    dateFilter, setDateFilter,
    banks, refresh, exportRows,
    selectedIds, bulkSetStatus, isMutating,
  } = admin;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, employee no..."
            className="pl-9"
            aria-label="Search bank admins"
          />
        </div>

        <Select
          value={bankFilter}
          onChange={(e) => setBankFilter(e.target.value)}
          className="w-auto min-w-[150px]"
          aria-label="Filter by bank"
        >
          <option value="all">All Banks</option>
          {banks.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </Select>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="w-auto min-w-[130px]"
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>

        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          className="w-auto min-w-[160px]"
          aria-label="Filter by role"
        >
          <option value="all">All Roles</option>
          {BANK_ADMIN_ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Select>

        <Select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
          className="w-auto min-w-[140px]"
          aria-label="Filter by date created"
        >
          {DATE_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => exportRows('csv')}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-sm hover:bg-slate-50"
          >
            <Download size={15} /> CSV
          </button>
          <button
            onClick={() => exportRows('excel')}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-sm hover:bg-slate-50"
          >
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button
            onClick={() => refresh()}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={15} className={isMutating ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1F4DA8] hover:bg-[#3A6FD8] rounded-xl px-4 py-2.5 shadow-sm shadow-[#1F4DA8]/30"
          >
            <Plus size={16} /> Add Bank Admin
          </button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            {selectedIds.length} selected
          </span>
          <button
            onClick={() => bulkSetStatus('Active')}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-100"
          >
            <CheckCircle2 size={14} /> Activate
          </button>
          <button
            onClick={() => bulkSetStatus('Inactive')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-200"
          >
            <XCircle size={14} /> Deactivate
          </button>
          <button
            onClick={() => exportRows('csv')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-200"
          >
            <Download size={14} /> Export Selected
          </button>
          <button
            onClick={onRequestBulkDelete}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5 hover:bg-rose-100"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
