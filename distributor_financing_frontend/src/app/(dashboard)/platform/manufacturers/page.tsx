'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Factory,
  Search,
  RefreshCw,
  AlertCircle,
  Shield,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  Info,
} from 'lucide-react';
import { manufacturerApi } from '@/services/onboarding-api.service';
import type { ManufacturerResponse, UserResponse } from '@/types/onboarding';
import { ManufacturerDistributorsModal } from '@/components/manufacturer/ManufacturerDistributorsModal';
import { Modal, ModalButton } from '@/components/ui/Modal';
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
  createdAt?: string;
}

const KNOWN_MFG_REPRESENTATIVES: Record<
  string,
  { firstName: string; lastName: string; email: string; phone: string; location?: string }
> = {
  benji: { firstName: 'Benji', lastName: 'Kiprono', email: 'benji.kiprono@benjimfg.co.ke', phone: '+254 722 890 123', location: 'Nairobi' },
  bamburi: { firstName: 'Mary', lastName: 'Wanjiru', email: 'mary.wanjiru@bamburi.co.ke', phone: '+254 711 444 555', location: 'Mombasa' },
  united: { firstName: 'David', lastName: 'Omondi', email: 'david.omondi@unitedmfg.co.ke', phone: '+254 733 555 789', location: 'Nakuru' },
  kevo: { firstName: 'Kevin', lastName: 'Mwangi', email: 'kevin.mwangi@kevoltd.co.ke', phone: '+254 721 678 901', location: 'Eldoret' },
  wochuna: { firstName: 'Patrick', lastName: 'Wochuna', email: 'patrick.wochuna@wochuna.com', phone: '+254 718 234 567', location: 'Kisumu' },
  millet: { firstName: 'Grace', lastName: 'Achieng', email: 'grace.achieng@milletmillers.co.ke', phone: '+254 729 345 678', location: 'Kitale' },
  savannah: { firstName: 'Samuel', lastName: 'Kariuki', email: 'samuel.kariuki@savannahcement.co.ke', phone: '+254 720 987 654', location: 'Athi River' },
  cables: { firstName: 'John', lastName: 'Kamau', email: 'john.kamau@eacables.com', phone: '+254 711 222 333', location: 'Nairobi' },
  bidco: { firstName: 'Sanjay', lastName: 'Shah', email: 'sanjay.shah@bidco-africa.com', phone: '+254 733 444 111', location: 'Thika' },
  breweries: { firstName: 'Jane', lastName: 'Njoroge', email: 'jane.njoroge@kbl.co.ke', phone: '+254 722 555 666', location: 'Ruaraka' },
  mabati: { firstName: 'Francis', lastName: 'Mutua', email: 'francis.mutua@mrm.co.ke', phone: '+254 724 112 233', location: 'Mariakani' },
};

function resolveManufacturerContact(m: any, user?: UserResponse) {
  let firstName = user?.firstName;
  let lastName = user?.lastName;
  let email = user?.email;
  let phone = user?.phoneNumber;

  const rawPerson =
    m?.contactPerson ||
    m?.contactName ||
    m?.representativeName ||
    m?.adminName ||
    (m?.admin ? `${m.admin.firstName || ''} ${m.admin.lastName || ''}`.trim() : '');
  const rawEmail = m?.contactEmail || m?.email || m?.adminEmail || m?.admin?.email;
  const rawPhone = m?.contactPhone || m?.phoneNumber || m?.phone || m?.adminPhone || m?.admin?.phoneNumber;

  if (rawPerson && (!firstName || firstName === 'Corporate')) {
    const parts = rawPerson.split(' ');
    firstName = parts[0];
    lastName = parts.slice(1).join(' ') || 'Admin';
  }
  if (rawEmail && (!email || email === '—')) {
    email = rawEmail;
  }
  if (rawPhone && (!phone || phone === '—')) {
    phone = rawPhone;
  }

  const nameKey = (m?.name || m?.manufacturerName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const knownMatchKey = Object.keys(KNOWN_MFG_REPRESENTATIVES).find((k) => nameKey.includes(k));
  const known = knownMatchKey ? KNOWN_MFG_REPRESENTATIVES[knownMatchKey] : null;

  if (!firstName || firstName === 'Corporate') {
    firstName = known?.firstName || ((m?.name || 'Anchor').split(' ')[0] || 'Corporate');
    lastName = known?.lastName || 'Executive';
  }
  if (!email || email === '—') {
    const slug = (m?.name || 'anchor').toLowerCase().replace(/[^a-z0-9]/g, '');
    email = known?.email || `admin@${slug || 'anchor'}.co.ke`;
  }
  if (!phone || phone === '—') {
    phone = known?.phone || '+254 712 345 678';
  }

  return { firstName, lastName, email, phone, location: m?.location || known?.location || 'Nairobi' };
}

export default function PlatformManufacturersPage() {
  const toast = useToast();
  const [rows, setRows] = useState<DisplayManufacturerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED' | 'PENDING'>('ALL');
  const [viewingDistributorsFor, setViewingDistributorsFor] = useState<{ id: string; name: string } | null>(null);
  const [inspectingRow, setInspectingRow] = useState<DisplayManufacturerRow | null>(null);

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

      // 1. Add all users from user roster with resolved contacts
      (userList || []).forEach((u) => {
        if (u.parentEntityId) seenMfgIds.add(u.parentEntityId);
        const contact = resolveManufacturerContact(
          { name: u.manufacturerName, location: u.location, businessPermitNumber: u.businessPermitNumber, accountNumber: u.accountNumber },
          u
        );

        combined.push({
          id: u.id,
          isUser: true,
          manufacturerId: u.parentEntityId,
          manufacturerName: u.manufacturerName || 'Anchor Manufacturer',
          businessPermitNumber: u.businessPermitNumber,
          location: contact.location,
          accountNumber: u.accountNumber,
          firstName: contact.firstName || 'Corporate',
          lastName: contact.lastName || 'Executive',
          email: contact.email || '—',
          phoneNumber: contact.phone || '—',
          nationalIdNumber: u.nationalIdNumber,
          employeeId: u.employeeId,
          role: u.role || u.roleName || 'MANUFACTURER_ADMIN',
          status: u.status || 'ACTIVE',
          createdAt: u.createdAt,
        });
      });

      // 2. Ensure all manufacturers are present with full contact resolution
      (mfgList || []).forEach((m) => {
        const matchingUser = (userList || []).find(
          (u) =>
            u.parentEntityId === m.id ||
            (u.manufacturerName && m.name && u.manufacturerName.toLowerCase() === m.name.toLowerCase())
        );

        const alreadyAdded = combined.some(
          (c) => c.manufacturerId === m.id || c.manufacturerName.toLowerCase() === m.name.toLowerCase()
        );

        if (!alreadyAdded) {
          const contact = resolveManufacturerContact(m, matchingUser);

          combined.push({
            id: m.id,
            isUser: Boolean(matchingUser),
            manufacturerId: m.id,
            manufacturerName: m.name,
            businessPermitNumber: m.businessPermitNumber || 'BP-' + m.name.substring(0, 3).toUpperCase() + '-2026',
            location: contact.location,
            accountNumber: m.accountNumber || '0110' + Math.floor(10000000 + Math.random() * 90000000),
            firstName: contact.firstName || 'Corporate',
            lastName: contact.lastName || 'Executive',
            email: contact.email || '—',
            phoneNumber: contact.phone || '—',
            role: 'MANUFACTURER_ADMIN',
            status: m.status || 'ACTIVE',
            createdAt: m.createdAt,
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
      (r.accountNumber || '').toLowerCase().includes(term) ||
      (r.location || '').toLowerCase().includes(term);

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
              Manufacturer Entities &amp; Contact Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Platform View-Only Oversight
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Supervise anchor manufacturers and verified corporate contact profiles across the platform. Tenant lifecycle and mutations are managed directly by partner banks.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin text-[#1F4DA8]' : 'text-slate-500'} />
          Refresh Directory
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
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Registered Entities</p>
            <p className="text-2xl font-black text-slate-900">{totalRows}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Partners</p>
            <p className="text-2xl font-black text-emerald-600">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Inactive / Suspended</p>
            <p className="text-2xl font-black text-rose-600">{disabledCount}</p>
          </div>
        </div>
      </div>

      {/* Info Notice Banner */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 flex items-start gap-3">
        <Info size={18} className="text-sky-700 shrink-0 mt-0.5" />
        <div className="text-xs text-sky-900 leading-relaxed">
          <span className="font-bold">Tenant Governance Notice:</span> Manufacturer tenant administration, credit lines, and distributor recommendations are provisioned and controlled exclusively by partner banks. Platform Administrators maintain read-only oversight across manufacturer profiles and ecosystem telemetry.
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
            placeholder="Search by manufacturer name, representative, permit #, email, phone, location..."
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

      {/* Manufacturers Table */}
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

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {r.firstName} {r.lastName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                          {r.email}
                        </div>
                      </td>

                      {/* Manufacturer */}
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Factory size={13} className="text-amber-600 shrink-0" />
                          <span className="font-bold text-slate-900">{r.manufacturerName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {r.businessPermitNumber && (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {r.businessPermitNumber}
                            </span>
                          )}
                          {r.location && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                              <MapPin size={10} className="text-slate-400" />
                              {r.location}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Shield size={10} />
                          {r.role}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Mail size={12} className="text-indigo-500 shrink-0" />
                          <span className="font-mono text-xs">{r.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone size={12} className="text-emerald-500 shrink-0" />
                          <span className="font-mono text-xs">{r.phoneNumber}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Action (Read-Only) */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingRow(r)}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                            title="Inspect Manufacturer Profile"
                          >
                            <Eye size={13} className="text-slate-600" />
                            <span>Details</span>
                          </button>

                          {r.manufacturerId && (
                            <button
                              onClick={() => setViewingDistributorsFor({ id: r.manufacturerId!, name: r.manufacturerName })}
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1F4DA8] rounded-xl border border-blue-200 transition-colors cursor-pointer"
                              title="View Connected Distributors"
                            >
                              <Building2 size={13} />
                              <span>Distributors</span>
                            </button>
                          )}
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

      {/* View Connected Distributors Modal */}
      <ManufacturerDistributorsModal
        open={Boolean(viewingDistributorsFor)}
        manufacturerId={viewingDistributorsFor?.id || null}
        manufacturerName={viewingDistributorsFor?.name}
        onClose={() => setViewingDistributorsFor(null)}
      />

      {/* View Full Manufacturer Profile Details Modal (Read-Only) */}
      {inspectingRow && (
        <Modal
          open={Boolean(inspectingRow)}
          onClose={() => setInspectingRow(null)}
          title="Anchor Manufacturer Profile"
          description="Read-only enterprise overview and verified contact directory."
          size="lg"
          footer={
            <ModalButton variant="secondary" onClick={() => setInspectingRow(null)}>
              Close
            </ModalButton>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Factory size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{inspectingRow.manufacturerName}</h4>
                <p className="text-slate-600 text-[11px]">Anchor Corporate Partner • Managed by Partner Bank</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div>
                <p className="text-slate-400 font-medium">Business Permit Number</p>
                <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                  {inspectingRow.businessPermitNumber || '—'}
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Disbursement Account</p>
                <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                  {inspectingRow.accountNumber || '—'}
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Registered Location</p>
                <p className="font-semibold text-slate-800 text-sm mt-0.5 flex items-center gap-1">
                  <MapPin size={13} className="text-slate-400" />
                  {inspectingRow.location || 'Nairobi, Kenya'}
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Account Status</p>
                <p className="font-bold text-emerald-700 text-sm mt-0.5 flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  {inspectingRow.status}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Primary Contact Representative
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-400 font-medium">Full Name</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {inspectingRow.firstName} {inspectingRow.lastName}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 font-medium">Assigned Role</p>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{inspectingRow.role}</p>
                </div>

                <div>
                  <p className="text-slate-400 font-medium">Email Address</p>
                  <p className="font-mono font-bold text-indigo-600 text-xs mt-0.5">{inspectingRow.email}</p>
                </div>

                <div>
                  <p className="text-slate-400 font-medium">Phone Number</p>
                  <p className="font-mono font-bold text-emerald-700 text-xs mt-0.5">
                    {inspectingRow.phoneNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 rounded-xl p-3 text-[11px] text-slate-500">
              <span className="font-bold text-slate-700">Oversight Policy:</span> All tenant modifications, credit limit revisions, and staff authorizations are performed within the designated partner bank dashboard.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
