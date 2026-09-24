"use client";

import React from "react";
import { Building2, Factory, Truck } from "lucide-react";

const solutions = [
  {
    icon: Building2,
    title: "Banks",
    subtitle: "Lending Partners",
    description: "Automated credit assessment, portfolio management, and regulatory reporting.",
  },
  {
    icon: Factory,
    title: "Manufacturers",
    subtitle: "Product Partners",
    description: "Supply chain financing, distributor enablement, and sales acceleration.",
  },
  {
    icon: Truck,
    title: "Distributors",
    subtitle: "Sales Partners",
    description: "Working capital access, digital onboarding, and performance analytics.",
  },
];

export default function Solutions() {
  return (
    <section id="solutions" className="py-20 bg-gradient-to-b from-white via-[#F7F9FC] to-white border-b border-slate-200/80">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-[#1F4DA8] text-xs font-bold uppercase tracking-wider border border-blue-200/60 mb-3">
            Our Solutions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Core Solution Set
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-b from-white via-white to-slate-50/90 rounded-3xl border border-slate-200/90 p-8 flex flex-col items-center text-center gap-4 shadow-sm hover:shadow-[0_25px_60px_-12px_rgba(31,77,168,0.42),0_12px_24px_-8px_rgba(31,77,168,0.30)] hover:border-[#1F4DA8]/60 hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-[#1F4DA8] group-hover:scale-105 group-hover:bg-[#F58220] group-hover:border-[#F58220] group-hover:text-white transition-all duration-300 shadow-2xs">
                  <Icon className="w-8 h-8" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#1E293B]">{solution.title}</h4>
                  <p className="text-xs font-semibold text-[#1F4DA8] mt-1">{solution.subtitle}</p>
                </div>
                <p className="text-sm text-[#64748B] leading-relaxed text-center">{solution.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}