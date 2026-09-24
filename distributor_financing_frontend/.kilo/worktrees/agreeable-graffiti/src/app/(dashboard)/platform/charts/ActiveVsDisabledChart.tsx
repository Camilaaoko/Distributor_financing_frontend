'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { activeVsDisabled } from '@/lib/mock/platform-admin';

export function ActiveVsDisabledChart() {
  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={activeVsDisabled} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            formatter={(value: number) => [`${value} admins`, 'Count']}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={36}>
            {activeVsDisabled.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
