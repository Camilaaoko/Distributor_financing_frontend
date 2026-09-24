'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { DeleteDialog } from '@/components/platform/DeleteDialog';
import { AddBranchAdminModal } from './AddBranchAdminModal';
import { EditBranchAdminModal } from './EditBranchAdminModal';
import { bankOnboardingApi } from '@/services/onboarding-api.service';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import type { BankBranchResponse, UserResponse, OnboardBankAdminRequest, UpdateBankAdminRequest } from '@/types/onboarding';

interface BranchAdminsModalProps {
  branch: BankBranchResponse | null;
  open: boolean;
  onClose: () => void;
  onAdminsUpdated?: () => void;
}

export function BranchAdminsModal({
  branch,
  open,
  onClose,
  onAdminsUpdated,
}: BranchAdminsModalProps) {
  const toast = useToast();
  const [admins, setAdmins] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<UserResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadAdmins = useCallback(async () => {
    if (!branch?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await bankOnboardingApi.getBankBranchAdmins(branch.id, branch.bankId);
      setAdmins(data || []);
    } catch (err) {
      // If endpoint returns empty or fails gracefully fallback
      setError(getErrorMessage(err, 'Could not fetch branch administrators.'));
      setAdmins([]);
    } finally {
      setIsLoading(false);
    }
  }, [branch]);

  useEffect(() => {
    if (open && branch) {
      loadAdmins();
    }
  }, [open, branch, loadAdmins]);

  const handleCreateAdmin = async (payload: OnboardBankAdminRequest): Promise<boolean> => {
    if (!branch) return false;
    setIsMutating(true);
    try {
      await bankOnboardingApi.onboardBankBranchAdmin(branch.id, payload, branch.bankId);
      toast.success(`Branch Administrator ${payload.firstName} ${payload.lastName} onboarded successfully.`);
      await loadAdmins();
      onAdminsUpdated?.();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to onboard branch administrator.'));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateAdmin = async (id: string, payload: UpdateBankAdminRequest): Promise<boolean> => {
    setIsMutating(true);
    try {
      await bankOnboardingApi.updateBankBranchAdmin(id, payload);
      toast.success('Branch Administrator details updated successfully.');
      await loadAdmins();
      onAdminsUpdated?.();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update branch administrator.'));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const handleToggleStatus = async (admin: UserResponse) => {
    const isActive = admin.status === 'ACTIVE' || admin.status === 'Active';
    setTogglingId(admin.id);
    try {
      if (isActive) {
        await bankOnboardingApi.deactivateBankBranchAdmin(admin.id).catch(() =>
          bankOnboardingApi.setBankBranchAdminStatus(admin.id, false)
        );
        toast.success(`Administrator account for ${admin.firstName} ${admin.lastName} deactivated.`);
      } else {
        await bankOnboardingApi.activateBankBranchAdmin(admin.id).catch(() =>
          bankOnboardingApi.setBankBranchAdminStatus(admin.id, true)
        );
        toast.success(`Administrator account for ${admin.firstName} ${admin.lastName} activated.`);
      }
      await loadAdmins();
      onAdminsUpdated?.();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update admin status.'));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleteTarget) return;
    setIsMutating(true);
    try {
      await bankOnboardingApi.deleteBankBranchAdmin(deleteTarget.id).catch(() =>
        bankOnboardingApi.deactivateBankBranchAdmin(deleteTarget.id)
      );
      toast.success(`Administrator ${deleteTarget.firstName} ${deleteTarget.lastName} removed.`);
      setDeleteTarget(null);
      await loadAdmins();
      onAdminsUpdated?.();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to remove branch administrator.'));
    } finally {
      setIsMutating(false);
    }
  };

  if (!branch) return null;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Branch Administrators</h2>
              <p className="text-xs text-slate-500 font-normal">
                Manage branch admins for {branch.branchName || branch.branch} ({branch.branchCode})
              </p>
            </div>
          </div>
        }
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={loadAdmins}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin text-[#1F4DA8]' : ''} />
              Refresh List
            </button>
            <ModalButton variant="outline" onClick={onClose}>
              Close
            </ModalButton>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-xs font-bold text-slate-700">
                {admins.length} {admins.length === 1 ? 'Administrator' : 'Administrators'} Assigned
              </span>
              <p className="text-[11px] text-slate-400">Branch Admins manage branch users, manufacturers, and distributors.</p>
            </div>
            <button
              type="button"
              onClick={() => setAddAdminOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1F4DA8] hover:bg-[#3A6FD8] px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <UserPlus size={14} /> Add Branch Admin
            </button>
          </div>

          {error && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-800 text-xs font-medium">
              <div className="flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadAdmins}
                className="text-[11px] font-bold bg-white px-2 py-1 rounded border border-amber-300 hover:bg-amber-100"
              >
                Retry
              </button>
            </div>
          )}

          {/* Admins Table / List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500 font-medium animate-pulse flex items-center justify-center gap-2">
                <RefreshCw size={14} className="animate-spin text-[#1F4DA8]" /> Loading branch administrators...
              </div>
            ) : admins.length === 0 ? (
              <div className="p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <Users size={22} />
                </div>
                <p className="text-xs font-bold text-slate-700">No branch administrators assigned</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click &ldquo;Add Branch Admin&rdquo; to assign an administrative manager to this branch.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-4 py-3">Administrator</th>
                      <th className="px-3 py-3">Contact</th>
                      <th className="px-3 py-3">National ID / Staff ID</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admins.map((adm) => {
                      const isActive = adm.status === 'ACTIVE' || adm.status === 'Active';
                      const isPending = adm.status === 'PENDING' || adm.status === 'Pending';
                      const isToggling = togglingId === adm.id;

                      return (
                        <tr key={adm.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Name */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-[#1F4DA8] text-white font-bold flex items-center justify-center text-xs shrink-0">
                                {(adm.firstName?.[0] || 'A').toUpperCase()}
                                {(adm.lastName?.[0] || '').toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {adm.firstName} {adm.lastName}
                                </span>
                                <span className="text-[10px] text-slate-400">Branch Administrator</span>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-3 py-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-slate-700 font-medium">
                                <Mail size={11} className="text-slate-400" />
                                <span>{adm.email}</span>
                              </div>
                              {adm.phoneNumber && (
                                <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                                  <Phone size={11} className="text-slate-400" />
                                  <span>{adm.phoneNumber}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* IDs */}
                          <td className="px-3 py-3 font-mono text-[11px] text-slate-600">
                            <div>{adm.employeeId || '—'}</div>
                            {adm.nationalIdNumber && (
                              <div className="text-[10px] text-slate-400 font-normal">
                                ID: {adm.nationalIdNumber}
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isPending
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {isActive ? <CheckCircle2 size={10} /> : isPending ? <Clock size={10} /> : <XCircle size={10} />}
                              {isActive ? 'Active' : isPending ? 'Pending' : 'Suspended'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {/* Edit Button */}
                              <button
                                onClick={() => setEditingAdmin(adm)}
                                className="p-1.5 text-slate-400 hover:text-[#1F4DA8] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Administrator"
                              >
                                <Pencil size={13} />
                              </button>

                              {/* Toggle Status Button */}
                              <button
                                onClick={() => handleToggleStatus(adm)}
                                disabled={isToggling}
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                                  isActive
                                    ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                                }`}
                                title={isActive ? 'Deactivate Branch Admin' : 'Activate Branch Admin'}
                              >
                                {isToggling ? (
                                  <RefreshCw size={11} className="animate-spin" />
                                ) : isActive ? (
                                  <>
                                    <ToggleRight size={13} /> Deactivate
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft size={13} /> Activate
                                  </>
                                )}
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => setDeleteTarget(adm)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Administrator"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Nested Add Branch Admin Modal */}
      <AddBranchAdminModal
        branch={branch}
        open={addAdminOpen}
        onClose={() => setAddAdminOpen(false)}
        onCreate={handleCreateAdmin}
        isSubmitting={isMutating}
      />

      {/* Nested Edit Branch Admin Modal */}
      <EditBranchAdminModal
        admin={editingAdmin}
        open={Boolean(editingAdmin)}
        onClose={() => setEditingAdmin(null)}
        onUpdate={handleUpdateAdmin}
        isSubmitting={isMutating}
      />

      {/* Delete Branch Admin Dialog */}
      <DeleteDialog
        open={!!deleteTarget}
        title={deleteTarget ? `Remove Administrator "${deleteTarget.firstName} ${deleteTarget.lastName}"?` : 'Delete Admin'}
        description={
          deleteTarget
            ? `Are you sure you want to delete administrator account for "${deleteTarget.firstName} ${deleteTarget.lastName}" (${deleteTarget.email})?`
            : undefined
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteAdmin}
        isDeleting={isMutating}
      />
    </>
  );
}
