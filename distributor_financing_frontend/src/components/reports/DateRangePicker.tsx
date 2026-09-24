'use client';

import React from 'react';
import { Calendar, RotateCcw } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  className = '',
}: DateRangePickerProps) {
  const applyPreset = (preset: '30d' | '90d' | 'year' | 'all') => {
    const today = new Date();
    const endStr = today.toISOString().split('T')[0];

    if (preset === '30d') {
      const past = new Date(today);
      past.setDate(past.getDate() - 30);
      onChange(past.toISOString().split('T')[0], endStr);
    } else if (preset === '90d') {
      const past = new Date(today);
      past.setDate(past.getDate() - 90);
      onChange(past.toISOString().split('T')[0], endStr);
    } else if (preset === 'year') {
      const startOfYear = `${today.getFullYear()}-01-01`;
      onChange(startOfYear, endStr);
    } else if (preset === 'all') {
      onChange('', '');
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {/* Preset buttons */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
        <button
          type="button"
          onClick={() => applyPreset('30d')}
          className="px-2.5 py-1.5 rounded-lg font-medium text-slate-700 hover:bg-white hover:text-blue-900 transition-colors cursor-pointer"
        >
          Last 30 Days
        </button>
        <button
          type="button"
          onClick={() => applyPreset('90d')}
          className="px-2.5 py-1.5 rounded-lg font-medium text-slate-700 hover:bg-white hover:text-blue-900 transition-colors cursor-pointer"
        >
          Last 90 Days
        </button>
        <button
          type="button"
          onClick={() => applyPreset('year')}
          className="px-2.5 py-1.5 rounded-lg font-medium text-slate-700 hover:bg-white hover:text-blue-900 transition-colors cursor-pointer"
        >
          This Year
        </button>
        <button
          type="button"
          onClick={() => applyPreset('all')}
          className="px-2.5 py-1.5 rounded-lg font-medium text-slate-500 hover:bg-white hover:text-slate-800 transition-colors cursor-pointer"
        >
          All Time
        </button>
      </div>

      {/* Date Pickers */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
          <Calendar size={14} className="text-slate-400 shrink-0" />
          <span className="text-[11px] font-semibold text-slate-400">From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChange(e.target.value, endDate)}
            className="bg-transparent text-slate-800 font-medium focus:outline-hidden cursor-pointer"
          />
        </div>
        <span className="text-slate-400 font-medium">to</span>
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
          <Calendar size={14} className="text-slate-400 shrink-0" />
          <span className="text-[11px] font-semibold text-slate-400">To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onChange(startDate, e.target.value)}
            className="bg-transparent text-slate-800 font-medium focus:outline-hidden cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
