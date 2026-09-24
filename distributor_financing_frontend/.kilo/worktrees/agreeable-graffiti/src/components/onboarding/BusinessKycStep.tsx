'use client';

import React from 'react';
import { FormField, TextInput } from '@/components/ui/FormField';
import { Lock } from 'lucide-react';

interface BusinessKycStepProps {
  nationalId: string;
  formErrors: Record<string, string>;
  handleInputChange: (field: string, value: string) => void;
}

export function BusinessKycStep({ nationalId, formErrors, handleInputChange }: BusinessKycStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-[#1F4DA8]">
          Please provide the Director / Authorized Signatory identification details for KYC compliance.
        </p>
      </div>

      <div className="p-5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs text-[#64748B] bg-[#F7F9FC] border border-[#E2E8F0] p-3 rounded-lg">
          <Lock className="w-4 h-4 text-[#1F4DA8] shrink-0" />
          <span>
            Sensitive KYC Data: National ID is encrypted and handled in compliance with regulatory privacy standards.
          </span>
        </div>

        <FormField
          label="Director / Signatory National ID"
          required
          hint="Enter your 8-digit government issued National ID number."
        >
          <TextInput
            type="text"
            value={nationalId}
            onChange={(e) => handleInputChange('nationalId', e.target.value)}
            placeholder="e.g. 27834501"
            autoComplete="off"
            aria-invalid={!!formErrors.nationalId}
            aria-describedby={formErrors.nationalId ? 'nationalId-error' : undefined}
          />
          {formErrors.nationalId && (
            <p id="nationalId-error" className="text-xs text-red-600 font-medium mt-1" role="alert">
              {formErrors.nationalId}
            </p>
          )}
        </FormField>
      </div>
    </div>
  );
}