"use client";

import React, { useState } from "react";
import { Landmark, Clock, Building2, Search, Eye, X } from "lucide-react";
import { Card } from "@/components/dashboard/Card";
import { ManufacturerHeader } from "@/components/dashboard/ManufacturerHeader";

interface CreditRequest {
  id: string;
  facilityRef: string;
  distributor: string;
  bankTenant: string;
  drawdownAmount: number;
  tenure: string;
  interestRate: string;
  status: "Bank Approved" | "Pending Manufacturer Sign-off" | "Rejected";
  date: string;
  revolvingLimit: string;
  availableLimit: string;
}

const mockCreditRequests: CreditRequest[] = [
  {
    id: "1",
    facilityRef: "DF-209",
    distributor: "Nairobi Wholesale Distributors",
    bankTenant: "NCBA Bank Kenya",
    drawdownAmount: 2800000,
    tenure: "30 Days",
    interestRate: "2.5%",
    status: "Bank Approved",
    date: "2026-08-05",
    revolvingLimit: "KES 30,000,000",
    availableLimit: "KES 18,500,000",
  },
  {
    id: "2",
    facilityRef: "DF-212",
    distributor: "Kisumu Commercial Hub",
    bankTenant: "KCB Bank Group",
    drawdownAmount: 1500000,
    tenure: "15 Days",
    interestRate: "1.5%",
    status: "Pending Manufacturer Sign-off",
    date: "2026-08-06",
    revolvingLimit: "KES 15,000,000",
    availableLimit: "KES 8,500,000",
  },
  {
    id: "3",
    facilityRef: "DF-198",
    distributor: "Eldoret Supply Co.",
    bankTenant: "Equity Bank",
    drawdownAmount: 1800000,
    tenure: "45 Days",
    interestRate: "3.5%",
    status: "Rejected",
    date: "2026-08-01",
    revolvingLimit: "KES 10,000,000",
    availableLimit: "KES 2,200,000",
  },
];

export default function CreditRequestsPage() {
  const [requests, setRequests] = useState<CreditRequest[]>(mockCreditRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null);

  const handleSignOff = (id: string, action: "Bank Approved" | "Rejected") => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: action } : r)));
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, status: action });
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch = r.facilityRef.toLowerCase().includes(searchTerm.toLowerCase()) || r.distributor.toLowerCase().includes(searchTerm.toLowerCase()) || r.bankTenant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeSum = requests.filter((r) => r.status === "Bank Approved").reduce((acc, r) => acc + r.drawdownAmount, 0);
  const pendingCount = requests.filter((r) => r.status === "Pending Manufacturer Sign-off").length;

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
      <ManufacturerHeader
        title="Credit Requests"
        subtitle="Review and approve distributor credit drawdown requests anchored by your manufacturer relationship."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-500 flex justify-between items-center">
            <span>Approved Credit Drawdowns</span>
            <Landmark className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            KES {(activeSum / 1000000).toFixed(2)}M
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Active revolving bank credit</span>
        </Card>

        <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-500 flex justify-between items-center">
            <span>Pending Sign-off Queue</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingCount} Requests</div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">Requires manufacturer confirmation</span>
        </Card>

        <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-500 flex justify-between items-center">
            <span>Partner Bank Tenants</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">3 Banks Active</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Multi-tenant lending ecosystem</span>
        </Card>
      </div>

      <Card className="bg-white border-slate-200/80 shadow-xs rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search Facility Ref or Distributor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-700 font-medium cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending Manufacturer Sign-off">Pending Sign-off</option>
              <option value="Bank Approved">Bank Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredRequests.length}</span> Requests
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1E3A8A] text-white font-medium">
              <tr>
                <th className="p-3">Facility Ref</th>
                <th className="p-3">Distributor</th>
                <th className="p-3">Financing Bank</th>
                <th className="p-3">Drawdown Amount</th>
                <th className="p-3">Tenure / Rate</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRequests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 font-mono">{r.facilityRef}</td>
                  <td className="p-3 font-bold text-slate-800">{r.distributor}</td>
                  <td className="p-3 text-slate-600">{r.bankTenant}</td>
                  <td className="p-3 font-bold text-slate-900">KES {r.drawdownAmount.toLocaleString()}</td>
                  <td className="p-3 text-slate-500">{r.tenure} ({r.interestRate})</td>
                  <td className="p-3 text-slate-500">{r.date}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        r.status === "Bank Approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : r.status === "Pending Manufacturer Sign-off"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedRequest(r)} className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg flex items-center gap-1 font-semibold cursor-pointer">
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>

                      {r.status === "Pending Manufacturer Sign-off" && (
                        <>
                          <button onClick={() => handleSignOff(r.id, "Bank Approved")} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[10px] cursor-pointer shadow-xs">
                            Confirm
                          </button>
                          <button onClick={() => handleSignOff(r.id, "Rejected")} className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded text-[10px] cursor-pointer">
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Facility {selectedRequest.facilityRef} Review</h3>
                <span className="text-xs text-slate-500">{selectedRequest.distributor}</span>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block">Financing Partner:</span>
                  <span className="font-semibold text-slate-800">{selectedRequest.bankTenant}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tenure / Rate:</span>
                  <span className="font-semibold text-slate-800">{selectedRequest.tenure} ({selectedRequest.interestRate})</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-blue-900 font-semibold">Total Revolving Limit:</span>
                  <span className="font-bold text-blue-950">{selectedRequest.revolvingLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-900 font-semibold">Available Credit Balance:</span>
                  <span className="font-bold text-emerald-700">{selectedRequest.availableLimit}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-blue-200/80">
                  <span className="text-blue-900 font-bold">Requested Credit Drawdown:</span>
                  <span className="font-extrabold text-blue-900">KES {selectedRequest.drawdownAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px] leading-snug">
                <strong>Governance Rule (§7.6):</strong> Confirming this request authorizes the subscribing bank to process disbursement directly against the distributor&apos;s approved revolving credit facility.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              {selectedRequest.status === "Pending Manufacturer Sign-off" && (
                <>
                  <button onClick={() => handleSignOff(selectedRequest.id, "Rejected")} className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-semibold cursor-pointer">
                    Reject
                  </button>
                  <button onClick={() => handleSignOff(selectedRequest.id, "Bank Approved")} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer shadow-xs">
                    Confirm & Forward to Bank
                  </button>
                </>
              )}
              <button onClick={() => setSelectedRequest(null)} className="px-4 py-1.5 border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}