'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Lock, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions, type OrganizationType } from '@/hooks/usePermissions';

interface RoutePermissionRequirement {
  routePrefix: string;
  requiredOrg?: OrganizationType;
  requiredPermissions?: string[];
  anyPermission?: string[];
  adminOnly?: boolean;
}

const ROUTE_REQUIREMENTS: RoutePermissionRequirement[] = [
  // Distributor Specific Routes
  { routePrefix: '/dealer/users', requiredOrg: 'DISTRIBUTOR', anyPermission: ['MANAGE_DISTRIBUTOR_USERS', 'MANAGE_USERS'], adminOnly: true },
  { routePrefix: '/dealer/roles', requiredOrg: 'DISTRIBUTOR', anyPermission: ['MANAGE_ROLES', 'MANAGE_DISTRIBUTOR_USERS'], adminOnly: true },
  { routePrefix: '/dealer/audit-trail', requiredOrg: 'DISTRIBUTOR', anyPermission: ['VIEW_AUDIT_TRAIL', 'MANAGE_DISTRIBUTOR_USERS'], adminOnly: true },

  // Bank Specific Routes
  { routePrefix: '/bank/branches', requiredOrg: 'BANK', anyPermission: ['MANAGE_BRANCHES', 'MANAGE_BANK_USERS'], adminOnly: true },
  { routePrefix: '/bank/users', requiredOrg: 'BANK', anyPermission: ['MANAGE_BANK_USERS', 'MANAGE_USERS'], adminOnly: true },
  { routePrefix: '/bank/roles', requiredOrg: 'BANK', anyPermission: ['MANAGE_ROLES', 'MANAGE_BANK_USERS'], adminOnly: true },
  { routePrefix: '/bank/audit-trail', requiredOrg: 'BANK', anyPermission: ['VIEW_AUDIT_TRAIL', 'MANAGE_BANK_USERS'], adminOnly: true },

  // Manufacturer Specific Routes
  { routePrefix: '/manufacturer/users', requiredOrg: 'MANUFACTURER', anyPermission: ['MANAGE_MANUFACTURER_USERS', 'MANAGE_USERS'], adminOnly: true },
  { routePrefix: '/manufacturer/roles', requiredOrg: 'MANUFACTURER', anyPermission: ['MANAGE_ROLES', 'MANAGE_MANUFACTURER_USERS'], adminOnly: true },
  { routePrefix: '/manufacturer/audit-trail', requiredOrg: 'MANUFACTURER', anyPermission: ['VIEW_AUDIT_TRAIL', 'MANAGE_MANUFACTURER_USERS'], adminOnly: true },

  // General Organization-Level Prefixes
  { routePrefix: '/dealer', requiredOrg: 'DISTRIBUTOR' },
  { routePrefix: '/bank', requiredOrg: 'BANK' },
  { routePrefix: '/manufacturer', requiredOrg: 'MANUFACTURER' },
  { routePrefix: '/platform', requiredOrg: 'PLATFORM' },
];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { organization, hasPermission, isPlatformAdmin, roleName, appRole, isAdmin } = usePermissions();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Loading Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  // Super Admin can access all portals
  if (isPlatformAdmin) {
    return <>{children}</>;
  }

  // Find most specific route requirement
  const matchedReq = ROUTE_REQUIREMENTS.find((req) => pathname.startsWith(req.routePrefix));

  if (matchedReq) {
    // 1. Organization Check
    if (matchedReq.requiredOrg && matchedReq.requiredOrg !== organization) {
      const homeRoute =
        organization === 'DISTRIBUTOR'
          ? '/dealer'
          : organization === 'BANK'
          ? '/bank'
          : organization === 'MANUFACTURER'
          ? '/manufacturer'
          : '/platform';

      return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 mx-auto flex items-center justify-center shadow-2xs">
              <ShieldAlert size={28} />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">403 — Access Forbidden</h2>
              <p className="text-xs text-slate-500">
                Your authenticated account (<strong className="text-slate-800 font-semibold">{appRole || roleName}</strong>) belongs to the <strong className="text-slate-800">{organization}</strong> portal and is not authorized to access <strong className="font-mono text-slate-700">{pathname}</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Authenticated User:</span>
                <span className="font-bold text-slate-900">{user.username || user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned AppRole:</span>
                <span className="font-bold text-indigo-700">{appRole || roleName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Organization:</span>
                <span className="font-bold text-slate-800">{organization}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => router.push(homeRoute)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1F4DA8] hover:bg-[#1A3F8A] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <LayoutDashboard size={14} />
                <span>Return to {organization.charAt(0) + organization.slice(1).toLowerCase()} Portal</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 2. Specific Permission Check
    if (matchedReq.adminOnly && !isAdmin) {
      const hasAny = matchedReq.anyPermission ? matchedReq.anyPermission.some((p) => hasPermission(p)) : false;
      if (!hasAny) {
        const homeRoute =
          organization === 'DISTRIBUTOR'
            ? '/dealer'
            : organization === 'BANK'
            ? '/bank'
            : organization === 'MANUFACTURER'
            ? '/manufacturer'
            : '/platform';

        return (
          <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 mx-auto flex items-center justify-center shadow-2xs">
                <Lock size={28} />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Administrative Access Required</h2>
                <p className="text-xs text-slate-500">
                  This screen requires administrative management permissions not currently granted to your profile.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Screen:</span>
                  <span className="font-mono text-slate-800">{pathname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Required:</span>
                  <span className="font-mono text-amber-700 font-bold">
                    {matchedReq.anyPermission?.join(' OR ') || 'ADMIN_PRIVILEGE'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => router.push(homeRoute)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Go Back to Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        );
      }
    }
  }

  return <>{children}</>;
}

