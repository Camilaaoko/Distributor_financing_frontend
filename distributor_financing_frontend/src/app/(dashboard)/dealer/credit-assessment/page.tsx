'use client';

import React from 'react';
import { BorrowerCreditAssessmentView } from '@/components/reports/BorrowerCreditAssessmentView';
import { useAuth } from '@/hooks/useAuth';

export default function DealerCreditAssessmentPage() {
  const { user } = useAuth();
  const distributorId = user?.distributorId || 'dist-001';

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <BorrowerCreditAssessmentView
        distributorId={distributorId}
        isDistributorSelfService={true}
      />
    </div>
  );
}
