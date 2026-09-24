'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  Wallet,
  Info,
} from 'lucide-react';
import { distributorLoanProfilesApi } from '@/services/loans-api.service';
import type { DistributorLoanProfileResponse, LoanRequestResponse } from '@/types/loans';
import { useToast } from '@/components/ui/Toast';
import { getTierFromCreditScore, getTierConfig } from '@/lib/tiers';
import { DistributorTierBadge } from './DistributorTierBadge';

interface CreditLimitMeterProps {
  profile: DistributorLoanProfileResponse | null;
  loans?: LoanRequestResponse[];
  isLoading?: boolean;
  onRefreshed?: () => void;
}

export function CreditLimitMeter({ profile, loans = [], isLoading, onRefreshed }: CreditLimitMeterProps) {
  const toast = useToast();
  const [isRefreshingScore, setIsRefreshingScore] = useState(false);

  // An approval does not draw down the facility. Count utilization only after
  // the bank has completed the manufacturer remittance.
  const activeLoansUtilized = loans
    .filter((l) => {
      const s = (l.status || '').toUpperCase();
      return (
        s === 'DISBURSED' ||
        s === 'ACTIVE' ||
        s === 'PARTIALLY_DISBURSED' ||
        s === 'PARTIALLY_REPAID'
      );
    })
    .reduce((sum, l) => sum + (Number(l.remainingBalance ?? l.principalAmount) || 0), 0);

  const rawCreditLimit = profile?.creditLimit ?? 0;
  const creditLimit = rawCreditLimit > 0 ? rawCreditLimit : (activeLoansUtilized > 0 ? 5000000 : 0);
  const utilizedAmount = activeLoansUtilized;
  const availableCredit = creditLimit > 0 ? Math.max(0, creditLimit - utilizedAmount) : 0;
  const hasScore = typeof profile?.creditScore === 'number' && profile.creditScore > 0;
  const creditScore = hasScore ? profile!.creditScore! : 0;

  const utilizationPercent = creditLimit > 0 ? Math.min(100, Math.round((utilizedAmount / creditLimit) * 100)) : 0;

  // Credit risk tier
  const tier = getTierFromCreditScore(profile?.creditScore);
  const tierConfig = getTierConfig(tier);
  const maxAdvanceRate = tierConfig.advanceRate;

  const handleRefreshScore = async () => {
    if (!profile?.distributorId) return;
    setIsRefreshingScore(true);
    try {
      await distributorLoanProfilesApi.refreshCreditScore(profile.distributorId);
      toast.success('Credit score refreshed from banking scoring engine.');
      if (onRefreshed) onRefreshed();
    } catch {
      toast.error('Failed to recalculate credit score.');
    } finally {
      setIsRefreshingScore(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs animate-pulse space-y-4">
        <div className="h-6 w-48 bg-slate-100 rounded" />
        <div className="h-4 w-full bg-slate-100 rounded-full" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="h-16 bg-slate-100 rounded-xl" />
          <div className="h-16 bg-slate-100 rounded-xl" />
          <div className="h-16 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5 h-full flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-[#1F4DA8] text-white flex items-center justify-center shadow-xs shrink-0">
            <Wallet size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Revolving Credit Facility
              </h2>
              {hasScore ? (
                <DistributorTierBadge
                  tier={tier}
                  creditScore={creditScore}
                  showScore={true}
                  size="sm"
                />
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200">
                  Assessment Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Approved working capital line with up to <strong className="text-slate-800">{maxAdvanceRate}</strong> advance financing rate.
            </p>
          </div>
        </div>

        {profile?.distributorId && (
          <button
            type="button"
            onClick={handleRefreshScore}
            disabled={isRefreshingScore}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={13} className={isRefreshingScore ? 'animate-spin' : ''} />
            {isRefreshingScore ? 'Recalculating...' : 'Refresh Score'}
          </button>
        )}
      </div>

      {creditLimit === 0 ? (
        <div className="bg-blue-50/60 border border-blue-200/70 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#1F4DA8]">
          <Info size={16} className="shrink-0 mt-0.5 text-[#1F4DA8]" />
          <div>
            <strong className="font-bold">Facility Awaiting Allocation:</strong> No active credit facility line is provisioned on your profile yet. Once your partner bank approves and sanctions your facility, your revolving borrowing capacity will appear here.
          </div>
        </div>
      ) : (
        /* Progress bar */
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">
              Credit Utilization: <strong className="text-slate-900">{utilizationPercent}%</strong>
            </span>
            <span className="font-medium text-emerald-600">
              {utilizationPercent < 80 ? 'Optimal Liquidity Headroom' : 'Near Facility Ceiling'}
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                utilizationPercent > 85
                  ? 'bg-rose-500'
                  : utilizationPercent > 60
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.max(2, utilizationPercent)}%` }}
            />
          </div>
        </div>
      )}

      {/* 3 Metric Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sanctioned Limit</div>
          <div className="text-lg font-black text-slate-900 mt-1">
            KES {creditLimit.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Total credit ceiling</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Utilized Amount</div>
          <div className="text-lg font-black text-amber-600 mt-1">
            KES {utilizedAmount.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active outstanding loans</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Available Headroom</div>
          <div className="text-lg font-black text-emerald-700 mt-1">
            KES {availableCredit.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Ready for new drawdowns</div>
        </div>
      </div>
    </div>
  );
}
