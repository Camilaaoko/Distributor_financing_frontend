'use client';

import React from 'react';
import { NotificationsView } from '@/components/dashboard/NotificationsView';

export default function ManufacturerNotificationsPage() {
  return (
    <NotificationsView
      title="Manufacturer Notifications"
      subtitle="Real-time distributor referral decisions, invoice sign-offs, and bank settlements."
      defaultEmailFallback="manufacturer@dfp.com"
      inspectRoute="/manufacturer/distributors"
      inspectLabel="View Distributors"
    />
  );
}
