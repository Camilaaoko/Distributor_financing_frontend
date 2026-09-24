'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  PlusCircle,
  Factory,
  Landmark,
  ShieldCheck,
  ChevronDown,
  RefreshCw,
  Coins,
  ArrowUpRight,
  Eye,
  Sparkles,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { distributorApi, bankOnboardingApi } from '@/services/onboarding-api.service';
import {
  loanRequestsApi,
  distributorLoanProfilesApi,
} from '@/services/loans-api.service';
import type {
  ManufacturerResponse,
  BankResponse,
} from '@/types/onboarding';
import type {
  DistributorLoanProfileResponse,
  LoanRequestResponse,
} from '@/types/loans';
import { CreditLimitMeter } from '@/components/distributor/CreditLimitMeter';
import { DrawdownApplicationModal } from '@/components/distributor/DrawdownApplicationModal';
import { LoanBreakdownModal } from '@/components/distributor/LoanBreakdownModal';
import { DistributorTierBadge } from '@/components/distributor/DistributorTierBadge';
import { getTierFromCreditScore } from '@/lib/tiers';
import { getErrorMessage } from '@/lib/errors';
import { resolveDistributorContext } from '@/lib/distributor-resolver';
import { enrichLoanRequests, fetchEntityNameMaps } from '@/lib/entity-names';

export default function DistributorDashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const {
    roleName,
    canApplyFinancing,
    canApproveDistributorLoan,
  } = usePermissions();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Core Live State
  const [profile, setProfile] = useState<DistributorLoanProfileResponse | null>(null);
  const [loans, setLoans] = useState<LoanRequestResponse[]>([]);
  const [workingManufacturers, setWorkingManufacturers] = useState<ManufacturerResponse[]>([]);
  const [partnerBanks, setPartnerBanks] = useState<BankResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanRequestResponse | null>(null);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);

  // Resolved distributor entity ID
  const [resolvedDistributorId, setResolvedDistributorId] = useState<string>(() => {
    const userEmail = auth?.user?.email?.toLowerCase().trim();
    if (userEmail && typeof window !== 'undefined') {
      const userScoped = localStorage.getItem(`dfp_dist_id_${userEmail}`);
      if (userScoped && !userScoped.includes('@')) return userScoped;
    }
    const fromAuth = auth?.user?.distributorId;
    return fromAuth && !fromAuth.includes('@') ? fromAuth : '';
  });

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userEmail = auth?.user?.email || '';
      let distId = resolvedDistributorId && !resolvedDistributorId.includes('@') ? resolvedDistributorId : '';

      // If not yet resolved, perform canonical resolution first
      if (!distId && userEmail) {
        try {
          const ctx = await resolveDistributorContext(userEmail, auth?.user?.distributorId);
          if (ctx.distributorId && !ctx.distributorId.includes('@')) {
            distId = ctx.distributorId;
            setResolvedDistributorId(ctx.distributorId);
          }
        } catch {
          // continue
        }
      }

      const [profileRes, loansRes, mfgData, banksData, nameMaps] = await Promise.all([
        distId ? distributorLoanProfilesApi.getProfileByDistributorId(distId).catch(() => null) : null,
        distId ? loanRequestsApi.getLoanRequestsByDistributor(distId).catch(() => []) : [],
        distributorApi.getWorkingManufacturers().catch(() => []),
        bankOnboardingApi.getBanksByStatus('ACTIVE').catch(() => []),
        fetchEntityNameMaps().catch(() => ({ distributors: new Map(), manufacturers: new Map() })),
      ]);

      const rawProfile = (profileRes as any)?.result || profileRes;
      const loansResult = (loansRes as any)?.result ?? (loansRes as any)?.data ?? loansRes;
      const rawLoans = Array.isArray(loansResult)
        ? loansResult
        : Array.isArray(loansResult?.content)
        ? loansResult.content
        : [];

      const defaultMfg = mfgData?.[0]?.name || (mfgData?.[0] as any)?.companyName || 'Wochuna Manufacturers';
      const enrichedLoans = enrichLoanRequests(rawLoans, nameMaps, defaultMfg);

      console.log('[DISTRIBUTOR_IDENTITY] Dashboard loaded:', {
        authenticatedUserId: auth?.user?.userId,
        authenticatedUsername: auth?.user?.username,
        authenticatedEmail: auth?.user?.email,
        resolvedDistributorId: distId,
        loanProfileDistributorId: rawProfile?.distributorId,
        creditLimit: rawProfile?.creditLimit,
      });

      setProfile(rawProfile || null);
      setLoans(enrichedLoans);
      setWorkingManufacturers(mfgData || []);
      setPartnerBanks(banksData || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load distributor dashboard data.'));
    } finally {
      setIsLoading(false);
    }
  }, [resolvedDistributorId, auth?.user?.email, auth?.user?.distributorId, auth?.user?.userId, auth?.user?.username]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    if (auth?.logout) {
      auth.logout();
    }
    router.push('/login');
  };

  const handleInspectLoan = (loan: LoanRequestResponse) => {
    setSelectedLoan(loan);
    setIsBreakdownModalOpen(true);
  };

  // Credit is utilized only once funds have actually been disbursed. A bank
  // approval reserves no utilization until the remittance is completed.
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

  const rawLimit = profile?.creditLimit ?? 0;
  const creditLimit = rawLimit > 0 ? rawLimit : (activeLoansUtilized > 0 ? 5000000 : 0);
  const utilizedCredit = activeLoansUtilized;
  const availableCredit = creditLimit > 0 ? Math.max(0, creditLimit - utilizedCredit) : 0;

  // Count only loans that have reached an actual disbursement state.
  const activeLoansCount = loans.filter((l) => {
    const s = (l.status || '').toUpperCase();
    return s === 'DISBURSED' || s === 'ACTIVE' || s === 'PARTIALLY_DISBURSED' || s === 'PARTIALLY_REPAID';
  }).length;

  const pendingCheckerLoansCount = loans.filter((l) => {
    const s = (l.status || '').toUpperCase();
    return s === 'PENDING' || s === 'PENDING_INTERNAL_APPROVAL';
  }).length;

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Distributor Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#1F4DA8] border border-blue-200">
              {roleName || 'Commercial Portal'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage partner bank credit lines, anchor manufacturer supply chains, and inventory drawdowns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 shadow-xs flex items-center gap-2 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {canApplyFinancing && (
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F4DA8] hover:bg-[#1A3F8A] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>Request Financing</span>
            </button>
          )}

          <NotificationBell />

          {/* USER PROFILE DROPDOWN */}
          <div className="relative pl-2 border-l border-slate-200" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-[#1F4DA8] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {(auth?.user?.username ? auth.user.username.charAt(0) : (auth?.user?.email ? auth.user.email.charAt(0) : 'D')).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-800">{auth?.user?.username || roleName}</div>
                <div className="text-[10px] text-slate-500 font-medium">{roleName}</div>
                <div className="mt-0.5">
                  <DistributorTierBadge
                    tier={getTierFromCreditScore(profile?.creditScore)}
                    creditScore={profile?.creditScore}
                    size="xs"
                  />
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 text-xs divide-y divide-slate-100">
                <div className="px-3.5 py-2 space-y-1">
                  <p className="font-semibold text-slate-900">{auth?.user?.username || 'Distributor User'}</p>
                  <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                    {roleName}
                  </span>
                  {auth?.user?.email && <p className="text-[11px] text-slate-500 truncate">{auth.user.email}</p>}
                </div>

                <div className="py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700 text-xs font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <p>{error}</p>
        </div>
      )}

      {/* CHECKER PENDING ACTIONS BANNER */}
      {canApproveDistributorLoan && pendingCheckerLoansCount > 0 && (
        <div className="bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="font-bold text-indigo-950">
                Action Required: {pendingCheckerLoansCount} loan {pendingCheckerLoansCount === 1 ? 'request requires' : 'requests require'} your Distributor Checker sign-off
              </h4>
              <p className="text-slate-600">
                Review maker-submitted purchase order financing terms and authorize transmission to the bank.
              </p>
            </div>
          </div>
          <Link
            href="/dealer/drawdowns"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Review in Ledger</span> &rarr;
          </Link>
        </div>
      )}

      {/* TOP ROW: REVOLVING CREDIT LIMIT METER & TIER STANDING CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <CreditLimitMeter
            profile={profile}
            loans={loans}
            isLoading={isLoading}
            onRefreshed={loadDashboardData}
          />
        </div>

        {/* TIER PRIVILEGES & STANDING CARD ON TOP */}
        <div className="lg:col-span-1 flex">
          <Card className="w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/30 text-white shadow-md rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {getTierFromCreditScore(profile?.creditScore) === 'PLATINUM' ? 'Platinum VIP Standing' : `${getTierFromCreditScore(profile?.creditScore)} Tier Standing`}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {profile?.creditScore ? `Score: ${profile.creditScore} • Preferred Underwriting` : 'Baseline Line Standing'}
                    </p>
                  </div>
                </div>
                <DistributorTierBadge
                  tier={getTierFromCreditScore(profile?.creditScore)}
                  creditScore={profile?.creditScore}
                  size="xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Advance Rate</span>
                  <div className="text-base font-black text-indigo-300">
                    {getTierFromCreditScore(profile?.creditScore) === 'PLATINUM' ? '90%' : getTierFromCreditScore(profile?.creditScore) === 'GOLD' ? '80%' : '70%'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Disbursal SLA</span>
                  <div className="text-xs font-bold text-emerald-400 truncate">
                    {getTierFromCreditScore(profile?.creditScore) === 'PLATINUM' ? 'Instant Automated' : '2-Hour Review'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                {profile?.creditScore && profile.creditScore >= 800 ? 'Top Tier Achieved' : 'Score ≥ 800 for Platinum'}
              </span>
              <Link
                href="/dealer/profile"
                className="text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Full Tier Perks</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* 4 SUMMARY STAT TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Available Headroom</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            KES {availableCredit.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Ready for instant drawdowns</p>
        </div>

        <Link href="/dealer/drawdowns" className="group block">
          <div className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-5 space-y-1 hover:border-[#1F4DA8] hover:shadow-md transition-all h-full">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-[#1F4DA8]">Active Drawdowns</span>
              <div className="p-1.5 rounded-lg bg-blue-50 text-[#1F4DA8] group-hover:bg-[#1F4DA8] group-hover:text-white transition-colors">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{activeLoansCount}</div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center justify-between">
              <span>Outstanding trade loans</span>
              <span className="text-[#1F4DA8]">View &rarr;</span>
            </p>
          </div>
        </Link>

        <Link href="/dealer/manufacturers" className="group block">
          <div className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-5 space-y-1 hover:border-amber-500 hover:shadow-md transition-all h-full">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-amber-700">Anchor Manufacturers</span>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Factory className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{workingManufacturers.length}</div>
            <p className="text-[11px] text-amber-700 font-semibold flex items-center justify-between">
              <span>Partner manufacturers</span>
              <span>View &rarr;</span>
            </p>
          </div>
        </Link>

        <Link href="/dealer/banks" className="group block">
          <div className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-5 space-y-1 hover:border-indigo-600 hover:shadow-md transition-all h-full">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-indigo-700">Partner Banks</span>
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{partnerBanks.length}</div>
            <p className="text-[11px] text-indigo-700 font-semibold flex items-center justify-between">
              <span>Liquidity providers</span>
              <span>View &rarr;</span>
            </p>
          </div>
        </Link>
      </div>

      {/* MAIN TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Recent Financing Requests & Drawdowns */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Financing Applications</h3>
                <p className="text-xs text-slate-500 mt-0.5">Track your trade credit requests through the closed-loop lifecycle</p>
              </div>
              <Link href="/dealer/drawdowns" className="text-xs font-bold text-[#1F4DA8] hover:underline flex items-center gap-1">
                View Ledger &rarr;
              </Link>
            </div>

            {loans.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 p-4">
                <Coins size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No financing requests submitted yet</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  Apply for trade credit to fund purchase orders directly to your anchor manufacturers.
                </p>
                {canApplyFinancing && (
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(true)}
                    className="inline-flex items-center gap-1.5 mt-3.5 px-3.5 py-1.5 bg-[#1F4DA8] text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-[#1A3F8A] transition-colors cursor-pointer"
                  >
                    <PlusCircle size={14} /> Request Financing
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[500px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Loan Reference</th>
                      <th className="py-2.5 px-3">Anchor Manufacturer</th>
                      <th className="py-2.5 px-3">Principal (KES)</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {loans.slice(0, 5).map((l) => {
                      const normStatus = (l.status || '').toUpperCase();
                      const isAwaitingChecker = normStatus === 'PENDING' || normStatus === 'PENDING_INTERNAL_APPROVAL' || normStatus === 'INTERNAL_REVIEW';
                      const isCheckerApproved = normStatus === 'CHECKER_APPROVED' || normStatus === 'APPROVED_BY_CHECKER' || normStatus === 'INTERNAL_APPROVED';
                      const isBankReview = normStatus === 'PENDING_BANK_APPROVAL' || normStatus === 'BANK_REVIEW' || normStatus === 'UNDER_REVIEW';
                      const isApproved = normStatus === 'APPROVED' || normStatus === 'BANK_APPROVED' || normStatus === 'FACILITY_APPROVED' || normStatus === 'PROCESSING';
                      const isDisbursed = normStatus === 'DISBURSED' || normStatus === 'ACTIVE' || normStatus === 'PARTIALLY_DISBURSED';
                      const isSettled = normStatus === 'COMPLETED' || normStatus === 'REPAID' || normStatus === 'SETTLED' || normStatus === 'CLOSED';

                      return (
                        <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{l.loanRequestNumber || `LR-${l.id}`}</div>
                            <div className="text-[10px] text-slate-400 font-mono">PO: {l.purchaseOrderNumber || 'N/A'}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-800">
                            {l.manufacturerName || 'Anchor Partner'}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {l.principalAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                isDisbursed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isApproved
                                  ? 'bg-blue-100 text-[#1F4DA8]'
                                  : isBankReview
                                  ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                  : isCheckerApproved
                                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                  : isAwaitingChecker
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : isSettled
                                  ? 'bg-slate-100 text-slate-700'
                                  : normStatus === 'OVERDUE'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {isCheckerApproved
                                ? 'Checker Approved'
                                : isBankReview
                                ? 'Under Bank Review'
                                : isApproved
                                ? 'Bank Approved'
                                : isDisbursed
                                ? 'Disbursed'
                                : isSettled
                                ? 'Repaid / Closed'
                                : isAwaitingChecker
                                ? 'Pending Checker'
                                : l.status?.replace(/_/g, ' ') || 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              {canApproveDistributorLoan && isAwaitingChecker && (
                                <button
                                  type="button"
                                  onClick={() => handleInspectLoan(l)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                  title="Review and Authorize"
                                >
                                  <ShieldCheck size={12} /> Sign-off
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleInspectLoan(l)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1F4DA8] hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye size={12} /> Inspect
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT: Connected Anchor Manufacturers & Partner Banks */}
        <div className="space-y-6">

          {/* ANCHOR MANUFACTURERS CARD */}
          <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Anchor Manufacturers</h3>
                <p className="text-xs text-slate-500 mt-0.5">Approved anchor enterprises for purchase order financing</p>
              </div>
              <Link href="/dealer/manufacturers" className="text-xs font-bold text-[#1F4DA8] hover:underline">
                View All
              </Link>
            </div>

            {workingManufacturers.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No anchor manufacturers linked yet.
              </div>
            ) : (
              <div className="space-y-3">
                {workingManufacturers.slice(0, 4).map((m) => (
                  <div key={m.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{m.name}</div>
                      <div className="text-[10px] text-slate-500">{m.location || 'Anchor Partner'}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Active Partner
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* PARTNER BANKS CARD */}
          <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Partner Banks</h3>
                <p className="text-xs text-slate-500 mt-0.5">Trade finance liquidity desks</p>
              </div>
              <Link href="/dealer/banks" className="text-xs font-bold text-[#1F4DA8] hover:underline">
                All Banks
              </Link>
            </div>

            {partnerBanks.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No partner banks configured.
              </div>
            ) : (
              <div className="space-y-3">
                {partnerBanks.slice(0, 3).map((b) => (
                  <div key={b.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{b.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Code: {b.bankCode}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* MODALS */}
      <DrawdownApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        distributorId={resolvedDistributorId || auth?.user?.email || ''}
        availableCredit={availableCredit}
        creditScore={profile?.creditScore}
        tier={getTierFromCreditScore(profile?.creditScore)}
        maxFinancingPercentage={profile?.maxFinancingPercentage}
        onSuccess={loadDashboardData}
      />

      <LoanBreakdownModal
        loan={selectedLoan}
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        onCancelled={loadDashboardData}
        onAuthorized={loadDashboardData}
      />
    </div>
  );
}
