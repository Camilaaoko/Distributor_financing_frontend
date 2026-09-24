"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, PlusCircle, RefreshCw, AlertCircle } from "lucide-react";

import { Card } from "@/components/dashboard/Card";
import { ManufacturerHeader } from "@/components/dashboard/ManufacturerHeader";
import { onboardingService, type DistributorRecommendation } from "@/services/onboarding.service";

interface Referral {
  id: string;
  name: string;
  registrationNumber: string;
  location: string;
  referredDate: string;
  status: "Active" | "Pending Consent" | "KYC Review" | "Rejected" | string;
  financingStatus: string;
  creditLimit: string;
}

export default function ManufacturerReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showReferralModal, setShowReferralModal] = useState(false);

  const loadReferrals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await onboardingService.getDistributorRecommendations();
      if (data && data.length > 0) {
        const mapped: Referral[] = data.map((d, idx) => ({
          id: d.id || `rec-${idx}`,
          name: d.distributorName || 'Distributor',
          registrationNumber: d.contactEmail || d.email || '—',
          location: d.contactPhone || d.phoneNumber || '—',
          referredDate: d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—",
          status: d.status === "APPROVED" ? "Active" : d.status === "REJECTED" ? "Rejected" : d.docsSubmitted ? "KYC Review" : "Pending Consent",
          financingStatus: d.status === "APPROVED" ? "Approved by Bank" : d.status === "REJECTED" ? `Rejected: ${d.rejectionReason || "Criteria not met"}` : "Awaiting Bank Review",
          creditLimit: d.status === "APPROVED" ? "Active Credit Limit" : "Evaluation Pending",
        }));
        setReferrals(mapped);
      } else {
        setReferrals([]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load referrals.');
      setReferrals([]);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    loadReferrals();
  }, []);

  const filteredReferrals = referrals.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = ["ALL", "Active", "Pending Consent", "KYC Review", "Rejected"];

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
      <ManufacturerHeader
        title="My Referrals"
        subtitle="Track all referred distributors, their onboarding status, and financing outcomes."
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-700 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}


      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search distributor name, reg number, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-700 font-medium cursor-pointer hidden sm:block"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>{opt === "ALL" ? "All Statuses" : opt}</option>
            ))}
          </select>

          <button
            onClick={loadReferrals}
            disabled={isLoading}
            className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
            title="Refresh referrals"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowReferralModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Refer Distributor
          </button>
        </div>
      </div>

      <Card className="bg-white border-slate-200/80 shadow-xs rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1E3A8A] text-white font-medium">
              <tr>
                <th className="p-3">Distributor Name</th>
                <th className="p-3">Reg Number</th>
                <th className="p-3">Location</th>
                <th className="p-3">Referred Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Financing Status</th>
                <th className="p-3">Credit Limit</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredReferrals.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{r.name}</td>
                  <td className="p-3 font-mono text-slate-500">{r.registrationNumber}</td>
                  <td className="p-3 text-slate-600">{r.location}</td>
                  <td className="p-3 text-slate-600">{r.referredDate}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        r.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : r.status === "Pending Consent"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : r.status === "KYC Review"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{r.financingStatus}</td>
                  <td className="p-3 font-medium text-slate-900">{r.creditLimit}</td>
                  <td className="p-3 text-right">
                    <button className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg flex items-center gap-1 font-semibold cursor-pointer">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReferrals.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No referrals match your filters</p>
          </div>
        )}
      </Card>

      {/* REFER DISTRIBUTOR MODAL - Quick link to stepper page */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Refer New Distributor</h3>
              <button onClick={() => setShowReferralModal(false)} className="text-slate-400 text-sm cursor-pointer">✕</button>
            </div>

            <div className="text-center space-y-4">
              <PlusCircle className="w-16 h-16 text-[#F97316] mx-auto" />
              <h4 className="text-lg font-semibold text-slate-900">Start 3-Step Referral Process</h4>
              <p className="text-sm text-slate-500">
                Complete the distributor referral in 3 steps:<br />
                <span className="block mt-2 text-left text-xs space-y-1">
                  <span>1. Basic Information</span>
                  <span>2. Payment History Upload</span>
                  <span>3. Explicit Consent</span>
                </span>
              </p>
              <button
                onClick={() => { setShowReferralModal(false); window.location.href = "/manufacturer/refer-distributor"; }}
                className="w-full px-4 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Start Referral
              </button>
              <button
                onClick={() => setShowReferralModal(false)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}