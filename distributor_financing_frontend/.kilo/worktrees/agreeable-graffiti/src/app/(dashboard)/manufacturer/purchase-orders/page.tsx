"use client";

import React, { useState } from "react";
import { Search, Eye, X } from "lucide-react";
import { Card } from "@/components/dashboard/Card";
import { ManufacturerHeader } from "@/components/dashboard/ManufacturerHeader";

interface POLineItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  distributor: string;
  items: POLineItem[];
  totalAmount: number;
  paymentTerm: string;
  status: "Approved" | "Pending Verification" | "Dispatched" | "Cancelled";
  date: string;
}

const mockPOs: PurchaseOrder[] = [
  {
    id: "1",
    poNumber: "PO-8842",
    distributor: "Nairobi Wholesale Distributors",
    items: [{ productName: "Omo Washing Powder 1kg (Box of 12)", quantity: 100, unitPrice: 3450 }],
    totalAmount: 3450000,
    paymentTerm: "30-Day Revolving Credit",
    status: "Approved",
    date: "2026-08-05",
  },
  {
    id: "2",
    poNumber: "PO-8839",
    distributor: "Mombasa Retail Network",
    items: [{ productName: "Tusker Lager 500ml (Crate of 25)", quantity: 380, unitPrice: 4800 }],
    totalAmount: 1824000,
    paymentTerm: "15-Day Quick Credit",
    status: "Dispatched",
    date: "2026-08-02",
  },
  {
    id: "3",
    poNumber: "PO-8835",
    distributor: "Kisumu Commercial Hub",
    items: [{ productName: "Geisha Soap Bar 225g (Carton of 48)", quantity: 500, unitPrice: 4200 }],
    totalAmount: 2100000,
    paymentTerm: "60-Day Anchor Credit",
    status: "Pending Verification",
    date: "2026-08-01",
  },
];

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(mockPOs);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const handleUpdateStatus = (id: string, newStatus: PurchaseOrder["status"]) => {
    setOrders((prev) => prev.map((po) => (po.id === id ? { ...po, status: newStatus } : po)));
    if (selectedPO && selectedPO.id === id) {
      setSelectedPO({ ...selectedPO, status: newStatus });
    }
  };

  const filteredOrders = orders.filter((po) => {
    const matchesSearch = po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) || po.distributor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
      <ManufacturerHeader 
        title="Purchase Orders" 
        subtitle="Review, approve, and track stock purchase orders submitted by network distributors." 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-500">Total Incoming Orders</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{orders.length} POs</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Submitted by distributor network</span>
        </Card>

        <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-500">Pending Verification</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {orders.filter((o) => o.status === "Pending Verification").length} Orders
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">Awaiting fulfillment review</span>
        </Card>

        <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-500">Dispatched Orders</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {orders.filter((o) => o.status === "Dispatched").length} Dispatched
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">In transit to distributors</span>
        </Card>

        <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-500">Total PO Value</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            KES {(orders.reduce((acc, o) => acc + o.totalAmount, 0) / 1000000).toFixed(2)}M
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Cumulative order volume</span>
        </Card>
      </div>

      <Card className="bg-white border-slate-200/80 shadow-xs rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search PO Number or Distributor..."
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
              <option value="Pending Verification">Pending Verification</option>
              <option value="Approved">Approved</option>
              <option value="Dispatched">Dispatched</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredOrders.length}</span> Orders
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">PO Number</th>
                <th className="p-3">Distributor</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Financing Term</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 font-mono">{po.poNumber}</td>
                  <td className="p-3 font-bold text-slate-800">{po.distributor}</td>
                  <td className="p-3 font-bold text-slate-900">KES {po.totalAmount.toLocaleString()}</td>
                  <td className="p-3 text-slate-500">{po.paymentTerm}</td>
                  <td className="p-3 text-slate-500">{po.date}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        po.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : po.status === "Dispatched"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedPO(po)} className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg flex items-center gap-1 font-semibold cursor-pointer">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>

                      {po.status === "Pending Verification" && (
                        <button onClick={() => handleUpdateStatus(po.id, "Approved")} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-[10px] cursor-pointer shadow-xs">
                          Approve
                        </button>
                      )}

                      {po.status === "Approved" && (
                        <button onClick={() => handleUpdateStatus(po.id, "Dispatched")} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-[10px] cursor-pointer shadow-xs">
                          Dispatch
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

      {selectedPO && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedPO.poNumber} Details</h3>
                <span className="text-xs text-slate-500">{selectedPO.distributor}</span>
              </div>
              <button onClick={() => setSelectedPO(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-bold text-slate-900">{selectedPO.status}</span>
              </div>

              <div className="border border-slate-200/80 rounded-lg overflow-hidden">
                <div className="bg-slate-50 p-2 font-bold text-slate-700 border-b border-slate-200">Order Items</div>
                <div className="p-3 divide-y divide-slate-100 space-y-2">
                  {selectedPO.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between pt-1">
                      <div>
                        <div className="font-semibold text-slate-800">{item.productName}</div>
                        <div className="text-slate-400">{item.quantity} units @ KES {item.unitPrice.toLocaleString()}</div>
                      </div>
                      <div className="font-bold text-slate-900">
                        KES {(item.quantity * item.unitPrice).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Order Value:</span>
                <span>KES {selectedPO.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              {selectedPO.status === "Pending Verification" && (
                <button onClick={() => handleUpdateStatus(selectedPO.id, "Approved")} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer">
                  Approve Order
                </button>
              )}
              {selectedPO.status === "Approved" && (
                <button onClick={() => handleUpdateStatus(selectedPO.id, "Dispatched")} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer">
                  Dispatch Shipment
                </button>
              )}
              <button onClick={() => setSelectedPO(null)} className="px-4 py-1.5 border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}