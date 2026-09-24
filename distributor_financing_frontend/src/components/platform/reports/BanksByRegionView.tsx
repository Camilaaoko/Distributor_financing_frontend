'use client';

import React from 'react';
import {
  Building2,
  Landmark,
  MapPin,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Layers,
  ArrowRight,
} from 'lucide-react';
import type { RegionBankCoverage, RegionId } from '@/lib/geo/kenya-regions';
import { KENYA_REGIONS } from '@/lib/geo/kenya-regions';

interface BanksByRegionViewProps {
  regions: RegionBankCoverage[];
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string | null) => void;
  onInspectRegion: (region: RegionBankCoverage) => void;
}

export function BanksByRegionView({
  regions,
  selectedRegionId,
  onSelectRegion,
  onInspectRegion,
}: BanksByRegionViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers size={18} className="text-[#1F4DA8]" />
            Onboarded Partner Banks by Region
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown of institutional partner presence, county footprint, and physical branch distribution across Kenya.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-400">
          Showing 8 Administrative Regions
        </span>
      </div>

      {/* Regional Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {regions.map((region) => {
          const isSelected = selectedRegionId === region.regionId;
          const regInfo = KENYA_REGIONS[region.regionId as RegionId];
          const coveragePct = Math.round((region.coveredCountyCount / Math.max(1, region.countyCount)) * 100);

          return (
            <div
              key={region.regionId}
              className={`bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md cursor-pointer ${
                isSelected
                  ? 'border-[#1F4DA8] ring-2 ring-[#1F4DA8]/20 bg-blue-50/20'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
              onClick={() => onSelectRegion(isSelected ? null : region.regionId)}
            >
              {/* Region Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-slate-100 text-slate-700 uppercase">
                      {regInfo?.shortCode || 'REG'}
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-1">
                      {region.regionName}
                    </h4>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      region.densityLevel === 'HIGH'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : region.densityLevel === 'MODERATE'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {region.densityLevel}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {regInfo?.description}
                </p>
              </div>

              {/* Key Counts */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Branches</p>
                  <p className="text-lg font-black text-[#1F4DA8] mt-0.5">{region.totalBranches}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Banks</p>
                  <p className="text-lg font-black text-slate-800 mt-0.5">{region.bankCount}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Coverage</p>
                  <p className="text-lg font-black text-emerald-600 mt-0.5">{coveragePct}%</p>
                </div>
              </div>

              {/* Active Bank Badges */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Partner Banks
                </p>
                <div className="flex flex-wrap gap-1">
                  {region.activeBanks.slice(0, 5).map((b) => (
                    <span
                      key={b.bankCode}
                      className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-700"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {b.bankCode}
                      <span className="text-blue-600 font-mono">({b.branchCount})</span>
                    </span>
                  ))}
                  {region.activeBanks.length > 5 && (
                    <span className="text-[10px] font-bold text-slate-400 self-center">
                      +{region.activeBanks.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspectRegion(region);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1 text-xs font-bold text-[#1F4DA8] bg-blue-50 hover:bg-blue-100 rounded-xl py-2 transition-colors cursor-pointer"
                >
                  <span>Inspect Region Details</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
