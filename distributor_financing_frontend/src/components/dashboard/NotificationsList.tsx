import { Bell, ReceiptText, Truck, PackageSearch, Users } from 'lucide-react';
import { notifications } from '@/lib/mock/manufacturer-dashboard';

const ICONS = {
  bell: { Icon: Bell, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  invoice: { Icon: ReceiptText, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  truck: { Icon: Truck, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  inventory: { Icon: PackageSearch, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  users: { Icon: Users, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
} as const;

export function NotificationsList() {
  return (
    <div className="space-y-4">
      {notifications.map((note, i) => {
        const { Icon, bg, color } = ICONS[note.icon];
        return (
          <div key={i} className="flex items-start gap-3">
            <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${bg} ${color}`}>
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[#1E293B] leading-snug">{note.message}</div>
              <div className="text-xs text-[#64748B] mt-0.5">{note.time}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}