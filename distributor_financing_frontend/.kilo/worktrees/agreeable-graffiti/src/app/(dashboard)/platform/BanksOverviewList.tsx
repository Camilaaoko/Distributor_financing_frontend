import { Landmark } from 'lucide-react';
import { banks } from '@/lib/mock/platform-admin';

export function BanksOverviewList() {
  return (
    <div className="space-y-4">
      {banks.slice(0, 5).map((b) => (
        <div key={b.id} className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <Landmark size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900 truncate">{b.name}</div>
            <div className="text-xs text-slate-400">{b.adminCount} admin{b.adminCount === 1 ? '' : 's'}</div>
          </div>
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
              b.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {b.status}
          </span>
        </div>
      ))}
    </div>
  );
}
