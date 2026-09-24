import { inventoryStatus } from '@/lib/mock/manufacturer-dashboard';

export function InventoryLegend() {
  return (
    <div className="space-y-3 mt-5">
      {inventoryStatus.map((item) => (
        <div key={item.label} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-slate-600">{item.label}</span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-slate-900">{item.amount}</div>
            <div className="text-xs text-slate-400">{item.pct}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
