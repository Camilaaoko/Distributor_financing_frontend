'use client';

import React from 'react';
import { CreditAssessmentSummaryView } from '@/components/reports/CreditAssessmentSummaryView';
import { useAuth } from '@/hooks/useAuth';

export default function AdminCreditAssessmentsPage() {
  const { user } = useAuth();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <CreditAssessmentSummaryView
        bankId={user?.bankId}
        userRole={user?.role || 'PLATFORM_ADMIN'}
        detailBaseUrl="/admin/distributors"
      />
    </div>
  );
}
