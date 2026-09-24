'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  ShieldCheck,
  Building2,
  PieChart,
  FileSpreadsheet,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { PortfolioPerformanceView } from '@/components/reports/PortfolioPerformanceView';
import { CbkRegulatoryView } from '@/components/reports/CbkRegulatoryView';
import { CreditAssessmentSummaryView } from '@/components/reports/CreditAssessmentSummaryView';
import { useAuth } from '@/hooks/useAuth';

type TabType = 'portfolio' | 'cbk' | 'underwriting';

export default function BankReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('portfolio');

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Sub-navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('portfolio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'portfolio'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 size={16} />
          Portfolio Performance &amp; Risk
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cbk')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'cbk'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck size={16} />
          CBK Supervisory Returns (CBK/PG/04)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('underwriting')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'underwriting'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 size={16} />
          Credit Underwriting Pipeline
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'portfolio' && (
        <PortfolioPerformanceView
          bankId={user?.bankId}
          userRole={user?.role || 'BANK_ADMIN'}
        />
      )}

      {activeTab === 'cbk' && (
        <CbkRegulatoryView
          bankId={user?.bankId}
          userRole={user?.role || 'BANK_ADMIN'}
        />
      )}

      {activeTab === 'underwriting' && (
        <CreditAssessmentSummaryView
          bankId={user?.bankId}
          userRole={user?.role || 'BANK_ADMIN'}
          detailBaseUrl="/bank/distributors"
        />
      )}
    </div>
  );
}