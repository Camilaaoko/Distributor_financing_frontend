'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, AlertCircle } from 'lucide-react';
import type { RiskThresholdLevel, CovenantStatus, CrbRiskBracket } from '@/types/reports';

interface RiskThresholdBadgeProps {
  level: 'GREEN' | 'YELLOW' | 'RED' | RiskThresholdLevel | CovenantStatus | CrbRiskBracket | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskThresholdBadge({ level, label, size = 'md' }: RiskThresholdBadgeProps) {
  const norm = String(level).toUpperCase();

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = AlertCircle;

  if (norm === 'GREEN' || norm === 'LOW' || norm === 'PASSED' || norm === 'NORMAL' || norm === 'APPROVED' || norm === 'COMPLIANT') {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    Icon = CheckCircle2;
  } else if (
    norm === 'YELLOW' ||
    norm === 'MEDIUM' ||
    norm === 'WARNING' ||
    norm === 'WATCH' ||
    norm === 'CONDITIONAL' ||
    norm === 'TIER_2_MODERATE_RISK'
  ) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = AlertTriangle;
  } else if (
    norm === 'RED' ||
    norm === 'HIGH' ||
    norm === 'CRITICAL' ||
    norm === 'FAILED' ||
    norm === 'SUBSTANDARD' ||
    norm === 'DOUBTFUL' ||
    norm === 'LOSS' ||
    norm === 'REJECTED' ||
    norm === 'EXCEEDS_LIMIT'
  ) {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = XCircle;
  } else if (norm === 'REFERRED') {
    bg = 'bg-purple-50 text-purple-700 border-purple-200';
    Icon = AlertCircle;
  }

  const displayLabel = label || norm.replace(/_/g, ' ');

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-2xs ${bg} ${sizeClasses}`}
    >
      <Icon size={iconSizes} className="shrink-0" />
      <span>{displayLabel}</span>
    </span>
  );
}
