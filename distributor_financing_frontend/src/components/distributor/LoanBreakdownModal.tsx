'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  XCircle,
  Ban,
  Send,
  Clock,
  UserCheck,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { loanRequestsApi, loanApprovalsApi } from '@/services/loans-api.service';
import type { LoanRequestResponse, LoanApprovalDecisionDTO } from '@/types/loans';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { LoanLifecycleTracker } from './LoanLifecycleTracker';
import { getErrorMessage } from '@/lib/errors';

interface LoanBreakdownModalProps {
  loan: LoanRequestResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelled?: () => void;
  onAuthorized?: (updatedLoan: LoanRequestResponse) => void;
}

export function LoanBreakdownModal({
  loan,
  isOpen,
  onClose,
  onCancelled,
  onAuthorized,
}: LoanBreakdownModalProps) {
  const toast = useToast();
  const auth = useAuth();
  const { hasPermission, canApproveDistributorLoan, canCancelLoan } = usePermissions();

  const [isCancelling, setIsCancelling] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  if (!loan) return null;

  const normStatus = (loan.status || '').toUpperCase();
  const isPendingInternalApproval =
    normStatus === 'PENDING' ||
    normStatus === 'PENDING_INTERNAL_APPROVAL';

  // Four-Eyes principle: Checker cannot approve their own loan
  const userEmail = auth?.user?.email?.toLowerCase().trim();
  const isOwnLoan = Boolean(
    userEmail && (
      (loan as any).createdBy?.toLowerCase().trim() === userEmail ||
      (loan as any).requestedBy?.toLowerCase().trim() === userEmail ||
      (loan as any).creatorEmail?.toLowerCase().trim() === userEmail
    )
  );

  const isChecker = canApproveDistributorLoan;
  const canCheckerAct = isChecker && isPendingInternalApproval && !isOwnLoan;

  const canCancel =
    (canCancelLoan || hasPermission('APPLY_FINANCING')) &&
    (normStatus === 'PENDING' || normStatus === 'PENDING_INTERNAL_APPROVAL');

  const formatApiError = (err: unknown, defaultMsg: string): string => {
    if (isAxiosError(err)) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message || err.response?.data?.detail;
      if (status === 403) {
        return serverMsg || 'You do not have permission to authorize distributor loan requests.';
      }
      if (status === 401) {
        return 'Your session has expired. Please sign in again to continue.';
      }
      if (status === 409) {
        return serverMsg || 'This loan request has already been processed or is in a conflicting state.';
      }
      if (status === 400) {
        return serverMsg || 'Invalid state transition for this loan request.';
      }
      if (serverMsg) return serverMsg;
    }
    return getErrorMessage(err, defaultMsg);
  };

  const handleCancelRequest = async () => {
    if (!confirm('Are you sure you want to cancel this financing request?')) return;
    setIsCancelling(true);
    setActionError(null);
    try {
      await loanRequestsApi.cancelLoanRequest(loan.id);
      toast.success('Financing request cancelled successfully.');
      if (onCancelled) onCancelled();
      onClose();
    } catch (err) {
      const msg = formatApiError(err, 'Failed to cancel request.');
      setActionError(msg);
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleAuthorizeRequest = async () => {
    setIsAuthorizing(true);
    setActionError(null);
    try {
      const payload: LoanApprovalDecisionDTO = {
        approved: true,
        approvalLevel: 'CHECKER',
        approvedAmount: loan.principalAmount,
        comments: 'Authorized by Distributor Checker for bank financing.',
      };

      const res = await loanApprovalsApi.approveOrRejectLoan(loan.id, payload);
      toast.success(`Financing Request ${loan.loanRequestNumber || `LR-${loan.id}`} authorized and submitted to bank!`);

      const updatedLoan: LoanRequestResponse = (res as any)?.result || {
        ...loan,
        status: 'CHECKER_APPROVED',
      };

      if (onAuthorized) onAuthorized(updatedLoan);
      onClose();
    } catch (err) {
      const msg = formatApiError(err, 'Failed to authorize financing request.');
      setActionError(msg);
      toast.error(msg);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection justification reason.');
      return;
    }
    setIsRejecting(true);
    setActionError(null);
    try {
      const payload: LoanApprovalDecisionDTO = {
        approved: false,
        approvalLevel: 'CHECKER',
        rejectionReason: rejectReason.trim(),
        comments: rejectReason.trim(),
      };

      const res = await loanApprovalsApi.approveOrRejectLoan(loan.id, payload);
      toast.success('Financing request declined and returned to Maker.');

      const updatedLoan: LoanRequestResponse = (res as any)?.result || {
        ...loan,
        status: 'REJECTED',
        rejectionReason: rejectReason.trim(),
      };

      if (onAuthorized) onAuthorized(updatedLoan);
      onClose();
    } catch (err) {
      const msg = formatApiError(err, 'Failed to decline financing request.');
      setActionError(msg);
      toast.error(msg);
    } finally {
      setIsRejecting(false);
      setShowRejectInput(false);
    }
  };

  const principal = loan.principalAmount || 0;
  const interest = loan.totalInterest || Math.round(principal * 0.025);
  const fees = loan.processingFee || Math.round(principal * 0.01);
  const totalRepayable = loan.totalRepayable || (principal + interest + fees);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Financing Request: ${loan.loanRequestNumber || `LR-${loan.id}`}`}
      description={`Application for ${loan.manufacturerName || 'Anchor Manufacturer'}`}
      size="xl"
    >
      <div className="space-y-5">
        {/* LIFECYCLE PROGRESSION TRACKER */}
        <LoanLifecycleTracker
          status={loan.status}
          rejectionReason={loan.rejectionReason}
        />

        {actionError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-semibold">
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <p>{actionError}</p>
          </div>
        )}

        {/* DISTRIBUTOR CHECKER ACTION BANNER */}
        {canCheckerAct && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                    Distributor Checker Four-Eyes Authorization
                  </h4>
                  <p className="text-[11px] text-indigo-700">
                    As an authorized Distributor Checker, review the purchase order terms and legally sign off before transmission to the lending bank.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-200/80 text-indigo-900 border border-indigo-300">
                Action Required
              </span>
            </div>

            {showRejectInput ? (
              <div className="space-y-2 pt-2 border-t border-indigo-100">
                <label className="text-[11px] font-bold text-slate-700">Rejection Justification Note:</label>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this request is being returned or declined..."
                  className="w-full text-xs p-2.5 rounded-xl border border-rose-200 bg-white focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-indigo-100/50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectRequest}
                    disabled={isRejecting}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <XCircle size={14} />
                    {isRejecting ? 'Declining...' : 'Confirm Decline'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRejectInput(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle size={14} />
                  Return / Decline
                </button>
                <button
                  type="button"
                  onClick={handleAuthorizeRequest}
                  disabled={isAuthorizing}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send size={14} />
                  {isAuthorizing ? 'Authorizing...' : 'Authorize & Submit to Bank'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* SELF-APPROVAL NOTICE (Four-Eyes Enforcement) */}
        {isPendingInternalApproval && isChecker && isOwnLoan && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900">
            <UserCheck size={16} className="text-amber-600 shrink-0" />
            <p>
              <strong>Four-Eyes Governance:</strong> You initiated this loan application. In compliance with internal four-eyes controls, you cannot authorize your own request. Another authorized Distributor Checker must sign off.
            </p>
          </div>
        )}

        {/* DISTRIBUTOR MAKER INFO NOTICE */}
        {isPendingInternalApproval && !isChecker && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900">
            <Clock size={16} className="text-amber-600 shrink-0 animate-pulse" />
            <p>
              <strong>Pending Internal Checker Sign-off:</strong> This request is currently awaiting authorization from your internal <strong>Distributor Checker</strong> before transmission to the lending bank.
            </p>
          </div>
        )}

        {/* CHECKER APPROVED NOTICE */}
        {normStatus === 'CHECKER_APPROVED' && (
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-2.5 text-xs text-indigo-900">
            <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
            <p>
              <strong>Distributor Sign-off Complete:</strong> This application has been verified by the Distributor Checker and transmitted to the partner bank for credit underwriting and sanctioning.
            </p>
          </div>
        )}

        {/* Trade Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Trade &amp; Supplier Details
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Anchor Manufacturer:</span>
              <strong className="text-slate-900">{loan.manufacturerName || 'Anchor Supplier'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Purchase Order (PO):</span>
              <strong className="font-mono text-slate-900">{loan.purchaseOrderNumber || 'N/A'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Proforma Invoice #:</span>
              <strong className="font-mono text-slate-900">{loan.invoiceNumber || 'Pending Attachment'}</strong>
            </div>
            {loan.invoiceAmount && (
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Total:</span>
                <strong className="text-slate-900">KES {loan.invoiceAmount.toLocaleString()}</strong>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Tenor &amp; Scheduling
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tenor Horizon:</span>
              <strong className="text-slate-900">{loan.tenorDays || 30} Days</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Application Date:</span>
              <strong className="text-slate-900">{new Date(loan.createdAt).toLocaleDateString()}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Repayment Due Date:</span>
              <strong className="text-indigo-700 font-bold">
                {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'Pending Sanction'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Repayment Mode:</span>
              <strong className="text-slate-900">Single Bullet Settle</strong>
            </div>
          </div>
        </div>

        {/* Financial Breakdown Ledger */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 space-y-3">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-blue-100 pb-2">
            Repayment Ledger &amp; Advance Rate Breakdown
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Disbursed Principal:</span>
              <span className="font-bold text-slate-900">KES {principal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Daily Pro-Rata Accrued Interest:</span>
              <span className="font-semibold text-slate-800">+ KES {interest.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Processing &amp; Facility Fees:</span>
              <span className="font-semibold text-slate-800">+ KES {fees.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-blue-200 flex justify-between text-sm font-black">
              <span className="text-indigo-900">Total Bullet Repayable:</span>
              <span className="text-indigo-700">KES {totalRepayable.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {loan.purpose && (
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <strong className="font-semibold text-slate-800">Financing Purpose:</strong> {loan.purpose}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          {canCancel ? (
            <button
              type="button"
              onClick={handleCancelRequest}
              disabled={isCancelling}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <Ban size={14} />
              {isCancelling ? 'Cancelling...' : 'Cancel Request'}
            </button>
          ) : (
            <div />
          )}

          <ModalButton variant="primary" onClick={onClose}>
            Close
          </ModalButton>
        </div>
      </div>
    </Modal>
  );
}
