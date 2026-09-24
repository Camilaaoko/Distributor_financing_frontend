"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Search,
  Plus,
  Eye,
  X,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  Building2,
  DollarSign,
  Download,
} from "lucide-react";
import { Card } from "@/components/dashboard/Card";

interface Payment {
  id: string;
  receiptRef: string;
  poReference: string;
  distributor: string;
  bankTenant: string;
  amount: number;
  paymentMethod: string;
  date: string;
  status: "Settled to Manufacturer" | "Processing Settlement" | "Pending Bank Reconciliation";
}

const mockPayments: Payment[] = [
  {
    id: "1",
    receiptRef: "PAY-99201",
    poReference: "PO-8842",
    distributor: "Nairobi Wholesale Distributors",
    bankTenant: "NCBA Bank Kenya",
    amount: 3450000,
    paymentMethod: "Bank Drawdown Settlement",
    date: "2026-08-05",
    status: "Settled to Manufacturer",
  },
  {
    id: "2",
    receiptRef: "PAY-98841",
    poReference: "PO-8839",
    distributor: "Premier Supplies Ltd",
    bankTenant: "KCB Bank Group",
    amount: 12000000,
    paymentMethod: "Bank Drawdown Settlement",
    date: "2026-07-28",
    status: "Settled to Manufacturer",
  },
  {
    id: "3",
    receiptRef: "PAY-97302",
    poReference: "PO-8835",
    distributor: "Kisumu Commercial Hub",
    bankTenant: "Equity Bank",
    amount: 1500000,
    paymentMethod: "Direct Mobile Money (M-Pesa B2B)",
    date: "2026-08-06",
    status: "Processing Settlement",
  },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Record Payment Form State
  const [distributor, setDistributor] = useState("Nairobi Wholesale Distributors");
  const [bankTenant, setBankTenant] = useState("NCBA Bank Kenya");
  const [poReference, setPoReference] = useState("PO-8848");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Direct Mobile Money (M-Pesa B2B)");

  // Handle Record Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(amount) || 0;
    if (amountVal <= 0) return;

    const newPayment: Payment = {
      id: Date.now().toString(),
      receiptRef: `PAY-${Math.floor(99300 + Math.random() * 100)}`,
      poReference,
      distributor,
      bankTenant,
      amount: amountVal,
      paymentMethod,
      date: new Date().toISOString().split("T")[0],
      status: "Processing Settlement",
    };

    setPayments([newPayment, ...payments]);
    setAmount("");
    setShowRecordModal(false);
  };

  // Update Status Handler
  const handleUpdateStatus = (id: string, newStatus: Payment["status"]) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    if (selectedPayment && selectedPayment.id === id) {
      setSelectedPayment({ ...selectedPayment, status: newStatus });
    }
  };

  // Filtered List
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.receiptRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.poReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.distributor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSettled = payments
    .filter((p) => p.status === "Settled to Manufacturer")
    .reduce((acc, p) => acc + p.amount, 0);

  const totalProcessing = payments
    .filter((p) => p.status === "Processing Settlement")
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track received bank drawdown settlements and direct distributor payment ledgers[cite: 3].
          </p>
        </div>

        <button
          onClick={() => setShowRecordModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Record Payment Transaction
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500 flex justify-between items-center">
            <span>Settled to Account</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            KES {(totalSettled / 1000000).toFixed(2)}M
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Cleared bank settlements</span>
        </Card>

        <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500 flex justify-between items-center">
            <span>Processing Settlements</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            KES {(totalProcessing / 1000000).toFixed(2)}M
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">Awaiting bank clearing</span>
        </Card>

        <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500 flex justify-between items-center">
            <span>Total Receipts Count</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{payments.length} Transactions</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Verified payment entries</span>
        </Card>
      </div>

      {/* PAYMENTS TABLE CARD */}
      <Card className="bg-white border-slate-200/80 shadow-sm rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search Receipt Ref, PO, or Distributor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Settled to Manufacturer">Settled to Manufacturer</option>
              <option value="Processing Settlement">Processing Settlement</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredPayments.length}</span> Receipts
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Receipt Ref</th>
                <th className="p-3">PO Reference</th>
                <th className="p-3">Distributor</th>
                <th className="p-3">Disbursing Bank / Channel</th>
                <th className="p-3">Amount Settled</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 font-mono">{p.receiptRef}</td>
                  <td className="p-3 font-mono font-medium">{p.poReference}</td>
                  <td className="p-3 font-bold text-slate-800">{p.distributor}</td>
                  <td className="p-3 text-slate-600">{p.bankTenant}</td>
                  <td className="p-3 font-bold text-emerald-600">KES {p.amount.toLocaleString()}</td>
                  <td className="p-3 text-slate-500">{p.date}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        p.status === "Settled to Manufacturer"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>

                      {p.status === "Processing Settlement" && (
                        <button
                          onClick={() => handleUpdateStatus(p.id, "Settled to Manufacturer")}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-[10px] cursor-pointer shadow-xs"
                        >
                          Confirm Clearance
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* RECORD PAYMENT MODAL */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-700" />
                <h3 className="text-base font-bold text-slate-900">Record Transaction Entry</h3>
              </div>
              <button onClick={() => setShowRecordModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Distributor Entity</label>
                  <select
                    value={distributor}
                    onChange={(e) => setDistributor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium"
                  >
                    <option>Nairobi Wholesale Distributors</option>
                    <option>Premier Supplies Ltd</option>
                    <option>Kisumu Commercial Hub</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Financing Bank Partner</label>
                  <select
                    value={bankTenant}
                    onChange={(e) => setBankTenant(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium"
                  >
                    <option>NCBA Bank Kenya</option>
                    <option>KCB Bank Group</option>
                    <option>Equity Bank</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">PO Reference</label>
                  <input
                    type="text"
                    required
                    value={poReference}
                    onChange={(e) => setPoReference(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium"
                  >
                    <option>Direct Mobile Money (M-Pesa B2B)</option>
                    <option>Bank Drawdown Settlement</option>
                    <option>Core Banking EFT/RTGS Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Amount (KES) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1500000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW RECEIPT DETAILS MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Receipt {selectedPayment.receiptRef}</h3>
                <span className="text-xs text-slate-500">Order: {selectedPayment.poReference}</span>
              </div>
              <button onClick={() => setSelectedPayment(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Distributor:</span>
                  <span className="font-semibold text-slate-800">{selectedPayment.distributor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Financing Partner:</span>
                  <span className="font-semibold text-slate-800">{selectedPayment.bankTenant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Channel:</span>
                  <span className="font-medium text-slate-800">{selectedPayment.paymentMethod}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex justify-between items-center">
                <span className="font-semibold text-emerald-900">Settled Amount:</span>
                <span className="text-base font-extrabold text-emerald-950">
                  KES {selectedPayment.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              {selectedPayment.status === "Processing Settlement" && (
                <button
                  onClick={() => handleUpdateStatus(selectedPayment.id, "Settled to Manufacturer")}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Confirm Clearance
                </button>
              )}
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-1.5 border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}