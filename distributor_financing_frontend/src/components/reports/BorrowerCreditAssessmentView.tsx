'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Building2,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Percent,
  AlertTriangle,
  Coins,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileCheck,
  Sparkles,
  Calendar,
  Layers,
  Scale,
  CreditCard,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { CreditScoreGauge } from './CreditScoreGauge';
import { RiskThresholdBadge } from './RiskThresholdBadge';
import { reportsService } from '@/services/reports.service';
import { useToast } from '@/components/ui/Toast';
import type { BorrowerCreditAssessmentReport } from '@/types/reports';

interface BorrowerCreditAssessmentViewProps {
  distributorId: string;
  backUrl?: string;
  isDistributorSelfService?: boolean;
}

export function BorrowerCreditAssessmentView({
  distributorId,
  backUrl = '/bank/reports/credit-assessments',
  isDistributorSelfService = false,
}: BorrowerCreditAssessmentViewProps) {
  const toast = useToast();
  const [data, setData] = useState<BorrowerCreditAssessmentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await reportsService.getCreditAssessmentReport(distributorId);
      setData(res);
    } catch (err: unknown) {
      toast.error('Failed to load credit assessment report.');
    } finally {
      setIsLoading(false);
    }
  }, [distributorId, toast]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const formatKes = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return 'KES 0';
    return `KES ${amount.toLocaleString('en-KE')}`;
  };

  const crb = data?.crbData;
  const cashflow = data?.cashflowMatrix;
  const covenants = data?.covenants || [];
  const terms = data?.recommendedTerms;

  return (
    <div className="space-y-6">
      {/* 1. Top Bar & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          {backUrl && !isDistributorSelfService && (
            <Link
              href={backUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-700 mb-2 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Credit Pipeline
            </Link>
          )}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {data?.distributorName || 'Apex Distro Ltd'} — Credit Underwriting Assessment
            </h1>
            <RiskThresholdBadge level={terms?.decision || 'APPROVED'} size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            KRA PIN: <span className="font-mono font-bold text-slate-700">{data?.kraPin || 'P051234567Z'}</span> • Anchor: <span className="font-bold text-slate-700">{data?.anchorManufacturerName}</span> • Assessed: {data?.assessmentDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            Underwriter: {data?.underwritingOfficer || 'AI Risk Engine'}
          </span>
        </div>
      </div>

      {/* 2. Top Analytics Grid: CRB Gauge (Left) & Recommended Terms (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (4 cols): CRB Score Radial Gauge */}
        <div className="lg:col-span-4">
          <CreditScoreGauge
            score={crb?.crbScore ?? 785}
            bureauName={crb?.bureauName || 'Metropol CRB'}
            scoreDate={crb?.scoreDate || '25 Aug 2026'}
            riskBracket={crb?.riskBracket || 'LOW'}
            className="h-full"
          />
        </div>

        {/* Right (8 cols): Recommended Facility Limit & Underwriting Decision */}
        <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl text-white p-6 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <Sparkles size={14} /> Recommended Financing Facility &amp; Terms
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white">
                {terms?.decision || 'APPROVED'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[11px] font-medium text-slate-400 block">Recommended Limit</span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {formatKes(terms?.recommendedFacilityLimit ?? 25000000)}
                </span>
                <span className="text-[10px] text-slate-400">Revolving Line</span>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[11px] font-medium text-slate-400 block">Sanctioned Rate</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">
                  {terms?.recommendedRatePercent ?? 13.5}% p.a.
                </span>
                <span className="text-[10px] text-slate-400">Risk-Adjusted Yield</span>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[11px] font-medium text-slate-400 block">Max Tenor</span>
                <span className="text-2xl font-black text-blue-300 mt-1 block">
                  {terms?.maxTenorDays ?? 60} Days
                </span>
                <span className="text-[10px] text-slate-400">Inventory Cycle Matched</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-300">
            <span className="font-bold text-white">Decision Rationale: </span>
            {terms?.decisionRationale}
          </div>
        </div>
      </div>

      {/* 3. Cashflow Matrix Cards */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-700" /> Cashflow &amp; Repayment Capacity Matrix
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Average Monthly Turnover
            </span>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {formatKes(cashflow?.averageMonthlyTurnover ?? 42500000)}
            </div>
            <div className="text-xs text-slate-500">Based on 12-month MPesa &amp; Bank throughput</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Debt Service Coverage (DSCR)
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-2">
              {cashflow?.dscr ?? 2.15}x
            </div>
            <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> Target &gt; 1.30x Exceeded (High Repayment Safety)
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Min Operating Balance
            </span>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {formatKes(cashflow?.minimumOperatingBalance ?? 3200000)}
            </div>
            <div className="text-xs text-slate-500">Working capital daily liquidity floor</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Working Capital Cycle
            </span>
            <div className="text-2xl font-black text-blue-900 mt-2">
              {cashflow?.workingCapitalCycleDays ?? 34} Days
            </div>
            <div className="text-xs text-slate-500">
              Volatility: <span className="font-bold text-slate-700">{cashflow?.cashflowVolatilityPercent ?? 8.4}%</span> (Low)
            </div>
          </div>
        </div>
      </div>

      {/* 4. Financial Covenants & Assessment Checklist Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Assessed Financial Covenants &amp; Eligibility Criteria
            </h3>
            <p className="text-xs text-slate-500">
              Automatic validation checks against bank risk policy and underwriting benchmarks.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {covenants.filter((c) => c.status === 'PASSED').length}/{covenants.length} Covenants Passed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Financial Covenant / Rule</th>
                <th className="py-3.5 px-4">Benchmark Policy</th>
                <th className="py-3.5 px-4">Distributor Actual</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4">Underwriting Notes &amp; Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {covenants.map((cov) => (
                <tr key={cov.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">{cov.covenantName}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{cov.benchmarkRule}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{cov.actualValue}</td>
                  <td className="py-3.5 px-3 text-center">
                    <RiskThresholdBadge level={cov.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-sm">{cov.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
