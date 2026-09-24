'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput } from '@/components/ui/FormField';
import { rbacService } from '@/services/rbac.service';
import type { DynamicRole, Permission } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import { ShieldCheck, CheckSquare, Square } from 'lucide-react';

interface EditRoleModalProps {
  role: DynamicRole | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export function EditRoleModal({ role, onClose, onUpdated }: EditRoleModalProps) {
  if (!role) return null;
  return <EditRoleForm role={role} onClose={onClose} onUpdated={onUpdated} />;
}

function EditRoleForm({
  role,
  onClose,
  onUpdated,
}: {
  role: DynamicRole;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState(role.name);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(role.permissions.map((p) => p.code))
  );

  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [isLoadingPerms, setIsLoadingPerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoadingPerms(true);
    rbacService.getPermissions(role.stakeholderType)
      .then((perms) => setAvailablePermissions(perms))
      .catch((err) => toast.error(getErrorMessage(err, 'Failed to load permissions.')))
      .finally(() => setIsLoadingPerms(false));
  }, [role.stakeholderType]);

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

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please provide a role name.');
      return;
    }

    if (selectedPermissions.size === 0) {
      setError('Please assign at least one permission.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await rbacService.updateRole(role.id, {
        name: name.trim(),
        permissionCodes: Array.from(selectedPermissions),
      });
      toast.success(`Role "${name}" updated successfully.`);
      onClose();
      onUpdated?.();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update role.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const grouped = availablePermissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`Edit Role: ${role.name}`}
      description={`Update permissions for ${role.stakeholderType} role (${role.code}).`}
      size="xl"
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
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Role Name" required>
            <TextInput value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>

          <FormField label="Role Code (Read-Only)">
            <TextInput value={role.code} disabled className="bg-slate-100 font-mono text-xs" />
          </FormField>
        </div>

        {/* Permissions Selection Matrix */}
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#1F4DA8]" />
                Permissions Matrix ({selectedPermissions.size} assigned)
              </p>
              <p className="text-xs text-slate-500">
                Grant or revoke granular actions for this role across modules.
              </p>
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