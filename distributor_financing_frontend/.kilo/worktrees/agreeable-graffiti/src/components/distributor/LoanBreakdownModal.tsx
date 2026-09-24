'use client';

import React, { useState, useRef } from 'react';
import {
  Coins,
  Factory,
  Building2,
  Calendar,
  Receipt,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Ban,
  Upload,
  ExternalLink,
  Download,
  Paperclip,
} from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { loanRequestsApi } from '@/services/loans-api.service';
import type { LoanRequestResponse } from '@/types/loans';
import { LoanLifecycleTracker } from './LoanLifecycleTracker';
import { getErrorMessage } from '@/lib/errors';

interface LoanBreakdownModalProps {
  loan: LoanRequestResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelled?: () => void;
}

export function LoanBreakdownModal({
  loan,
  isOpen,
  onClose,
  onCancelled,
}: LoanBreakdownModalProps) {
  const toast = useToast();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUploadingPo, setIsUploadingPo] = useState(false);
  const [currentPoUrl, setCurrentPoUrl] = useState<string | undefined>(loan?.purchaseOrderDocumentUrl);
  const [currentPoName, setCurrentPoName] = useState<string | undefined>(loan?.purchaseOrderFileName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!loan) return null;

  const poDocUrl = currentPoUrl || loan.purchaseOrderDocumentUrl;
  const poDocName = currentPoName || loan.purchaseOrderFileName;
  const invDocUrl = loan.invoiceUrl;

  const canCancel =
    loan.status === 'PENDING' ||
    loan.status === 'PENDING_MANUFACTURER_CONFIRMATION' ||
    loan.status === 'CHECKER_APPROVED';

  const canAttachDocument =
    loan.status === 'PENDING' ||
    loan.status === 'PENDING_MANUFACTURER_CONFIRMATION' ||
    loan.status === 'CHECKER_APPROVED';

  const handleCancelRequest = async () => {
    if (!confirm('Are you sure you want to cancel this financing request?')) return;
    setIsCancelling(true);
    try {
      await loanRequestsApi.cancelLoanRequest(loan.id);
      toast.success('Financing request cancelled successfully.');
      if (onCancelled) onCancelled();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to cancel request.'));
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPo(true);
    try {
      const res = await loanRequestsApi.attachPoDocument(loan.id, file);
      toast.success(res?.message || 'Purchase order document attached successfully.');
      setCurrentPoName(file.name);
      setCurrentPoUrl(loanRequestsApi.getDocumentDownloadUrl(file.name));
      if (onCancelled) onCancelled();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to attach purchase order document.'));
    } finally {
      setIsUploadingPo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      <div className="space-y-6 pt-2">
        {/* Closed-loop Lifecycle Tracker */}
        <LoanLifecycleTracker status={loan.status} rejectionReason={loan.rejectionReason} />

        {/* Trade Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Trade & Supplier Details
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
              Tenor & Scheduling
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

        {/* Attached Trade Documents Section */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Paperclip size={14} className="text-[#1F4DA8]" />
              Trade Documents & Verification
            </span>

            {canAttachDocument && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handlePoFileSelected}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPo}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1F4DA8] hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Upload size={12} />
                  {isUploadingPo ? 'Attaching...' : poDocUrl ? 'Replace PO File' : 'Attach PO Document'}
                </button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* PO Document Card */}
            <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={16} className="text-[#1F4DA8] shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">
                    {poDocName || (poDocUrl ? 'Purchase Order Document' : 'No PO document attached')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {poDocUrl ? 'Signed PO on record' : 'Attach signed PDF for faster bank review'}
                  </div>
                </div>
              </div>

              {poDocUrl && (
                <a
                  href={loanRequestsApi.getDocumentDownloadUrl(poDocUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-[#1F4DA8] bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors shrink-0"
                >
                  <ExternalLink size={11} /> View
                </a>
              )}
            </div>

            {/* Invoice Document Card */}
            <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Receipt size={16} className="text-amber-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">
                    {invDocUrl ? 'Proforma Invoice Document' : loan.invoiceNumber ? `Invoice #${loan.invoiceNumber}` : 'Pending invoice file'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {invDocUrl ? 'Attached Proforma Invoice' : 'Anchor Manufacturer Invoice'}
                  </div>
                </div>
              </div>

              {invDocUrl && (
                <a
                  href={loanRequestsApi.getDocumentDownloadUrl(invDocUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-amber-700 bg-white border border-amber-200 rounded-md hover:bg-amber-50 transition-colors shrink-0"
                >
                  <ExternalLink size={11} /> View
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Financial Breakdown Ledger */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 space-y-3">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-blue-100 pb-2">
            Repayment Ledger & Advance Rate Breakdown
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
              <span className="text-slate-600">Processing & Facility Fees:</span>
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