import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { bankAdmins } from '@/lib/mock/platform-admin';

export function RecentBankAdminsList() {
  const recent = [...bankAdmins]
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {recent.map((a) => (
        <div key={a.id} className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-full ${a.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
            {a.firstName[0]}{a.lastName[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900 truncate">{a.firstName} {a.lastName}</div>
            <div className="text-xs text-slate-400 truncate">{a.bankName}</div>
          </div>
          <StatusBadge status={a.status} />
        </div>
      ))}
    </div>
  );
}
