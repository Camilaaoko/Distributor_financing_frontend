'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Landmark, Building2, MapPin, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { TextInput, Select } from '@/components/ui/FormField';
import { bankOnboardingApi } from '@/services/onboarding-api.service';
import { normalizeBankCode } from '@/services/platform.mock';
import { useAuth } from '@/hooks/useAuth';
import type { Branch, BankBranchResponse, OnboardBankBranchRequest } from '@/types/onboarding';

interface AddBranchModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: OnboardBankBranchRequest) => Promise<boolean>;
  isSubmitting?: boolean;
  bankCode?: string;
  bankName?: string;
  bankId?: string;
  existingBranches?: BankBranchResponse[];
}

export function AddBranchModal({
  open,
  onClose,
  onCreate,
  isSubmitting = false,
  bankCode: propBankCode,
  bankName: propBankName,
  bankId: propBankId,
  existingBranches = [],
}: AddBranchModalProps) {
  const { user } = useAuth();

  // Resolve active bank context
  const activeBankId = propBankId || user?.bankId || (user as any)?.parentEntityId || 'bnk_02';
  const activeBankName = propBankName || user?.bankName || 'Equity Bank';
  const activeBankCode = useMemo(() => {
    return propBankCode || (user as any)?.bankCode || normalizeBankCode(activeBankName || activeBankId);
  }, [propBankCode, user, activeBankName, activeBankId]);

  // Form & dropdown state
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [selectedBranchCode, setSelectedBranchCode] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);

  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Set of already onboarded branch codes for easy filtering & labeling
  const onboardedCodes = useMemo(() => {
    return new Set(
      existingBranches
        .map((b) => (b.branchCode || '').trim().toLowerCase())
        .filter(Boolean)
    );
  }, [existingBranches]);

  // Fetch available directory branches for this bank when modal opens
  const fetchBankDirectoryBranches = useCallback(async () => {
    if (!open) return;
    setIsLoadingBranches(true);
    setError(null);
    try {
      const branches = await bankOnboardingApi.getAvailableBranches(
        activeBankCode,
        activeBankId,
        activeBankName
      );
      setAvailableBranches(branches || []);
    } catch (err: any) {
      console.warn('Failed to load bank directory branches:', err);
      // Fallback is handled inside onboarding-api / mock
      setAvailableBranches([]);
    } finally {
      setIsLoadingBranches(false);
    }
  }, [open, activeBankCode, activeBankId, activeBankName]);

  useEffect(() => {
    if (open) {
      fetchBankDirectoryBranches();
    }
  }, [open, fetchBankDirectoryBranches]);

  const resetForm = () => {
    setBranchCode('');
    setBranchName('');
    setLocation('');
    setSelectedBranchCode('');
    setIsManualEntry(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Handle selecting a branch from the bank's directory dropdown
  const handleSelectBranch = (selectedCode: string) => {
    setSelectedBranchCode(selectedCode);
    if (!selectedCode) {
      setBranchCode('');
      setBranchName('');
      setLocation('');
      return;
    }

    const found = availableBranches.find((b) => b.branchCode === selectedCode);
    if (found) {
      setBranchCode(found.branchCode);
      setBranchName(found.branchName || found.name || found.branch || '');
      setLocation(found.location || found.city || 'Nairobi, Kenya');
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchCode.trim()) {
      setError('Branch code is required. Please choose a branch from the dropdown or enter one.');
      return;
    }
    if (!branchName.trim()) {
      setError('Branch name is required.');
      return;
    }

    try {
      const success = await onCreate({
        bankId: activeBankId,
        branchCode: branchCode.trim(),
        branchName: branchName.trim(),
        branch: branchName.trim(),
        location: location.trim() || 'Nairobi, Kenya',
      });
      if (success) {
        handleClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to onboard branch.');
    }
  };

  // Calculate remaining un-onboarded branches count
  const unonboardedCount = useMemo(() => {
    return availableBranches.filter((b) => !onboardedCodes.has(b.branchCode.toLowerCase())).length;
  }, [availableBranches, onboardedCodes]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <Building2 size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Add Bank Branch</h2>
            <p className="text-xs text-slate-500 font-normal">
              Register an operating branch under {activeBankName}
            </p>
          </div>
        </div>
      }
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <ModalButton variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </ModalButton>
          <ModalButton variant="primary" onClick={handleSubmit} disabled={isSubmitting || isLoadingBranches}>
            {isSubmitting ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Onboarding Branch...
              </>
            ) : (
              'Onboard Branch'
            )}
          </ModalButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Bank Scope Banner */}
        <div className="p-3.5 bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-100 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-[#1F4DA8] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Landmark size={16} />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-900">{activeBankName}</span>
                <span className="text-[10px] font-bold bg-white/90 border border-blue-200 text-[#1F4DA8] px-1.5 py-0.2 rounded font-mono">
                  {activeBankCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Directory filtered strictly for <span className="font-semibold text-slate-700">{activeBankName}</span> branches
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsManualEntry(!isManualEntry);
              if (!isManualEntry) {
                setSelectedBranchCode('');
              }
            }}
            className="text-[11px] font-bold text-[#1F4DA8] hover:text-[#173a80] hover:underline shrink-0 cursor-pointer bg-white/80 hover:bg-white border border-blue-200/80 rounded-lg px-2.5 py-1 transition-all"
          >
            {isManualEntry ? 'Select from Directory' : '+ Custom / Manual'}
          </button>
        </div>

        {/* Mode 1: Bank Branch Directory Dropdown (Default) */}
        {!isManualEntry ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select {activeBankName} Branch <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-slate-400">
                {isLoadingBranches ? (
                  <span className="inline-flex items-center gap-1 text-[#1F4DA8]">
                    <RefreshCw size={11} className="animate-spin" /> Fetching directory...
                  </span>
                ) : (
                  `${unonboardedCount} available branches`
                )}
              </span>
            </div>

            <Select
              value={selectedBranchCode}
              onChange={(e) => handleSelectBranch(e.target.value)}
              disabled={isLoadingBranches}
              className="text-xs font-medium cursor-pointer"
              required
            >
              <option value="">
                {isLoadingBranches
                  ? `Loading ${activeBankName} branches...`
                  : `-- Choose an available ${activeBankName} branch --`}
              </option>
              {availableBranches.map((branch) => {
                const isOnboarded = onboardedCodes.has(branch.branchCode.toLowerCase());
                return (
                  <option
                    key={branch.branchCode}
                    value={branch.branchCode}
                    disabled={isOnboarded}
                    className={isOnboarded ? 'text-slate-400 bg-slate-50' : 'text-slate-900'}
                  >
                    [{branch.branchCode}] {branch.branchName || branch.name || branch.branch}
                    {branch.location ? ` — ${branch.location}` : ''}
                    {isOnboarded ? ' (Already Onboarded)' : ''}
                  </option>
                );
              })}
            </Select>
            <p className="text-[11px] text-slate-400">
              Selecting a branch from the directory automatically populates the branch code and location.
            </p>
          </div>
        ) : (
          /* Mode 2: Manual / Custom Branch Entry */
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
            <span>Manual Mode: Enter custom or newly established physical branch details.</span>
            <button
              type="button"
              onClick={() => setIsManualEntry(false)}
              className="font-bold underline text-amber-900 hover:text-amber-950 ml-2 shrink-0 cursor-pointer"
            >
              Back to Directory
            </button>
          </div>
        )}

        {/* Selected / Editable Details */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Branch Code <span className="text-rose-500">*</span>
            </label>
            <TextInput
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              placeholder="e.g. 010 or BR-01"
              required
              className="font-mono text-xs"
              readOnly={!isManualEntry && Boolean(selectedBranchCode)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Location / City
            </label>
            <TextInput
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Upper Hill, Nairobi"
              className="text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Branch Name <span className="text-rose-500">*</span>
          </label>
          <TextInput
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="e.g. Equity Centre Upper Hill"
            required
            className="text-xs font-semibold"
          />
        </div>

        {/* Auto-fill indicator */}
        {selectedBranchCode && !isManualEntry && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
            <span>
              Directory branch selected: <strong className="font-bold">{branchName}</strong> (Code: {branchCode})
            </span>
          </div>
        )}
      </form>
    </Modal>
  );
}
