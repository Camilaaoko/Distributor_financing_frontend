'use client';

import React, { useState } from 'react';
import { FileBarChart2, Download, CheckCircle2, BarChart3, Layers } from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { ManufacturerHeader } from '@/components/dashboard/ManufacturerHeader';
import { PortfolioPerformanceView } from '@/components/reports/PortfolioPerformanceView';
import { useAuth } from '@/hooks/useAuth';

export default function ManufacturerReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'export'>('analytics');
  const [reportType, setReportType] = useState('Referral Conversion Report');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-08-07');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`Report "${reportType}" successfully generated and downloaded!`);
    }, 1000);
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
      <ManufacturerHeader
        title="Reports &amp; Portfolio Analytics"
        subtitle="Track your anchor financing portfolio, distributor repayments, and generate operational statements."
      />

      {/* Sub-navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 size={16} />
          Anchor Portfolio Performance
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'export'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileBarChart2 size={16} />
          Export Operational Reports
        </button>
      </div>

      {activeTab === 'analytics' ? (
        <PortfolioPerformanceView
          manufacturerId={user?.manufacturerId || 'mfr-eabl'}
          userRole={user?.role || 'MANUFACTURER_ADMIN'}
          title="Anchor Portfolio Performance"
          subtitle="Real-time repayment velocity, collection efficiency, and PAR 30/60/90 metrics for your distributor network."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white border-slate-200/80 shadow-xs rounded-xl p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileBarChart2 className="w-5 h-5 text-blue-700" /> Export Operational Reports
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800 cursor-pointer"
                >
                  <option>Referral Conversion Report</option>
                  <option>Disbursement &amp; Drawdown Summary</option>
                  <option>Distributor Credit Profile &amp; Limit Utilisation</option>
                  <option>Invoicing &amp; Repayment Statement</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg text-[11px] text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" /> Excel &amp; CSV Export Standard:
                </p>
                <p className="leading-relaxed">
                  Exports formatted data tables complete with distributor registration identifiers, timestamped consent references, and transaction values.
                </p>
              </div>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Generating Export...' : 'Export Report (.csv / .xlsx)'}
              </button>
            </div>
          </Card>

          <Card className="bg-white border-slate-200/80 shadow-xs rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Recent Exports</h3>

            <div className="space-y-3 text-xs">
              {[
                { name: 'Referral Conversion Jul 2026.csv', size: '1.2 MB', date: 'Aug 01, 2026' },
                { name: 'Drawdown Summary Q2.csv', size: '3.4 MB', date: 'Jul 15, 2026' },
                { name: 'Invoicing Statement Jun 2026.csv', size: '850 KB', date: 'Jul 01, 2026' },
              ].map((file, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{file.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{file.date} • {file.size}</div>
                  </div>
                  <button className="p-1.5 text-blue-700 hover:bg-blue-50 rounded cursor-pointer" title="Re-download">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}