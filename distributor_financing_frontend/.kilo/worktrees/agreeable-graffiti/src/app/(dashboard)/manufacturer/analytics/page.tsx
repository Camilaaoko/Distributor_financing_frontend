"use client";

import React, { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { Card } from "@/components/dashboard/Card";
import { ManufacturerHeader } from "@/components/dashboard/ManufacturerHeader";

const analyticsData = [
  { month: "Jan", Sales: 28, Financing: 18, TurnoverRate: 3.2 },
  { month: "Feb", Sales: 42, Financing: 26, TurnoverRate: 3.8 },
  { month: "Mar", Sales: 45, Financing: 32, TurnoverRate: 4.1 },
  { month: "Apr", Sales: 38, Financing: 28, TurnoverRate: 3.9 },
  { month: "May", Sales: 58, Financing: 42, TurnoverRate: 4.5 },
  { month: "Jun", Sales: 52, Financing: 40, TurnoverRate: 4.2 },
  { month: "Jul", Sales: 78, Financing: 58, TurnoverRate: 4.8 },
];

export default function ManufacturerAnalyticsPage() {
  const [timeHorizon, setTimeHorizon] = useState("Last 6 Months");
  const [activeMetric, setActiveMetric] = useState<"Sales" | "Financing">("Financing");

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
      <ManufacturerHeader 
        title="Analytics" 
        subtitle="Advanced sales, distributor turnover, and value-chain financing growth metrics." 
      />

      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 text-xs font-semibold shadow-xs">
          {["Last 30 Days", "Last 6 Months", "Year to Date"].map((period) => (
            <button
              key={period}
              onClick={() => setTimeHorizon(period)}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                timeHorizon === period ? "bg-blue-700 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-500">Gross Sales Financed</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">KES 244.0M</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">↑ 18.4% growth</span>
        </Card>

        <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-500">Avg Distributor Turnover</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">4.8x / year</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">↑ 0.6x acceleration</span>
        </Card>

        <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-500">Revolving Credit Adoption</span>
          <div className="text-2xl font-bold text-blue-700 mt-1">74.2%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Active distributors utilizing credit</span>
        </Card>

        <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-500">Repayment On-Time Rate</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">98.2%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Zero default arrears</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900">Financing Adoption Trend</h3>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setActiveMetric("Financing")}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                  activeMetric === "Financing" ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-slate-500"
                }`}
              >
                Financing
              </button>
              <button
                onClick={() => setActiveMetric("Sales")}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                  activeMetric === "Sales" ? "bg-amber-50 text-amber-700 border border-amber-200" : "text-slate-500"
                }`}
              >
                Sales
              </button>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748B" }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  stroke={activeMetric === "Financing" ? "#1E40AF" : "#F59E0B"}
                  fill={activeMetric === "Financing" ? "#3B82F6" : "#FBBF24"}
                  fillOpacity={0.2}
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-xs rounded-xl p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">Gross Distributor Sales Volume (KES M)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748B" }} />
                <Tooltip />
                <Bar dataKey="Sales" fill="#1E40AF" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

    </div>
  );
}