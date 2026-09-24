import { topDistributors } from '@/lib/mock/manufacturer-dashboard';

export function TopDistributorsList() {
  const max = Math.max(...topDistributors.map((d) => d.value));

  return (
    <div className="space-y-4">
      {topDistributors.map((d, i) => (
        <div key={d.name} className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-blue-50 text-[#1F4DA8] text-xs font-semibold flex items-center justify-center shrink-0">
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-semibold text-[#1E293B] truncate">{d.name}</span>
              <span className="font-semibold text-[#1E293B] shrink-0 ml-2">{d.amount}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#1F4DA8] transition-all"
                style={{ width: `${(d.value / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}