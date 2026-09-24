import { Topbar } from '@/components/dashboard/Topbar';
import { Card, ViewAllLink } from '@/components/dashboard/Card';
import { PlatformStats } from '@/components/platform/PlatformStats';
import { EcosystemTopologyCard } from '@/components/platform/EcosystemTopologyCard';
import { RecentBankAdminsList } from '@/components/platform/RecentBankAdminsList';
import { BanksOverviewList } from '@/components/platform/BanksOverviewList';
import { PlatformQuickActions } from '@/components/platform/PlatformQuickActions';

export default function PlatformDashboardPage() {
  return (
    <div className="pb-10">
      <Topbar
        title="Platform Administration"
        welcomeName="Platform Admin"
        tenantName="DFP Platform"
        avatarLetter="P"
      />

      <div className="px-6 lg:px-8 space-y-6">
        {/* KPI metrics */}
        <PlatformStats />

        {/* Multi-Tenant Ecosystem Relationship & Value Chain Pipeline */}
        <EcosystemTopologyCard />

        {/* Live Partner Banks & Administrator Directories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Partner Banks" action={<ViewAllLink href="/platform/banks" />}>
            <BanksOverviewList />
          </Card>

          <Card title="Recent Bank Admins" action={<ViewAllLink href="/platform/users" />}>
            <RecentBankAdminsList />
          </Card>

          <Card title="Platform Actions">
            <PlatformQuickActions />
          </Card>
        </div>
      </div>
    </div>
  );
}


