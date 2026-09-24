'use client';

import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';
import { Users } from 'lucide-react';

export function RecentBankAdminsList() {
  const { admins, isLoading } = usePlatformAdmin();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-9 w-9 rounded-full bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-slate-100 rounded w-3/4" />
              <div className="h-2.5 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400">
        <Users size={24} className="mx-auto text-slate-300 mb-1" />
        <p className="text-xs font-semibold text-slate-500">No bank administrators found</p>
      </div>
    );
  }

  const recent = admins.slice(0, 5);

  return (
    <div className="space-y-4">
      {recent.map((a) => (
        <div key={a.id} className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-full ${a.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
            {(a.firstName?.[0] || 'B')}{(a.lastName?.[0] || 'A')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900 truncate">{a.firstName} {a.lastName}</div>
            <div className="text-xs text-slate-400 truncate">{a.bankName || 'Partner Bank'}</div>
          </div>
          <StatusBadge status={a.status} />
        </div>
      ))}
    </div>
  );
}
