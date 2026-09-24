'use client';

import { useState, useEffect } from 'react';
import { Landmark, UserCheck } from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput } from '@/components/ui/FormField';
import type { Bank } from '@/lib/types';
import type { CreateBankAdminInput } from '@/services/platform.service';

interface AddBankAdminModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: CreateBankAdminInput) => Promise<boolean>;
  isSubmitting?: boolean;
  selectedBank?: Bank | null;
  banks?: Bank[];
  defaultBankId?: string;
}

export function AddBankAdminModal({
  open,
  onClose,
  onCreate,
  isSubmitting,
  selectedBank,
  defaultBankId,
}: AddBankAdminModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setNationalId('');
      setEmployeeNumber('');
      setError(null);
    }
  }, [open, selectedBank, defaultBankId]);

  const handleClose = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setNationalId('');
    setEmployeeNumber('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Please fill in First Name, Last Name, and Email.');
      return;
    }
    const currentBankId = selectedBank?.id || defaultBankId;
    if (!currentBankId) {
      setError('Bank context is missing. Please select a bank.');
      return;
    }

    setError(null);
    const ok = await onCreate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      nationalId: nationalId.trim(),
      employeeNumber: employeeNumber.trim(),
      bankId: currentBankId,
      department: selectedBank?.branch || 'Head Office',
      role: 'Bank Admin',
      username: email.trim(),
      status: 'Active',
    });

    if (ok) handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Bank Administrator"
      description={`Create the primary administrator account for ${selectedBank?.name || 'this partner bank'}.`}
      size="md"
      footer={
        <>
          <ModalButton variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </ModalButton>
          <ModalButton variant="primary" onClick={handleSubmit} loading={isSubmitting}>
            Create Admin
          </ModalButton>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 font-semibold">
            {error}
          </div>
        )}

        {/* Prefilled & Linked Bank Banner */}
        {selectedBank && (
          <div className="flex items-center gap-3.5 p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl">
            <div className="h-10 w-10 rounded-xl bg-[#1F4DA8] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Landmark size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 truncate">{selectedBank.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {selectedBank.status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                Branch: <span className="font-semibold text-slate-800">{selectedBank.branch || 'Head Office'}</span>
                {selectedBank.bankCode ? ` • Bank Code: ${selectedBank.bankCode}` : ''}
              </p>
            </div>
          </div>
        )}

        {/* 6 Essential Fields Only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField label="First Name" required>
            <TextInput
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Brian"
              autoFocus
            />
          </FormField>

          <FormField label="Last Name" required>
            <TextInput
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Sigei"
            />
          </FormField>

          <FormField label="Email Address" required className="sm:col-span-2">
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bank.co.ke"
            />
          </FormField>

          <FormField label="Phone Number">
            <TextInput
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254 7xx xxx xxx"
            />
          </FormField>

          <FormField label="National ID Number">
            <TextInput
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="e.g. 29384756"
            />
          </FormField>

          <FormField label="Employee ID / Number" className="sm:col-span-2">
            <TextInput
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              placeholder="e.g. EMP-9921"
            />
          </FormField>
        </div>

        <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <UserCheck size={14} className="text-[#1F4DA8]" />
          <span>Role automatically assigned: <strong className="text-slate-700">Bank Admin</strong></span>
        </div>
      </div>
    </Modal>
  );
}