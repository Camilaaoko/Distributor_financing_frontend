'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Building,
  Landmark,
  Search,
  RefreshCw,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Table as TableIcon,
  ChevronRight,
  MapPin,
  Mail,
  Phone,
  CreditCard,
} from 'lucide-react';
import { platformService } from '@/services/platform.service';
import { bankOnboardingApi, bankUserApi } from '@/services/onboarding-api.service';
import type { BankResponse, UserResponse } from '@/types/onboarding';
import { TextInput, Select } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';

interface EnhancedBankUser extends UserResponse {
  active?: boolean;
  bankName: string;
  bankCode: string;
  branchName: string;
  branchCode: string;
}

export default function PlatformBankUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<EnhancedBankUser[]>([]);
  const [banks, setBanks] = useState<BankResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<string>('ALL');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'PENDING'>('ALL');
  const [viewMode, setViewMode] = useState<'grouped' | 'table'>('table');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Load all onboarded banks
      const banksData = await platformService.listBanks();
      const loadedBanks = Array.isArray(banksData) ? banksData : [];
      setBanks(loadedBanks);

      // 2. Load all bank users
      let rawUsers: UserResponse[] = [];
      try {
        rawUsers = await bankUserApi.getBankUsers();
      } catch {
        // Fallback: load users per bank if global endpoint is unavailable
        const userPromises = loadedBanks.map((b) =>
          bankOnboardingApi.getBankUsersByBankId(b.id).catch(() => [])
        );
        const results = await Promise.all(userPromises);
        rawUsers = results.flat();
      }

      // 3. Enrich users with bank & branch classification metadata
      const enrichedUsers: EnhancedBankUser[] = rawUsers.map((u) => {
        // Find matching bank by parentEntityId, branchCode, or bankId
        const matchingBank = loadedBanks.find(
          (b) =>
            b.id === u.parentEntityId ||
            (u.branchCode && b.branchCode === u.branchCode) ||
            (u.branchCode && b.bankCode === u.branchCode)
        );

        return {
          ...u,
          bankName: matchingBank?.name || (u.parentEntityId ? `Bank #${u.parentEntityId}` : 'Commercial Partner Bank'),
          bankCode: matchingBank?.bankCode || u.branchCode || 'BANK',
          branchName: matchingBank?.branch || matchingBank?.branchCode || 'Main Branch',
          branchCode: matchingBank?.branchCode || u.branchCode || '001',
        };
      });

      setUsers(enrichedUsers);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load bank users from remote server.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Extract unique branches based on selected bank
  const availableBranches = useMemo(() => {
    if (selectedBankId === 'ALL') {
      const branches = new Set<string>();
      users.forEach((u) => {
        if (u.branchName) branches.add(u.branchName);
      });
      return Array.from(branches);
    }
    const bankUsers = users.filter((u) => u.parentEntityId === selectedBankId || u.bankName === selectedBankId);
    const branches = new Set<string>();
    bankUsers.forEach((u) => {
      if (u.branchName) branches.add(u.branchName);
    });
    return Array.from(branches);
  }, [users, selectedBankId]);

  // Toggle user activation/deactivation
  const handleToggleStatus = async (user: EnhancedBankUser) => {
    const isCurrentlyActive = user.status === 'ACTIVE' || user.active === true;
    const newStatus = isCurrentlyActive ? 'SUSPENDED' : 'ACTIVE';
    setTogglingId(user.id);
    try {
      if (isCurrentlyActive) {
        await bankOnboardingApi.deactivateBankUser(user.id);
        toast.success(`${user.firstName} ${user.lastName} has been deactivated.`);
      } else {
        await bankOnboardingApi.activateBankUser(user.id);
        toast.success(`${user.firstName} ${user.lastName} has been activated.`);
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: newStatus as any, active: !isCurrentlyActive } : u
        )
      );
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update user status.'));
    } finally {
      setTogglingId(null);
    }
  };

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phoneNumber || '').toLowerCase().includes(q) ||
        (u.nationalIdNumber || '').toLowerCase().includes(q) ||
        (u.employeeId || '').toLowerCase().includes(q) ||
        u.bankName.toLowerCase().includes(q) ||
        u.branchName.toLowerCase().includes(q);

      const matchesBank =
        selectedBankId === 'ALL' ||
        u.parentEntityId === selectedBankId ||
        u.bankName === selectedBankId;

      const matchesBranch = selectedBranch === 'ALL' || u.branchName === selectedBranch;

      const matchesRole =
        roleFilter === 'ALL' ||
        (u.role || '').toUpperCase() === roleFilter.toUpperCase();

      const userStatusUpper = (u.status || (u.active ? 'ACTIVE' : 'SUSPENDED')).toUpperCase();
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && (userStatusUpper === 'ACTIVE' || u.active === true)) ||
        (statusFilter === 'SUSPENDED' && (userStatusUpper === 'SUSPENDED' || userStatusUpper === 'DISABLED' || u.active === false)) ||
        (statusFilter === 'PENDING' && userStatusUpper === 'PENDING');

      return matchesSearch && matchesBank && matchesBranch && matchesRole && matchesStatus;
    });
  }, [users, search, selectedBankId, selectedBranch, roleFilter, statusFilter]);

  // Grouping by Bank and Branch
  const groupedByBank = useMemo(() => {
    const map = new Map<string, { bankName: string; bankCode: string; branches: Map<string, EnhancedBankUser[]> }>();

    filteredUsers.forEach((u) => {
      if (!map.has(u.bankName)) {
        map.set(u.bankName, { bankName: u.bankName, bankCode: u.bankCode, branches: new Map() });
      }
      const bankEntry = map.get(u.bankName)!;
      if (!bankEntry.branches.has(u.branchName)) {
        bankEntry.branches.set(u.branchName, []);
      }
      bankEntry.branches.get(u.branchName)!.push(u);
    });

    return map;
  }, [filteredUsers]);

  // KPI Metrics
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status === 'ACTIVE' || u.active === true).length;
  const suspendedUsersCount = users.filter((u) => u.status === 'SUSPENDED' || u.status === 'DISABLED' || u.active === false).length;
  const totalBanksRepresented = new Set(users.map((u) => u.bankName)).size;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <UserCheck className="h-7 w-7 text-[#1F4DA8]" />
              Bank Users Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#1F4DA8] border border-blue-200">
              Classified by Bank &amp; Branch
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Complete registry of all operational staff, makers, checkers, and officers onboarded under partner banks and their branches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin text-[#1F4DA8]' : 'text-slate-500'} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Bank Users</p>
            <p className="text-2xl font-black text-slate-900">{totalUsersCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Users</p>
            <p className="text-2xl font-black text-emerald-600">{activeUsersCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Suspended / Inactive</p>
            <p className="text-2xl font-black text-amber-600">{suspendedUsersCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Landmark size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Partner Banks</p>
            <p className="text-2xl font-black text-indigo-600">{totalBanksRepresented}</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-rose-500" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="text-xs font-bold px-3 py-1 bg-white border border-rose-200 rounded-lg text-rose-700 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Classification Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name, email, phone, ID, or employee number..."
              className="pl-9 text-xs w-full"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 w-full sm:w-auto justify-center">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#1F4DA8] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon size={14} />
              <span>Table View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grouped')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grouped' ? 'bg-white text-[#1F4DA8] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers size={14} />
              <span>Bank &amp; Branch Groups</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Bank Classification Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select Bank
            </label>
            <Select
              value={selectedBankId}
              onChange={(e) => {
                setSelectedBankId(e.target.value);
                setSelectedBranch('ALL');
              }}
              className="text-xs font-semibold w-full"
            >
              <option value="ALL">All Partner Banks ({banks.length})</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.bankCode})
                </option>
              ))}
            </Select>
          </div>

          {/* Branch Classification Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select Branch
            </label>
            <Select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-xs font-semibold w-full"
            >
              <option value="ALL">All Branches ({availableBranches.length})</option>
              {availableBranches.map((br) => (
                <option key={br} value={br}>
                  {br}
                </option>
              ))}
            </Select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Role Scope
            </label>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs font-semibold w-full"
            >
              <option value="ALL">All Role Types</option>
              <option value="BANK_MAKER">Bank Maker</option>
              <option value="BANK_CHECKER">Bank Checker</option>
              <option value="BANK_ADMIN">Bank Admin</option>
              <option value="BANK_USER">Bank Staff User</option>
              <option value="LOAN_OFFICER">Loan Officer</option>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Status Filter
            </label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs font-semibold w-full"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Users</option>
              <option value="SUSPENDED">Suspended Users</option>
              <option value="PENDING">Pending Setup</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grouped */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs">
          <RefreshCw className="h-7 w-7 animate-spin mx-auto text-[#1F4DA8] mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading bank users and branch mappings...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs space-y-3">
          <UserCheck className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Bank Users Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || selectedBankId !== 'ALL' || selectedBranch !== 'ALL' || roleFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'No users match your selected bank, branch, and role filters.'
              : 'Bank staff accounts will appear here once onboarded by Bank Administrators.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Bank User</th>
                  <th className="px-5 py-4">Bank &amp; Branch Classification</th>
                  <th className="px-4 py-4">Role / Scope</th>
                  <th className="px-4 py-4">Contact Info</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const isActive = user.status === 'ACTIVE' || user.active === true;
                  const isToggling = togglingId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* User Avatar + Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1F4DA8] font-bold flex items-center justify-center text-xs shrink-0">
                            {user.firstName?.charAt(0)}
                            {user.lastName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Bank & Branch Classification */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                            <Landmark size={13} className="text-[#1F4DA8] shrink-0" />
                            <span>{user.bankName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                            <MapPin size={11} className="text-slate-400 shrink-0" />
                            <span>{user.branchName} ({user.branchCode})</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <ShieldCheck size={11} className="mr-1" />
                          {user.role || 'BANK_USER'}
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td className="px-4 py-4 text-[11px] text-slate-600 space-y-0.5">
                        <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                          <Mail size={11} className="text-slate-400 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.phoneNumber && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Phone size={11} className="text-slate-400 shrink-0" />
                            <span>{user.phoneNumber}</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 ${
                            isActive
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {isToggling ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : isActive ? (
                            <ToggleRight size={14} className="text-rose-600" />
                          ) : (
                            <ToggleLeft size={14} className="text-emerald-600" />
                          )}
                          <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GROUPED BY BANK & BRANCH VIEW */
        <div className="space-y-6">
          {Array.from(groupedByBank.entries()).map(([bankName, bankGroup]) => (
            <div
              key={bankName}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
            >
              {/* Bank Header Card */}
              <div className="bg-slate-50/90 border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-100 text-[#1F4DA8] flex items-center justify-center font-bold">
                    <Landmark size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{bankName}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Bank Code: {bankGroup.bankCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 text-[#1F4DA8]">
                    {Array.from(bankGroup.branches.values()).reduce((sum, list) => sum + list.length, 0)} Total Users
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-600">
                    {bankGroup.branches.size} Branches
                  </span>
                </div>
              </div>

              {/* Branch Sub-sections */}
              <div className="p-5 space-y-5">
                {Array.from(bankGroup.branches.entries()).map(([branchName, branchUsers]) => (
                  <div key={branchName} className="border border-slate-100 rounded-xl p-4 bg-slate-50/40">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#1F4DA8]" />
                        <span className="font-bold text-xs text-slate-800">{branchName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({branchUsers[0]?.branchCode || '001'})
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {branchUsers.length} {branchUsers.length === 1 ? 'User' : 'Users'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {branchUsers.map((user) => {
                        const isActive = user.status === 'ACTIVE' || user.active === true;
                        const isToggling = togglingId === user.id;

                        return (
                          <div
                            key={user.id}
                            className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-all space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-bold text-slate-900 text-xs">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                                  {user.email}
                                </p>
                              </div>
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isActive
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {isActive ? 'Active' : 'Suspended'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] border-t border-slate-100 pt-2">
                              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                {user.role || 'BANK_USER'}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(user)}
                                disabled={isToggling}
                                className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                                  isActive
                                    ? 'text-rose-600 hover:bg-rose-50'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                {isToggling ? '...' : isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

