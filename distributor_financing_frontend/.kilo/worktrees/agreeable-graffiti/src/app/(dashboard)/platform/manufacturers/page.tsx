'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Factory,
  Search,
  RefreshCw,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Shield,
  UserCheck,
  Building2,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { manufacturerApi } from '@/services/onboarding-api.service';
import type { ManufacturerResponse, UserResponse } from '@/types/onboarding';
import { ManufacturerDistributorsModal } from '@/components/manufacturer/ManufacturerDistributorsModal';
import { AssignBankAdminModal } from '@/components/manufacturer/AssignBankAdminModal';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import { Select, TextInput } from '@/components/ui/FormField';

interface DisplayManufacturerRow {
  id: string;
  isUser: boolean;
  manufacturerId?: string;
  manufacturerName: string;
  businessPermitNumber?: string;
  location?: string;
  accountNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber?: string;
  employeeId?: string;
  role: string;
  status: string;
}

export default function PlatformManufacturersPage() {
  const toast = useToast();
  const [rows, setRows] = useState<DisplayManufacturerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED' | 'PENDING'>('ALL');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [viewingDistributorsFor, setViewingDistributorsFor] = useState<{ id: string; name: string } | null>(null);
  const [assigningAdminFor, setAssigningAdminFor] = useState<{ id: string; name: string } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [mfgList, userList] = await Promise.all([
        manufacturerApi.getManufacturers().catch(() => [] as ManufacturerResponse[]),
        manufacturerApi.getManufacturerUsers().catch(() => [] as UserResponse[]),
      ]);

      const combined: DisplayManufacturerRow[] = [];
      const seenMfgIds = new Set<string>();

      // 1. Add all users from user roster
      (userList || []).forEach((u) => {
        if (u.parentEntityId) seenMfgIds.add(u.parentEntityId);
        combined.push({
          id: u.id || `user-${Math.random()}`,
          isUser: true,
          manufacturerId: u.parentEntityId,
          manufacturerName: u.manufacturerName || 'Anchor Manufacturer',
          businessPermitNumber: u.businessPermitNumber,
          location: u.location,
          accountNumber: u.accountNumber,
          firstName: u.firstName || 'Corporate',
          lastName: u.lastName || 'Admin',
          email: u.email || '—',
          phoneNumber: u.phoneNumber || '—',
          nationalIdNumber: u.nationalIdNumber,
          employeeId: u.employeeId,
          role: u.role || u.roleName || 'MANUFACTURER_ADMIN',
          status: u.status || 'ACTIVE',
        });
      });

      // 2. Ensure all manufacturers are present (even if deactivated or no user returned)
      (mfgList || []).forEach((m) => {
        const hasMatchingUser = combined.some(
          (c) => c.manufacturerId === m.id || c.manufacturerName.toLowerCase() === (m.name || '').toLowerCase()
        );
        if (!hasMatchingUser) {
          combined.push({
            id: m.id || `mfg-${Math.random()}`,
            isUser: false,
            manufacturerId: m.id,
            manufacturerName: m.name || 'Anchor Manufacturer',
            businessPermitNumber: m.businessPermitNumber,
            location: m.location,
            accountNumber: m.accountNumber,
            firstName: 'Corporate',
            lastName: 'Representative',
            email: '—',
            phoneNumber: '—',
            role: 'MANUFACTURER_ADMIN',
            status: m.status || 'DISABLED',
          });
        }
      });

      setRows(combined);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load manufacturer entities and staff.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleStatus = async (item: DisplayManufacturerRow) => {
    const isCurrentlyActive = item.status === 'ACTIVE' || item.status === 'Active';
    setTogglingId(item.id);
    try {
      if (isCurrentlyActive) {
        // Soft deactivation - marks status DISABLED without deleting database record
        await manufacturerApi.deactivateManufacturerAdmin(item.id);
        toast.success(`Manufacturer "${item.manufacturerName}" deactivated.`);
      } else {
        // Reactivate
        await manufacturerApi.activateManufacturerAdmin(item.id);
        toast.success(`Manufacturer "${item.manufacturerName}" activated.`);
      }
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, `Failed to ${isCurrentlyActive ? 'deactivate' : 'activate'} manufacturer.`));
    } finally {
      setTogglingId(null);
    }
  };

  const filteredRows = rows.filter((r) => {
    const term = search.toLowerCase();
    const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
    const matchesSearch =
      !search ||
      fullName.includes(term) ||
      r.email.toLowerCase().includes(term) ||
      r.phoneNumber.toLowerCase().includes(term) ||
      r.manufacturerName.toLowerCase().includes(term) ||
      (r.businessPermitNumber || '').toLowerCase().includes(term) ||
      (r.accountNumber || '').toLowerCase().includes(term);

    const isRowActive = r.status === 'ACTIVE' || r.status === 'Active';
    const isRowPending = r.status === 'PENDING' || r.status === 'Pending';
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && isRowActive) ||
      (statusFilter === 'DISABLED' && !isRowActive && !isRowPending) ||
      (statusFilter === 'PENDING' && isRowPending);

    return matchesSearch && matchesStatus;
  });

  const totalMfgs = new Set(rows.map((r) => r.manufacturerName)).size;
  const totalRows = rows.length;
  const activeCount = rows.filter((r) => r.status === 'ACTIVE' || r.status === 'Active').length;
  const disabledCount = totalRows - activeCount;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Manufacturer Entities &amp; Users
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Anchor Partners
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Oversee anchor manufacturers and manage corporate administrator accounts across the ecosystem.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin text-[#1F4DA8]' : 'text-slate-500'} />
          Refresh List
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Factory size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Anchor Manufacturers</p>
            <p className="text-2xl font-black text-slate-900">{totalMfgs}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Registered Entries</p>
            <p className="text-2xl font-black text-slate-900">{totalRows}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Accounts</p>
            <p className="text-2xl font-black text-emerald-600">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Disabled / Inactive</p>
            <p className="text-2xl font-black text-rose-600">{disabledCount}</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-rose-800 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="text-xs font-bold text-rose-700 hover:underline px-3 py-1 bg-white border border-rose-200 rounded-lg"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name, permit #, user name, email, phone..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full sm:w-44 text-xs font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DISABLED">Disabled / Inactive</option>
            <option value="PENDING">Pending Setup</option>
          </Select>
        </div>
      </div>

      {/* Users & Manufacturers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">User / Representative</th>
                <th className="px-4 py-3.5">Anchor Manufacturer</th>
                <th className="px-4 py-3.5">Assigned Role</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5">Account Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </td>
                  </tr>
                ))
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Factory size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No manufacturer entries found</p>
                    <p className="text-xs text-slate-400 mt-1">No entries match the search and filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => {
                  const isActive = r.status === 'ACTIVE' || r.status === 'Active';
                  const isToggling = togglingId === r.id;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & ID */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {r.firstName} {r.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {r.nationalIdNumber ? `ID: ${r.nationalIdNumber}` : r.employeeId ? `Emp: ${r.employeeId}` : ''}
                        </div>
                      </td>

                      {/* Manufacturer */}
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Factory size={13} className="text-amber-600 shrink-0" />
                          <span>{r.manufacturerName}</span>
                        </div>
                        {r.businessPermitNumber && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            Permit: {r.businessPermitNumber}
                          </div>
                        )}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Shield size={10} />
                          {r.role}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Mail size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate">{r.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone size={12} className="text-slate-400 shrink-0" />
                          <span>{r.phoneNumber}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      {/* Action Toggle */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.manufacturerId && (
                            <>
                              <button
                                onClick={() => setViewingDistributorsFor({ id: r.manufacturerId!, name: r.manufacturerName })}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="View Connected Distributors"
                              >
                                <Building2 size={15} />
                              </button>
                              <button
                                onClick={() => setAssigningAdminFor({ id: r.manufacturerId!, name: r.manufacturerName })}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Assign Bank Administrator"
                              >
                                <UserCheck size={15} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleToggleStatus(r)}
                            disabled={isToggling}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                              isActive
                                ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                            }`}
                            title={isActive ? 'Deactivate Account' : 'Activate Account'}
                          >
                            {isToggling ? (
                              <RefreshCw size={13} className="animate-spin" />
                            ) : isActive ? (
                              <>
                                <ToggleRight size={15} /> Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={15} /> Activate
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ManufacturerDistributorsModal
        open={Boolean(viewingDistributorsFor)}
        manufacturerId={viewingDistributorsFor?.id || null}
        manufacturerName={viewingDistributorsFor?.name}
        onClose={() => setViewingDistributorsFor(null)}
      />

      <AssignBankAdminModal
        open={Boolean(assigningAdminFor)}
        manufacturerId={assigningAdminFor?.id || null}
        manufacturerName={assigningAdminFor?.name}
        onClose={() => setAssigningAdminFor(null)}
        onAssigned={loadData}
      />
    </div>
  );
}
