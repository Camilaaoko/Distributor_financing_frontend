'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput, Select } from '@/components/ui/FormField';
import type { BankUser, BankUserRole, BankUserStatus } from '@/lib/types';
import type { UpdateBankUserInput } from '@/services/bank.service';

interface EditBankUserModalProps {
  user: BankUser | null;
  onClose: () => void;
  onSave: (id: string, input: UpdateBankUserInput) => Promise<boolean>;
  isSubmitting?: boolean;
}

const ROLE_OPTIONS: { value: BankUserRole; label: string }[] = [
  { value: 'BANK_MAKER', label: 'Maker' },
  { value: 'BANK_CHECKER', label: 'Checker' },
];

const STATUS_OPTIONS: BankUserStatus[] = ['Active', 'Inactive', 'Pending', 'Locked'];

export function EditBankUserModal({ user, onClose, onSave, isSubmitting }: EditBankUserModalProps) {
  if (!user) return null;
  return (
    <EditBankUserForm
      key={user.id}
      user={user}
      onClose={onClose}
      onSave={onSave}
      isSubmitting={isSubmitting}
    />
  );
}

function EditBankUserForm({
  user,
  onClose,
  onSave,
  isSubmitting,
}: {
  user: BankUser;
  onClose: () => void;
  onSave: (id: string, input: UpdateBankUserInput) => Promise<boolean>;
  isSubmitting?: boolean;
}) {
  const [form, setForm] = useState<BankUser>(user);
  const [avatarName, setAvatarName] = useState<string | null>(null);

  const set = <K extends keyof BankUser>(key: K, value: BankUser[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    const success = await onSave(form.id, {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      nationalId: form.nationalId,
      role: form.role,
      status: form.status,
    });
    if (success) onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit Bank User"
      description={`Update details for ${form.firstName} ${form.lastName}.`}
      size="lg"
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose}>Cancel</ModalButton>
          <ModalButton onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </ModalButton>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className={`h-16 w-16 rounded-full ${form.avatarColor} text-white font-bold flex items-center justify-center text-lg shrink-0`}>
            {form.firstName[0]}{form.lastName[0]}
          </div>
          <label className="text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-[#1F4DA8] cursor-pointer hover:text-[#3A6FD8] transition-colors">
              <Upload size={16} /> Change profile picture
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setAvatarName(e.target.files?.[0]?.name ?? null)}
            />
            {avatarName && <div className="text-xs text-slate-400 mt-0.5">{avatarName}</div>}
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="First Name" required>
            <TextInput value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
          </FormField>
          <FormField label="Last Name" required>
            <TextInput value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
          </FormField>
          <FormField label="Email" required>
            <TextInput type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </FormField>
          <FormField label="Phone">
            <TextInput value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </FormField>
          <FormField label="National ID">
            <TextInput value={form.nationalId} onChange={(e) => set('nationalId', e.target.value)} />
          </FormField>
          <FormField label="Employee ID" hint="Employee ID cannot be changed.">
            <TextInput value={form.employeeNumber} disabled className="opacity-60 cursor-not-allowed" />
          </FormField>
          <FormField label="Role" required>
            <Select value={form.role} onChange={(e) => set('role', e.target.value as BankUserRole)}>
              {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={(e) => set('status', e.target.value as BankUserStatus)}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </FormField>
          <FormField label="Created Date" hint="Set automatically on creation.">
            <TextInput value={form.createdDate} disabled className="opacity-60 cursor-not-allowed" />
          </FormField>
        </div>
      </div>
    </Modal>
  );
}