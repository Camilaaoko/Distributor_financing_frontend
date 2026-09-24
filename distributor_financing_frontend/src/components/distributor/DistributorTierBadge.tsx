'use client';

import React from 'react';
import { Sparkles, Award, Medal, Shield, ShieldCheck } from 'lucide-react';
import {
  type DistributorTier,
  getTierConfig,
  getTierFromCreditScore,
  getTierFromRepaymentRate,
} from '@/lib/tiers';
import { cn } from '@/lib/utils';

export interface DistributorTierBadgeProps {
  tier?: DistributorTier | string | null;
  creditScore?: number | null;
  repaymentRate?: number | null;
  showLabel?: boolean;
  showScore?: boolean;
  showRate?: boolean;
  showIcon?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Award,
  Medal,
  Shield,
  ShieldCheck,
};

export function DistributorTierBadge({
  tier: rawTier,
  creditScore,
  repaymentRate,
  showLabel = true,
  showScore = false,
  showRate = false,
  showIcon = true,
  size = 'sm',
  className,
}: DistributorTierBadgeProps) {
  // Derive tier from credit score first, then repayment rate
  let tier = rawTier;
  if (!tier && typeof creditScore === 'number') {
    tier = getTierFromCreditScore(creditScore);
  } else if (!tier && typeof repaymentRate === 'number') {
    tier = getTierFromRepaymentRate(repaymentRate);
  }

  const config = getTierConfig(tier);
  const IconComponent = ICON_MAP[config.icon] || Medal;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[9px] gap-1',
    sm: 'px-2.5 py-0.5 text-[10px] gap-1.5',
    md: 'px-3 py-1 text-xs gap-2',
    lg: 'px-4 py-1.5 text-sm gap-2.5 shadow-sm',
  }[size];

  const iconSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold rounded-full border transition-all shadow-2xs select-none',
        config.badge,
        sizeClasses,
        className
      )}
      title={`${config.label} Tier: ${config.repaymentRequirement}`}
    >
      {showIcon && IconComponent && <IconComponent size={iconSizes} className="shrink-0" />}
      {showLabel && <span>{config.label} Tier</span>}
      {showRate && typeof repaymentRate === 'number' && (
        <span className="font-mono text-[9px] opacity-80 border-l border-current/20 pl-1">
          {repaymentRate}% on-time
        </span>
      )}
      {showScore && typeof creditScore === 'number' && creditScore > 0 && (
        <span className="font-mono text-[9px] opacity-75">
          ({creditScore})
        </span>
      )}
    </span>
  );
}

