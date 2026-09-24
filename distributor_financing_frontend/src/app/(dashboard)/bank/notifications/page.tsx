'use client';

import React from 'react';
import { NotificationsView } from '@/components/dashboard/NotificationsView';

export default function BankNotificationsPage() {
  return (
    <NotificationsView
      title="Bank Notifications"
      subtitle="Real-time alerts, credit facility requests, KYC submissions, and audit events."
      defaultEmailFallback="bank@dfp.com"
      inspectRoute="/bank/distributors"
      inspectLabel="Inspect Distributors"
    />
  );
}
