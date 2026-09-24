'use client';

import { useState, useEffect } from 'react';
import { Building2, AlertCircle, RefreshCw } from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { TextInput } from '@/components/ui/FormField';
import type { BankBranchResponse, UpdateBankBranchRequest } from '@/types/onboarding';

interface EditBranchModalProps {
  branch: BankBranchResponse | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (branchId: string, payload: UpdateBankBranchRequest) => Promise<boolean>;
  isSubmitting?: boolean;
}

export function EditBranchModal({
  branch,
  open,
  onClose,
  onUpdate,
  isSubmitting = false,
}: EditBranchModalProps) {
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (branch) {
      setBranchName(branch.branchName || branch.branch || '');
      setBranchCode(branch.branchCode || '');
      setLocation(branch.location || '');
      setError(null);
    }
  }, [branch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branch) return;
    if (!branchName.trim()) {
      setError('Branch name is required.');
      return;
    }

    try {
      const success = await onUpdate(branch.id, {
        branchName: branchName.trim(),
        branchCode: branchCode.trim() || undefined,
        location: location.trim() || undefined,
      });
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update branch.');
    }
  };

  if (!branch) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <Building2 size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Edit Bank Branch</h2>
            <p className="text-xs text-slate-500 font-normal">Update branch name and location details</p>
          </div>
        </div>
      }
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <ModalButton variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </ModalButton>
          <ModalButton variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </ModalButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Branch Code
            </label>
            <TextInput
              value={branchCode}
              disabled
              className="bg-slate-100 font-mono text-slate-500 cursor-not-allowed text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Location / City
            </label>
            <TextInput
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Nairobi, Kenya"
              className="text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Branch Name *
          </label>
          <TextInput
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="e.g. Westlands Commercial Branch"
            required
            className="text-xs"
          />
        </div>
      </form>
    </Modal>
  );
}
