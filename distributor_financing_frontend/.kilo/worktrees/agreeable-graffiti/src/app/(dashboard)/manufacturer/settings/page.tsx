'use client';

import React from 'react';
import { Settings, ShieldCheck, Factory } from 'lucide-react';

export default function ManufacturerSettingsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="h-7 w-7 text-[#1F4DA8]" />
          Manufacturer Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage invoice delivery hooks, corporate profile details, and user permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <Factory className="h-5 w-5 text-[#1F4DA8]" />
            <h3 className="text-sm font-bold text-slate-900">Anchor Enterprise Details</h3>
          </div>
          <p className="text-xs text-slate-500">
            Corporate entity profile, business permit registration, and dedicated settlement accounts.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Role-Based Access</h3>
          </div>
          <p className="text-xs text-slate-500">
            Role definitions and permission scopes strictly limited to internal sales and finance operators.
          </p>
        </div>
      </div>
    </div>
  );
}

