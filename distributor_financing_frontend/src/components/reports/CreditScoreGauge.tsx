'use client';

import React from 'react';
import type { CrbRiskBracket } from '@/types/reports';

interface CreditScoreGaugeProps {
  score: number; // 300 to 850
  bureauName?: string;
  scoreDate?: string;
  riskBracket?: CrbRiskBracket;
  className?: string;
}

export function CreditScoreGauge({
  score,
  bureauName = 'Metropol CRB',
  scoreDate,
  riskBracket,
  className = '',
}: CreditScoreGaugeProps) {
  // Normalize score between 300 and 850
  const minScore = 300;
  const maxScore = 850;
  const clamped = Math.max(minScore, Math.min(maxScore, score));
  const fraction = (clamped - minScore) / (maxScore - minScore); // 0 to 1

  // Semi-circle angle from -180 to 0 degrees (or -90 to +90)
  // Let's use SVG arc with radius 80
  const radius = 75;
  const strokeWidth = 14;
  const cx = 100;
  const cy = 95;

  // Compute needle angle from -180 deg (left) to 0 deg (right)
  const angleDeg = -180 + fraction * 180;
  const angleRad = (angleDeg * Math.PI) / 180;

  // Needle tip
  const needleLength = 52;
  const needleX = cx + needleLength * Math.cos(angleRad);
  const needleY = cy + needleLength * Math.sin(angleRad);

  // Risk bracket derived if not passed
  let bracket = riskBracket;
  let bracketColor = '#10B981';
  let bracketBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (score >= 700) {
    bracket = bracket || 'LOW';
    bracketColor = '#10B981';
    bracketBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (score >= 600) {
    bracket = bracket || 'MEDIUM';
    bracketColor = '#F59E0B';
    bracketBg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (score >= 500) {
    bracket = bracket || 'HIGH';
    bracketColor = '#F97316';
    bracketBg = 'bg-orange-50 text-orange-700 border-orange-200';
  } else {
    bracket = bracket || 'CRITICAL';
    bracketColor = '#EF4444';
    bracketBg = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <div className={`flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs ${className}`}>
      <div className="text-center mb-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{bureauName} Score</span>
      </div>

      <div className="relative w-52 h-28 flex items-center justify-center">
        <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="crbGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="35%" stopColor="#F97316" />
              <stop offset="65%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Background Arc */}
          <path
            d="M 25 95 A 75 75 0 0 1 175 95"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Colored Meter Arc */}
          <path
            d="M 25 95 A 75 75 0 0 1 175 95"
            fill="none"
            stroke="url(#crbGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Pivot center */}
          <circle cx={cx} cy={cy} r="6" fill="#1E293B" />

          {/* Needle pointer */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Numeric Score in Center */}
        <div className="absolute bottom-0 text-center flex flex-col items-center">
          <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">{score}</span>
          <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Scale: 300 – 850</span>
        </div>
      </div>

      {/* Risk Bracket Pill */}
      <div className="mt-4 flex flex-col items-center gap-1.5">
        <span className={`px-3 py-1 text-xs font-bold rounded-full border shadow-2xs ${bracketBg}`}>
          {bracket} RISK ({score >= 700 ? 'Tier 1' : score >= 600 ? 'Tier 2' : score >= 500 ? 'Tier 3' : 'Tier 4'})
        </span>
        {scoreDate && (
          <span className="text-[10px] text-slate-400 font-medium">
            Bureau Pulled: {scoreDate}
          </span>
        )}
      </div>
    </div>
  );
}
