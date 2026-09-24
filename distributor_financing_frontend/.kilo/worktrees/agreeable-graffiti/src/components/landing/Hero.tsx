"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden gradient-bg">
      <div className="absolute inset-0 bg-gradient-to-br from-surface via-primary-fixed/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-primary)/5_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative container section pt-20 md:pt-24">
        <div className="grid lg:grid-cols-2 gap-[var(--space-card-gap)] lg:gap-12 items-center">
          <div className="flex flex-col gap-[var(--space-element-gap-lg)] z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[#1F4DA8] font-label-sm text-label-sm uppercase tracking-wider font-bold border border-blue-200/80 w-fit shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#1F4DA8] animate-pulse" />
              MULTI-TENANT VALUE CHAIN FINANCING
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-extrabold text-[#1F4DA8] leading-[1.18] tracking-tight max-w-2xl">
              Distributor Financing <br />
              <span className="text-[#F58220]">Ecosystem Platform</span>
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Empowering banks, manufacturers, and distributors with automated onboarding, consent-based credit assessment, and revolving credit facilities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-primary text-on-primary font-label-bold text-label-bold hover:bg-primary-light transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <span>Request a Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-outline-variant/50 w-full max-w-xl">
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container-low rounded-full border border-outline-variant text-xs font-semibold text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-success" />
                Bank-Grade 256-bit AES
              </span>
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container-low rounded-full border border-outline-variant text-xs font-semibold text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                CBK Sandbox Aligned
              </span>
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container-low rounded-full border border-outline-variant text-xs font-semibold text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Real-Time Reconciliation
              </span>
            </div>
          </div>

          {/* Right Column: Clean Product Visual */}
          <div className="relative hidden lg:block">
            <div className="relative max-w-xl mx-auto p-3 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/60 border border-slate-200/80 shadow-2xl">
              <Image
                src="/images/screen.png"
                alt="Distributor Financing Ecosystem Dashboard"
                width={700}
                height={500}
                className="w-full h-auto rounded-xl object-contain shadow-sm"
                priority
              />
            </div>

            {/* Ambient Background Glow */}
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-8 -right-8 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}