'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CustomerStatementView } from '@/components/reports/CustomerStatementView';

export default function BankDistributorStatementPage() {
  const params = useParams();
  const distributorId = String(params?.id || 'dist-001');

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <CustomerStatementView
        distributorId={distributorId}
        isSelfService={false}
        title={`Distributor Statement — ${distributorId}`}
        subtitle="Formal financial account statement with loan sub-accounts and chronological ledger history."
      />
    </div>
  );
}
