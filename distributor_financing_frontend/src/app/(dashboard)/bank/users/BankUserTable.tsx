'use client';

import { useState } from 'react';
import {
  ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, Pencil, Ban, CheckCircle2, Trash2,
  Inbox, Users, Building,
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import type { BankUser } from '@/lib/types';
import type { SortKey, UseBankUsersReturn } from '@/hooks/useBankUsers';

interface BankUserTableProps {
  hook: UseBankUsersReturn;
  onEdit: (row: BankUser) => void;
  onDeleteRequest: (row: BankUser) => void;
}

const COLUMNS: { key: SortKey | 'emailPhone' | 'branch' | 'select' | 'actions'; label: string; sortable: boolean }[] = [
  { key: 'select', label: '', sortable: false },
  { key: 'name', label: 'Full Name', sortable: true },
  { key: 'emailPhone', label: 'Email / Phone', sortable: false },
  { key: 'branch', label: 'Branch', sortable: false },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'lastLogin', label: 'Last Login', sortable: true },
  { key: 'createdDate', label: 'Created', sortable: true },
  { key: 'actions', label: '', sortable: false },
];

function initials(row: BankUser) {
  return `${row.firstName[0] ?? ''}${row.lastName[0] ?? ''}`.toUpperCase();
}

function ActionsMenu({ row, onEdit, onDeleteRequest, onToggleStatus }: {
  row: BankUser;
  onEdit: () => void;
  onDeleteRequest: () => void;
  onToggleStatus: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isActive = row.status === 'Active';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Actions for ${row.firstName} ${row.lastName}`}
        className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 text-sm">
            <button onClick={() => { setOpen(false); onEdit(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50">
              <Pencil size={15} /> Edit
            </button>
            <button onClick={() => { setOpen(false); onToggleStatus(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50">
              {isActive ? <Ban size={15} /> : <CheckCircle2 size={15} />}
              {isActive ? 'Deactivate' : 'Activate'}
            </button>
            <div className="my-1 border-t border-slate-100" />
            <button onClick={() => { setOpen(false); onDeleteRequest(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50">
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function BankUserTable({ hook, onEdit, onDeleteRequest }: BankUserTableProps) {
  const {
    users: rows, totalCount, isLoading,
    sortKey, sortDirection, toggleSort,
    page, totalPages, pageSize, setPage,
    selectedIds, toggleSelect, toggleSelectAllOnPage,
    setUserStatus,
  } = hook;

  const allOnPageSelected = rows.length > 0 && rows.every((u) => selectedIds.includes(u.id));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[750px]">
          <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.key === 'select' ? (
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAllOnPage}
                      aria-label="Select all rows on this page"
                      className="h-4 w-4 rounded border-slate-300 text-[#1F4DA8] focus:ring-[#1F4DA8]"
                    />
                  ) : col.sortable ? (
                    <button
                      onClick={() => toggleSort(col.key as SortKey)}
                      className="flex items-center gap-1 hover:text-slate-800"
                    >
                      {col.label}
                      {sortKey === col.key ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp size={12} className="text-[#1F4DA8]" />
                        ) : (
                          <ArrowDown size={12} className="text-[#1F4DA8]" />
                        )
                      ) : (
                        <ArrowUpDown size={12} className="text-slate-300" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="h-3.5 bg-slate-100 rounded-full animate-pulse w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Inbox size={32} />
                    <p className="text-sm font-semibold text-slate-500">No bank staff users found</p>
                    <p className="text-xs">Try adjusting your search or filters.</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleSelect(row.id)}
                    aria-label={`Select ${row.firstName} ${row.lastName}`}
                    className="h-4 w-4 rounded border-slate-300 text-[#1F4DA8] focus:ring-[#1F4DA8]"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full ${row.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
                      {initials(row)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{row.firstName} {row.lastName}</div>
                      <div className="text-xs text-slate-400 font-mono">{row.employeeNumber}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-700">{row.email}</div>
                  <div className="text-xs text-slate-400">{row.phone}</div>
                </td>
                {/* Branch */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-medium text-slate-700 flex items-center gap-1.5 text-xs">
                    <Building size={13} className="text-slate-400" />
                    <span>{row.branchName || (row.branchCode ? `Branch ${row.branchCode}` : 'Head Office')}</span>
                  </div>
                  {row.branchCode && (
                    <div className="text-[10px] text-slate-400 font-mono ml-4">
                      Code: {row.branchCode}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${roleBadgeColor(row.role)}`}>
                    {formatRoleName(row.role)}
                  </span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.lastLogin}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.createdDate}</td>
                <td className="px-4 py-3 text-right">
                  <ActionsMenu
                    row={row}
                    onEdit={() => onEdit(row)}
                    onDeleteRequest={() => onDeleteRequest(row)}
                    onToggleStatus={() => setUserStatus(row.id, row.status === 'Active' ? 'Inactive' : 'Active')}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Users size={14} />
          Showing {rows.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, totalCount)} of {totalCount}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-slate-500 px-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function formatRoleName(role: string) {
  if (role === 'BANK_MAKER') return 'Maker';
  if (role === 'BANK_CHECKER') return 'Checker';
  if (role === 'BANK_ADMIN') return 'Bank Admin';
  return role.replace(/_/g, ' ');
}

function roleBadgeColor(role: string) {
  if (role === 'BANK_MAKER') return 'bg-blue-50 text-[#1F4DA8] border-blue-200';
  if (role === 'BANK_CHECKER') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (role === 'BANK_ADMIN') return 'bg-purple-50 text-purple-700 border-purple-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}