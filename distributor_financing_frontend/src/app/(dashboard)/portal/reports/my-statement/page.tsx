'use client';

import React from 'react';
import { CustomerStatementView } from '@/components/reports/CustomerStatementView';

export default function PortalMyStatementPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <CustomerStatementView
        isSelfService={true}
        title="My Customer Account Statement"
        subtitle="Your real-time facility ledger, active loan sub-accounts, fees, and repayments."
      />
    </div>
  );
}
