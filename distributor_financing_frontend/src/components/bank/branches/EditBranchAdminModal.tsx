'use client';

import { useState, useEffect } from 'react';
import { UserCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { TextInput } from '@/components/ui/FormField';
import type { UserResponse, UpdateBankAdminRequest } from '@/types/onboarding';

interface EditBranchAdminModalProps {
  admin: UserResponse | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, payload: UpdateBankAdminRequest) => Promise<boolean>;
  isSubmitting?: boolean;
}

export function EditBranchAdminModal({
  admin,
  open,
  onClose,
  onUpdate,
  isSubmitting = false,
}: EditBranchAdminModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (admin) {
      setFirstName(admin.firstName || '');
      setLastName(admin.lastName || '');
      setEmail(admin.email || '');
      setPhoneNumber(admin.phoneNumber || '');
      setNationalIdNumber(admin.nationalIdNumber || '');
      setEmployeeId(admin.employeeId || '');
      setError(null);
    }
  }, [admin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const success = await onUpdate(admin.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        nationalIdNumber: nationalIdNumber.trim() || undefined,
        employeeId: employeeId.trim() || undefined,
      });
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update branch administrator.');
    }
  };

  if (!admin) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <UserCheck size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Edit Branch Administrator</h2>
            <p className="text-xs text-slate-500 font-normal">Update administrator profile and contact details</p>
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
              First Name *
            </label>
            <TextInput
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
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
            required
            className="text-xs font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <TextInput
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
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
            className="text-xs font-medium"
          />
        </div>
      </form>
    </Modal>
  );
}
