'use client';

import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  User,
  Phone,
  Mail,
  Calendar,
  Wallet,
  TrendingUp,
  Award,
  Sparkles,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { DistributorTierBadge } from './DistributorTierBadge';
import { DistributorTierCard } from './DistributorTierCard';
import { getTierFromRepaymentRate, getTierFromCreditScore, type DistributorTier } from '@/lib/tiers';
import type { ApprovedDistributor } from '@/lib/types';

export interface DistributorProfileModalProps {
  distributor: ApprovedDistributor | null;
  open: boolean;
  onClose: () => void;
}

export function DistributorProfileModal({
  distributor,
  open,
  onClose,
}: DistributorProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'tier' | 'facility' | 'kyc'>('tier');

  if (!distributor) return null;

  // Derive credit score and tier metrics
  const rawCreditScore = (distributor as any).creditScore;
  const creditScore = typeof rawCreditScore === 'number' && !isNaN(rawCreditScore) ? rawCreditScore : 780;
  const onTimeRepaymentRate = (distributor as any).onTimeRepaymentRate ?? 0;
  const totalRepaidAmount = (distributor as any).totalRepaidAmount ?? 0;
  const totalLoansCount = (distributor as any).totalLoansCount ?? 0;
  const completedLoansCount = (distributor as any).completedLoansCount ?? 0;
  const defaultsCount = (distributor as any).defaultsCount ?? 0;

  const derivedTier: DistributorTier =
    (distributor as any).tier ||
    getTierFromCreditScore(creditScore);

  const creditLimit = typeof (distributor as any).creditLimit === 'number'
    ? (distributor as any).creditLimit
    : parseFloat(String(distributor.creditLimit || '20000000').replace(/[^0-9.-]+/g, '')) || 20000000;
  const utilizedAmount = typeof (distributor as any).outstandingBalance === 'number'
    ? (distributor as any).outstandingBalance
    : typeof (distributor as any).utilizedAmount === 'number'
    ? (distributor as any).utilizedAmount
    : parseFloat(String((distributor as any).outstanding || '6500000').replace(/[^0-9.-]+/g, '')) || 6500000;
  const availableCredit = Math.max(0, creditLimit - utilizedAmount);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Distributor Loan Profile &amp; Tier Standing"
      description={`Enterprise profile, loan repayment performance, and revolving credit facility for ${distributor.companyName}.`}
      size="xl"
      footer={
        <ModalButton variant="secondary" onClick={onClose}>
          Close Profile
        </ModalButton>
      }
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto px-1 py-1">
        {/* TOP DISTRIBUTOR IDENTITY HERO */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-[#1F4DA8] text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
                <Building2 size={22} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {distributor.companyName}
                  </h3>
                  <DistributorTierBadge
                    tier={derivedTier}
                    creditScore={creditScore}
                    showScore={true}
                    size="sm"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <span>Reg No: <strong className="font-mono text-slate-700">{(distributor as any).registrationNumber || distributor.pin || distributor.id}</strong></span>
                  <span>•</span>
                  <span>Anchor: <strong className="text-blue-700">{(distributor as any).manufacturerName || 'Unilever East Africa'}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <StatusBadge status={distributor.status} />
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={11} /> Bank KYC Verified
              </span>
            </div>
          </div>

          {/* TAB BAR */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveTab('tier')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tier'
                  ? 'bg-[#1F4DA8] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <Award size={13} className="inline mr-1.5" />
              Repayment Tier &amp; Milestones
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('facility')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'facility'
                  ? 'bg-[#1F4DA8] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <CreditCard size={13} className="inline mr-1.5" />
              Revolving Facility Lines
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('kyc')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'kyc'
                  ? 'bg-[#1F4DA8] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <User size={13} className="inline mr-1.5" />
              KYC &amp; Maker/Checker
            </button>
          </div>
        </div>

        {/* TAB 1: REPAYMENT TIER & MILESTONES */}
        {activeTab === 'tier' && (
          <div className="space-y-4">
            <DistributorTierCard
              currentTier={derivedTier}
              onTimeRepaymentRate={onTimeRepaymentRate}
              totalRepaidAmount={totalRepaidAmount}
              totalLoansCount={totalLoansCount}
              completedLoansCount={completedLoansCount}
              defaultsCount={defaultsCount}
              creditScore={creditScore}
              showComparison={true}
            />
          </div>
        )}

        {/* TAB 2: REVOLVING FACILITY LINES */}
        {activeTab === 'facility' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-emerald-600" />
                  <h4 className="text-sm font-black text-slate-900">Revolving Borrowing Capacity</h4>
                </div>
                <DistributorTierBadge tier={derivedTier} size="sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Sanctioned Facility Limit</span>
                  <span className="text-lg font-black text-slate-900 mt-0.5 block">
                    KES {creditLimit.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500">Approved revolving cap</span>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Active Utilized Exposure</span>
                  <span className="text-lg font-black text-amber-900 mt-0.5 block">
                    KES {utilizedAmount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-amber-600">Active drawn purchase orders</span>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Available Headroom</span>
                  <span className="text-lg font-black text-emerald-800 mt-0.5 block">
                    KES {availableCredit.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-600">Ready for instant invoice drawdown</span>
                </div>
              </div>

              {/* Facility Terms */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Interest Rate</span>
                  <span className="font-bold text-slate-800">
                    {(distributor as any).interestRate ? `${(distributor as any).interestRate}% p.a.` : derivedTier === 'Platinum' ? '12.0% p.a.' : derivedTier === 'Gold' ? '13.5% p.a.' : '15.0% p.a.'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Max Tenor</span>
                  <span className="font-bold text-slate-800">60 - 90 Days</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Advance Coverage</span>
                  <span className="font-bold text-slate-800">{derivedTier === 'Platinum' ? '90%' : derivedTier === 'Gold' ? '80%' : '70%'} of Invoice</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Settlement Desk</span>
                  <span className="font-bold text-slate-800">Automated Sweep</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KYC & MAKER / CHECKER */}
        {activeTab === 'kyc' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <ShieldCheck size={18} className="text-blue-600" />
                <h4 className="text-sm font-black text-slate-900">Governance &amp; Corporate Identity</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Registered Entity Name</span>
                  <span className="font-bold text-slate-900 text-sm">{distributor.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Permit / Business Number</span>
                  <span className="font-mono font-bold text-slate-800">{(distributor as any).registrationNumber || distributor.pin || 'CPR/2023/49102'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Approved Date</span>
                  <span className="font-medium text-slate-800">{distributor.approvedDate || '2025-01-15'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Disbursement Settlement Account</span>
                  <span className="font-mono font-bold text-slate-800">{(distributor as any).accountNumber || '0112984710293 (KCB Bank)'}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block">Primary Contact Person</span>
                <div className="flex flex-wrap items-center gap-4 text-slate-600">
                  <span className="flex items-center gap-1">
                    <User size={12} className="text-slate-400" /> {(distributor as any).contactName || 'David Mutua'}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Mail size={12} className="text-slate-400" /> {(distributor as any).email || 'distributor@dfp.com'}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Phone size={12} className="text-slate-400" /> {(distributor as any).phone || '+254 722 111 222'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

