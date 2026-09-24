'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Users,
  MapPin,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  UserPlus,
  Landmark,
  Clock,
} from 'lucide-react';
import { TextInput, Select } from '@/components/ui/FormField';
import { DeleteDialog } from '@/components/platform/DeleteDialog';
import { AddBranchModal } from '@/components/bank/branches/AddBranchModal';
import { EditBranchModal } from '@/components/bank/branches/EditBranchModal';
import { BranchAdminsModal } from '@/components/bank/branches/BranchAdminsModal';
import { bankOnboardingApi } from '@/services/onboarding-api.service';
import { resolveCurrentBank } from '@/services/bank.service';
import { normalizeBankCode } from '@/services/platform.mock';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { getErrorMessage } from '@/lib/errors';
import type { BankBranchResponse, OnboardBankBranchRequest, UpdateBankBranchRequest } from '@/types/onboarding';

function formatDate(value: string | undefined): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
  } catch {
    return '—';
  }
}

export default function BankBranchesPage() {
  const toast = useToast();
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  const [branches, setBranches] = useState<BankBranchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  const [addBranchOpen, setAddBranchOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BankBranchResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BankBranchResponse | null>(null);
  const [managingAdminsFor, setManagingAdminsFor] = useState<BankBranchResponse | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [resolvedBankInfo, setResolvedBankInfo] = useState<{
    bankId: string | null;
    bankName: string | null;
    bankCode: string | null;
  }>({
    bankId: user?.bankId || (user as any)?.parentEntityId || null,
    bankName: user?.bankName || null,
    bankCode: (user as any)?.bankCode || null,
  });

  useEffect(() => {
    resolveCurrentBank().then((info) => {
      if (info.bankId || info.bankName || info.bankCode) {
        setResolvedBankInfo((prev) => ({
          bankId: info.bankId || prev.bankId,
          bankName: info.bankName || prev.bankName,
          bankCode: info.bankCode || prev.bankCode,
        }));
      }
    });
  }, [user]);

  const bankId = resolvedBankInfo.bankId || user?.bankId || (user as any)?.parentEntityId || '';
  const bankName = resolvedBankInfo.bankName || user?.bankName || '';
  const bankCode = resolvedBankInfo.bankCode || (user as any)?.bankCode || (bankName ? normalizeBankCode(bankName) : '');

  const loadBranches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!bankId) {
        setBranches([]);
        setIsLoading(false);
        return;
      }
      const data = await bankOnboardingApi.getBankBranches(bankId);
      setBranches(data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load bank branches.'));
      setBranches([]);
    } finally {
      setIsLoading(false);
    }
  }, [bankId]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const handleCreateBranch = async (payload: OnboardBankBranchRequest): Promise<boolean> => {
    setIsMutating(true);
    try {
      await bankOnboardingApi.onboardBankBranch({
        ...payload,
        bankId,
      }, bankId);
      toast.success(`Branch "${payload.branchName}" onboarded successfully.`);
      await loadBranches();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create branch.'));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateBranch = async (branchId: string, payload: UpdateBankBranchRequest): Promise<boolean> => {
    setIsMutating(true);
    try {
      await bankOnboardingApi.updateBankBranch(branchId, payload, bankId);
      toast.success('Branch details updated successfully.');
      await loadBranches();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update branch.'));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const handleToggleStatus = async (branch: BankBranchResponse) => {
    const isActive = branch.status === 'ACTIVE' || (branch.status as any) === 'Active';
    setTogglingId(branch.id);
    try {
      if (isActive) {
        await bankOnboardingApi.deactivateBankBranch(branch.id, bankId).catch(() =>
          bankOnboardingApi.setBankBranchStatus(branch.id, false, bankId)
        );
        toast.success(`Branch "${branch.branchName || branch.branch}" deactivated.`);
      } else {
        await bankOnboardingApi.activateBankBranch(branch.id, bankId).catch(() =>
          bankOnboardingApi.setBankBranchStatus(branch.id, true, bankId)
        );
        toast.success(`Branch "${branch.branchName || branch.branch}" activated.`);
      }
      await loadBranches();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update branch operational status.'));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteBranch = async () => {
    if (!deleteTarget) return;
    setIsMutating(true);
    try {
      await bankOnboardingApi.deleteBankBranch(deleteTarget.id, bankId);
      toast.success(`Branch "${deleteTarget.branchName || deleteTarget.branch}" deleted.`);
      setDeleteTarget(null);
      await loadBranches();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete branch.'));
    } finally {
      setIsMutating(false);
    }
  };

  // Filtered branches
  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const q = search.trim().toLowerCase();
      const name = (b.branchName || b.branch || '').toLowerCase();
      const code = (b.branchCode || '').toLowerCase();
      const loc = (b.location || '').toLowerCase();

      const matchesSearch = !q || name.includes(q) || code.includes(q) || loc.includes(q);

      const isActive = b.status === 'ACTIVE' || (b.status as any) === 'Active';
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && isActive) ||
        (statusFilter === 'SUSPENDED' && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [branches, search, statusFilter]);

  const totalBranches = branches.length;
  const activeCount = branches.filter((b) => b.status === 'ACTIVE' || (b.status as any) === 'Active').length;
  const suspendedCount = branches.filter((b) => b.status === 'SUSPENDED' || (b.status as any) === 'Inactive').length;
  const totalAdminsCount = branches.reduce((sum, b) => sum + (b.adminsCount || 0), 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bank Branches</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#1F4DA8] border border-blue-200 flex items-center gap-1.5">
              <Landmark size={12} /> {bankName} ({bankCode})
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage operating bank branch locations, configure operational status, and assign branch administrators for {bankName}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadBranches}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-[#1F4DA8]' : 'text-slate-500'} />
            Refresh
          </button>
          <button
            onClick={() => setAddBranchOpen(true)}
            disabled={isMutating}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1F4DA8] hover:bg-[#3A6FD8] rounded-xl px-4 py-2.5 shadow-sm shadow-[#1F4DA8]/30 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Plus size={16} /> Add Branch
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Branches</p>
            <p className="text-2xl font-black text-slate-900">{totalBranches}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Branches</p>
            <p className="text-2xl font-black text-emerald-600">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Suspended Branches</p>
            <p className="text-2xl font-black text-rose-600">{suspendedCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Branch Admins</p>
            <p className="text-2xl font-black text-indigo-600">{totalAdminsCount}</p>
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
            onClick={loadBranches}
            className="text-xs font-bold text-rose-700 hover:underline px-3 py-1 bg-white border border-rose-200 rounded-lg"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by branch name, branch code, location..."
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
          </Select>
        </div>
      </div>

      {/* Branches Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">Branch Name</th>
                <th className="px-4 py-3.5">Branch Code</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Branch Admins</th>
                <th className="px-4 py-3.5">Branch Staff</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Created</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="px-5 py-4">
                      <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </td>
                  </tr>
                ))
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
                        <Building2 size={28} className="text-slate-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">No bank branches found</p>
                        <p className="text-xs text-slate-400 mt-0.5">Onboard your first branch location to begin delegating operations.</p>
                      </div>
                      <button
                        onClick={() => setAddBranchOpen(true)}
                        disabled={isMutating}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1F4DA8] hover:bg-[#3A6FD8] rounded-xl px-4 py-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus size={14} /> Add Branch
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch) => {
                  const isActive = branch.status === 'ACTIVE' || (branch.status as any) === 'Active';
                  const isToggling = togglingId === branch.id;

                  return (
                    <tr key={branch.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Branch Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
                            <Building2 size={16} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm">
                              {branch.branchName || branch.branch || 'Commercial Branch'}
                            </span>
                            <div className="text-[11px] text-slate-400">
                              Bank Branch Location
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Branch Code */}
                      <td className="px-4 py-4 font-mono text-xs text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          {branch.branchCode || '—'}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-4 text-slate-700">
                        <div className="font-medium flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          <span>{branch.location || 'Nairobi, Kenya'}</span>
                        </div>
                      </td>

                      {/* Branch Admins */}
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setManagingAdminsFor(branch)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
                          title="Manage Branch Admins"
                        >
                          <Users size={13} />
                          <span>{branch.adminsCount ?? 0} Admins</span>
                        </button>
                      </td>

                      {/* Branch Staff */}
                      <td className="px-4 py-4 text-slate-700">
                        <Link
                          href={`/bank/users?branch=${encodeURIComponent(branch.branchName || branch.branchCode || '')}`}
                          className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-[#1F4DA8]"
                          title="View Staff in this Branch"
                        >
                          <ShieldCheck size={13} className="text-slate-400" />
                          <span>{branch.usersCount ?? 0} Staff</span>
                        </Link>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-4 py-4 text-slate-500 font-mono text-[11px]">
                        {formatDate(branch.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Manage Admins button */}
                          <button
                            onClick={() => setManagingAdminsFor(branch)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F4DA8] hover:text-[#3A6FD8] bg-blue-50 hover:bg-blue-100 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                            title="Manage Branch Admins"
                          >
                            <Users size={12} /> Admins
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          <button
                            onClick={() => handleToggleStatus(branch)}
                            disabled={isToggling}
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isActive
                                ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                            }`}
                            title={isActive ? 'Deactivate Branch' : 'Activate Branch'}
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

                          {/* Edit Branch */}
                          <button
                            onClick={() => setEditingBranch(branch)}
                            className="p-1.5 text-slate-400 hover:text-[#1F4DA8] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Branch Details"
                          >
                            <Pencil size={14} />
                          </button>

                          {/* Delete Branch */}
                          <button
                            onClick={() => setDeleteTarget(branch)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Branch"
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
      <AddBranchModal
        open={addBranchOpen}
        onClose={() => setAddBranchOpen(false)}
        onCreate={handleCreateBranch}
        isSubmitting={isMutating}
        bankCode={bankCode}
        bankName={bankName}
        bankId={bankId}
        existingBranches={branches}
      />

      <EditBranchModal
        branch={editingBranch}
        open={Boolean(editingBranch)}
        onClose={() => setEditingBranch(null)}
        onUpdate={handleUpdateBranch}
        isSubmitting={isMutating}
      />

      <BranchAdminsModal
        branch={managingAdminsFor}
        open={Boolean(managingAdminsFor)}
        onClose={() => setManagingAdminsFor(null)}
        onAdminsUpdated={loadBranches}
      />

      {/* Delete Branch Dialog */}
      <DeleteDialog
        open={!!deleteTarget}
        title={deleteTarget ? `Delete Branch "${deleteTarget.branchName || deleteTarget.branch}"?` : 'Delete Branch'}
        description={
          deleteTarget
            ? `Are you sure you want to permanently delete branch "${deleteTarget.branchName || deleteTarget.branch}" (Code: ${deleteTarget.branchCode})? This action cascades to all branch associations.`
            : undefined
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteBranch}
        isDeleting={isMutating}
      />
    </div>
  );
}
