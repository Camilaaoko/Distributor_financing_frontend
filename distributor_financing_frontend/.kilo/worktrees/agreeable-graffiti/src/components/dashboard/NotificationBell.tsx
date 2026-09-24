"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Check,
  CheckCheck,
  Clock,
  Calendar,
  BellOff,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";
import { notificationsService } from "@/services/notifications.service";
import type { InAppNotification } from "@/lib/types";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  fullDateTime: string;
  relativeTime: string;
  type: "success" | "warning" | "info";
  read: boolean;
  link?: string;
}

function formatNotificationDateTime(dateStr?: string): {
  formattedDate: string;
  formattedTime: string;
  fullDateTime: string;
  relativeTime: string;
} {
  if (!dateStr) {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return {
      formattedDate,
      formattedTime,
      fullDateTime: `${formattedDate} at ${formattedTime}`,
      relativeTime: "Just now",
    };
  }

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return {
      formattedDate: dateStr,
      formattedTime: "",
      fullDateTime: dateStr,
      relativeTime: dateStr,
    };
  }

  const formattedDate = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }); // e.g. 01 Sep 2026

  const formattedTime = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }); // e.g. 08:45 AM

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let relativeTime: string;
  if (diffMins < 1) relativeTime = "Just now";
  else if (diffMins < 60) relativeTime = `${diffMins}m ago`;
  else if (diffHours < 24) relativeTime = `${diffHours}h ago`;
  else if (diffDays < 7) relativeTime = `${diffDays}d ago`;
  else relativeTime = formattedDate;

  return {
    formattedDate,
    formattedTime,
    fullDateTime: `${formattedDate} • ${formattedTime}`,
    relativeTime,
  };
}

function mapInAppToApp(notification: InAppNotification): AppNotification {
  const { formattedDate, formattedTime, fullDateTime, relativeTime } =
    formatNotificationDateTime(notification.createdAt);

  const titleLower = (notification.title || "").toLowerCase();
  let type: AppNotification["type"] = "info";
  if (
    titleLower.includes("approval") ||
    titleLower.includes("approv") ||
    titleLower.includes("active") ||
    titleLower.includes("disbursed") ||
    titleLower.includes("success")
  ) {
    type = "success";
  } else if (
    titleLower.includes("security") ||
    titleLower.includes("login") ||
    titleLower.includes("failed") ||
    titleLower.includes("reject") ||
    titleLower.includes("warning")
  ) {
    type = "warning";
  }

  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    date: formattedDate,
    time: formattedTime,
    fullDateTime,
    relativeTime,
    type,
    read: notification.read,
  };
}

function getNotificationRoute(item: AppNotification, pathname: string): string | null {
  const content = `${item.title} ${item.message}`.toLowerCase();

  if (pathname.startsWith("/bank")) {
    if (content.includes("recommend") || content.includes("approval") || content.includes("distributor")) {
      return "/bank/approvals";
    }
    if (content.includes("user") || content.includes("staff") || content.includes("maker") || content.includes("checker")) {
      return "/bank/users";
    }
    if (content.includes("repay") || content.includes("loan") || content.includes("facility")) {
      return "/bank";
    }
    return "/bank/distributors";
  }

  if (pathname.startsWith("/manufacturer")) {
    if (content.includes("distributor") || content.includes("recommend")) {
      return "/manufacturer/distributors";
    }
    if (content.includes("disburse") || content.includes("funds")) {
      return "/manufacturer";
    }
    return "/manufacturer/distributors";
  }

  if (pathname.startsWith("/dealer")) {
    if (content.includes("bank") || content.includes("facility")) {
      return "/dealer/banks";
    }
    if (content.includes("repay")) {
      return "/dealer/repayments";
    }
    if (content.includes("drawdown") || content.includes("invoice") || content.includes("loan")) {
      return "/dealer/drawdowns";
    }
    return "/dealer";
  }

  return null;
}

export function NotificationBell() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading } = useAuthContext();
  const isPlatform = pathname.startsWith('/platform') || user?.role === 'PLATFORM_ADMIN';

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    if (authLoading || isPlatform) return;

    // Strict individual user inbox resolution:
    // Each user receives ONLY notifications delivered specifically to their authenticated email.
    let userEmail = user?.email?.trim().toLowerCase();
    if (!userEmail && user?.username && user.username.includes('@')) {
      userEmail = user.username.trim().toLowerCase();
    }

    // Role default fallback ONLY when running in offline/demo mode with no session email
    if (!userEmail) {
      if (pathname.startsWith('/bank')) userEmail = 'bank@dfp.com';
      else if (pathname.startsWith('/manufacturer')) userEmail = 'manufacturer@dfp.com';
      else if (pathname.startsWith('/dealer')) userEmail = 'dealer@dfp.com';
    }

    if (!userEmail) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    try {
      // Query ONLY this specific user's own email inbox
      const data = await notificationsService.list(userEmail).catch(() => []);
      if (Array.isArray(data)) {
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setNotifications(sorted.map(mapInAppToApp));
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, user?.username, authLoading, isPlatform, pathname]);



  useEffect(() => {
    if (!isPlatform) {
      loadNotifications();
    }
  }, [loadNotifications, isPlatform]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    const unreadItems = notifications.filter((n) => !n.read);
    if (unreadItems.length === 0) return;

    setIsMarkingAll(true);
    try {
      await Promise.all(
        unreadItems.map((n) => notificationsService.markRead(n.id).catch(() => {}))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setIsMarkingAll(false);
    }
  };

  const markSingleAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMarkingId(id);
    try {
      await notificationsService.markRead(id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } finally {
      setMarkingId(null);
    }
  };

  const handleNotificationClick = (item: AppNotification) => {
    if (!item.read) {
      markSingleAsRead(item.id);
    }
    const route = getNotificationRoute(item, pathname);
    if (route && route !== pathname) {
      setIsOpen(false);
      router.push(route);
    }
  };

  if (isPlatform) return null;

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          if (!isOpen) {
            loadNotifications();
          }
          setIsOpen(!isOpen);
        }}
        className="relative p-2.5 bg-white border border-slate-200/90 rounded-xl shadow-xs hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-[#F58220] text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover - Narrower, longer/taller, positioned along the far right corner */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[400px] md:w-[430px] max-w-[95vw] max-h-[660px] bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4.5 py-3.5 bg-gradient-to-r from-slate-50 to-blue-50/20 flex items-center justify-between gap-3 border-b border-slate-200/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-100 text-[#1F4DA8] flex items-center justify-center shrink-0">
                <Bell size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
                    Notifications
                  </h3>
                  {unreadCount > 0 ? (
                    <span className="bg-[#1F4DA8] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                      {unreadCount} New
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      All read
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={loadNotifications}
                disabled={isLoading}
                title="Refresh notifications"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className={isLoading ? "animate-spin text-[#1F4DA8]" : ""} />
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={isMarkingAll}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-[#1F4DA8] hover:bg-blue-800 rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCheck size={12} />
                  <span>{isMarkingAll ? "Marking…" : "Mark all read"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100 overscroll-contain flex-1">
            {isLoading && notifications.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 flex items-start gap-3 animate-pulse">
                  <div className="h-8 w-8 rounded-xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-100 rounded-full w-2/3" />
                    <div className="h-3 bg-slate-100 rounded-full w-full" />
                    <div className="h-2.5 bg-slate-100 rounded-full w-1/3" />
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="py-16 px-6 text-center space-y-2.5">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <BellOff size={22} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Notifications</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  You are all caught up! Real-time alerts, credit facility updates, and notices will appear here.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const isUnread = !item.read;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-4 flex items-start gap-3 transition-colors cursor-pointer group ${
                      isUnread
                        ? "bg-blue-50/60 hover:bg-blue-50/90 border-l-[4px] border-l-[#1F4DA8]"
                        : "bg-white hover:bg-slate-50/80"
                    }`}
                  >
                    {/* Status Icon */}
                    <div className="mt-0.5 shrink-0">
                      {item.type === "success" && (
                        <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                      {item.type === "warning" && (
                        <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/80 shadow-2xs">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                      {item.type === "info" && (
                        <div className="h-8 w-8 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center border border-blue-200/80 shadow-2xs">
                          <Info className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4
                            className={`text-xs sm:text-sm tracking-tight ${
                              isUnread
                                ? "font-black text-slate-900"
                                : "font-semibold text-slate-700"
                            }`}
                          >
                            {item.title}
                          </h4>
                          {isUnread && (
                            <span className="inline-flex items-center gap-0.5 bg-[#1F4DA8] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              <Sparkles size={8} />
                              New
                            </span>
                          )}
                        </div>

                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#1F4DA8] shrink-0 mt-1 shadow-2xs animate-pulse" />
                        )}
                      </div>

                      {/* Message Body — Bold when unread */}
                      <p
                        className={`text-xs leading-relaxed break-words ${
                          isUnread
                            ? "font-bold text-slate-800"
                            : "font-normal text-slate-600"
                        }`}
                      >
                        {item.message}
                      </p>

                      {/* Date & Time Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 font-mono">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Calendar size={11} className="text-slate-400" />
                            {item.date}
                          </span>
                          {item.time && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-1 text-slate-600">
                                <Clock size={11} className="text-slate-400" />
                                {item.time}
                              </span>
                            </>
                          )}
                          <span className="text-slate-400 font-sans font-medium text-[10px]">
                            ({item.relativeTime})
                          </span>
                        </div>

                        {/* Individual Mark as read button */}
                        {isUnread && (
                          <button
                            type="button"
                            onClick={(e) => markSingleAsRead(item.id, e)}
                            disabled={markingId === item.id}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1F4DA8] hover:text-blue-800 bg-white border border-blue-200 hover:bg-blue-50 px-2 py-0.5 rounded-lg transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                          >
                            <Check size={11} />
                            <span>{markingId === item.id ? "..." : "Mark read"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}