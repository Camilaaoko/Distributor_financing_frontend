'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Calendar, CalendarDays } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface TopbarProps {
  title: string;
  welcomeName?: string;
  subtitle?: string;
  breadcrumb?: { parent?: string; current: string };
  tenantName?: string;
  notificationCount?: number;
  avatarLetter?: string;
  dateRangeLabel?: string;
  showTagline?: boolean;
  actions?: React.ReactNode;
}

export function Topbar({
  title,
  welcomeName,
  subtitle = "Here's what's happening across your distributor financing ecosystem.",
  breadcrumb,
  dateRangeLabel = '11/09/2026',
  showTagline = true,
  actions,
}: TopbarProps) {
  const pathname = usePathname();
  const { user: authUser } = useAuth();
  const userDisplayName = authUser?.username || welcomeName;
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [asOfDate, setAsOfDate] = useState(() => new Date().toISOString().split('T')[0]);
  const dateRef = useRef<HTMLDivElement>(null);

  // Auto-generate breadcrumb if not explicitly provided
  const activeBreadcrumb = breadcrumb || (() => {
    const parts = pathname.split('/').filter(Boolean);
    if (!parts.length) return { parent: 'Home', current: 'Dashboard' };
    const parentRaw = parts[0] || 'Platform';
    const parent = parentRaw.charAt(0).toUpperCase() + parentRaw.slice(1);
    const currentRaw = parts[1] || 'Dashboard';
    const current = currentRaw.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return { parent, current };
  })();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setDateMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="px-6 lg:px-8 py-5 border-b border-slate-200/80 mb-6">
      {/* Breadcrumb */}
      <div className="text-xs text-[#6B7E9C] flex items-center gap-1.5 mb-2 font-medium">
        <span>{activeBreadcrumb.parent}</span>
        <span className="text-slate-400">/</span>
        <strong className="text-[#30486B] font-semibold">{activeBreadcrumb.current}</strong>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title, Greeting & Subtitle */}
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black text-[#102647] tracking-tight">{title}</h1>
          {userDisplayName && (
            <p className="text-sm font-semibold text-[#526480]">
              Welcome back, {userDisplayName}
            </p>
          )}
          {subtitle && (
            <p className="text-xs text-[#7283A0]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Section: Actions, Date Picker & Tagline */}
        <div className="flex flex-col items-start md:items-end gap-2.5">
          <div className="flex items-center gap-3">
            {actions}

            {/* Date Control */}
            <div ref={dateRef} className="relative">
              <label className="flex items-center gap-2 bg-white border border-[#E3E9F2] rounded-xl px-3 py-1.5 shadow-2xs text-xs font-semibold text-[#526A8C] cursor-pointer hover:bg-slate-50 transition-colors">
                <CalendarDays size={16} className="text-[#526A8C]" />
                <input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => {
                    if (e.target.value) setAsOfDate(e.target.value);
                  }}
                  className="bg-transparent border-none outline-none text-xs text-[#526A8C] font-semibold cursor-pointer w-[115px]"
                  aria-label="Filter date"
                />
              </label>
            </div>
          </div>

          {/* Africa Map Tagline */}
          {showTagline && (
            <div className="hidden md:flex items-center gap-2.5 text-right self-end select-none">
              <span className="text-[11px] font-bold text-[#005CBD] border-r-2 border-[#FF861A] pr-2.5 leading-snug">
                Enabling Growth<br />Through Trusted Partnerships
              </span>
              <svg className="w-10 h-12 text-[#CFDEF7] fill-current shrink-0" viewBox="0 0 100 120" aria-hidden="true" focusable="false">
                <path d="M39 5 47 7 51 5 57 9 65 9 69 15 72 25 78 34 85 40 94 38 89 48 81 57 76 62 77 71 72 79 70 89 65 95 62 105 56 114 49 115 45 107 42 98 39 92 38 83 33 75 34 66 29 60 30 53 23 50 18 53 10 50 5 42 4 34 8 24 15 18 20 10 29 8 34 4Z" />
                <path d="m87 81 3 4-2 10-4 8-3-2 1-9Z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
