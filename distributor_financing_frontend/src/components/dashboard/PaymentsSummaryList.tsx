import { Wallet, Clock3, AlertTriangle } from 'lucide-react';
import { paymentsSummary } from '@/lib/mock/manufacturer-dashboard';

const ICONS = {
  received: { Icon: Wallet, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  outstanding: { Icon: Clock3, bg: 'bg-orange-50', color: 'text-[#F58220]' },
  overdue: { Icon: AlertTriangle, bg: 'bg-red-50', color: 'text-[#DC2626]' },
} as const;

export function PaymentsSummaryList() {
  return (
    <div className="space-y-3">
      {paymentsSummary.map((item) => {
        const { Icon, bg, color } = ICONS[item.icon];
        return (
          <div key={item.label} className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] p-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#64748B]">{item.label}</div>
              <div className="text-base font-semibold text-[#1E293B]">{item.value}</div>
              <div className={`text-xs font-semibold ${item.trend === 'positive' ? 'text-[#F58220]' : 'text-[#DC2626]'}`}>
                {item.trend === 'positive' ? '↑' : '↓'} {item.delta} vs last month
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}