'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  Medal,
  Shield,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronRight,
  Zap,
  Coins,
  Check,
  CreditCard,
} from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { DistributorTierBadge } from './DistributorTierBadge';
import {
  TIER_CONFIG,
  type DistributorTier,
  getAllTiers,
  getRatedTiers,
  calculateTierProgress,
  getTierConfig,
  getTierFromCreditScore,
  normalizeTier,
} from '@/lib/tiers';
import { cn } from '@/lib/utils';

export interface DistributorTierCardProps {
  currentTier?: DistributorTier | string;
  creditScore?: number | null; // e.g. 760 (From profile.getCreditScore())
  onTimeRepaymentRate?: number; // e.g. 92 (meaning 92%)
  totalRepaidAmount?: number; // e.g. 48500000
  totalLoansCount?: number; // e.g. 12
  completedLoansCount?: number; // e.g. 10
  defaultsCount?: number; // 0
  compact?: boolean;
  showComparison?: boolean;
  className?: string;
}

const TIER_ICONS = {
  Sparkles,
  Award,
  Medal,
  Shield,
};

export function DistributorTierCard({
  currentTier: explicitTier,
  creditScore = 760,
  onTimeRepaymentRate = 0,
  totalRepaidAmount = 0,
  totalLoansCount = 0,
  completedLoansCount = 0,
  defaultsCount = 0,
  compact = false,
  showComparison = true,
  className,
}: DistributorTierCardProps) {
  const [showMatrix, setShowMatrix] = useState(false);

  // Derive active tier strictly from credit score (or explicit prop)
  const activeTier =
    explicitTier ||
    getTierFromCreditScore(creditScore);

  const activeCanonical = normalizeTier(activeTier);
  const activeConfig = getTierConfig(activeCanonical);
  const ratedTiers = getRatedTiers();
  const allTiers = getAllTiers();
  const progressInfo = calculateTierProgress(activeCanonical, creditScore);

  const CurrentIcon = TIER_ICONS[activeConfig.icon] || Award;

  return (
    <Card className={cn('bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden', className)}>
      {/* HEADER BANNER WITH TIER THEME */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={cn(
                'h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0',
                activeCanonical === 'Platinum'
                  ? 'bg-gradient-to-tr from-indigo-700 via-purple-600 to-indigo-500 shadow-indigo-500/25'
                  : activeCanonical === 'Gold'
                  ? 'bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-400 shadow-amber-500/25'
                  : activeCanonical === 'Silver'
                  ? 'bg-gradient-to-tr from-slate-600 via-slate-500 to-slate-400 shadow-slate-500/25'
                  : 'bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 shadow-blue-500/25'
              )}
            >
              <CurrentIcon size={24} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Credit Classification &amp; Repayment Tier
                </h3>
                <DistributorTierBadge
                  tier={activeCanonical}
                  creditScore={creditScore}
                  showScore={true}
                  size="md"
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                {activeConfig.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Credit Standing</span>
              <span className="text-xs font-black text-slate-900">
                {typeof creditScore === 'number' && creditScore > 0 ? `Score: ${creditScore}` : 'Unassessed'} • {activeConfig.label} Tier
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* REPAYMENT PERFORMANCE METRIC TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Credit Score</span>
              <div className="p-1 rounded-md bg-blue-100/70 text-blue-700">
                <CreditCard size={13} />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 flex items-baseline gap-1">
              <span>{typeof creditScore === 'number' && creditScore > 0 ? creditScore : 'N/A'}</span>
              <span className="text-[10px] font-bold text-blue-600">
                {creditScore && creditScore >= 800 ? 'Platinum (≥800)' : creditScore && creditScore >= 650 ? 'Gold (≥650)' : creditScore && creditScore > 0 ? 'Silver (<650)' : 'Standard (No Score)'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Underwriting score from loan profile</p>
          </div>

          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">On-Time Repayments</span>
              <div className="p-1 rounded-md bg-emerald-100/70 text-emerald-700">
                <TrendingUp size={13} />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 flex items-baseline gap-1">
              {completedLoansCount === 0 && totalRepaidAmount === 0 ? (
                <>
                  <span>--</span>
                  <span className="text-[10px] font-bold text-slate-500">No Repayments Yet</span>
                </>
              ) : (
                <>
                  <span>{onTimeRepaymentRate}%</span>
                  <span className="text-[10px] font-bold text-emerald-600">
                    {onTimeRepaymentRate >= 95 ? 'Exceptional' : onTimeRepaymentRate >= 80 ? 'Good' : 'Developing'}
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              {completedLoansCount === 0 && totalRepaidAmount === 0
                ? 'Awaiting initial loan maturity'
                : 'Timely loan settlement track record'}
            </p>
          </div>

          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Volume Repaid</span>
              <div className="p-1 rounded-md bg-indigo-100/70 text-indigo-700">
                <Coins size={13} />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900">
              {totalRepaidAmount === 0
                ? 'KES 0'
                : totalRepaidAmount >= 1000000
                ? `KES ${(totalRepaidAmount / 1000000).toFixed(1)}M`
                : `KES ${totalRepaidAmount.toLocaleString()}`}
            </div>
            <p className="text-[10px] text-slate-400">
              {totalRepaidAmount === 0 ? 'No loan settlements recorded yet' : 'Cumulative settled trade loans'}
            </p>
          </div>

          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Default &amp; Arrears</span>
              <div className="p-1 rounded-md bg-emerald-100/70 text-emerald-700">
                <ShieldCheck size={13} />
              </div>
            </div>
            <div className="text-xl font-black text-emerald-700">
              {defaultsCount === 0 ? '0 Defaults' : `${defaultsCount} Delinquent`}
            </div>
            <p className="text-[10px] text-slate-400">Flawless loan repayment record</p>
          </div>
        </div>

        {/* 3-STAGE VISUAL PROGRESSION ROADMAP */}
        <div className="bg-slate-50/60 border border-slate-200/70 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Zap size={14} className="text-[#1F4DA8]" />
                Distributor Tier Progression Roadmap
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Credit score determines tier placement (LoanRequestServiceImpl: Platinum ≥ 800, Gold ≥ 650, Silver &lt; 650, Standard = No score).
              </p>
            </div>

            {progressInfo.nextTier && (
              <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
                Next Goal: <strong className="text-[#1F4DA8]">{progressInfo.nextTier} Tier</strong>
              </span>
            )}
          </div>

          {/* PROGRESS BAR TRACK */}
          <div className="relative pt-2 pb-1">
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700',
                  activeCanonical === 'Platinum'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-500 w-full'
                    : activeCanonical === 'Gold'
                    ? 'bg-gradient-to-r from-slate-400 via-amber-500 to-amber-600'
                    : activeCanonical === 'Silver'
                    ? 'bg-gradient-to-r from-slate-300 to-slate-500'
                    : 'bg-blue-400'
                )}
                style={{
                  width:
                    activeCanonical === 'Platinum'
                      ? '100%'
                      : activeCanonical === 'Gold'
                      ? `${Math.max(40, 50 + (progressInfo.progressPercent * 0.5))}%`
                      : activeCanonical === 'Silver'
                      ? `${Math.max(20, progressInfo.progressPercent * 0.5)}%`
                      : '10%',
                }}
              />
            </div>

            {/* 3 Tier Milestone Cards (Silver, Gold, Platinum) */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {ratedTiers.map((tier) => {
                const isCurrent = tier.name === activeCanonical;
                const isPassed = tier.level < activeConfig.level;
                const isLocked = tier.level > activeConfig.level;
                const TierIcon = TIER_ICONS[tier.icon] || Medal;

                return (
                  <div
                    key={tier.name}
                    className={cn(
                      'p-3.5 rounded-xl border transition-all text-center flex flex-col items-center relative',
                      isCurrent
                        ? cn('bg-white shadow-sm ring-2', tier.name === 'Platinum' ? 'ring-indigo-500 border-indigo-300' : tier.name === 'Gold' ? 'ring-amber-500 border-amber-300' : 'ring-slate-400 border-slate-300')
                        : isPassed
                        ? 'bg-emerald-50/50 border-emerald-200 text-slate-700'
                        : 'bg-slate-100/60 border-slate-200/80 opacity-75'
                    )}
                  >
                    {/* Status Pip */}
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center mb-1.5 text-white text-[10px] font-black',
                        isCurrent
                          ? tier.name === 'Platinum'
                            ? 'bg-indigo-600 ring-2 ring-indigo-200'
                            : tier.name === 'Gold'
                            ? 'bg-amber-500 ring-2 ring-amber-200'
                            : 'bg-slate-600 ring-2 ring-slate-200'
                          : isPassed
                          ? 'bg-emerald-600'
                          : 'bg-slate-300 text-slate-600'
                      )}
                    >
                      {isPassed ? <Check size={11} /> : isLocked ? <Lock size={10} /> : <TierIcon size={11} />}
                    </div>

                    <div className="font-black text-xs text-slate-900 flex items-center gap-1">
                      {tier.label} Tier
                    </div>

                    <span className="text-[11px] font-bold text-[#1F4DA8] mt-0.5">
                      {tier.maxCreditLimit}
                    </span>

                    <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {tier.scoreRequirement}
                    </span>

                    {isCurrent && (
                      <span className={cn('mt-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full', tier.badge)}>
                        Current Tier
                      </span>
                    )}
                    {isPassed && (
                      <span className="mt-2 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    )}
                    {isLocked && (
                      <span className="mt-2 text-[9px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Lock size={8} /> Level {tier.level}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Upgrade Guidance */}
          <div className="pt-2 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-600 shrink-0" />
              <span>
                <strong>Underwriting Guidance:</strong> {progressInfo.requirementText}
              </span>
            </div>

            {showComparison && (
              <button
                type="button"
                onClick={() => setShowMatrix(!showMatrix)}
                className="text-[#1F4DA8] font-bold hover:underline flex items-center gap-0.5 cursor-pointer shrink-0 text-xs"
              >
                {showMatrix ? 'Hide Tier Comparison' : 'Compare Tier Perks'} <ChevronRight size={13} className={showMatrix ? 'rotate-90' : ''} />
              </button>
            )}
          </div>
        </div>

        {/* EXPANDABLE TIER COMPARISON MATRIX */}
        {showMatrix && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition-all">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Tier Benefits &amp; Credit Score Rules Comparison
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">Determined by DistributorLoanProfile.creditScore</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/60 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Financing Feature</th>
                    <th className="px-4 py-3 text-slate-600">Standard Tier (No Score)</th>
                    <th className="px-4 py-3 text-slate-700">Silver Tier (&lt;650)</th>
                    <th className="px-4 py-3 text-amber-800 bg-amber-50/40">Gold Tier (≥650)</th>
                    <th className="px-4 py-3 text-indigo-800 bg-indigo-50/40">Platinum Tier (≥800)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-900">Credit Score Rule</td>
                    <td className="px-4 py-2.5 text-slate-500">{TIER_CONFIG.Standard.scoreRequirement}</td>
                    <td className="px-4 py-2.5">{TIER_CONFIG.Silver.scoreRequirement}</td>
                    <td className="px-4 py-2.5 font-semibold text-amber-900 bg-amber-50/20">{TIER_CONFIG.Gold.scoreRequirement}</td>
                    <td className="px-4 py-2.5 font-bold text-indigo-900 bg-indigo-50/20">{TIER_CONFIG.Platinum.scoreRequirement}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-900">Max Revolving Limit</td>
                    <td className="px-4 py-2.5 font-mono text-slate-500">{TIER_CONFIG.Standard.maxCreditLimit}</td>
                    <td className="px-4 py-2.5 font-mono">{TIER_CONFIG.Silver.maxCreditLimit}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-amber-900 bg-amber-50/20">{TIER_CONFIG.Gold.maxCreditLimit}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-indigo-900 bg-indigo-50/20">{TIER_CONFIG.Platinum.maxCreditLimit}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-900">Invoice Advance Rate</td>
                    <td className="px-4 py-2.5 text-slate-500">{TIER_CONFIG.Standard.advanceRate}</td>
                    <td className="px-4 py-2.5">{TIER_CONFIG.Silver.advanceRate}</td>
                    <td className="px-4 py-2.5 font-bold text-amber-900 bg-amber-50/20">{TIER_CONFIG.Gold.advanceRate}</td>
                    <td className="px-4 py-2.5 font-bold text-indigo-900 bg-indigo-50/20">{TIER_CONFIG.Platinum.advanceRate}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-900">Interest Rate Tier</td>
                    <td className="px-4 py-2.5 text-slate-500">{TIER_CONFIG.Standard.interestRateDiscount}</td>
                    <td className="px-4 py-2.5">{TIER_CONFIG.Silver.interestRateDiscount}</td>
                    <td className="px-4 py-2.5 font-semibold text-amber-900 bg-amber-50/20">{TIER_CONFIG.Gold.interestRateDiscount}</td>
                    <td className="px-4 py-2.5 font-bold text-indigo-900 bg-indigo-50/20">{TIER_CONFIG.Platinum.interestRateDiscount}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-900">Disbursal SLA</td>
                    <td className="px-4 py-2.5 text-slate-500">{TIER_CONFIG.Standard.disbursalSLA}</td>
                    <td className="px-4 py-2.5">{TIER_CONFIG.Silver.disbursalSLA}</td>
                    <td className="px-4 py-2.5 text-amber-900 bg-amber-50/20">{TIER_CONFIG.Gold.disbursalSLA}</td>
                    <td className="px-4 py-2.5 font-bold text-indigo-900 bg-indigo-50/20">{TIER_CONFIG.Platinum.disbursalSLA}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

