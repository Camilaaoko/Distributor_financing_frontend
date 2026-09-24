'use client';

import { useState, useEffect } from 'react';

import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput, Select } from '@/components/ui/FormField';
import { rbacService } from '@/services/rbac.service';
import type { StakeholderType, Permission } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import { ShieldCheck, CheckSquare, Square, Building2 } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';

interface CreateRoleModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  fixedStakeholderType?: StakeholderType;
  bankName?: string;
}

export function CreateRoleModal({ open, onClose, onCreated, fixedStakeholderType, bankName }: CreateRoleModalProps) {
  const toast = useToast();
  const { user } = useAuthContext();

  const isBankAdmin = fixedStakeholderType === 'BANK' || user?.role === 'BANK_ADMIN' || user?.role?.startsWith('BANK');
  const activeBankName = bankName || user?.bankName || 'Partner Bank';

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [stakeholderType, setStakeholderType] = useState<StakeholderType>(
    fixedStakeholderType || (isBankAdmin ? 'BANK' : 'BANK')
  );
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [isLoadingPerms, setIsLoadingPerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fixedStakeholderType) {
      setStakeholderType(fixedStakeholderType);
    } else if (isBankAdmin) {
      setStakeholderType('BANK');
    }
  }, [fixedStakeholderType, isBankAdmin, open]);


  useEffect(() => {
    if (!open) return;
    setIsLoadingPerms(true);
    rbacService.getPermissions(stakeholderType)
      .then((perms) => {
        setAvailablePermissions(perms);
        setSelectedPermissions(new Set());
      })
      .catch((err) => toast.error(getErrorMessage(err, 'Failed to load permissions.')))
      .finally(() => setIsLoadingPerms(false));
  }, [open, stakeholderType]);

  const handleClose = () => {
    setName('');
    setCode('');
    setSelectedPermissions(new Set());
    setError(null);
    onClose();
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!code || code.startsWith(stakeholderType)) {
      const generated = `${stakeholderType}_${val.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
      setCode(generated);
    }
  };

  const togglePermission = (permCode: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permCode)) next.delete(permCode);
      else next.add(permCode);
      return next;
    });
  };

  const toggleModule = (moduleName: string, perms: Permission[]) => {
    const moduleCodes = perms.map((p) => p.code);
    const allSelected = moduleCodes.every((c) => selectedPermissions.has(c));

    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        moduleCodes.forEach((c) => next.delete(c));
      } else {
        moduleCodes.forEach((c) => next.add(c));
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedPermissions(new Set(availablePermissions.map((p) => p.code)));
  };

  const clearAll = () => {
    setSelectedPermissions(new Set());
  };

  const handleSubmit = async () => {
    if (!name.trim() || !code.trim()) {
      setError('Please provide a role name and role code.');
      return;
    }

    if (selectedPermissions.size === 0) {
      setError('Please assign at least one permission to this role.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await rbacService.createRole({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        stakeholderType,
        permissionCodes: Array.from(selectedPermissions),
      });
      toast.success(`Role "${name}" created successfully with ${selectedPermissions.size} permissions.`);
      handleClose();
      onCreated?.();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to create role.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group available permissions by module
  const grouped = availablePermissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create Role"
      description="Define a new role and grant granular access permissions."
      size="xl"
      footer={
        <>
          <ModalButton variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </ModalButton>
          <ModalButton variant="primary" onClick={handleSubmit} loading={isSubmitting}>
            Create Role
          </ModalButton>
        </>
      }
    >
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isBankAdmin ? (
            <FormField label="Bank / Organization">
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 select-none">
                <Building2 size={16} className="text-[#1F4DA8] shrink-0" />
                <span className="truncate">{activeBankName}</span>
              </div>
            </FormField>
          ) : (
            <FormField label="Target Stakeholder" required>
              <Select
                value={stakeholderType}
                onChange={(e) => setStakeholderType(e.target.value as StakeholderType)}
              >
                <option value="BANK">Partner Bank</option>
                <option value="PLATFORM">Platform Administration</option>
                <option value="MANUFACTURER">Manufacturer</option>
                <option value="DISTRIBUTOR">Distributor / Dealer</option>
              </Select>
            </FormField>
          )}

          <FormField label="Role Name" required>

            <TextInput
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Senior Credit Risk Officer"
            />
          </FormField>

          <FormField label="Role Code" required>
            <TextInput
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. BANK_RISK_OFFICER"
              className="font-mono uppercase text-xs"
            />
          </FormField>
        </div>

        {/* Permissions Selection Matrix */}
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#1F4DA8]" />
                Permissions Matrix ({selectedPermissions.size} selected)
              </p>
              <p className="text-xs text-slate-500">
                Grant or revoke granular actions for this role across modules.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-xs font-semibold text-[#1F4DA8] hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-semibold text-slate-500 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          {isLoadingPerms ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading permissions catalog...</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(grouped).map(([moduleName, perms]) => {
                const moduleCodes = perms.map((p) => p.code);
                const allSelected = moduleCodes.every((c) => selectedPermissions.has(c));

                return (
                  <div
                    key={moduleName}
                    className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {moduleName}
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleModule(moduleName, perms)}
                        className="text-[11px] font-semibold text-[#1F4DA8] hover:underline flex items-center gap-1"
                      >
                        {allSelected ? <CheckSquare size={13} /> : <Square size={13} />}
                        {allSelected ? 'Deselect Module' : 'Select All in Module'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {perms.map((p) => {
                        const checked = selectedPermissions.has(p.code);
                        return (
                          <label
                            key={p.code}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-colors cursor-pointer text-left ${
                              checked
                                ? 'bg-blue-50/70 border-blue-200 text-slate-900'
                                : 'bg-white border-slate-200/70 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(p.code)}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1F4DA8] focus:ring-[#1F4DA8]"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold leading-snug">{p.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{p.code}</p>
                              {p.description && (
                                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{p.description}</p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}