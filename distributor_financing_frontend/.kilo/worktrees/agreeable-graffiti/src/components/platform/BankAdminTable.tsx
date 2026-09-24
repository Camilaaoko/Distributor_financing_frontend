'use client';

import { useState } from 'react';
import {
  ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, Eye, Pencil, KeyRound, Ban, CheckCircle2, Trash2,
  Inbox, Users, UserCheck,
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
  { key: 'name', label: 'Administrator', sortable: true },
  { key: 'employeeNumber', label: 'Contact Details', sortable: false },
  { key: 'bank', label: 'Bank / Organization', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'createdDate', label: 'Created (Date & Time)', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
];

function initials(row: BankAdmin) {
  return `${row.firstName[0] ?? ''}${row.lastName[0] ?? ''}`.toUpperCase();
}

function ActionsMenu({ row, onView, onEdit, onResetPassword, onDeleteRequest, onToggleStatus, onApprove }: {
  row: BankAdmin;
  onView: () => void;
  onEdit: () => void;
  onResetPassword: () => void;
  onDeleteRequest: () => void;
  onToggleStatus: () => void;
  onApprove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isActive = row.status === 'Active';
  const isPending = row.status === 'Pending';

  return (
    <div className="relative inline-flex items-center justify-end gap-1">
      {/* Quick Direct Actions */}
      <button
        onClick={onEdit}
        className="p-1.5 text-slate-400 hover:text-[#1F4DA8] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
        title="Edit Administrator Details"
      >
        <Pencil size={15} />
      </button>

      <button
        onClick={onDeleteRequest}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        title="Delete Administrator"
      >
        <Trash2 size={15} />
      </button>

      {/* Overflow Menu for Additional Operations */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`More actions for ${row.firstName} ${row.lastName}`}
        className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 text-xs">
            <button
              onClick={() => { setOpen(false); onView(); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
            >
              <Eye size={14} /> View Details
            </button>
            <button
              onClick={() => { setOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
            >
              <Pencil size={14} /> Edit Details
            </button>
            <button
              onClick={() => { setOpen(false); onResetPassword(); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
            >
              <KeyRound size={14} /> Reset Password
            </button>
            {isPending && (
              <button
                onClick={() => { setOpen(false); onApprove(); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-emerald-700 hover:bg-emerald-50 font-semibold"
              >
                <UserCheck size={14} /> Approve Admin
              </button>
            )}
            {!isPending && (
              <button
                onClick={() => { setOpen(false); onToggleStatus(); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
              >
                {isActive ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                {isActive ? 'Deactivate' : 'Activate'}
              </button>
            )}
            <div className="my-1 border-t border-slate-100" />
            <button
              onClick={() => { setOpen(false); onDeleteRequest(); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-bold"
            >
              <Trash2 size={14} /> Delete Account
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
    setStatus, approveAdmin,
  } = admin;

  const allOnPageSelected = admins.length > 0 && admins.every((a) => selectedIds.includes(a.id));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap ${
                    col.key === 'actions' ? 'text-right' : 'text-left'
                  }`}
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

          <tbody className="divide-y divide-slate-100 text-slate-700">
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
                    <p className="text-sm font-semibold text-slate-500">No bank administrators found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search query or filters.</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && admins.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                {/* Checkbox */}
                <td className="px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleSelect(row.id)}
                    aria-label={`Select ${row.firstName} ${row.lastName}`}
                    className="h-4 w-4 rounded border-slate-300 text-[#1F4DA8] focus:ring-[#1F4DA8]"
                  />
                </td>

                {/* Administrator Profile */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full ${row.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                      {initials(row)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{row.firstName} {row.lastName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{row.employeeNumber || 'Admin'}</div>
                    </div>
                  </div>
                </td>

                {/* Contact Details */}
                <td className="px-4 py-3.5">
                  <div className="text-slate-800 font-medium">{row.email}</div>
                  <div className="text-[11px] text-slate-400">{row.phone || '—'}</div>
                </td>

                {/* Bank / Organization */}
                <td className="px-4 py-3.5 text-slate-800 font-semibold whitespace-nowrap">
                  {row.bankName}
                </td>

                {/* Status */}
                <td className="px-4 py-3.5">
                  <StatusBadge status={row.status} />
                </td>

                {/* Created Date & Time */}
                <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                  {row.createdDate}
                </td>

                {/* Actions (Edit / Delete / View) */}
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                  <ActionsMenu
                    row={row}
                    onView={() => onView(row)}
                    onEdit={() => onEdit(row)}
                    onResetPassword={() => onResetPassword(row)}
                    onDeleteRequest={() => onDeleteRequest(row)}
                    onToggleStatus={() => setStatus(row.id, row.status === 'Active' ? 'Inactive' : 'Active')}
                    onApprove={() => approveAdmin(row.id)}
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
          Showing {admins.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, totalCount)} of {totalCount} Administrators
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
