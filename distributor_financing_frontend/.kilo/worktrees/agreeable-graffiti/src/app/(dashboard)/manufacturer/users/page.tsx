'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  Pencil,
  Trash2,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { manufacturerApi, roleManagementApi } from '@/services/onboarding-api.service';
import type { UserResponse, RoleResponse } from '@/types/onboarding';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput, Select } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';

const PHONE_REGEX = /^(?:(07|01)\d{8}|\+254\d{9})$/;
const NATIONAL_ID_REGEX = /^\d{8}$/;

export default function ManufacturerUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Add User Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    employeeId: '',
    roleId: '',
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit User Modal state
  const [editTarget, setEditTarget] = useState<UserResponse | null>(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, rolesData] = await Promise.all([
        manufacturerApi.getManufacturerUsers(),
        roleManagementApi.getRoles().catch(() => []),
      ]);
      setUsers(usersData || []);
      setRoles(rolesData || []);
      if (rolesData && rolesData.length > 0) {
        setForm((prev) => ({ ...prev, roleId: prev.roleId || rolesData[0].id || '' }));
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load manufacturer staff users.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationalId: '',
      employeeId: '',
      roleId: roles.length > 0 ? roles[0].id || '' : '',
    });
    setModalError(null);
    setAddModalOpen(true);
  };

  const handleCreateUser = async () => {
    const fn = form.firstName.trim();
    const ln = form.lastName.trim();
    const em = form.email.trim().toLowerCase();
    const ph = form.phone.trim().replace(/\s+/g, '');
    const nid = form.nationalId.trim().replace(/\D/g, '');
    const emp = form.employeeId.trim();
    const roleId = form.roleId;

    if (!fn || !ln || !em || !ph || !nid || !emp || !roleId) {
      setModalError('Please fill in all mandatory staff profile fields.');
      return;
    }

    if (!PHONE_REGEX.test(ph)) {
      setModalError('Phone number must match format +254XXXXXXXXX or 07XXXXXXXX.');
      return;
    }

    if (!NATIONAL_ID_REGEX.test(nid)) {
      setModalError('National ID Number must be exactly 8 digits.');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      await manufacturerApi.onboardManufacturerUser({
        firstName: fn,
        lastName: ln,
        email: em,
        phoneNumber: ph,
        nationalIdNumber: nid,
        employeeId: emp,
        roleId,
      });

      toast.success(`Staff user "${fn} ${ln}" created successfully.`);
      setAddModalOpen(false);
      await loadData();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to provision staff member.');
      setModalError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (user: UserResponse) => {
    setEditTarget(user);
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phoneNumber || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editTarget || !editTarget.id) return;
    setIsSubmitting(true);
    try {
      await manufacturerApi.updateManufacturerUser(editTarget.id, {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim().toLowerCase(),
        phoneNumber: editForm.phone.trim().replace(/\s+/g, ''),
      });
      toast.success('Staff profile updated successfully.');
      setEditTarget(null);
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update user profile.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: UserResponse) => {
    if (!user.id) return;
    if (!confirm(`Are you sure you want to deactivate ${user.firstName} ${user.lastName}?`)) return;
    setDeletingId(user.id || null);
    try {
      await manufacturerApi.deactivateManufacturerUser(user.id);
      toast.success(`User "${user.firstName} ${user.lastName}" deactivated.`);
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to deactivate user.'));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim().toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.phoneNumber || '').toLowerCase();
    return (
      !search ||
      fullName.includes(term) ||
      email.includes(term) ||
      phone.includes(term) ||
      (u.employeeId || '').toLowerCase().includes(term) ||
      (u.roleName || u.role || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="h-7 w-7 text-[#1F4DA8]" />
            Manufacturer User Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage sales representatives, credit makers, and invoice authorizers for your enterprise.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/manufacturer/roles"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <ShieldCheck className="h-4 w-4 text-[#1F4DA8]" />
            Manage Roles
          </Link>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-[#1F4DA8] rounded-xl hover:bg-[#183c85] transition-all shadow-sm hover:shadow active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Staff User
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name, email, role, or ID..."
            className="pl-9 bg-slate-50 border-none text-sm w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-slate-400 mr-1">
            {users.length} {users.length === 1 ? 'Staff Member' : 'Staff Members'}
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

      {/* Table Content */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#1F4DA8] mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading staff users...</p>
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
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm space-y-3">
          <UserCheck className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Staff Users Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search
              ? 'No staff members match your search criteria.'
              : 'Add your first sales maker, invoice authorizer, or accountant account.'}
          </p>
          {!search && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#1F4DA8] rounded-xl hover:bg-[#183c85] transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add Staff User
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-4 py-3.5">Assigned Role</th>
                  <th className="px-4 py-3.5">Employee ID</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{u.firstName} {u.lastName}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1F4DA8] border border-blue-200/60">
                        {u.roleName || u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      {u.employeeId || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-800 font-medium">{u.phoneNumber}</div>
                      <div className="text-[10px] text-slate-400">ID: {u.nationalIdNumber || '—'}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 text-slate-400 hover:text-[#1F4DA8] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        disabled={deletingId === u.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Deactivate User"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Manufacturer Staff User"
        description="Provision an internal user account and assign an operational role."
        size="lg"
        footer={
          <>
            <ModalButton variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </ModalButton>
            <ModalButton onClick={handleCreateUser} disabled={isSubmitting}>
              {isSubmitting ? 'Creating User...' : 'Create User'}
            </ModalButton>
          </>
        }
      >
        <div className="space-y-4">
          {modalError && (
            <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
              {modalError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <TextInput
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="e.g. David"
              />
            </FormField>

            <FormField label="Last Name" required>
              <TextInput
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="e.g. Mwangi"
              />
            </FormField>

            <FormField label="Corporate Email" required hint="Credentials will be dispatched here">
              <TextInput
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="d.mwangi@eabl.com"
              />
            </FormField>

            <FormField label="Phone Number" required hint="Format: 07XXXXXXXX or +2547XXXXXXXX">
              <TextInput
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+254712345678"
              />
            </FormField>

            <FormField label="National ID" required hint="8-digit identity number">
              <TextInput
                value={form.nationalId}
                onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                placeholder="12345678"
                maxLength={8}
              />
            </FormField>

            <FormField label="Employee Number / ID" required hint="Company staff identifier">
              <TextInput
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                placeholder="EABL-SALES-102"
              />
            </FormField>

            <FormField label="Assigned Role" required className="sm:col-span-2">
              <Select
                value={form.roleId}
                onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              >
                {roles.length === 0 && <option value="">No roles available. Create one first.</option>}
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.permissions?.length || 0} permissions)
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Staff Member"
        description="Update contact information for this user."
        size="md"
        footer={
          <>
            <ModalButton variant="secondary" onClick={() => setEditTarget(null)}>
              Cancel
            </ModalButton>
            <ModalButton onClick={handleSaveEdit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </ModalButton>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="First Name" required>
            <TextInput
              value={editForm.firstName}
              onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
            />
          </FormField>
          <FormField label="Last Name" required>
            <TextInput
              value={editForm.lastName}
              onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
            />
          </FormField>
          <FormField label="Email" required>
            <TextInput
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </FormField>
          <FormField label="Phone Number" required>
            <TextInput
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

