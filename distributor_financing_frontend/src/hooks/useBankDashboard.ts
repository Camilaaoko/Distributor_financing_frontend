'use client';

import { useEffect, useState } from 'react';
import type { ActivityLogEntry, PlatformNotification } from '@/lib/types';
import { bankService } from '@/services/bank.service';
import { useToast } from '@/components/ui/Toast';

export interface BankDashboardStatItem {
  label: string;
  value: string;
  delta: string;
  trend: 'positive' | 'negative';
  icon: string;
  href?: string;
}

export function useBankDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState<BankDashboardStatItem[]>(bankDashboardStatsFallback.stats);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(bankDashboardStatsFallback.activityLog);
  const [notifications, setNotifications] = useState<PlatformNotification[]>(bankDashboardStatsFallback.notifications);
  const [growthSeries, setGrowthSeries] = useState(bankDashboardStatsFallback.growthSeries);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    
    bankService.getDashboardStats()
      .then((data) => {
        if (!cancelled) {
          setStats(data.stats);
          setActivityLog(data.activityLog);
          setNotifications(data.notifications);
          setGrowthSeries(data.growthSeries);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const message = err?.response?.data?.message || err?.message || 'Failed to load bank dashboard data';
          setError(message);
          toast.error(message);
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  return { stats, activityLog, notifications, growthSeries, isLoading, error };
}

const bankDashboardStatsFallback = {
  stats: [] as BankDashboardStatItem[],
  activityLog: [] as ActivityLogEntry[],
  notifications: [] as PlatformNotification[],
  growthSeries: [] as typeof import('@/lib/mock/bank').bankGrowthSeries,
};