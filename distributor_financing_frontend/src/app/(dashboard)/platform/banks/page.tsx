'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import Link from 'next/link';
import {
  Landmark,
  Plus,
  Pencil,
  AlertCircle,
  RefreshCw,
  Users,
  UserPlus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
} from 'lucide-react';
import { useBanks } from '@/hooks/useBanks';
import { AddBankModal } from '@/components/platform/AddBankModal';
import { EditBankModal } from '@/components/platform/EditBankModal';
import { AddBankAdminModal } from '@/components/platform/AddBankAdminModal';
import { DeleteDialog } from '@/components/platform/DeleteDialog';
import { BankBranchDetailsModal } from '@/components/bank/BankBranchDetailsModal';
import { TextInput, Select } from '@/components/ui/FormField';
import type { Bank } from '@/lib/types';

function formatDate(value: string | undefined): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
  } catch {
    return '—';
  }
}

function BanksContent() {
  const searchParams = useSearchParams();
  const statusParam = searchParams?.get('status')?.toUpperCase();
  const { banks, isLoading, isMutating, error, refresh, createBank, createBankAdmin, updateBank, setBankStatus, deleteBank } = useBanks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [targetBankForAdmin, setTargetBankForAdmin] = useState<Bank | null>(null);
  const [isAddAdminOpen, setAddAdminOpen] = useState(false);
  const [viewingBranch, setViewingBranch] = useState<Bank | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Bank | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'PENDING'>('ALL');

  useEffect(() => {
    if (statusParam === 'ACTIVE' || statusParam === 'SUSPENDED' || statusParam === 'PENDING') {
      setStatusFilter(statusParam);
    } else if (!statusParam) {
      setStatusFilter('ALL');
    }
  }, [statusParam]);


  const handleCreateBank = async (input: { bankCode: string; branchCode?: string; name?: string; bankName?: string; location?: string }) => {
    return createBank(input);
  };

  const handleOpenAddAdmin = (bank: Bank) => {
    setTargetBankForAdmin(bank);
    setAddAdminOpen(true);
  };

  const handleToggleBankStatus = async (bank: Bank) => {
    const isActive = bank.status === 'Active' || bank.status === 'ACTIVE';
    setTogglingId(bank.id);
    try {
      // Soft toggle: If Active -> SUSPENDED; otherwise -> ACTIVE
      await setBankStatus(bank.id, isActive ? 'SUSPENDED' : 'ACTIVE');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredBanks = banks.filter((b) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      (b.name || '').toLowerCase().includes(term) ||
      (b.bankCode || '').toLowerCase().includes(term) ||
      (b.branch || '').toLowerCase().includes(term) ||
      ((b as any).location || '').toLowerCase().includes(term);

    const isBankActive = b.status === 'Active' || b.status === 'ACTIVE';
    const isBankPending = b.status === 'PENDING';
    const isBankSuspended = b.status === 'SUSPENDED' || b.status === 'Inactive' || b.status === 'REJECTED';

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && isBankActive) ||
      (statusFilter === 'PENDING' && isBankPending) ||
      (statusFilter === 'SUSPENDED' && isBankSuspended);

    return matchesSearch && matchesStatus;
  });

  const totalBanks = banks.length;
  const activeCount = banks.filter((b) => b.status === 'Active' || b.status === 'ACTIVE').length;
  const suspendedCount = banks.filter((b) => b.status === 'SUSPENDED' || b.status === 'Inactive' || b.status === 'REJECTED').length;


  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Partner Banks</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#1F4DA8] border border-blue-200">
              Financial Institutions
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage partner financial institutions, configure operational statuses, and onboard bank administrators.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-[#1F4DA8]' : 'text-slate-500'} />
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            disabled={isMutating}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1F4DA8] hover:bg-[#3A6FD8] rounded-xl px-4 py-2.5 shadow-sm shadow-[#1F4DA8]/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} /> Add Bank
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <Landmark size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Banks</p>
            <p className="text-2xl font-black text-slate-900">{totalBanks}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Banks</p>
            <p className="text-2xl font-black text-emerald-600">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Suspended / Deactivated</p>
            <p className="text-2xl font-black text-rose-600">{suspendedCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Admins</p>
            <p className="text-2xl font-black text-indigo-600">
              {banks.reduce((sum, b) => sum + (b.adminCount || 0), 0)}
            </p>
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
            onClick={refresh}
            className="text-xs font-bold text-rose-700 hover:underline px-3 py-1 bg-white border border-rose-200 rounded-lg"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bank name, bank code, location..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full sm:w-44 text-xs font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended Only</option>
            <option value="PENDING">Pending Setup</option>
          </Select>
        </div>
      </div>

      {/* Banks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">Bank Name</th>
                <th className="px-4 py-3.5">Headquarters</th>
                <th className="px-4 py-3.5">Bank Code</th>
                <th className="px-4 py-3.5">Admins</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Onboarded</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
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
              ) : filteredBanks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
                        <Landmark size={28} className="text-slate-300" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-700">No partner banks found</p>
                        <p className="text-xs text-slate-400 mt-0.5">Try adjusting search or onboard your first partner bank.</p>
                      </div>
                      <button
                        onClick={() => setModalOpen(true)}
                        disabled={isMutating}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1F4DA8] hover:bg-[#3A6FD8] rounded-xl px-4 py-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus size={14} /> Add Bank
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBanks.map((b) => {
                  const hasAdmin = (b.adminCount ?? 0) > 0;
                  const isActive = b.status === 'Active' || b.status === 'ACTIVE';
                  const isPending = b.status === 'PENDING';
                  const isToggling = togglingId === b.id;


                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Bank Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
                            <Landmark size={16} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{b.name}</span>
                            <div className="text-[11px] text-slate-400">
                              Licensed Banking Partner
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location / HQ */}
                      <td className="px-4 py-4 text-slate-700">
                        <div className="font-medium flex items-center gap-1">
                          <Building size={12} className="text-slate-400" />
                          <span>{(b as any).location || b.branch || 'Head Office'}</span>
                        </div>
                      </td>

                      {/* Bank Code */}
                      <td className="px-4 py-4 text-slate-600 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          {b.bankCode ?? b.shortCode ?? '—'}
                        </span>
                      </td>

                      {/* Admins */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          <Users size={13} className="text-slate-400" />
                          {b.adminCount ?? 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isActive ? <CheckCircle2 size={12} /> : isPending ? <Clock size={12} /> : <XCircle size={12} />}
                          {isActive ? 'Active' : isPending ? 'Pending' : 'Suspended'}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-4 text-slate-500 font-mono text-[11px]">
                        {formatDate(b.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasAdmin ? (
                            <Link
                              href="/platform/users"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F4DA8] hover:text-[#3A6FD8] bg-blue-50 hover:bg-blue-100 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                              title="Manage Administrators"
                            >
                              <Users size={12} />
                              Admins
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleOpenAddAdmin(b)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#1F4DA8] hover:bg-[#3A6FD8] rounded-lg px-2.5 py-1.5 shadow-xs transition-colors cursor-pointer"
                              title="Add Administrator"
                            >
                              <UserPlus size={12} />
                              Add Admin
                            </button>
                          )}

                          {/* Activate / Deactivate Toggle Button */}
                          <button
                            onClick={() => handleToggleBankStatus(b)}
                            disabled={isToggling}
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isActive
                                ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                            }`}
                            title={isActive ? 'Deactivate / Suspend Bank' : 'Activate Bank'}
                          >
                            {isToggling ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : isActive ? (
                              <>
                                <ToggleRight size={14} /> Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={14} /> Activate
                              </>
                            )}
                          </button>

                          {/* Edit Bank Option */}
                          <button
                            onClick={() => setEditingBank(b)}
                            className="p-1.5 text-slate-400 hover:text-[#1F4DA8] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Bank Entity"
                          >
                            <Pencil size={14} />
                          </button>

                          {/* View Branch Details */}
                          <button
                            onClick={() => setViewingBranch(b)}
                            className="p-1.5 text-slate-400 hover:text-[#1F4DA8] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Branch Ecosystem Details"
                          >
                            <Landmark size={14} />
                          </button>

                          {/* Delete Bank Option */}
                          <button
                            onClick={() => setDeleteTarget(b)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Bank Entity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddBankModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateBank}
        isSubmitting={isMutating}
      />

      <EditBankModal
        bank={editingBank}
        open={Boolean(editingBank)}
        onClose={() => setEditingBank(null)}
        onUpdate={updateBank}
        isSubmitting={isMutating}
      />

      <AddBankAdminModal
        open={isAddAdminOpen}
        onClose={() => {
          setAddAdminOpen(false);
          setTargetBankForAdmin(null);
        }}
        onCreate={createBankAdmin}
        isSubmitting={isMutating}
        selectedBank={targetBankForAdmin}
        defaultBankId={targetBankForAdmin?.id}
      />

      <BankBranchDetailsModal
        open={Boolean(viewingBranch)}
        bankId={viewingBranch?.id || null}
        bankName={viewingBranch?.name}
        onClose={() => setViewingBranch(null)}
      />

      {/* Delete Bank Dialog */}
      <DeleteDialog
        open={!!deleteTarget}
        title={deleteTarget ? `Delete Bank "${deleteTarget.name}"?` : 'Delete Bank'}
        description={
          deleteTarget
            ? `Are you sure you want to permanently delete "${deleteTarget.name}" (Code: ${deleteTarget.bankCode})? This action cannot be undone.`
            : undefined
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            const success = await deleteBank(deleteTarget.id);
            if (success) setDeleteTarget(null);
          }
        }}
        isDeleting={isMutating}
      />
    </div>
  );
}

export default function BanksPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Loading banks directory...</div>}>
      <BanksContent />
    </Suspense>
  );
}

