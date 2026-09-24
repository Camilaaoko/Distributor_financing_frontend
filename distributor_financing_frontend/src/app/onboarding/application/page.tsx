'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { assetPath } from '@/lib/assets';
import { useToast } from '@/components/ui/Toast';
import { onboardingService } from '@/services/onboarding.service';
import { notificationsService } from '@/services/notifications.service';
import { apiClient } from '@/lib/axios';
import { getErrorMessage } from '@/lib/errors';
import { Modal, ModalButton } from '@/components/ui/Modal';

import { useOnboardingForm } from '@/components/onboarding/hooks/useOnboardingForm';
import { ContactAddressStep } from '@/components/onboarding/ContactAddressStep';
import { BankingDetailsStep } from '@/components/onboarding/BankingDetailsStep';
import { BusinessKycStep } from '@/components/onboarding/BusinessKycStep';
import { DocumentUploadStep } from '@/components/onboarding/DocumentUploadStep';
import { ReviewSubmitStep } from '@/components/onboarding/ReviewSubmitStep';
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper';

const STEPS = [
  { number: 1, title: 'Contact & Address', description: 'Primary contact and distributor location details' },
  { number: 2, title: 'Banking Details', description: 'Tell us how you would like financing disbursements to be handled' },
  { number: 3, title: 'Business & KYC', description: 'Business registration and identification details' },
  { number: 4, title: 'Upload Documents', description: 'Upload the required documents to verify your application' },
  { number: 5, title: 'Review & Submit', description: 'Review your application details and documents before submitting' },
];

function DealerApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const queryEmail = searchParams?.get('email') || searchParams?.get('contactEmail') || '';
  const queryName = searchParams?.get('name') || searchParams?.get('distributorName') || searchParams?.get('company') || '';
  const queryPhone = searchParams?.get('phone') || searchParams?.get('phoneNumber') || searchParams?.get('contactPhone') || '';
  const queryFirstName = searchParams?.get('firstName') || '';
  const queryLastName = searchParams?.get('lastName') || '';
  const queryMfg = searchParams?.get('manufacturerId') || searchParams?.get('mfg') || '';

  const initialValues = React.useMemo(() => {
    const vals: Record<string, string> = {};
    if (queryEmail) vals.contactEmail = queryEmail;
    if (queryName) vals.distributorName = queryName;
    if (queryPhone) vals.contactPhone = queryPhone;
    if (queryFirstName) vals.firstName = queryFirstName;
    if (queryLastName) vals.lastName = queryLastName;
    if (queryMfg) vals.manufacturerId = queryMfg;
    return vals;
  }, [queryEmail, queryName, queryPhone, queryFirstName, queryLastName, queryMfg]);

  const {
    formData,
    formErrors,
    step,
    isSubmitting,
    showSuccessModal,
    successData,
    goToStep,
    handleInputChange,
    handleDocumentChange,
    handleFileUpload,
    handleFileRemove,
    handleBankingOptionChange,
    handleConsentChange,
    handleNext,
    handleBack,
    handleSubmit,
    handleSuccessClose,
    initDocuments,
  } = useOnboardingForm({ initialValues });

  useEffect(() => {
    initDocuments();
  }, [initDocuments]);

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSubmit(onboardingService.submitApplication);
      toast.success('Application submitted successfully!');

      // Notify Bank Admins that KYC documentation was submitted
      try {
        const { data: admins } = await apiClient.get<any[]>('/api/onboarding/banks/admins');
        const adminEmails = Array.isArray(admins)
          ? admins.map((a: any) => a.email).filter(Boolean)
          : [];
        const uniqueBankEmails = Array.from(new Set([...adminEmails, 'bank@dfp.com']));

        uniqueBankEmails.forEach((bEmail) => {
          notificationsService.distributorDocsSubmitted({
            bankAdminEmail: bEmail,
            distributorName: formData.distributorName || 'New Distributor',
            manufacturerName: formData.manufacturerId || 'Anchor Manufacturer',
          }).catch(() => {});
        });
      } catch (e) {
        notificationsService.distributorDocsSubmitted({
          bankAdminEmail: 'bank@dfp.com',
          distributorName: formData.distributorName || 'New Distributor',
          manufacturerName: formData.manufacturerId || 'Anchor Manufacturer',
        }).catch(() => {});
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to submit application. Please try again.'));
    }
  };


  const handleModalClose = () => {
    handleSuccessClose();
    router.push('/');
  };


  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center max-w-7xl mx-auto w-full px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Image
            src={assetPath('/images/emtech_color_logo.png')}
            alt="EMTech House"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="font-semibold text-[#1E293B] text-base">EMTech House</span>
        </div>
        <Link
          href="/onboarding/consent"
          className="text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors"
        >
          ← Back to Consent
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl">
          {/* 5-Step Stepper (Clickable for previous steps to quickly edit info) */}
          <OnboardingStepper currentStep={step} totalSteps={STEPS.length} onStepClick={goToStep} />

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E2E8F0] bg-[#F7F9FC] flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-[#1E293B]">Distributor Financing Onboarding</h1>
                <p className="text-sm text-[#64748B] mt-1">
                  Step {step} of {STEPS.length}: {STEPS[step - 1].title}
                </p>
              </div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs font-semibold text-[#64748B] hover:text-[#1F4DA8] px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 transition-colors"
                >
                  ← Back to Step {step - 1}
                </button>
              )}
            </div>

            <div className="p-6">
              {/* STEP 1: Contact & Address */}
              {step === 1 && (
                <div className="space-y-6">
                  <ContactAddressStep
                    formData={{
                      distributorName: formData.distributorName,
                      branchAddress: formData.branchAddress,
                      registrationNumber: formData.registrationNumber,
                      firstName: formData.firstName,
                      lastName: formData.lastName,
                      contactEmail: formData.contactEmail,
                      contactPhone: formData.contactPhone,
                      employeeId: formData.employeeId,
                    }}
                    formErrors={formErrors}
                    handleInputChange={handleInputChange}
                  />

                  <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                    <Link
                      href="/onboarding/consent"
                      className="text-sm font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors flex items-center gap-1"
                    >
                      ← Back to Consent
                    </Link>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#1F4DA8] hover:bg-[#3A6FD8] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm shadow-[#1F4DA8]/20 flex items-center gap-2"
                    >
                      Next: Banking Details →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Banking Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <BankingDetailsStep
                    hasExistingBankAccount={formData.hasExistingBankAccount}
                    existingAccountNumber={formData.existingAccountNumber}
                    consentToCreateBankAccount={formData.consentToCreateBankAccount}
                    formErrors={formErrors}
                    handleBankingOptionChange={handleBankingOptionChange}
                    handleInputChange={handleInputChange}
                    handleConsentChange={handleConsentChange}
                  />

                  <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-sm font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors"
                    >
                      ← Back to Contact &amp; Address
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#1F4DA8] hover:bg-[#3A6FD8] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm shadow-[#1F4DA8]/20 flex items-center gap-2"
                    >
                      Next: Business &amp; KYC →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Business & KYC */}
              {step === 3 && (
                <div className="space-y-6">
                  <BusinessKycStep
                    nationalId={formData.nationalId}
                    formErrors={formErrors}
                    handleInputChange={handleInputChange}
                  />

                  <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-sm font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors"
                    >
                      ← Back to Banking Details
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#1F4DA8] hover:bg-[#3A6FD8] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm shadow-[#1F4DA8]/20 flex items-center gap-2"
                    >
                      Next: Upload Documents →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Upload Documents */}
              {step === 4 && (
                <div className="space-y-6">
                  <DocumentUploadStep
                    documents={formData.documents}
                    formErrors={formErrors}
                    handleDocumentChange={handleDocumentChange}
                    handleFileUpload={handleFileUpload}
                    handleFileRemove={handleFileRemove}
                  />

                  <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-sm font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors"
                    >
                      ← Back to Business &amp; KYC
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#1F4DA8] hover:bg-[#3A6FD8] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm shadow-[#1F4DA8]/20 flex items-center gap-2"
                    >
                      Next: Review &amp; Submit →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Review & Submit */}
              {step === 5 && (
                <ReviewSubmitStep
                  formData={formData}
                  formErrors={formErrors}
                  isSubmitting={isSubmitting}
                  handleInputChange={handleInputChange}
                  handleBack={handleBack}
                  onEditStep={goToStep}
                  onSubmit={handleSubmitApplication}
                />
              )}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-[#64748B]">
            <p>By submitting this application, you consent to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-left max-w-md mx-auto">
              <li>Sharing business and financial data with the financing bank</li>
              <li>Credit assessment and facility determination</li>
              <li>Receiving login credentials upon approval</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-[#64748B] py-4 border-t border-[#E2E8F0] max-w-7xl mx-auto w-full px-4">
        &copy; {new Date().getFullYear()} EMTech House. All rights reserved.
      </footer>

      {/* Success Modal */}
      <Modal
        open={showSuccessModal}
        onClose={handleModalClose}
        title="Application Submitted Successfully"
        description="Your distributor onboarding application and KYC documentation have been received and submitted for Bank review."
        size="md"
        footer={<ModalButton onClick={handleModalClose}>Understood &amp; Close</ModalButton>}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Application Reference</p>
            <p className="text-2xl font-bold text-[#1F4DA8] font-mono mt-1">{successData?.applicationId}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
            <p className="font-bold text-slate-900 text-sm">What happens next?</p>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
              <li>A confirmation notice has been sent to <strong>{formData.contactEmail || 'your email'}</strong>.</li>
              <li>Your submission is currently under review by the <strong>Bank Administrator</strong>.</li>
              <li>You cannot log in at this stage because your account is pending approval.</li>
              <li>Once the bank approves your submission, your <strong>system login credentials will be emailed to you</strong>.</li>
              <li>Please keep your Application Reference for tracking and support inquiries.</li>
            </ul>

          </div>
        </div>
      </Modal>

    </div>
  );
}

export default function DealerApplicationPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 border-3 border-[#1F4DA8] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Loading onboarding application...</p>
          </div>
        </div>
      }
    >
      <DealerApplicationForm />
    </React.Suspense>
  );
}
