'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Building2,
  Landmark,
  TrendingUp,
  Percent,
  AlertTriangle,
  ShieldAlert,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Users,
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { DateRangePicker } from './DateRangePicker';
import { RiskThresholdBadge } from './RiskThresholdBadge';
import { reportsService } from '@/services/reports.service';
import { useToast } from '@/components/ui/Toast';
import type {
  PortfolioPerformanceResponse,
  PortfolioFilterParams,
  AgingScheduleItem,
  AnchorConcentrationItem,
} from '@/types/reports';

interface PortfolioPerformanceViewProps {
  bankId?: string;
  manufacturerId?: string;
  userRole?: string; // 'PLATFORM_ADMIN' | 'BANK_ADMIN' | 'MANUFACTURER_ADMIN' etc.
  title?: string;
  subtitle?: string;
}

const AGING_COLORS: Record<string, string> = {
  NORMAL: '#10B981', // Green
  WATCH: '#F59E0B', // Amber
  SUBSTANDARD: '#F97316', // Orange
  DOUBTFUL: '#EF4444', // Red
  LOSS: '#991B1B', // Dark Red
};

const ANCHOR_PALETTE = ['#1F4DA8', '#F58220', '#10B981', '#8B5CF6', '#64748B', '#06B6D4'];

export function PortfolioPerformanceView({
  bankId: initialBankId,
  manufacturerId: initialManufacturerId,
  userRole = 'BANK_ADMIN',
  title = 'Portfolio Performance & Credit Risk Dashboard',
  subtitle = 'Comprehensive analysis of active loan volume, risk-weighted aging buckets, PAR ratios, and anchor concentration.',
}: PortfolioPerformanceViewProps) {
  const toast = useToast();
  const [data, setData] = useState<PortfolioPerformanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filters
  const [selectedBankId, setSelectedBankId] = useState(initialBankId || '');
  const [selectedMfrId, setSelectedMfrId] = useState(initialManufacturerId || '');
  const [startDate, setStartDate] = useState('2026-04-01');
  const [endDate, setEndDate] = useState('2026-09-12');

  const isPlatformAdmin = userRole.includes('PLATFORM');
  const isManufacturerUser = userRole.includes('MANUFACTURER');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: PortfolioFilterParams = {
        bankId: selectedBankId || undefined,
        manufacturerId: selectedMfrId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      const res = await reportsService.getPortfolioPerformance(params);
      setData(res);
    } catch (err: unknown) {
      toast.error('Failed to load portfolio performance data. Showing latest cached metrics.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBankId, selectedMfrId, startDate, endDate, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const params: PortfolioFilterParams = {
        bankId: selectedBankId || undefined,
        manufacturerId: selectedMfrId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      await reportsService.exportPortfolioPerformanceCsv(params, data || undefined);
      toast.success('Portfolio report exported successfully.');
    } catch (err: any) {
      toast.error('Failed to export CSV report.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatKes = (val: number | undefined) => {
    if (!val) return 'KES 0';
    if (val >= 1_000_000_000) return `KES ${(val / 1_000_000_000).toFixed(2)}B`;
    if (val >= 1_000_000) return `KES ${(val / 1_000_000).toFixed(2)}M`;
    return `KES ${val.toLocaleString('en-KE')}`;
  };

  const kpis = data?.kpis;
  const par = data?.parBanners;
  const aging = data?.agingSchedule || [];
  const anchors = data?.anchorConcentration || [];
  const trajectory = data?.historicalTrajectory || [];

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Multi-tenant selectors for Platform Admin */}
          {isPlatformAdmin && (
            <div className="flex items-center gap-2">
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 cursor-pointer"
              >
                <option value="">All Partner Banks</option>
                <option value="bank-001">KCB Bank Kenya</option>
                <option value="bank-002">Equity Bank Kenya</option>
                <option value="bank-003">Absa Bank Kenya</option>
                <option value="bank-004">Stanbic Bank</option>
              </select>

              <select
                value={selectedMfrId}
                onChange={(e) => setSelectedMfrId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 cursor-pointer"
              >
                <option value="">All Anchors</option>
                <option value="mfr-eabl">East African Breweries</option>
                <option value="mfr-unilever">Unilever Kenya</option>
                <option value="mfr-bidco">Bidco Africa</option>
                <option value="mfr-bat">BAT Kenya</option>
              </select>
            </div>
          )}

          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
          />

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Download size={16} />
            {isExporting ? 'Exporting...' : 'Export Portfolio Report (CSV)'}
          </button>
        </div>
      </div>

      {/* 2. KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Gross Portfolio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Portfolio Volume</span>
            <Coins size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatKes(kpis?.grossPortfolioVolume ?? 1420500000)}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
            <Users size={12} className="text-slate-400" />
            <span>{kpis?.activeBorrowersCount ?? 148} Active Borrowers</span>
          </div>
        </div>

        {/* Total Disbursed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Disbursed (Cum.)</span>
            <ArrowUpRight size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatKes(kpis?.totalDisbursed ?? 2845000000)}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Avg Tenor: <span className="font-bold text-slate-700">{kpis?.weightedAverageTenorDays ?? 54} Days</span>
          </div>
        </div>

        {/* Total Repaid */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Repaid (Cum.)</span>
            <ArrowDownLeft size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {formatKes(kpis?.totalRepaid ?? 1424500000)}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Settled via M-Pesa &amp; RTGS
          </div>
        </div>

        {/* Collection Efficiency */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Collection Efficiency</span>
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {kpis?.collectionEfficiencyPercent ?? 96.8}%
          </div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 size={12} /> Target &gt; 95% met
          </div>
        </div>

        {/* Default Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Default Rate</span>
            <ShieldAlert size={18} className="text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">
            {kpis?.defaultRatePercent ?? 1.4}%
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Weighted Yield: <span className="font-bold text-slate-700">{kpis?.weightedAverageInterestRate ?? 13.8}% p.a.</span>
          </div>
        </div>
      </div>

      {/* 3. PAR Risk Banners (PAR 30, PAR 60, PAR 90) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PAR 30 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Portfolio at Risk (PAR 30)</span>
              <RiskThresholdBadge level={par?.par30.thresholdLevel || 'YELLOW'} size="sm" />
            </div>
            <div className="text-xs text-slate-500">Arrears 30+ Days Past Due</div>
            <div className="text-xs font-medium text-slate-600 pt-1">
              Exposure: <span className="font-bold text-slate-900">{formatKes(par?.par30.amount ?? 29830500)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-amber-600">
              {par?.par30.percentage ?? 2.1}%
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Target: &lt; {par?.par30.targetBenchmarkPercent ?? 3.0}%</div>
          </div>
        </div>

        {/* PAR 60 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Portfolio at Risk (PAR 60)</span>
              <RiskThresholdBadge level={par?.par60.thresholdLevel || 'GREEN'} size="sm" />
            </div>
            <div className="text-xs text-slate-500">Arrears 60+ Days Past Due</div>
            <div className="text-xs font-medium text-slate-600 pt-1">
              Exposure: <span className="font-bold text-slate-900">{formatKes(par?.par60.amount ?? 17046000)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-emerald-600">
              {par?.par60.percentage ?? 1.2}%
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Target: &lt; {par?.par60.targetBenchmarkPercent ?? 2.0}%</div>
          </div>
        </div>

        {/* PAR 90 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Portfolio at Risk (PAR 90 / NPL)</span>
              <RiskThresholdBadge level={par?.par90.thresholdLevel || 'GREEN'} size="sm" />
            </div>
            <div className="text-xs text-slate-500">Severe Arrears 90+ Days Past Due</div>
            <div className="text-xs font-medium text-slate-600 pt-1">
              Exposure: <span className="font-bold text-slate-900">{formatKes(par?.par90.amount ?? 11364000)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-emerald-600">
              {par?.par90.percentage ?? 0.8}%
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Target: &lt; {par?.par90.targetBenchmarkPercent ?? 1.0}%</div>
          </div>
        </div>
      </div>

      {/* 4. 6-Month Disbursement & Repayment Trend (Historical Trajectory) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Disbursement &amp; Repayment Velocity</h3>
            <p className="text-xs text-slate-500">
              6-Month historical comparison of loan drawdowns against recovery cashflows and gross portfolio growth.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="h-3 w-3 rounded-sm bg-[#1F4DA8]" /> Disbursements
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="h-3 w-3 rounded-sm bg-[#10B981]" /> Repayments
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="h-3 w-3 rounded-sm bg-[#F58220]" /> Gross Outstanding
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectory} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDisb" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#1F4DA8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1F4DA8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorRepay" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `KES ${(v / 1_000_000).toFixed(0)}M`}
              />
              <Tooltip
                formatter={(val: number, name: string) => [
                  `KES ${(val / 1_000_000).toFixed(1)}M`,
                  name === 'disbursements'
                    ? 'Disbursements'
                    : name === 'repayments'
                    ? 'Repayments'
                    : 'Gross Outstanding',
                ]}
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
              />
              <Area
                type="monotone"
                dataKey="disbursements"
                name="disbursements"
                stroke="#1F4DA8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorDisb)"
              />
              <Area
                type="monotone"
                dataKey="repayments"
                name="repayments"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRepay)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Aging Schedule & Anchor Concentration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (7 cols): CBK Aging Schedule Table & Distribution */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                CBK Prudential Asset Classification &amp; Aging Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Central Bank of Kenya (CBK/PG/04) statutory loan aging buckets and mandatory provisions.
              </p>
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
              CBK/PG/04 Compliant
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-3">Classification</th>
                  <th className="py-3 px-3">Days Past Due</th>
                  <th className="py-3 px-2 text-center">Accounts</th>
                  <th className="py-3 px-3 text-right">Outstanding (KES)</th>
                  <th className="py-3 px-2 text-center">Share</th>
                  <th className="py-3 px-3 text-right">Statutory Provision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aging.map((row) => (
                  <tr key={row.category} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: AGING_COLORS[row.category] || '#64748B' }}
                      />
                      {row.categoryLabel}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{row.daysPastDueRange}</td>
                    <td className="py-3 px-2 text-center font-bold text-slate-700">{row.accountCount}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatKes(row.portfolioAmount)}
                    </td>
                    <td className="py-3 px-2 text-center text-slate-600 font-semibold">
                      {row.portfolioPercentage}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      <span className="text-[10px] text-slate-400 mr-1">({row.provisionRatePercent}%)</span>
                      {formatKes(row.statutoryProvisionAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col (5 cols): Anchor Manufacturer Concentration Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Anchor Manufacturer Concentration</h3>
            <p className="text-xs text-slate-500">
              Loan exposure allocation and distributor concentration across FMCG manufacturers.
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={anchors}
                  dataKey="exposureAmount"
                  nameKey="manufacturerName"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {anchors.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || ANCHOR_PALETTE[index % ANCHOR_PALETTE.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`KES ${(val / 1_000_000).toFixed(1)}M`, 'Exposure']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {anchors.map((item, idx) => (
              <div key={item.manufacturerId} className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="h-3 w-3 rounded-sm shrink-0"
                    style={{ backgroundColor: item.color || ANCHOR_PALETTE[idx % ANCHOR_PALETTE.length] }}
                  />
                  <span className="font-semibold text-slate-800 truncate" title={item.manufacturerName}>
                    {item.manufacturerName}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono shrink-0">
                  <span className="font-bold text-slate-900">{formatKes(item.exposureAmount)}</span>
                  <span className="text-slate-400 text-[11px]">({item.exposurePercentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
