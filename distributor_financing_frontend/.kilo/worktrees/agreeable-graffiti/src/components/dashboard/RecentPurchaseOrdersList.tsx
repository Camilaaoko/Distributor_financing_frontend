import { recentPurchaseOrders } from '@/lib/mock/manufacturer-dashboard';
import { StatusBadge } from './StatusBadge';

export function RecentPurchaseOrdersList() {
  return (
    <div className="space-y-4">
      {recentPurchaseOrders.map((order) => (
        <div key={order.id} className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#1E293B] truncate">{order.id}</div>
            <div className="text-xs text-[#64748B] truncate">{order.distributor}</div>
          </div>
          <div className="text-right shrink-0">
            <StatusBadge status={order.status} />
            <div className="text-xs text-[#64748B] mt-1">{order.date}</div>
          </div>
        </div>
      ))}
    </div>
  );
}