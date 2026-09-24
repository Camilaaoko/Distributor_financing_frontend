'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  Shield,
  Building,
  Factory,
  Store,
  Clock,
  Clock3,
  UserPlus,
  ShieldAlert,
  Lock,
  Settings2,
  type LucideIcon,
} from 'lucide-react';
import { auditLogsApi } from '@/services/onboarding-api.service';
import type { AuditLogResponse } from '@/types/onboarding';
import type { ActivityLogEntry, PlatformNotification } from '@/lib/types';
import { platformNotifications } from '@/lib/mock/platform-admin';

export function ActivityPanel({ items }: { items?: ActivityLogEntry[] }) {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [isLoading, setIsLoading] = useState(!items);

  useEffect(() => {
    if (items) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    auditLogsApi
      .getAuditLogs()
      .then((data) => {
        if (!cancelled) {
          setLogs(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      })
      .catch(() => {
        if (!cancelled) setLogs([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [items]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-9 w-9 rounded-xl bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-slate-100 rounded w-3/4" />
              <div className="h-2.5 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items && items.length > 0) {
    return (
      <div className="space-y-4">
        {items.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-[#1F4DA8]">
              <Activity size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1E293B] truncate">{entry.action}</p>
              <p className="text-xs text-[#64748B] truncate">{entry.target}</p>
              <p className="text-xs text-[#64748B] mt-0.5">
                {entry.actor} · {entry.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Activity size={24} className="mx-auto text-slate-300 mb-1.5" />
        <p className="text-xs font-semibold text-slate-600">No system activity recorded yet</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Audit events will appear here in real-time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((entry) => (
        <div key={entry.id} className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-[#1F4DA8]">
            <Activity size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#1E293B] truncate">{entry.action}</p>
            <p className="text-xs text-[#64748B] truncate">{entry.details || 'System event'}</p>
            <p className="text-xs text-[#64748B] mt-0.5">
              {entry.userFullName || entry.userId || 'System'} · {entry.timestamp}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

const NOTIFICATION_ICONS: Record<PlatformNotification['type'], { icon: LucideIcon; bg: string; color: string }> = {
  approval: { icon: Clock3, bg: 'bg-orange-50', color: 'text-[#F58220]' },
  registration: { icon: UserPlus, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  security: { icon: ShieldAlert, bg: 'bg-red-50', color: 'text-[#DC2626]' },
  lock: { icon: Lock, bg: 'bg-red-50', color: 'text-[#DC2626]' },
  system: { icon: Settings2, bg: 'bg-slate-100', color: 'text-[#64748B]' },
};

export function PlatformNotificationsPanel({
  items = platformNotifications,
  onMarkRead,
}: {
  items?: PlatformNotification[];
  onMarkRead?: (id: string) => void;
}) {

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p className="text-sm">No notifications</p>
        </div>
      ) : (
        items.map((n) => {
          const { icon: Icon, bg, color } = NOTIFICATION_ICONS[n.type];
          return (
            <div
              key={n.id}
              className="flex items-start gap-3 p-3 rounded-xl transition-colors bg-[#F7F9FC]"
            >
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#64748B] line-clamp-2">{n.message}</p>
                <p className="text-[11px] text-[#94A3B8] mt-1">{n.time}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}