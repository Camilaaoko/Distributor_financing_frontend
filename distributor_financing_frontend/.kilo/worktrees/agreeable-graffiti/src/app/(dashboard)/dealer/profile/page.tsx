"use client";

import React from "react";
import {
  User,
  ShieldCheck,
  Building2,
  FileCheck2,
  CheckCircle2,
  Lock,
  Award,
  TrendingUp,
  ChevronRight,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { Card } from "@/components/dashboard/Card";

export default function ProfilePage() {
  // Tier progression mock data
  const tiers = [
    { name: "Tier 3: Micro", limit: "KES 5M", threshold: 0 },
    { name: "Tier 2: Growth", limit: "KES 15M", threshold: 30 },
    { name: "Tier 1: Anchor", limit: "KES 30M", threshold: 70, current: true },
    { name: "Platinum Enterprise", limit: "KES 50M+", threshold: 100 },
  ];

  // Current progress percentage toward next tier (Platinum)
  const currentProgressPercent = 72;

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dealer Loan Profile & Revolving Limit</h1>
            {/* DISTRIBUTOR TIER BADGE */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-full text-xs font-bold shadow-sm">
              <Award className="w-4 h-4 text-amber-600" /> Tier 1 Distributor
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Dynamic profile identity, verified KYC records, tier standing, and assigned maker/checker person blocks[cite: 3].
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Bank KYC Verified & Active
        </span>
      </div>

      {/* TIER PROGRESSION ROADMAP CARD */}
      <Card className="bg-white border-slate-200/80 shadow-sm rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Distributor Classification Tier</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  Level 3 of 4
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Higher tiers unlock expanded revolving credit caps and preferred interest rates.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Next Tier Goal</span>
            <span className="text-xs font-bold text-slate-800">Platinum Enterprise (KES 50M+ Cap)</span>
          </div>
        </div>

        {/* PROGRESS BAR TRACK */}
        <div className="relative my-6 px-2">
          {/* Main Background Track */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${currentProgressPercent}%` }}
            />
          </div>

          {/* Tier Milestones */}
          <div className="grid grid-cols-4 gap-2 mt-4 text-center">
            {tiers.map((t, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full border-2 mb-2 flex items-center justify-center ${
                    t.current
                      ? "bg-amber-500 border-white ring-4 ring-amber-100"
                      : t.threshold <= currentProgressPercent
                      ? "bg-blue-600 border-white"
                      : "bg-slate-200 border-slate-300"
                  }`}
                >
                  {t.current && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>

                <span className={`text-xs font-bold ${t.current ? "text-amber-700" : "text-slate-800"}`}>
                  {t.name}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">{t.limit}</span>
                {t.current && (
                  <span className="mt-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Current Tier
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>
              Maintain <strong>95%+ on-time repayments</strong> over the next 30 days to qualify for <strong>Platinum Upgrade</strong>.
            </span>
          </div>
          <button className="text-blue-700 font-semibold hover:underline flex items-center gap-0.5">
            View Tier Qualification Policy <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </Card>

      {/* PROFILE SUMMARY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COMPANY & REVOLVING LIMIT PROFILE */}
        <Card className="lg:col-span-2 bg-white border-slate-200/80 shadow-sm rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-700" /> Distributor Corporate Information
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Referral-anchored enterprise profile[cite: 3]</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-t border-b border-slate-100 py-4">
            <div>
              <span className="text-slate-400 block mb-0.5">Registered Business Name</span>
              <span className="font-bold text-slate-900 text-sm">Nairobi Wholesale Distributors Ltd</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Registration Number</span>
              <span className="font-mono font-semibold text-slate-800">CPR/2021/88201</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Physical Business Address</span>
              <span className="font-medium text-slate-800">Industrial Area, Enterprise Road, Nairobi</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Anchor Referrer</span>
              <span className="font-semibold text-blue-700">Unilever East Africa</span>
            </div>
          </div>

          {/* REVOLVING CREDIT LIMIT CONFIGURATION */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Revolving Credit Limit Metrics
            </h4>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Total Approved Limit</span>
                <span className="text-base font-bold text-slate-900">KES 30.0M</span>
              </div>
              <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-lg">
                <span className="text-[10px] text-blue-600 block">Available Balance</span>
                <span className="text-base font-bold text-blue-800">KES 18.5M</span>
              </div>
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg">
                <span className="text-[10px] text-amber-700 block">Utilized Exposure</span>
                <span className="text-base font-bold text-amber-900">KES 11.5M</span>
              </div>
            </div>
          </div>
        </Card>

        {/* SECURITY & GOVERNANCE WIDGET */}
        <Card className="bg-white border-slate-200/80 shadow-sm rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Tenant Security</h3>
              <p className="text-xs text-slate-500">MFA & Segregation Status</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Multi-Factor Auth (MFA)
              </span>
              <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Enabled</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-600 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-slate-400" /> Consent Record
              </span>
              <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">Captured & Timestamped</span>
            </div>
          </div>
        </Card>

      </div>

      {/* DUAL PERSON BLOCK (MAKER & CHECKER PERSON SPECIFICATIONS) */}
      <Card className="bg-white border-slate-200/80 shadow-sm rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900">Onboarded User Governance (Maker / Checker)</h3>
          <p className="text-xs text-slate-500 mt-0.5">Captured during initial self-onboarding and verified by Bank Admin[cite: 3].</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* MAKER PERSON BLOCK */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" /> Dealer Maker User
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">Initiator Role</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Full Name:</span>
                <span className="font-semibold text-slate-800">John Kipchumba</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Corporate Email:</span>
                <span className="font-medium text-slate-700">dealer@dfp.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">National ID:</span>
                <span className="font-mono text-slate-700">29482019</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone Number:</span>
                <span className="text-slate-700">+254 712 345 678</span>
              </div>
            </div>
          </div>

          {/* CHECKER PERSON BLOCK */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" /> Dealer Checker User
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-semibold">Approver Role</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Full Name:</span>
                <span className="font-semibold text-slate-800">Sarah Wanjiku</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Corporate Email:</span>
                <span className="font-medium text-slate-700">checker.dealer@dfp.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">National ID:</span>
                <span className="font-mono text-slate-700">31029482</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone Number:</span>
                <span className="text-slate-700">+254 722 987 654</span>
              </div>
            </div>
          </div>

        </div>
      </Card>

    </div>
  );
}