'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { salesFinancingSeries } from '@/lib/mock/manufacturer-dashboard';

export function SalesFinancingChart() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={salesFinancingSeries} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}M`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`KES ${value}M`, name === 'sales' ? 'Sales' : 'Financing']}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
          />
          <Line type="monotone" dataKey="sales" name="Sales (KES)" stroke="#1F4DA8" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="financing" name="Financing (KES)" stroke="#F58220" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
