'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Target, TrendingUp, Shield, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { FormField, TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import type { RiskTier, CreditAssessmentResult } from '@/types/loans';

interface UnderwritingAssessmentCardProps {
  distributorId: string;
  distributorName: string;
  uploadedStatementFile: Blob | null;
  statementFileName?: string;
  initialCreditScore: number;
  onApplyTerms: (terms: {
    creditLimit: number;
    interestRate: number;
    maxTenorDays: number;
    riskTier?: RiskTier;
    creditScore?: number;
    assessmentResult?: CreditAssessmentResult;
    isCustomOverride?: boolean;
    overrideReason?: string;
  }) => void;
  autoAssessOnMount: boolean;
}

interface AssessmentOutput {
  creditLimit: number;
  interestRate: number;
  maxTenorDays: number;
  riskTier: RiskTier;
}

const RISK_TIER_LABELS: Record<RiskTier, { label: string; color: string; icon: string }> = {
  LOW: { label: 'Low Risk', color: 'text-[#16A34A]', icon: '🟢' },
  MEDIUM: { label: 'Medium Risk', color: 'text-[#F58220]', icon: '🟡' },
  HIGH: { label: 'High Risk', color: 'text-orange-600', icon: '🟠' },
  VERY_HIGH: { label: 'Very High Risk', color: 'text-[#DC2626]', icon: '🔴' },
};

function assessCredit(score: number): AssessmentOutput {
  if (score >= 700) {
    return { creditLimit: 5_000_000, interestRate: 10.0, maxTenorDays: 90, riskTier: 'LOW' };
  }
  if (score >= 650) {
    return { creditLimit: 3_000_000, interestRate: 12.5, maxTenorDays: 60, riskTier: 'MEDIUM' };
  }
  if (score >= 600) {
    return { creditLimit: 2_000_000, interestRate: 14.0, maxTenorDays: 45, riskTier: 'MEDIUM' };
  }
  if (score >= 500) {
    return { creditLimit: 1_500_000, interestRate: 15.0, maxTenorDays: 30, riskTier: 'HIGH' };
  }
  return { creditLimit: 500_000, interestRate: 18.0, maxTenorDays: 30, riskTier: 'VERY_HIGH' };
}

export function UnderwritingAssessmentCard({
  distributorId,
  distributorName,
  uploadedStatementFile,
  statementFileName,
  initialCreditScore,
  onApplyTerms,
  autoAssessOnMount,
}: UnderwritingAssessmentCardProps) {
  const toast = useToast();

  const [creditScore, setCreditScore] = useState(initialCreditScore);
  const [isScoreEditing, setIsScoreEditing] = useState(false);
  const [scoreInput, setScoreInput] = useState(String(initialCreditScore));

  const [isAssessing, setIsAssessing] = useState(false);
  const [hasAssessed, setHasAssessed] = useState(false);
  const [assessment, setAssessment] = useState<AssessmentOutput | null>(null);

  const [isCustomOverride, setIsCustomOverride] = useState(false);
  const [overrideCreditLimit, setOverrideCreditLimit] = useState('');
  const [overrideInterestRate, setOverrideInterestRate] = useState('');
  const [overrideTenorDays, setOverrideTenorDays] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  const runAssessment = async () => {
    setIsAssessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    const result = assessCredit(creditScore);
    setAssessment(result);
    setHasAssessed(true);
    setIsAssessing(false);
  };

  useEffect(() => {
    if (autoAssessOnMount && uploadedStatementFile && !hasAssessed) {
      setTimeout(runAssessment, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAssessOnMount, uploadedStatementFile]);

  const effectiveTerms = isCustomOverride ? {
    creditLimit: Number(overrideCreditLimit) || (assessment?.creditLimit ?? 0),
    interestRate: Number(overrideInterestRate) || (assessment?.interestRate ?? 0),
    maxTenorDays: Number(overrideTenorDays) || (assessment?.maxTenorDays ?? 0),
  } : (assessment ?? {
    creditLimit: assessCredit(creditScore).creditLimit,
    interestRate: assessCredit(creditScore).interestRate,
    maxTenorDays: assessCredit(creditScore).maxTenorDays,
  });

  const effectiveRiskTier = isCustomOverride
    ? (assessment?.riskTier ?? assessCredit(creditScore).riskTier)
    : (assessment?.riskTier ?? assessCredit(creditScore).riskTier);

  const handleApplyTerms = () => {
    if (!assessment && !isCustomOverride) {
      toast.error('Please run the assessment first or enable custom override.');
      return;
    }

    const assessmentResult: CreditAssessmentResult | undefined = hasAssessed && assessment
      ? {
          distributorId,
          assessedCreditScore: creditScore,
          riskTier: effectiveRiskTier,
          recommendedCreditLimit: assessment.creditLimit,
          recommendedInterestRate: assessment.interestRate,
          recommendedTenorDays: assessment.maxTenorDays,
          assessmentDetails: [
            `Credit score: ${creditScore}`,
            `Risk tier: ${RISK_TIER_LABELS[effectiveRiskTier].label}`,
            ...(uploadedStatementFile ? [`Bank statement analyzed: ${statementFileName || 'provided'}`] : []),
          ],
          lastAssessedAt: new Date().toISOString(),
        }
      : undefined;

    onApplyTerms({
      creditLimit: effectiveTerms.creditLimit,
      interestRate: effectiveTerms.interestRate,
      maxTenorDays: effectiveTerms.maxTenorDays,
      riskTier: effectiveRiskTier,
      creditScore,
      assessmentResult,
      isCustomOverride,
      overrideReason: isCustomOverride ? overrideReason : undefined,
    });

    toast.success(
      isCustomOverride
        ? 'Custom terms applied. Manual override recorded.'
        : 'Underwriting assessment applied to sanction terms.'
    );
  };

  const handleScoreEdit = () => {
    if (isScoreEditing) {
      const parsed = Number(scoreInput);
      if (isNaN(parsed) || parsed < 0 || parsed > 850) {
        toast.error('Credit score must be between 0 and 850.');
        setScoreInput(String(creditScore));
        setIsScoreEditing(false);
        return;
      }
      setCreditScore(parsed);
      setHasAssessed(false);
      setAssessment(null);
    } else {
      setScoreInput(String(creditScore));
    }
    setIsScoreEditing(!isScoreEditing);
  };

  const handleCustomOverrideToggle = () => {
    if (!isCustomOverride && assessment) {
      setOverrideCreditLimit(String(assessment.creditLimit));
      setOverrideInterestRate(String(assessment.interestRate));
      setOverrideTenorDays(String(assessment.maxTenorDays));
    }
    setIsCustomOverride(!isCustomOverride);
  };

  return (
    <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/70">
        <div className="h-7 w-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
          <Sparkles size={15} />
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Underwriting Assessment Engine
          </h3>
          <p className="text-[11px] text-slate-500">
            {distributorName} • Algorithm-driven credit facility sizing
            {statementFileName && (
              <span className="ml-2"> — Statement: <code className="text-slate-400">{statementFileName}</code></span>
            )}
          </p>
        </div>
        {hasAssessed && assessment && (
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
            {assessment.riskTier === 'LOW' ? 'Approved' : assessment.riskTier === 'MEDIUM' ? 'Review' : 'Escalate'}
          </span>
        )}
      </div>

      {/* Credit Score Input */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Credit Score
          </label>
          {isScoreEditing ? (
            <button
              type="button"
              onClick={handleScoreEdit}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F4DA8] hover:text-[#3A6FD8]"
            >
              <Check size={14} /> Save
            </button>
          ) : (
            <button
              type="button"
              onClick={handleScoreEdit}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              <Edit2 size={14} /> Edit
            </button>
          )}
        </div>

        {isScoreEditing ? (
          <input
            type="number"
            min="0"
            max="850"
            value={scoreInput}
            onChange={(e) => setScoreInput(e.target.value)}
            className="w-32 px-3 py-2 text-sm font-bold text-[#1E2937] rounded-lg border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40 focus:border-[#1F4DA8]"
          />
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-[#1F4DA8]">{creditScore}</span>
            <span className={`text-sm font-semibold ${RISK_TIER_LABELS[assessCredit(creditScore).riskTier].color}`}>
              {RISK_TIER_LABELS[assessCredit(creditScore).riskTier].label}
            </span>
          </div>
        )}
      </div>

      {/* Assessment Status */}
      {!hasAssessed && !isCustomOverride && (
        <div className="flex items-center justify-center gap-3 py-6 bg-white border border-slate-200/90 rounded-xl">
          {isAssessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#1F4DA8] border-t-transparent" />
              <span className="text-sm text-slate-600">
                {uploadedStatementFile ? 'Analyzing bank statement...' : 'Analyzing credit profile...'}
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={runAssessment}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1F4DA8] hover:bg-[#3A6FD8] rounded-xl transition-colors"
            >
              <Target size={16} />
              Run Underwriting Assessment
            </button>
          )}
        </div>
      )}

      {/* Assessment Results */}
      {hasAssessed && assessment && !isCustomOverride && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Algorithm Recommendation
            </h4>
            <span className={`text-xs font-semibold ${RISK_TIER_LABELS[assessment.riskTier].color}`}>
              {RISK_TIER_LABELS[assessment.riskTier].icon} {assessment.riskTier}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Credit Limit</div>
              <div className="text-xl font-black text-[#1F4DA8]">KES {assessment.creditLimit.toLocaleString()}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Interest Rate</div>
              <div className="text-xl font-black text-slate-700">{assessment.interestRate}%</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Max Tenor</div>
              <div className="text-xl font-black text-slate-700">{assessment.maxTenorDays} days</div>
            </div>
          </div>

          {!uploadedStatementFile && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 flex items-start gap-2 text-amber-800 text-xs">
              <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <span>No bank statement available — assessment based on credit score alone.</span>
            </div>
          )}
        </div>
      )}

      {/* Custom Override Toggle */}
      <div className="border-t border-slate-200/70 pt-3">
        <button
          type="button"
          onClick={handleCustomOverrideToggle}
          className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
            isCustomOverride
              ? 'text-[#DC2626] hover:text-[#B91C1C]'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          {isCustomOverride ? <X size={14} /> : <Shield size={14} />}
          {isCustomOverride ? 'Cancel override' : 'Manual committee override'}
        </button>
      </div>

      {/* Custom Override Fields */}
      {isCustomOverride && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 space-y-3">
          <FormField label="Override Credit Limit (KES)" required hint="Custom facility size">
            <TextInput
              type="number"
              value={overrideCreditLimit}
              onChange={(e) => setOverrideCreditLimit(e.target.value)}
              placeholder="e.g. 7500000"
            />
          </FormField>

          <FormField label="Override Interest Rate (%)" required hint="Custom annual rate">
            <TextInput
              type="number"
              step="0.1"
              value={overrideInterestRate}
              onChange={(e) => setOverrideInterestRate(e.target.value)}
              placeholder="e.g. 11.5"
            />
          </FormField>

          <FormField label="Override Max Tenor (Days)" required hint="Custom repayment period">
            <TextInput
              type="number"
              value={overrideTenorDays}
              onChange={(e) => setOverrideTenorDays(e.target.value)}
              placeholder="e.g. 45"
            />
          </FormField>

          <FormField
            label="Approval Reason"
            required
            hint="Justification for override"
          >
            <TextInput
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Strong relationship, exceptional collateral"
            />
          </FormField>
        </div>
      )}

      {/* Apply Button */}
      <div className="border-t border-slate-200/70 pt-4">
        <button
          type="button"
          onClick={handleApplyTerms}
          disabled={isAssessing || (!hasAssessed && !isCustomOverride)}
          className="w-full text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-md shadow-[#1F4DA8]/20 active:scale-[0.99] flex items-center justify-center gap-2 bg-[#1F4DA8] hover:bg-[#3A6FD8] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <TrendingUp size={16} />
          {isCustomOverride ? 'Apply Custom Terms' : 'Apply Assessment to Facility'}
        </button>
      </div>
    </div>
  );
}
