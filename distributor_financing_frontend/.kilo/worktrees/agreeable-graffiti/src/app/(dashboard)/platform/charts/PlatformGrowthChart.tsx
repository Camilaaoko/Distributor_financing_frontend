'use client';

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
import { platformGrowthSeries } from '@/lib/mock/platform-admin';

export function PlatformGrowthChart() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={platformGrowthSeries} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, fontWeight: 600, color: '#64748b', paddingTop: 12 }}
          />
          <Line type="monotone" dataKey="users" name="Platform Users" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="banks" name="Banks Registered" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="logins" name="Monthly Logins" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
