'use client';

import React from 'react';
import { NotificationsView } from '@/components/dashboard/NotificationsView';

export default function DealerNotificationsPage() {
  return (
    <NotificationsView
      title="Distributor Notifications"
      subtitle="Credit line approval notices, disbursement confirmations, and repayment reminders."
      defaultEmailFallback="dealer@dfp.com"
      inspectRoute="/dealer/drawdowns"
      inspectLabel="View Drawdowns"
    />
  );
}
