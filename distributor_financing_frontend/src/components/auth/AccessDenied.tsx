'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Home } from 'lucide-react';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  description?: string;
  requiredPermission?: string;
  redirectHref?: string;
  redirectLabel?: string;
  backHref?: string;
  backLabel?: string;
}

export function AccessDenied({
  title = 'Access Restricted',
  message,
  description,
  requiredPermission,
  redirectHref,
  redirectLabel,
  backHref,
  backLabel,
}: AccessDeniedProps) {
  const displayMessage = description || message || 'You do not have the required permissions to access this feature. Please contact your organization administrator if you require access.';
  const href = backHref || redirectHref || '/bank';
  const label = backLabel || redirectLabel || 'Back to Dashboard';
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-600 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{displayMessage}</p>
        </div>

        {requiredPermission && (
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-[11px] text-slate-600 font-mono">
            Required Permission: <span className="font-bold text-[#1F4DA8]">{requiredPermission}</span>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={href}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F4DA8] text-white text-xs font-bold shadow-md shadow-[#1F4DA8]/20 hover:bg-[#183E88] transition-all"
          >
            <Home size={15} />
            <span>{label}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
