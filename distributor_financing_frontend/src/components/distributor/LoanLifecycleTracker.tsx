'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  Landmark,
  ShieldCheck,
  Banknote,
  XCircle,
  FileCheck2,
  UserCheck,
} from 'lucide-react';
import type { LoanRequestStatus } from '@/types/loans';

interface LoanLifecycleTrackerProps {
  status: LoanRequestStatus;
  rejectionReason?: string;
}

const LIFECYCLE_STEPS = [
  { key: 'APPLICATION', label: '1. Application', desc: 'Maker requested trade line' },
  { key: 'INTERNAL_REVIEW', label: '2. Checker Review', desc: 'Distributor four-eyes sign-off' },
  { key: 'CHECKER_APPROVED', label: '3. Checker Approved', desc: 'Authorized & sent to bank' },
  { key: 'BANK_REVIEW', label: '4. Bank Underwriting', desc: 'Credit & proforma validation' },
  { key: 'BANK_APPROVED', label: '5. Bank Approved', desc: 'Facility drawn & sanctioned' },
  { key: 'DISBURSEMENT', label: '6. Disbursed', desc: 'Settled to manufacturer' },
  { key: 'REPAID', label: '7. Settled', desc: 'Principal & interest repaid' },
];

export function LoanLifecycleTracker({ status, rejectionReason }: LoanLifecycleTrackerProps) {
  const normStatus = (status || '').toUpperCase();

  if (normStatus === 'REJECTED' || normStatus === 'CANCELLED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
          <XCircle size={18} className="text-rose-600 shrink-0" />
          <span>Application {normStatus === 'CANCELLED' ? 'Cancelled' : 'Declined / Returned'}</span>
        </div>
        {rejectionReason ? (
          <p className="text-xs text-rose-700 bg-white p-3 rounded-xl border border-rose-100 font-medium">
            <strong>Decision Note:</strong> {rejectionReason}
          </p>
        ) : (
          <p className="text-xs text-rose-600 font-medium">
            This loan application has been {normStatus.toLowerCase()} and will not proceed further through the pipeline.
          </p>
        )}
      </div>
    );
  }

  // Determine active step index (0-indexed)
  let activeIndex = 0;
  if (
    normStatus === 'PENDING' ||
    normStatus === 'PENDING_INTERNAL_APPROVAL' ||
    normStatus === 'SUBMITTED' ||
    normStatus === 'INTERNAL_REVIEW'
  ) {
    activeIndex = 1; // Checker Review
  } else if (
    normStatus === 'CHECKER_APPROVED' ||
    normStatus === 'APPROVED_BY_CHECKER' ||
    normStatus === 'INTERNAL_APPROVED'
  ) {
    activeIndex = 2; // Checker Approved
  } else if (
    normStatus === 'PENDING_BANK_APPROVAL' ||
    normStatus === 'BANK_REVIEW' ||
    normStatus === 'UNDER_REVIEW' ||
    normStatus === 'PENDING_MANUFACTURER_CONFIRMATION' ||
    normStatus === 'PROCESSING'
  ) {
    activeIndex = 3; // Bank Underwriting / Mfr Review
  } else if (
    normStatus === 'APPROVED' ||
    normStatus === 'BANK_APPROVED' ||
    normStatus === 'FACILITY_APPROVED'
  ) {
    activeIndex = 4; // Bank Approved
  } else if (
    normStatus === 'DISBURSED' ||
    normStatus === 'ACTIVE' ||
    normStatus === 'PARTIALLY_DISBURSED' ||
    normStatus === 'PARTIALLY_REPAID'
  ) {
    activeIndex = 5; // Disbursed
  } else if (
    normStatus === 'COMPLETED' ||
    normStatus === 'REPAID' ||
    normStatus === 'CLOSED' ||
    normStatus === 'SETTLED'
  ) {
    activeIndex = 6; // Settled
  }

  return (
    <div className="space-y-4">
      {/* 7-STAGE PIPELINE INDICATOR */}
      <div className="relative">
        <div className="hidden md:block absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 relative z-10">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div
                key={step.key}
                className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      isCurrent
                        ? 'text-indigo-700'
                        : isCompleted
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    Step {idx + 1}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : isCurrent ? (
                    <Clock size={14} className="text-indigo-600 animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-200" />
                  )}
                </div>

                <div>
                  <div
                    className={`text-xs font-bold leading-tight ${
                      isCurrent
                        ? 'text-indigo-950'
                        : isCompleted
                        ? 'text-emerald-950'
                        : 'text-slate-600'
                    }`}
                  >
                    {step.label.replace(/^\d+\.\s*/, '')}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STAGE CONTEXT CALLOUT */}
      {activeIndex === 1 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
          <UserCheck size={16} className="text-amber-600 shrink-0" />
          <span>
            <strong>Distributor Four-Eyes Control:</strong> Maker has applied. Awaiting internal Distributor Checker sign-off.
          </span>
        </div>
      )}
      {activeIndex === 2 && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
          <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
          <span>
            <strong>Distributor Sign-off Complete:</strong> Legally authorized by Distributor Checker. Transmitted to bank queue.
          </span>
        </div>
      )}
      {activeIndex === 3 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
          <Landmark size={16} className="text-[#1F4DA8] shrink-0" />
          <span>
            <strong>Bank Credit Desk Review:</strong> Underwriter validating purchase order and proforma invoice terms.
          </span>
        </div>
      )}
      {activeIndex === 4 && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <FileCheck2 size={16} className="text-emerald-600 shrink-0" />
          <span>
            <strong>Bank Facility Approved:</strong> Trade credit sanctioned. Awaiting automated or batch disbursement to manufacturer.
          </span>
        </div>
      )}
      {activeIndex === 5 && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <Banknote size={16} className="text-emerald-600 shrink-0" />
          <span>
            <strong>Direct Disbursement Executed:</strong> Funds paid directly to anchor manufacturer bank account.
          </span>
        </div>
      )}
    </div>
  );
}
