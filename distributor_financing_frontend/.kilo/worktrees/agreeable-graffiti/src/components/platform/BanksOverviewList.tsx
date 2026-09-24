'use client';

import { Landmark, RefreshCw } from 'lucide-react';
import { useBanks } from '@/hooks/useBanks';

export function BanksOverviewList() {
  const { banks, isLoading } = useBanks();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-9 w-9 rounded-xl bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-slate-100 rounded w-3/4" />
              <div className="h-2.5 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (banks.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400">
        <Landmark size={24} className="mx-auto text-slate-300 mb-1" />
        <p className="text-xs font-semibold text-slate-500">No banks registered yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {banks.slice(0, 5).map((b) => (
        <div key={b.id} className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <Landmark size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900 truncate">{b.name}</div>
            <div className="text-xs text-slate-400">
              {b.adminCount} admin{b.adminCount === 1 ? '' : 's'} • {b.branch || 'Main'}
            </div>
          </div>
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
              b.status === 'Active' || b.status === 'ACTIVE'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {b.status || 'Active'}
          </span>
        </div>
      ))}
    </div>
  );
}
