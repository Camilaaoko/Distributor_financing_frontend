'use client';

import React from 'react';
import { FormField, TextInput } from '@/components/ui/FormField';
import {
  BANKING_OPTION_LABELS,
  BANKING_CONSENT_TEXT,
  ACCOUNT_NUMBER_HINT,
  NEW_ACCOUNT_INFO,
  CONSENT_DISCLAIMER,
} from '@/components/onboarding/constants/bankingConfig';

interface BankingDetailsStepProps {
  hasExistingBankAccount: boolean | null;
  existingAccountNumber: string;
  consentToCreateBankAccount: boolean;
  formErrors: Record<string, string>;
  handleBankingOptionChange: (hasAccount: boolean) => void;
  handleInputChange: (field: string, value: string) => void;
  handleConsentChange: (checked: boolean) => void;
}

export function BankingDetailsStep({
  hasExistingBankAccount,
  existingAccountNumber,
  consentToCreateBankAccount,
  formErrors,
  handleBankingOptionChange,
  handleInputChange,
  handleConsentChange,
}: BankingDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-[#1F4DA8]">
          Tell us how you would like financing disbursements to be handled.
        </p>
      </div>

      <div className="space-y-4" role="radiogroup" aria-label="Do you have an existing bank account with us?">
        <div>
          <label className="block text-sm font-semibold text-[#1E293B]">
            Do you have an existing bank account with us? <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-[#64748B] mt-0.5">
            Select whether you want to use an existing account or apply for a new account.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* YES Option */}
          <label
            className={`relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer ${
              hasExistingBankAccount === true
                ? 'border-[#1F4DA8] bg-blue-50/40 shadow-xs'
                : 'border-[#E2E8F0] hover:border-[#1F4DA8]/40 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="hasExistingBankAccount"
                value="true"
                checked={hasExistingBankAccount === true}
                onChange={() => handleBankingOptionChange(true)}
                className="mt-1 h-4 w-4 text-[#1F4DA8] border-[#CBD5E1] focus:ring-[#1F4DA8]"
                aria-invalid={!!formErrors.hasExistingBankAccount}
              />
              <div>
                <span className="font-semibold text-sm text-[#1E293B] block">
                  {BANKING_OPTION_LABELS.yes.title}
                </span>
                <span className="text-xs text-[#64748B] mt-1 block">
                  {BANKING_OPTION_LABELS.yes.description}
                </span>
              </div>
            </div>
          </label>

          {/* NO Option */}
          <label
            className={`relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer ${
              hasExistingBankAccount === false
                ? 'border-[#1F4DA8] bg-blue-50/40 shadow-xs'
                : 'border-[#E2E8F0] hover:border-[#1F4DA8]/40 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="hasExistingBankAccount"
                value="false"
                checked={hasExistingBankAccount === false}
                onChange={() => handleBankingOptionChange(false)}
                className="mt-1 h-4 w-4 text-[#1F4DA8] border-[#CBD5E1] focus:ring-[#1F4DA8]"
                aria-invalid={!!formErrors.hasExistingBankAccount}
              />
              <div>
                <span className="font-semibold text-sm text-[#1E293B] block">
                  {BANKING_OPTION_LABELS.no.title}
                </span>
                <span className="text-xs text-[#64748B] mt-1 block">
                  {BANKING_OPTION_LABELS.no.description}
                </span>
              </div>
            </div>
          </label>
        </div>

        {formErrors.hasExistingBankAccount && (
          <p className="text-xs text-red-600 font-medium mt-1" role="alert">
            {formErrors.hasExistingBankAccount}
          </p>
        )}
      </div>

      {/* Conditional Path 1: YES -> Existing Account Number */}
      {hasExistingBankAccount === true && (
        <div className="p-5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs space-y-4">
          <h4 className="text-sm font-semibold text-[#1E293B]">
            Existing Bank Account Details
          </h4>
          <FormField label="Existing Account Number" required hint={ACCOUNT_NUMBER_HINT}>
            <TextInput
              value={existingAccountNumber}
              onChange={(e) => handleInputChange('existingAccountNumber', e.target.value)}
              placeholder="e.g. 1234567890"
              autoComplete="off"
              aria-invalid={!!formErrors.existingAccountNumber}
              aria-describedby={formErrors.existingAccountNumber ? 'existingAccountNumber-error' : undefined}
            />
            {formErrors.existingAccountNumber && (
              <p id="existingAccountNumber-error" className="text-xs text-red-600 font-medium mt-1" role="alert">
                {formErrors.existingAccountNumber}
              </p>
            )}
          </FormField>
        </div>
      )}

      {/* Conditional Path 2: NO -> New Account Consent */}
      {hasExistingBankAccount === false && (
        <div className="p-5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-[#1E293B]">Open a New Bank Account</h4>
            <p className="text-xs text-[#64748B] mt-1">{NEW_ACCOUNT_INFO}</p>
          </div>

          <div className="bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentToCreateBankAccount}
                onChange={(e) => handleConsentChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] text-[#1F4DA8] focus:ring-[#1F4DA8]"
                aria-invalid={!!formErrors.consentToCreateBankAccount}
                aria-describedby={formErrors.consentToCreateBankAccount ? 'consent-error' : undefined}
              />
              <span className="text-xs sm:text-sm text-[#1E293B] leading-relaxed font-medium">
                {BANKING_CONSENT_TEXT}
              </span>
            </label>
            {formErrors.consentToCreateBankAccount && (
              <p id="consent-error" className="text-xs text-red-600 font-medium mt-2 pl-7" role="alert">
                {formErrors.consentToCreateBankAccount}
              </p>
            )}
          </div>

          <p className="text-xs text-[#64748B] italic">
            * {CONSENT_DISCLAIMER}
          </p>
        </div>
      )}
    </div>
  );
}