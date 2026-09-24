'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { userDistributionByBank } from '@/lib/mock/platform-admin';

const total = userDistributionByBank.reduce((sum, d) => sum + d.value, 0);

export function UserDistributionChart() {
  return (
    <div className="relative h-44 w-44 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={userDistributionByBank}
            dataKey="value"
            nameKey="label"
            innerRadius="70%"
            outerRadius="100%"
            paddingAngle={2}
            stroke="none"
          >
            {userDistributionByBank.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value} admins`, name]}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <div className="text-[11px] font-semibold text-slate-400">Total Admins</div>
        <div className="text-lg font-black text-slate-900">{total}</div>
        <div className="text-[11px] text-slate-400">Across {userDistributionByBank.length} banks</div>
      </div>
    </div>
  );
}

export function UserDistributionLegend() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-4">
      {userDistributionByBank.map((d) => (
        <div key={d.label} className="flex items-center gap-2 text-xs">
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
          <span className="text-slate-500 flex-1 truncate">{d.label}</span>
          <span className="font-bold text-slate-900">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
