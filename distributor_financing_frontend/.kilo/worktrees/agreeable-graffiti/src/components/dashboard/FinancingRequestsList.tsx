import { financingRequests } from '@/lib/mock/manufacturer-dashboard';
import { StatusBadge } from './StatusBadge';

export function FinancingRequestsList() {
  return (
    <div className="space-y-4">
      {financingRequests.map((req) => (
        <div key={req.name} className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ${req.color}`}>
            {req.initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[#1E293B] truncate">{req.name}</div>
            <div className="text-xs text-[#64748B]">{req.date}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-[#1E293B]">{req.amount}</div>
            <StatusBadge status={req.status} />
          </div>
        </div>
      ))}
    </div>
  );
}