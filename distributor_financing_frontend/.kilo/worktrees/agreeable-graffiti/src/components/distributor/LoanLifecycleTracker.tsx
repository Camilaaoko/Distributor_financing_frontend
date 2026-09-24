'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  Landmark,
  ShieldCheck,
  Coins,
  Receipt,
  XCircle,
} from 'lucide-react';
import type { LoanRequestStatus } from '@/types/loans';

interface LoanLifecycleTrackerProps {
  status: LoanRequestStatus;
  rejectionReason?: string;
}

const STEPS = [
  { key: 'SUBMITTED', label: '1. PO Submitted', desc: 'Application initiated by distributor' },
  { key: 'MANUFACTURER', label: '2. Proforma Invoice', desc: 'Anchor confirms invoice & goods' },
  { key: 'BANK_REVIEW', label: '3. Bank Sanction', desc: 'Credit assessment & limit verification' },
  { key: 'DISBURSED', label: '4. Disbursed', desc: 'Funds paid directly to manufacturer' },
  { key: 'COMPLETED', label: '5. Fully Settled', desc: 'Principal & interest repaid' },
];

export function LoanLifecycleTracker({ status, rejectionReason }: LoanLifecycleTrackerProps) {
  const normStatus = (status || '').toUpperCase();

  if (normStatus === 'REJECTED' || normStatus === 'CANCELLED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
          <XCircle size={16} />
          <span>Application {normStatus === 'CANCELLED' ? 'Cancelled' : 'Declined'}</span>
        </div>
        {rejectionReason && (
          <p className="text-xs text-rose-600 bg-white p-2.5 rounded-lg border border-rose-100">
            <strong>Reason:</strong> {rejectionReason}
          </p>
        )}
      </div>
    );
  }

  // Determine current active step index (0..4)
  let activeIndex = 0;
  if (normStatus === 'PENDING_MANUFACTURER_CONFIRMATION') {
    activeIndex = 1;
  } else if (normStatus === 'PENDING' || normStatus === 'CHECKER_APPROVED') {
    activeIndex = 2;
  } else if (normStatus === 'APPROVED' || normStatus === 'PROCESSING') {
    activeIndex = 2;
  } else if (normStatus === 'DISBURSED' || normStatus === 'PARTIALLY_DISBURSED' || normStatus === 'PARTIALLY_REPAID' || normStatus === 'OVERDUE') {
    activeIndex = 3;
  } else if (normStatus === 'COMPLETED') {
    activeIndex = 4;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3">
      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
        <span>Trade Financing Lifecycle</span>
        {normStatus === 'OVERDUE' && (
          <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            Payment Overdue
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative pt-2">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIndex || (idx === 4 && normStatus === 'COMPLETED');
          const isCurrent = idx === activeIndex && normStatus !== 'COMPLETED';

          return (
            <div
              key={step.key}
              className={`p-2.5 rounded-xl border text-xs transition-all ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : isCurrent
                  ? 'bg-blue-50/80 border-[#1F4DA8] text-[#1F4DA8] shadow-2xs font-semibold'
                  : 'bg-slate-50 border-slate-200/60 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {isDone ? (
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Clock size={14} className="text-[#1F4DA8] shrink-0 animate-pulse" />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-slate-300 text-[10px] flex items-center justify-center font-bold text-slate-400">
                    {idx + 1}
                  </span>
                )}
                <span className="font-bold truncate">{step.label}</span>
              </div>
              <p className="text-[10px] opacity-80 leading-tight truncate">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}