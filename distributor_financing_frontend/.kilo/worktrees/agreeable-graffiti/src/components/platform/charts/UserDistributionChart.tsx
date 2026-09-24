'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';
import { useBanks } from '@/hooks/useBanks';

const PALETTE = ['#1F4DA8', '#3A6FD8', '#F58220', '#10B981', '#6366F1', '#8B5CF6', '#EC4899'];

export function UserDistributionChart() {
  const { admins } = usePlatformAdmin();
  const { banks } = useBanks();

  // Group admins by bankName
  const countsByBank: Record<string, number> = {};
  admins.forEach((a) => {
    const bankName = a.bankName || 'Unknown Bank';
    countsByBank[bankName] = (countsByBank[bankName] || 0) + 1;
  });

  const data = Object.keys(countsByBank).map((name, i) => ({
    label: name,
    value: countsByBank[name],
    color: PALETTE[i % PALETTE.length],
  }));

  const total = admins.length;

  if (total === 0) {
    return (
      <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs">
        <p className="font-semibold text-slate-500">No bank user data yet</p>
      </div>
    );
  }

  return (
    <div className="relative h-44 w-44 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="70%"
            outerRadius="100%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any, name: any) => [`${value} admins`, name]}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <div className="text-[11px] font-semibold text-slate-400">Total Admins</div>
        <div className="text-lg font-black text-slate-900">{total}</div>
        <div className="text-[11px] text-slate-400">Across {data.length} banks</div>
      </div>
    </div>
  );
}

export function UserDistributionLegend() {
  const { admins } = usePlatformAdmin();

  const countsByBank: Record<string, number> = {};
  admins.forEach((a) => {
    const bankName = a.bankName || 'Unknown Bank';
    countsByBank[bankName] = (countsByBank[bankName] || 0) + 1;
  });

  const data = Object.keys(countsByBank).map((name, i) => ({
    label: name,
    value: countsByBank[name],
    color: PALETTE[i % PALETTE.length],
  }));

  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-4">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2 text-xs">
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
          <span className="text-slate-500 flex-1 truncate">{d.label}</span>
          <span className="font-bold text-slate-900">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
