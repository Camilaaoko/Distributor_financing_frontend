'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  Trash2,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  UserPlus,
  Building2,
  Factory,
} from 'lucide-react';
import Link from 'next/link';
import { roleManagementApi } from '@/services/onboarding-api.service';
import type { RoleResponse, PermissionDto, PermissionCode } from '@/types/onboarding';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';

const MFG_FALLBACK_PERMISSIONS: PermissionDto[] = [
  { code: 'DISTRIBUTOR_REFERRAL', description: 'Refer new distributors and submit financing applications' },
  { code: 'PURCHASE_ORDER_VIEW', description: 'View and track incoming distributor purchase orders' },
  { code: 'INVOICE_CREATE', description: 'Generate and upload invoices for financed orders (Maker)' },
  { code: 'INVOICE_APPROVE', description: 'Authorize invoice drawdown requests and delivery sign-offs (Checker)' },
  { code: 'PAYMENT_VIEW', description: 'Inspect settlement feeds and bank disbursement records' },
  { code: 'VIEW_REPORTS', description: 'Access commercial sales and distributor credit turnover analytics' },
  { code: 'VIEW_AUDIT_LOGS', description: 'Inspect organization audit logs and activity traces' },
  { code: 'USER_MANAGEMENT', description: 'Manage internal sales and finance staff accounts' },
  { code: 'ROLE_MANAGEMENT', description: 'Create and configure custom manufacturer roles' },
];

export default function ManufacturerRolesPage() {
  const toast = useToast();
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<PermissionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);

  // Create Role Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionCode[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rolesData, permsData] = await Promise.all([
        roleManagementApi.getRoles(),
        roleManagementApi.getAvailablePermissions().catch(() => MFG_FALLBACK_PERMISSIONS),
      ]);
      setRoles(rolesData || []);
      setAvailablePermissions(permsData && permsData.length > 0 ? permsData : MFG_FALLBACK_PERMISSIONS);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load manufacturer roles and permissions.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreateModal = () => {
    setRoleName('');
    setSelectedPermissions([]);
    setModalError(null);
    setCreateModalOpen(true);
  };

  const togglePermission = (code: PermissionCode) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  };

  const selectAllPermissions = () => {
    setSelectedPermissions(availablePermissions.map((p) => p.code as PermissionCode));
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleCreateRole = async () => {
    if (!roleName.trim()) {
      setModalError('Role name is required.');
      return;
    }
    if (selectedPermissions.length === 0) {
      setModalError('Please select at least one permission for this role.');
      return;
    }

    setModalError(null);
    setIsSubmitting(true);
    try {
      await roleManagementApi.createRole({
        name: roleName.trim(),
        permissions: selectedPermissions,
      });
      toast.success(`Role "${roleName.trim()}" created successfully with ${selectedPermissions.length} permissions.`);
      setCreateModalOpen(false);
      await loadData();
    } catch (err) {
      setModalError(getErrorMessage(err, 'Failed to create role.'));
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDeleteRole = async (role: RoleResponse) => {
    if (role.isAssigned) {
      toast.error('This role is currently assigned to a user and cannot be deleted.');
      return;
    }

    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return;
    }

    setDeletingId(role.id);
    try {
      await roleManagementApi.deleteRole(role.id);
      toast.success(`Role "${role.name}" deleted.`);
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete role. Only unassigned roles can be deleted.'));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredRoles = roles.filter((r) => {
    const term = search.toLowerCase();
    return (
      !search ||
      r.name.toLowerCase().includes(term) ||
      (r.description || '').toLowerCase().includes(term) ||
      (r.assignedToUserName || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="h-7 w-7 text-[#1F4DA8]" />
            Manufacturer Roles &amp; Permissions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Define custom internal roles and assign permissions for manufacturer sales, accounting, and approval staff.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/manufacturer/users"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            Manage Users
          </Link>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-[#1F4DA8] rounded-xl hover:bg-[#183c85] transition-all shadow-sm hover:shadow active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Create Role
          </button>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search manufacturer roles..."
            className="pl-9 bg-slate-50 border-none text-sm w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-slate-400 mr-1">
            {roles.length} {roles.length === 1 ? 'Role' : 'Roles'} Configured
          </span>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#1F4DA8] mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading manufacturer roles and permissions...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700 shadow-sm">
          <AlertCircle className="h-6 w-6 mx-auto mb-2 text-rose-500" />
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={loadData}
            className="mt-3 px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm space-y-4">
          <Factory className="h-12 w-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-800">No Manufacturer Roles Configured</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create custom roles for your enterprise sales, finance, and logistics teams.
            </p>
          </div>
          {!search && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#1F4DA8] rounded-xl hover:bg-[#183c85] transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create First Role
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRoles.map((role) => {
            const isExpanded = expandedRoleId === role.id;
            const perms = role.permissions || [];

            return (
              <div
                key={role.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all hover:border-slate-300"
              >
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-black text-slate-900">{role.name}</h3>
                      {role.isAssigned ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Assigned to: {role.assignedToUserName || role.assignedToUserEmail || 'User'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Available for Assignment
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500">
                      {role.description || 'No description provided.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        {perms.length} {perms.length === 1 ? 'Permission' : 'Permissions'} Assigned
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    {!role.isAssigned && (
                      <Link
                        href="/manufacturer/users"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1F4DA8] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200/60"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Assign to User
                      </Link>
                    )}

                    <button
                      onClick={() => setExpandedRoleId(isExpanded ? null : role.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" /> Hide Permissions
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" /> View Permissions
                        </>
                      )}
                    </button>

                    {!role.isAssigned && (
                      <button
                        onClick={() => handleDeleteRole(role)}
                        disabled={deletingId === role.id}
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                        title="Delete Role (Unassigned)"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Permissions Panel */}
                {isExpanded && (
                  <div className="bg-slate-50/80 border-t border-slate-100 p-5 space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Granted Manufacturer Permissions
                    </p>
                    {perms.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No permissions assigned to this role.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {perms.map((pCode) => {
                          const pDef = availablePermissions.find((p) => p.code === pCode);
                          return (
                            <div
                              key={pCode}
                              className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-2.5"
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <div className="text-xs font-bold text-slate-800">{pCode.replace(/_/g, ' ')}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                                  {pDef?.description || 'Manufacturer operations permission'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Role Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Manufacturer Role"
        description="Define a custom role for your staff and select operational permissions."
        size="xl"
        footer={
          <>
            <ModalButton variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </ModalButton>
            <ModalButton onClick={handleCreateRole} disabled={isSubmitting}>
              {isSubmitting ? 'Creating Role...' : 'Create Role'}
            </ModalButton>
          </>
        }
      >
        <div className="space-y-6">
          {modalError && (
            <div className="text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
              {modalError}
            </div>
          )}

          <div className="space-y-4">
            <FormField label="Role Name" required hint="e.g. Finance Maker, Regional Sales Approver">
              <TextInput
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Finance Maker"
                className="font-medium"
              />
            </FormField>
          </div>


          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Assign Permissions <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-500">
                  Select permissions granted to this manufacturer role.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllPermissions}
                  className="text-xs font-bold text-[#1F4DA8] hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={clearAllPermissions}
                  className="text-xs font-bold text-slate-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
              {availablePermissions.map((perm) => {
                const code = perm.code as PermissionCode;
                const isSelected = selectedPermissions.includes(code);

                return (
                  <div
                    key={perm.code}
                    onClick={() => togglePermission(code)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      isSelected
                        ? 'bg-blue-50/70 border-[#1F4DA8] text-slate-900 shadow-xs'
                        : 'bg-white border-slate-200/80 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded mt-0.5 flex items-center justify-center border transition-colors ${
                        isSelected ? 'bg-[#1F4DA8] border-[#1F4DA8] text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                    </div>

                    <div className="flex-1">
                      <div className="text-xs font-bold leading-tight text-slate-900">
                        {perm.code.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {perm.description || 'Permission to perform this operation'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-xs font-semibold text-slate-500 pt-1">
              {selectedPermissions.length} of {availablePermissions.length} permissions selected.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

