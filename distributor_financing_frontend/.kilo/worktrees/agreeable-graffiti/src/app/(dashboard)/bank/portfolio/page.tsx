'use client';

import { useEffect, useState } from 'react';
import { Landmark, TrendingUp, Wallet, AlertCircle, ShieldAlert } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card } from '@/components/dashboard/Card';
import { bankService } from '@/services/bank.service';
import { useAuth } from '@/hooks/useAuth';
import type { LoanDashboardResponse, AgingBucket } from '@/lib/types';

const STAT_ICONS: Record<string, { icon: typeof Landmark; bg: string; color: string }> = {
  portfolio: { icon: Landmark, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  utilized: { icon: Wallet, bg: 'bg-orange-50', color: 'text-[#F58220]' },
  available: { icon: TrendingUp, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  outstanding: { icon: Wallet, bg: 'bg-red-50', color: 'text-[#DC2626]' },
};

export default function BankPortfolioPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<LoanDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missingBankId, setMissingBankId] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setMissingBankId(false);

    const bankId = user?.bankId;

    if (!bankId) {
      setMissingBankId(true);
      setIsLoading(false);
      return;
    }

    bankService
      .getPortfolioData(bankId)
      .then((data) => {
        if (cancelled) return;
        setDashboard(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.bankId]);

  // Helper to format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Build stats from backend response
  const stats = dashboard
    ? [
        {
          label: 'Total Portfolio',
          value: formatCurrency(dashboard.totalDisbursed),
          delta: '—',
          trend: 'positive' as const,
          icon: 'portfolio',
        },
        {
          label: 'Utilized Credit',
          value: formatCurrency(dashboard.totalOutstanding),
          delta: '—',
          trend: 'negative' as const,
          icon: 'utilized',
        },
        {
          label: 'Available Credit',
          value: '—',
          delta: '—',
          trend: 'positive' as const,
          icon: 'available',
        },
        {
          label: 'Outstanding Loans',
          value: formatCurrency(dashboard.totalOutstanding),
          delta: `${dashboard.activeLoans} active`,
          trend: 'positive' as const,
          icon: 'outstanding',
        },
      ]
    : [];

  // Aging buckets from backend
  const agingBuckets = dashboard?.agingBuckets ?? [];

  if (missingBankId) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Portfolio Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor credit allocation, utilization, and facility performance across all distributors.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center">
          <ShieldAlert className="w-12 h-12 mx-auto text-amber-500 mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Bank ID Not Available</h2>
          <p className="text-slate-600 mb-4 max-w-md mx-auto">
            The authenticated user does not have a bank identifier. In mock mode, bank users have a bankId.
            In real mode, the authentication backend must provide the bank identifier in the login response.
          </p>
          <p className="text-xs text-slate-500 font-mono">Required: LoginResponse.bankId</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Portfolio Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor credit allocation, utilization, and facility performance across all distributors.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-rose-500 mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load Portfolio</h2>
          <p className="text-slate-600 mb-4 max-w-md mx-auto">{error}</p>
          <p className="text-xs text-slate-500 font-mono">GET /loans/requests/dashboard/bank/&#123;bankId&#125;</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Portfolio Overview</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Monitor credit allocation, utilization, and facility performance across all distributors.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-11 w-11 rounded-xl bg-slate-100" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
                <div className="h-7 w-20 bg-slate-100 rounded" />
              </div>
            ))
          : stats.length === 0
          ? [
              { label: 'Total Portfolio', value: '—', delta: '—', trend: 'positive' as const, icon: 'portfolio' },
              { label: 'Utilized Credit', value: '—', delta: '—', trend: 'negative' as const, icon: 'utilized' },
              { label: 'Available Credit', value: '—', delta: '—', trend: 'positive' as const, icon: 'available' },
              { label: 'Outstanding Loans', value: '—', delta: '—', trend: 'positive' as const, icon: 'outstanding' },
            ].map((stat) => {
              const iconCfg = STAT_ICONS[stat.icon] ?? { icon: Landmark, bg: 'bg-slate-100', color: 'text-slate-600' };
              return (
                <StatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  delta={stat.delta}
                  trend={stat.trend}
                  icon={iconCfg.icon}
                  iconBg={iconCfg.bg}
                  iconColor={iconCfg.color}
                />
              );
            })
          : stats.map((stat) => {
              const iconCfg = STAT_ICONS[stat.icon] ?? { icon: Landmark, bg: 'bg-slate-100', color: 'text-slate-600' };
              return (
                <StatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  delta={stat.delta}
                  trend={stat.trend}
                  icon={iconCfg.icon}
                  iconBg={iconCfg.bg}
                  iconColor={iconCfg.color}
                />
              );
            })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Portfolio Growth">
          {isLoading ? (
            <div className="h-72 bg-slate-50 rounded-xl animate-pulse" />
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400">
              <p className="text-sm">No growth data available from the Loans Service</p>
            </div>
          )}
        </Card>

        <Card title="Credit Utilization per Distributor">
          {isLoading ? (
            <div className="h-72 bg-slate-50 rounded-xl animate-pulse" />
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400">
              <p className="text-sm">No utilization data available from the Loans Service</p>
            </div>
          )}
        </Card>
      </div>

      {/* Aging Buckets - from backend */}
      {agingBuckets.length > 0 && (
        <Card title="Loan Aging Analysis">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aging Bucket</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Loan Count</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount (KES)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agingBuckets.map((bucket: AgingBucket, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-900">{bucket.range}</td>
                    <td className="px-4 py-3 text-slate-600">{bucket.count}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">{formatCurrency(bucket.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Loan Status Summary */}
      {dashboard && (
        <Card title="Loan Status Summary">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Loans</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{dashboard.activeLoans}</div>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Overdue Loans</div>
              <div className="text-2xl font-bold text-rose-700 mt-1">{dashboard.overdueLoans}</div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{dashboard.completedLoans}</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Defaulted</div>
              <div className="text-2xl font-bold text-amber-700 mt-1">{dashboard.defaultedLoans}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}