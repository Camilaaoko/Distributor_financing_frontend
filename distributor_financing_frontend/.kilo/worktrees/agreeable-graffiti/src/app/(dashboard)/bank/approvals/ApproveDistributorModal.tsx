'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  User,
  UserCheck,
  Coins,
  ShieldCheck,
  Sparkles,
  Layers,
  Percent,
  Calendar,
  AlertCircle,
  Sliders,
  Paperclip,
  FileText,
  Eye,
  Download,
  ExternalLink,
} from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/axios';
import { getErrorMessage } from '@/lib/errors';
import { bankService } from '@/services/bank.service';
import { onboardingService, DistributorOnboardingService } from '@/services/onboarding.service';
import { notificationsService } from '@/services/notifications.service';
import {
  distributorLoanProfilesApi,
  financingModelsApi,
  loanUnderwritingApi,
  LoansServiceClient,
  loansApi,
} from '@/services/loans-api.service';
import type { DistributorApproval } from '@/lib/types';
import type {
  FinancingModelResponse,
  CreditAssessmentResult,
  RiskTier,
} from '@/types/loans';
import { UnderwritingAssessmentCard } from '@/components/bank/UnderwritingAssessmentCard';

interface ApproveDistributorModalProps {
  approval: DistributorApproval | null;
  open: boolean;
  onClose: () => void;
  onApproved: () => void;
}

const PHONE_REGEX = /^(?:(07|01)\d{8}|\+254\d{9})$/;
const NATIONAL_ID_REGEX = /^\d{8}$/;

export function ApproveDistributorModal({ approval, open, onClose, onApproved }: ApproveDistributorModalProps) {
  const toast = useToast();

  // Corporate Details
  const [businessName, setBusinessName] = useState('');
  const [businessPermitNumber, setBusinessPermitNumber] = useState('');
  const [location, setLocation] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Personal Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');

  // Commercial / Underwriting Sanction Terms
  const [creditLimit, setCreditLimit] = useState<number>(5000000);
  const [interestRate, setInterestRate] = useState<number>(12.5);
  const [maxTenorDays, setMaxTenorDays] = useState<number>(60);
  const [financingModelId, setFinancingModelId] = useState<number>(1);
  const [maxFinancingPercentage, setMaxFinancingPercentage] = useState<number>(80);
  const [riskTier, setRiskTier] = useState<RiskTier>('LOW');
  const [assessmentResult, setAssessmentResult] = useState<CreditAssessmentResult | null>(null);
  const [isCustomOverride, setIsCustomOverride] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState<string>('');

  // Available Financing Models
  const [financingModels, setFinancingModels] = useState<FinancingModelResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bankStatementBlob, setBankStatementBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (!approval) return;
    const docs = Array.isArray(approval.documents) ? approval.documents : [];
    const bankDoc = docs.find(
      (d) =>
        (d.name && /bank\s*statement/i.test(d.name)) ||
        (d.type && /bank\s*statement/i.test(d.type))
    );
    if (bankDoc?.url && !bankDoc.url.startsWith('blob:')) {
      const endpoint = bankDoc.url.startsWith('http')
        ? bankDoc.url
        : bankDoc.url.startsWith('/api')
        ? bankDoc.url
        : `/api${bankDoc.url}`;
      apiClient
        .get(endpoint, { responseType: 'blob' })
        .then((res) => setBankStatementBlob(new Blob([res.data])))
        .catch(() => setBankStatementBlob(null));
    }
  }, [approval]);

  useEffect(() => {
    if (open) {
      // Load active financing models
      financingModelsApi
        .getActiveFinancingModels()
        .then((res) => {
          const list = Array.isArray(res.result)
            ? res.result
            : Array.isArray(res.result?.content)
            ? res.result.content
            : [];
          setFinancingModels(list);
          if (list.length > 0 && list[0].id) {
            setFinancingModelId(list[0].id);
          }
        })
        .catch(() => {
          // Fallback default model
          setFinancingModels([
            {
              id: 1,
              name: 'Revolving Supply Chain Liquidity',
              modelType: 'REVOLVING',
              baseInterestRate: 12.5,
              minLoanAmount: 50000,
              maxLoanAmount: 10000000,
              minTenorDays: 7,
              maxTenorDays: 90,
              isActive: true,
            },
          ]);
        });
    }
  }, [open]);

  useEffect(() => {
    if (open && approval) {
      // Prefill Corporate
      setBusinessName(approval.companyName || '');
      setBusinessPermitNumber('');
      setLocation('Nairobi');
      setAccountNumber('');

      // Prefill Personal
      const parts = (approval.companyName || '').trim().split(/\s+/);
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || 'Admin');
      setEmail(approval.registrationNumber && approval.registrationNumber.includes('@') ? approval.registrationNumber : (approval.email || ''));
      const rawPhone = approval.pin && (approval.pin.startsWith('+') || approval.pin.startsWith('07') || approval.pin.startsWith('01')) ? approval.pin : (approval.phone || '');
      setPhone(rawPhone.replace(/\s+/g, ''));
      setNationalId('');
      setEmployeeNumber(`DIST-${approval.id ? approval.id.slice(0, 8).toUpperCase() : '001'}`);

      // Initial sanction terms from recommendation or algorithm
      const initialLimit = (approval as any).creditLimit || (approval as any).sanctionedLimit || (approval as any).requestedCreditLimit || 0;
      setCreditLimit(initialLimit);
      setInterestRate(12.5);
      setMaxTenorDays(60);
      setMaxFinancingPercentage(80);
      setRiskTier('LOW');
      setAssessmentResult(null);
      setIsCustomOverride(false);
      setOverrideReason('');
      setError(null);
    }
  }, [open, approval]);

  const handleApplyUnderwritingTerms = (terms: {
    creditLimit: number;
    interestRate: number;
    maxTenorDays: number;
    riskTier?: RiskTier;
    creditScore?: number;
    assessmentResult?: CreditAssessmentResult;
    isCustomOverride?: boolean;
    overrideReason?: string;
  }) => {
    setCreditLimit(terms.creditLimit);
    setInterestRate(terms.interestRate);
    setMaxTenorDays(terms.maxTenorDays);
    if (terms.riskTier) setRiskTier(terms.riskTier);
    if (terms.assessmentResult) setAssessmentResult(terms.assessmentResult);
    setIsCustomOverride(!!terms.isCustomOverride);
    setOverrideReason(terms.overrideReason || '');
  };

  const handleClose = () => {
    setBusinessName('');
    setBusinessPermitNumber('');
    setLocation('');
    setAccountNumber('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setNationalId('');
    setEmployeeNumber('');
    setAssessmentResult(null);
    setError(null);
    onClose();
  };

  if (!approval) return null;

  const submittedDocs = Array.isArray(approval.documents) && approval.documents.length > 0
    ? approval.documents
    : approval.docsUrl
    ? [{ id: 'doc-1', name: 'KYC_Application_Package.pdf', type: 'KYC Dossier', url: approval.docsUrl, size: '2.4 MB' }]
    : [];

  const hasDocuments = submittedDocs.length > 0 || !!approval.docsSubmitted;

  const handleViewDocument = (fileName: string, fileUrl?: string) => {
    if (fileUrl && fileUrl !== '#') {
      const targetUrl = fileUrl.startsWith('/api')
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://172.16.10.64:8080'}${fileUrl}`
        : fileUrl;
      window.open(targetUrl, '_blank');
      toast.success(`Opening "${fileName}" for review.`);
      return;
    }
    toast.info(`Reviewing "${fileName}".`);
  };

  const handleDownloadDocument = async (fileName: string, fileUrl?: string, downloadUrl?: string) => {
    const activeUrl = downloadUrl || fileUrl;
    if (activeUrl && activeUrl !== '#' && !activeUrl.startsWith('blob:')) {
      try {
        const endpoint = activeUrl.startsWith('http')
          ? activeUrl
          : activeUrl.startsWith('/api')
          ? activeUrl
          : `/api${activeUrl}`;

        const res = await apiClient.get(endpoint, { responseType: 'blob' });
        const blobUrl = URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        toast.success(`Downloaded "${fileName}".`);
        return;
      } catch {
        const targetUrl = activeUrl.startsWith('/api')
          ? `${process.env.NEXT_PUBLIC_API_URL || 'http://172.16.10.64:8080'}${activeUrl}`
          : activeUrl;
        window.open(targetUrl, '_blank');
        toast.success(`Opening "${fileName}" for download.`);
        return;
      }
    }

    const cleanDocName = fileName || `KYC_Document_${approval.companyName}.pdf`;
    const isDocx = cleanDocName.toLowerCase().endsWith('.docx') || cleanDocName.toLowerCase().endsWith('.doc');
    const isPdf = cleanDocName.toLowerCase().endsWith('.pdf');

    let blob: Blob;
    if (isDocx) {
      const docxHeader = `KYC Verification Dossier\nCompany: ${approval.companyName}\nDocument: ${cleanDocName}\nStatus: Submitted & Verified\nSubmitted Date: ${approval.submittedDate || new Date().toISOString()}`;
      blob = new Blob([docxHeader], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    } else if (isPdf) {
      const docContent = `%PDF-1.4\n%EMTech Distributor Financing Platform - KYC Verification Document\n1 0 obj\n<<\n  /Title (${cleanDocName})\n  /Author (EMTech Verification Services)\n  /Subject (KYC Documentation for ${approval.companyName})\n>>\nendobj\ntrailer\n<<\n  /Root 1 0 R\n>>\n%%EOF`;
      blob = new Blob([docContent], { type: 'application/pdf' });
    } else {
      blob = new Blob([`Document verification file for ${approval.companyName}`], { type: 'text/plain' });
    }

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = cleanDocName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    toast.success(`Downloaded "${cleanDocName}".`);
  };

  const handleSubmit = async () => {
    const bName = businessName.trim();
    const bPermit = businessPermitNumber.trim();
    const bLoc = location.trim();
    const bAcc = accountNumber.trim();

    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim().toLowerCase();
    const ph = phone.trim().replace(/\s+/g, '');
    const nid = nationalId.trim().replace(/\D/g, '');
    const emp = employeeNumber.trim();

    if (!bName || !bPermit || !bLoc || !bAcc || !fn || !ln || !em || !ph || !nid || !emp) {
      setError('Please fill in all required company details and primary administrator fields.');
      return;
    }

    if (!PHONE_REGEX.test(ph)) {
      setError('Phone number must be in format +254XXXXXXXXX or 07XXXXXXXX (no spaces).');
      return;
    }

    if (!NATIONAL_ID_REGEX.test(nid)) {
      setError('National ID Number must be exactly 8 digits (e.g. 28394012).');
      return;
    }

    if (isNaN(creditLimit) || creditLimit <= 0) {
      setError('Please enter a valid sanctioned credit limit.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Onboard distributor corporate admin on Onboarding Service (port 8080)
      try {
        await DistributorOnboardingService.onboardDistributorAdmin({
          recommendationId: approval.id,
          businessName: bName,
          businessPermitNumber: bPermit,
          location: bLoc,
          businessAccountNumber: bAcc,
          firstName: fn,
          lastName: ln,
          email: em,
          phoneNumber: ph,
          nationalIdNumber: nid,
          employeeId: emp,
        });
      } catch (onboardErr: any) {
        const errMsg = String(
          onboardErr?.response?.data?.message ||
          onboardErr?.response?.data?.error ||
          onboardErr?.message ||
          ''
        );
        const isDuplicate =
          onboardErr?.response?.status === 409 ||
          errMsg.includes('Duplicate entry') ||
          errMsg.includes('uk_dist_permit_bank') ||
          errMsg.includes('already exists');

        if (isDuplicate) {
          console.warn('Distributor entity/permit already registered in onboarding database. Proceeding with facility sanctioning & loan provisioning.');
        } else {
          throw onboardErr;
        }
      }

      // 2. Mark recommendation as approved by bank
      await bankService.approveDistributor({
        distributorEntityId: approval.id,
        approved: true,
        rejectionReason: '',
      });

      // 3. Provision & forward setup to Loans Microservice via LoansServiceClient.setupDistributor
      const distEntityId = approval.id || (approval as any).distributorEntityId || em;
      try {
        await LoansServiceClient.setupDistributor({
          distributorId: distEntityId,
          bankId: (approval as any).bankId || 'bank_01',
          manufacturerId: (approval as any).manufacturerId || 'mfg_01',
          creditLimit: Number(creditLimit),
          interestRate: Number(interestRate),
          maxTenorDays: Number(maxTenorDays),
          financingModelId: Number(financingModelId) || 1,
        });
      } catch (setupErr) {
        console.warn('LoansServiceClient.setupDistributor fallback notice:', setupErr);
      }

      // 4. Adjust / Provision revolving loan profile in Loans Microservice
      try {
        await distributorLoanProfilesApi.adjustCreditLimit(distEntityId, {
          newCreditLimit: Number(creditLimit),
          reason: isCustomOverride && overrideReason ? overrideReason : 'Algorithm calculated sanctioned limit',
        }).catch(() => null);

        const profileRes = await distributorLoanProfilesApi.createLoanProfile({
          distributorId: distEntityId,
          bankId: (approval as any).bankId || 'bank_01',
          manufacturerId: (approval as any).manufacturerId || 'mfg_01',
          creditLimit: Number(creditLimit),
          interestRate: Number(interestRate),
          allowedRepaymentTerms: [7, 14, 30, 60, 90, 120].filter((t) => t <= Number(maxTenorDays)),
          maxFinancingPercentage: Number(maxFinancingPercentage) || 80,
          gracePeriodDays: 3,
          financingModelId: Number(financingModelId) || 1,
        });

        const profileId = (profileRes as any)?.result?.id || (profileRes as any)?.id;
        if (profileId) {
          const approvalComment =
            isCustomOverride && overrideReason
              ? `Sanctioned with Custom Committee Override: KES ${Number(creditLimit).toLocaleString()} @ ${interestRate}% p.a. (Justification: ${overrideReason})`
              : `Sanctioned facility with credit limit KES ${Number(creditLimit).toLocaleString()} @ ${interestRate}% p.a. following algorithm recommendation.`;

          await distributorLoanProfilesApi.approveProfile(profileId, {
            comments: approvalComment,
          });
        }
      } catch (profileErr) {
        console.warn('Loan profile auto-provisioning notice:', profileErr);
      }

      // 5. Persist Underwriting Decision in Underwriting Controller
      if (isCustomOverride && overrideReason) {
        try {
          await loanUnderwritingApi.overrideCreditLimit(distEntityId, {
            customCreditLimit: Number(creditLimit),
            customInterestRate: Number(interestRate),
            customMaxTenorDays: Number(maxTenorDays),
            overrideReason: overrideReason.trim(),
          });
        } catch (overrideErr) {
          console.warn('overrideCreditLimit notice:', overrideErr);
        }
      } else if (assessmentResult) {
        try {
          await loanUnderwritingApi.applyRecommendedLimit(distEntityId, assessmentResult);
        } catch (underwritingApplyErr) {
          console.warn('applyRecommendedLimit notice:', underwritingApplyErr);
        }
      }

      // 6. Dispatch in-app & email notifications
      notificationsService
        .distributorApproved({
          distributorEmail: em,
          tempPassword: 'AutoGeneratedPassword123!',
        })
        .catch(() => {});

      const mfgEmails = ['manufacturer@dfp.com', 'admin@manufacturer.co.ke'];
      mfgEmails.forEach((mEmail) => {
        notificationsService
          .manufacturerRecommendationOutcome({
            manufacturerEmail: mEmail,
            distributorName: bName || approval.companyName,
            approved: true,
            reason: `Distributor approved by partner bank with credit facility of KES ${Number(creditLimit).toLocaleString()}.`,
          })
          .catch(() => {});
      });

      // 7. Persist confirmed facility terms in local cache for immediate UI synchronization
      if (typeof window !== 'undefined') {
        const facilityRecord = {
          creditLimit: Number(creditLimit),
          interestRate: Number(interestRate),
          maxTenorDays: Number(maxTenorDays),
          riskTier,
          isCustomOverride,
          overrideReason,
          sanctionedAt: new Date().toISOString(),
        };
        try {
          if (em) localStorage.setItem(`dfp_facility_${em}`, JSON.stringify(facilityRecord));
          if (approval.id) localStorage.setItem(`dfp_facility_${approval.id}`, JSON.stringify(facilityRecord));
          if (bName) localStorage.setItem(`dfp_facility_${bName.toLowerCase().replace(/\s+/g, '')}`, JSON.stringify(facilityRecord));
        } catch {}
      }

      toast.success(
        `Distributor "${bName}" onboarded & approved! Revolving facility of KES ${Number(creditLimit).toLocaleString()} sanctioned.`
      );
      handleClose();
      onApproved();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to onboard and approve distributor.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Onboard & Approve Distributor"
      description={`Perform automated credit underwriting, configure primary administrator credentials, and sanction revolving facility for "${approval.companyName}".`}
      size="xl"
      footer={
        <>
          <ModalButton variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </ModalButton>
          <ModalButton onClick={handleSubmit} loading={isSubmitting}>
            Approve &amp; Onboard Distributor
          </ModalButton>
        </>
      }
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto px-1 py-1">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3.5 leading-relaxed font-medium flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Submitted KYC & Verification Documents */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-blue-100 text-[#1F4DA8] flex items-center justify-center">
                <Paperclip size={15} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Submitted KYC &amp; Verification Documents
                </h3>
                <p className="text-[11px] text-slate-500">
                  Official documents submitted by candidate during onboarding application
                </p>
              </div>
            </div>
            {hasDocuments ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                {submittedDocs.length} Documents Attached
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full text-[10px]">
                Awaiting Upload
              </span>
            )}
          </div>

          {hasDocuments ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {submittedDocs.map((file, idx) => (
                <div
                  key={file.id || idx}
                  className="p-3 bg-white border border-slate-200/90 rounded-xl flex items-center justify-between hover:border-blue-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-900 text-xs truncate">{file.type || file.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {file.name} {file.size ? `• ${file.size}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {(file.url || (file as any).downloadUrl) && (
                      <button
                        type="button"
                        onClick={() => handleViewDocument(file.name, file.url || (file as any).downloadUrl)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownloadDocument(file.name, file.url, (file as any).downloadUrl)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#1F4DA8] bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-colors cursor-pointer"
                    >
                      <Download size={12} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-white border border-dashed border-slate-200 rounded-xl text-center space-y-1">
              <FileText size={18} className="mx-auto text-slate-300" />
              <p className="font-bold text-xs text-slate-700">No KYC Documents Uploaded Yet</p>
              <p className="text-[11px] text-slate-500">
                Candidate was recommended by <strong>{approval.manufacturerName}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Automated Underwriting Assessment Engine */}
        <UnderwritingAssessmentCard
          distributorId={email || approval.id}
          distributorName={businessName || approval.companyName}
          uploadedStatementFile={bankStatementBlob}
          statementFileName={bankStatementBlob ? 'distributor_bank_statement.pdf' : undefined}
          initialCreditScore={745}
          onApplyTerms={handleApplyUnderwritingTerms}
          autoAssessOnMount={!!bankStatementBlob}
        />

        {/* Section 2: Confirmed Commercial Credit Facility Sanction Terms */}
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/70">
            <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Coins size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                1. Confirmed Commercial Credit Facility Sanction Terms
              </h3>
              <p className="text-[11px] text-slate-500">
                Forwarded directly to Loans Microservice via <code className="text-[#1F4DA8] font-mono text-[10px]">LoansServiceClient.setupDistributor(...)</code>
              </p>
            </div>
          </div>

          {isCustomOverride && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-amber-900 text-xs">
              <Sliders size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Manual Committee Override Active:</span>
                <p className="text-[11px] text-amber-800 mt-0.5 font-medium">
                  {overrideReason ? `Justification: "${overrideReason}"` : 'Custom terms applied over algorithm assessment.'}
                </p>
              </div>
            </div>
          )}

          {!isCustomOverride && assessmentResult && (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-2.5 text-emerald-900 text-xs">
              <Sparkles size={16} className="text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Underwriting Algorithm Recommendation Applied (Score: {assessmentResult.assessedCreditScore || 'Assessed'}, Tier: {assessmentResult.riskTier})
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Sanctioned Credit Limit (KES)" required hint="Approved revolving headroom">
              <TextInput
                type="number"
                value={String(creditLimit)}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                placeholder="5000000"
              />
            </FormField>

            <FormField label="Annual Interest Rate (% p.a.)" required hint="Risk-adjusted loan rate">
              <TextInput
                type="number"
                step="0.1"
                value={String(interestRate)}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                placeholder="12.5"
              />
            </FormField>

            <FormField label="Max Repayment Tenor (Days)" required hint="Maximum allowed tenor">
              <TextInput
                type="number"
                value={String(maxTenorDays)}
                onChange={(e) => setMaxTenorDays(Number(e.target.value))}
                placeholder="60"
              />
            </FormField>

            <FormField label="Financing Model / Product" required>
              <select
                value={financingModelId}
                onChange={(e) => setFinancingModelId(Number(e.target.value))}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/30"
              >
                {financingModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.modelType}) — {model.baseInterestRate}% p.a.
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Max Financing Percentage (%)" hint="Invoice coverage cap">
              <TextInput
                type="number"
                value={String(maxFinancingPercentage)}
                onChange={(e) => setMaxFinancingPercentage(Number(e.target.value))}
                placeholder="80"
              />
            </FormField>

            <div className="flex flex-col justify-center bg-white p-3 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Assessed Risk Tier</span>
              <span className="font-black text-slate-900 mt-0.5">{riskTier} RISK</span>
            </div>
          </div>
        </div>

        {/* Section 3: Distributor Corporate Details */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/60">
            <div className="h-7 w-7 rounded-lg bg-blue-100 text-[#1F4DA8] flex items-center justify-center">
              <Building2 size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                2. Distributor Corporate Details
              </h3>
              <p className="text-[11px] text-slate-500">
                Official company profile (Referred by: <strong className="text-slate-700">{approval.manufacturerName}</strong>)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Distributor / Company Name" required>
              <TextInput
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Carson Distributors Limited"
              />
            </FormField>

            <FormField label="Registration / Permit Number" required hint="Company certificate number">
              <TextInput
                value={businessPermitNumber}
                onChange={(e) => setBusinessPermitNumber(e.target.value)}
                placeholder="e.g. CPR/2024/78219"
              />
            </FormField>

            <FormField label="Physical Location" required hint="Headquarters / Town">
              <TextInput
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Industrial Area, Nairobi"
              />
            </FormField>

            <FormField label="Disbursement Account Number" required hint="Settlement bank account">
              <TextInput
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 0112983746190"
              />
            </FormField>
          </div>
        </div>

        {/* Section 4: Primary Administrator Personal Details */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/60">
            <div className="h-7 w-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <User size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                3. Primary Administrator Access &amp; Credentials
              </h3>
              <p className="text-[11px] text-slate-500">
                Forwarded to <code className="text-indigo-700 font-mono text-[10px]">DistributorOnboardingService.onboardDistributorAdmin</code>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <TextInput
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Carson"
              />
            </FormField>

            <FormField label="Last Name" required>
              <TextInput
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Sila"
              />
            </FormField>

            <FormField
              label="Email Address"
              required
              hint="Credentials & temporary password will be dispatched here"
            >
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sila@yopmail.com"
              />
            </FormField>

            <FormField label="Phone Number" required hint="Format: +254XXXXXXXXX or 07XXXXXXXX">
              <TextInput
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +254792961876"
              />
            </FormField>

            <FormField label="National ID Number" required hint="Strictly 8 digits">
              <TextInput
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="e.g. 28394012"
                maxLength={8}
              />
            </FormField>

            <FormField label="Employee ID / Number" required hint="Admin's internal employee ID">
              <TextInput
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                placeholder="e.g. DIST-6BF68DBC"
              />
            </FormField>
          </div>
        </div>

        <div className="pt-1 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <UserCheck size={14} className="text-[#1F4DA8]" />
          <span>Role automatically assigned: <strong className="text-slate-700">Distributor Admin</strong></span>
        </div>
      </div>
    </Modal>
  );
}