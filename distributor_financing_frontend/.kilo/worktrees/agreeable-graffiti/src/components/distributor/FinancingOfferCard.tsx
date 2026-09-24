'use client';

import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Calendar,
  Percent,
  Wallet,
  Building2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { distributorLoanProfilesApi } from '@/services/loans-api.service';
import { useToast } from '@/components/ui/Toast';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { getErrorMessage } from '@/lib/errors';
import type { DistributorLoanProfileResponse } from '@/types/loans';

interface FinancingOfferCardProps {
  profile: DistributorLoanProfileResponse;
  onOfferActionCompleted: () => void;
}

export function FinancingOfferCard({ profile, onOfferActionCompleted }: FinancingOfferCardProps) {
  const toast = useToast();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isDeclining, setIsDeclining] = useState(false);

  const handleAccept = async () => {
    if (!profile.id) return;
    setIsAccepting(true);
    try {
      await distributorLoanProfilesApi.acceptOffer(profile.id);
      toast.success('Financing offer accepted! Your revolving credit facility is now active.');
      onOfferActionCompleted();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to accept financing offer.'));
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!profile.id) return;
    if (!declineReason.trim()) {
      toast.error('Please state a reason for declining the financing offer.');
      return;
    }
    setIsDeclining(true);
    try {
      await distributorLoanProfilesApi.rejectOffer(profile.id, {
        rejectionReason: declineReason.trim(),
      });
      toast.success('Financing offer declined.');
      setIsDeclineModalOpen(false);
      onOfferActionCompleted();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to decline financing offer.'));
    } finally {
      setIsDeclining(false);
    }
  };

  const allowedTerms = Array.isArray(profile.allowedRepaymentTerms) && profile.allowedRepaymentTerms.length > 0
    ? profile.allowedRepaymentTerms
    : [7, 14, 30, 60, 90];

  return (
    <div className="bg-gradient-to-br from-[#1F4DA8]/5 via-white to-amber-50/40 border-2 border-[#1F4DA8]/30 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
      {/* Decorative background watermark */}
      <div className="absolute right-4 -bottom-6 opacity-5 pointer-events-none">
        <FileCheck2 size={220} />
      </div>

      <div className="space-y-6 relative z-10">
        {/* Header Badge & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[#1F4DA8] text-white flex items-center justify-center shrink-0 shadow-md">
              <FileCheck2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                  Action Required: Financing Offer Letter
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Ref: {profile.loanProfileReference || `LPROF-${profile.id || '2026'}`}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1">
                Commercial Revolving Credit Facility Offer
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Your partner bank has underwritten and approved your credit line for anchor inventory purchases. Please review the terms below to activate your facility.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsDeclineModalOpen(true)}
              disabled={isAccepting}
              className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              Decline Offer
            </button>
            <button
              type="button"
              onClick={handleAccept}
              disabled={isAccepting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isAccepting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Accept Offer &amp; Activate Limit
            </button>
          </div>
        </div>

        {/* Term Sheet Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Approved Credit Limit</span>
              <Wallet size={15} className="text-emerald-600" />
            </div>
            <div className="text-xl font-black text-slate-900">
              KES {Number(profile.creditLimit || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold">100% Revolving Headroom</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Interest Rate</span>
              <Percent size={15} className="text-[#1F4DA8]" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {profile.interestRate !== undefined ? `${profile.interestRate}%` : '12.5%'}
              <span className="text-xs font-normal text-slate-500 ml-1">p.a.</span>
            </div>
            <p className="text-[11px] text-slate-500">Pro-rata daily single bullet</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Max Advance Rate</span>
              <ShieldCheck size={15} className="text-indigo-600" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {profile.maxFinancingPercentage || 80}%
            </div>
            <p className="text-[11px] text-slate-500">Of proforma invoice amount</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Facility Tenor Options</span>
              <Clock size={15} className="text-amber-600" />
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {allowedTerms.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold"
                >
                  {t}d
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Bullet payoff on maturity</p>
          </div>
        </div>

        {/* Legal & Governance Notice */}
        <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-slate-700">
          <ShieldCheck size={16} className="text-[#1F4DA8] shrink-0 mt-0.5" />
          <div>
            <strong>Closed-Loop Supply Chain Covenant:</strong> By accepting this offer, disbursements against verified purchase orders will be credited directly to your recommended Anchor Manufacturer&apos;s settlement account. Your revolving borrowing limit will automatically replenish upon bullet loan settlement.
          </div>
        </div>
      </div>

      {/* Decline Offer Modal */}
      <Modal
        open={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        title="Decline Financing Offer"
        description="Please provide feedback for the partner bank credit underwriting team."
        size="md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <ModalButton variant="secondary" onClick={() => setIsDeclineModalOpen(false)}>
              Cancel
            </ModalButton>
            <ModalButton
              variant="danger"
              onClick={handleDecline}
              disabled={isDeclining || !declineReason.trim()}
            >
              {isDeclining ? 'Declining...' : 'Confirm Decline'}
            </ModalButton>
          </div>
        }
      >
        <div className="space-y-4 py-2 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Reason for Declining <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Higher credit limit required, interested in longer repayment tenors, or lower interest rate requested."
              className="w-full p-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
