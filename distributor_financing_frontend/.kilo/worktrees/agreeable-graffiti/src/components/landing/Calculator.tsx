"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calculator as CalcIcon, ArrowRight, CheckCircle2, TrendingUp, Clock, ShieldCheck } from "lucide-react";

export default function Calculator() {
  const [turnoverMillions, setTurnoverMillions] = useState<number>(25);
  const [financingRatio, setFinancingRatio] = useState<number>(80);

  const totalTurnover = turnoverMillions * 1_000_000;
  const unlockedCapital = totalTurnover * (financingRatio / 100);
  const annualSavings = (unlockedCapital * 0.045); // estimated ~4.5% efficiency savings on working capital

  const formatKes = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section id="calculator" className="py-20 bg-gradient-to-b from-[#F7F9FC] via-white to-[#F7F9FC] border-b border-slate-200/80">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Estimate Your Unlocked Working Capital
          </h2>
          <p className="text-base text-[#64748B] mt-3">
            Calculate instant liquidity potential and cash conversion acceleration for your distributor network.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-gradient-to-b from-white via-white to-slate-50/90 rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Controls Column */}
          <div className="lg:col-span-7 p-8 sm:p-10 space-y-8">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-800">
                  Monthly Inventory / Order Volume
                </label>
                <span className="text-base font-extrabold text-[#1F4DA8]">
                  KES {turnoverMillions}M / month
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="150"
                step="1"
                value={turnoverMillions}
                onChange={(e) => setTurnoverMillions(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1F4DA8]"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-1">
                <span>KES 2M</span>
                <span>KES 75M</span>
                <span>KES 150M+</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-800">
                  Target Facility Advance Ratio
                </label>
                <span className="text-base font-extrabold text-[#F58220]">
                  {financingRatio}% Advance
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[70, 80, 90].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setFinancingRatio(ratio)}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                      financingRatio === ratio
                        ? "bg-[#1F4DA8] text-white border-[#1F4DA8] shadow-md -translate-y-0.5"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs"
                    }`}
                  >
                    {ratio}% Ratio
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero collateral requirement on verified manufacturer POs</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Automated repayment sync upon distributor inventory liquidation</span>
              </div>
            </div>
          </div>

          {/* Result Card Column with Deep Multi-Stop Gradient */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#1F4DA8] via-[#163b82] to-[#0d2350] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-inner">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div>
                <span className="text-xs font-semibold text-white/75 uppercase tracking-wider block">
                  Estimated Unlocked Capital
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                  {formatKes(unlockedCapital)}
                </div>
                <span className="text-[11px] text-white/60 block mt-1">
                  Monthly revolving credit line capacity
                </span>
              </div>

              <div className="space-y-3.5 pt-4 border-t border-white/15">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/80 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F58220]" />
                    Disbursement SLA
                  </span>
                  <span className="text-xs font-bold text-white">&lt; 15 Minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/80 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Estimated Annual Savings
                  </span>
                  <span className="text-xs font-bold text-emerald-300">~{formatKes(annualSavings)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/80 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F58220]" />
                    Settlement Security
                  </span>
                  <span className="text-xs font-bold text-white">Closed-Loop Escrow</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6">
              <Link
                href="#contact"
                className="w-full py-3.5 px-6 rounded-xl bg-[#F58220] hover:bg-[#e07316] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span>Request Facility Terms</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
