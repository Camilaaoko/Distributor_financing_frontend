'use client';

import { useState, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput, Select } from '@/components/ui/FormField';
import type { Bank, BankAdmin, BankAdminStatus, PlatformRoleName, DynamicRole } from '@/lib/types';
import { BANK_ADMIN_ROLES, BANK_ADMIN_STATUSES } from '@/lib/bank-admin-options';
import { platformService, type UpdateBankAdminInput } from '@/services/platform.service';
import { rbacService } from '@/services/rbac.service';

interface EditBankAdminModalProps {
  admin: BankAdmin | null;
  onClose: () => void;
  onSave: (id: string, input: UpdateBankAdminInput) => Promise<boolean>;
  isSubmitting?: boolean;
  banks?: Bank[];
}

export function EditBankAdminModal({ admin, onClose, onSave, isSubmitting, banks = [] }: EditBankAdminModalProps) {
  if (!admin) return null;
  return (
    <EditBankAdminForm
      key={admin.id}
      admin={admin}
      onClose={onClose}
      onSave={onSave}
      isSubmitting={isSubmitting}
      banks={banks}
    />
  );
}

function EditBankAdminForm({
  admin,
  onClose,
  onSave,
  isSubmitting,
  banks = [],
}: {
  admin: BankAdmin;
  onClose: () => void;
  onSave: (id: string, input: UpdateBankAdminInput) => Promise<boolean>;
  isSubmitting?: boolean;
  banks?: Bank[];
}) {
  const [form, setForm] = useState<BankAdmin>(admin);
  const [avatarName, setAvatarName] = useState<string | null>(null);
  const [activeBanks, setActiveBanks] = useState<Bank[]>(banks);
  const [dynamicRoles, setDynamicRoles] = useState<DynamicRole[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    rbacService.getRoles('BANK')
      .then((r) => setDynamicRoles(r))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (banks.length > 0) {
      setActiveBanks(banks);
    } else {
      platformService.listBanks({ status: 'ACTIVE' }).then((res) => {
        setActiveBanks(
          res.items.map((b) => ({
            id: b.id,
            name: b.name,
            bankCode: b.bankCode,
            branch: b.branch,
            branchCode: b.branchCode,
            status: b.status as Bank['status'],
            createdAt: b.createdAt,
          }))
        );
      }).catch(() => {});
    }
  }, [banks]);

  const set = <K extends keyof BankAdmin>(key: K, value: BankAdmin[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.bankId) {
      setError('Please fill in First Name, Last Name, Email, and select a Bank.');
      return;
    }
    setError(null);
    const ok = await onSave(admin.id, {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      bankId: form.bankId,
      department: form.department,
      role: form.role,
      status: form.status,
      username: form.username,
    });
    if (ok) onClose();
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Edit Bank Administrator"
      description={`Update details for ${admin.firstName} ${admin.lastName}.`}
      size="lg"
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </ModalButton>
          <ModalButton variant="primary" onClick={handleSubmit} loading={isSubmitting}>
            Save Changes
          </ModalButton>
        </>
      }
    >
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <UploadCloud size={20} />
          </div>
          <label className="text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-[#1F4DA8] cursor-pointer hover:text-[#3A6FD8] transition-colors">
              Change profile picture
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setAvatarName(e.target.files?.[0]?.name ?? null)}
            />
            <div className="text-xs text-slate-400 mt-0.5">{avatarName ?? 'PNG or JPG, up to 2MB'}</div>
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
          <FormField label="National ID" hint="National ID cannot be changed.">
            <TextInput value={form.nationalId} disabled className="opacity-60 cursor-not-allowed" />
          </FormField>
          <FormField label="Employee Number" hint="Employee number cannot be changed.">
            <TextInput value={form.employeeNumber} disabled className="opacity-60 cursor-not-allowed" />
          </FormField>
          <FormField label="Bank" required>
            <Select value={form.bankId} onChange={(e) => set('bankId', e.target.value)}>
              {activeBanks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}{b.branch ? ` - ${b.branch}` : ''}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Department">
            <TextInput value={form.department} onChange={(e) => set('department', e.target.value)} />
          </FormField>
          <FormField label="Role" required>
            <Select value={form.role} onChange={(e) => set('role', e.target.value as PlatformRoleName)}>
              {dynamicRoles.length > 0 ? (
                dynamicRoles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)
              ) : (
                BANK_ADMIN_ROLES.map((r) => <option key={r} value={r}>{r}</option>)
              )}
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
        </div>
      </div>
    </Modal>
  );
}