"use client";

import React from "react";
import { ShieldCheck, Lock, Landmark, FileCheck2, UserCheck, Scale } from "lucide-react";

const TRUST_FEATURES = [
  {
    icon: Lock,
    title: "256-Bit AES & TLS 1.3",
    description: "End-to-end encryption for all API transactions, account credentials, and disbursement payloads.",
  },
  {
    icon: Landmark,
    title: "CBK Sandbox Aligned",
    description: "Architected to adhere to Central Bank of Kenya digital credit regulatory frameworks and standards.",
  },
  {
    icon: FileCheck2,
    title: "Real-Time CRB Scoring",
    description: "Instant borrower validation via Metropol & TransUnion credit reference bureaus prior to facility drawdown.",
  },
  {
    icon: UserCheck,
    title: "Maker-Checker Controls",
    description: "Institutional separation of duties ensuring every drawdown, loan approval, and repayment has dual authorization.",
  },
  {
    icon: Scale,
    title: "KRA Tax Pin Verification",
    description: "Automated compliance checks against KRA registries to ensure corporate tax standing.",
  },
  {
    icon: ShieldCheck,
    title: "Immutable Audit Trails",
    description: "Tamper-evident system logs capturing every timestamped event for risk officers and external auditors.",
  },
];

export default function SecurityCompliance() {
  return (
    <section id="security" className="py-20 bg-gradient-to-b from-white via-[#F7F9FC] to-white border-b border-slate-200/80">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Bank-Grade Security &amp; Regulatory Compliance
          </h2>
          <p className="text-base text-[#64748B] mt-3">
            Engineered specifically for Tier-1 commercial banks, anchor corporations, and regulated financial ecosystems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRUST_FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-7 rounded-3xl bg-gradient-to-b from-white via-white to-slate-50/90 border border-slate-200/90 shadow-sm hover:shadow-[0_25px_60px_-12px_rgba(31,77,168,0.42),0_12px_24px_-8px_rgba(31,77,168,0.30)] hover:border-[#1F4DA8]/60 hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-[#1F4DA8] mb-5 shadow-2xs group-hover:scale-105 group-hover:bg-[#F58220] group-hover:border-[#F58220] group-hover:text-white transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#1E293B] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
