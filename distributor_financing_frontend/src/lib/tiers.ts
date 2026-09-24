/**
 * Distributor Tier Engine
 * Aligned with backend implementation in LoanRequestServiceImpl.java:349-356:
 * - PLATINUM: credit score >= 800
 * - GOLD: credit score >= 650
 * - SILVER: credit score < 650
 * - STANDARD: no credit score available (null / undefined / not evaluated)
 *
 * Source: DistributorLoanProfile entity (profile.getCreditScore())
 */

export type DistributorTier =
  | 'PLATINUM'
  | 'GOLD'
  | 'SILVER'
  | 'STANDARD'
  | 'Platinum'
  | 'Gold'
  | 'Silver'
  | 'Standard';

export type CanonicalTier = 'Platinum' | 'Gold' | 'Silver' | 'Standard';

export interface TierConfig {
  name: CanonicalTier;
  code: 'PLATINUM' | 'GOLD' | 'SILVER' | 'STANDARD';
  label: string;
  level: number; // 1 = Standard, 2 = Silver, 3 = Gold, 4 = Platinum
  badge: string;
  cardGradient: string;
  borderHighlight: string;
  color: string;
  accentColor: string;
  icon: 'Sparkles' | 'Award' | 'Medal' | 'Shield';
  description: string;
  scoreRequirement: string;
  repaymentRequirement: string;
  minScore: number | null;
  maxCreditLimit: string;
  advanceRate: string;
  interestRateDiscount: string;
  disbursalSLA: string;
  perks: string[];
  upgradeCriteria: string;
}

export const TIER_CONFIG: Record<CanonicalTier, TierConfig> = {
  Platinum: {
    name: 'Platinum',
    code: 'PLATINUM',
    label: 'Platinum',
    level: 4,
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/20',
    cardGradient: 'from-slate-900 via-indigo-950 to-slate-900 text-white',
    borderHighlight: 'border-indigo-400/40 shadow-indigo-500/10',
    color: 'text-indigo-600',
    accentColor: '#6366F1',
    icon: 'Sparkles',
    description: 'Premier tier for distributors with exceptional credit profile (Credit Score ≥ 800).',
    scoreRequirement: 'Credit Score ≥ 800',
    repaymentRequirement: 'Credit Score ≥ 800 (95%+ on-time)',
    minScore: 800,
    maxCreditLimit: 'KES 50,000,000+',
    advanceRate: '90%',
    interestRateDiscount: '12.0% p.a. (Preferred VIP Rate)',
    disbursalSLA: 'Instant Automated Disbursal',
    perks: [
      'Maximum revolving headroom (KES 50M+)',
      '90% Invoice advance financing coverage',
      'Preferred 12.0% p.a. interest rate',
      'Instant automated loan disbursement',
      'Dedicated partner bank underwriting desk',
    ],
    upgradeCriteria: 'Maintain Credit Score ≥ 800 through consistent on-time facility settlements.',
  },
  Gold: {
    name: 'Gold',
    code: 'GOLD',
    label: 'Gold',
    level: 3,
    badge: 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-500/20',
    cardGradient: 'from-amber-950/90 via-slate-900 to-amber-950/80 text-white',
    borderHighlight: 'border-amber-400/40 shadow-amber-500/10',
    color: 'text-amber-600',
    accentColor: '#F59E0B',
    icon: 'Award',
    description: 'High-performing tier for distributors with strong credit score (Credit Score 650–799).',
    scoreRequirement: 'Credit Score 650 – 799',
    repaymentRequirement: 'Credit Score 650 – 799 (80%–94% on-time)',
    minScore: 650,
    maxCreditLimit: 'KES 30,000,000',
    advanceRate: '80%',
    interestRateDiscount: '13.5% p.a. (Standard Competitive Rate)',
    disbursalSLA: '2-Hour Express Disbursal',
    perks: [
      'Substantial credit ceiling up to KES 30M',
      '80% Invoice advance financing coverage',
      'Competitive 13.5% p.a. interest rate',
      '2-Hour fast-track disbursement review',
      'Flexible repayment tenor up to 90 days',
    ],
    upgradeCriteria: 'Achieve Credit Score ≥ 800 to unlock Platinum Tier.',
  },
  Silver: {
    name: 'Silver',
    code: 'SILVER',
    label: 'Silver',
    level: 2,
    badge: 'bg-slate-100 text-slate-700 border-slate-300 ring-1 ring-slate-400/20',
    cardGradient: 'from-slate-800 via-slate-900 to-slate-800 text-white',
    borderHighlight: 'border-slate-400/40 shadow-slate-500/10',
    color: 'text-slate-600',
    accentColor: '#94A3B8',
    icon: 'Medal',
    description: 'Assessed tier for distributors with credit score evaluated under 650 (Credit Score < 650).',
    scoreRequirement: 'Credit Score < 650',
    repaymentRequirement: 'Credit Score < 650 (<80% on-time)',
    minScore: 300,
    maxCreditLimit: 'KES 10,000,000',
    advanceRate: '70%',
    interestRateDiscount: '15.0% p.a. (Base Rate)',
    disbursalSLA: '24-Hour Standard Review',
    perks: [
      'Initial working capital line up to KES 10M',
      '70% Invoice advance financing coverage',
      'Standard 15.0% p.a. base interest rate',
      '24-Hour loan review SLA',
      'Rapid tier upgrade path with timely repayments',
    ],
    upgradeCriteria: 'Achieve Credit Score ≥ 650 to upgrade to Gold Tier.',
  },
  Standard: {
    name: 'Standard',
    code: 'STANDARD',
    label: 'Standard',
    level: 1,
    badge: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-400/20',
    cardGradient: 'from-slate-800 via-slate-900 to-slate-800 text-white',
    borderHighlight: 'border-blue-400/40 shadow-blue-500/10',
    color: 'text-blue-600',
    accentColor: '#3B82F6',
    icon: 'Shield',
    description: 'Baseline onboarding tier for accounts pending credit score evaluation or scoring refresh.',
    scoreRequirement: 'No Credit Score Available',
    repaymentRequirement: 'No Credit Score Available',
    minScore: null,
    maxCreditLimit: 'KES 5,000,000',
    advanceRate: '60%',
    interestRateDiscount: '16.0% p.a. (Onboarding Baseline)',
    disbursalSLA: '48-Hour Underwriting Review',
    perks: [
      'Starter onboarding credit facility up to KES 5M',
      '60% Invoice advance financing coverage',
      'Standard onboarding review SLA',
      'Underwriting score generated after first repayment cycle',
    ],
    upgradeCriteria: 'Undergo bank credit assessment to assign Silver, Gold, or Platinum tier.',
  },
};

/**
 * Normalizes any tier string into canonical form: 'Platinum' | 'Gold' | 'Silver' | 'Standard'
 */
export function normalizeTier(tier?: string | null): CanonicalTier {
  if (!tier) return 'Standard';
  const upper = String(tier).trim().toUpperCase();
  if (upper === 'PLATINUM') return 'Platinum';
  if (upper === 'GOLD') return 'Gold';
  if (upper === 'SILVER') return 'Silver';
  if (upper === 'STANDARD') return 'Standard';
  return 'Standard';
}

/**
 * Determines distributor tier strictly from Credit Score as implemented in LoanRequestServiceImpl.java:349-356:
 * - PLATINUM: credit score >= 800
 * - GOLD: credit score >= 650
 * - SILVER: credit score < 650
 * - STANDARD: no credit score available (null / undefined / <= 0)
 *
 * Sourced from DistributorLoanProfile entity (profile.getCreditScore()).
 */
export function getTierFromCreditScore(creditScore?: number | null): 'PLATINUM' | 'GOLD' | 'SILVER' | 'STANDARD' {
  if (creditScore === undefined || creditScore === null || isNaN(creditScore) || creditScore <= 0) {
    return 'STANDARD';
  }
  if (creditScore >= 800) {
    return 'PLATINUM';
  }
  if (creditScore >= 650) {
    return 'GOLD';
  }
  return 'SILVER';
}

/**
 * Derives canonical distributor tier from credit score (or optional repayment rate fallback).
 */
export function getDistributorTier(creditScore?: number | null, onTimeRate?: number | null): CanonicalTier {
  if (typeof creditScore === 'number' && creditScore > 0) {
    const raw = getTierFromCreditScore(creditScore);
    return normalizeTier(raw);
  }
  if (typeof onTimeRate === 'number' && onTimeRate > 0) {
    if (onTimeRate >= 95) return 'Platinum';
    if (onTimeRate >= 80) return 'Gold';
    return 'Silver';
  }
  return 'Standard';
}

/**
 * Backward-compatible helper for repayment rates.
 */
export function getTierFromRepaymentRate(onTimeRate?: number | null): CanonicalTier {
  if (typeof onTimeRate !== 'number' || isNaN(onTimeRate)) return 'Standard';
  if (onTimeRate >= 95) return 'Platinum';
  if (onTimeRate >= 80) return 'Gold';
  if (onTimeRate > 0) return 'Silver';
  return 'Standard';
}

/**
 * Returns configuration details for a given tier.
 */
export function getTierConfig(tier?: DistributorTier | string | null): TierConfig {
  const normalized = normalizeTier(tier);
  return TIER_CONFIG[normalized] || TIER_CONFIG.Standard;
}

/**
 * Returns all tiers in ascending level order (Standard, Silver, Gold, Platinum).
 */
export function getAllTiers(): TierConfig[] {
  return [TIER_CONFIG.Standard, TIER_CONFIG.Silver, TIER_CONFIG.Gold, TIER_CONFIG.Platinum];
}

/**
 * Returns the three rated tiers (Silver, Gold, Platinum).
 */
export function getRatedTiers(): TierConfig[] {
  return [TIER_CONFIG.Silver, TIER_CONFIG.Gold, TIER_CONFIG.Platinum];
}

/**
 * Calculates progress towards the next tier level based on credit score.
 */
export function calculateTierProgress(
  currentTier: DistributorTier | string,
  creditScore?: number | null
): {
  progressPercent: number;
  nextTier: CanonicalTier | null;
  scoreNeeded: number;
  requirementText: string;
} {
  const norm = normalizeTier(currentTier);
  const score = typeof creditScore === 'number' && creditScore > 0 ? creditScore : 0;

  if (norm === 'Platinum') {
    return {
      progressPercent: 100,
      nextTier: null,
      scoreNeeded: 0,
      requirementText: 'Top tier achieved! Maintain Credit Score ≥ 800 to retain VIP Platinum perks.',
    };
  }

  if (norm === 'Gold') {
    // Score 650 to 800 -> 150 point bracket
    const effective = Math.max(650, Math.min(800, score || 650));
    const progress = Math.min(100, Math.max(0, Math.round(((effective - 650) / (800 - 650)) * 100)));
    const needed = Math.max(0, 800 - effective);
    return {
      progressPercent: progress,
      nextTier: 'Platinum',
      scoreNeeded: needed,
      requirementText: `Achieve Credit Score ≥ 800 (${needed > 0 ? `${needed} more points needed` : 'at threshold'}) to unlock Platinum Tier.`,
    };
  }

  if (norm === 'Silver') {
    // Score up to 650 -> target 650 for Gold
    const effective = Math.max(300, Math.min(650, score || 450));
    const progress = Math.min(100, Math.max(0, Math.round(((effective - 300) / (650 - 300)) * 100)));
    const needed = Math.max(0, 650 - effective);
    return {
      progressPercent: progress,
      nextTier: 'Gold',
      scoreNeeded: needed,
      requirementText: `Achieve Credit Score ≥ 650 (${needed > 0 ? `${needed} more points needed` : 'at threshold'}) to upgrade to Gold Tier.`,
    };
  }

  // Standard -> Silver / Gold
  return {
    progressPercent: 0,
    nextTier: 'Silver',
    scoreNeeded: 300,
    requirementText: 'Complete initial loan cycles to receive underwriting credit score and unlock Silver/Gold tier.',
  };
}

export function getTierDescription(tier: DistributorTier | string): string {
  return getTierConfig(tier).description;
}
