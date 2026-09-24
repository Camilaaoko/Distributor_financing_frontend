'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Building2,
  Landmark,
  Layers,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Globe2,
  PieChart,
} from 'lucide-react';
import {
  geoReportsService,
  type GeoReportData,
} from '@/services/geo-reports.service';
import {
  type RegionBankCoverage,
  type CountyBankCoverage,
  type BankBranchRecord,
} from '@/lib/geo/kenya-regions';
import { KenyaBankDistributionMap } from '@/components/platform/reports/KenyaBankDistributionMap';
import { BanksByRegionView } from '@/components/platform/reports/BanksByRegionView';
import { BanksByCountyView } from '@/components/platform/reports/BanksByCountyView';
import { CountyBranchesModal } from '@/components/platform/reports/CountyBranchesModal';
import { useToast } from '@/components/ui/Toast';

type TabView = 'map_regions' | 'counties' | 'matrix';

export default function PlatformReportsPage() {
  const toast = useToast();

  const [reportData, setReportData] = useState<GeoReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabView>('map_regions');
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  // Modal inspection
  const [inspectCounty, setInspectCounty] = useState<CountyBankCoverage | null>(null);
  const [isCountyModalOpen, setIsCountyModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await geoReportsService.getGeographicDistributionData();
      setReportData(data);
    } catch (err) {
      toast.error('Failed to load geographic bank distribution data.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInspectCounty = (county: CountyBankCoverage) => {
    setInspectCounty(county);
    setIsCountyModalOpen(true);
  };

  const handleInspectRegion = (region: RegionBankCoverage) => {
    // Find all branches in that region and package as a pseudo-county or switch filter
    setSelectedRegionId(region.regionId);
    setActiveTab('counties');
  };

  const handleExportRegions = async () => {
    if (!reportData?.regions) return;
    try {
      await geoReportsService.exportRegionalCoverageCsv(reportData.regions);
      toast.success('Regional Bank Coverage Report downloaded.');
    } catch (err) {
      toast.error('Failed to export regional report.');
    }
  };

  const handleExportCounties = async () => {
    if (!reportData?.counties) return;
    try {
      await geoReportsService.exportCountyCoverageCsv(reportData.counties);
      toast.success('County Active Banks Report downloaded.');
    } catch (err) {
      toast.error('Failed to export county report.');
    }
  };

  const metrics = reportData?.metrics;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Platform Geographic Intelligence
            </span>
            <span className="text-xs font-semibold text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Kenyan Banking Footprint</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mt-1">
            <Globe2 className="w-7 h-7 text-[#1F4DA8]" />
            Bank Network &amp; Geographic Distribution Report
          </h1>

          <p className="text-sm text-slate-500 mt-0.5">
            Real-time visual map and directory of onboarded partner banks, regional penetration, and active branch networks across Kenyan counties.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={handleExportRegions}
            disabled={isLoading || !reportData}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            Export Regions (CSV)
          </button>

          <button
            onClick={handleExportCounties}
            disabled={isLoading || !reportData}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1F4DA8] hover:bg-[#3A6FD8] rounded-xl px-3.5 py-2.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            Export Counties (CSV)
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Onboarded Banks */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-[#1F4DA8] rounded-xl">
            <Landmark size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Onboarded Banks</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {metrics ? metrics.totalBanks : '—'} <span className="text-xs font-semibold text-slate-400">Institutions</span>
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Commercial &amp; Tier 1</p>
          </div>
        </div>

        {/* Total Branches */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Branches</p>
            <p className="text-xl font-black text-indigo-600 mt-0.5">
              {metrics ? metrics.totalBranches : '—'} <span className="text-xs font-semibold text-slate-400">Outlets</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Physical Bank Network</p>
          </div>
        </div>

        {/* Regional Coverage */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Regional Footprint</p>
            <p className="text-xl font-black text-emerald-600 mt-0.5">
              {metrics ? `${metrics.activeRegions} / ${metrics.totalRegions}` : '—'}{' '}
              <span className="text-xs font-semibold text-slate-400">Regions</span>
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">100% Regional Presence</p>
          </div>
        </div>

        {/* Counties with Active Banks */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <MapPin size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">County Coverage</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {metrics ? `${metrics.activeCounties} / ${metrics.totalCounties}` : '—'}{' '}
              <span className="text-xs font-semibold text-slate-400">Counties</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Active Banking Outlets</p>
          </div>
        </div>

        {/* Leading Bank Footprint */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Leading Footprint</p>
            <p className="text-sm font-black text-purple-900 truncate max-w-[140px] mt-0.5">
              {metrics ? metrics.leadingBankName : '—'}
            </p>
            <p className="text-[11px] text-purple-700 font-semibold mt-0.5">
              {metrics ? `${metrics.leadingBankBranches} branches` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Main View Mode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('map_regions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'map_regions'
                ? 'bg-[#1F4DA8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe2 size={15} />
            Interactive Map &amp; Regional Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('counties')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'counties'
                ? 'bg-[#1F4DA8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin size={15} />
            Active Banks per County (47 Counties)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-[#1F4DA8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers size={15} />
            All Regions Directory
          </button>
        </div>

        {selectedRegionId && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Filter applied:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              {reportData?.regions.find((r) => r.regionId === selectedRegionId)?.regionName}
            </span>
            <button
              onClick={() => setSelectedRegionId(null)}
              className="text-slate-400 hover:text-slate-700 font-bold ml-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="inline-block animate-spin text-[#1F4DA8]">
            <RefreshCw size={32} />
          </div>
          <p className="text-sm font-semibold text-slate-700">Aggregating Geographic Bank Distribution...</p>
          <p className="text-xs text-slate-400">Mapping partner banks and branch outlets across all 47 Kenyan counties.</p>
        </div>
      ) : reportData ? (
        <>
          {/* Tab 1: Interactive Map & Regional Cards */}
          {activeTab === 'map_regions' && (
            <div className="space-y-6">
              <KenyaBankDistributionMap
                regions={reportData.regions}
                selectedRegionId={selectedRegionId}
                onSelectRegion={setSelectedRegionId}
              />

              <BanksByRegionView
                regions={reportData.regions}
                selectedRegionId={selectedRegionId}
                onSelectRegion={setSelectedRegionId}
                onInspectRegion={handleInspectRegion}
              />
            </div>
          )}

          {/* Tab 2: Active Banks per County */}
          {activeTab === 'counties' && (
            <BanksByCountyView
              counties={reportData.counties}
              regions={reportData.regions}
              selectedRegionId={selectedRegionId}
              onSelectRegion={setSelectedRegionId}
              onInspectCounty={handleInspectCounty}
            />
          )}

          {/* Tab 3: Complete Regional Matrix */}
          {activeTab === 'matrix' && (
            <div className="space-y-6">
              <BanksByRegionView
                regions={reportData.regions}
                selectedRegionId={selectedRegionId}
                onSelectRegion={setSelectedRegionId}
                onInspectRegion={handleInspectRegion}
              />

              <BanksByCountyView
                counties={reportData.counties}
                regions={reportData.regions}
                selectedRegionId={selectedRegionId}
                onSelectRegion={setSelectedRegionId}
                onInspectCounty={handleInspectCounty}
              />
            </div>
          )}
        </>
      ) : null}

      {/* Branch Inspection Modal */}
      <CountyBranchesModal
        county={inspectCounty}
        open={isCountyModalOpen}
        onClose={() => {
          setIsCountyModalOpen(false);
          setInspectCounty(null);
        }}
      />
    </div>
  );
}