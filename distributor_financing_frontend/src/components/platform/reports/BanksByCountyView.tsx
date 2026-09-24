'use client';

import React, { useState } from 'react';
import {
  Building2,
  Landmark,
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import type { CountyBankCoverage, RegionBankCoverage } from '@/lib/geo/kenya-regions';
import { KENYA_REGIONS } from '@/lib/geo/kenya-regions';

interface BanksByCountyViewProps {
  counties: CountyBankCoverage[];
  regions: RegionBankCoverage[];
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string | null) => void;
  onInspectCounty: (county: CountyBankCoverage) => void;
}

export function BanksByCountyView({
  counties,
  regions,
  selectedRegionId,
  onSelectRegion,
  onInspectCounty,
}: BanksByCountyViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>(selectedRegionId || 'ALL');
  const [bankFilter, setBankFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Unique bank codes across all counties
  const allBankCodes = Array.from(
    new Set(counties.flatMap((c) => c.activeBanks.map((b) => b.bankCode)))
  ).sort();

  // Filter logic
  const filteredCounties = counties.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.countyName.toLowerCase().includes(q) ||
      c.countyCode.includes(q) ||
      c.capitalCity.toLowerCase().includes(q) ||
      c.regionName.toLowerCase().includes(q) ||
      c.activeBanks.some((b) => b.bankName.toLowerCase().includes(q) || b.bankCode.toLowerCase().includes(q));

    const effectiveRegion = selectedRegionId || (regionFilter !== 'ALL' ? regionFilter : null);
    const matchesRegion = !effectiveRegion || c.regionId === effectiveRegion;

    const matchesBank = bankFilter === 'ALL' || c.activeBanks.some((b) => b.bankCode === bankFilter);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && c.status === 'ACTIVE') ||
      (statusFilter === 'GROWING' && c.status === 'GROWING') ||
      (statusFilter === 'PENDING' && c.status === 'PENDING');

    return matchesSearch && matchesRegion && matchesBank && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5">
      {/* Table Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark size={18} className="text-[#1F4DA8]" />
            Active Partner Banks per County (47 Counties)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time breakdown of partner bank presence, physical branch counts, and regional connectivity by county.
          </p>
        </div>

        {/* Global Search and Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search county, bank, city..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40"
            />
          </div>

          {/* Region Filter */}
          <select
            value={selectedRegionId || regionFilter}
            onChange={(e) => {
              const val = e.target.value;
              setRegionFilter(val);
              onSelectRegion(val === 'ALL' ? null : val);
            }}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40"
          >
            <option value="ALL">All Regions (8)</option>
            {regions.map((r) => (
              <option key={r.regionId} value={r.regionId}>
                {r.regionName}
              </option>
            ))}
          </select>

          {/* Bank Filter */}
          <select
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40"
          >
            <option value="ALL">All Banks ({allBankCodes.length})</option>
            {allBankCodes.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Coverage</option>
            <option value="GROWING">Growing Footprint</option>
            <option value="PENDING">Pending Setup</option>
          </select>
        </div>
      </div>

      {/* County Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[900px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">County Code & Name</th>
              <th className="px-4 py-3 text-left">Region</th>
              <th className="px-4 py-3 text-left">Primary Hub / Capital</th>
              <th className="px-4 py-3 text-left">Active Partner Banks</th>
              <th className="px-4 py-3 text-center">Active Banks</th>
              <th className="px-4 py-3 text-center">Branch Outlets</th>
              <th className="px-4 py-3 text-center">Density Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredCounties.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-1.5">
                    <Landmark size={28} className="text-slate-300" />
                    <p className="text-sm font-semibold text-slate-500">No counties found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search or region filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCounties.map((county) => (
                <tr key={county.countyCode} className="hover:bg-slate-50/80 transition-colors">
                  {/* County Name & Code */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#1F4DA8] font-bold flex items-center justify-center text-[10px] font-mono">
                        {county.countyCode}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{county.countyName} County</p>
                        <p className="text-[10px] text-slate-400 font-mono">Code: {county.countyCode}</p>
                      </div>
                    </div>
                  </td>

                  {/* Region */}
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-slate-700">{county.regionName}</span>
                  </td>

                  {/* Capital City */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-slate-600">
                      <MapPin size={12} className="text-slate-400" />
                      <span>{county.capitalCity}</span>
                    </div>
                  </td>

                  {/* Active Partner Banks (Pill Badges) */}
                  <td className="px-4 py-3.5">
                    {county.activeBanks.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {county.activeBanks.map((b) => (
                          <span
                            key={b.bankCode}
                            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 transition-colors rounded-md px-2 py-0.5 text-[11px] font-bold text-slate-800 border border-slate-200"
                            title={`${b.bankName} (${b.branchCount} branch outlets)`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{b.bankCode}</span>
                            <span className="text-blue-700 font-mono text-[10px]">({b.branchCount})</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No partner bank assigned</span>
                    )}
                  </td>

                  {/* Bank Count */}
                  <td className="px-4 py-3.5 text-center font-bold text-slate-900">
                    {county.bankCount > 0 ? (
                      <span className="text-slate-800 font-bold">{county.bankCount} Banks</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Branch Outlets */}
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-black ${
                        county.totalBranches >= 8
                          ? 'bg-blue-100 text-blue-800'
                          : county.totalBranches >= 2
                          ? 'bg-slate-100 text-slate-800'
                          : county.totalBranches === 1
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      {county.totalBranches} {county.totalBranches === 1 ? 'branch' : 'branches'}
                    </span>
                  </td>

                  {/* Density Status */}
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        county.densityLevel === 'HIGH'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : county.densityLevel === 'MODERATE'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {county.densityLevel}
                    </span>
                  </td>

                  {/* Action Button */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onInspectCounty(county)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F4DA8] bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      title={`View physical branches in ${county.countyName}`}
                    >
                      <Eye size={13} />
                      View Branches
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
        <p>
          Showing <span className="font-bold text-slate-800">{filteredCounties.length}</span> of 47 Kenyan Counties
        </p>
        <p className="text-[11px] text-slate-400">
          Click any county to inspect physical branch details and contact information.
        </p>
      </div>
    </div>
  );
}
