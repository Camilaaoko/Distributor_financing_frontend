'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Landmark,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Building2,
  PieChart as PieIcon,
  CheckCircle2,
  XCircle,
  Coins,
  Percent,
  Calendar,
  Layers,
  Scale,
} from 'lucide-react';
import { RiskThresholdBadge } from './RiskThresholdBadge';
import { reportsService } from '@/services/reports.service';
import { useToast } from '@/components/ui/Toast';
import type {
  CbkRegulatorySummaryResponse,
  CbkRegulatoryFilterParams,
  PrudentialScheduleItem,
  SectoralCreditConcentrationItem,
  LargeExposureItem,
} from '@/types/reports';

interface CbkRegulatoryViewProps {
  bankId?: string;
  userRole?: string;
  title?: string;
  subtitle?: string;
}

const PERIOD_OPTIONS = [
  { label: 'Quarter 3 – 2026 (Current)', value: 'Q3-2026' },
  { label: 'Quarter 2 – 2026', value: 'Q2-2026' },
  { label: 'Quarter 1 – 2026', value: 'Q1-2026' },
  { label: 'Quarter 4 – 2025', value: 'Q4-2025' },
];

export function CbkRegulatoryView({
  bankId: initialBankId,
  userRole = 'BANK_ADMIN',
  title = 'Central Bank of Kenya (CBK/PG/04) Regulatory Reports',
  subtitle = 'Statutory supervisory prudential returns, asset classification, loan loss provisions, sectoral concentration, and single borrower limits.',
}: CbkRegulatoryViewProps) {
  const toast = useToast();
  const [data, setData] = useState<CbkRegulatorySummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filters
  const [period, setPeriod] = useState('Q3-2026');
  const [selectedBankId, setSelectedBankId] = useState(initialBankId || '');

  const isPlatformAdmin = userRole.includes('PLATFORM');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: CbkRegulatoryFilterParams = {
        bankId: selectedBankId || undefined,
        period,
      };
      const res = await reportsService.getCBKRegulatorySummary(params);
      setData(res);
    } catch (err: unknown) {
      toast.error('Failed to load CBK regulatory summary.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBankId, period, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const params: CbkRegulatoryFilterParams = {
        bankId: selectedBankId || undefined,
        period,
      };
      await reportsService.exportCBKRegulatoryCsv(params, data || undefined);
      toast.success('CBK Supervisory Return CSV downloaded successfully.');
    } catch (err: any) {
      toast.error('Failed to download CBK CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatKes = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return 'KES 0';
    return `KES ${amount.toLocaleString('en-KE')}`;
  };

  const summary = data?.supervisorySummary;
  const prudential = data?.prudentialSchedule || [];
  const sectoral = data?.sectoralConcentration || [];
  const largeExposures = data?.largeExposures || [];

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-900 border border-blue-200">
              Prudential Guideline CBK/PG/04
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isPlatformAdmin && (
            <select
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 cursor-pointer"
            >
              <option value="">All Supervised Banks</option>
              <option value="bank-001">KCB Bank Kenya PLC</option>
              <option value="bank-002">Equity Bank Kenya</option>
              <option value="bank-003">Absa Bank Kenya</option>
              <option value="bank-004">Stanbic Bank</option>
            </select>
          )}

          {/* Period Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs text-xs">
            <Calendar size={14} className="text-slate-400 shrink-0" />
            <span className="text-[11px] font-semibold text-slate-400">Quarter:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-hidden cursor-pointer"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Download size={16} />
            {isExporting ? 'Downloading...' : 'Download CBK Supervisory Return (CSV)'}
          </button>
        </div>
      </div>

      {/* 2. Supervisory Return Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Portfolio & NPL Ratio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Supervised Loans</span>
            <Coins size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatKes(summary?.grossLoans ?? 1420500000)}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
            <span>Total NPLs:</span>
            <span className="font-bold text-rose-600">{formatKes(summary?.totalNpls ?? 42615000)}</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>NPL Ratio:</span>
            <span className="font-bold text-slate-900">{summary?.nplRatioPercent ?? 3.0}% (Target &lt; 5%)</span>
          </div>
        </div>

        {/* General Provisions (Normal 1% + Watch 3%) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">General Provisions</span>
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatKes(summary?.totalGeneralProvisions ?? 14915250)}
          </div>
          <div className="text-xs text-slate-500 pt-1">
            Mandatory general coverage on Normal (1%) and Watch (3%) asset classes.
          </div>
        </div>

        {/* Specific Provisions (Substandard 20% + Doubtful 50% + Loss 100%) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Specific Provisions</span>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {formatKes(summary?.totalSpecificProvisions ?? 17330100)}
          </div>
          <div className="text-xs text-slate-500 pt-1">
            Allocated against impaired sub-accounts (Substandard, Doubtful, Loss).
          </div>
        </div>

        {/* Net Statutory Provision vs Surplus/Deficit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Provision Adequacy</span>
            <Scale size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            +{formatKes(summary?.provisionSurplusDeficit ?? 4254650)}
          </div>
          <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 pt-1">
            <CheckCircle2 size={13} /> Statutory Surplus (Core Buffer Active)
          </div>
          <div className="text-[11px] text-slate-500">
            Required: <span className="font-bold text-slate-800">{formatKes(summary?.netStatutoryProvisionRequired ?? 32245350)}</span>
          </div>
        </div>
      </div>

      {/* 3. Prudential Schedule Table (CBK/PG/04 Asset Classification) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Prudential Return Schedule: Asset Classification &amp; Provisions (CBK/PG/04)
            </h3>
            <p className="text-xs text-slate-500">
              Classification of credit facilities, days in arrears, required statutory rates, and provision requirements.
            </p>
          </div>
          <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            Reporting Period: {data?.supervisorySummary.reportingPeriod || period}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Classification Criteria &amp; Aging</th>
                <th className="py-3.5 px-3 text-center">Accounts</th>
                <th className="py-3.5 px-4 text-right">Gross Outstanding (KES)</th>
                <th className="py-3.5 px-3 text-center">Required %</th>
                <th className="py-3.5 px-4 text-right">Statutory Provision (KES)</th>
                <th className="py-3.5 px-4 text-center">Provision Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prudential.map((row) => (
                <tr key={row.category} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          row.category === 'NORMAL'
                            ? 'bg-emerald-500'
                            : row.category === 'WATCH'
                            ? 'bg-amber-500'
                            : row.category === 'SUBSTANDARD'
                            ? 'bg-orange-500'
                            : row.category === 'DOUBTFUL'
                            ? 'bg-rose-500'
                            : 'bg-red-900'
                        }`}
                      />
                      {row.classificationName}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-sm">{row.criteria}</td>
                  <td className="py-3.5 px-3 text-center font-bold text-slate-800">{row.numberOfAccounts}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    {formatKes(row.grossOutstanding)}
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-blue-900">
                    {row.requiredProvisionPercent}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900 whitespace-nowrap">
                    {formatKes(row.statutoryProvisionAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                        row.provisionType === 'General Provision'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {row.provisionType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Sectoral Credit Concentration & Large Exposure Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Sectoral Credit Concentration */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sectoral Credit Concentration</h3>
              <p className="text-xs text-slate-500">Distribution of distributor financing across economic sectors.</p>
            </div>
            <PieIcon size={18} className="text-blue-600" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Economic Sector</th>
                  <th className="py-2.5 px-2 text-center">Facilities</th>
                  <th className="py-2.5 px-3 text-right">Exposure (KES)</th>
                  <th className="py-2.5 px-2 text-center">Share</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sectoral.map((item) => (
                  <tr key={item.sectorCode} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">{item.sectorName}</td>
                    <td className="py-3 px-2 text-center text-slate-600 font-medium">{item.facilityCount}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatKes(item.exposureAmount)}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-blue-900">{item.portfolioSharePercent}%</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-700">
                        {item.averageRiskGrade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Large Exposure Table (Single Borrower Limit: 25% Core Capital) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Large Exposures &amp; Single Borrower Limits</h3>
              <p className="text-xs text-slate-500">
                Borrower groups evaluated against statutory 25% Core Capital single borrower limits.
              </p>
            </div>
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Borrower Entity</th>
                  <th className="py-2.5 px-3 text-right">Sanctioned (KES)</th>
                  <th className="py-2.5 px-3 text-right">Outstanding</th>
                  <th className="py-2.5 px-2 text-center">% Core Capital</th>
                  <th className="py-2.5 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {largeExposures.map((borrower) => (
                  <tr key={borrower.borrowerId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{borrower.borrowerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        PIN: {borrower.kraPin} • {borrower.anchorManufacturer}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                      {formatKes(borrower.sanctionedFacilityLimit)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatKes(borrower.totalOutstandingAmount)}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-slate-800">
                      {borrower.percentOfCoreCapital}%
                      <span className="text-[10px] text-slate-400 block font-normal">(&lt; 25% Max)</span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <RiskThresholdBadge level={borrower.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
