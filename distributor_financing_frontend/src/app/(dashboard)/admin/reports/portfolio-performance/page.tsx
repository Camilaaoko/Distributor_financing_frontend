'use client';

import React from 'react';
import { PortfolioPerformanceView } from '@/components/reports/PortfolioPerformanceView';
import { useAuth } from '@/hooks/useAuth';

export default function AdminPortfolioPerformancePage() {
  const { user } = useAuth();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <PortfolioPerformanceView
        bankId={user?.bankId}
        userRole={user?.role || 'PLATFORM_ADMIN'}
      />
    </div>
  );
}
