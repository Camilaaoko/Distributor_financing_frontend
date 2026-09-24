'use client';

import React from 'react';
import { UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { useDealerRole } from '@/hooks/useDealerRole';

/**
 * Demo Persona Switcher (Development & QA Simulation Only).
 * In production, the backend JWT / session determines the authoritative AppRole and permissions.
 */
export function RoleSwitcher() {
  const { isMaker, isChecker, switchRole } = useDealerRole();

  return (
    <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs shadow-inner">
      <div className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
        <Sparkles size={11} className="text-indigo-600" />
        <span className="hidden sm:inline">Demo Persona:</span>
      </div>

      <button
        type="button"
        onClick={() => switchRole('DEALER_MAKER')}
        title="Simulate Distributor Maker persona (APPLY_FINANCING)"
        className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer text-xs ${
          isMaker && !isChecker
            ? 'bg-blue-700 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
      >
        <UserCheck className="w-3.5 h-3.5" />
        <span>Maker</span>
      </button>

      <button
        type="button"
        onClick={() => switchRole('DEALER_CHECKER')}
        title="Simulate Distributor Checker persona (APPROVE_DISTRIBUTOR_LOAN)"
        className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer text-xs ${
          isChecker
            ? 'bg-indigo-700 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
      >
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>Checker</span>
      </button>
    </div>
  );
}
