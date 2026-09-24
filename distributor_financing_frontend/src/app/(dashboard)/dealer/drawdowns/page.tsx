'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Coins,
  Clock,
  AlertCircle,
  PlusCircle,
  Search,
  RefreshCw,
  Eye,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { RoleSwitcher } from '@/components/dashboard/RoleSwitcher';
import {
  loanRequestsApi,
  distributorLoanProfilesApi,
} from '@/services/loans-api.service';
import type {
  LoanRequestResponse,
  DistributorLoanProfileResponse,
} from '@/types/loans';
import { CreditLimitMeter } from '@/components/distributor/CreditLimitMeter';
import { DrawdownApplicationModal } from '@/components/distributor/DrawdownApplicationModal';
import { LoanBreakdownModal } from '@/components/distributor/LoanBreakdownModal';
import { getTierFromCreditScore } from '@/lib/tiers';
import { resolveDistributorContext } from '@/lib/distributor-resolver';
import { getErrorMessage } from '@/lib/errors';
import { enrichLoanRequests, fetchEntityNameMaps } from '@/lib/entity-names';

export default function DistributorDrawdownsPage() {
  const auth = useAuth();
  const {
    canApplyFinancing,
    canApproveDistributorLoan,
  } = usePermissions();

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

  const [profile, setProfile] = useState<DistributorLoanProfileResponse | null>(null);
  const [loans, setLoans] = useState<LoanRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEEDS_CHECKER' | 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'REJECTED'>('ALL');

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanRequestResponse | null>(null);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);

  const loadDrawdowns = useCallback(async () => {
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

      const [profileRes, loansRes, nameMaps] = await Promise.all([
        distId ? distributorLoanProfilesApi.getProfileByDistributorId(distId).catch(() => null) : null,
        distId ? loanRequestsApi.getLoanRequestsByDistributor(distId).catch(() => []) : [],
        fetchEntityNameMaps().catch(() => ({ distributors: new Map(), manufacturers: new Map() })),
      ]);

      const rawProfile = (profileRes as any)?.result || profileRes;
      const loansResult = (loansRes as any)?.result ?? (loansRes as any)?.data ?? loansRes;
      const rawLoans = Array.isArray(loansResult)
        ? loansResult
        : Array.isArray(loansResult?.content)
        ? loansResult.content
        : [];

      const enriched = enrichLoanRequests(rawLoans, nameMaps, 'Wochuna Manufacturers');

      console.log('[DISTRIBUTOR_IDENTITY] Drawdowns ledger loaded:', {
        authenticatedUserId: auth?.user?.userId,
        authenticatedUsername: auth?.user?.username,
        authenticatedEmail: auth?.user?.email,
        resolvedDistributorId: distId,
        loanProfileDistributorId: rawProfile?.distributorId,
        creditLimit: rawProfile?.creditLimit,
      });

      setProfile(rawProfile);
      setLoans(enriched);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load distributor drawdowns ledger.'));
    } finally {
      setIsLoading(false);
    }
  }, [resolvedDistributorId, auth?.user?.email, auth?.user?.distributorId, auth?.user?.userId, auth?.user?.username]);

  useEffect(() => {
    loadDrawdowns();
  }, [loadDrawdowns]);

  const handleInspectLoan = (loan: LoanRequestResponse) => {
    setSelectedLoan(loan);
    setIsBreakdownModalOpen(true);
  };

  const handleLoanAuthorized = (updatedLoan: LoanRequestResponse) => {
    setLoans((prev) =>
      prev.map((item) => (item.id === updatedLoan.id ? updatedLoan : item))
    );
    loadDrawdowns();
  };

  // Filter and search logic
  const filteredLoans = loans.filter((loan) => {
    const normStatus = (loan.status || '').toUpperCase();

    // Status filter
    if (statusFilter === 'NEEDS_CHECKER') {
      if (normStatus !== 'PENDING' && normStatus !== 'PENDING_INTERNAL_APPROVAL') return false;
    } else if (statusFilter === 'ACTIVE') {
      if (normStatus !== 'DISBURSED' && normStatus !== 'APPROVED' && normStatus !== 'PROCESSING') return false;
    } else if (statusFilter === 'PENDING') {
      if (normStatus !== 'PENDING_MANUFACTURER_CONFIRMATION' && normStatus !== 'CHECKER_APPROVED') return false;
    } else if (statusFilter === 'COMPLETED') {
      if (normStatus !== 'COMPLETED') return false;
    } else if (statusFilter === 'OVERDUE') {
      if (normStatus !== 'OVERDUE') return false;
    } else if (statusFilter === 'REJECTED') {
      if (normStatus !== 'REJECTED' && normStatus !== 'CANCELLED') return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const numMatch = (loan.loanRequestNumber || `LR-${loan.id}`).toLowerCase().includes(query);
      const mfgMatch = (loan.manufacturerName || '').toLowerCase().includes(query);
      const poMatch = (loan.purchaseOrderNumber || '').toLowerCase().includes(query);
      const invMatch = (loan.invoiceNumber || '').toLowerCase().includes(query);
      if (!numMatch && !mfgMatch && !poMatch && !invMatch) return false;
    }

    return true;
  });

  const totalCreditLimit = profile?.creditLimit ?? 0;
  const utilizedCredit = profile?.utilizedAmount ?? 0;
  const availableCredit = profile?.availableCredit ?? Math.max(0, totalCreditLimit - utilizedCredit);

  // Status counts
  const countAll = loans.length;
  const countNeedsChecker = loans.filter((l) => (l.status || '').toUpperCase() === 'PENDING' || (l.status || '').toUpperCase() === 'PENDING_INTERNAL_APPROVAL').length;
  const countActive = loans.filter((l) => ['DISBURSED', 'APPROVED', 'PROCESSING'].includes((l.status || '').toUpperCase())).length;
  const countPending = loans.filter((l) => ['PENDING_MANUFACTURER_CONFIRMATION', 'CHECKER_APPROVED'].includes((l.status || '').toUpperCase())).length;
  const countCompleted = loans.filter((l) => (l.status || '').toUpperCase() === 'COMPLETED').length;
  const countOverdue = loans.filter((l) => (l.status || '').toUpperCase() === 'OVERDUE').length;

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financing &amp; Drawdowns Ledger</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#1F4DA8] border border-blue-200">
              Closed-Loop Trade Lines
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Request, track, and manage inventory financing drawdowns against anchor manufacturer purchase orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sub-role Switcher (Maker vs Checker simulation) */}
          <RoleSwitcher />

          <button
            onClick={loadDrawdowns}
            disabled={isLoading}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 shadow-xs flex items-center gap-2 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* New Request Button (Available for Maker & Admin) */}
          {canApplyFinancing && (
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F4DA8] hover:bg-[#1A3F8A] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>New Financing Request</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700 text-xs font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <p>{error}</p>
        </div>
      )}

      {/* CHECKER NOTICE BANNER IF PENDING ITEMS EXIST */}
      {canApproveDistributorLoan && countNeedsChecker > 0 && (
        <div className="bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h4 className="font-bold text-indigo-950">
                You have {countNeedsChecker} financing {countNeedsChecker === 1 ? 'request' : 'requests'} requiring your Checker Sign-off
              </h4>
              <p className="text-slate-600">
                Review loan details and legally authorize submission to the partner bank.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('NEEDS_CHECKER')}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            View Pending Requests ({countNeedsChecker})
          </button>
        </div>
      )}

      {/* REVOLVING CREDIT METER */}
      <CreditLimitMeter
        profile={profile}
        loans={loans}
        isLoading={isLoading}
        onRefreshed={loadDrawdowns}
      />

      {/* SEARCH, STATUS TABS & CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Requests', count: countAll },
              { id: 'NEEDS_CHECKER', label: 'Needs Checker Sign-off', count: countNeedsChecker, highlight: countNeedsChecker > 0 },
              { id: 'ACTIVE', label: 'Active / In-Flight', count: countActive },
              { id: 'PENDING', label: 'Bank & Mfr Review', count: countPending },
              { id: 'COMPLETED', label: 'Settled', count: countCompleted },
              { id: 'OVERDUE', label: 'Overdue', count: countOverdue },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-[#1F4DA8] text-white shadow-xs'
                    : tab.highlight
                    ? 'bg-amber-100/70 text-amber-900 hover:bg-amber-200/70'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : tab.highlight
                    ? 'bg-amber-200 text-amber-900 font-black'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search PO, invoice, manufacturer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8]"
            />
          </div>
        </div>

        {/* DRAWDOWNS TABLE */}
        {isLoading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
            <Coins size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-700">No financing drawdowns matching your criteria</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Initiate a trade credit request against your active anchor manufacturer purchase orders.
            </p>
            {canApplyFinancing && (
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(true)}
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[#1F4DA8] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1A3F8A] transition-colors cursor-pointer"
              >
                <PlusCircle size={15} /> Apply for Financing
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Loan Ref / PO #</th>
                  <th className="py-3 px-3">Anchor Manufacturer</th>
                  <th className="py-3 px-3">Principal (KES)</th>
                  <th className="py-3 px-3">Tenor &amp; Due Date</th>
                  <th className="py-3 px-3">Repayable Total</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLoans.map((loan) => {
                  const principal = loan.principalAmount || 0;
                  const interest = loan.totalInterest || Math.round(principal * 0.025);
                  const totalDue = loan.totalRepayable || (principal + interest);
                  const normStatus = (loan.status || '').toUpperCase();
                  const isAwaitingChecker = normStatus === 'PENDING' || normStatus === 'PENDING_INTERNAL_APPROVAL' || normStatus === 'INTERNAL_REVIEW';
                  const isCheckerApproved = normStatus === 'CHECKER_APPROVED' || normStatus === 'APPROVED_BY_CHECKER' || normStatus === 'INTERNAL_APPROVED';
                  const isBankReview = normStatus === 'PENDING_BANK_APPROVAL' || normStatus === 'BANK_REVIEW' || normStatus === 'UNDER_REVIEW';
                  const isApproved = normStatus === 'APPROVED' || normStatus === 'BANK_APPROVED' || normStatus === 'FACILITY_APPROVED' || normStatus === 'PROCESSING';
                  const isDisbursed = normStatus === 'DISBURSED' || normStatus === 'ACTIVE' || normStatus === 'PARTIALLY_DISBURSED';
                  const isSettled = normStatus === 'COMPLETED' || normStatus === 'REPAID' || normStatus === 'SETTLED' || normStatus === 'CLOSED';

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{loan.loanRequestNumber || `LR-${loan.id}`}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          PO: {loan.purchaseOrderNumber || 'N/A'} {loan.invoiceNumber ? `• Inv: ${loan.invoiceNumber}` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800">{loan.manufacturerName || 'Anchor Partner'}</div>
                        <div className="text-[10px] text-slate-400">{loan.financingModelName || 'Revolving Facility'}</div>
                      </td>

                      <td className="py-3.5 px-3 font-black text-slate-900">
                        KES {principal.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{loan.tenorDays || 30} Days</div>
                        <div className="text-[10px] text-indigo-700 font-medium">
                          {loan.dueDate ? `Due: ${new Date(loan.dueDate).toLocaleDateString()}` : 'Pending Sanction'}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-indigo-900">KES {totalDue.toLocaleString()}</span>
                        <div className="text-[10px] text-slate-400">Single Bullet</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
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
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isAwaitingChecker && <Clock size={11} className="animate-pulse" />}
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
                            ? 'Pending Checker Sign-off'
                            : loan.status?.replace(/_/g, ' ') || 'Pending'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Checker Quick Authorize Button */}
                          {canApproveDistributorLoan && isAwaitingChecker && (
                            <button
                              type="button"
                              onClick={() => handleInspectLoan(loan)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Review and Authorize Request"
                            >
                              <ShieldCheck size={13} /> Sign-off
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleInspectLoan(loan)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1F4DA8] hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye size={13} /> View
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
        onSuccess={loadDrawdowns}
      />

      <LoanBreakdownModal
        loan={selectedLoan}
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        onCancelled={loadDrawdowns}
        onAuthorized={handleLoanAuthorized}
      />
    </div>
  );
}
