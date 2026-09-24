'use client';

import React from 'react';
import { Settings, ShieldCheck, Landmark } from 'lucide-react';

export default function BankSettingsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="h-7 w-7 text-[#1F4DA8]" />
          Bank Organization Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage underwriting criteria, interest rate schedules, and notification preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <Landmark className="h-5 w-5 text-[#1F4DA8]" />
            <h3 className="text-sm font-bold text-slate-900">Credit Policy Configuration</h3>
          </div>
          <p className="text-xs text-slate-500">
            Standard loan tenor is set to 30 days with automated overdue fee calculations and daily simple interest.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Security &amp; Dual-Control (Maker/Checker)</h3>
          </div>
          <p className="text-xs text-slate-500">
            Dual-control enforcement is active on all credit limit authorizations and disbursement sign-offs.
          </p>
        </div>
      </div>
    </div>
  );
}

