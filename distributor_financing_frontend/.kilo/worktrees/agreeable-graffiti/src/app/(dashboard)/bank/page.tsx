'use client';

import { Topbar } from '@/components/dashboard/Topbar';
import { Card, ViewAllLink } from '@/components/dashboard/Card';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityPanel, PlatformNotificationsPanel } from '@/components/platform/ActivityPanel';
import { useBankDashboard } from '@/hooks/useBankDashboard';
import { useAuth } from '@/hooks/useAuth';
import {
  Factory,
  Building2,
  Clock3,
  UserCheck,
  Users,
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const STAT_ICONS: Record<string, { icon: typeof Factory; bg: string; color: string; defaultHref: string }> = {
  manufacturers: { icon: Factory, bg: 'bg-amber-50', color: 'text-amber-600', defaultHref: '/bank/manufacturers' },
  distributors: { icon: Building2, bg: 'bg-blue-50', color: 'text-[#1F4DA8]', defaultHref: '/bank/distributors' },
  pending: { icon: Clock3, bg: 'bg-rose-50', color: 'text-rose-600', defaultHref: '/bank/approvals' },
  bankUsers: { icon: UserCheck, bg: 'bg-indigo-50', color: 'text-indigo-600', defaultHref: '/bank/users' },
};

export default function BankDashboardPage() {
  const { user } = useAuth();
  const role = (user?.role || '').toUpperCase().trim();
  const isAdmin = role === 'BANK_ADMIN' || role === 'PLATFORM_ADMIN';
  const title = isAdmin ? 'Bank Administration' : 'Bank Operations Portal';
  const welcomeName = user?.username || (isAdmin ? 'Bank Admin' : 'Bank User');
  const avatarLetter = welcomeName ? welcomeName.charAt(0).toUpperCase() : 'B';

  return (
    <div className="pb-10">
      <Topbar
        title={title}
        welcomeName={welcomeName}
        tenantName={user?.bankName || "EMTech Financing Portal"}
        notificationCount={5}
        avatarLetter={avatarLetter}
      />

      <div className="px-6 lg:px-8 space-y-6">
        <BankStats />

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          <Card title="Bank Growth" className="lg:col-span-4">
            <BankGrowthChart />
          </Card>

          <Card title="Notifications" action={<ViewAllLink href="/bank/approvals" />} className="lg:col-span-6">
            <BankNotificationsPanel />
          </Card>
        </div>
      </div>
    </div>
  );
}

function BankStats() {
  const { stats, isLoading } = useBankDashboard();
  const { user } = useAuth();
  const role = (user?.role || '').toUpperCase().trim();
  const isAdmin = role === 'BANK_ADMIN' || role === 'PLATFORM_ADMIN' || (user?.permissions || []).includes('USER_MANAGEMENT');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-11 w-11 rounded-xl bg-slate-100" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
            <div className="h-7 w-16 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const iconCfg = STAT_ICONS[stat.icon] ?? {
          icon: Users,
          bg: 'bg-slate-100',
          color: 'text-[#64748B]',
          defaultHref: '/bank',
        };
        const defaultHref = stat.icon === 'bankUsers' && !isAdmin ? '/bank' : iconCfg.defaultHref;
        const targetHref = (stat as any).href
          ? (stat as any).href === '/bank/users' && !isAdmin
            ? '/bank'
            : (stat as any).href
          : defaultHref;

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
            href={targetHref}
          />
        );
      })}
    </div>
  );
}


function BankGrowthChart() {
  const { growthSeries, isLoading } = useBankDashboard();

  if (isLoading) {
    return <div className="h-72 bg-[#F7F9FC] rounded-xl animate-pulse" />;
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={growthSeries} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, fontWeight: 600, color: '#64748B', paddingTop: 12 }}
          />
          <Line type="monotone" dataKey="distributors" name="Distributors" stroke="#1F4DA8" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="approvals" name="Approvals" stroke="#F58220" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="facilities" name="Active Facilities" stroke="#3A6FD8" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function BankActivityPanel() {
  const { activityLog, isLoading } = useBankDashboard();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-100 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-slate-100 rounded-full w-3/4 animate-pulse" />
              <div className="h-3 bg-slate-100 rounded-full w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <ActivityPanel items={activityLog} />;
}

function BankNotificationsPanel() {
  const { notifications, isLoading } = useBankDashboard();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-100 animate-pulse shrink-0" />
            <div className="flex-1 min-y-1.5">
              <div className="h-3.5 bg-slate-100 rounded-full w-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <PlatformNotificationsPanel items={notifications} />;
}