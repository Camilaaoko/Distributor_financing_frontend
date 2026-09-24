'use client';

import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput, Select } from '@/components/ui/FormField';
import type { BankAdmin, BankAdminStatus, PlatformRoleName } from '@/lib/types';
import { banks } from '@/lib/mock/platform-admin';
import { BANK_ADMIN_ROLES, BANK_ADMIN_STATUSES } from '@/lib/bank-admin-options';
import type { UpdateBankAdminInput } from '@/services/platform.service';

interface EditBankAdminModalProps {
  admin: BankAdmin | null;
  onClose: () => void;
  onSave: (id: string, input: UpdateBankAdminInput) => Promise<boolean>;
  isSubmitting?: boolean;
}

// Outer wrapper: keys the inner form by admin.id so a fresh `useState` is
// initialized whenever a different admin is opened, without syncing via effect.
export function EditBankAdminModal({ admin, onClose, onSave, isSubmitting }: EditBankAdminModalProps) {
  if (!admin) return null;
  return (
    <EditBankAdminForm
      key={admin.id}
      admin={admin}
      onClose={onClose}
      onSave={onSave}
      isSubmitting={isSubmitting}
    />
  );
}

function EditBankAdminForm({
  admin,
  onClose,
  onSave,
  isSubmitting,
}: {
  admin: BankAdmin;
  onClose: () => void;
  onSave: (id: string, input: UpdateBankAdminInput) => Promise<boolean>;
  isSubmitting?: boolean;
}) {
  const [form, setForm] = useState<BankAdmin>(admin);
  const [avatarName, setAvatarName] = useState<string | null>(null);

  const set = <K extends keyof BankAdmin>(key: K, value: BankAdmin[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    const success = await onSave(form.id, {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      nationalId: form.nationalId,
      bankId: form.bankId,
      department: form.department,
      role: form.role,
      username: form.username,
      status: form.status,
    });
    if (success) onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit Bank Admin"
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
              <UploadCloud size={16} /> Change profile picture
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
          <FormField label="Employee Number" hint="Employee number cannot be changed.">
            <TextInput value={form.employeeNumber} disabled className="opacity-60 cursor-not-allowed" />
          </FormField>
          <FormField label="Bank" required>
            <Select value={form.bankId} onChange={(e) => set('bankId', e.target.value)}>
              {banks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Department">
            <TextInput value={form.department} onChange={(e) => set('department', e.target.value)} />
          </FormField>
          <FormField label="Role" required>
            <Select value={form.role} onChange={(e) => set('role', e.target.value as PlatformRoleName)}>
              {BANK_ADMIN_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={(e) => set('status', e.target.value as BankAdminStatus)}>
              {BANK_ADMIN_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Username" required>
            <TextInput value={form.username} onChange={(e) => set('username', e.target.value)} />
          </FormField>
          <FormField label="Created Date" hint="Set automatically on creation.">
            <TextInput value={form.createdDate} disabled className="opacity-60 cursor-not-allowed" />
          </FormField>
        </div>
      </div>
    </Modal>
  );
}
