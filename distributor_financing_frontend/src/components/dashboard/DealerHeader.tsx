"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ChevronDown, User, LogOut, RefreshCw } from "lucide-react";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { DistributorTierBadge } from "@/components/distributor/DistributorTierBadge";
import type { DistributorTier } from "@/lib/tiers";

interface DealerHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  tier?: DistributorTier;
}

export function DealerHeader({ title, subtitle, badge, tier }: DealerHeaderProps) {
  const [dateRange] = useState("Last 30 Days");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    if (auth?.logout) {
      auth.logout();
    }
    router.push("/login");
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Date Filter */}
        <div className="relative">
          <button className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 pr-8 shadow-xs flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateRange}</span>
          </button>
        </div>

        {/* Dynamic Route-Aware Notification Bell */}
        <NotificationBell />

        {/* User Profile Dropdown */}
        <div className="relative pl-2 border-l border-slate-200" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {(auth?.user?.username ? auth.user.username.slice(0, 2) : (auth?.user?.email ? auth.user.email.slice(0, 2) : 'DU')).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-800">{auth?.user?.username || 'Distributor User'}</div>
              <div className="mt-0.5">
                <DistributorTierBadge tier={tier || 'Gold'} size="xs" />
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 text-xs divide-y divide-slate-100">
              <div className="px-3.5 py-2">
                <p className="font-semibold text-slate-900">{auth?.user?.username || 'Distributor User'}</p>
                {auth?.user?.email && <p className="text-[11px] text-slate-500 truncate">{auth.user.email}</p>}
              </div>


              <div className="py-1">
                <Link
                  href="/dealer/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-700 font-medium"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  View Profile
                </Link>

                <Link
                  href="/dealer/roles"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <RefreshCw className="w-4 h-4 text-[#1F4DA8]" />
                  Roles &amp; Permissions
                </Link>
                <Link
                  href="/dealer/users"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Staff Accounts
                </Link>
              </div>


              <div className="py-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}