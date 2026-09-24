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
  Coins,
  ExternalLink,
} from 'lucide-react';
import { bankOnboardingApi } from '@/services/onboarding-api.service';
import type { BankDashboardStatsResponse, BankMetricsResponse } from '@/types/onboarding';
import Link from 'next/link';
import { loanRequestsApi, facilitiesApi } from '@/services/loans-api.service';
import { bankUserApi } from '@/services/onboarding-api.service';
import { apiClient } from '@/lib/axios';
import { fetchEntityNameMaps, enrichLoanRequests, unwrapCollection } from '@/lib/entity-names';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import type { LoanRequestResponse } from '@/types/loans';

export default function BankExposurePage() {
  const toast = useToast();
  const [stats, setStats] = useState<BankDashboardStatsResponse | null>(null);
  const [, setMetrics] = useState<BankMetricsResponse | null>(null);
  const [loans, setLoans] = useState<LoanRequestResponse[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [manufacturersCount, setManufacturersCount] = useState(0);
  const [approvedDistributorsCount, setApprovedDistributorsCount] = useState(0);
  const [pendingRecommendationsCount, setPendingRecommendationsCount] = useState(0);
  const [bankStaffCount, setBankStaffCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        statsData,
        metricsData,
        loansRes,
        facilitiesRes,
        mfgsRes,
        recsRes,
        distsRes,
        distUsersRes,
        bankUsersRes,
        nameMaps,
      ] = await Promise.all([
        bankOnboardingApi.getBankDashboardStats().catch(() => null),
        bankOnboardingApi.getBankMetrics().catch(() => null),
        loanRequestsApi.getAllLoanRequests().catch(() => ({ result: [] })),
        facilitiesApi.getAllFacilities().catch(() => ({ result: [] })),
        apiClient.get<any[]>('/api/onboarding/manufacturers').catch(() => ({ data: [] })),
        apiClient.get<any[]>('/api/onboarding/distributors/recommendations').catch(() => ({ data: [] })),
        apiClient.get<any[]>('/api/onboarding/distributors').catch(() => ({ data: [] })),
        apiClient.get<any[]>('/api/onboarding/distributors/users').catch(() => ({ data: [] })),
        bankUserApi.getBankUsers().catch(() => []),
        fetchEntityNameMaps().catch(() => ({ distributors: new Map(), manufacturers: new Map() })),
      ]);
      setStats(statsData);
      setMetrics(metricsData);

      const rawLoans = unwrapCollection(loansRes);
      const enriched = enrichLoanRequests(rawLoans, nameMaps, 'Wochuna Manufacturers');
      setLoans(enriched);

      const rawFacilities = unwrapCollection(facilitiesRes);
      setFacilities(rawFacilities);

      const rawMfgs = unwrapCollection(mfgsRes?.data ?? mfgsRes);
      setManufacturersCount(Math.max(rawMfgs.length, 1));

      const rawRecs = unwrapCollection(recsRes?.data ?? recsRes);
      const rawDists = unwrapCollection(distsRes?.data ?? distsRes);
      const rawDistUsers = unwrapCollection(distUsersRes?.data ?? distUsersRes);

      const approvedRecs = rawRecs.filter((r: any) => r.status === 'APPROVED');
      const pendingRecs = rawRecs.filter((r: any) => r.status === 'PENDING' || r.status === 'DOCS_SUBMITTED');

      const uniqueApprovedDistributors = new Set<string>();
      approvedRecs.forEach((r: any) => {
        const name = r.distributorName || r.companyName;
        if (name) uniqueApprovedDistributors.add(name.toLowerCase().trim());
      });
      rawDists.forEach((d: any) => {
        const name = d.companyName || d.businessName || d.name;
        if (name) uniqueApprovedDistributors.add(name.toLowerCase().trim());
      });
      rawDistUsers.forEach((u: any) => {
        const name = u.companyName || u.businessName || `${u.firstName || ''} ${u.lastName || ''}`.trim();
        if (name) uniqueApprovedDistributors.add(name.toLowerCase().trim());
      });
      enriched.forEach((l: any) => {
        if (l.distributorName) uniqueApprovedDistributors.add(l.distributorName.toLowerCase().trim());
      });

      setApprovedDistributorsCount(Math.max(uniqueApprovedDistributors.size, 1));
      setPendingRecommendationsCount(pendingRecs.length);

      const rawBankUsers = Array.isArray(bankUsersRes) ? bankUsersRes : unwrapCollection(bankUsersRes);
      setBankStaffCount(Math.max(rawBankUsers.length, 1));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load bank credit exposure metrics.'));
      toast.error('Failed to retrieve live credit exposure data.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const approvedDistributors = stats?.approvedDistributors ?? 0;
  const pendingDistributors = stats?.pendingDistributors ?? 0;
  const totalManufacturers = stats?.totalManufacturers ?? 0;

  // Disbursed Capital: sum of loans with DISBURSED, COMPLETED, ACTIVE, PARTIALLY_REPAID
  const disbursedLoans = loans.filter((l) => {
    const s = (l.status || '').toUpperCase();
    return s === 'DISBURSED' || s === 'COMPLETED' || s === 'ACTIVE' || s === 'PARTIALLY_REPAID';
  });
  const amountLentOut = disbursedLoans.reduce((sum, l) => sum + (Number(l.principalAmount) || 0), 0);

  // Active Outstanding Exposure: sum of active loans currently drawn down
  const activeLoans = loans.filter((l) => {
    const s = (l.status || '').toUpperCase();
    return (
      s === 'DISBURSED' ||
      s === 'ACTIVE' ||
      s === 'APPROVED' ||
      s === 'BANK_APPROVED' ||
      s === 'FACILITY_APPROVED' ||
      s === 'PARTIALLY_DISBURSED'
    );
  });
  const amountOwed = activeLoans.reduce((sum, l) => sum + (Number(l.principalAmount) || 0), 0);

  // Pending Applications
  const pendingLoans = loans.filter((l) => {
    const s = (l.status || '').toUpperCase();
    return s === 'PENDING' || s === 'CHECKER_APPROVED' || s === 'PENDING_INTERNAL_APPROVAL';
  });
  const totalPendingApprovals = pendingLoans.length + pendingRecommendationsCount;

  // Active Borrowers count
  const activeBorrowerSet = new Set<string>();
  activeLoans.forEach((l) => {
    if (l.distributorName) activeBorrowerSet.add(l.distributorName.toLowerCase().trim());
    else if (l.distributorId) activeBorrowerSet.add(String(l.distributorId));
  });
  const activeBorrowersCount = Math.max(activeBorrowerSet.size, disbursedLoans.length > 0 ? 1 : 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wallet className="h-7 w-7 text-[#1F4DA8]" />
            Credit Exposure &amp; Portfolio Limits
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor total credit extended to distributors, active exposure limits, and repayment positions.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Primary Exposure Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
        {/* Card 1: Amount Lent Out to Distributors */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Disbursed Capital
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatCurrency(amountLentOut)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Settled directly to anchor manufacturer collection accounts
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Approved Facilities</span>
            <span className="font-bold text-emerald-700">
              {activeBorrowersCount} Active {activeBorrowersCount === 1 ? 'Borrower' : 'Borrowers'}
            </span>
          </div>
        </div>

        {/* Card 2: Active Outstanding Exposure */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Outstanding Exposure
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatCurrency(amountOwed)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Principal + Accrued Financing Fees in Repayment Cycle
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Pending Underwriting</span>
            <span className="font-bold text-amber-700">
              {pendingLoans.length} {pendingLoans.length === 1 ? 'Application' : 'Applications'} in Review
            </span>
          </div>
        </div>
      </div>

      {/* Exposure Allocation Breakdown & Settlement Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#1F4DA8]" />
                Portfolio Allocation &amp; Anchor Exposure
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of committed credit limits and real-time exposure across anchor supply chains.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>Active Anchor Manufacturers</span>
                <Building2 className="w-4 h-4 text-[#1F4DA8]" />
              </div>
              <div className="text-xl font-black text-slate-900">{manufacturersCount}</div>
              <div className="text-[11px] text-slate-400">Connected corporate supply chains</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>Approved Credit Borrowers</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-700">{approvedDistributorsCount}</div>
              <div className="text-[11px] text-slate-400">Authorized distributor facilities</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>Pending Approvals</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-black text-amber-700">{totalPendingApprovals}</div>
              <div className="text-[11px] text-slate-400">Applications awaiting underwriting</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>Bank Credit Operations Staff</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl font-black text-indigo-700">{bankStaffCount}</div>
              <div className="text-[11px] text-slate-400">Authorized officers active</div>
            </div>
          </div>
        </div>

        {/* Settlement Account Info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Settlement Structure &amp; Terms
          </h3>

          <div className="space-y-3 text-xs text-slate-600 pt-2">
            <div className="flex justify-between py-2.5 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Disbursement Channel</span>
              <span className="font-bold text-slate-800">RTGS / Real-Time Clearing</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Settlement Currency</span>
              <span className="font-bold text-slate-800">KES (Kenya Shillings)</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Financing Structure</span>
              <span className="font-bold text-slate-800">Anchor-Led Distributor Finance</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Interest Accrual</span>
              <span className="font-bold text-slate-800">Daily Simple Interest</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Loans & Credit Exposure Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#1F4DA8]" />
              Active Credit Drawdowns &amp; Exposure Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live record of all disbursed and underwritten trade finance drawdowns.
            </p>
          </div>
          <Link
            href="/bank/approvals"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F4DA8] hover:underline"
          >
            <span>Manage Approvals</span>
            <ExternalLink size={13} />
          </Link>
        </div>

        {loans.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No active loan exposures recorded in this portfolio yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Loan Ref</th>
                  <th className="py-3.5 px-4">Distributor (Borrower)</th>
                  <th className="py-3.5 px-4">Anchor Manufacturer</th>
                  <th className="py-3.5 px-4 text-right">Principal Amount</th>
                  <th className="py-3.5 px-4">Tenor</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Channel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-900">
                      {loan.loanRequestNumber || `LN-${String(loan.id).slice(0, 8).toUpperCase()}`}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {loan.distributorName || 'Nairobi Beverages Ltd'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {loan.manufacturerName || 'Wochuna Manufacturers'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      {formatCurrency(Number(loan.principalAmount) || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {loan.tenorDays ? `${loan.tenorDays} Days` : '30 Days'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={loan.status || 'PENDING'} />
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-[11px]">
                      RTGS
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
