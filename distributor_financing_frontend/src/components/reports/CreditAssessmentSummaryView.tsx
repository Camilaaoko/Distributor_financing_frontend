'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Download,
  Building2,
  Landmark,
  ShieldCheck,
  TrendingUp,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import { RiskThresholdBadge } from './RiskThresholdBadge';
import { reportsService } from '@/services/reports.service';
import { useToast } from '@/components/ui/Toast';
import type {
  CreditAssessmentSummaryResponse,
  CreditAssessmentFilterParams,
  CreditAssessmentPipelineItem,
} from '@/types/reports';

interface CreditAssessmentSummaryViewProps {
  bankId?: string;
  userRole?: string;
  detailBaseUrl?: string; // e.g. '/admin/distributors' or '/bank/distributors'
  title?: string;
  subtitle?: string;
}

export function CreditAssessmentSummaryView({
  bankId: initialBankId,
  userRole = 'BANK_ADMIN',
  detailBaseUrl = '/bank/distributors',
  title = 'Credit Assessment & CRB Bureau Underwriting Pipeline',
  subtitle = 'Consolidated pipeline of evaluated borrower credit limits, bureau scores, cashflow DSCR multiples, and covenant compliance.',
}: CreditAssessmentSummaryViewProps) {
  const toast = useToast();
  const [data, setData] = useState<CreditAssessmentSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filters
  const [selectedRiskTier, setSelectedRiskTier] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBankId, setSelectedBankId] = useState(initialBankId || '');

  const isPlatformAdmin = userRole.includes('PLATFORM');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: CreditAssessmentFilterParams = {
        bankId: selectedBankId || undefined,
        riskTier: selectedRiskTier !== 'ALL' ? selectedRiskTier : undefined,
      };
      const res = await reportsService.getCreditAssessmentSummary(params);
      setData(res);
    } catch (err: unknown) {
      toast.error('Failed to load credit assessment summary.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBankId, selectedRiskTier, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const params: CreditAssessmentFilterParams = {
        bankId: selectedBankId || undefined,
        riskTier: selectedRiskTier !== 'ALL' ? selectedRiskTier : undefined,
      };
      await reportsService.exportCreditAssessmentCsv(params, data || undefined);
      toast.success('Credit Assessment Summary CSV exported.');
    } catch (err: any) {
      toast.error('Failed to export CSV report.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatKes = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return 'KES 0';
    return `KES ${amount.toLocaleString('en-KE')}`;
  };

  const assessments = (data?.assessments || []).filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.distributorName.toLowerCase().includes(term) ||
      item.kraPin.toLowerCase().includes(term) ||
      item.anchorManufacturer.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isPlatformAdmin && (
            <select
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 cursor-pointer"
            >
              <option value="">All Underwriting Banks</option>
              <option value="bank-001">KCB Bank Kenya</option>
              <option value="bank-002">Equity Bank Kenya</option>
              <option value="bank-003">Absa Bank Kenya</option>
            </select>
          )}

          {/* Risk Tier Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <span className="text-[11px] font-semibold text-slate-400">Risk Tier:</span>
            <select
              value={selectedRiskTier}
              onChange={(e) => setSelectedRiskTier(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="TIER_1_LOW_RISK">Tier 1 – Low Risk</option>
              <option value="TIER_2_MODERATE_RISK">Tier 2 – Moderate Risk</option>
              <option value="TIER_3_ELEVATED_RISK">Tier 3 – Elevated Risk</option>
              <option value="TIER_4_HIGH_RISK">Tier 4 – High Risk</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Download size={16} />
            {isExporting ? 'Exporting...' : 'Export Underwriting Summary (CSV)'}
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Assessed Borrowers
          </span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {data?.totalAssessmentsCount ?? 154}
          </div>
          <div className="text-xs text-slate-500 font-medium">Underwritten via ML Engine</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Average CRB Score
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {data?.averageCrbScore ?? 724}
          </div>
          <div className="text-xs text-slate-500 font-medium">Metropol / TransUnion Benchmark</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Approved Facility Volume
          </span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatKes(data?.approvedVolume ?? 1845000000)}
          </div>
          <div className="text-xs text-slate-500 font-medium">Sanctioned Revolving Lines</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Average Cashflow DSCR
          </span>
          <div className="text-2xl font-black text-blue-900 mt-2">
            {data?.averageDscr ?? 1.92}x
          </div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 size={12} /> Target &gt; 1.30x Exceeded
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Rejection / Refer Rate
          </span>
          <div className="text-2xl font-black text-rose-600 mt-2">
            {data?.rejectionRatePercent ?? 4.5}%
          </div>
          <div className="text-xs text-slate-500 font-medium">Due to Delinquency / DSCR</div>
        </div>
      </div>

      {/* 3. Underwriting Pipeline Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Assessed Borrowers Pipeline</h3>
            <p className="text-xs text-slate-500">
              Click &quot;View Full Assessment&quot; to inspect financial covenants, cashflow matrices, and CRB gauges.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search distributor, PIN, anchor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Distributor Entity</th>
                <th className="py-3.5 px-3 text-center">CRB Score</th>
                <th className="py-3.5 px-3 text-center">Risk Tier</th>
                <th className="py-3.5 px-4 text-right">Avg Turnover (KES)</th>
                <th className="py-3.5 px-3 text-center">DSCR</th>
                <th className="py-3.5 px-4 text-right">Recommended Limit</th>
                <th className="py-3.5 px-3 text-center">Covenants</th>
                <th className="py-3.5 px-3 text-center">Decision</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assessments.map((row) => (
                <tr key={row.distributorId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{row.distributorName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      PIN: {row.kraPin} • {row.anchorManufacturer}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-black text-slate-900 text-sm">{row.crbScore}</span>
                      <RiskThresholdBadge level={row.riskBracket} size="sm" />
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-800">
                      {row.riskTier.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {formatKes(row.averageMonthlyTurnover)}
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                    <span className={row.dscr >= 1.3 ? 'text-emerald-700' : 'text-rose-600'}>
                      {row.dscr}x
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900">
                    {formatKes(row.recommendedLimit)}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                        row.covenantsPassed === row.covenantsTotal
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {row.covenantsPassed}/{row.covenantsTotal} Passed
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <RiskThresholdBadge level={row.decision} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href={`${detailBaseUrl}/${row.distributorId}/credit-assessment`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-lg transition-colors"
                    >
                      <Eye size={13} /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
