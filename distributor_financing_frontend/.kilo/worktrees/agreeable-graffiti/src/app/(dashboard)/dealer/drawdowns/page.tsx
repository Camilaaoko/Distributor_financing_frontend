'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Coins,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Search,
  Filter,
  ShieldCheck,
  TrendingUp,
  Receipt,
  FileText,
  Percent,
  Sparkles,
  RefreshCw,
  XCircle,
  Eye,
  Building2,
  Factory,
  ArrowUpDown,
  Calendar,
  Wallet,
} from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { useAuth } from '@/hooks/useAuth';
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
import { getErrorMessage } from '@/lib/errors';

export default function DistributorDrawdownsPage() {
  const auth = useAuth();
  const distributorId = auth?.user?.bankId || auth?.user?.email || 'dist_01';

  const [profile, setProfile] = useState<DistributorLoanProfileResponse | null>(null);
  const [loans, setLoans] = useState<LoanRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'REJECTED'>('ALL');

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanRequestResponse | null>(null);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);

  const loadDrawdowns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, loansRes] = await Promise.all([
        distributorLoanProfilesApi.getProfileByDistributorId(distributorId).catch(() => null),
        loanRequestsApi.getLoanRequestsByDistributor(distributorId).catch(() => []),
      ]);

      const rawProfile = (profileRes as any)?.result || profileRes;
      const rawLoans = (loansRes as any)?.result || loansRes;

      setProfile(rawProfile);
      setLoans(Array.isArray(rawLoans) ? rawLoans : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load distributor drawdowns ledger.'));
    } finally {
      setIsLoading(false);
    }
  }, [distributorId]);

  useEffect(() => {
    loadDrawdowns();
  }, [loadDrawdowns]);

  const handleInspectLoan = (loan: LoanRequestResponse) => {
    setSelectedLoan(loan);
    setIsBreakdownModalOpen(true);
  };

  // Filter and search logic
  const filteredLoans = loans.filter((loan) => {
    const normStatus = (loan.status || '').toUpperCase();

    // Status filter
    if (statusFilter === 'ACTIVE') {
      if (normStatus !== 'DISBURSED' && normStatus !== 'APPROVED' && normStatus !== 'PROCESSING') return false;
    } else if (statusFilter === 'PENDING') {
      if (normStatus !== 'PENDING' && normStatus !== 'PENDING_MANUFACTURER_CONFIRMATION' && normStatus !== 'CHECKER_APPROVED') return false;
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

  const totalCreditLimit = profile?.creditLimit ?? 10000000;
  const utilizedCredit = profile?.utilizedAmount ?? 0;
  const availableCredit = profile?.availableCredit ?? Math.max(0, totalCreditLimit - utilizedCredit);

  // Status counts
  const countAll = loans.length;
  const countActive = loans.filter((l) => l.status === 'DISBURSED' || l.status === 'APPROVED' || l.status === 'PROCESSING').length;
  const countPending = loans.filter((l) => l.status === 'PENDING' || l.status === 'PENDING_MANUFACTURER_CONFIRMATION' || l.status === 'CHECKER_APPROVED').length;
  const countCompleted = loans.filter((l) => l.status === 'COMPLETED').length;
  const countOverdue = loans.filter((l) => l.status === 'OVERDUE').length;

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financing & Drawdowns Ledger</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#1F4DA8] border border-blue-200">
              Closed-Loop Trade Lines
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Request, track, and manage inventory financing drawdowns against anchor manufacturer purchase orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDrawdowns}
            disabled={isLoading}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 shadow-xs flex items-center gap-2 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsApplyModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F4DA8] hover:bg-[#1A3F8A] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>New Financing Request</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700 text-xs font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <p>{error}</p>
        </div>
      )}

      {/* REVOLVING CREDIT METER */}
      <CreditLimitMeter
        profile={profile}
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
              { id: 'ACTIVE', label: 'Active / In-Flight', count: countActive },
              { id: 'PENDING', label: 'Pending Approval', count: countPending },
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
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
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
              placeholder="Search PO, invoice, supplier..."
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
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(true)}
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[#1F4DA8] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1A3F8A] transition-colors cursor-pointer"
            >
              <PlusCircle size={15} /> Apply for Financing
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Loan Ref / PO #</th>
                  <th className="py-3 px-3">Anchor Supplier</th>
                  <th className="py-3 px-3">Principal (KES)</th>
                  <th className="py-3 px-3">Tenor & Due Date</th>
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

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{loan.loanRequestNumber || `LR-${loan.id}`}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          PO: {loan.purchaseOrderNumber || 'N/A'} {loan.invoiceNumber ? `• Inv: ${loan.invoiceNumber}` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800">{loan.manufacturerName || 'Anchor Supplier'}</div>
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
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            loan.status === 'DISBURSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : loan.status === 'APPROVED' || loan.status === 'PROCESSING'
                              ? 'bg-blue-100 text-[#1F4DA8]'
                              : loan.status === 'PENDING' || loan.status === 'PENDING_MANUFACTURER_CONFIRMATION' || loan.status === 'CHECKER_APPROVED'
                              ? 'bg-amber-100 text-amber-800'
                              : loan.status === 'COMPLETED'
                              ? 'bg-slate-100 text-slate-700'
                              : loan.status === 'OVERDUE'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {loan.status?.replace(/_/g, ' ') || 'Pending'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleInspectLoan(loan)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1F4DA8] hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye size={13} /> View
                        </button>
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
        distributorId={distributorId}
        availableCredit={availableCredit}
        onSuccess={loadDrawdowns}
      />

      <LoanBreakdownModal
        loan={selectedLoan}
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        onCancelled={loadDrawdowns}
      />
    </div>
  );
}