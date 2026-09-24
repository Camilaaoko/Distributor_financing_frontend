'use client';

import React, { useState, useEffect } from 'react';
import {
  Coins,
  Factory,
  Building2,
  Calendar,
  DollarSign,
  Percent,
  Receipt,
  FileText,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Calculator,
} from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput } from '@/components/ui/FormField';
import { DocumentDropzone } from '@/components/ui/DocumentDropzone';
import { useToast } from '@/components/ui/Toast';
import { loanRequestsApi, financingModelsApi } from '@/services/loans-api.service';
import { distributorApi } from '@/services/onboarding-api.service';
import type {
  FinancingModelResponse,
  FinancingQuoteResponse,
  LoanRequestCreateDTO,
} from '@/types/loans';
import type { ManufacturerResponse } from '@/types/onboarding';
import { getErrorMessage } from '@/lib/errors';

interface DrawdownApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  distributorId: string;
  availableCredit: number;
  onSuccess: () => void;
}

export function DrawdownApplicationModal({
  isOpen,
  onClose,
  distributorId,
  availableCredit,
  onSuccess,
}: DrawdownApplicationModalProps) {
  const toast = useToast();

  const [manufacturers, setManufacturers] = useState<ManufacturerResponse[]>([]);
  const [financingModels, setFinancingModels] = useState<FinancingModelResponse[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Form fields
  const [selectedManufacturerId, setSelectedManufacturerId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState<number | undefined>(undefined);
  const [invoiceAmountStr, setInvoiceAmountStr] = useState('');
  const [principalAmountStr, setPrincipalAmountStr] = useState('');
  const [tenorDays, setTenorDays] = useState(30);
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('');
  const [poFile, setPoFile] = useState<File | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [purpose, setPurpose] = useState('');

  // Quote & Upload State
  const [quote, setQuote] = useState<FinancingQuoteResponse | null>(null);
  const [isCalculatingQuote, setIsCalculatingQuote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Load Manufacturers & Financing Models
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setIsLoadingMetadata(true);
    setError(null);

    Promise.all([
      distributorApi.getWorkingManufacturers().catch(() => []),
      financingModelsApi.getActiveFinancingModels().catch(() => []),
    ])
      .then(([mfgs, modelsRes]) => {
        if (!cancelled) {
          const mList = Array.isArray(mfgs) ? mfgs : [];
          const rawModels = (modelsRes as any)?.result || modelsRes;
          const modelsList: FinancingModelResponse[] = Array.isArray(rawModels) ? rawModels : [];

          setManufacturers(mList);
          setFinancingModels(modelsList);

          if (mList.length > 0 && mList[0].id) setSelectedManufacturerId(mList[0].id);
          if (modelsList.length > 0 && modelsList[0].id) setSelectedModelId(modelsList[0].id);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMetadata(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Derived Advance Rate calculations
  const invoiceAmount = parseFloat(invoiceAmountStr) || 0;
  const advanceRate = 0.8; // Standard 80% advance rate
  const maxAllowedLoan = Math.round(invoiceAmount * advanceRate);
  const requestedPrincipal = parseFloat(principalAmountStr) || 0;

  // Real-time Quote calculation
  useEffect(() => {
    if (!invoiceAmount || invoiceAmount <= 0 || !distributorId) {
      setQuote(null);
      return;
    }

    let cancelled = false;
    setIsCalculatingQuote(true);

    const timer = setTimeout(() => {
      loanRequestsApi
        .getFinancingQuote({
          distributorId,
          financingModelId: selectedModelId,
          invoiceAmount,
        })
        .then((res) => {
          if (!cancelled) {
            const quoteData = (res as any)?.result || res;
            setQuote(quoteData);
          }
        })
        .catch(() => {
          // Fallback pro-rata interest calculation if backend quote endpoint is in mock/offline mode
          if (!cancelled) {
            const selectedModel = financingModels.find((m) => m.id === selectedModelId);
            const baseRate = selectedModel?.baseInterestRate ?? 12.0;
            const principal = requestedPrincipal > 0 ? requestedPrincipal : maxAllowedLoan;
            const interest = Math.round(principal * ((baseRate / 100 / 365) * tenorDays));
            const fees = Math.round(principal * 0.01); // 1% processing fee
            const dueDate = new Date(Date.now() + tenorDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            setQuote({
              distributorId,
              financingModelId: selectedModelId,
              invoiceAmount,
              eligibleLoanAmount: maxAllowedLoan,
              estimatedInterest: interest,
              estimatedFees: fees,
              estimatedTotalRepayment: principal + interest + fees,
              tenorDays,
            });
          }
        })
        .finally(() => {
          if (!cancelled) setIsCalculatingQuote(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [invoiceAmount, requestedPrincipal, selectedModelId, tenorDays, distributorId, financingModels, maxAllowedLoan]);

  // Sync default principal when invoice changes if untouched
  const handleInvoiceChange = (val: string) => {
    setInvoiceAmountStr(val);
    const num = parseFloat(val) || 0;
    const max = Math.round(num * advanceRate);
    setPrincipalAmountStr(max > 0 ? String(max) : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedManufacturerId) {
      setError('Please select an Anchor Manufacturer.');
      return;
    }
    if (invoiceAmount <= 0) {
      setError('Please enter a valid Proforma Invoice amount.');
      return;
    }
    if (requestedPrincipal <= 0) {
      setError('Please enter the financing principal amount requested.');
      return;
    }
    if (requestedPrincipal > maxAllowedLoan) {
      setError(`Principal exceeds the 80% Advance Rate maximum (KES ${maxAllowedLoan.toLocaleString()}).`);
      return;
    }
    if (availableCredit > 0 && requestedPrincipal > availableCredit) {
      setError(`Requested amount exceeds your available credit headroom (KES ${availableCredit.toLocaleString()}).`);
      return;
    }
    if (!purchaseOrderNumber.trim()) {
      setError('Purchase Order Number is required for closed-loop trade financing.');
      return;
    }
    if (!purpose.trim()) {
      setError('Please provide a brief description / purpose for the inventory financing.');
      return;
    }

    setIsSubmitting(true);
    setUploadStatus('Uploading trade documents...');
    try {
      let purchaseOrderDocumentUrl: string | undefined = undefined;
      let purchaseOrderFileName: string | undefined = undefined;
      let invoiceUrl: string | undefined = undefined;

      // 1. Upload PO Document if selected
      if (poFile) {
        setUploadStatus('Uploading Purchase Order document...');
        try {
          const poUploadRes = await loanRequestsApi.uploadDocument(poFile, 'PURCHASE_ORDER');
          const poResult = (poUploadRes as any)?.result || poUploadRes;
          purchaseOrderDocumentUrl = poResult?.downloadUrl || poResult?.fileUrl || poResult?.documentUrl;
          purchaseOrderFileName = poResult?.fileName || poFile.name;
        } catch (uploadErr) {
          console.warn('Individual document upload endpoint failed, will attempt combined multipart payload', uploadErr);
        }
      }

      // 2. Upload Proforma Invoice Document if selected
      if (invoiceFile) {
        setUploadStatus('Uploading Proforma Invoice document...');
        try {
          const invUploadRes = await loanRequestsApi.uploadDocument(invoiceFile, 'INVOICE');
          const invResult = (invUploadRes as any)?.result || invUploadRes;
          invoiceUrl = invResult?.downloadUrl || invResult?.fileUrl || invResult?.documentUrl;
        } catch (uploadErr) {
          console.warn('Invoice upload failed', uploadErr);
        }
      }

      setUploadStatus('Submitting financing application...');
      const payload: LoanRequestCreateDTO = {
        distributorId,
        createdByUserId: distributorId,
        manufacturerId: selectedManufacturerId,
        financingModelId: selectedModelId,
        principalAmount: requestedPrincipal,
        invoiceAmount,
        tenorDays,
        purchaseOrderNumber: purchaseOrderNumber.trim(),
        purchaseOrderDocumentUrl,
        purchaseOrderFileName,
        invoiceNumber: invoiceNumber.trim() || undefined,
        invoiceUrl,
        invoiceDate: invoiceDate || undefined,
        invoiceDueDate: invoiceDueDate || undefined,
        purpose: purpose.trim(),
        maxFinancingPercentage: advanceRate * 100,
      };

      // If poFile was selected but standalone upload was not supported, use 1-step combined upload
      let res;
      if (poFile && !purchaseOrderDocumentUrl) {
        res = await loanRequestsApi.createLoanRequestWithDocument(poFile, payload);
      } else {
        res = await loanRequestsApi.createLoanRequest(payload);
      }

      toast.success(res?.message || 'Financing application submitted successfully.');
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit loan application. Please check your credit headroom.'));
    } finally {
      setIsSubmitting(false);
      setUploadStatus('');
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Apply for Inventory Financing"
      description="Request trade credit against an anchor manufacturer purchase order."
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
            <div>{error}</div>
          </div>
        )}

        {/* Closed-Loop Notice */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#1F4DA8]">
          <ShieldCheck size={18} className="shrink-0 mt-0.5 text-[#1F4DA8]" />
          <div>
            <strong className="font-bold">Closed-Loop Supplier Settlement:</strong> Loan proceeds are disbursed directly to your Anchor Manufacturer's verified settlement account upon proforma invoice confirmation.
          </div>
        </div>

        {/* Section 1: Partner Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Anchor Manufacturer <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedManufacturerId}
              onChange={(e) => setSelectedManufacturerId(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8]"
            >
              {manufacturers.length === 0 ? (
                <option value="">No working manufacturers found</option>
              ) : (
                manufacturers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.businessPermitNumber || 'Anchor Supplier'})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Financing Model & Rate <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedModelId || ''}
              onChange={(e) => setSelectedModelId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8]"
            >
              {financingModels.length === 0 ? (
                <option value="">Standard 30-Day Revolving Line (12.0% p.a.)</option>
              ) : (
                financingModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.baseInterestRate}% p.a.
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Section 2: Financial Calculation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <FormField label="Invoice Total (KES)" required>
              <TextInput
                type="number"
                placeholder="1,000,000"
                value={invoiceAmountStr}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                min="1"
                required
              />
            </FormField>
            <div className="text-[10px] text-slate-400 mt-1">Total supplier PO value</div>
          </div>

          <div>
            <FormField label="Requested Loan (KES)" required>
              <TextInput
                type="number"
                placeholder="800,000"
                value={principalAmountStr}
                onChange={(e) => setPrincipalAmountStr(e.target.value)}
                min="1"
                required
              />
            </FormField>
            <div className="text-[10px] text-amber-600 font-semibold mt-1">
              Max 80% Advance: KES {maxAllowedLoan.toLocaleString()}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tenor (Days) <span className="text-rose-500">*</span>
            </label>
            <select
              value={tenorDays}
              onChange={(e) => setTenorDays(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8]"
            >
              <option value={15}>15 Days (Short Cycle)</option>
              <option value={30}>30 Days (Standard FMCG)</option>
              <option value={45}>45 Days (Extended Turn)</option>
              <option value={60}>60 Days (Maximum Tenor)</option>
            </select>
          </div>
        </div>

        {/* Live Instant Quote Banner */}
        {quote && invoiceAmount > 0 && (
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-indigo-100 pb-2">
              <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                <Calculator size={14} className="text-indigo-600" />
                Single Bullet Repayment Projection
              </span>
              <span className="text-slate-500 font-medium">
                Due: <strong className="text-slate-900">{new Date(Date.now() + tenorDays * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Principal</span>
                <span className="font-bold text-slate-900">KES {(requestedPrincipal || maxAllowedLoan).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Daily Pro-Rata Interest</span>
                <span className="font-bold text-slate-900">KES {quote.estimatedInterest?.toLocaleString() ?? 0}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Processing Fees</span>
                <span className="font-bold text-slate-900">KES {quote.estimatedFees?.toLocaleString() ?? 0}</span>
              </div>
              <div>
                <span className="text-indigo-700 font-bold block text-[11px]">Total Bullet Due</span>
                <span className="font-black text-indigo-700">KES {(quote.estimatedTotalRepayment || ((requestedPrincipal || maxAllowedLoan) + (quote.estimatedInterest || 0) + (quote.estimatedFees || 0))).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Trade Documents & References */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Purchase Order (PO) Number" required>
              <TextInput
                placeholder="PO-2026-0891"
                value={purchaseOrderNumber}
                onChange={(e) => setPurchaseOrderNumber(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Proforma Invoice Number">
              <TextInput
                placeholder="INV-EABL-9921 (Optional)"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </FormField>
          </div>

          {/* Document Upload Dropzones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DocumentDropzone
              label="Signed Purchase Order Document"
              hint="Official stamped PO (.pdf, .png, .jpg)"
              file={poFile}
              onFileSelect={setPoFile}
              accept=".pdf,.png,.jpg,.jpeg"
              disabled={isSubmitting}
            />

            <DocumentDropzone
              label="Proforma Invoice Document"
              hint="Optional supplier invoice (.pdf, .png, .jpg)"
              file={invoiceFile}
              onFileSelect={setInvoiceFile}
              accept=".pdf,.png,.jpg,.jpeg"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <FormField label="Financing Purpose & Consignment Details" required>
          <TextInput
            placeholder="Procurement of beverage and FMCG inventory for depot distribution"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          />
        </FormField>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 font-medium">
            {uploadStatus && (
              <span className="text-[#1F4DA8] font-semibold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#1F4DA8]" />
                {uploadStatus}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ModalButton variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </ModalButton>
            <ModalButton variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? uploadStatus || 'Submitting...' : 'Submit Financing Request'}
            </ModalButton>
          </div>
        </div>
      </form>
    </Modal>
  );
}