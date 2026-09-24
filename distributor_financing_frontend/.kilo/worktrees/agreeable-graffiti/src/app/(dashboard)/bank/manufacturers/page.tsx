'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Factory,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  MapPin,
  CheckCircle2,
  XCircle,
  Building,
  CreditCard,
  Building2,
  UserCheck,
  Clock,
} from 'lucide-react';

import { onboardingService } from '@/services/onboarding.service';
import type { ManufacturerResponse } from '@/types/onboarding';
import { AddManufacturerUserModal } from '@/components/manufacturer/AddManufacturerUserModal';
import { ManufacturerDistributorsModal } from '@/components/manufacturer/ManufacturerDistributorsModal';
import { AssignBankAdminModal } from '@/components/manufacturer/AssignBankAdminModal';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';

export default function BankManufacturersPage() {
  const toast = useToast();
  const [manufacturers, setManufacturers] = useState<ManufacturerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewingDistributorsFor, setViewingDistributorsFor] = useState<ManufacturerResponse | null>(null);
  const [assigningAdminFor, setAssigningAdminFor] = useState<ManufacturerResponse | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await onboardingService.getManufacturers();
      setManufacturers(data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load manufacturers.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const filtered = manufacturers.filter((m) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      m.name?.toLowerCase().includes(term) ||
      m.businessPermitNumber?.toLowerCase().includes(term) ||
      m.location?.toLowerCase().includes(term) ||
      m.accountNumber?.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = manufacturers.length;
  const verifiedCount = manufacturers.filter((m) => m.status === 'ACTIVE').length;
  const pendingCount = manufacturers.filter((m) => m.status === 'PENDING').length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Anchor Manufacturers
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#1F4DA8] border border-blue-200 shadow-xs">
              Anchor Directory
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Onboard, monitor, and manage corporate manufacturers whose distributor supply chains are financed by the bank.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#1F4DA8] hover:bg-[#3A6FD8] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} /> Add Manufacturer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <Factory size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Manufacturers</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active &amp; Verified</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{verifiedCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Setup</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{pendingCount}</p>
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

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name, registration number, email, or location..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-700 focus:outline-none focus:border-[#1F4DA8]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
          </select>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Modern Formatted Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Enterprise / Brand</th>
                <th className="px-6 py-4">Registration No.</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Bank ID</th>
                <th className="px-6 py-4">Settlement Account</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4.5"><div className="h-4 bg-slate-100 rounded w-36" /></td>
                    <td className="px-6 py-4.5"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                    <td className="px-6 py-4.5"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                    <td className="px-6 py-4.5"><div className="h-4 bg-slate-100 rounded w-32" /></td>
                    <td className="px-6 py-4.5"><div className="h-4 bg-slate-100 rounded w-28" /></td>
                    <td className="px-6 py-4.5"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                    <td className="px-6 py-4.5 text-right"><div className="h-4 bg-slate-100 rounded w-10 ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-slate-400">
                    <Factory size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">No manufacturers registered</p>
                    <p className="text-xs text-slate-400 mt-1">Click &quot;Add Manufacturer&quot; above to onboard your first anchor.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id || m.name} className="hover:bg-slate-50/70 transition-colors">
                    {/* Enterprise */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 text-[#1F4DA8] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                          {(m.name || 'M').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {m.id ? `${m.id.substring(0, 8)}...` : '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Registration No */}
                    <td className="px-6 py-4.5">
                      <span className="font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                        {m.businessPermitNumber || '—'}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4.5">
                      <span className="inline-flex items-center gap-1.5 text-slate-700">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        {m.location || '—'}
                      </span>
                    </td>

                    {/* Bank ID */}
                    <td className="px-6 py-4.5">
                      <span className="inline-flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                        <Building size={13} className="text-slate-400 shrink-0" />
                        {m.bankId ? m.bankId.substring(0, 8) + '...' : '—'}
                      </span>
                    </td>

                    {/* Settlement Account */}
                    <td className="px-6 py-4.5">
                      <span className="inline-flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                        <CreditCard size={13} className="text-slate-400 shrink-0" />
                        {m.accountNumber || '—'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4.5">
                      {m.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle size={12} /> Disabled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingDistributorsFor(m)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="View Connected Distributors"
                        >
                          <Building2 size={14} />
                        </button>
                        <button
                          onClick={() => setAssigningAdminFor(m)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Assign Bank Relationship Admin"
                        >
                          <UserCheck size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddManufacturerUserModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={loadData}
      />

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
        currentBankAdminId={assigningAdminFor?.bankId}
        onClose={() => setAssigningAdminFor(null)}
        onAssigned={loadData}
      />
    </div>
  );
}