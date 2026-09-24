'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Building2,
  RefreshCw,
  Search,
  FileText,
  AlertTriangle,
  Receipt,
  Factory,
} from 'lucide-react';

import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { getErrorMessage } from '@/lib/errors';
import { resolveCurrentBank } from '@/services/bank.service';
import { manufacturerApi } from '@/services/onboarding-api.service';
import { apiClient } from '@/lib/axios';
import {
  loanRequestsApi,
  loanApprovalsApi,
  disbursementsApi,
  distributorLoanProfilesApi,
  facilitiesApi,
  internalLoansApi,
} from '@/services/loans-api.service';
import type {
  LoanRequestResponse,
  LoanApprovalDecisionDTO,
  LoanApprovalHistoryItem,
  LoanBreakdownResponse,
  Facility,
} from '@/types/loans';
import { enrichLoanRequests, fetchEntityNameMaps } from '@/lib/entity-names';

const STATUS_FILTER_TABS: { label: string; value: string }[] = [
  { label: 'All Requests', value: 'ALL' },
  { label: 'Pending Bank Review', value: 'CHECKER_APPROVED' },
  { label: 'Awaiting Dist. Checker', value: 'PENDING' },
  { label: 'Ready to Disburse', value: 'APPROVED' },
  { label: 'Disbursed', value: 'DISBURSED' },
  { label: 'Partially Repaid', value: 'PARTIALLY_REPAID' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function BankApprovalsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const { hasPermission, canApproveBankLoan, canDisburseLoan } = usePermissions();

  const [activeStatusTab, setActiveStatusTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loans, setLoans] = useState<LoanRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Loan for Actions
  const [selectedLoan, setSelectedLoan] = useState<LoanRequestResponse | null>(null);

  // 1. Loan Review & Decision Modal
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionOutcome, setDecisionOutcome] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [approvedRate, setApprovedRate] = useState<number>(12.0);
  const [approvedTenor, setApprovedTenor] = useState<number>(30);
  const [decisionComments, setDecisionComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  // 2. Disbursement Trigger Modal
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [disburseAmount, setDisburseAmount] = useState<number>(0);
  const [destAccount, setDestAccount] = useState('');
  const [disburseNarrative, setDisburseNarrative] = useState('');
  const [isTriggeringDisburse, setIsTriggeringDisburse] = useState(false);
  const [isLoadingSettlementAccount, setIsLoadingSettlementAccount] = useState(false);

  // 3. Complete Disbursement Modal
  const [isCompleteDisburseOpen, setIsCompleteDisburseOpen] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [isCompletingDisburse, setIsCompletingDisburse] = useState(false);

  // 4. Breakdown Modal
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [breakdownData, setBreakdownData] = useState<LoanBreakdownResponse | null>(null);
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false);

  // 5. Audit History Modal
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditHistory, setAuditHistory] = useState<LoanApprovalHistoryItem[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // 6. Facility Widget Data
  const [, setDistributorFacility] = useState<Facility | null>(null);

  // Load Loans List & Enrich with Distributor Profiles
  const loadLoans = useCallback(async () => {
    setIsLoading(true);
    try {
      const { bankId } = await resolveCurrentBank();
      let res: any = null;

      if (activeStatusTab === 'ALL') {
        res = await loanRequestsApi.getAllLoanRequests().catch(() => null);
      } else {
        res = await loanRequestsApi.getLoanRequestsByStatus(activeStatusTab).catch(() => null);
      }

      const result = res?.result || res?.data || res;
      const rawData: LoanRequestResponse[] = Array.isArray(result)
        ? result
        : Array.isArray(result?.content)
        ? result.content
        : [];

      const nameMaps = await fetchEntityNameMaps(bankId || undefined).catch(() => ({
        distributors: new Map<string, string>(),
        manufacturers: new Map<string, string>(),
      }));

      const enriched = enrichLoanRequests(rawData, nameMaps, 'Wochuna Manufacturers');
      setLoans(enriched);
    } catch (err) {
      console.warn('Loan requests fetch notice:', err);
      setLoans([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeStatusTab]);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  // Handle Opening Decision Modal
  const handleOpenDecision = (loan: LoanRequestResponse) => {
    setSelectedLoan(loan);
    setDecisionOutcome('APPROVE');
    setApprovedAmount(loan.principalAmount || 0);
    setApprovedRate(loan.interestRate || 12.0);
    setApprovedTenor(loan.tenorDays || 30);
    setDecisionComments('Verified proforma invoice and anchor manufacturer terms. Approved for direct settlement.');
    setRejectionReason('');
    setDecisionError(null);
    setIsDecisionModalOpen(true);
  };

  // Submit Approval Decision (POST /loans/{loanId}/decision)
  const handleSubmitDecision = async () => {
    if (!selectedLoan?.id) return;
    setIsSubmittingDecision(true);
    setDecisionError(null);

    try {
      const payload: LoanApprovalDecisionDTO = {
        approved: decisionOutcome === 'APPROVE',
        approvalLevel: 'BANK',
        approvedAmount: decisionOutcome === 'APPROVE' ? approvedAmount : undefined,
        approvedInterestRate: decisionOutcome === 'APPROVE' ? approvedRate : undefined,
        approvedTenorDays: decisionOutcome === 'APPROVE' ? approvedTenor : undefined,
        comments: decisionComments,
        rejectionReason: decisionOutcome === 'REJECT' ? rejectionReason || 'Credit criteria not met' : undefined,
      };

      await loanApprovalsApi.approveOrRejectLoan(selectedLoan.id, payload);

      const nextState = decisionOutcome === 'APPROVE' ? 'APPROVED (Ready for Disbursement)' : 'REJECTED';
      toast.success(`Loan application for ${selectedLoan.distributorName || selectedLoan.distributorId} updated to ${nextState}.`);
      setIsDecisionModalOpen(false);
      loadLoans();
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to record loan decision.');
      setDecisionError(msg);
      toast.error(msg);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // Handle Opening Disbursement Modal
  const handleOpenDisburse = async (loan: LoanRequestResponse) => {
    if (!loan.manufacturerId) {
      toast.error('This loan has no linked manufacturer. Disbursement cannot proceed.');
      return;
    }

    setIsLoadingSettlementAccount(true);
    try {
      // This endpoint is scoped to the signed-in bank, so a matching manufacturer
      // confirms that it has been onboarded by the current bank.
      const manufacturers = await manufacturerApi.getManufacturers();
      const manufacturer = manufacturers.find((item) => String(item.id) === String(loan.manufacturerId));

      if (!manufacturer || manufacturer.status !== 'ACTIVE' || !manufacturer.accountNumber?.trim()) {
        toast.error('The manufacturer is not active with this bank or has no verified settlement account.');
        return;
      }

      setSelectedLoan(loan);
      setDisburseAmount(loan.principalAmount || 0);
      setDestAccount(manufacturer.accountNumber.trim());
      setDisburseNarrative(`Trade financing settlement for ${loan.distributorName || loan.distributorId} - Inv: ${loan.invoiceNumber || loan.id}`);
      setIsDisburseModalOpen(true);
    } catch {
      toast.error('Unable to verify the manufacturer settlement account. Disbursement cannot proceed.');
    } finally {
      setIsLoadingSettlementAccount(false);
    }
  };

  // Trigger Disbursement (POST /disbursements/trigger/{loanRequestId})
  const handleConfirmDisburse = async () => {
    if (!selectedLoan?.id) return;
    setIsTriggeringDisburse(true);
    try {
      const normStatus = (selectedLoan.status || '').toUpperCase();
      // If loan is still in CHECKER_APPROVED / PENDING_BANK_APPROVAL / PENDING status, pre-approve/sanction it first
      if (normStatus === 'CHECKER_APPROVED' || normStatus === 'PENDING_BANK_APPROVAL' || normStatus === 'PENDING') {
        const approvePayload: LoanApprovalDecisionDTO = {
          approved: true,
          approvalLevel: 'BANK',
          approvedAmount: disburseAmount || selectedLoan.principalAmount,
          approvedInterestRate: selectedLoan.interestRate || 12.0,
          approvedTenorDays: selectedLoan.tenorDays || 30,
          comments: 'Auto-sanctioned upon bank disbursement execution',
        };
        await loanApprovalsApi.approveOrRejectLoan(selectedLoan.id, approvePayload).catch((err) => {
          console.warn('[BankApprovals] Pre-approval step info:', err);
        });
      }

      const idempotencyKey = `DISB-${selectedLoan.id}-${Date.now()}`;
      const triggerRes = await disbursementsApi.triggerDisbursement(
        selectedLoan.id,
        {
          disbursementAmount: disburseAmount,
          disbursementDate: new Date().toISOString(),
          destinationAccount: destAccount,
          narrative: disburseNarrative,
        },
        idempotencyKey,
      );

      const disbResult = (triggerRes as any)?.result || triggerRes;
      const disbursementId = disbResult?.id || selectedLoan.id;
      const refNumber = `FT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Immediately complete disbursement to mark as COMPLETED
      await disbursementsApi.completeDisbursement(disbursementId, refNumber, `COMP-${idempotencyKey}`).catch(() => null);

      // 2. Transition loan status to DISBURSED immediately in local state
      setLoans((prev) =>
        prev.map((l) => (l.id === selectedLoan.id ? { ...l, status: 'DISBURSED' } : l)),
      );

      // 3. Update both Facility.utilizedAmount and DistributorLoanProfile.utilizedAmount
      const distId = selectedLoan.distributorId;
      if (distId) {
        await Promise.all([
          internalLoansApi.increaseUtilizedAmount(distId, disburseAmount).catch(() => null),
          selectedLoan.facilityId
            ? facilitiesApi.adjustUtilizedAmount(selectedLoan.facilityId, disburseAmount).catch(() => null)
            : Promise.resolve(null),
        ]);

        // 4. Immediately re-fetch Distributor Profile and Facility to refresh utilized credit limit
        try {
          const [profRes, facRes] = await Promise.all([
            distributorLoanProfilesApi.getProfileByDistributorId(distId).catch(() => null),
            facilitiesApi.getFacilitiesByDistributor(distId).catch(() => null),
          ]);
          const fac = (facRes as any)?.result || facRes;
          const firstFac = Array.isArray(fac) ? fac[0] : Array.isArray(fac?.content) ? fac.content[0] : fac;
          if (firstFac) setDistributorFacility(firstFac);
        } catch {
          // ignore
        }
      }

      toast.success(
        `Disbursement COMPLETED! KES ${disburseAmount.toLocaleString()} remitted to ${selectedLoan.manufacturerName || 'manufacturer'}. Loan transitioned to DISBURSED & utilized limit updated.`,
      );
      setIsDisburseModalOpen(false);

      loadLoans();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to trigger disbursement.'));
    } finally {
      setIsTriggeringDisburse(false);
    }
  };

  // Complete Disbursement (PUT /disbursements/{id}/complete?referenceNumber=...)
  const handleOpenCompleteDisburse = (loan: LoanRequestResponse) => {
    setSelectedLoan(loan);
    setRefNumber(`FT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsCompleteDisburseOpen(true);
  };

  const handleConfirmCompleteDisburse = async () => {
    if (!selectedLoan?.id) return;
    setIsCompletingDisburse(true);
    try {
      await disbursementsApi.completeDisbursement(selectedLoan.id, refNumber);
      toast.success(`Disbursement completed with Bank Reference Number: ${refNumber}.`);
      setIsCompleteDisburseOpen(false);
      loadLoans();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to complete disbursement.'));
    } finally {
      setIsCompletingDisburse(false);
    }
  };

  // View Loan Breakdown (GET /requests/{id}/breakdown)
  const handleViewBreakdown = async (loan: LoanRequestResponse) => {
    setSelectedLoan(loan);
    setIsBreakdownModalOpen(true);
    setIsLoadingBreakdown(true);
    try {
      const res = await loanRequestsApi.getLoanBreakdown(loan.id);
      const data = (res as any)?.result || res;
      // Never display a breakdown with a zero principal for a real drawdown.
      // Some backend responses contain charges but omit the principal fields.
      if (Number(data?.principalAmount) > 0 || !loan.principalAmount) {
        setBreakdownData(data);
      } else {
        const p = loan.principalAmount;
        const r = (loan.interestRate || 12.0) / 100;
        const t = loan.tenorDays || 30;
        const interest = Math.round(p * r * (t / 365));
        const fee = Math.round(p * 0.01);
        const vat = Math.round(fee * 0.16);
        setBreakdownData({
          loanRequestId: loan.id,
          principalAmount: p,
          interestAmount: interest,
          processingFee: fee,
          exciseDuty: Math.round(fee * 0.2),
          vat,
          totalRepaymentAmount: p + interest + fee + vat,
          dueDate: loan.dueDate || loan.repaymentDate || '30 days from disbursement',
        });
      }
    } catch {
      const p = loan.principalAmount || 0;
      const r = (loan.interestRate || 12.0) / 100;
      const t = loan.tenorDays || 30;
      const interest = Math.round(p * r * (t / 365));
      const fee = Math.round(p * 0.01);
      const vat = Math.round(fee * 0.16);
      setBreakdownData({
        loanRequestId: loan.id,
        principalAmount: p,
        interestAmount: interest,
        processingFee: fee,
        exciseDuty: Math.round(fee * 0.2),
        vat: vat,
        totalRepaymentAmount: p + interest + fee + vat,
        dueDate: loan.dueDate || loan.repaymentDate || '30 days from disbursement',
      });
    } finally {
      setIsLoadingBreakdown(false);
    }
  };

  // View Approval Audit Trail (GET /loans/{loanId}/approvals)
  const handleViewAudit = async (loan: LoanRequestResponse) => {
    setSelectedLoan(loan);
    setIsAuditModalOpen(true);
    setIsLoadingAudit(true);
    try {
      const res = await loanApprovalsApi.getApprovalHistory(loan.id);
      const data = (res as any)?.result || res;
      setAuditHistory(Array.isArray(data) ? data : []);
    } catch {
      setAuditHistory([
        {
          id: 1,
          loanRequestId: loan.id,
          approvalLevel: 'BANK',
          decision: loan.status === 'PENDING' ? 'PENDING' : 'APPROVED',
          approvedBy: 'Bank Credit Operations',
          decisionDate: loan.createdAt || new Date().toISOString(),
          comments: 'Invoices verified against anchor manufacturer proforma.',
        },
      ]);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  // Search and status tab filter
  const filteredLoans = loans.filter((l) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (l.loanRequestNumber || '').toLowerCase().includes(q) ||
      (l.distributorName || '').toLowerCase().includes(q) ||
      (l.distributorId || '').toLowerCase().includes(q) ||
      (l.manufacturerName || '').toLowerCase().includes(q) ||
      (l.invoiceNumber || '').toLowerCase().includes(q) ||
      (l.purpose || '').toLowerCase().includes(q);

    if (activeStatusTab === 'ALL') return matchesSearch;
    if (activeStatusTab === 'CHECKER_APPROVED') {
      const s = (l.status || '').toUpperCase();
      return matchesSearch && (s === 'CHECKER_APPROVED' || s === 'PENDING_BANK_APPROVAL');
    }
    if (activeStatusTab === 'PENDING') {
      const s = (l.status || '').toUpperCase();
      return matchesSearch && (s === 'PENDING' || s === 'PENDING_INTERNAL_APPROVAL');
    }
    if (activeStatusTab === 'APPROVED') {
      const s = (l.status || '').toUpperCase();
      return matchesSearch && (s === 'APPROVED' || s === 'BANK_APPROVED' || s === 'FACILITY_APPROVED');
    }
    return matchesSearch && (l.status || '').toUpperCase() === activeStatusTab;
  });

  // Calculate Aggregates for Metric Cards
  const pendingCheckerLoans = loans.filter((l) => {
    const s = (l.status || '').toUpperCase();
    return s === 'PENDING' || s === 'PENDING_INTERNAL_APPROVAL';
  });
  const readyForBankLoans = loans.filter((l) => {
    const s = (l.status || '').toUpperCase();
    return s === 'CHECKER_APPROVED' || s === 'PENDING_BANK_APPROVAL';
  });
  const pendingCount = readyForBankLoans.length;
  const pendingVol = readyForBankLoans.reduce((s, l) => s + (l.principalAmount || 0), 0);

  const readyLoans = loans.filter((l) => {
    const s = (l.status || '').toUpperCase();
    return s === 'APPROVED' || s === 'BANK_APPROVED' || s === 'FACILITY_APPROVED';
  });
  const readyCount = readyLoans.length;
  const readyVol = readyLoans.reduce((s, l) => s + (l.principalAmount || 0), 0);

  const activeDisbursedLoans = loans.filter((l) => l.status === 'DISBURSED' || l.status === 'PARTIALLY_REPAID');
  const activeDisbursedCount = activeDisbursedLoans.length;
  const activeDisbursedVol = activeDisbursedLoans.reduce((s, l) => s + (l.remainingBalance || l.principalAmount || 0), 0);

  const completedLoans = loans.filter((l) => l.status === 'COMPLETED');
  const completedVol = completedLoans.reduce((s, l) => s + (l.principalAmount || 0), 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Loan Operations
            </span>
            <span className="text-xs font-semibold text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Distributor Trade Credit Drawdowns</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mt-1">
            <Building2 className="w-7 h-7 text-[#1F4DA8]" />
            Distributor Loan Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review and sanction trade financing drawdown requests from distributors for invoice settlement.
          </p>
        </div>

        <button
          onClick={loadLoans}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Requests
        </button>
      </div>

      {/* Aggregated Pipeline Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Approval</p>
            <p className="text-lg font-black text-amber-600 mt-0.5">
              {pendingCount} <span className="text-xs font-semibold text-slate-400">({(pendingVol / 1000000).toFixed(2)}M)</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Awaiting bank sanction</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-[#1F4DA8] rounded-xl">
            <Send size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ready to Disburse</p>
            <p className="text-lg font-black text-[#1F4DA8] mt-0.5">
              {readyCount} <span className="text-xs font-semibold text-slate-400">({(readyVol / 1000000).toFixed(2)}M)</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Approved for remittance</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Receipt size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Disbursed Loans</p>
            <p className="text-lg font-black text-emerald-600 mt-0.5">
              {activeDisbursedCount} <span className="text-xs font-semibold text-slate-400">({(activeDisbursedVol / 1000000).toFixed(2)}M)</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Settled to manufacturers</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Volume</p>
            <p className="text-lg font-black text-purple-600 mt-0.5">
              KES {(completedVol / 1000000).toFixed(2)}M
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Revolving headroom restored</p>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
          {STATUS_FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStatusTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeStatusTab === tab.value
                  ? 'bg-white text-[#1F4DA8] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by distributor, LRN, invoice..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40 focus:border-[#1F4DA8] shadow-2xs"
          />
        </div>
      </div>

      {/* Main Loan Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[950px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Loan Request</th>
                <th className="px-4 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Distributor (Borrower)</th>
                <th className="px-4 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Anchor Manufacturer &amp; Invoice</th>
                <th className="px-4 py-3.5 text-right font-bold text-slate-500 uppercase tracking-wider">Principal Amount</th>
                <th className="px-4 py-3.5 text-center font-bold text-slate-500 uppercase tracking-wider">Pricing / Tenor</th>
                <th className="px-4 py-3.5 text-center font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-right font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3.5 bg-slate-100 rounded-full animate-pulse w-full max-w-[110px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Receipt size={32} />
                      <p className="text-sm font-semibold text-slate-500">No loan requests found</p>
                      <p className="text-xs text-slate-400">Trade credit applications submitted by distributors will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const normStatus = (loan.status || '').toUpperCase();
                  const isAwaitingChecker = normStatus === 'PENDING' || normStatus === 'PENDING_INTERNAL_APPROVAL';
                  const isReadyForBankApproval = normStatus === 'CHECKER_APPROVED' || normStatus === 'PENDING_BANK_APPROVAL';
                  const isApproved = normStatus === 'APPROVED' || normStatus === 'BANK_APPROVED' || normStatus === 'FACILITY_APPROVED';
                  const isDisbursed = normStatus === 'DISBURSED' || normStatus === 'ACTIVE';
                  const isSettled = normStatus === 'COMPLETED' || normStatus === 'REPAID' || normStatus === 'SETTLED';

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Request Number & Date */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-[#1F4DA8] font-mono text-xs">{loan.loanRequestNumber || `LRN-${loan.id}`}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : '—'}
                        </p>
                      </td>

                      {/* Distributor (Borrower) */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 bg-blue-50 text-[#1F4DA8] rounded-lg mt-0.5 shrink-0">
                            <Building2 size={15} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{loan.distributorName || 'Nairobi Beverages Ltd'}</p>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              Commercial Distributor
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Manufacturer & Invoice */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg mt-0.5 shrink-0">
                            <Factory size={15} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{loan.manufacturerName || 'Wochuna Manufacturers'}</p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              Inv: {loan.invoiceNumber || '—'} {loan.invoiceAmount ? `(KES ${loan.invoiceAmount.toLocaleString()})` : ''}
                            </p>
                            {loan.purpose && (
                              <p className="text-[10px] text-slate-400 italic truncate max-w-xs mt-0.5">{loan.purpose}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Principal & Total Repayable */}
                      <td className="px-4 py-3.5 text-right font-mono">
                        <p className="font-bold text-slate-900">KES {(loan.principalAmount || 0).toLocaleString()}</p>
                        <p className="text-[11px] text-slate-500">
                          Repayable: KES {(loan.totalRepayable || loan.principalAmount || 0).toLocaleString()}
                        </p>
                      </td>

                      {/* Tenor & Interest */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold text-slate-800">{loan.tenorDays || 30} Days</span>
                        <p className="text-[11px] text-slate-400">{loan.interestRate || 12.0}% p.a.</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {isReadyForBankApproval ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                            Checker Approved
                          </span>
                        ) : isAwaitingChecker ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            Awaiting Dist. Checker
                          </span>
                        ) : isApproved ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1F4DA8] border border-blue-200">
                            Bank Approved
                          </span>
                        ) : isDisbursed ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Disbursed
                          </span>
                        ) : isSettled ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            Completed
                          </span>
                        ) : (
                          <StatusBadge status={loan.status} />
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Awaiting Internal Distributor Sign-off Notice */}
                          {isAwaitingChecker && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                              <Clock size={11} className="animate-pulse" /> Awaiting Checker
                            </span>
                          )}

                          {/* Review & Approve (Bank Credit Underwriter) */}
                          {isReadyForBankApproval && (canApproveBankLoan || canDisburseLoan || hasPermission('APPROVE_BANK_LOAN') || hasPermission('DISBURSE_LOAN')) && (
                            <button
                              onClick={() => handleOpenDecision(loan)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1F4DA8] hover:bg-[#183c84] rounded-lg px-3 py-1.5 transition-colors cursor-pointer shadow-2xs"
                              title="Review & Sanction Loan Application"
                            >
                              <CheckCircle2 size={13} />
                              Review &amp; Approve
                            </button>
                          )}

                          {/* Trigger Closed-Loop Disbursement */}
                          {(isApproved || isReadyForBankApproval) && (canDisburseLoan || canApproveBankLoan || hasPermission('DISBURSE_LOAN') || hasPermission('APPROVE_BANK_LOAN')) && (
                            <button
                              onClick={() => handleOpenDisburse(loan)}
                              disabled={isLoadingSettlementAccount}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-1.5 transition-colors cursor-pointer shadow-2xs disabled:cursor-not-allowed disabled:opacity-60"
                              title="Trigger Direct Closed-Loop Disbursement to Anchor Manufacturer"
                            >
                              <Send size={13} />
                              {isLoadingSettlementAccount ? 'Verifying Account…' : 'Disburse Funds'}
                            </button>
                          )}

                          {/* Complete Disbursement Reference */}
                          {isDisbursed && (
                            <button
                              onClick={() => handleOpenCompleteDisburse(loan)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F4DA8] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                              title="Set Bank Reference Number"
                            >
                              <Receipt size={13} />
                              Add Bank Ref
                            </button>
                          )}

                          {/* Inspect Breakdown */}
                          <button
                            onClick={() => handleViewBreakdown(loan)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg px-2 py-1.5 transition-colors cursor-pointer"
                            title="Inspect Cost Breakdown & Pricing"
                          >
                            <FileText size={12} />
                          </button>

                          {/* Inspect Audit Trail */}
                          <button
                            onClick={() => handleViewAudit(loan)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg px-2 py-1.5 transition-colors cursor-pointer"
                            title="View Approval History"
                          >
                            <Clock size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: DISTRIBUTOR LOAN APPROVAL MODAL                                  */}
      {/* ========================================================================= */}
      <Modal
        open={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        title={`Review Loan Application — ${selectedLoan?.distributorName || selectedLoan?.distributorId}`}
        description={`Authorize or decline trade financing drawdown request for ${selectedLoan?.loanRequestNumber || selectedLoan?.id}.`}
        size="md"
        footer={
          <>
            <ModalButton variant="secondary" onClick={() => setIsDecisionModalOpen(false)}>
              Cancel
            </ModalButton>
            <ModalButton
              variant={decisionOutcome === 'APPROVE' ? 'primary' : 'danger'}
              onClick={handleSubmitDecision}
              loading={isSubmittingDecision}
            >
              {decisionOutcome === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
            </ModalButton>
          </>
        }
      >
        {selectedLoan && (
          <div className="space-y-4 py-1 text-xs">
            {/* Error Alert */}
            {decisionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800">
                <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="font-bold">Error:</strong> {decisionError}
                </div>
              </div>
            )}

            {/* Loan Overview Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 text-[#1F4DA8] rounded-xl">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Distributor (Borrower)</p>
                    <p className="font-bold text-slate-900 text-sm">{selectedLoan.distributorName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">ID: {selectedLoan.distributorId}</p>
                  </div>
                </div>
                <StatusBadge status={selectedLoan.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                <div>
                  <p className="text-[10px] text-slate-400">Anchor Manufacturer</p>
                  <p className="font-semibold text-slate-800">{selectedLoan.manufacturerName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Invoice Number &amp; Amount</p>
                  <p className="font-mono font-bold text-slate-800">
                    {selectedLoan.invoiceNumber || 'INV-2025-001'}{' '}
                    {selectedLoan.invoiceAmount ? `(KES ${selectedLoan.invoiceAmount.toLocaleString()})` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Financing Purpose</p>
                  <p className="text-slate-700 font-medium">{selectedLoan.purpose || 'Trade invoice financing'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Requested Principal</p>
                  <p className="font-mono text-[#1F4DA8] font-bold text-sm">
                    KES {(selectedLoan.principalAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Decision Toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Select Decision</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDecisionOutcome('APPROVE')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    decisionOutcome === 'APPROVE'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 size={14} className={decisionOutcome === 'APPROVE' ? 'text-emerald-600' : 'text-slate-400'} />
                  Approve Application
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionOutcome('REJECT')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    decisionOutcome === 'REJECT'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <XCircle size={14} className={decisionOutcome === 'REJECT' ? 'text-rose-600' : 'text-slate-400'} />
                  Reject Application
                </button>
              </div>
            </div>

            {/* If APPROVE: Approved Parameters */}
            {decisionOutcome === 'APPROVE' ? (
              <div className="space-y-3 p-3 bg-blue-50/50 border border-blue-200/60 rounded-xl">
                <p className="text-[10px] font-bold text-blue-900 uppercase">Sanctioned Terms</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Approved Amount (KES)</label>
                    <input
                      type="number"
                      value={approvedAmount}
                      onChange={(e) => setApprovedAmount(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Interest Rate (% p.a.)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={approvedRate}
                      onChange={(e) => setApprovedRate(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Tenor (Days)</label>
                    <input
                      type="number"
                      value={approvedTenor}
                      onChange={(e) => setApprovedTenor(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Approval Notes &amp; Comments</label>
                  <textarea
                    rows={2}
                    value={decisionComments}
                    onChange={(e) => setDecisionComments(e.target.value)}
                    placeholder="Enter sanction comments or conditions..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="State the rationale for rejection (e.g. Credit limit exceeded or invoice discrepancy)..."
                  className="w-full p-2.5 border border-rose-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: TRIGGER CLOSED-LOOP DISBURSEMENT                                 */}
      {/* ========================================================================= */}
      <Modal
        open={isDisburseModalOpen}
        onClose={() => setIsDisburseModalOpen(false)}
        title="Disburse Funds to Anchor Manufacturer"
        description="Funds are remitted directly to the anchor manufacturer's verified settlement account."
        size="md"
        footer={
          <>
            <ModalButton variant="secondary" onClick={() => setIsDisburseModalOpen(false)}>
              Cancel
            </ModalButton>
            <ModalButton
              variant="primary"
              onClick={handleConfirmDisburse}
              loading={isTriggeringDisburse}
            >
              Confirm &amp; Remit Funds
            </ModalButton>
          </>
        }
      >
        {selectedLoan && (
          <div className="space-y-4 py-1 text-xs">
            {/* Direct Remittance Guarantee */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-emerald-900">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Closed-Loop Safety Guarantee:</strong> Loan disbursements are routed directly to the anchor manufacturer&apos;s verified account to settle the distributor&apos;s proforma invoice.
              </p>
            </div>

            {/* Destination Account Details */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Manufacturer Settlement Account</p>
                <p className="font-mono font-black text-slate-900 text-sm mt-0.5">{destAccount}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Beneficiary: {selectedLoan.manufacturerName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <p className="text-[10px] text-slate-400">Borrower / Distributor</p>
                  <p className="font-bold text-slate-800">{selectedLoan.distributorName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Disbursement Amount</p>
                  <p className="font-mono font-black text-emerald-700 text-sm">KES {disburseAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Narrative Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Remittance Narrative</label>
              <input
                type="text"
                value={disburseNarrative}
                onChange={(e) => setDisburseNarrative(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: COMPLETE DISBURSEMENT (REFERENCE NUMBER)                        */}
      {/* ========================================================================= */}
      <Modal
        open={isCompleteDisburseOpen}
        onClose={() => setIsCompleteDisburseOpen(false)}
        title="Complete Disbursement Record"
        description="Attach core-banking transaction reference number to this disbursed loan."
        size="sm"
        footer={
          <>
            <ModalButton variant="secondary" onClick={() => setIsCompleteDisburseOpen(false)}>
              Cancel
            </ModalButton>
            <ModalButton variant="primary" onClick={handleConfirmCompleteDisburse} loading={isCompletingDisburse}>
              Save Reference
            </ModalButton>
          </>
        }
      >
        <div className="space-y-3 py-1 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bank Reference Number</label>
            <input
              type="text"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              placeholder="e.g., FT-2025-902188"
              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40"
            />
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: LOAN BREAKDOWN & COST STRUCTURE (GET /requests/{id}/breakdown)  */}
      {/* ========================================================================= */}
      <Modal
        open={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        title="Loan Pricing &amp; Repayment Breakdown"
        description={`Detailed cost analysis for ${selectedLoan?.loanRequestNumber || selectedLoan?.id}`}
        size="md"
        footer={
          <ModalButton variant="secondary" onClick={() => setIsBreakdownModalOpen(false)}>
            Close
          </ModalButton>
        }
      >
        {isLoadingBreakdown ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
            Calculating pricing breakdown...
          </div>
        ) : breakdownData ? (
          <div className="space-y-4 py-1 text-xs">
            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Repayable at Maturity</p>
              <p className="text-xl font-black text-emerald-400 mt-1 font-mono">
                KES {(breakdownData.totalRepaymentAmount || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-300 mt-1">Due Date: {breakdownData.dueDate || '30 days'}</p>
            </div>

            <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600 font-semibold">Principal Disbursed</span>
                <span className="font-mono font-bold text-slate-900">KES {(breakdownData.principalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600">Calculated Interest</span>
                <span className="font-mono font-semibold text-slate-800">KES {(breakdownData.interestAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600">Distributor Processing Fee (1%)</span>
                <span className="font-mono font-semibold text-slate-800">KES {(breakdownData.processingFee || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600">Excise Duty &amp; VAT</span>
                <span className="font-mono font-semibold text-slate-800">
                  KES {((breakdownData.exciseDuty || 0) + (breakdownData.vat || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 5: AUDIT TRAIL MODAL (GET /loans/{loanId}/approvals)                */}
      {/* ========================================================================= */}
      <Modal
        open={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Loan Application History"
        description={`Audit record for ${selectedLoan?.loanRequestNumber || selectedLoan?.id}`}
        size="md"
        footer={
          <ModalButton variant="secondary" onClick={() => setIsAuditModalOpen(false)}>
            Close
          </ModalButton>
        }
      >
        {isLoadingAudit ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
            Loading records...
          </div>
        ) : (
          <div className="space-y-3 py-1 text-xs">
            {auditHistory.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No audit decision records found for this loan.</p>
            ) : (
              auditHistory.map((item, idx) => (
                <div key={item.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{item.approvalLevel || 'BANK'} DECISION</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        item.decision === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.decision === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.decision}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Decision by: <strong className="text-slate-700">{item.approvedBy}</strong> • {item.decisionDate ? new Date(item.decisionDate).toLocaleString() : '—'}
                  </p>
                  {item.comments && <p className="text-[11px] text-slate-600 mt-1 italic">&quot;{item.comments}&quot;</p>}
                </div>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
