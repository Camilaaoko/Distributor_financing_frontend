'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Building2,
  Users,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { bankOnboardingApi } from '@/services/onboarding-api.service';
import type { BankDashboardStatsResponse, BankMetricsResponse } from '@/types/onboarding';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';

export default function BankFloatPage() {
  const toast = useToast();
  const [stats, setStats] = useState<BankDashboardStatsResponse | null>(null);
  const [metrics, setMetrics] = useState<BankMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, metricsData] = await Promise.all([
        bankOnboardingApi.getBankDashboardStats().catch(() => null),
        bankOnboardingApi.getBankMetrics().catch(() => null),
      ]);
      setStats(statsData);
      setMetrics(metricsData);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load bank float and liquidity metrics.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real data state / clean default values
  const amountLentOut = 0;
  const amountOwed = 0;
  const approvedDistributors = stats?.approvedDistributors ?? 0;
  const pendingDistributors = stats?.pendingDistributors ?? 0;
  const totalManufacturers = stats?.totalManufacturers ?? 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wallet className="h-7 w-7 text-[#1F4DA8]" />
            Bank Float &amp; Liquidity
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor total funds lent out to distributors, active exposure, and repayment positions.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Primary Float Summary Cards (Compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
        {/* Card 1: Amount Lent Out to Distributors */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Amount Lent Out
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(amountLentOut)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Disbursed directly to anchor manufacturers
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Approved Facilities</span>
            <span className="font-bold text-emerald-700">{approvedDistributors} Active Borrowers</span>
          </div>
        </div>

        {/* Card 2: Amount Owed by Distributors */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Amount Owed by Distributors
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(amountOwed)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Principal + Accrued Financing Fees
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Pending Underwriting</span>
            <span className="font-bold text-amber-700">{pendingDistributors} Applications in Review</span>
          </div>
        </div>
      </div>

      {/* Float Allocation Breakdown & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#1F4DA8]" />
            Liquidity Allocation &amp; Portfolio Exposure
          </h3>
          <p className="text-xs text-slate-500">
            Breakdown of committed credit limits and real-time float exposure across anchor supply chains.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>Active Anchor Manufacturers</span>
                <Building2 className="w-3.5 h-3.5 text-[#1F4DA8]" />
              </div>
              <div className="text-lg font-bold text-slate-900">{totalManufacturers}</div>
              <div className="text-[11px] text-slate-400">Connected corporate supply chains</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>Approved Credit Borrowers</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-lg font-bold text-emerald-700">{approvedDistributors}</div>
              <div className="text-[11px] text-slate-400">Authorized distributor facilities</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>Pending Approvals</span>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-lg font-bold text-amber-700">{pendingDistributors}</div>
              <div className="text-[11px] text-slate-400">Applications awaiting underwriting</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>Bank Operations Staff</span>
                <Users className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="text-lg font-bold text-indigo-700">{stats?.totalBankUsers ?? 0}</div>
              <div className="text-[11px] text-slate-400">Makers &amp; checkers active</div>
            </div>
          </div>
        </div>

        {/* Float Status & Settlement Info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Settlement Account Info
          </h3>

          <div className="space-y-3 text-xs text-slate-600 pt-2">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Disbursement Channel</span>
              <span className="font-bold text-slate-800">RTGS / Real-Time Clearing</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Settlement Currency</span>
              <span className="font-bold text-slate-800">KES (Kenya Shillings)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Financing Structure</span>
              <span className="font-bold text-slate-800">Anchor-Led Distributor Finance</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Interest Accrual</span>
              <span className="font-bold text-slate-800">Daily Simple Interest</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

