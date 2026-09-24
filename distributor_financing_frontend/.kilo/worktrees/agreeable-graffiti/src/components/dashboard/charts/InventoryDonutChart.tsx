'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { inventoryStatus } from '@/lib/mock/manufacturer-dashboard';

export function InventoryDonutChart() {
  return (
    <div className="relative h-44 w-44 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={inventoryStatus}
            dataKey="value"
            nameKey="label"
            innerRadius="70%"
            outerRadius="100%"
            paddingAngle={2}
            stroke="none"
          >
            {inventoryStatus.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <div className="text-[11px] font-semibold text-slate-400">Total Inventory</div>
        <div className="text-lg font-black text-slate-900">KES 156.4M</div>
        <div className="text-[11px] text-slate-400">212 Items</div>
      </div>
    </div>
  );
}
