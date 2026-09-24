'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { notificationsService } from '@/services/notifications.service';
import type { InAppNotification, PlatformNotification } from '@/lib/types';
import { PlatformNotificationsPanel } from '@/components/platform/ActivityPanel';

function mapInAppToPlatform(notification: InAppNotification): PlatformNotification {
  const createdAt = new Date(notification.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let time: string;
  if (diffMins < 1) time = 'just now';
  else if (diffMins < 60) time = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  else if (diffHours < 24) time = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  else if (diffDays < 7) time = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  else time = createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const title = notification.title.toLowerCase();
  let type: PlatformNotification['type'] = 'system';
  if (title.includes('approval') || title.includes('approv')) type = 'approval';
  else if (title.includes('registration') || title.includes('register') || title.includes('signup') || title.includes('onboard')) type = 'registration';
  else if (title.includes('security') || title.includes('login') || title.includes('failed') || title.includes('password')) type = 'security';
  else if (title.includes('lock') || title.includes('locked') || title.includes('disable') || title.includes('suspend')) type = 'lock';

  return {
    id: notification.id,
    message: notification.message,
    time,
    type,
  };
}

export function PlatformNotificationsClient() {
  const { user, isLoading: authLoading } = useAuthContext();
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchNotifications() {
      if (authLoading || !user?.email) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await notificationsService.list(user.email);
        if (!cancelled) {
          const mapped = data.map(mapInAppToPlatform);
          setNotifications(mapped);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load notifications');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchNotifications();

    return () => {
      cancelled = true;
    };
  }, [user?.email, authLoading]);

  const handleMarkRead = async (notificationId: string) => {
    try {
      await notificationsService.markRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch {
      // Silent failure - could add toast if needed
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="h-9 w-9 rounded-xl bg-slate-100 shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="h-3.5 bg-slate-100 rounded-full w-3/4" />
              <div className="h-3 bg-slate-100 rounded-full w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!user?.email) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p className="text-sm">Please sign in to view notifications.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="h-9 w-9 rounded-xl bg-slate-100 shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="h-3.5 bg-slate-100 rounded-full w-3/4" />
              <div className="h-3 bg-slate-100 rounded-full w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <PlatformNotificationsPanel
      items={notifications}
      onMarkRead={handleMarkRead}
    />
  );
}