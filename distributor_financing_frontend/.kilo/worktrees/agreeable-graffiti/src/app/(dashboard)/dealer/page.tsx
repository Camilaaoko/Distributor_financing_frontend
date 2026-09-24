'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  Wallet,
  Calendar,
  PlusCircle,
  Building2,
  Factory,
  Landmark,
  CheckCircle2,
  ShieldCheck,
  Search,
  User,
  LogOut,
  ChevronDown,
  RefreshCw,
  Users,
  Mail,
  AlertCircle,
  Coins,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { useAuth } from '@/hooks/useAuth';
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
import { getErrorMessage } from '@/lib/errors';

export default function DistributorDashboardPage() {
  const router = useRouter();
  const auth = useAuth();
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

  // Dynamic user identifier from authenticated session
  const distributorId =
    auth?.user?.bankId ||
    auth?.user?.id ||
    auth?.user?.email ||
    '';

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, loansRes, mfgData, banksData] = await Promise.all([
        distributorId ? distributorLoanProfilesApi.getProfileByDistributorId(distributorId).catch(() => null) : null,
        distributorId ? loanRequestsApi.getLoanRequestsByDistributor(distributorId).catch(() => []) : [],
        distributorApi.getWorkingManufacturers().catch(() => []),
        bankOnboardingApi.getBanksByStatus('ACTIVE').catch(() => []),
      ]);

      const rawProfile = (profileRes as any)?.result || profileRes;
      const rawLoans = (loansRes as any)?.result || loansRes;

      setProfile(rawProfile || null);
      setLoans(Array.isArray(rawLoans) ? rawLoans : []);
      setWorkingManufacturers(mfgData || []);
      setPartnerBanks(banksData || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load distributor dashboard data.'));
    } finally {
      setIsLoading(false);
    }
  }, [distributorId]);

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

  const creditLimit = profile?.creditLimit ?? 0;
  const utilizedCredit = profile?.utilizedAmount ?? 0;
  const availableCredit = profile?.availableCredit ?? (creditLimit > 0 ? Math.max(0, creditLimit - utilizedCredit) : 0);
  const activeLoansCount = loans.filter((l) => l.status === 'DISBURSED' || l.status === 'APPROVED' || l.status === 'PROCESSING').length;

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Distributor Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#1F4DA8] border border-blue-200">
              Commercial Portal
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
            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 shadow-2xs flex items-center gap-2 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
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
            <span>Request Financing</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700 text-xs font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <p>{error}</p>
        </div>
      )}

      {/* REVOLVING CREDIT LIMIT METER */}
      <CreditLimitMeter
        profile={profile}
        isLoading={isLoading}
        onRefreshed={loadDashboardData}
      />

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
              <span>Verified suppliers</span>
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
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(true)}
                  className="inline-flex items-center gap-1.5 mt-3.5 px-3.5 py-1.5 bg-[#1F4DA8] text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-[#1A3F8A] transition-colors cursor-pointer"
                >
                  <PlusCircle size={14} /> Request Financing
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[500px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Loan Reference</th>
                      <th className="py-2.5 px-3">Supplier</th>
                      <th className="py-2.5 px-3">Principal (KES)</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {loans.slice(0, 5).map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{l.loanRequestNumber || `LR-${l.id}`}</div>
                          <div className="text-[10px] text-slate-400 font-mono">PO: {l.purchaseOrderNumber || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-800">
                          {l.manufacturerName || 'Anchor Supplier'}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {l.principalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              l.status === 'DISBURSED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : l.status === 'APPROVED' || l.status === 'PROCESSING'
                                ? 'bg-blue-100 text-[#1F4DA8]'
                                : l.status === 'PENDING' || l.status === 'PENDING_MANUFACTURER_CONFIRMATION'
                                ? 'bg-amber-100 text-amber-800'
                                : l.status === 'OVERDUE'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {l.status?.replace(/_/g, ' ') || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleInspectLoan(l)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1F4DA8] hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye size={12} /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT: Connected Anchor Manufacturers & Partner Banks */}
        <div className="space-y-6">
          <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Anchor Manufacturers</h3>
                <p className="text-xs text-slate-500 mt-0.5">Verified suppliers eligible for invoice financing</p>
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
                      <div className="text-[10px] text-slate-500">{m.location || 'Anchor Supplier'}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Eligible
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

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
        distributorId={distributorId}
        availableCredit={availableCredit}
        onSuccess={loadDashboardData}
      />

      <LoanBreakdownModal
        loan={selectedLoan}
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        onCancelled={loadDashboardData}
      />
    </div>
  );
}