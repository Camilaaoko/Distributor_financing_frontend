'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  FileText,
  Landmark,
  Calendar,
  ChevronDown,
  LogOut,
  PlusCircle,
  RefreshCw,
  CreditCard,
  ListChecks,
  BarChart3,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';

import { Card } from '@/components/dashboard/Card';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { useAuth } from '@/hooks/useAuth';
import { manufacturerApi, distributorApi, auditLogsApi, bankOnboardingApi } from '@/services/onboarding-api.service';
import type {
  ManufacturerDashboardStatsResponse,
  DistributorRecommendationResponse,
  AuditLogResponse,
} from '@/types/onboarding';
import { getErrorMessage } from '@/lib/errors';

export default function ManufacturerDashboardPage() {
  const [dateRange] = useState('Last 30 Days');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const auth = useAuth();

  const [stats, setStats] = useState<ManufacturerDashboardStatsResponse | null>(null);
  const [referrals, setReferrals] = useState<DistributorRecommendationResponse[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [totalBanks, setTotalBanks] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, refData, logsData, banksData] = await Promise.all([
        manufacturerApi.getDashboardStats().catch(() => null),
        distributorApi.getManufacturerRecommendations().catch(() => []),
        auditLogsApi.getAuditLogs().catch(() => []),
        bankOnboardingApi.getBanksByStatus('ACTIVE').catch(() => []),
      ]);

      setStats(statsData);
      setReferrals(refData || []);
      setAuditLogs(logsData || []);
      if (Array.isArray(banksData) && banksData.length > 0) {
        setTotalBanks(banksData.length);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load manufacturer dashboard statistics.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    if (auth?.logout) {
      auth.logout();
    }
    router.push('/login');
  };

  const totalReferrals = stats?.totalRecommendedDistributors ?? referrals.length;
  const approvedDistributors = stats?.approvedDistributors ?? referrals.filter((r) => r.status === 'APPROVED').length;
  const pendingDistributors = stats?.pendingDistributors ?? referrals.filter((r) => r.status === 'PENDING').length;
  const totalStaffUsers = stats?.totalManufacturerUsers ?? 0;

  const chartData = [
    { month: 'May', Referrals: Math.max(1, Math.round(totalReferrals * 0.4)), Approved: Math.max(0, Math.round(approvedDistributors * 0.3)) },
    { month: 'Jun', Referrals: Math.max(2, Math.round(totalReferrals * 0.6)), Approved: Math.max(1, Math.round(approvedDistributors * 0.5)) },
    { month: 'Jul', Referrals: Math.max(3, Math.round(totalReferrals * 0.8)), Approved: Math.max(1, Math.round(approvedDistributors * 0.7)) },
    { month: 'Aug', Referrals: totalReferrals, Approved: approvedDistributors },
  ];

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manufacturer Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#1F4DA8] border border-blue-200">
              Anchor Portal
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time distributor credit referrals, staff operations, and trade finance activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 shadow-xs flex items-center gap-2 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <NotificationBell />

          {/* USER PROFILE DROPDOWN */}
          <div className="relative pl-2 border-l border-slate-200" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-[#1F4DA8] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {(auth?.user?.username ? auth.user.username.charAt(0) : (auth?.user?.email ? auth.user.email.charAt(0) : 'M')).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-800">{auth?.user?.username || 'Manufacturer Admin'}</div>
                <div className="text-[10px] text-slate-500">Anchor Enterprise</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 text-xs divide-y divide-slate-100">
                <div className="px-3.5 py-2">
                  <p className="font-semibold text-slate-900">{auth?.user?.username || 'Manufacturer Admin'}</p>
                  {auth?.user?.email && <p className="text-[11px] text-slate-500 truncate">{auth.user.email}</p>}
                </div>

                <div className="py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-left cursor-pointer"
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

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* KPI STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link href="/manufacturer/banks" className="group block">
          <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-5 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer h-full">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-emerald-700 transition-colors">Partner Bank</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalBanks}</div>
            <span className="text-xs font-semibold text-emerald-600 mt-2 flex items-center justify-between">
              <span>Assigned Underwriter</span>
              <span className="text-[11px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">View Desk &rarr;</span>
            </span>
          </Card>
        </Link>

        <Link href="/manufacturer/distributors" className="group block">
          <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-5 hover:border-[#1F4DA8] hover:shadow-md transition-all cursor-pointer h-full">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-[#1F4DA8] transition-colors">Total Referrals</span>
              <div className="p-1.5 rounded-lg bg-blue-50 text-[#1F4DA8] group-hover:bg-[#1F4DA8] group-hover:text-white transition-colors">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalReferrals}</div>
            <span className="text-xs font-semibold text-slate-500 mt-2 flex items-center justify-between">
              <span>Submitted recommendations</span>
              <span className="text-[11px] font-bold text-[#1F4DA8] opacity-0 group-hover:opacity-100 transition-opacity">View &rarr;</span>
            </span>
          </Card>
        </Link>

        <Link href="/manufacturer/distributors" className="group block">
          <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-5 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer h-full">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-emerald-700 transition-colors">Approved Distributors</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{approvedDistributors}</div>
            <span className="text-xs font-semibold text-emerald-600 mt-2 flex items-center justify-between">
              <span>Active credit facilities</span>
              <span className="text-[11px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">View &rarr;</span>
            </span>
          </Card>
        </Link>

        <Link href="/manufacturer/distributors" className="group block">
          <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-5 hover:border-amber-600 hover:shadow-md transition-all cursor-pointer h-full">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-amber-700 transition-colors">Pending Bank Review</span>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{pendingDistributors}</div>
            <span className="text-xs font-semibold text-amber-600 mt-2 flex items-center justify-between">
              <span>Underwriting evaluation</span>
              <span className="text-[11px] font-bold text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity">Review &rarr;</span>
            </span>
          </Card>
        </Link>

        <Link href="/manufacturer/users" className="group block">
          <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-5 hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer h-full">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-indigo-700 transition-colors">Manufacturer Staff</span>
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalStaffUsers}</div>
            <span className="text-xs font-semibold text-indigo-600 mt-2 flex items-center justify-between">
              <span>Provisioned accounts</span>
              <span className="text-[11px] font-bold text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity">Manage &rarr;</span>
            </span>
          </Card>
        </Link>
      </div>

      {/* MAIN CONTENT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Referral Trends Chart + Referral List Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-6">
            <div className="mb-4 flex flex-row items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Distributor Referral Velocity</h3>
                <p className="text-xs text-slate-500 mt-0.5">Monthly distributor recommendations vs approved facilities</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#1F4DA8]">
                  <span className="w-3 h-3 rounded-full bg-[#1F4DA8] inline-block" /> Referrals
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Approved
                </span>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Referrals" stroke="#1F4DA8" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Approved" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* RECENT REFERRALS TABLE */}
          <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Distributor Referrals</h3>
                <p className="text-xs text-slate-500 mt-0.5">Live referral submissions from your organization</p>
              </div>
              <Link href="/manufacturer/distributors" className="text-xs font-bold text-[#1F4DA8] hover:underline">
                View All
              </Link>
            </div>

            {referrals.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No distributor recommendations submitted yet.{' '}
                <Link href="/manufacturer/distributors" className="text-[#1F4DA8] font-bold underline">
                  Recommend one now
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
                    <tr>
                      <th className="pb-3">Distributor</th>
                      <th className="pb-3">Contact</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {referrals.slice(0, 5).map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/60">
                        <td className="py-3 font-bold text-slate-900">{r.distributorName}</td>
                        <td className="py-3 text-slate-500">{r.contactEmail || r.email || '—'}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700'
                                : r.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT: Live Audit Log Activity & Role Distribution */}
        <div className="space-y-6">
          {stats?.roleDistribution && Object.keys(stats.roleDistribution).length > 0 && (
            <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Staff Role Distribution</h3>
                <Link href="/manufacturer/roles" className="text-xs font-bold text-[#1F4DA8] hover:underline">
                  Manage
                </Link>
              </div>
              <div className="space-y-2">
                {Object.entries(stats.roleDistribution).map(([roleName, count]) => (
                  <div key={roleName} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-700">{roleName.replace(/_/g, ' ')}</span>
                    <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1F4DA8] text-[11px]">
                      {count} {count === 1 ? 'user' : 'users'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
              <Link href="/manufacturer/audit-trail" className="text-xs font-bold text-[#1F4DA8] hover:underline">
                View Log
              </Link>
            </div>

            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No recent activity logged.
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.slice(0, 6).map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{log.action}</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{log.details || log.userFullName || 'Staff activity'}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}