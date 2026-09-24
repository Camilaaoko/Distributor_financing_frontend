'use client';

import {
  UserPlus, KeyRound, Pencil, Trash2, AlertTriangle,
  Clock3, ShieldAlert, Lock, Settings2, type LucideIcon,
} from 'lucide-react';
import { activityLog, platformNotifications } from '@/lib/mock/platform-admin';
import type { ActivityLogEntry, PlatformNotification } from '@/lib/types';

const ACTIVITY_ICONS: Record<ActivityLogEntry['type'], { icon: LucideIcon; bg: string; color: string }> = {
  created: { icon: UserPlus, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  updated: { icon: Pencil, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  deleted: { icon: Trash2, bg: 'bg-red-50', color: 'text-[#DC2626]' },
  security: { icon: KeyRound, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  warning: { icon: AlertTriangle, bg: 'bg-orange-50', color: 'text-[#F58220]' },
};

const NOTIFICATION_ICONS: Record<PlatformNotification['type'], { icon: LucideIcon; bg: string; color: string }> = {
  approval: { icon: Clock3, bg: 'bg-orange-50', color: 'text-[#F58220]' },
  registration: { icon: UserPlus, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  security: { icon: ShieldAlert, bg: 'bg-red-50', color: 'text-[#DC2626]' },
  lock: { icon: Lock, bg: 'bg-red-50', color: 'text-[#DC2626]' },
  system: { icon: Settings2, bg: 'bg-slate-100', color: 'text-[#64748B]' },
};

export function ActivityPanel({ items = activityLog }: { items?: ActivityLogEntry[] }) {
  return (
    <div className="space-y-4">
      {items.map((entry) => {
        const { icon: Icon, bg, color } = ACTIVITY_ICONS[entry.type];
        return (
          <div key={entry.id} className="flex items-start gap-3">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
              <Icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1E293B] truncate">{entry.action}</p>
              <p className="text-xs text-[#64748B] truncate">{entry.target}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{entry.actor} · {entry.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PlatformNotificationsPanel({ items = platformNotifications }: { items?: PlatformNotification[] }) {
  return (
    <div className="space-y-4">
      {items.map((n) => {
        const { icon: Icon, bg, color } = NOTIFICATION_ICONS[n.type];
        return (
          <div key={n.id} className="flex items-start gap-3">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
              <Icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#1E293B]">{n.message}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{n.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}