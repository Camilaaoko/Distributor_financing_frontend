'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X, Check, Clock } from 'lucide-react';

export interface DateRange {
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  preset: string; // 'ALL' | 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'CUSTOM'
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

function formatDateDisplay(iso: string): string {
  if (!iso) return '';
  try {
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    const date = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  } catch {
    return iso;
  }
}

function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DateRangePicker({ value, onChange, className = '' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(value.startDate);
  const [tempEnd, setTempEnd] = useState(value.endDate);
  const [tempPreset, setTempPreset] = useState(value.preset);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempStart(value.startDate);
    setTempEnd(value.endDate);
    setTempPreset(value.preset);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleApplyPreset = (presetKey: string) => {
    const now = new Date();
    let start = '';
    let end = '';

    if (presetKey === 'TODAY') {
      start = toIsoDate(now);
      end = toIsoDate(now);
    } else if (presetKey === 'YESTERDAY') {
      const y = new Date();
      y.setDate(now.getDate() - 1);
      start = toIsoDate(y);
      end = toIsoDate(y);
    } else if (presetKey === 'LAST_7_DAYS') {
      const s = new Date();
      s.setDate(now.getDate() - 6);
      start = toIsoDate(s);
      end = toIsoDate(now);
    } else if (presetKey === 'LAST_30_DAYS') {
      const s = new Date();
      s.setDate(now.getDate() - 29);
      start = toIsoDate(s);
      end = toIsoDate(now);
    } else if (presetKey === 'THIS_MONTH') {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      start = toIsoDate(s);
      end = toIsoDate(now);
    } else if (presetKey === 'ALL') {
      start = '';
      end = '';
    }

    setTempPreset(presetKey);
    setTempStart(start);
    setTempEnd(end);

    if (presetKey !== 'CUSTOM') {
      onChange({ startDate: start, endDate: end, preset: presetKey });
      setIsOpen(false);
    }
  };

  const handleApplyCustom = () => {
    onChange({
      startDate: tempStart,
      endDate: tempEnd,
      preset: tempStart || tempEnd ? 'CUSTOM' : 'ALL',
    });
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempStart('');
    setTempEnd('');
    setTempPreset('ALL');
    onChange({ startDate: '', endDate: '', preset: 'ALL' });
    setIsOpen(false);
  };

  // Determine button text
  let labelText = 'All Dates';
  if (value.preset === 'TODAY') labelText = 'Today';
  else if (value.preset === 'YESTERDAY') labelText = 'Yesterday';
  else if (value.preset === 'LAST_7_DAYS') labelText = 'Last 7 Days';
  else if (value.preset === 'LAST_30_DAYS') labelText = 'Last 30 Days';
  else if (value.preset === 'THIS_MONTH') labelText = 'This Month';
  else if (value.startDate && value.endDate) {
    labelText = `${formatDateDisplay(value.startDate)} – ${formatDateDisplay(value.endDate)}`;
  } else if (value.startDate) {
    labelText = `From ${formatDateDisplay(value.startDate)}`;
  } else if (value.endDate) {
    labelText = `Until ${formatDateDisplay(value.endDate)}`;
  }

  const isFiltered = value.preset !== 'ALL' || Boolean(value.startDate) || Boolean(value.endDate);

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
          isFiltered
            ? 'bg-blue-50/80 border-[#1F4DA8]/40 text-[#1F4DA8] hover:bg-blue-100/80'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        <Calendar size={14} className={isFiltered ? 'text-[#1F4DA8]' : 'text-slate-400'} />
        <span className="truncate max-w-[200px]">{labelText}</span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-4 space-y-4 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Calendar size={14} className="text-[#1F4DA8]" />
              <span>Select Date Period</span>
            </div>
            {isFiltered && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
              >
                Clear Filter
              </button>
            )}
          </div>

          {/* Preset Buttons */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Presets</p>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { key: 'ALL', label: 'All Time' },
                { key: 'TODAY', label: 'Today' },
                { key: 'YESTERDAY', label: 'Yesterday' },
                { key: 'LAST_7_DAYS', label: 'Last 7 Days' },
                { key: 'LAST_30_DAYS', label: 'Last 30 Days' },
                { key: 'THIS_MONTH', label: 'This Month' },
              ].map((p) => {
                const isSelected = tempPreset === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handleApplyPreset(p.key)}
                    className={`text-xs font-semibold py-1.5 px-2 rounded-lg border transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-[#1F4DA8] text-white border-[#1F4DA8] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          <div className="border-t border-slate-100 pt-3 space-y-2.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Custom Date Range</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => {
                    setTempStart(e.target.value);
                    setTempPreset('CUSTOM');
                  }}
                  className="w-full text-xs font-medium px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8] text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => {
                    setTempEnd(e.target.value);
                    setTempPreset('CUSTOM');
                  }}
                  className="w-full text-xs font-medium px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8] text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCustom}
              className="text-xs font-bold px-4 py-1.5 rounded-xl bg-[#1F4DA8] text-white hover:bg-[#3A6FD8] shadow-xs transition-colors cursor-pointer"
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

