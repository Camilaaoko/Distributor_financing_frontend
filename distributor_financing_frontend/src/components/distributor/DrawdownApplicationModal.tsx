'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Calculator,
  Upload,
  Paperclip,
  AlertCircle,
} from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import { loanRequestsApi, financingModelsApi, facilitiesApi } from '@/services/loans-api.service';
import { distributorApi } from '@/services/onboarding-api.service';
import { useAuth } from '@/hooks/useAuth';
import { resolveDistributorContext } from '@/lib/distributor-resolver';
import type {
  FinancingModelResponse,
  FinancingQuoteResponse,
  LoanRequestCreateDTO,
} from '@/types/loans';
import type { ManufacturerResponse } from '@/types/onboarding';
import { getErrorMessage } from '@/lib/errors';
import {
  getTierFromCreditScore,
  getTierConfig,
  type DistributorTier,
} from '@/lib/tiers';
import { DistributorTierBadge } from './DistributorTierBadge';

interface DrawdownApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  distributorId: string;
  availableCredit: number;
  creditScore?: number | null;
  tier?: DistributorTier | string | null;
  maxFinancingPercentage?: number | null;
  onSuccess: () => void;
}

export function DrawdownApplicationModal({
  isOpen,
  onClose,
  distributorId,
  availableCredit,
  creditScore,
  tier,
  maxFinancingPercentage,
  onSuccess,
}: DrawdownApplicationModalProps) {
  const toast = useToast();
  const auth = useAuth();

  const [resolvedDistId, setResolvedDistId] = useState<string>(() => {
    if (distributorId && !distributorId.includes('@')) return distributorId;
    const userEmail = auth?.user?.email?.toLowerCase().trim();
    if (userEmail && typeof window !== 'undefined') {
      const userScoped = localStorage.getItem(`dfp_dist_id_${userEmail}`);
      if (userScoped && !userScoped.includes('@')) return userScoped;
    }
    const fromAuth = auth?.user?.distributorId;
    return fromAuth && !fromAuth.includes('@') ? fromAuth : '';
  });
  const [resolvedFacilityId, setResolvedFacilityId] = useState<number | undefined>(undefined);

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
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate] = useState('');
  const [invoiceDueDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [poFile, setPoFile] = useState<File | null>(null);

  // Quote State
  const [quote, setQuote] = useState<FinancingQuoteResponse | null>(null);
  const [isCalculatingQuote, setIsCalculatingQuote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolve entity ID and active facility on open
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    (async () => {
      try {
        const ctx = await resolveDistributorContext(auth?.user?.email, distributorId || resolvedDistId);
        if (!cancelled) {
          if (ctx.distributorId && !ctx.distributorId.includes('@')) {
            setResolvedDistId(ctx.distributorId);
          }
          if (ctx.facilityId) {
            setResolvedFacilityId(ctx.facilityId);
          }
        }
      } catch {
        // fallback silently
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, distributorId, auth?.user?.email, resolvedDistId]);

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

          if (mList.length > 0) setSelectedManufacturerId(mList[0].id);
          if (modelsList.length > 0) setSelectedModelId(modelsList[0].id);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMetadata(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Active tier & dynamic advance rate calculation
  const resolvedTier = tier || getTierFromCreditScore(creditScore);
  const tierConfig = getTierConfig(resolvedTier);

  const advanceRate =
    typeof maxFinancingPercentage === 'number' && maxFinancingPercentage > 0
      ? maxFinancingPercentage / 100
      : tierConfig.name === 'Platinum'
      ? 0.90
      : tierConfig.name === 'Gold'
      ? 0.80
      : tierConfig.name === 'Silver'
      ? 0.70
      : 0.60;

  const advanceRatePercent = Math.round(advanceRate * 100);

  // Derived Advance Rate calculations
  const invoiceAmount = parseFloat(invoiceAmountStr) || 0;
  const maxAllowedLoan = Math.round(invoiceAmount * advanceRate);
  const requestedPrincipal = parseFloat(principalAmountStr) || 0;

  const effectiveDistIdForQuote = resolvedDistId || (distributorId && !distributorId.includes('@') ? distributorId : '');

  // Real-time Quote calculation
  useEffect(() => {
    if (!invoiceAmount || invoiceAmount <= 0) {
      setQuote(null);
      return;
    }

    let cancelled = false;
    setIsCalculatingQuote(true);

    const timer = setTimeout(() => {
      loanRequestsApi
        .getFinancingQuote({
          distributorId: effectiveDistIdForQuote || distributorId || 'dist-001',
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
          if (!cancelled) {
            const selectedModel = financingModels.find((m) => m.id === selectedModelId);
            const baseRate = selectedModel?.baseInterestRate ?? 12.0;
            const principal = requestedPrincipal > 0 ? requestedPrincipal : maxAllowedLoan;
            const interest = Math.round(principal * ((baseRate / 100 / 365) * tenorDays));
            const fees = Math.round(principal * 0.01);
            setQuote({
              distributorId: effectiveDistIdForQuote || distributorId || 'dist-001',
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
  }, [invoiceAmount, requestedPrincipal, selectedModelId, tenorDays, effectiveDistIdForQuote, distributorId, financingModels, maxAllowedLoan]);

  const handleInvoiceChange = (val: string) => {
    setInvoiceAmountStr(val);
    const num = parseFloat(val) || 0;
    const max = Math.round(num * advanceRate);
    setPrincipalAmountStr(max > 0 ? String(max) : '');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPoFile(e.target.files[0]);
    }
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
      setError(`Principal exceeds the ${advanceRatePercent}% Advance Rate maximum for ${tierConfig.label} Tier (KES ${maxAllowedLoan.toLocaleString()}).`);
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
    try {
      // 1. Resolve effective entity ID and facility ID
      let effectiveDistId = resolvedDistId && !resolvedDistId.includes('@') ? resolvedDistId : '';
      let effectiveFacilityId = resolvedFacilityId;

      if (!effectiveDistId || !effectiveFacilityId) {
        try {
          const freshCtx = await resolveDistributorContext(auth?.user?.email, auth?.user?.distributorId);
          if (freshCtx.distributorId && !freshCtx.distributorId.includes('@')) {
            effectiveDistId = freshCtx.distributorId;
            setResolvedDistId(freshCtx.distributorId);
          }
          if (freshCtx.facilityId) {
            effectiveFacilityId = freshCtx.facilityId;
            setResolvedFacilityId(freshCtx.facilityId);
          }
        } catch {
          // continue
        }
      }

      if (!effectiveDistId || effectiveDistId.includes('@')) {
        setError('Unable to verify distributor identity. Please ensure you are logged in with an active distributor account.');
        setIsSubmitting(false);
        return;
      }

      const payload: LoanRequestCreateDTO = {
        distributorId: effectiveDistId,
        facilityId: effectiveFacilityId,
        createdByUserId: auth?.user?.userId || auth?.user?.username || auth?.user?.email || effectiveDistId,
        manufacturerId: selectedManufacturerId,
        financingModelId: selectedModelId,
        principalAmount: requestedPrincipal,
        invoiceAmount,
        tenorDays,
        purchaseOrderNumber: purchaseOrderNumber.trim(),
        invoiceNumber: invoiceNumber.trim() || undefined,
        invoiceDate: invoiceDate || undefined,
        invoiceDueDate: invoiceDueDate || undefined,
        purpose: purpose.trim(),
        maxFinancingPercentage: advanceRate * 100,
      };

      console.log('[DISTRIBUTOR_IDENTITY] Submitting loan request:', {
        authenticatedUserId: auth?.user?.userId,
        authenticatedUsername: auth?.user?.username,
        authenticatedEmail: auth?.user?.email,
        resolvedDistributorId: effectiveDistId,
        loanRequestDistributorId: payload.distributorId,
        facilityId: payload.facilityId,
        principalAmount: payload.principalAmount,
        invoiceAmount: payload.invoiceAmount,
      });

      let res;
      if (poFile) {
        res = await loanRequestsApi.createLoanRequestWithDocument(payload, poFile);
      } else {
        res = await loanRequestsApi.createLoanRequest(payload);
      }

      console.log('[DISTRIBUTOR_IDENTITY] Loan request response received:', res);

      toast.success(res?.message || 'Financing application submitted successfully.');
      onClose();
      setTimeout(() => onSuccess(), 400);
    } catch (err: any) {
      const rawMsg = String(err?.response?.data?.message || err?.message || '');
      if (rawMsg.includes('Facility not found')) {
        setError(
          'No active credit facility found for your distributor account. Please ensure your partner bank has approved and activated your revolving facility.'
        );
      } else {
        setError(getErrorMessage(err, 'Failed to submit loan application. Please check your credit headroom.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Apply for Inventory Financing"
      description="Request trade credit against an approved anchor manufacturer purchase order."
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
            <div>{error}</div>
          </div>
        )}

        {/* Closed-Loop Notice & Dynamic Tier Privilege Banner */}
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-blue-50/90 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5 text-[#1F4DA8]">
            <ShieldCheck size={20} className="shrink-0 mt-0.5 text-[#1F4DA8]" />
            <div>
              <strong className="font-bold">Direct Anchor Manufacturer Settlement:</strong> Loan proceeds are disbursed directly to your Anchor Manufacturer&apos;s verified settlement account upon proforma invoice confirmation.
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <DistributorTierBadge
              tier={resolvedTier}
              creditScore={creditScore}
              showScore={typeof creditScore === 'number' && creditScore > 0}
              size="sm"
            />
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              {advanceRatePercent}% Max Advance
            </span>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Anchor Manufacturer" required>
            <select
              value={selectedManufacturerId}
              onChange={(e) => setSelectedManufacturerId(e.target.value)}
              required
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1F4DA8] focus:outline-none"
              disabled={isLoadingMetadata}
            >
              {manufacturers.length === 0 ? (
                <option value="">No anchor manufacturers found</option>
              ) : (
                manufacturers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.location ? `(${m.location})` : ''}
                  </option>
                ))
              )}
            </select>
          </FormField>

          <FormField label="Financing Model & Rate" required>
            <select
              value={selectedModelId || ''}
              onChange={(e) => setSelectedModelId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1F4DA8] focus:outline-none"
              disabled={isLoadingMetadata}
            >
              {financingModels.length === 0 ? (
                <option value="">Standard Revolving Facility (12% p.a.)</option>
              ) : (
                financingModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name || (model as any).modelName || 'Financing Model'} ({model.baseInterestRate}% p.a.)
                  </option>
                ))
              )}
            </select>
          </FormField>
        </div>

        {/* Financial Inputs: Invoice Amount & Principal Requested */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            label="Invoice Total (KES)"
            required
            hint="Total manufacturer PO / proforma value"
          >
            <TextInput
              type="number"
              placeholder="e.g. 1000000"
              value={invoiceAmountStr}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              min="1000"
              required
            />
          </FormField>

          <FormField
            label="Requested Loan (KES)"
            required
            hint={`Max ${advanceRatePercent}% Advance (${tierConfig.name}): ${
              maxAllowedLoan > 0 ? `KES ${maxAllowedLoan.toLocaleString()}` : '—'
            }`}
          >
            <TextInput
              type="number"
              placeholder="e.g. 800000"
              value={principalAmountStr}
              onChange={(e) => setPrincipalAmountStr(e.target.value)}
              max={maxAllowedLoan > 0 ? maxAllowedLoan : undefined}
              min="1000"
              required
            />
          </FormField>

          <FormField label="Tenor (Days)" required>
            <select
              value={tenorDays}
              onChange={(e) => setTenorDays(Number(e.target.value))}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1F4DA8] focus:outline-none"
            >
              <option value={15}>15 Days (Quick Turn)</option>
              <option value={30}>30 Days (Standard Bullet)</option>
              <option value={45}>45 Days (Extended Turn)</option>
              <option value={60}>60 Days (Two Months)</option>
              <option value={90}>90 Days (Quarterly Cycle)</option>
            </select>
          </FormField>
        </div>

        {/* Projected Financial Breakdown / Quote */}
        {quote && (
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calculator size={14} className="text-[#1F4DA8]" />
                Single Bullet Repayment Projection
              </span>
              {isCalculatingQuote ? (
                <span className="text-[10px] text-slate-400 animate-pulse">Recalculating...</span>
              ) : quote.dueDate ? (
                <span className="text-[10px] text-slate-500 font-medium">
                  Due: <strong className="text-slate-800">{new Date(quote.dueDate).toLocaleDateString()}</strong>
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block">Principal</span>
                <strong className="text-slate-900 font-bold">
                  KES {(requestedPrincipal || quote.eligibleLoanAmount || maxAllowedLoan).toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Daily Pro-Rata Interest</span>
                <strong className="text-slate-800">
                  KES {(quote.estimatedInterest || 0).toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Processing Fees</span>
                <strong className="text-slate-800">
                  KES {(quote.estimatedFees || 0).toLocaleString()}
                </strong>
              </div>
              <div className="border-l border-slate-200/80 pl-3">
                <span className="text-[11px] text-indigo-900 font-bold block">Total Bullet Due</span>
                <strong className="text-indigo-700 font-black text-sm">
                  KES {(quote.estimatedTotalRepayment || ((requestedPrincipal || quote.eligibleLoanAmount || maxAllowedLoan) + (quote.estimatedInterest || 0) + (quote.estimatedFees || 0))).toLocaleString()}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* PO and Invoice Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Purchase Order (PO) Number" required>
            <TextInput
              placeholder="e.g. PO-2026-8941"
              value={purchaseOrderNumber}
              onChange={(e) => setPurchaseOrderNumber(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Proforma Invoice Number" hint="If already issued by manufacturer">
            <TextInput
              placeholder="e.g. PI-77342"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </FormField>
        </div>

        {/* PO Document Upload */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>Signed Purchase Order Document (Optional)</span>
            <span className="text-[10px] text-slate-400">PDF, PNG, JPG up to 10MB</span>
          </label>
          <div className="relative border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors text-center cursor-pointer">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-1.5 text-xs text-slate-500">
              {poFile ? (
                <>
                  <Paperclip size={18} className="text-[#1F4DA8]" />
                  <span className="font-bold text-slate-800">{poFile.name}</span>
                  <span className="text-[10px] text-slate-400">({(poFile.size / 1024).toFixed(1)} KB)</span>
                </>
              ) : (
                <>
                  <Upload size={18} className="text-slate-400" />
                  <span>Click or drag and drop signed purchase order document here</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Purpose */}
        <FormField label="Financing Purpose / Remarks" required>
          <textarea
            rows={2}
            placeholder="e.g. Fast-moving beverage stock procurement ahead of holiday cycle."
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1F4DA8] focus:outline-none"
            required
          />
        </FormField>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <ModalButton variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </ModalButton>
          <ModalButton type="submit" variant="primary" loading={isSubmitting}>
            Submit Financing Application
          </ModalButton>
        </div>
      </form>
    </Modal>
  );
}
