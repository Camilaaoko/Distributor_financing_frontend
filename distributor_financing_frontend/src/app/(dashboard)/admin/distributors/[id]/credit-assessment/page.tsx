'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { BorrowerCreditAssessmentView } from '@/components/reports/BorrowerCreditAssessmentView';

export default function AdminDistributorCreditAssessmentPage() {
  const params = useParams();
  const distributorId = String(params?.id || 'dist-001');

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <BorrowerCreditAssessmentView
        distributorId={distributorId}
        backUrl="/admin/reports/credit-assessments"
      />
    </div>
  );
}
