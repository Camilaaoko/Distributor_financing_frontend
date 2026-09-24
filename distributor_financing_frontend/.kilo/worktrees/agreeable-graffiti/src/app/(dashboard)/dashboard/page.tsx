'use client';

import React from 'react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-[#1E293B] tracking-tight">
            Executive Summary Overview
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Real-time portfolio metrics, active credit lines, and pending approvals.
          </p>
        </div>

        <button className="bg-[#1F4DA8] hover:bg-[#3A6FD8] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-[#1F4DA8]/20">
          + Initiate New Drawdown
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Total Credit Limit</div>
          <div className="text-2xl font-semibold text-[#1E293B] mt-2">$12,500,000</div>
          <div className="text-xs text-[#F58220] font-semibold mt-1">↑ 12% from last month</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Active Outstanding</div>
          <div className="text-2xl font-semibold text-[#1F4DA8] mt-2">$4,820,000</div>
          <div className="text-xs text-[#64748B] mt-1">Revolving facility utilized</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Pending Approvals</div>
          <div className="text-2xl font-semibold text-[#F58220] mt-2">14 Applications</div>
          <div className="text-xs text-[#F58220] font-semibold mt-1">Awaiting Maker/Checker</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Onboarded Dealers</div>
          <div className="text-2xl font-semibold text-[#16A34A] mt-2">1,248</div>
          <div className="text-xs text-[#64748B] mt-1">Active distribution network</div>
        </div>
      </div>

    </div>
  );
}