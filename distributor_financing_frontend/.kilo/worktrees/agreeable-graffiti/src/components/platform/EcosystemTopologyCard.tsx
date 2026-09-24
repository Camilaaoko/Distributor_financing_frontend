'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Landmark,
  Factory,
  Building2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  bankOnboardingApi,
  manufacturerApi,
  distributorApi,
} from '@/services/onboarding-api.service';
import type {
  BankResponse,
  ManufacturerResponse,
  DistributorResponse,
} from '@/types/onboarding';

export function EcosystemTopologyCard() {
  const [banks, setBanks] = useState<BankResponse[]>([]);
  const [manufacturers, setManufacturers] = useState<ManufacturerResponse[]>([]);
  const [distributors, setDistributors] = useState<DistributorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchTopology() {
      setIsLoading(true);
      try {
        const [banksRes, mfgsRes, distsRes] = await Promise.all([
          bankOnboardingApi.getBanksByStatus().catch(() => []),
          manufacturerApi.getManufacturers().catch(() => []),
          distributorApi.getDistributors().catch(() => []),
        ]);

        if (!cancelled) {
          const safeBanks = Array.isArray(banksRes) ? banksRes : [];
          const safeMfgs = Array.isArray(mfgsRes) ? mfgsRes : [];
          const safeDists = Array.isArray(distsRes) ? distsRes : [];

          setBanks(safeBanks);
          setManufacturers(safeMfgs);
          setDistributors(safeDists);
        }
      } catch {
        if (!cancelled) {
          setBanks([]);
          setManufacturers([]);
          setDistributors([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchTopology();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-slate-100 rounded-md animate-pulse" />
            <div className="h-3.5 w-72 bg-slate-100 rounded-md animate-pulse" />
          </div>
          <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse p-4 space-y-3">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-8 w-16 bg-slate-200 rounded" />
              <div className="h-3 w-36 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeBanksCount = banks.filter((b) => (b.status as string)?.toUpperCase() === 'ACTIVE').length;
  const activeManufacturersCount = manufacturers.filter((m) => (m.status as string)?.toUpperCase() === 'ACTIVE').length;
  const activeDistributorsCount = distributors.filter((d) => (d.status as string)?.toUpperCase() === 'ACTIVE').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#1F4DA8]/10 text-[#1F4DA8] flex items-center justify-center">
              <Layers size={16} />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Multi-Tenant Value Chain Topology
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end multi-tenant connectivity across liquidity providers, corporate anchors, and commercial distributors.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 self-start sm:self-auto">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Isolation Active
        </span>
      </div>

      {/* 3-Stage Connected Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {/* Tier 1: Liquidity Providers */}
        <Link
          href="/platform/banks"
          className="group relative bg-gradient-to-br from-blue-50/70 via-white to-blue-50/30 rounded-2xl border border-blue-200/70 p-5 hover:border-[#1F4DA8] hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-[#1F4DA8] text-white flex items-center justify-center shadow-xs">
              <Landmark size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1F4DA8]/10 text-[#1F4DA8]">
              Tier 1: Liquidity
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500">Partner Financial Institutions</div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {banks.length}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-blue-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              <strong className="text-emerald-600 font-bold">{activeBanksCount}</strong> Active Providers
            </span>
            <span className="text-[#1F4DA8] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Manage <ArrowRight size={12} />
            </span>
          </div>
        </Link>

        {/* Tier 2: Anchor Manufacturers */}
        <Link
          href="/platform/manufacturers"
          className="group relative bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 rounded-2xl border border-amber-200/70 p-5 hover:border-amber-500 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Factory size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700">
              Tier 2: Anchors
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500">Anchor Manufacturers</div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {manufacturers.length}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-amber-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              <strong className="text-amber-700 font-bold">{activeManufacturersCount}</strong> Verified Anchors
            </span>
            <span className="text-amber-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Manage <ArrowRight size={12} />
            </span>
          </div>
        </Link>

        {/* Tier 3: Distribution Network */}
        <Link
          href="/platform/distributors"
          className="group relative bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/30 rounded-2xl border border-indigo-200/70 p-5 hover:border-indigo-600 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Building2 size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600/10 text-indigo-700">
              Tier 3: Network
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500">Commercial Distributors</div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {distributors.length}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-indigo-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              <strong className="text-indigo-600 font-bold">{activeDistributorsCount}</strong> Qualified Dealers
            </span>
            <span className="text-indigo-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Manage <ArrowRight size={12} />
            </span>
          </div>
        </Link>
      </div>

      {/* Institutional Relationship Mapping */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#1F4DA8]" />
            Multi-Tenant Bank & Anchor Mapping
          </div>
          <Link
            href="/platform/banks"
            className="text-xs text-[#1F4DA8] hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            All Partner Banks <ChevronRight size={14} />
          </Link>
        </div>

        {banks.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
            <Landmark size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-700">No partner banks onboarded yet</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Start by onboarding financial institutions to establish credit facilities for anchor supply chains.
            </p>
            <Link
              href="/platform/banks"
              className="inline-flex items-center gap-1.5 mt-3.5 px-3.5 py-1.5 bg-[#1F4DA8] text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-[#1A3F8A] transition-colors"
            >
              + Onboard First Bank
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {banks.map((bank) => {
              const bankMfgs = manufacturers.filter(
                (m) => m.bankId === bank.id || (m as any).bankName === bank.name
              );
              const totalBankDistributors = distributors.filter(
                (d) => d.bankId === bank.id || bankMfgs.some((m) => m.id === d.manufacturerId)
              ).length;

              return (
                <div
                  key={bank.id}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 transition-all hover:bg-white hover:border-slate-300 hover:shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-100 text-[#1F4DA8] flex items-center justify-center font-bold text-xs shrink-0">
                        <Landmark size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{bank.name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              (bank.status as string)?.toUpperCase() === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {bank.status || 'Active'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>Branch: <strong>{bank.branch || bank.branchCode || 'Main'}</strong></span>
                          <span>•</span>
                          <span>Code: <strong>{bank.bankCode || 'BNK'}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200/70 shadow-2xs">
                        <span className="text-slate-500">Anchor Manufacturers: </span>
                        <strong className="text-slate-900 font-bold">{bankMfgs.length}</strong>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200/70 shadow-2xs">
                        <span className="text-slate-500">Connected Dealers: </span>
                        <strong className="text-indigo-600 font-bold">{totalBankDistributors}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Connected Manufacturers Mini Strip */}
                  {bankMfgs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                        <Factory size={12} className="text-amber-500" /> Anchors:
                      </span>
                      {bankMfgs.slice(0, 4).map((m) => {
                        const mfgDists = distributors.filter((d) => d.manufacturerId === m.id).length;
                        return (
                          <span
                            key={m.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            {m.name}
                            <span className="text-[10px] text-slate-400 font-semibold">({mfgDists} dealers)</span>
                          </span>
                        );
                      })}
                      {bankMfgs.length > 4 && (
                        <span className="text-xs font-semibold text-[#1F4DA8]">
                          +{bankMfgs.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}