'use client';

import React from 'react';
import { ShieldCheck, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { DocumentUpload } from '@/services/onboarding.service';

interface ReviewSubmitStepProps {
  formData: {
    distributorName: string;
    branchAddress: string;
    registrationNumber: string;
    firstName: string;
    lastName: string;
    contactEmail: string;
    contactPhone: string;
    employeeId: string;
    hasExistingBankAccount: boolean | null;
    existingAccountNumber: string;
    consentToCreateBankAccount: boolean;
    nationalId: string;
    documents: DocumentUpload[];
    manufacturerId: string;
  };
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  handleInputChange: (field: string, value: string) => void;
  handleBack: () => void;
  onEditStep?: (stepNumber: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function maskAccountNumber(acc: string): string {
  if (!acc) return '';
  const trimmed = acc.trim();
  if (trimmed.length <= 4) return '••••' + trimmed;
  return '••••' + trimmed.slice(-4);
}

function maskNationalId(id: string): string {
  if (!id) return '';
  const trimmed = id.trim();
  if (trimmed.length <= 4) return '••••' + trimmed;
  return '••••' + trimmed.slice(-4);
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'uploaded':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Uploaded
        </span>
      );
    case 'uploading':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
          <Clock className="w-3 h-3 text-blue-600 animate-spin" />
          Uploading
        </span>
      );
    case 'error':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Error
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
          Pending
        </span>
      );
  }
}

export function ReviewSubmitStep({
  formData,
  formErrors,
  isSubmitting,
  handleBack,
  onEditStep,
  onSubmit,
}: ReviewSubmitStepProps) {
  const goToStep = (stepNumber: number) => {
    if (onEditStep) {
      onEditStep(stepNumber);
    } else {
      handleBack();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Contact & Address Review */}
      <section className="border border-[#E2E8F0] rounded-xl p-5 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]">
          <h3 className="text-base font-semibold text-[#1E293B] flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#1F4DA8]" />
            1. Contact &amp; Address
          </h3>
          <button
            type="button"
            onClick={() => goToStep(1)}
            className="text-xs font-semibold text-[#1F4DA8] hover:text-[#3A6FD8] px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Edit
          </button>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs font-medium text-[#64748B]">Distributor Name</dt>
            <dd className="font-semibold text-[#1E293B] mt-0.5">{formData.distributorName || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748B]">Branch/Location Address</dt>
            <dd className="font-semibold text-[#1E293B] mt-0.5">{formData.branchAddress || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748B]">Distributor Registration No.</dt>
            <dd className="font-semibold font-mono text-[#1E293B] mt-0.5">{formData.registrationNumber || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748B]">First Name</dt>
            <dd className="font-semibold text-[#1E293B] mt-0.5">{formData.firstName || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748B]">Last Name</dt>
            <dd className="font-semibold text-[#1E293B] mt-0.5">{formData.lastName || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748B]">Corporate Email</dt>
            <dd className="font-semibold text-[#1E293B] mt-0.5">{formData.contactEmail || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748B]">Phone Number</dt>
            <dd className="font-semibold text-[#1E293B] mt-0.5">{formData.contactPhone || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748B]">Employee ID</dt>
            <dd className="font-semibold font-mono text-[#1E293B] mt-0.5">{formData.employeeId || '—'}</dd>
          </div>
        </dl>
      </section>

      {/* 2. Banking Details Review */}
      <section className="border border-[#E2E8F0] rounded-xl p-5 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]">
          <h3 className="text-base font-semibold text-[#1E293B] flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#1F4DA8]" />
            2. Banking Details
          </h3>
          <button
            type="button"
            onClick={() => goToStep(2)}
            className="text-xs font-semibold text-[#1F4DA8] hover:text-[#3A6FD8] px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Edit
          </button>
        </div>

        {formData.hasExistingBankAccount === true ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs font-medium text-[#64748B]">Existing bank account</dt>
              <dd className="font-semibold text-[#1E293B] mt-0.5">Yes</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[#64748B]">Account Number</dt>
              <dd className="font-semibold font-mono text-[#1E293B] mt-0.5">
                {maskAccountNumber(formData.existingAccountNumber)}
              </dd>
            </div>
          </dl>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-xs font-medium text-[#64748B]">Existing bank account</dt>
              <dd className="font-semibold text-[#1E293B] mt-0.5">No</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[#64748B]">New bank account required</dt>
              <dd className="font-semibold text-[#1E293B] mt-0.5">Yes</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[#64748B]">Consent provided</dt>
              <dd className="font-semibold text-[#1E293B] mt-0.5">
                {formData.consentToCreateBankAccount ? 'Yes' : 'No'}
              </dd>
            </div>
          </dl>
        )}
      </section>

      {/* 3. Business & KYC Review */}
      <section className="border border-[#E2E8F0] rounded-xl p-5 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]">
          <h3 className="text-base font-semibold text-[#1E293B] flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#1F4DA8]" />
            3. Business &amp; KYC
          </h3>
          <button
            type="button"
            onClick={() => goToStep(3)}
            className="text-xs font-semibold text-[#1F4DA8] hover:text-[#3A6FD8] px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Edit
          </button>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs font-medium text-[#64748B]">National ID</dt>
            <dd className="font-semibold font-mono text-[#1E293B] mt-0.5">
              {maskNationalId(formData.nationalId)}
            </dd>
          </div>
        </dl>
      </section>

      {/* 4. Uploaded Documents Review */}
      <section className="border border-[#E2E8F0] rounded-xl p-5 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]">
          <h3 className="text-base font-semibold text-[#1E293B] flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#1F4DA8]" />
            4. Uploaded Documents
          </h3>
          <button
            type="button"
            onClick={() => goToStep(4)}
            className="text-xs font-semibold text-[#1F4DA8] hover:text-[#3A6FD8] px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Edit
          </button>
        </div>

        {formData.documents.length === 0 ? (
          <p className="text-sm text-[#64748B] text-center py-4">No documents uploaded.</p>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {formData.documents.map((doc) => (
              <div key={doc.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1E293B] truncate">{doc.documentType}</p>
                    <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
                      {doc.fileName ? (
                        <>
                          <span className="font-mono truncate max-w-[200px]">{doc.fileName}</span>
                          <span>•</span>
                          <span>{formatFileSize(doc.fileSize)}</span>
                        </>
                      ) : (
                        <span>Not uploaded</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="shrink-0">{getStatusBadge(doc.status)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Submission Consent Disclaimer */}
      <div className="bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl p-4 text-xs text-[#64748B] space-y-1.5">
        <p className="font-semibold text-[#1E293B]">Submission Confirmation</p>
        <p>
          By submitting this application, you verify that the information provided is accurate and consent to data processing for financing disbursement assessment.
        </p>
      </div>

      {formErrors.general && (
        <div className="text-sm font-medium text-[#DC2626] bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5" role="alert">
          {formErrors.general}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-[#1F4DA8] hover:bg-[#3A6FD8] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm shadow-[#1F4DA8]/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting Application…
            </>
          ) : (
            <>
              Submit Application
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}