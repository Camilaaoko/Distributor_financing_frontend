'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { onboardingService, type DocumentUpload, type OnboardingApplicationPayload, type OnboardingApplicationResponse } from '@/services/onboarding.service';
import { createInitialDocuments, getAllDocumentConfigs, validateFile } from '@/components/onboarding/constants/documentConfig';
import { BANKING_VALIDATION_MESSAGES } from '@/components/onboarding/constants/bankingConfig';

export interface FormState {
  // Step 1: Contact & Address
  distributorName: string;
  branchAddress: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  contactEmail: string;
  contactPhone: string;
  employeeId: string;

  // Step 2: Banking Details
  hasExistingBankAccount: boolean | null;
  existingAccountNumber: string;
  consentToCreateBankAccount: boolean;

  // Step 3: Business & KYC
  nationalId: string;

  // Step 4: Documents
  documents: DocumentUpload[];

  // Optional/Metadata
  manufacturerId: string;
}

const initialFormState: FormState = {
  distributorName: '',
  branchAddress: '',
  registrationNumber: '',
  firstName: '',
  lastName: '',
  contactEmail: '',
  contactPhone: '',
  employeeId: '',
  hasExistingBankAccount: null,
  existingAccountNumber: '',
  consentToCreateBankAccount: false,
  nationalId: '',
  documents: [],
  manufacturerId: '',
};

interface UseOnboardingFormOptions {
  manufacturers?: Array<{ id: string; name: string; industry: string }>;
  initialValues?: Partial<FormState>;
}

export function useOnboardingForm(options?: UseOnboardingFormOptions) {
  const [formData, setFormData] = useState<FormState>(() => ({
    ...initialFormState,
    ...(options?.initialValues || {}),
  }));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{ applicationId: string } | null>(null);

  useEffect(() => {
    if (options?.initialValues && Object.keys(options.initialValues).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(options.initialValues || {}).filter(([_, v]) => v !== undefined && v !== '')
        ),
      }));
    }
  }, [
    options?.initialValues?.distributorName,
    options?.initialValues?.contactEmail,
    options?.initialValues?.contactPhone,
    options?.initialValues?.firstName,
    options?.initialValues?.lastName,
    options?.initialValues?.manufacturerId,
  ]);

  const documentsInitialized = useMemo(() => {
    return formData.documents.length > 0;
  }, [formData.documents.length]);

  const initDocuments = useCallback(() => {
    setFormData((prev) => {
      if (prev.documents.length === 0) {
        return { ...prev, documents: createInitialDocuments() };
      }
      return prev;
    });
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleDocumentChange = useCallback((docId: string, updates: Partial<DocumentUpload>) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === docId ? { ...doc, ...updates } : doc
      ),
    }));
  }, []);

  const handleFileUpload = useCallback(async (docId: string, file: File) => {
    const config = getAllDocumentConfigs().find((c) => c.id === docId);
    if (!config) return;

    const error = validateFile(file, config);
    if (error) {
      setFormErrors((prev) => ({ ...prev, [docId]: error }));
      return;
    }

    setFormErrors((prev) => {
      if (!prev[docId] && !prev.documents) return prev;
      const next = { ...prev };
      delete next[docId];
      delete next.documents;
      return next;
    });

    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              status: 'uploading',
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type || file.name.split('.').pop() || '',
              file,
            }
          : doc
      ),
    }));

    // 1. Generate local preview for immediate display
    let localPreview = '';
    try {
      localPreview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || URL.createObjectURL(file));
        reader.onerror = () => resolve(URL.createObjectURL(file));
        reader.readAsDataURL(file);
      });
    } catch {
      localPreview = URL.createObjectURL(file);
    }

    // 2. Upload file binary via FormData to POST /api/onboarding/distributors/documents/upload
    let serverUrl = '';
    let serverDownloadUrl = '';
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('documentType', config.label || docId);
      uploadData.append('category', docId);

      const res = await onboardingService.uploadDistributorDocument(uploadData);
      const resData = (res as any)?.data || res;
      serverUrl = resData?.url || resData?.documentUrl || resData?.downloadUrl || '';
      serverDownloadUrl = resData?.downloadUrl || resData?.url || resData?.documentUrl || '';
    } catch (uploadErr) {
      console.warn('Backend document upload not available or returned error, using client preview:', uploadErr);
    }

    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              status: 'uploaded',
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type || file.name.split('.').pop() || 'application/pdf',
              preview: localPreview,
              url: serverUrl || localPreview,
              downloadUrl: serverDownloadUrl || serverUrl || localPreview,
              file,
            }
          : doc
      ),
    }));
  }, []);


  const handleFileRemove = useCallback((docId: string) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              status: 'pending',
              fileName: '',
              fileSize: 0,
              fileType: '',
              preview: undefined,
            }
          : doc
      ),
    }));
  }, []);

  // Mutually exclusive banking option switching
  const handleBankingOptionChange = useCallback((hasAccount: boolean) => {
    setFormData((prev) => {
      if (hasAccount) {
        // YES: keep existing account path active, clear new-account consent
        return {
          ...prev,
          hasExistingBankAccount: true,
          consentToCreateBankAccount: false,
        };
      } else {
        // NO: keep new-account path active, clear existing account number and consent
        return {
          ...prev,
          hasExistingBankAccount: false,
          existingAccountNumber: '',
          consentToCreateBankAccount: false,
        };
      }
    });

    // Clear banking-specific validation errors when switching options
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.hasExistingBankAccount;
      delete next.existingAccountNumber;
      delete next.consentToCreateBankAccount;
      return next;
    });
  }, []);

  const handleConsentChange = useCallback((checked: boolean) => {
    setFormData((prev) => ({ ...prev, consentToCreateBankAccount: checked }));
    if (checked) {
      setFormErrors((prev) => {
        if (!prev.consentToCreateBankAccount) return prev;
        const next = { ...prev };
        delete next.consentToCreateBankAccount;
        return next;
      });
    }
  }, []);

  const validateStep = useCallback(
    (stepNumber: number, data: FormState = formData): boolean => {
      const errors: Record<string, string> = {};

      if (stepNumber === 1) {
        if (!data.distributorName.trim()) {
          errors.distributorName = 'Distributor Name is required.';
        }
        if (!data.branchAddress.trim()) {
          errors.branchAddress = 'Branch/Location Address is required.';
        }
        if (!data.registrationNumber.trim()) {
          errors.registrationNumber = 'Distributor Registration No. is required.';
        }
        if (!data.firstName.trim()) {
          errors.firstName = 'First Name is required.';
        }
        if (!data.lastName.trim()) {
          errors.lastName = 'Last Name is required.';
        }
        if (!data.contactEmail.trim()) {
          errors.contactEmail = 'Corporate Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail.trim())) {
          errors.contactEmail = 'Please enter a valid email address.';
        }
        if (!data.contactPhone.trim()) {
          errors.contactPhone = 'Phone Number is required.';
        }
        if (!data.employeeId.trim()) {
          errors.employeeId = 'Employee ID is required.';
        }
      }

      if (stepNumber === 2) {
        if (data.hasExistingBankAccount === null) {
          errors.hasExistingBankAccount = BANKING_VALIDATION_MESSAGES.noSelection;
        } else if (data.hasExistingBankAccount === true) {
          if (!data.existingAccountNumber.trim()) {
            errors.existingAccountNumber = BANKING_VALIDATION_MESSAGES.existingAccountRequired;
          }
        } else if (data.hasExistingBankAccount === false) {
          if (!data.consentToCreateBankAccount) {
            errors.consentToCreateBankAccount = BANKING_VALIDATION_MESSAGES.consentRequired;
          }
        }
      }

      if (stepNumber === 3) {
        if (!data.nationalId.trim()) {
          errors.nationalId = 'National ID is required for KYC compliance.';
        }
      }

      if (stepNumber === 4) {
        const requiredConfigs = getAllDocumentConfigs().filter((c) => c.required);
        const missing = requiredConfigs.filter((c) => {
          const doc = data.documents.find((d) => d.id === c.id);
          return !doc || doc.status !== 'uploaded';
        });
        if (missing.length > 0) {
          errors.documents = `Please upload all required documents (${missing.length} missing).`;
        }
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    },
    [formData]
  );

  const handleNext = useCallback(() => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 5));
    }
  }, [step, validateStep]);

  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((targetStep: number) => {
    if (targetStep >= 1 && targetStep <= 5) {
      setStep(targetStep);
    }
  }, []);

  const handleSubmit = useCallback(
    async (
      onSubmit: (data: OnboardingApplicationPayload) => Promise<OnboardingApplicationResponse | any>
    ) => {
      // Validate all previous steps before submitting
      for (let s = 1; s <= 4; s++) {
        if (!validateStep(s, formData)) {
          setStep(s);
          return;
        }
      }

      setIsSubmitting(true);
      try {
        const isExisting = formData.hasExistingBankAccount === true;

        const payload: OnboardingApplicationPayload = {
          // Step 1: Contact & Address
          distributorName: formData.distributorName.trim(),
          branchAddress: formData.branchAddress.trim(),
          registrationNumber: formData.registrationNumber.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          contactEmail: formData.contactEmail.trim(),
          contactPhone: formData.contactPhone.trim(),
          employeeId: formData.employeeId.trim(),

          // Step 2: Banking Details (MUTUALLY EXCLUSIVE)
          hasExistingBankAccount: isExisting,
          existingAccountNumber: isExisting ? formData.existingAccountNumber.trim() : '',
          consentToCreateBankAccount: isExisting ? false : formData.consentToCreateBankAccount,

          // Step 3: Business & KYC
          nationalId: formData.nationalId.trim(),

          // Step 4: Documents
          documents: formData.documents,

          // Metadata / backward compat
          manufacturerId: formData.manufacturerId || '',
        };

        const result = await onSubmit(payload);
        if (result && result.applicationId) {
          setSuccessData({ applicationId: result.applicationId });
        } else {
          setSuccessData({ applicationId: `APP-${Date.now().toString().slice(-6)}` });
        }
        setShowSuccessModal(true);
      } catch (err) {
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateStep]
  );

  const handleSuccessClose = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  return {
    // State
    formData,
    formErrors,
    step,
    isSubmitting,
    showSuccessModal,
    successData,
    documentsInitialized,

    // Actions
    setFormData,
    setFormErrors,
    setStep,
    goToStep,
    setIsSubmitting,
    setShowSuccessModal,
    setSuccessData,
    handleInputChange,
    handleDocumentChange,
    handleFileUpload,
    handleFileRemove,
    handleBankingOptionChange,
    handleConsentChange,
    validateStep,
    handleNext,
    handleBack,
    handleSubmit,
    handleSuccessClose,
    initDocuments,
  };
}