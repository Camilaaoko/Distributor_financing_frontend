'use client';

import React from 'react';
import { FormField, TextInput } from '@/components/ui/FormField';

interface ContactAddressStepProps {
  formData: {
    distributorName: string;
    branchAddress: string;
    registrationNumber: string;
    firstName: string;
    lastName: string;
    contactEmail: string;
    contactPhone: string;
    employeeId: string;
  };
  formErrors: Record<string, string>;
  handleInputChange: (field: string, value: string) => void;
}

export function ContactAddressStep({ formData, formErrors, handleInputChange }: ContactAddressStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-[#1F4DA8]">
          Enter your distributor organization details and primary contact information.
        </p>
      </div>

      <div className="p-5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs space-y-5">
        <h3 className="text-sm font-semibold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
          Organization &amp; Location
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Distributor Name" required>
            <TextInput
              value={formData.distributorName}
              onChange={(e) => handleInputChange('distributorName', e.target.value)}
              placeholder="Coast General Supplies Limited"
              autoComplete="organization"
              aria-invalid={!!formErrors.distributorName}
              aria-describedby={formErrors.distributorName ? 'distributorName-error' : undefined}
            />
            {formErrors.distributorName && (
              <p id="distributorName-error" className="text-xs text-red-600 font-medium mt-1" role="alert">
                {formErrors.distributorName}
              </p>
            )}
          </FormField>

          <FormField label="Branch/Location Address" required>
            <TextInput
              value={formData.branchAddress}
              onChange={(e) => handleInputChange('branchAddress', e.target.value)}
              placeholder="Plot 45, Mombasa Road, Industrial Area"
              autoComplete="street-address"
              aria-invalid={!!formErrors.branchAddress}
              aria-describedby={formErrors.branchAddress ? 'branchAddress-error' : undefined}
            />
            {formErrors.branchAddress && (
              <p id="branchAddress-error" className="text-xs text-red-600 font-medium mt-1" role="alert">
                {formErrors.branchAddress}
              </p>
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Distributor Registration No." required hint="Official company registration certificate number">
            <TextInput
              value={formData.registrationNumber}
              onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              placeholder="CPR/2018/123456"
              autoComplete="off"
              aria-invalid={!!formErrors.registrationNumber}
              aria-describedby={formErrors.registrationNumber ? 'registrationNumber-error' : undefined}
            />
            {formErrors.registrationNumber && (
              <p id="registrationNumber-error" className="text-xs text-red-600 font-medium mt-1" role="alert">
                {formErrors.registrationNumber}
              </p>
            )}
          </FormField>
        </div>
      </div>

      <div className="p-5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs space-y-5">
        <h3 className="text-sm font-semibold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
          Primary Contact Person
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="First Name" required>
            <TextInput
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Hassan"
              autoComplete="given-name"
              aria-invalid={!!formErrors.firstName}
              aria-describedby={formErrors.firstName ? 'firstName-error' : undefined}
            />
            {formErrors.firstName && (
              <p id="firstName-error" className="text-xs text-red-600 font-medium mt-1" role="alert">
                {formErrors.firstName}
              </p>
            )}
          </FormField>

          <FormField label="Last Name" required>
            <TextInput
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Ali"
              autoComplete="family-name"
              aria-invalid={!!formErrors.lastName}
              aria-describedby={formErrors.lastName ? 'lastName-error' : undefined}
            />
            {formErrors.lastName && (
              <p id="lastName-error" className="text-xs text-red-600 font-medium mt-1" role="alert">
                {formErrors.lastName}
              </p>
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Corporate Email" required>
            <TextInput
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              placeholder="hassan.ali@coastgeneral.co.ke"
              autoComplete="email"
              aria-invalid={!!formErrors.contactEmail}
              aria-describedby={formErrors.contactEmail ? 'contactEmail-error' : undefined}
            />
            {formErrors.contactEmail && (
              <p id="contactEmail-error" className="text-xs text-red-600 font-medium mt-1" role="alert">
                {formErrors.contactEmail}
              </p>
            )}
          </FormField>

          <FormField label="Phone Number" required>
            <TextInput
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              placeholder="+254 722 444 555"
              autoComplete="tel"
              aria-invalid={!!formErrors.contactPhone}
              aria-describedby={formErrors.contactPhone ? 'contactPhone-error' : undefined}
            />
            {formErrors.contactPhone && (
              <p id="contactPhone-error" className="text-xs text-red-600 font-medium mt-1" role="alert">
                {formErrors.contactPhone}
              </p>
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Employee ID" required hint="Your internal company identification number">
            <TextInput
              value={formData.employeeId}
              onChange={(e) => handleInputChange('employeeId', e.target.value)}
              placeholder="EMP001"
              autoComplete="off"
              aria-invalid={!!formErrors.employeeId}
              aria-describedby={formErrors.employeeId ? 'employeeId-error' : undefined}
            />
            {formErrors.employeeId && (
              <p id="employeeId-error" className="text-xs text-red-600 font-medium mt-1" role="alert">
                {formErrors.employeeId}
              </p>
            )}
          </FormField>
        </div>
      </div>
    </div>
  );
}