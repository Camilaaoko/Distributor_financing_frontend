"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  FileText,
  Landmark,
  ShoppingBag,
  Boxes,
  Bell,
  Calendar,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  CheckSquare,
} from "lucide-react";

import { Card } from "@/components/dashboard/Card";
import { useAuth } from "@/hooks/useAuth";

export interface ManufacturerPendingItem {
  id: string;
  reference: string;
  actionType: "Distributor Referral" | "Invoice Upload" | "Order Dispatch";
  entityName: string;
  amount: string;
  initiatedBy: string;
  date: string;
  status: "Pending Sign-off" | "Approved" | "Rejected";
}

const initialPendingQueue: ManufacturerPendingItem[] = [
  {
    id: "1",
    reference: "REF-8801",
    actionType: "Distributor Referral",
    entityName: "Sunrise Distributors Ltd",
    amount: "KES 8,500,000",
    initiatedBy: "Alice Wanjiku (Maker)",
    date: "2026-07-30",
    status: "Pending Sign-off",
  },
  {
    id: "2",
    reference: "INV-2026-1578",
    actionType: "Invoice Upload",
    entityName: "Premier Supplies Ltd",
    amount: "KES 12,000,000",
    initiatedBy: "Alice Wanjiku (Maker)",
    date: "2026-07-29",
    status: "Pending Sign-off",
  },
  {
    id: "3",
    reference: "ORD-2026-2456",
    actionType: "Order Dispatch",
    entityName: "Global Distributors",
    amount: "KES 15,000,000",
    initiatedBy: "Alice Wanjiku (Maker)",
    date: "2026-07-28",
    status: "Pending Sign-off",
  },
];

const salesData = [
  { month: "Jan", Sales: 28, Financing: 18 },
  { month: "Feb", Sales: 42, Financing: 26 },
  { month: "Mar", Sales: 45, Financing: 32 },
  { month: "Apr", Sales: 38, Financing: 28 },
  { month: "May", Sales: 58, Financing: 42 },
  { month: "Jun", Sales: 52, Financing: 40 },
  { month: "Jul", Sales: 78, Financing: 58 },
];

export default function ManufacturerCheckerDashboardPage() {
  const [dateRange, setDateRange] = useState("30 Jul 2026 - 30 Jul 2026");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [pendingQueue, setPendingQueue] = useState<ManufacturerPendingItem[]>(initialPendingQueue);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    if (auth?.logout) {
      auth.logout();
    }
    router.push("/login");
  };

  const handleAction = (id: string, newStatus: "Approved" | "Rejected") => {
    setPendingQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    alert(`Item ${newStatus === "Approved" ? "Confirmed & Forwarded to Bank" : "Rejected"}`);
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manufacturer Checker Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Approver Role
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-800">Acme Manufacturing Ltd</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 pr-8 shadow-sm flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateRange}</span>
            </button>
          </div>

          <button className="relative p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-600">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
          </button>

          {/* USER PROFILE DROPDOWN (MANUFACTURER CHECKER) */}
          <div className="relative pl-2 border-l border-slate-200" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-left"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                MC
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-800">Manufacturer Checker</div>
                <div className="text-[10px] text-slate-500">Acme Manufacturing</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 text-xs divide-y divide-slate-100">
                <div className="px-3.5 py-2">
                  <p className="font-semibold text-slate-900">Manufacturer Checker</p>
                  <p className="text-[11px] text-slate-500 truncate">manufacturer.checker@dfp.com</p>
                </div>

                <div className="py-1">
                  <Link
                    href="/manufacturer/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-700 font-medium"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    View Profile & Settings
                  </Link>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEGREGATION OF DUTIES ALERT BANNER */}
      <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 flex items-center justify-between text-xs text-indigo-950 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm block">Manufacturer Peer Control Enforced (Maker / Checker)</span>
            <span className="text-slate-600">
              Logged in as <strong>Manufacturer Checker</strong>[cite: 3]. You hold authorization authority over distributor referrals and invoices submitted by Manufacturer Maker users[cite: 3].
            </span>
          </div>
        </div>
        <span className="hidden lg:inline-flex items-center gap-1 font-bold bg-white text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200">
          <CheckSquare className="w-4 h-4 text-indigo-600" /> {pendingQueue.filter(i => i.status === "Pending Sign-off").length} Actions Pending
        </span>
      </div>

      {/* AUTHORIZATION QUEUE TABLE */}
      <Card className="bg-white border-indigo-200/80 shadow-sm rounded-xl p-6 ring-1 ring-indigo-50">
        <div className="mb-4 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Manufacturer Authorization Queue</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Peer sign-off required prior to Bank submission[cite: 3]</p>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
            Maker: Alice Wanjiku
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Reference ID</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Initiated By</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Verification Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pendingQueue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 font-mono">{item.reference}</td>
                  <td className="p-3 font-medium text-indigo-900">{item.actionType}</td>
                  <td className="p-3 font-semibold">{item.entityName}</td>
                  <td className="p-3 font-bold text-slate-900">{item.amount}</td>
                  <td className="p-3 text-slate-500">{item.initiatedBy}</td>
                  <td className="p-3 text-slate-500">{item.date}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      item.status === "Pending Sign-off" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {item.status === "Pending Sign-off" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction(item.id, "Approved")}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-[11px] flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                        </button>
                        <button
                          onClick={() => handleAction(item.id, "Rejected")}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-semibold text-[11px] flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* KPI CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white border-slate-200/80 shadow-sm rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Distributors</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">127</div>
          <span className="text-xs font-medium text-emerald-600 mt-2 block">↑ 12% vs last month</span>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-sm rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Outstanding Invoices</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">KES 34.2M</div>
          <span className="text-xs font-medium text-rose-600 mt-2 block">↓ 8% vs last month</span>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-sm rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Approved Financing</span>
            <Landmark className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">KES 82.7M</div>
          <span className="text-xs font-medium text-emerald-600 mt-2 block">↑ 15% vs last month</span>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-sm rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Orders</span>
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">18</div>
          <span className="text-xs font-medium text-amber-600 mt-2 block">Awaiting Verification</span>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-sm rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Available Inventory</span>
            <Boxes className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">KES 156.4M</div>
          <span className="text-xs font-medium text-emerald-600 mt-2 block">↑ 10% vs last month</span>
        </Card>
      </div>

      {/* SALES & FINANCING OVERVIEW */}
      <Card className="bg-white border-slate-200/80 shadow-sm rounded-xl p-6">
        <div className="mb-4 flex flex-row items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Sales & Financing Overview</h3>
            <p className="text-xs text-slate-500 mt-0.5">Monthly breakdown in KES Millions</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Sales
            </span>
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Financing
            </span>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} />
              <Tooltip />
              <Line type="monotone" dataKey="Sales" stroke="#1E40AF" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Financing" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

    </div>
  );
}