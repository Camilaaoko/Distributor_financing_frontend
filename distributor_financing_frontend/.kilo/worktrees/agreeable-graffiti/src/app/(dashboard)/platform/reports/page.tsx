'use client';

import { Download } from 'lucide-react';
import { PlatformGrowthChart } from '@/components/platform/charts/PlatformGrowthChart';
import { UserDistributionChart, UserDistributionLegend } from '@/components/platform/charts/UserDistributionChart';
import { ActiveVsDisabledChart } from '@/components/platform/charts/ActiveVsDisabledChart';
import { useToast } from '@/components/ui/Toast';

export default function PlatformReportsPage() {
  const { success } = useToast();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Platform-wide growth and usage reports.</p>
        </div>
        <button
          onClick={() => success('Report export is coming soon.')}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-sm hover:bg-slate-50 cursor-pointer"
        >
          <Download size={15} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 mb-4">Platform Growth</h2>
          <PlatformGrowthChart />
        </div>
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 mb-4">User Distribution by Bank</h2>
          <UserDistributionChart />
          <UserDistributionLegend />
        </div>
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 mb-4">Active vs Disabled Users</h2>
          <ActiveVsDisabledChart />
        </div>
      </div>
    </div>
  );
}