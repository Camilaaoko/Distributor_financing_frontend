"use client";

import React from "react";
import Image from "next/image";
import { assetPath } from "@/lib/assets";

interface PartnerLogoItem {
  id: string;
  name: string;
  category: "Commercial Bank" | "Anchor Manufacturer" | "Payment Network" | "Enterprise";
  badgeColor: string;
  imageSrc: string;
}

const ECOSYSTEM_PARTNERS: PartnerLogoItem[] = [
  {
    id: "kcb",
    name: "KCB Bank",
    category: "Commercial Bank",
    badgeColor: "bg-blue-50 text-[#1F4DA8] border-blue-200",
    imageSrc: assetPath("/images/kcb-bank.png"),
  },
  {
    id: "bamburi",
    name: "Bamburi Cement",
    category: "Anchor Manufacturer",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    imageSrc: assetPath("/images/bamburi.png"),
  },
  {
    id: "equity",
    name: "Equity Bank",
    category: "Commercial Bank",
    badgeColor: "bg-blue-50 text-[#1F4DA8] border-blue-200",
    imageSrc: assetPath("/images/equity-bank-logo.png"),
  },
  {
    id: "coke",
    name: "Coca-Cola Beverages",
    category: "Anchor Manufacturer",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    imageSrc: assetPath("/images/Coca-Cola_logo.svg.webp"),
  },
  {
    id: "absa",
    name: "Absa Bank Kenya",
    category: "Commercial Bank",
    badgeColor: "bg-blue-50 text-[#1F4DA8] border-blue-200",
    imageSrc: assetPath("/images/absa-logo-bg.png"),
  },
  {
    id: "galana",
    name: "Galana Oil",
    category: "Anchor Manufacturer",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    imageSrc: assetPath("/images/galana.png"),
  },
  {
    id: "ncba",
    name: "NCBA Bank",
    category: "Commercial Bank",
    badgeColor: "bg-blue-50 text-[#1F4DA8] border-blue-200",
    imageSrc: assetPath("/images/ncba-logo-dark.svg"),
  },
  {
    id: "kapa",
    name: "Kapa Oil Refineries",
    category: "Anchor Manufacturer",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    imageSrc: assetPath("/images/Kapa-Oil-Refineries-Limited-logo.webp"),
  },
  {
    id: "safaricom",
    name: "Safaricom Enterprise",
    category: "Enterprise",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    imageSrc: assetPath("/images/safaricom-25.gif"),
  },
  {
    id: "visa",
    name: "Visa Direct",
    category: "Payment Network",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    imageSrc: assetPath("/images/visa.png"),
  },
  {
    id: "coop",
    name: "Co-operative Bank",
    category: "Commercial Bank",
    badgeColor: "bg-blue-50 text-[#1F4DA8] border-blue-200",
    imageSrc: assetPath("/images/Coop-Logo-02-1.png"),
  },
  {
    id: "kpc",
    name: "Kenya Pipeline (KPC)",
    category: "Enterprise",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    imageSrc: assetPath("/images/kpc-plc.jpg"),
  },
  {
    id: "coke-company",
    name: "The Coca-Cola Company",
    category: "Anchor Manufacturer",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    imageSrc: assetPath("/images/Coke-company-logo-black.svg"),
  },
  {
    id: "imb",
    name: "I&M Bank",
    category: "Commercial Bank",
    badgeColor: "bg-blue-50 text-[#1F4DA8] border-blue-200",
    imageSrc: assetPath("/images/im-logo.png"),
  },
  {
    id: "family",
    name: "Family Bank",
    category: "Commercial Bank",
    badgeColor: "bg-blue-50 text-[#1F4DA8] border-blue-200",
    imageSrc: assetPath("/images/family-bank-40-logo.jpg"),
  },
  {
    id: "mastercard",
    name: "Mastercard",
    category: "Payment Network",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    imageSrc: assetPath("/images/mastercard.webp"),
  },
];

function PartnerCard({ partner }: { partner: PartnerLogoItem }) {
  return (
    <div
      className="flex items-center gap-4 px-6 py-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#1F4DA8]/50 hover:-translate-y-0.5 transition-all duration-300 shrink-0 min-w-[280px] max-w-[320px]"
      role="listitem"
    >
      <div className="w-16 h-12 rounded-xl bg-slate-50 border border-slate-100 p-1.5 flex items-center justify-center shrink-0">
        <Image
          src={partner.imageSrc}
          alt={partner.name}
          width={52}
          height={38}
          className="max-h-9 w-auto object-contain"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-slate-900 truncate">{partner.name}</div>
        <span
          className={`inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full border mt-1 ${partner.badgeColor}`}
        >
          {partner.category}
        </span>
      </div>
    </div>
  );
}

export function EcosystemMarquee() {
  return (
    <section
      id="ecosystem"
      className="py-14 md:py-20 bg-gradient-to-b from-[#F7F9FC] via-white to-[#F7F9FC] border-y border-slate-200/80 overflow-hidden relative"
      aria-labelledby="ecosystem-heading"
    >
      <div className="max-w-[1280px] mx-auto px-6 mb-10 text-center">
        <h2 id="ecosystem-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E293B] tracking-tight">
          Built for Kenya&apos;s Financial &amp; Distribution Ecosystem
        </h2>
        <p className="text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto mt-2">
          Powering verified invoice off-take, automated risk underwriting, and instant liquidity across nationwide trade networks.
        </p>
      </div>

      {/* Single Continuous Seamless Infinite Carousel with Side Gradient Masks */}
      <div className="relative w-full overflow-hidden">
        {/* Left Gradient Fade Mask */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-24 sm:w-36 bg-gradient-to-r from-[#F7F9FC] via-[#F7F9FC]/80 to-transparent z-10" />

        {/* Right Gradient Fade Mask */}
        <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-24 sm:w-36 bg-gradient-to-l from-[#F7F9FC] via-[#F7F9FC]/80 to-transparent z-10" />

        {/* Seamless 2-Track Endless Looping Container */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] py-3">
          {/* Track 1 */}
          <div className="flex items-center gap-5 shrink-0 pr-5" role="list">
            {ECOSYSTEM_PARTNERS.map((partner) => (
              <PartnerCard key={`track1-${partner.id}`} partner={partner} />
            ))}
          </div>

          {/* Track 2: Identical clone for seamless continuous endless loop */}
          <div className="flex items-center gap-5 shrink-0 pr-5" aria-hidden="true" role="list">
            {ECOSYSTEM_PARTNERS.map((partner) => (
              <PartnerCard key={`track2-${partner.id}`} partner={partner} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default EcosystemMarquee;
