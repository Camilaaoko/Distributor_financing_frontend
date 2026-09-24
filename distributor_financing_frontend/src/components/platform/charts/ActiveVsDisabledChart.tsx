'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';

export function ActiveVsDisabledChart() {
  const { admins } = usePlatformAdmin();

  const activeCount = admins.filter((a) => a.status === 'Active').length;
  const pendingCount = admins.filter((a) => a.status === 'Pending').length;
  const disabledCount = admins.filter((a) => a.status === 'Inactive' || a.status === 'Suspended' || a.status === 'Locked').length;

  const data = [
    { label: 'Active', value: activeCount, color: '#10B981' },
    { label: 'Pending', value: pendingCount, color: '#F58220' },
    { label: 'Disabled', value: disabledCount, color: '#64748B' },
  ];

  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            formatter={(value: any) => [`${value} admins`, 'Count']}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={36}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
