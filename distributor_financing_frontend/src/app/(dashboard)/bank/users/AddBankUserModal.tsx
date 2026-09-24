'use client';

import { useState, useEffect } from 'react';
import { Upload, ShieldCheck, Plus, ExternalLink, Building } from 'lucide-react';
import Link from 'next/link';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput, Select } from '@/components/ui/FormField';
import type { CreateBankUserInput } from '@/services/bank.service';
import { bankService } from '@/services/bank.service';
import { roleManagementApi } from '@/services/onboarding-api.service';
import type { RoleResponse, BankBranchResponse } from '@/types/onboarding';

interface AddBankUserModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: CreateBankUserInput) => Promise<boolean>;
  isSubmitting?: boolean;
}

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  nationalId: '',
  employeeNumber: '',
  roleId: '',
  branchId: '001',
  branchCode: '001',
  branchName: 'Head Office',
};

const PHONE_REGEX = /^(?:(07|01)\d{8}|\+254\d{9})$/;
const NATIONAL_ID_REGEX = /^\d{8}$/;

export function AddBankUserModal({ open, onClose, onCreate, isSubmitting }: AddBankUserModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [availableRoles, setAvailableRoles] = useState<RoleResponse[]>([]);
  const [availableBranches, setAvailableBranches] = useState<BankBranchResponse[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [avatarName, setAvatarName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setIsLoadingRoles(true);
      roleManagementApi
        .getRoles()
        .then((roles) => {
          setAvailableRoles(roles || []);
          if (roles && roles.length > 0) {
            // Select first available unassigned role if any, or first role
            const unassigned = roles.find((r) => !r.isAssigned);
            setForm((prev) => ({
              ...prev,
              roleId: prev.roleId || (unassigned ? unassigned.id : roles[0].id),
            }));
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingRoles(false));

      setIsLoadingBranches(true);
      bankService
        .getBankBranches()
        .then((branches: BankBranchResponse[]) => {
          if (branches && branches.length > 0) {
            setAvailableBranches(branches);
            const first = branches[0];
            setForm((prev) => ({
              ...prev,
              branchId: first.id || first.branchCode || '001',
              branchCode: first.branchCode || '001',
              branchName: first.branchName || first.branch || 'Head Office',
            }));
          } else {
            // Default standard bank branch list if backend has no dynamic branches yet
            const defaultBranches: BankBranchResponse[] = [
              { id: 'branch_001', branchCode: '001', branchName: 'Head Office / Corporate', status: 'ACTIVE', createdAt: new Date().toISOString() },
              { id: 'branch_002', branchCode: '002', branchName: 'Nairobi Central Branch', status: 'ACTIVE', createdAt: new Date().toISOString() },
              { id: 'branch_003', branchCode: '003', branchName: 'Westlands Commercial Branch', status: 'ACTIVE', createdAt: new Date().toISOString() },
              { id: 'branch_004', branchCode: '004', branchName: 'Mombasa Port Branch', status: 'ACTIVE', createdAt: new Date().toISOString() },
              { id: 'branch_005', branchCode: '005', branchName: 'Kisumu Hub Branch', status: 'ACTIVE', createdAt: new Date().toISOString() },
            ];
            setAvailableBranches(defaultBranches);
            setForm((prev) => ({
              ...prev,
              branchId: defaultBranches[0].id,
              branchCode: defaultBranches[0].branchCode || '001',
              branchName: defaultBranches[0].branchName || 'Head Office',
            }));
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingBranches(false));
    }
  }, [open]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleBranchChange = (branchIdOrCode: string) => {
    const selected = availableBranches.find((b) => b.id === branchIdOrCode || b.branchCode === branchIdOrCode);
    setForm((f) => ({
      ...f,
      branchId: selected?.id || branchIdOrCode,
      branchCode: selected?.branchCode || branchIdOrCode,
      branchName: selected?.branchName || selected?.branch || 'Branch',
    }));
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setAvatarName(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim().replace(/\s+/g, '');
    const nationalId = form.nationalId.trim();
    const employeeNumber = form.employeeNumber.trim();
    const roleId = form.roleId.trim();
    const branchId = form.branchId || form.branchCode;

    if (!firstName || !lastName || !email || !phone || !nationalId || !employeeNumber || !roleId) {
      setError('Please fill in all required fields, including role and branch assignment.');
      return;
    }

    // Phone validation
    if (!PHONE_REGEX.test(phone)) {
      setError('Invalid phone number format. Please use 07XXXXXXXX, 01XXXXXXXX, or +254XXXXXXXXX.');
      return;
    }

    // National ID validation
    if (!NATIONAL_ID_REGEX.test(nationalId)) {
      setError('Invalid National ID format. Must be an 8-digit number (e.g. 12345678).');
      return;
    }

    setError(null);
    const success = await onCreate({
      firstName,
      lastName,
      email,
      phone,
      nationalId,
      employeeNumber,
      roleId,
      role: availableRoles.find((r) => r.id === roleId)?.name || roleId,
      branchId,
      branchCode: form.branchCode,
      branchName: form.branchName,
    });
    if (success) handleClose();
  };

  const selectedRole = availableRoles.find((r) => r.id === form.roleId);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Bank Staff User"
      description="Create a new bank user account and assign an operational role with fine-grained permissions."
      size="lg"
      footer={
        <>
          <ModalButton variant="secondary" onClick={handleClose}>
            Cancel
          </ModalButton>
          <ModalButton onClick={handleSubmit} disabled={isSubmitting || isLoadingRoles}>
            {isSubmitting ? 'Creating User…' : 'Create User'}
          </ModalButton>
        </>
      }
    >
      <div className="space-y-5">
        {error && (
          <div className="text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
            <Upload size={20} />
          </div>
          <label className="text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-[#1F4DA8] cursor-pointer hover:text-[#3A6FD8] transition-colors">
              Upload profile picture (optional)
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
            <TextInput
              value={form.firstName}
              onChange={(e) => set('firstName', e.target.value)}
              placeholder="e.g. John"
            />
          </FormField>

          <FormField label="Last Name" required>
            <TextInput
              value={form.lastName}
              onChange={(e) => set('lastName', e.target.value)}
              placeholder="e.g. Kamau"
            />
          </FormField>

          <FormField label="Email" required hint="Login credentials will be dispatched to this email">
            <TextInput
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="jkamau@bank.co.ke"
            />
          </FormField>

          <FormField
            label="Phone Number"
            required
            hint="Format: 07XXXXXXXX or +2547XXXXXXXX"
          >
            <TextInput
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+254712345678"
            />
          </FormField>

          <FormField
            label="National ID"
            required
            hint="8-digit national identity number"
          >
            <TextInput
              value={form.nationalId}
              onChange={(e) => set('nationalId', e.target.value)}
              placeholder="12345678"
              maxLength={8}
            />
          </FormField>

          <FormField
            label="Employee ID"
            required
            hint="Bank staff identification code"
          >
            <TextInput
              value={form.employeeNumber}
              onChange={(e) => set('employeeNumber', e.target.value)}
              placeholder="KCB-MKR-0042"
            />
          </FormField>
        </div>

        {/* Branch Selection Dropdown */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Building size={14} className="text-[#1F4DA8]" />
            Assigned Bank Branch <span className="text-rose-500">*</span>
          </label>

          {isLoadingBranches ? (
            <div className="text-xs text-slate-400 py-2">Loading bank branches...</div>
          ) : (
            <Select
              value={form.branchId || form.branchCode}
              onChange={(e) => handleBranchChange(e.target.value)}
              className="w-full font-medium"
            >
              {availableBranches.map((branch) => (
                <option key={branch.id || branch.branchCode} value={branch.id || branch.branchCode}>
                  {branch.branchName || branch.branch || 'Branch'} {branch.branchCode ? `(${branch.branchCode})` : ''}
                  {branch.location ? ` — ${branch.location}` : ''}
                </option>
              ))}
            </Select>
          )}
          <p className="text-[11px] text-slate-400">
            Staff users operate within their assigned branch ecosystem.
          </p>
        </div>

        {/* Role Selection Dropdown */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Assigned Operational Role <span className="text-rose-500">*</span>
            </label>
            <Link
              href="/bank/roles"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1F4DA8] hover:underline"
            >
              <Plus className="h-3 w-3" /> Create New Role
            </Link>
          </div>

          {isLoadingRoles ? (
            <div className="text-xs text-slate-400 py-2">Loading available roles...</div>
          ) : availableRoles.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                No Custom Roles Found
              </p>
              <p>
                You must create a custom bank role with permissions before onboarding users.
              </p>
              <Link
                href="/bank/roles"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1F4DA8] underline mt-1"
              >
                Go to Bank Roles & Permissions <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <Select
              value={form.roleId}
              onChange={(e) => set('roleId', e.target.value)}
              className="w-full font-medium"
            >
              <option value="" disabled>
                -- Select an operational role --
              </option>
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} ({role.permissions?.length || 0} permissions)
                  {role.isAssigned ? ' [Already Assigned]' : ' [Available]'}
                </option>
              ))}
            </Select>
          )}

          {/* Selected Role Permissions Preview */}
          {selectedRole && selectedRole.permissions && selectedRole.permissions.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5 mt-2">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Permissions inherited by this user ({selectedRole.permissions.length}):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedRole.permissions.map((p) => (
                  <span
                    key={p}
                    className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200"
                  >
                    {p.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}