'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, RefreshCw } from 'lucide-react';

interface ManufacturerHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actionButton?: React.ReactNode;
}

export function ManufacturerHeader({ title, subtitle, badge, actionButton }: ManufacturerHeaderProps) {
  const [dateRange] = useState('30 Jul 2026 - 30 Jul 2026');
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setDateMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#1F4DA8] border border-blue-200">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actionButton}

        <Link
          href="/manufacturer/checker"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl border border-indigo-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
          <span>Checker View</span>
        </Link>

        <div className="relative" ref={dateRef}>
          <button
            onClick={() => setDateMenuOpen(!dateMenuOpen)}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3.5 py-2 shadow-2xs flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateRange}</span>
          </button>
          {dateMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-3 z-50">
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2 px-2">
                Date Range
              </p>
              <div className="space-y-1">
                {['Custom Range', 'Last 7 Days', 'Last 30 Days', 'This Year'].map((label) => (
                  <button
                    key={label}
                    onClick={() => setDateMenuOpen(false)}
                    className="w-full text-left text-xs font-medium text-[#1E293B] hover:bg-[#F7F9FC] rounded-lg px-3 py-2 transition-colors cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
