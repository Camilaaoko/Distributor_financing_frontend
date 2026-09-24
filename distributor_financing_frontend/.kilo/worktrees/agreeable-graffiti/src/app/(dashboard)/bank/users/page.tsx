'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, RefreshCw, CheckCircle2, XCircle, Trash2, ShieldCheck } from 'lucide-react';

import { Select, TextInput } from '@/components/ui/FormField';
import { DeleteDialog } from '@/components/platform/DeleteDialog';
import { BankUserTable } from './BankUserTable';
import { AddBankUserModal } from './AddBankUserModal';
import { EditBankUserModal } from './EditBankUserModal';
import { useBankUsers } from '@/hooks/useBankUsers';
import { usePermission } from '@/hooks/usePermission';
import { AccessDenied } from '@/components/auth/AccessDenied';
import type { BankUser, BankUserStatus } from '@/lib/types';

const STATUS_OPTIONS: BankUserStatus[] = ['Active', 'Inactive', 'Pending', 'Locked'];

export default function BankUsersPage() {
  const hook = useBankUsers();
  const { hasPermission } = usePermission();
  const canManageUsers = hasPermission('USER_MANAGEMENT');

  const [isAddOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BankUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BankUser | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const {
    search, setSearch,
    roleFilter, setRoleFilter,
    statusFilter, setStatusFilter,
    refresh, isMutating,
    bulkSetStatus, bulkDelete,
    deleteUser, createUser, updateUser,
  } = hook;

  if (!canManageUsers) {
    return (
      <div className="p-6 lg:p-8">
        <AccessDenied
          title="User Management Restricted"
          message="You do not have administrative permissions to view or manage bank staff users. Please contact your Bank Administrator."
          requiredPermission="USER_MANAGEMENT"
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bank User Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage maker and checker accounts for your bank.
        </p>
      </div>

      {/* Role Tab Filter */}
      <div className="flex rounded-2xl bg-slate-100 p-1.5 w-fit text-xs font-bold text-slate-600 border border-slate-200/80">
        <button
          type="button"
          onClick={() => setRoleFilter('all')}
          className={`px-4 py-2 rounded-xl transition-all font-extrabold ${
            roleFilter === 'all' ? 'bg-white text-[#1F4DA8] shadow-md ring-1 ring-[#E2E8F0]' : 'hover:text-[#1E293B]'
          }`}
        >
          All Users
        </button>
        <button
          type="button"
          onClick={() => setRoleFilter('BANK_MAKER')}
          className={`px-4 py-2 rounded-xl transition-all font-extrabold ${
            roleFilter === 'BANK_MAKER' ? 'bg-white text-[#1F4DA8] shadow-md ring-1 ring-[#E2E8F0]' : 'hover:text-[#1E293B]'
          }`}
        >
          Makers
        </button>
        <button
          type="button"
          onClick={() => setRoleFilter('BANK_CHECKER')}
          className={`px-4 py-2 rounded-xl transition-all font-extrabold ${
            roleFilter === 'BANK_CHECKER' ? 'bg-white text-[#1F4DA8] shadow-md ring-1 ring-[#E2E8F0]' : 'hover:text-[#1E293B]'
          }`}
        >
          Checkers
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone, employee ID..."
              className="pl-9"
              aria-label="Search bank users"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BankUserStatus | 'all')}
            className="w-auto min-w-[130px]"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => refresh()}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw size={15} className={isMutating ? 'animate-spin' : ''} /> Refresh
            </button>
            <Link
              href="/bank/roles"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <ShieldCheck size={16} className="text-[#1F4DA8]" /> Manage Roles
            </Link>
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1F4DA8] hover:bg-[#3A6FD8] rounded-xl px-4 py-2.5 shadow-sm shadow-[#1F4DA8]/30"
            >
              <Plus size={16} /> Add User
            </button>
          </div>

        </div>

        {hook.selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {hook.selectedIds.length} selected
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
              onClick={() => setBulkDeleteOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5 hover:bg-rose-100"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      <BankUserTable
        hook={hook}
        onEdit={setEditTarget}
        onDeleteRequest={setDeleteTarget}
      />

      <AddBankUserModal
        open={isAddOpen}
        onClose={() => setAddOpen(false)}
        onCreate={createUser}
        isSubmitting={isMutating}
      />

      <EditBankUserModal
        user={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={updateUser}
        isSubmitting={isMutating}
      />

      <DeleteDialog
        open={!!deleteTarget}
        title="Delete Bank User?"
        description={
          deleteTarget
            ? `${deleteTarget.firstName} ${deleteTarget.lastName}'s account will be permanently removed. This action cannot be undone.`
            : undefined
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            const success = await deleteUser(deleteTarget.id);
            if (success) setDeleteTarget(null);
          }
        }}
        isDeleting={isMutating}
      />

      <DeleteDialog
        open={bulkDeleteOpen}
        title={`Delete ${hook.selectedIds.length} Bank Users?`}
        description="All selected accounts will be permanently removed. This action cannot be undone."
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={async () => {
          const success = await bulkDelete();
          if (success) setBulkDeleteOpen(false);
        }}
        isDeleting={isMutating}
      />
    </div>
  );
}