'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Building2,
  Landmark,
  FileSpreadsheet,
  Coins,
  Percent,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CreditCard,
  Receipt,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { DateRangePicker } from './DateRangePicker';
import { RiskThresholdBadge } from './RiskThresholdBadge';
import { reportsService } from '@/services/reports.service';
import { useToast } from '@/components/ui/Toast';
import type {
  CustomerStatementResponse,
  StatementFilterParams,
  ActiveLoanSubAccount,
  StatementLedgerEntry,
} from '@/types/reports';

interface CustomerStatementViewProps {
  distributorId?: string; // If omitted, loads "my-statement" (self-service)
  title?: string;
  subtitle?: string;
  isSelfService?: boolean;
}

export function CustomerStatementView({
  distributorId,
  title = 'Customer Account Statement',
  subtitle = 'Comprehensive financial statement with active loan sub-accounts and chronological ledger.',
  isSelfService = false,
}: CustomerStatementViewProps) {
  const toast = useToast();
  const [statement, setStatement] = useState<CustomerStatementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-09-12');

  const loadStatement = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: StatementFilterParams = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      let data: CustomerStatementResponse;
      if (isSelfService || !distributorId) {
        data = await reportsService.getMyStatement(params);
      } else {
        data = await reportsService.getCustomerStatement(distributorId, params);
      }
      setStatement(data);
    } catch {
      toast.error('Failed to load statement. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [distributorId, isSelfService, startDate, endDate, toast]);

  useEffect(() => {
    loadStatement();
  }, [loadStatement]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const params: StatementFilterParams = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      if (isSelfService || !distributorId) {
        await reportsService.exportMyStatementCsv(params, statement || undefined);
      } else {
        await reportsService.exportCustomerStatementCsv(distributorId, params, statement || undefined);
      }
      toast.success('Statement CSV exported successfully.');
    } catch (err: unknown) {
      toast.error('CSV export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatKes = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return 'KES 0';
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const header = statement?.header;
  const summary = statement?.summary;
  const activeLoans = statement?.activeLoans || [];
  const ledger = statement?.ledger || [];

  return (
    <div className="space-y-6">
      {/* Header & Export Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
            {header?.facilityStatus && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                {header.facilityStatus}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
            {isExporting ? 'Exporting...' : 'Export Statement (CSV)'}
          </button>
        </div>
      </div>

      {/* 1. Header Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Distributor Info */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Distributor Entity</span>
            <Building2 size={18} className="text-blue-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 truncate" title={header?.distributorName || 'Apex Distro Ltd'}>
            {header?.distributorName || '—'}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">KRA PIN:</span>
            <span className="font-mono font-medium text-slate-800">{header?.kraPin || '—'}</span>
          </div>
        </div>

        {/* Card 2: Bank Partner */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Financing Bank</span>
            <Landmark size={18} className="text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 truncate">
            {header?.bankName || '—'}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Sanctioned Rate:</span>
            <span className="font-bold text-emerald-700">{header?.sanctionedRate ?? 0}% p.a.</span>
            <span className="text-slate-400">• {header?.tenorDays ?? 60}d Tenor</span>
          </div>
        </div>

        {/* Card 3: Total Facility Limit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Sanctioned Limit</span>
            <CreditCard size={18} className="text-indigo-600" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {formatKes(header?.facilityLimit ?? 0)}
          </div>
          <div className="text-xs text-slate-500">
            Approved Revolving Credit Facility
          </div>
        </div>

        {/* Card 4: Available Limit Cushion */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Cushion</span>
            <Coins size={18} className="text-amber-500" />
          </div>
          <div className="text-xl font-black text-emerald-600">
            {formatKes(header?.availableLimit ?? 0)}
          </div>
          <div className="text-xs text-slate-500">
            Utilized: <span className="font-bold text-slate-700">{formatKes(header?.utilizedLimit ?? 0)}</span>
          </div>
        </div>
      </div>

      {/* 2. Period Financial Summary */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl text-white p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-2">
          <div>
            <h3 className="text-base font-bold tracking-tight">Period Financial Summary</h3>
            <p className="text-xs text-slate-400">
              Reporting Window: {summary?.startDate || startDate || '01 Jun 2026'} — {summary?.endDate || endDate || '12 Sep 2026'}
            </p>
          </div>
          <div className="text-xs font-medium text-blue-200 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
            Currency: KES (Kenyan Shilling)
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <ArrowUpRight size={13} className="text-amber-400" /> Total Draws
            </div>
            <div className="text-lg font-extrabold text-white mt-1">
              {formatKes(summary?.totalDraws ?? 0)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Principal Disbursed</div>
          </div>

          <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Percent size={13} className="text-rose-400" /> Interest Applied
            </div>
            <div className="text-lg font-extrabold text-white mt-1">
              {formatKes(summary?.interestApplied ?? 0)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Accrued Interest</div>
          </div>

          <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Receipt size={13} className="text-blue-300" /> Fees &amp; Charges
            </div>
            <div className="text-lg font-extrabold text-white mt-1">
              {formatKes(summary?.fees ?? 0)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Processing &amp; Admin</div>
          </div>

          <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <ArrowDownLeft size={13} className="text-emerald-400" /> Total Repaid
            </div>
            <div className="text-lg font-extrabold text-emerald-400 mt-1">
              {formatKes(summary?.totalRepaid ?? 0)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Settlements Received</div>
          </div>

          <div className="p-3.5 bg-blue-600/20 rounded-xl border border-blue-400/30 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-200">
              <FileCheck size={13} className="text-blue-300" /> Closing Balance
            </div>
            <div className="text-lg font-black text-white mt-1">
              {formatKes(summary?.closingBalance ?? 0)}
            </div>
            <div className="text-[10px] text-blue-200 mt-0.5">Net Outstanding</div>
          </div>
        </div>
      </div>

      {/* 3. Active Loan Sub-Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Loan Sub-Accounts</h3>
            <p className="text-xs text-slate-500">
              Itemized list of all drawdowns, associated purchase orders, and remaining principal balances.
            </p>
          </div>
          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
            {activeLoans.length} Loans
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Loan Number</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Purchase Order #</th>
                <th className="py-3 px-4 text-right">Principal Amount</th>
                <th className="py-3 px-4">Disbursed Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                    {loan.loanNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">{loan.invoiceNumber}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">{loan.purchaseOrderNumber}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {formatKes(loan.principal)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{loan.disbursedDate}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      {loan.dueDate}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <RiskThresholdBadge level={loan.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                    {formatKes(loan.remainingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Chronological Statement Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Chronological Statement Ledger</h3>
            <p className="text-xs text-slate-500">
              Full audit trail of debits, credits, processing fees, interest accruals, and repayments.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            <Download size={14} /> Download Ledger
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Debit (+)</th>
                <th className="py-3 px-4 text-right">Credit (-)</th>
                <th className="py-3 px-4 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledger.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{entry.date}</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                    {entry.transactionRef}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-tight ${
                        entry.type === 'DISBURSEMENT'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : entry.type === 'REPAYMENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : entry.type === 'INTEREST_CHARGE'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {entry.type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-xs">{entry.description}</td>
                  <td className="py-3.5 px-4 text-right font-medium text-rose-700 whitespace-nowrap">
                    {entry.debit > 0 ? `+${formatKes(entry.debit)}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-emerald-700 whitespace-nowrap">
                    {entry.credit > 0 ? `-${formatKes(entry.credit)}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
                    {formatKes(entry.runningBalance)}
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
