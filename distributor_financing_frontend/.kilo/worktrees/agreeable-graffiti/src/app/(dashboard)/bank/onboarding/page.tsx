'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Factory,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Building2,
  UserCheck,
  Clock,
  ShieldCheck,
  Pencil,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { onboardingService, type ManufacturerUser } from '@/services/onboarding.service';
import { AddManufacturerUserModal } from '@/components/manufacturer/AddManufacturerUserModal';
import { EditManufacturerUserModal } from '@/components/manufacturer/EditManufacturerUserModal';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';

export default function BankOnboardingPage() {
  const toast = useToast();
  const [users, setUsers] = useState<ManufacturerUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [kycFilter, setKycFilter] = useState('ALL');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManufacturerUser | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await onboardingService.getManufacturerUsers();
      setUsers(data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load manufacturer users.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (user: ManufacturerUser) => {
    if (!user.id) return;
    if (!confirm(`Are you sure you want to deactivate representative "${user.firstName} ${user.lastName}" for ${user.manufacturerName}?`)) {
      return;
    }
    setDeletingId(user.id);
    try {
      await onboardingService.deleteManufacturerUser(user.id);
      toast.success(`User "${user.firstName} ${user.lastName}" deactivated.`);
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to deactivate user.'));
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      u.manufacturerName?.toLowerCase().includes(term) ||
      u.firstName?.toLowerCase().includes(term) ||
      u.lastName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phoneNumber?.toLowerCase().includes(term) ||
      u.accountNumber?.toLowerCase().includes(term);

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesKyc = kycFilter === 'ALL' || u.kycStatus === kycFilter || u.status === kycFilter;

    return matchesSearch && matchesRole && matchesKyc;
  });

  const totalCount = users.length;
  const activeCount = users.filter((u) => u.status === 'ACTIVE' || u.kycStatus === 'VERIFIED').length;
  const pendingCount = users.filter((u) => u.status === 'PENDING' || u.kycStatus === 'PENDING').length;
  const makersCount = users.filter((u) => u.role?.includes('MAKER')).length;
  const checkersCount = users.filter((u) => u.role?.includes('CHECKER')).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Manufacturer Onboarding &amp; KYC
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Partner Network
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Onboard anchor manufacturers, manage maker/checker representatives, and verify settlement accounts.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#1F4DA8] hover:bg-[#3A6FD8] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} /> Onboard Manufacturer
        </button>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Representatives</p>
            <p className="text-2xl font-black text-slate-900">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active / Verified</p>
            <p className="text-2xl font-black text-emerald-600">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Review</p>
            <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Makers / Checkers</p>
            <p className="text-2xl font-black text-purple-700">{makersCount} / {checkersCount}</p>
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search manufacturer, representative, email, phone..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="MANUFACTURER_MAKER">Maker</option>
              <option value="MANUFACTURER_CHECKER">Checker</option>
            </select>
          </div>

          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All KYC Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        <table className="w-full text-sm min-w-[850px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Manufacturer &amp; Company
              </th>
              <th className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Representative
              </th>
              <th className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Contact &amp; Account
              </th>
              <th className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                KYC &amp; Status
              </th>
              <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-slate-100 rounded-full animate-pulse max-w-[140px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Factory size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">No manufacturers found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {search || roleFilter !== 'ALL'
                          ? 'Try adjusting your search or filters.'
                          : 'Onboard your first anchor manufacturer to get started.'}
                      </p>
                    </div>
                    {!search && (
                      <button
                        onClick={() => setAddModalOpen(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1F4DA8] hover:bg-[#3A6FD8] rounded-xl px-4 py-2 mt-2 shadow-sm"
                      >
                        <Plus size={14} /> Onboard Manufacturer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const isMaker = u.role?.includes('MAKER');
                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0 border border-indigo-100">
                          {u.manufacturerName?.substring(0, 2).toUpperCase() || 'MF'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{u.manufacturerName}</p>
                          <p className="text-xs text-slate-500 font-mono">
                            {u.businessPermitNumber ? `Permit: ${u.businessPermitNumber}` : u.location || 'Anchor Partner'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800">
                        {u.firstName} {u.lastName}
                      </p>
                      {u.employeeId && (
                        <p className="text-xs text-slate-400 font-mono">ID: {u.employeeId}</p>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-xs text-slate-700">{u.email}</p>
                      <p className="text-xs text-slate-500">{u.phoneNumber}</p>
                      {u.accountNumber && (
                        <p className="text-[11px] text-slate-400 font-mono">A/C: {u.accountNumber}</p>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          isMaker
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {isMaker ? 'Maker' : 'Checker'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          u.kycStatus === 'VERIFIED' || u.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : u.kycStatus === 'REJECTED' || u.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {u.kycStatus || u.status || 'Active'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-1.5 text-slate-500 hover:text-[#1F4DA8] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Representative"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={deletingId === u.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Deactivate Representative"
                        >
                          <Trash2 size={15} />
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

      {/* Add Manufacturer User Modal */}
      <AddManufacturerUserModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={loadData}
      />

      {/* Edit Manufacturer User Modal */}
      <EditManufacturerUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUpdated={loadData}
      />
    </div>
  );
}