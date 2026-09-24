'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  CheckCheck,
  RefreshCw,
  Inbox,
  Filter,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthContext } from '@/providers/AuthProvider';
import { notificationsService } from '@/services/notifications.service';
import type { InAppNotification } from '@/types/notifications';
import { useToast } from '@/components/ui/Toast';

interface NotificationsViewProps {
  title: string;
  subtitle: string;
  defaultEmailFallback: string;
  inspectRoute: string;
  inspectLabel: string;
}

export function NotificationsView({
  title,
  subtitle,
  defaultEmailFallback,
  inspectRoute,
  inspectLabel,
}: NotificationsViewProps) {
  const toast = useToast();
  const { user, isLoading: authLoading } = useAuthContext();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const userEmail =
    user?.email?.trim().toLowerCase() ||
    (user?.username && user.username.includes('@') ? user.username.trim().toLowerCase() : defaultEmailFallback);

  const loadNotifications = useCallback(async () => {
    if (!userEmail) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await notificationsService.list(userEmail).catch(() => []);
      if (Array.isArray(data)) {
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setNotifications(sorted);
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (!authLoading) {
      loadNotifications();
    }
  }, [loadNotifications, authLoading]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      toast.success('Marked notification as read.');
    } catch {
      toast.error('Failed to mark as read.');
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map((n) => notificationsService.markRead(n.id).catch(() => {})));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark all as read.');
    }
  };


  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="h-7 w-7 text-[#1F4DA8]" />
            {title}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
            >
              <CheckCheck size={14} className="text-[#1F4DA8]" />
              Mark All Read
            </button>
          )}

          <button
            onClick={loadNotifications}
            disabled={isLoading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh notifications"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin text-[#1F4DA8]' : ''} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'ALL'
                ? 'bg-[#1F4DA8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Notifications ({notifications.length})
          </button>

          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'UNREAD'
                ? 'bg-[#1F4DA8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="text-[11px] font-semibold text-slate-400 px-3 hidden sm:block">
          Recipient: <span className="font-mono text-slate-600">{userEmail}</span>
        </div>
      </div>

      {/* List / Empty State */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw size={24} className="animate-spin text-[#1F4DA8] mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Fetching your notifications…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Inbox size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {filter === 'UNREAD' ? 'No Unread Notifications' : 'All Caught Up'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filter === 'UNREAD'
              ? 'You have read all received alerts for your account.'
              : 'No notifications found for this account inbox.'}
          </p>
          <div className="pt-2">
            <Link
              href={inspectRoute}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#1F4DA8] bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
            >
              <span>{inspectLabel}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4.5 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs ${
                !item.read
                  ? 'bg-white border-blue-200 shadow-xs border-l-4 border-l-[#1F4DA8]'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  {!item.read && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#1F4DA8]">
                      NEW
                    </span>
                  )}
                  <h4
                    className={`text-sm tracking-tight ${
                      !item.read ? 'font-black text-slate-900' : 'font-semibold text-slate-700'
                    }`}
                  >
                    {item.title}
                  </h4>
                </div>

                <p
                  className={`text-xs leading-relaxed ${
                    !item.read ? 'font-bold text-slate-800' : 'font-normal text-slate-500'
                  }`}
                >
                  {item.message}
                </p>

                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 pt-1">
                  <Clock size={11} />
                  <span>
                    {item.createdAt
                      ? new Intl.DateTimeFormat('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(new Date(item.createdAt))
                      : 'Just now'}
                  </span>
                </div>
              </div>

              {!item.read && (
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1F4DA8] hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={13} />
                    <span>Mark as Read</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
