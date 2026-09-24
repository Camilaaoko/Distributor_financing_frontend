'use client';

import React from 'react';
import { CustomerStatementView } from '@/components/reports/CustomerStatementView';

export default function DealerMyStatementPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <CustomerStatementView
        isSelfService={true}
        title="My Facility Statement"
        subtitle="View your loan drawdowns, repayments, interest accruals, and statement ledger history."
      />
    </div>
  );
}
