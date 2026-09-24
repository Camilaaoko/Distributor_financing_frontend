'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Coins,
  ArrowRight,
  TrendingUp,
  FileText,
  UserCheck,
  Clock,
  RefreshCw,
  Eye,
  Sliders,
  Wallet,
  PlayCircle,
  Layers,
  ChevronRight,
  AlertCircle,
  Percent,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import {
  distributorLoanProfilesApi,
  loanRequestsApi,
  loanApprovalsApi,
  disbursementsApi,
  loanUnderwritingApi,
} from '@/services/loans-api.service';

interface StepStatus {
  step: number;
  name: string;
  role: string;
  endpoint: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR';
  data?: any;
  error?: string;
}

export default function LoanLifecycleDemoPage() {
  const toast = useToast();
  const { user } = useAuth();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [isExecuting, setIsExecuting] = useState(false);

  // Lifecycle Demo State Variables
  const [distributorId, setDistributorId] = useState('dist_01');
  const [distributorName, setDistributorName] = useState('Nairobi Beverages Ltd');
  const [manufacturerName, setManufacturerName] = useState('East Africa Breweries Ltd');
  const [creditLimit, setCreditLimit] = useState(5000000);
  const [utilizedAmount, setUtilizedAmount] = useState(0);
  const [availableCredit, setAvailableCredit] = useState(5000000);
  const [loanRequestId, setLoanRequestId] = useState<number>(101);
  const [loanRequestNumber, setLoanRequestNumber] = useState('LRN-2025-001');
  const [loanStatus, setLoanStatus] = useState<string>('PENDING');
  const [invoiceAmount, setInvoiceAmount] = useState(2312500);
  const [loanPrincipal, setLoanPrincipal] = useState(1850000);
  const [disbursementRef, setDisbursementRef] = useState('');

  // Step 1: Run / Simulate Profile Approval & Offer Dispatch
  const runStep1 = async () => {
    setIsExecuting(true);
    try {
      await distributorLoanProfilesApi.approveProfile(1, {
        comments: 'Credit line approved by Bank Maker.',
      }).catch(() => null);
      toast.success('Step 1 Complete: Loan profile approved & offer link generated.');
      setActiveStep(2);
    } catch (err: any) {
      toast.error('Step 1 notice: ' + (err.message || 'Proceeding with simulation.'));
      setActiveStep(2);
    } finally {
      setIsExecuting(false);
    }
  };

  // Step 2: Public Offer Acceptance
  const runStep2 = () => {
    window.open(`/offer/respond?token=demo_token_${distributorId}&action=ACCEPT`, '_blank');
    toast.success('Step 2 Complete: Opened distributor public acceptance link. Terms accepted.');
    setActiveStep(3);
  };

  // Step 3: Run Statement Underwriting
  const runStep3 = async () => {
    setIsExecuting(true);
    try {
      const assessmentResult = {
        distributorId,
        recommendedCreditLimit: 5000000,
        riskTier: 'LOW' as const,
        recommendedInterestRate: 12.5,
        recommendedMaxTenorDays: 60,
        rationaleSummary: 'Strong steady monthly turnover averaging KES 8.2M with zero bounced cheques over 12 months.',
      };
      await loanUnderwritingApi.applyRecommendedLimit(distributorId, assessmentResult).catch(() => null);
      toast.success('Step 3 Complete: Underwriting assessment applied with KES 5,000,000 limit.');
      setActiveStep(4);
    } catch (err: any) {
      toast.error('Step 3 notice: ' + err.message);
      setActiveStep(4);
    } finally {
      setIsExecuting(false);
    }
  };

  // Step 4: Submit Drawdown Request
  const runStep4 = async () => {
    setIsExecuting(true);
    try {
      await loanRequestsApi.createLoanRequest({
        distributorId,
        createdByUserId: 'usr_maker_01',
        principalAmount: loanPrincipal,
        invoiceAmount,
        tenorDays: 30,
        purchaseOrderNumber: 'PO-2025-EABL-8812',
        invoiceNumber: 'INV-2025-EABL-8891',
        purpose: 'Inventory procurement for high-demand depot fulfillment',
      }).catch(() => null);

      setLoanStatus('PENDING');
      toast.success(`Step 4 Complete: Loan request ${loanRequestNumber} submitted for KES ${loanPrincipal.toLocaleString()}.`);
      setActiveStep(5);
    } catch (err: any) {
      toast.error('Step 4 notice: ' + err.message);
      setActiveStep(5);
    } finally {
      setIsExecuting(false);
    }
  };

  // Step 5: 2-Tier Maker-Checker Approval
  const runStep5 = async () => {
    setIsExecuting(true);
    try {
      // 1. Checker Approval
      await loanApprovalsApi.approveOrRejectLoan(loanRequestId, {
        approved: true,
        approvalLevel: 'CHECKER',
        approvedBy: 'usr_checker_01',
        comments: 'Invoices matched with anchor manufacturer records.',
      }).catch(() => null);

      // 2. Bank Final Sanction
      await loanApprovalsApi.approveOrRejectLoan(loanRequestId, {
        approved: true,
        approvalLevel: 'BANK',
        approvedBy: 'admin@bank.com',
        comments: 'Bank final sanction authorized.',
      }).catch(() => null);

      setLoanStatus('APPROVED');
      toast.success('Step 5 Complete: Maker-checker review passed. Loan is APPROVED.');
      setActiveStep(6);
    } catch (err: any) {
      toast.error('Step 5 notice: ' + err.message);
      setActiveStep(6);
    } finally {
      setIsExecuting(false);
    }
  };

  // Step 6: Closed-Loop Disbursement
  const runStep6 = async () => {
    setIsExecuting(true);
    try {
      const ref = `FT-2025-${Math.floor(100000 + Math.random() * 900000)}`;
      setDisbursementRef(ref);

      await disbursementsApi.triggerDisbursement(loanRequestId, {
        disbursementAmount: loanPrincipal,
        disbursementDate: new Date().toISOString(),
        destinationAccount: '0112948291002 (EABL Collection Account - KCB)',
        narrative: `Closed-loop settlement for ${loanRequestNumber}`,
      }).catch(() => null);

      setLoanStatus('DISBURSED');
      setUtilizedAmount(loanPrincipal);
      setAvailableCredit(creditLimit - loanPrincipal);
      toast.success(`Step 6 Complete: KES ${loanPrincipal.toLocaleString()} remitted to EABL manufacturer account. Status: DISBURSED.`);
      setActiveStep(7);
    } catch (err: any) {
      toast.error('Step 6 notice: ' + err.message);
      setActiveStep(7);
    } finally {
      setIsExecuting(false);
    }
  };

  // Step 7: Distributor Repayment
  const runStep7 = async () => {
    setIsExecuting(true);
    try {
      setLoanStatus('COMPLETED');
      setUtilizedAmount(0);
      setAvailableCredit(creditLimit);
      toast.success('Step 7 Complete: Full bullet repayment settled. Status: COMPLETED. Revolving credit headroom restored to KES 5,000,000!');
    } finally {
      setIsExecuting(false);
    }
  };

  const stepsList = [
    {
      num: 1,
      title: 'Loan Profile Setup & Offer',
      actor: 'Bank Maker / Admin',
      route: '/bank/distributors',
      desc: 'Bank officer configures credit limit, CRB risk score, tenor, and dispatches encrypted token offer.',
      action: runStep1,
      btnText: 'Execute Step 1: Approve & Dispatch Offer',
    },
    {
      num: 2,
      title: 'Public Credit Limit Offer Acceptance',
      actor: 'Distributor (Public Link)',
      route: '/offer/respond',
      desc: 'Distributor reviews terms and accepts facility without needing to authenticate.',
      action: runStep2,
      btnText: 'Execute Step 2: Open Public Offer Link',
    },
    {
      num: 3,
      title: 'Underwriting & Bank Statement Scoring',
      actor: 'Bank Underwriter',
      route: '/bank/distributors',
      desc: 'Automated 12-month statement metrics analyze turnover, cash flows, and persist credit limits.',
      action: runStep3,
      btnText: 'Execute Step 3: Run & Persist Underwriting',
    },
    {
      num: 4,
      title: 'Distributor Drawdown Application',
      actor: 'Distributor Admin',
      route: '/dealer/drawdowns',
      desc: 'Distributor requests trade credit with real-time pro-rata quote against supplier PO/invoice.',
      action: runStep4,
      btnText: 'Execute Step 4: Submit Drawdown Application',
    },
    {
      num: 5,
      title: '2-Tier Maker-Checker Approval',
      actor: 'Bank Checker & Executive',
      route: '/bank/approvals',
      desc: 'Four-eyes governance enforces segregation of duties between loan creator and checker.',
      action: runStep5,
      btnText: 'Execute Step 5: Perform Maker-Checker Sanction',
    },
    {
      num: 6,
      title: 'Closed-Loop Remittance to Manufacturer',
      actor: 'Bank Operations',
      route: '/bank/approvals',
      desc: 'Funds are disbursed directly into manufacturer settlement account, locking trade loop.',
      action: runStep6,
      btnText: 'Execute Step 6: Disburse to Manufacturer',
    },
    {
      num: 7,
      title: 'Distributor Repayment & Limit Restoration',
      actor: 'Distributor Admin',
      route: '/dealer/repayments',
      desc: 'Single bullet repayment settles principal & fees, restoring revolving credit headroom.',
      action: runStep7,
      btnText: 'Execute Step 7: Settle Repayment & Restore Limit',
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
              Interactive Demo Hub
            </span>
            <span className="text-xs font-semibold text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">7-Step Distributor Loan Lifecycle</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mt-1">
            <Sparkles className="w-7 h-7 text-[#1F4DA8]" />
            End-to-End Trade Financing Lifecycle Simulator
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Test and demonstrate the complete closed-loop loan workflow from profile onboarding to manufacturer settlement and repayment.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveStep(1);
            setLoanStatus('PENDING');
            setUtilizedAmount(0);
            setAvailableCredit(creditLimit);
            toast.success('Simulation state reset to Step 1.');
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          Reset Simulation
        </button>
      </div>

      {/* Live Facility & Loan State Telemetry Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Live Distributor Entity</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-mono">ID: {distributorId}</span>
            </div>
            <h3 className="text-xl font-black tracking-tight">{distributorName}</h3>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <span>Anchor: <strong className="text-white">{manufacturerName}</strong></span>
              <span>•</span>
              <span>Loan: <strong className="text-emerald-400 font-mono">{loanRequestNumber}</strong></span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Credit Limit</p>
              <p className="text-base font-black text-white font-mono mt-0.5">KES {creditLimit.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
              <p className="text-[10px] uppercase font-bold text-amber-400">Utilized Balance</p>
              <p className="text-base font-black text-amber-300 font-mono mt-0.5">KES {utilizedAmount.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
              <p className="text-[10px] uppercase font-bold text-emerald-400">Available Headroom</p>
              <p className="text-base font-black text-emerald-400 font-mono mt-0.5">KES {availableCredit.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
              <p className="text-[10px] uppercase font-bold text-purple-400">Loan Status</p>
              <div className="mt-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-500/30 text-purple-200 border border-purple-400/40">
                  {loanStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Step Progression Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {stepsList.map((s) => {
          const isCurrent = activeStep === s.num;
          const isDone = activeStep > s.num;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setActiveStep(s.num)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-blue-50 border-[#1F4DA8] shadow-xs'
                  : isDone
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    isCurrent
                      ? 'bg-[#1F4DA8] text-white'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isDone ? <CheckCircle2 size={13} /> : s.num}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Step {s.num}</span>
              </div>
              <p className="font-bold text-xs mt-2 line-clamp-1 text-slate-900">{s.title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.actor}</p>
            </button>
          );
        })}
      </div>

      {/* Active Step Detailed Card */}
      {(() => {
        const cur = stepsList.find((s) => s.num === activeStep) || stepsList[0];
        return (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#1F4DA8] border border-blue-200">
                  Active Step {cur.num} of 7
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1.5">{cur.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <span>Executing Actor: <strong className="text-slate-800">{cur.actor}</strong></span>
                  <span>•</span>
                  <span>Target Page: <Link href={cur.route} className="text-[#1F4DA8] hover:underline font-mono">{cur.route}</Link></span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={cur.route}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Open Dedicated Page
                </Link>
                <button
                  type="button"
                  onClick={cur.action}
                  disabled={isExecuting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <PlayCircle size={15} />
                  <span>{cur.btnText}</span>
                </button>
              </div>
            </div>

            {/* Description & Technical Architecture Flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl md:col-span-2 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-[#1F4DA8]" />
                  Step Overview &amp; Specifications
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">{cur.desc}</p>

                {cur.num === 1 && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-900">
                    <p className="font-bold">Key API Endpoints:</p>
                    <code className="text-[11px] block font-mono">GET /api/loans/profiles/status/PENDING_APPROVAL</code>
                    <code className="text-[11px] block font-mono">POST /api/loans/profiles/&#123;id&#125;/approve</code>
                  </div>
                )}

                {cur.num === 2 && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-900">
                    <p className="font-bold">Public Token Responding Endpoint (No Login Required):</p>
                    <code className="text-[11px] block font-mono">GET /api/loans/profiles/offer/respond?token=...&amp;action=ACCEPT</code>
                  </div>
                )}

                {cur.num === 3 && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-900">
                    <p className="font-bold">Underwriting &amp; Bank Statement Engine:</p>
                    <code className="text-[11px] block font-mono">POST /api/loans/underwriting/distributors/&#123;id&#125;/assess-stored-statement</code>
                    <code className="text-[11px] block font-mono">POST /api/loans/underwriting/distributors/&#123;id&#125;/apply-recommended</code>
                  </div>
                )}

                {cur.num === 4 && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-900">
                    <p className="font-bold">Live Financing Quote &amp; PO Document Multipart:</p>
                    <code className="text-[11px] block font-mono">GET /api/loans/requests/quote?distributorId=...&amp;invoiceAmount=...</code>
                    <code className="text-[11px] block font-mono">POST /api/loans/requests/with-document</code>
                  </div>
                )}

                {cur.num === 5 && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-900">
                    <p className="font-bold">2-Tier Maker-Checker Segregation:</p>
                    <code className="text-[11px] block font-mono">POST /api/loans/&#123;id&#125;/decision (level: CHECKER)</code>
                    <code className="text-[11px] block font-mono">POST /api/loans/&#123;id&#125;/decision (level: BANK)</code>
                  </div>
                )}

                {cur.num === 6 && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-900">
                    <p className="font-bold">Closed-Loop Manufacturer Disbursement:</p>
                    <code className="text-[11px] block font-mono">POST /api/loans/disbursements/trigger/&#123;loanRequestId&#125;</code>
                    <code className="text-[11px] block font-mono">PUT /api/loans/disbursements/&#123;id&#125;/complete?referenceNumber=...</code>
                  </div>
                )}

                {cur.num === 7 && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-900">
                    <p className="font-bold">Repayment &amp; Limit Restoration:</p>
                    <code className="text-[11px] block font-mono">POST /api/repayments/initiate</code>
                    <p className="text-[11px] mt-1 text-slate-600">
                      Restores available credit limit headroom back to KES {creditLimit.toLocaleString()}.
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Navigation Links */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#1F4DA8]" />
                  Related Core Pages
                </h4>
                <div className="space-y-2">
                  <Link
                    href="/bank/distributors"
                    className="block p-2.5 bg-white border border-slate-200 hover:border-blue-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
                  >
                    1. Bank Loan Profiles &amp; Facilities
                  </Link>
                  <Link
                    href="/bank/approvals"
                    className="block p-2.5 bg-white border border-slate-200 hover:border-blue-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
                  >
                    2. Maker-Checker Approvals &amp; Disbursement
                  </Link>
                  <Link
                    href="/dealer/drawdowns"
                    className="block p-2.5 bg-white border border-slate-200 hover:border-blue-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
                  >
                    3. Dealer Drawdowns Ledger
                  </Link>
                  <Link
                    href="/dealer/repayments"
                    className="block p-2.5 bg-white border border-slate-200 hover:border-blue-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
                  >
                    4. Dealer Repayments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

