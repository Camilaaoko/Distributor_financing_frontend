'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ShieldCheck,
  Search,
  RefreshCw,
  AlertCircle,
  Lock,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  UserCheck,
} from 'lucide-react';
import { roleManagementApi } from '@/services/onboarding-api.service';
import type { RoleResponse, TenantType } from '@/types/onboarding';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';

const STAKEHOLDER_TABS: { label: string; value: 'ALL' | TenantType }[] = [
  { label: 'All Roles', value: 'ALL' },
  { label: 'Platform Admins', value: 'PLATFORM' },
  { label: 'Bank Operations', value: 'BANK' },
  { label: 'Manufacturer', value: 'MANUFACTURER' },
  { label: 'Distributor / Dealer', value: 'DISTRIBUTOR' },
];

export default function PlatformRolesPage() {
  const toast = useToast();
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'ALL' | TenantType>('ALL');
  const [search, setSearch] = useState('');
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await roleManagementApi.getAllRolesAcrossAllEntities();
      setRoles(data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load roles across entities.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleStatus = async (role: RoleResponse) => {
    if (!role.id) return;
    const isCurrentlyActive = role.active !== false && role.status !== 'INACTIVE' && role.status !== 'DISABLED';
    setTogglingId(role.id);
    try {
      if (isCurrentlyActive) {
        await roleManagementApi.deactivateRole(role.id);
        toast.success(`Role "${role.name || role.roleName || 'Role'}" deactivated.`);
      } else {
        await roleManagementApi.activateRole(role.id);
        toast.success(`Role "${role.name || role.roleName || 'Role'}" activated.`);
      }
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, `Failed to ${isCurrentlyActive ? 'deactivate' : 'activate'} role.`));
    } finally {
      setTogglingId(null);
    }
  };

  const filteredRoles = roles.filter((r) => {
    const roleTenant = (r.tenantType || 'PLATFORM').toUpperCase();
    const matchesTab = activeTab === 'ALL' || roleTenant === activeTab;
    const term = search.toLowerCase();
    const roleName = r.name || r.roleName || '';
    const matchesSearch =
      !search ||
      roleName.toLowerCase().includes(term) ||
      (r.assignedToUserName || '').toLowerCase().includes(term) ||
      (r.assignedToUserEmail || '').toLowerCase().includes(term);

    return matchesTab && matchesSearch;
  });

  const totalRoles = roles.length;
  const activeRolesCount = roles.filter((r) => r.active !== false && r.status !== 'INACTIVE' && r.status !== 'DISABLED').length;
  const assignedRolesCount = roles.filter((r) => r.isAssigned || r.assignedToUserId).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Roles &amp; Access Control Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              System-wide View
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            View all custom and system roles across all tenant entities and manage their activation status.
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Entity Roles</p>
            <p className="text-2xl font-black text-slate-900">{totalRoles}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Roles</p>
            <p className="text-2xl font-black text-emerald-600">{activeRolesCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Assigned to Users</p>
            <p className="text-2xl font-black text-purple-700">{assignedRolesCount}</p>
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

      {/* Stakeholder Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {STAKEHOLDER_TABS.map((tab) => {
            const active = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#1F4DA8] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search role or assigned user..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8]"
            />
          </div>
        </div>
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs animate-pulse space-y-3">
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
              <div className="h-8 bg-slate-100 rounded-xl mt-4" />
            </div>
          ))
        ) : filteredRoles.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200">
            <Shield size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No roles found</p>
            <p className="text-xs text-slate-400 mt-1">No roles matching your filter criteria are currently registered.</p>
          </div>
        ) : (
          filteredRoles.map((r) => {
            const isExpanded = expandedRoleId === r.id;
            const permsCount = r.permissions?.length ?? 0;
            const tenant = (r.tenantType || 'PLATFORM').toUpperCase();
            const isActive = r.active !== false && r.status !== 'INACTIVE' && r.status !== 'DISABLED';
            const isToggling = togglingId === r.id;

            const stakeholderColor =
              tenant === 'BANK'
                ? 'bg-blue-50 text-[#1F4DA8] border-blue-200'
                : tenant === 'PLATFORM'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : tenant === 'MANUFACTURER'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200';

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stakeholderColor}`}>
                          {tenant}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-1.5 leading-snug">{r.name || r.roleName}</h3>
                    </div>

                    {/* Status Toggle Button */}
                    <button
                      onClick={() => handleToggleStatus(r)}
                      disabled={isToggling}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                        isActive
                          ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                      }`}
                      title={isActive ? 'Deactivate Role' : 'Activate Role'}
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

                  {/* Assigned User Info */}
                  {r.assignedToUserName ? (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-600 flex items-center gap-2">
                      <UserCheck size={14} className="text-[#1F4DA8] shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-slate-800">{r.assignedToUserName}</span>
                        {r.assignedToUserEmail && (
                          <span className="text-slate-400 block text-[11px] truncate">{r.assignedToUserEmail}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">Unassigned</p>
                  )}
                </div>

                {/* Permissions Expand Toggle */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => setExpandedRoleId(isExpanded ? null : (r.id || null))}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-[#1F4DA8] transition-colors py-1 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#1F4DA8]" />
                      <span>{permsCount} Granted Permissions</span>
                    </span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isExpanded && (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pt-2 border-t border-slate-100 text-left">
                      {r.permissions && r.permissions.length > 0 ? (
                        r.permissions.map((code) => (
                          <div
                            key={code}
                            className="text-[11px] bg-slate-50 border border-slate-200/60 rounded-lg px-2.5 py-1.5 flex items-center justify-between"
                          >
                            <span className="font-medium text-slate-800">{code.replace(/_/g, ' ')}</span>
                            <span className="font-mono text-[9px] text-slate-400">{code}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 py-1">No permissions assigned.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}