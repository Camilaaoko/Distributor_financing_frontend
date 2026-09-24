'use client';

import React, { useState, useEffect } from 'react';
import { Landmark, ShieldCheck, XCircle, Factory, Building2, Users } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { useBanks } from '@/hooks/useBanks';
import { manufacturerApi, distributorApi, bankOnboardingApi } from '@/services/onboarding-api.service';

export function PlatformStats() {
  const { banks } = useBanks();
  const [manufacturerCount, setManufacturerCount] = useState<number>(0);
  const [distributorCount, setDistributorCount] = useState<number>(0);
  const [bankAdminCount, setBankAdminCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      manufacturerApi.getManufacturers().catch(() => []),
      distributorApi.getDistributors().catch(() => []),
      bankOnboardingApi.getAllBankAdmins().catch(() => []),
    ]).then(([mfgs, dists, admins]) => {
      if (!cancelled) {
        setManufacturerCount(Array.isArray(mfgs) ? mfgs.length : 0);
        setDistributorCount(Array.isArray(dists) ? dists.length : 0);
        setBankAdminCount(Array.isArray(admins) ? admins.length : 0);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalBanks = banks.length;
  const activeBanks = banks.filter((b) => (b.status as string)?.toUpperCase() === 'ACTIVE').length;
  const suspendedBanks = banks.filter((b) => {
    const s = (b.status as string)?.toUpperCase();
    return s === 'SUSPENDED' || s === 'INACTIVE' || s === 'DISABLED' || s === 'REJECTED';
  }).length;

  const stats = [
    {
      label: 'Active Banks',
      value: String(activeBanks),
      delta: 'Live',
      trend: 'positive' as const,
      icon: ShieldCheck,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
      href: '/platform/banks?status=ACTIVE',
    },
    {
      label: 'Suspended Banks',
      value: String(suspendedBanks),
      delta: 'Suspended',
      trend: 'negative' as const,
      icon: XCircle,
      bg: 'bg-rose-50',
      color: 'text-rose-600',
      href: '/platform/banks?status=SUSPENDED',
    },
    {
      label: 'Bank Admins',
      value: String(bankAdminCount),
      delta: 'Provisioned',
      trend: 'positive' as const,
      icon: Users,
      bg: 'bg-blue-50',
      color: 'text-[#1F4DA8]',
      href: '/platform/users',
    },
    {
      label: 'Manufacturers',
      value: String(manufacturerCount),
      delta: 'Enrolled',
      trend: 'positive' as const,
      icon: Factory,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
      href: '/platform/manufacturers',
    },
    {
      label: 'Distributors',
      value: String(distributorCount),
      delta: 'Registered',
      trend: 'positive' as const,
      icon: Building2,
      bg: 'bg-indigo-50',
      color: 'text-indigo-600',
      href: '/platform/distributors',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          delta={stat.delta}
          trend={stat.trend}
          icon={stat.icon}
          iconBg={stat.bg}
          iconColor={stat.color}
          href={stat.href}
        />
      ))}
    </div>
  );
}