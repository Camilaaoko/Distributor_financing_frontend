'use client';

import { useState } from 'react';
import { UserPlus, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { TextInput } from '@/components/ui/FormField';
import type { BankBranchResponse, OnboardBankAdminRequest } from '@/types/onboarding';

interface AddBranchAdminModalProps {
  branch: BankBranchResponse | null;
  open: boolean;
  onClose: () => void;
  onCreate: (payload: OnboardBankAdminRequest) => Promise<boolean>;
  isSubmitting?: boolean;
}

export function AddBranchAdminModal({
  branch,
  open,
  onClose,
  onCreate,
  isSubmitting = false,
}: AddBranchAdminModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');
    setNationalIdNumber('');
    setEmployeeId('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNumber.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!branch) {
      setError('Branch not selected.');
      return;
    }

    try {
      const success = await onCreate({
        branchId: branch.id,
        bankId: branch.bankId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        nationalIdNumber: nationalIdNumber.trim() || 'N/A',
        employeeId: employeeId.trim() || 'N/A',
      });
      if (success) {
        handleClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to onboard branch administrator.');
    }
  };

  if (!branch) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <UserPlus size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Onboard Branch Administrator</h2>
            <p className="text-xs text-slate-500 font-normal">
              Assign administrative lead for {branch.branchName || branch.branch || 'Branch'} ({branch.branchCode})
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
          <ModalButton variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Provisioning...
              </>
            ) : (
              'Onboard Admin'
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

        {/* Branch Context banner */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 font-medium">Assigned Branch:</span>{' '}
            <strong className="text-slate-900">{branch.branchName || branch.branch}</strong>
          </div>
          <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
            {branch.branchCode}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              First Name *
            </label>
            <TextInput
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Jane"
              required
              className="text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Last Name *
            </label>
            <TextInput
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Doe"
              required
              className="text-xs font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Work Email Address *
          </label>
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. jane.doe@bank.com"
            required
            className="text-xs font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number *
            </label>
            <TextInput
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. +254 700 000 000"
              required
              className="text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Employee / Staff ID
            </label>
            <TextInput
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. EMP-9921"
              className="text-xs font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            National ID Number
          </label>
          <TextInput
            value={nationalIdNumber}
            onChange={(e) => setNationalIdNumber(e.target.value)}
            placeholder="e.g. 29384756"
            className="text-xs font-medium"
          />
        </div>
      </form>
    </Modal>
  );
}
