'use client';

import { useState } from 'react';
import {
  ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, Eye, Pencil, KeyRound, Ban, CheckCircle2, Trash2,
  Inbox, Users,
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import type { BankAdmin } from '@/lib/types';
import type { SortKey, UsePlatformAdminReturn } from '@/hooks/usePlatformAdmin';

interface BankAdminTableProps {
  admin: UsePlatformAdminReturn;
  onView: (row: BankAdmin) => void;
  onEdit: (row: BankAdmin) => void;
  onResetPassword: (row: BankAdmin) => void;
  onDeleteRequest: (row: BankAdmin) => void;
}

const COLUMNS: { key: SortKey | 'employeeNumber' | 'select' | 'actions'; label: string; sortable: boolean }[] = [
  { key: 'select', label: '', sortable: false },
  { key: 'name', label: 'Full Name', sortable: true },
  { key: 'employeeNumber', label: 'Email / Phone', sortable: false },
  { key: 'bank', label: 'Bank', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'lastLogin', label: 'Last Login', sortable: true },
  { key: 'createdDate', label: 'Created', sortable: true },
  { key: 'actions', label: '', sortable: false },
];

function initials(row: BankAdmin) {
  return `${row.firstName[0] ?? ''}${row.lastName[0] ?? ''}`.toUpperCase();
}

function ActionsMenu({ row, onView, onEdit, onResetPassword, onDeleteRequest, onToggleStatus }: {
  row: BankAdmin;
  onView: () => void;
  onEdit: () => void;
  onResetPassword: () => void;
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
          <div className="absolute right-0 z-20 mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 text-sm">
            <button onClick={() => { setOpen(false); onView(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50">
              <Eye size={15} /> View
            </button>
            <button onClick={() => { setOpen(false); onEdit(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50">
              <Pencil size={15} /> Edit
            </button>
            <button onClick={() => { setOpen(false); onResetPassword(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50">
              <KeyRound size={15} /> Reset Password
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

export function BankAdminTable({ admin, onView, onEdit, onResetPassword, onDeleteRequest }: BankAdminTableProps) {
  const {
    admins, totalCount, isLoading,
    sortKey, sortDirection, toggleSort,
    page, totalPages, pageSize, setPage,
    selectedIds, toggleSelect, toggleSelectAllOnPage,
    setStatus,
  } = admin;

  const allOnPageSelected = admins.length > 0 && admins.every((a) => selectedIds.includes(a.id));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
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

            {!isLoading && admins.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Inbox size={32} />
                    <p className="text-sm font-semibold text-slate-500">No bank admins found</p>
                    <p className="text-xs">Try adjusting your search or filters.</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && admins.map((row) => (
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
                      <div className="text-xs text-slate-400">{row.employeeNumber}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-700">{row.email}</div>
                  <div className="text-xs text-slate-400">{row.phone}</div>
                </td>
                <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{row.bankName}</td>
                <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{row.role}</td>
                <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.lastLogin}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.createdDate}</td>
                <td className="px-4 py-3 text-right">
                  <ActionsMenu
                    row={row}
                    onView={() => onView(row)}
                    onEdit={() => onEdit(row)}
                    onResetPassword={() => onResetPassword(row)}
                    onDeleteRequest={() => onDeleteRequest(row)}
                    onToggleStatus={() => setStatus(row.id, row.status === 'Active' ? 'Inactive' : 'Active')}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Users size={14} />
          Showing {admins.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, totalCount)} of {totalCount}
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
