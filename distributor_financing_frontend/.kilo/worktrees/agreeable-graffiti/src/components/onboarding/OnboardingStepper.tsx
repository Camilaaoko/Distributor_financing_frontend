'use client';

import React from 'react';

interface OnboardingStepperProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (stepNumber: number) => void;
}

const steps = [
  { number: 1, title: 'Contact & Address', description: 'Primary contact and distributor location details' },
  { number: 2, title: 'Banking Details', description: 'Tell us how you would like financing disbursements to be handled' },
  { number: 3, title: 'Business & KYC', description: 'Business registration and identification details' },
  { number: 4, title: 'Upload Documents', description: 'Upload the required documents to verify your application' },
  { number: 5, title: 'Review & Submit', description: 'Review your application details and documents before submitting' },
];

export function OnboardingStepper({ currentStep, onStepClick }: OnboardingStepperProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-1 bg-[#E2E8F0] z-0" />
        {steps.map((s, i) => {
          const isCompleted = i + 1 < currentStep;
          const isCurrent = i + 1 === currentStep;
          const canClick = (i + 1 <= currentStep) && onStepClick;

          return (
            <div key={s.number} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => canClick && onStepClick(s.number)}
                disabled={!canClick}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isCompleted
                    ? 'bg-[#16A34A] text-white hover:bg-[#15803D] cursor-pointer'
                    : isCurrent
                    ? 'bg-[#1F4DA8] text-white ring-4 ring-[#1F4DA8]/20'
                    : 'bg-white text-[#94A3B8] border-2 border-[#E2E8F0] cursor-not-allowed'
                }`}
                title={canClick ? `Go to Step ${s.number}: ${s.title}` : s.title}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.number
                )}
              </button>
              <button
                type="button"
                onClick={() => canClick && onStepClick(s.number)}
                disabled={!canClick}
                className={`mt-2 text-center w-28 sm:w-32 focus:outline-none ${
                  canClick ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <p
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? 'text-[#1F4DA8]'
                      : isCompleted
                      ? 'text-[#1E293B] hover:text-[#1F4DA8]'
                      : 'text-[#94A3B8]'
                  }`}
                >
                  {s.title}
                </p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5 hidden sm:block">{s.description}</p>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}