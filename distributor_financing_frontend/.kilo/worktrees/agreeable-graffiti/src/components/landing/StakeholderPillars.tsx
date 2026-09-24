"use client";

import React, { useState } from 'react';
import { Landmark, Factory, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PillarData {
  id: string;
  role: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  icon: typeof Landmark;
  highlights: string[];
  metrics: { label: string; value: string }[];
}

const PILLARS: PillarData[] = [
  {
    id: 'banks',
    role: 'Commercial Banks',
    badge: 'Capital Providers',
    badgeColor: 'bg-blue-50 text-[#1F4DA8] border-blue-200',
    title: 'Automated Risk Scoring & Direct Settlement',
    description: 'Deploy trade credit with zero non-performing loan risk through real-time invoice verification, CRB scoring, and closed-loop escrow.',
    icon: Landmark,
    highlights: [
      'Automated credit evaluation in < 15 minutes',
      'Direct disbursement to verified anchor manufacturers',
      'Continuous distributor off-take performance tracking',
      'Maker-Checker operational controls with full audit logs',
    ],
    metrics: [
      { label: 'Settlement Speed', value: '< 15m' },
      { label: 'Reconciliation', value: '100% Auto' },
    ],
  },
  {
    id: 'manufacturers',
    role: 'Anchor Manufacturers',
    badge: 'Supply Chain Leaders',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Real-Time Inventory Off-Take & Zero Credit Risk',
    description: 'Accelerate factory sales cycles and eliminate distributor receivables risk with bank-guaranteed immediate payment upon order dispatch.',
    icon: Factory,
    highlights: [
      'Eliminate trade credit receivables and default risk',
      'Accelerate distributor replenishment and order volume',
      'Seamless ERP integration (SAP, Oracle, NetSuite, APIs)',
      'Real-time visibility across nationwide distributor off-take',
    ],
    metrics: [
      { label: 'Receivables Risk', value: '0% Default' },
      { label: 'Sales Velocity', value: '+35% Avg' },
    ],
  },
  {
    id: 'distributors',
    role: 'Distributor Networks',
    badge: 'Network Partners',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    title: 'Collateral-Light Working Capital on Demand',
    description: 'Access revolving trade financing based on verified manufacturer relationship history without onerous collateral or delayed approvals.',
    icon: Truck,
    highlights: [
      'Instant drawdown on approved manufacturer purchase orders',
      'Zero physical paperwork with automated digital consent',
      'Flexible revolving credit facility that scales with turnover',
      'Automatic repayment synchronization upon inventory liquidation',
    ],
    metrics: [
      { label: 'Collateral', value: 'PO-Backed' },
      { label: 'Drawdown SLA', value: 'Instant' },
    ],
  },
];

export function StakeholderPillars() {
  const [activeTab, setActiveTab] = useState<string>('banks');
  const activePillar = PILLARS.find((p) => p.id === activeTab) || PILLARS[0];
  const Icon = activePillar.icon;

  return (
    <section
      id="solutions"
      className="py-20 bg-gradient-to-b from-[#F7F9FC] via-white to-[#F7F9FC] border-b border-slate-200/80"
      aria-labelledby="pillars-heading"
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 id="pillars-heading" className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Purpose-Built for Every Value Chain Stakeholder
          </h2>
          <p className="text-base text-[#64748B] mt-3">
            Creating a unified trade financing loop where banks safely deploy capital, manufacturers accelerate off-take, and distributors scale inventory.
          </p>

          {/* Stakeholder Pill Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {PILLARS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveTab(p.id)}
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all border ${
                  activeTab === p.id
                    ? 'bg-[#1F4DA8] text-white border-[#1F4DA8] shadow-md -translate-y-0.5'
                    : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {p.role}
              </button>
            ))}
          </div>
        </div>

        {/* Active Pillar Featured Showcase with Glassmorphic Elevation */}
        <div className="bg-gradient-to-b from-white via-white to-slate-50/90 rounded-3xl border border-slate-200/90 shadow-2xl hover:shadow-[0_30px_70px_-15px_rgba(31,77,168,0.30)] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center transition-all duration-300 group">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50/80 border border-blue-100 text-[#1F4DA8] flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:bg-[#F58220] group-hover:border-[#F58220] group-hover:text-white transition-all duration-300">
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border mb-1 ${activePillar.badgeColor}`}>
                  {activePillar.badge}
                </span>
                <h3 className="text-2xl font-bold text-[#1E293B]">{activePillar.role}</h3>
              </div>
            </div>

            <h4 className="text-xl sm:text-2xl font-bold text-[#1E293B] leading-snug">
              {activePillar.title}
            </h4>

            <p className="text-[#64748B] text-base leading-relaxed">
              {activePillar.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {activePillar.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#1F4DA8] hover:text-[#3A6FD8] group/link transition-colors"
              >
                <span>Learn how our platform enables {activePillar.role}</span>
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-slate-100/80 rounded-2xl border border-slate-200/90 p-8 space-y-6 shadow-inner">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Key Value Drivers for {activePillar.role}
            </h5>

            <div className="grid grid-cols-2 gap-4">
              {activePillar.metrics.map((m, i) => (
                <div
                  key={i}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-[0_20px_45px_-10px_rgba(31,77,168,0.35)] hover:border-[#1F4DA8]/60 hover:-translate-y-1 transition-all"
                >
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#1F4DA8]">{m.value}</div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-100 text-xs text-[#1F4DA8] leading-relaxed">
              <strong>Enterprise Integration SLA:</strong> Connect existing core banking or ERP data streams with standardized REST APIs and webhooks.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}