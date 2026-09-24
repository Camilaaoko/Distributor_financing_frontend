'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Building2,
  Landmark,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import type { RegionBankCoverage, RegionId } from '@/lib/geo/kenya-regions';
import { KENYA_REGIONS } from '@/lib/geo/kenya-regions';

interface KenyaBankDistributionMapProps {
  regions: RegionBankCoverage[];
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string | null) => void;
}

// Regional areas are intentionally illustrative, but share a single Kenya-shaped outline.
// Keeping the edges in common prevents gaps and the stretched, disconnected appearance that
// resulted from treating each region as an independent rectangle-like polygon.
// Regional SVG paths forming the authentic, recognizable geography of Kenya's 8 administrative regions.
// Shared internal boundaries ensure zero gaps or overlaps across regions.
const REGION_SVG_PATHS: Record<RegionId, { path: string; labelPos: { x: number; y: number } }> = {
  north_eastern: {
    // Mandera, Wajir and Garissa (Northeast horn & Somalia/Ethiopia borders)
    path: 'M 550,75 L 480,70 L 420,75 L 395,90 L 410,150 L 430,210 L 445,270 L 450,320 L 490,325 L 535,310 L 555,230 L 565,140 Z',
    labelPos: { x: 485, y: 195 },
  },
  eastern: {
    // Marsabit, Moyale down through Isiolo, Meru, Embu, Kitui, Machakos & Makueni
    path: 'M 395,90 L 340,80 L 285,75 L 280,140 L 290,210 L 285,270 L 270,310 L 305,315 L 320,345 L 305,380 L 275,395 L 265,415 L 285,425 L 330,470 L 390,420 L 450,320 L 445,270 L 430,210 L 410,150 Z',
    labelPos: { x: 355, y: 220 },
  },
  rift_valley: {
    // Turkana, West Pokot, Baringo, Laikipia, Nakuru, Narok and Kajiado
    path: 'M 170,60 L 230,55 L 285,75 L 280,140 L 290,210 L 285,270 L 270,310 L 245,335 L 240,375 L 260,395 L 245,410 L 265,415 L 285,425 L 330,470 L 240,470 L 175,440 L 170,390 L 195,360 L 180,315 L 165,270 L 150,210 L 145,140 Z',
    labelPos: { x: 215, y: 220 },
  },
  central: {
    // Mount Kenya heartland: Nyandarua, Nyeri, Kirinyaga, Murang'a, Kiambu
    path: 'M 270,310 L 305,315 L 320,345 L 305,380 L 275,395 L 260,395 L 240,375 L 245,335 Z',
    labelPos: { x: 275, y: 350 },
  },
  nairobi: {
    // Capital commercial & financial hub
    path: 'M 260,395 L 275,395 L 265,415 L 245,410 Z',
    labelPos: { x: 260, y: 405 },
  },
  coast: {
    // Indian Ocean Coastline: Lamu, Tana River, Kilifi, Mombasa, Kwale, Taita-Taveta
    path: 'M 450,320 L 490,325 L 535,310 L 520,355 L 490,410 L 465,465 L 440,515 L 415,555 L 375,510 L 330,470 L 390,420 Z',
    labelPos: { x: 440, y: 425 },
  },
  western: {
    // Bungoma, Busia, Kakamega, Vihiga
    path: 'M 165,270 L 125,275 L 115,315 L 110,340 L 155,345 L 195,360 L 180,315 Z',
    labelPos: { x: 145, y: 310 },
  },
  nyanza: {
    // Lake Victoria Basin: Siaya, Kisumu, Homa Bay, Migori, Kisii, Nyamira
    path: 'M 110,340 L 155,345 L 195,360 L 170,390 L 175,440 L 130,435 L 100,410 L 115,375 Z',
    labelPos: { x: 145, y: 395 },
  },
};

export function KenyaBankDistributionMap({
  regions,
  selectedRegionId,
  onSelectRegion,
}: KenyaBankDistributionMapProps) {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  const regionDataMap = new Map<string, RegionBankCoverage>();
  regions.forEach((r) => regionDataMap.set(r.regionId, r));

  const activeRegion = hoveredRegionId
    ? regionDataMap.get(hoveredRegionId)
    : selectedRegionId
    ? regionDataMap.get(selectedRegionId)
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-[#1F4DA8]">
              <Layers size={18} />
            </span>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Interactive Regional Bank Footprint Map
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual spatial distribution of partner banks and branch density across Kenya’s 8 economic regions.
          </p>
        </div>

        {selectedRegionId && (
          <button
            onClick={() => onSelectRegion(null)}
            className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
          >
            Clear Map Filter (Show All)
          </button>
        )}
      </div>

      {/* Map Layout & Live Region Telemetry Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Interactive Map */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative bg-gradient-to-b from-slate-50/70 to-blue-50/30 rounded-2xl border border-slate-100 p-4">
          <svg
            viewBox="80 35 510 540"
            className="w-full max-w-[480px] h-auto drop-shadow-sm select-none"
          >
            {/* Background Map Watermark Grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
              </pattern>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <rect x="80" y="35" width="510" height="540" fill="url(#grid)" opacity="0.6" rx="16" />

            {/* Render 8 Regional Polygons */}
            {(Object.keys(REGION_SVG_PATHS) as RegionId[]).map((rId) => {
              const rData = regionDataMap.get(rId);
              const { path, labelPos } = REGION_SVG_PATHS[rId];
              const isSelected = selectedRegionId === rId;
              const isHovered = hoveredRegionId === rId;
              const totalBr = rData?.totalBranches || 0;

              // Density color scale
              const fillColor = isSelected
                ? '#1F4DA8'
                : isHovered
                ? '#3A6FD8'
                : totalBr >= 10
                ? '#2563EB'
                : totalBr >= 5
                ? '#60A5FA'
                : totalBr >= 2
                ? '#93C5FD'
                : '#CBD5E1';

              const strokeColor = isSelected ? '#0F2C69' : isHovered ? '#1E40AF' : '#FFFFFF';
              const strokeWidth = isSelected ? 3.5 : isHovered ? 2.5 : 1.5;

              return (
                <g
                  key={rId}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredRegionId(rId)}
                  onMouseLeave={() => setHoveredRegionId(null)}
                  onClick={() => onSelectRegion(selectedRegionId === rId ? null : rId)}
                >
                  <path
                    d={path}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    className="transition-colors duration-200 hover:brightness-105"
                    filter={isSelected ? 'url(#glow)' : undefined}
                  />

                  {/* Region Marker Pin & Text */}
                  <circle
                    cx={labelPos.x}
                    cy={labelPos.y}
                    r={isSelected || isHovered ? 12 : 9}
                    fill={isSelected ? '#F58220' : '#FFFFFF'}
                    stroke="#1F4DA8"
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 3.5}
                    textAnchor="middle"
                    fontSize={isSelected || isHovered ? 10 : 8}
                    fontWeight="bold"
                    fill={isSelected ? '#FFFFFF' : '#1F4DA8'}
                    pointerEvents="none"
                  >
                    {totalBr}
                  </text>

                  {/* Region Code Tag */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 18}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill="#1E293B"
                    className="bg-white/80 select-none"
                    pointerEvents="none"
                  >
                    {KENYA_REGIONS[rId]?.shortCode}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-[11px] font-semibold text-slate-600 bg-white/90 px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#2563EB]" />
              <span>High Density (10+ Branches)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#60A5FA]" />
              <span>Moderate (5–9 Branches)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#93C5FD]" />
              <span>Developing (1–4 Branches)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#F58220]" />
              <span>Selected Region</span>
            </div>
          </div>
        </div>

        {/* Dynamic Regional Detail Panel */}
        <div className="lg:col-span-5 space-y-4">
          {activeRegion ? (
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                    {KENYA_REGIONS[activeRegion.regionId]?.shortCode} REGIONAL PROFILE
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {activeRegion.regionName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {KENYA_REGIONS[activeRegion.regionId]?.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-[#1F4DA8]">
                    {activeRegion.totalBranches}
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Branches</p>
                </div>
              </div>

              {/* Key Quick Stats */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-[11px] font-medium text-slate-400">Onboarded Banks</p>
                  <p className="text-base font-black text-slate-900 mt-0.5">
                    {activeRegion.bankCount} Partner Banks
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-[11px] font-medium text-slate-400">County Coverage</p>
                  <p className="text-base font-black text-emerald-600 mt-0.5">
                    {activeRegion.coveredCountyCount} / {activeRegion.countyCount} Counties
                  </p>
                </div>
              </div>

              {/* Active Banks List in Region */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Landmark size={14} className="text-[#1F4DA8]" />
                  Active Banks Operating in Region
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {activeRegion.activeBanks.map((b) => (
                    <div
                      key={b.bankCode}
                      className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{b.bankName}</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        {b.branchCount} br
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Economic Hubs */}
              {activeRegion.keyHubs.length > 0 && (
                <div className="pt-1 border-t border-slate-200">
                  <p className="text-[11px] text-slate-400 font-semibold">
                    Primary Branch Hubs:{' '}
                    <span className="text-slate-700 font-bold">
                      {activeRegion.keyHubs.join(' • ')}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center mx-auto">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Explore Kenyan Regions</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Hover over or click any region on the map to inspect bank institutions, active branch counts, and regional penetration.
                </p>
              </div>
            </div>
          )}

          {/* Regional Quick Selector Buttons */}
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quick Region Selector
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {regions.map((r) => {
                const isSelected = selectedRegionId === r.regionId;
                return (
                  <button
                    key={r.regionId}
                    onClick={() => onSelectRegion(isSelected ? null : r.regionId)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#1F4DA8] text-white border-[#1F4DA8] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{r.regionName}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {r.totalBranches}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
