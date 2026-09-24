"use client";

import React from "react";
import { FileCheck, ShieldCheck, Banknote } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Invoice & PO Sync",
    subtitle: "Real-Time Enterprise Integration",
    description: "Anchor manufacturers issue approved purchase orders or supply invoices directly through integrated ERP / API connectors.",
    icon: FileCheck,
    badge: "Order Verified",
    badgeColor: "bg-blue-50 text-[#1F4DA8] border-blue-200",
  },
  {
    step: "02",
    title: "Automated Risk Scoring",
    subtitle: "Sub-Second Credit Assessment",
    description: "Multi-tier risk algorithms evaluate distributor off-take velocity, CRB credit profile, and existing bank revolving limits in seconds.",
    icon: ShieldCheck,
    badge: "KYC & Limit Check",
    badgeColor: "bg-blue-50 text-[#1F4DA8] border-blue-200",
  },
  {
    step: "03",
    title: "Direct Escrow Settlement",
    subtitle: "Instant Capital Disbursement",
    description: "The financing bank settles funds directly to the anchor manufacturer on behalf of the distributor, ensuring 100% purposeful utilization.",
    icon: Banknote,
    badge: "Disbursed in Under 15 Mins",
    badgeColor: "bg-blue-50 text-[#1F4DA8] border-blue-200",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-white via-[#F7F9FC] to-white border-b border-slate-200/80">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            How Value Chain Financing Works in 3 Steps
          </h2>
          <p className="text-base text-[#64748B] mt-3">
            A closed-loop, automated settlement pipeline connecting commercial banks, tier-1 manufacturers, and nationwide distributors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative bg-gradient-to-b from-white via-white to-slate-50/90 rounded-3xl border border-slate-200/90 p-8 flex flex-col justify-between shadow-sm hover:shadow-[0_25px_60px_-12px_rgba(31,77,168,0.42),0_12px_24px_-8px_rgba(31,77,168,0.30)] hover:border-[#1F4DA8]/60 hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div>
                  <div className="mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50/80 border border-blue-100 shadow-2xs flex items-center justify-center text-[#1F4DA8] group-hover:scale-105 group-hover:bg-[#F58220] group-hover:border-[#F58220] group-hover:text-white transition-all duration-300">
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>

                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg border mb-3 ${s.badgeColor}`}>
                    {s.badge}
                  </span>

                  <h3 className="text-xl font-bold text-[#1E293B] mb-1">
                    {s.title}
                  </h3>
                  <div className="text-xs font-semibold text-[#1F4DA8] mb-3">
                    {s.subtitle}
                  </div>
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
