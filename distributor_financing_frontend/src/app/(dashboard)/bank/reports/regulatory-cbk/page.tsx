'use client';

import React from 'react';
import { CbkRegulatoryView } from '@/components/reports/CbkRegulatoryView';
import { useAuth } from '@/hooks/useAuth';

export default function BankCbkRegulatoryPage() {
  const { user } = useAuth();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <CbkRegulatoryView
        bankId={user?.bankId}
        userRole={user?.role || 'BANK_ADMIN'}
      />
    </div>
  );
}
