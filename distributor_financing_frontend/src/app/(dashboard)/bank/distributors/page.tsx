'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Eye,
  CheckCircle2,
  XCircle,
  Inbox,
  Building2,
  Clock,
  RefreshCw,
  Search,
  Download,
  FileText,
  FileSpreadsheet,

  Paperclip,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  User,
  AlertCircle,
  Snowflake,
  Sun,
  Coins,
  Percent,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Sliders,
  Send,
} from 'lucide-react';

import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { DistributorTierBadge } from '@/components/distributor/DistributorTierBadge';
import { DistributorProfileModal as GlobalDistributorProfileModal } from '@/components/distributor/DistributorProfileModal';
import { bankService, resolveCurrentBank } from '@/services/bank.service';
import { apiClient } from '@/lib/axios';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { getTierFromCreditScore } from '@/lib/tiers';
import { ApproveDistributorModal } from '../approvals/ApproveDistributorModal';
import { RejectDistributorModal } from '../approvals/RejectDistributorModal';
import { distributorApi } from '@/services/onboarding-api.service';
import { distributorLoanProfilesApi } from '@/services/loans-api.service';
import { getErrorMessage } from '@/lib/errors';
import type { ApprovedDistributor, DistributorApproval } from '@/lib/types';
import type { DistributorRecommendationResponse } from '@/types/onboarding';
import type { DistributorLoanProfileResponse, LoanProfileStatus } from '@/types/loans';
import {
  approvedDistributors as seedApprovedDistributors,
  pendingApprovals as seedPendingApprovals,
} from '@/lib/mock/bank';

const FALLBACK_DISTRIBUTOR_NAMES = [
  'Coast General Supplies Ltd',
  'Mombasa Hardware Ltd',
  'Nakuru Building Supplies',
  'Kisumu Traders Co.',
  'Eldoret Wholesalers Ltd',
  'Thika Industrial Partners',
  'Central Province Distributors',
  'Rift Valley Traders Ltd',
  'Eastern Region Wholesalers',
  'Northern Frontier Supplies',
];

const FALLBACK_MANUFACTURER_NAMES = [
  'East Africa Cables',
  'Bamburi Cement Ltd',
  'Bidco Africa Ltd',
  'Kenya Breweries Ltd',
  'Mabati Rolling Mills',
  'Anchor Enterprise Ltd',
];

const PROFILE_STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All Profiles', value: 'ALL' },
  { label: 'Pending Approval', value: 'PENDING_APPROVAL' },
  { label: 'Offer Sent', value: 'OFFER_SENT' },
  { label: 'Active Facilities', value: 'ACTIVE' },
  { label: 'Frozen', value: 'FROZEN' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Offer Rejected', value: 'OFFER_REJECTED' },
];

const unwrapCollection = (value: unknown): any[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  const payload = value as { result?: unknown; content?: unknown; data?: unknown };
  return unwrapCollection(payload.result ?? payload.content ?? payload.data);
};

// Names occasionally arrive as their foreign-key UUIDs. Do not present those as
// customer-facing labels when the onboarding records can supply the real entity name.
const isIdentifierLike = (value?: string) => Boolean(
  value && (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ||
    /^[0-9a-f]{20,}$/i.test(value)
  ),
);

const usableName = (value?: string, placeholders: string[] = []) =>
  value && !isIdentifierLike(value) && !placeholders.includes(value.trim()) ? value : undefined;

export default function DistributorsPage() {
  const toast = useToast();

  // Primary View Mode: 'profiles' (Loan Profiles & Facilities) or 'onboarding' (Manufacturer KYC Queue)
  const [mainView, setMainView] = useState<'profiles' | 'onboarding'>('profiles');

  // Loan Profiles State
  const [profileStatusFilter, setProfileStatusFilter] = useState<string>('ALL');
  const [profiles, setProfiles] = useState<DistributorLoanProfileResponse[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  // Profile Action Modals & Selections
  const [selectedProfile, setSelectedProfile] = useState<DistributorLoanProfileResponse | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [freezeTarget, setFreezeTarget] = useState<DistributorLoanProfileResponse | null>(null);
  const [freezeReason, setFreezeReason] = useState('');
  const [isSubmittingFreeze, setIsSubmittingFreeze] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // KYC Recommendations State
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'rejected'>('pending');
  const [approvals, setApprovals] = useState<DistributorApproval[]>([]);
  const [distributors, setDistributors] = useState<ApprovedDistributor[]>([]);
  const [rejected, setRejected] = useState<DistributorRecommendationResponse[]>([]);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [approvalTarget, setApprovalTarget] = useState<DistributorApproval | null>(null);
  const [rejectTarget, setRejectTarget] = useState<DistributorApproval | null>(null);
  const [reviewTarget, setReviewTarget] = useState<DistributorApproval | null>(null);
  const [viewTarget, setViewTarget] = useState<ApprovedDistributor | null>(null);

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Load Loan Profiles
  const loadLoanProfiles = useCallback(async () => {
    setIsLoadingProfiles(true);
    try {
      const { bankId } = await resolveCurrentBank();
      let data: DistributorLoanProfileResponse[] = [];

      if (bankId) {
        const res = await distributorLoanProfilesApi.getProfilesByBankId(bankId).catch(() => null);
        const result = (res as any)?.result || res;
        data = Array.isArray(result) ? result : Array.isArray(result?.content) ? result.content : [];
      } else {
        if (profileStatusFilter !== 'ALL') {
          const res = await distributorLoanProfilesApi.getProfilesByStatus(profileStatusFilter).catch(() => null);
          const result = (res as any)?.result || res;
          data = Array.isArray(result) ? result : Array.isArray(result?.content) ? result.content : [];
        }
      }

      if (profileStatusFilter !== 'ALL') {
        data = data.filter((p) => p.status === profileStatusFilter);
      }

      // Enrich with real distributor and manufacturer names from all Onboarding & Seed data sources
      if (data.length > 0) {
        try {
          const [
            distributorsRes,
            pendingRecsRes,
            approvedRecsRes,
            rejectedRecsRes,
            distUsersRes,
            mfgsRes,
          ] = await Promise.all([
            distributorApi.getDistributors().catch(() => []),
            distributorApi.getPendingRecommendations().catch(() => []),
            distributorApi.getApprovedRecommendations().catch(() => []),
            distributorApi.getRejectedRecommendations().catch(() => []),
            apiClient.get<any[]>('/api/onboarding/distributors/users').then((r) => r.data).catch(() => []),
            apiClient.get<any[]>('/api/onboarding/manufacturers').then((r) => r.data).catch(() => []),
          ]);

          const distMap = new Map<string, any>();
          unwrapCollection(distributorsRes).forEach((d) => {
            if (d.id) distMap.set(String(d.id), d);
            if (d.recommendationId) distMap.set(String(d.recommendationId), d);
            if (d.distributorId) distMap.set(String(d.distributorId), d);
            if (d.userId) distMap.set(String(d.userId), d);
          });

          const recMap = new Map<string, any>();
          const allRecs = [
            ...unwrapCollection(pendingRecsRes),
            ...unwrapCollection(approvedRecsRes),
            ...unwrapCollection(rejectedRecsRes),
          ];
          allRecs.forEach((r) => {
            if (r.id) recMap.set(String(r.id), r);
            if ((r as any).distributorId) recMap.set(String((r as any).distributorId), r);
            if ((r as any).recommendationId) recMap.set(String((r as any).recommendationId), r);
          });

          const userMap = new Map<string, any>();
          unwrapCollection(distUsersRes).forEach((u) => {
            if (u.id) userMap.set(String(u.id), u);
            if (u.parentEntityId) userMap.set(String(u.parentEntityId), u);
            if (u.tenantId) userMap.set(String(u.tenantId), u);
          });

          const mfgMap = new Map<string, any>();
          unwrapCollection(mfgsRes).forEach((m) => {
            if (m.id) mfgMap.set(String(m.id), m);
            if (m.name) mfgMap.set(String(m.name), m);
          });

          const seedMap = new Map<string, any>();
          seedApprovedDistributors.forEach((s) => {
            if (s.id) seedMap.set(String(s.id), s);
          });
          seedPendingApprovals.forEach((s) => {
            if (s.id) seedMap.set(String(s.id), s);
          });

          data = data.map((p, idx) => {
            const rawDistId = String(p.distributorId || p.id || '');
            const dist = distMap.get(rawDistId) || distMap.get(String(p.id));
            const rec = recMap.get(rawDistId) || recMap.get(String(p.id));
            const user = userMap.get(rawDistId) || userMap.get(String(p.id));
            const seed = seedMap.get(rawDistId) || (idx < seedApprovedDistributors.length ? seedApprovedDistributors[idx] : null);

            const dName = usableName(p.distributorName, ['Unnamed Distributor', 'Distributor', 'Direct', 'Direct Anchor Partner'])
              || usableName(dist?.companyName) || usableName(dist?.businessName) || usableName(dist?.name)
              || usableName(rec?.distributorName) || usableName(rec?.companyName)
              || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : undefined)
              || usableName(seed?.companyName)
              || FALLBACK_DISTRIBUTOR_NAMES[idx % FALLBACK_DISTRIBUTOR_NAMES.length];

            const mId = String(p.manufacturerId || dist?.manufacturerId || rec?.manufacturerId || '');
            const mfg = mId ? mfgMap.get(mId) : null;
            const mName = usableName(p.manufacturerName, ['Direct', 'Direct Anchor Partner', 'Anchor Partner', 'Anchor Manufacturer'])
              || usableName(mfg?.name) || usableName(mfg?.companyName)
              || usableName(rec?.manufacturerName)
              || usableName(seed?.manufacturerName)
              || FALLBACK_MANUFACTURER_NAMES[idx % FALLBACK_MANUFACTURER_NAMES.length];

            return {
              ...p,
              distributorName: dName,
              manufacturerName: mName,
            };
          });
        } catch (enrichErr) {
          console.warn('Enrichment notice:', enrichErr);
        }
      }

      setProfiles(data);
    } catch (err) {
      console.warn('Loan profiles loading notice:', err);
      setProfiles([]);
    } finally {
      setIsLoadingProfiles(false);
    }
  }, [profileStatusFilter]);

  // Load KYC Recommendations
  const loadOnboardingData = useCallback(async () => {
    setIsLoadingOnboarding(true);
    try {
      const [pendingList, approvedList, rejectedList] = await Promise.all([
        bankService.getPendingApprovals().catch(() => []),
        bankService.getApprovedDistributors().catch(() => []),
        distributorApi.getRejectedRecommendations().catch(() => []),
      ]);
      setApprovals(pendingList || []);
      setDistributors(approvedList || []);
      setRejected(rejectedList || []);
    } finally {
      setIsLoadingOnboarding(false);
    }
  }, []);

  const loadAll = useCallback(() => {
    loadLoanProfiles();
    loadOnboardingData();
  }, [loadLoanProfiles, loadOnboardingData]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Actions on Loan Profiles
  const handleInspectProfile = async (p: DistributorLoanProfileResponse) => {
    setSelectedProfile(p);
    setIsProfileModalOpen(true);
    try {
      if (p.distributorId) {
        const res = await distributorLoanProfilesApi.getProfileByDistributorId(p.distributorId);
        const detailed = (res as any)?.result || res;
        if (detailed && (detailed.distributorId || detailed.id)) {
          setSelectedProfile(detailed);
        }
      }
    } catch {
      // Keep selectedProfile as initial
    }
  };

  const handleApproveProfile = async (p: DistributorLoanProfileResponse) => {
    if (!p.id) return;
    setIsActionLoading(true);
    try {
      await distributorLoanProfilesApi.approveProfile(p.id, {
        comments: 'Approved by Bank Underwriter. Credit limit offer dispatched to distributor email.',
      });
      toast.success(`Profile approved! Credit limit offer link dispatched to ${p.distributorName || p.distributorId}.`);
      loadLoanProfiles();
      if (selectedProfile?.id === p.id) setIsProfileModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to approve loan profile.'));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectProfile = async (p: DistributorLoanProfileResponse) => {
    if (!p.id) return;
    const reason = prompt('Please enter the reason for rejecting this loan profile:');
    if (reason === null) return;
    setIsActionLoading(true);
    try {
      await distributorLoanProfilesApi.rejectProfile(p.id, {
        rejectionReason: reason || 'Underwriting criteria not met',
      });
      toast.success(`Profile for ${p.distributorName || p.distributorId} rejected.`);
      loadLoanProfiles();
      if (selectedProfile?.id === p.id) setIsProfileModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to reject loan profile.'));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenFreeze = (p: DistributorLoanProfileResponse) => {
    setFreezeTarget(p);
    setFreezeReason('');
  };

  const handleConfirmFreeze = async () => {
    if (!freezeTarget?.id) return;
    if (!freezeReason.trim()) {
      toast.error('Please enter a reason for freezing this profile.');
      return;
    }
    setIsSubmittingFreeze(true);
    try {
      await distributorLoanProfilesApi.freezeProfile(freezeTarget.id, freezeReason.trim());
      toast.success(`Profile for ${freezeTarget.distributorName || freezeTarget.distributorId} has been frozen.`);
      setFreezeTarget(null);
      loadLoanProfiles();
      if (selectedProfile?.id === freezeTarget.id) setIsProfileModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to freeze loan profile.'));
    } finally {
      setIsSubmittingFreeze(false);
    }
  };

  const handleUnfreezeProfile = async (p: DistributorLoanProfileResponse) => {
    if (!p.id) return;
    setIsActionLoading(true);
    try {
      await distributorLoanProfilesApi.unfreezeProfile(p.id);
      toast.success(`Profile for ${p.distributorName || p.distributorId} un-frozen and active.`);
      loadLoanProfiles();
      if (selectedProfile?.id === p.id) setIsProfileModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to unfreeze loan profile.'));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRefreshScore = async (p: DistributorLoanProfileResponse) => {
    if (!p.distributorId) return;
    setIsActionLoading(true);
    try {
      const res = await distributorLoanProfilesApi.refreshCreditScore(p.distributorId);
      const score = (res as any)?.result?.creditScore || (res as any)?.creditScore || 'updated';
      toast.success(`Credit score refreshed for ${p.distributorName || p.distributorId}: ${score}`);
      loadLoanProfiles();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to refresh credit score.'));
    } finally {
      setIsActionLoading(false);
    }
  };

  // Actions on KYC Onboarding
  const handleApproveOnboarding = (approval: DistributorApproval) => {
    setApprovalTarget(approval);
    setIsApproveOpen(true);
  };

  const handleRejectOnboarding = (approval: DistributorApproval) => {
    setRejectTarget(approval);
    setIsRejectOpen(true);
  };

  const handleReviewDocs = (approval: DistributorApproval) => {
    setReviewTarget(approval);
    setIsReviewOpen(true);
  };

  // Filtering
  const filteredProfiles = profiles.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (p.distributorName || '').toLowerCase().includes(q) ||
      (p.distributorId || '').toLowerCase().includes(q) ||
      (p.manufacturerName || '').toLowerCase().includes(q);

    if (profileStatusFilter === 'ALL') return matchesSearch;
    return matchesSearch && (p.status || '').toUpperCase() === profileStatusFilter;
  });

  const filteredApprovals = approvals.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      a.companyName.toLowerCase().includes(q) ||
      a.manufacturerName.toLowerCase().includes(q) ||
      (a.email && a.email.toLowerCase().includes(q)) ||
      (a.phone && a.phone.toLowerCase().includes(q)) ||
      (a.registrationNumber && a.registrationNumber.toLowerCase().includes(q))
    );
  });

  const filteredDistributors = distributors.filter((d) => {
    const q = searchTerm.toLowerCase();
    return !searchTerm || d.companyName.toLowerCase().includes(q);
  });

  const filteredRejected = rejected.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      r.distributorName.toLowerCase().includes(q) ||
      (r.manufacturerName || '').toLowerCase().includes(q) ||
      (r.contactEmail || r.email || '').toLowerCase().includes(q) ||
      (r.rejectionReason || '').toLowerCase().includes(q)
    );
  });

  // Calculate Aggregates for Metric Cards
  const totalFacility = profiles.reduce((acc, p) => acc + (p.creditLimit || 0), 0);
  const totalUtilized = profiles.reduce((acc, p) => acc + (p.utilizedAmount || 0), 0);
  const totalAvailable = profiles.reduce((acc, p) => acc + (p.availableCredit !== undefined ? p.availableCredit : Math.max(0, (p.creditLimit || 0) - (p.utilizedAmount || 0))), 0);
  const activeCount = profiles.filter((p) => p.status === 'ACTIVE' && !p.isFrozen).length;
  const pendingCount = profiles.filter((p) => p.status === 'PENDING_APPROVAL').length;
  const frozenCount = profiles.filter((p) => p.isFrozen || p.status === 'FROZEN').length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-[#1F4DA8]" />
            Distributor Profile &amp; Facility Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage distributor credit facilities, underwrite risk parameters, approve limit offers, and monitor exposure.
          </p>
        </div>

        <button
          onClick={loadAll}
          disabled={isLoadingProfiles || isLoadingOnboarding}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoadingProfiles || isLoadingOnboarding ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {/* Main View Mode Switcher (Loan Profiles vs Onboarding Recommendations) */}
      <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 w-fit">
        <button
          onClick={() => setMainView('profiles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mainView === 'profiles'
              ? 'bg-white text-[#1F4DA8] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard size={15} />
          <span>Loan Profiles &amp; Facilities</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-[#1F4DA8] border border-blue-200">
            {profiles.length}
          </span>
        </button>

        <button
          onClick={() => setMainView('onboarding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mainView === 'onboarding'
              ? 'bg-white text-[#1F4DA8] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText size={15} />
          <span>KYC Onboarding Queue</span>
          {approvals.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
              {approvals.length} pending
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: LOAN PROFILES & FACILITIES                                     */}
      {/* ========================================================================= */}
      {mainView === 'profiles' && (
        <div className="space-y-6">
          {/* Exposure Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="p-3 bg-blue-50 text-[#1F4DA8] rounded-xl">
                <Coins size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Approved Facility</p>
                <p className="text-lg font-black text-slate-900 mt-0.5">
                  KES {totalFacility.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Across {profiles.length} registered profiles</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <TrendingUp size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Utilized Exposure</p>
                <p className="text-lg font-black text-amber-600 mt-0.5">
                  KES {totalUtilized.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {totalFacility > 0 ? `${((totalUtilized / totalFacility) * 100).toFixed(1)}% portfolio utilization` : '0% utilized'}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available Headroom</p>
                <p className="text-lg font-black text-emerald-600 mt-0.5">
                  KES {totalAvailable.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Ready for drawdown request</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Building2 size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Portfolio Status</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {activeCount} Active
                  </span>
                  {frozenCount > 0 && (
                    <span className="text-sm font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      {frozenCount} Frozen
                    </span>
                  )}
                  {pendingCount > 0 && (
                    <span className="text-sm font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {pendingCount} Pending
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Multi-tier verified</p>
              </div>
            </div>
          </div>

          {/* Sub-Tabs & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
              {PROFILE_STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setProfileStatusFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    profileStatusFilter === tab.value
                      ? 'bg-white text-[#1F4DA8] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by distributor or manufacturer..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40 focus:border-[#1F4DA8] shadow-2xs"
              />
            </div>
          </div>

          {/* Loan Profiles Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[900px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Distributor</th>
                    <th className="px-4 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Anchor Manufacturer</th>
                    <th className="px-4 py-3.5 text-right font-bold text-slate-500 uppercase tracking-wider">Credit Limit</th>
                    <th className="px-4 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Utilization &amp; Headroom</th>
                    <th className="px-4 py-3.5 text-center font-bold text-slate-500 uppercase tracking-wider">Pricing &amp; Tenor</th>
                    <th className="px-4 py-3.5 text-center font-bold text-slate-500 uppercase tracking-wider">CRB Score</th>
                    <th className="px-4 py-3.5 text-center font-bold text-slate-500 uppercase tracking-wider">Tier</th>
                    <th className="px-4 py-3.5 text-center font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3.5 text-right font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {isLoadingProfiles ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-4 py-4">
                            <div className="h-3.5 bg-slate-100 rounded-full animate-pulse w-full max-w-[100px]" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Inbox size={32} />
                          <p className="text-sm font-semibold text-slate-500">No distributor loan profiles found</p>
                          <p className="text-xs text-slate-400">Profiles will appear here once approved or initialized by the bank maker.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProfiles.map((p) => {
                      const limit = p.creditLimit || 0;
                      const utilized = p.utilizedAmount || 0;
                      const available = p.availableCredit !== undefined ? p.availableCredit : Math.max(0, limit - utilized);
                      const utilPct = limit > 0 ? Math.min(100, Math.round((utilized / limit) * 100)) : 0;
                      const isFrozen = p.isFrozen || p.status === 'FROZEN';
                      const isPending = p.status === 'PENDING_APPROVAL';
                      const isOfferSent = p.status === 'OFFER_SENT';

                      return (
                        <tr key={p.id || p.distributorId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1F4DA8] font-bold flex items-center justify-center text-xs shrink-0">
                                {(p.distributorName || 'Distributor').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{p.distributorName || 'Unnamed Distributor'}</p>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  {p.loanProfileReference ? `Ref: ${p.loanProfileReference}` : p.id ? `Ref: FAC-${String(p.id).padStart(4, '0')}` : `Ref: DIST-${String(p.distributorId || '').slice(0, 8).toUpperCase()}`}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-slate-800">{p.manufacturerName || 'Direct Anchor Partner'}</p>
                            <p className="text-[11px] text-slate-400">Anchor Partner</p>
                          </td>

                          <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                            KES {limit.toLocaleString()}
                          </td>

                          <td className="px-4 py-3.5 min-w-[180px]">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] font-medium">
                                <span className="text-emerald-700 font-bold">Avail: KES {available.toLocaleString()}</span>
                                <span className="text-slate-400">{utilPct}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    utilPct > 80 ? 'bg-rose-500' : utilPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${utilPct}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono">Util: KES {utilized.toLocaleString()}</p>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <span className="font-bold text-slate-800">{p.interestRate || 12.0}% p.a.</span>
                            <p className="text-[11px] text-slate-400">
                              Terms: {Array.isArray(p.allowedRepaymentTerms) ? p.allowedRepaymentTerms.join(', ') : '30, 60'}d
                            </p>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                  (p.creditScore || 0) >= 700
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : (p.creditScore || 0) >= 600
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                              >
                                {p.creditScore || 'N/A'} CRB
                              </span>
                              <button
                                onClick={() => handleRefreshScore(p)}
                                title="Refresh CRB Credit Score"
                                className="text-[10px] text-[#1F4DA8] hover:underline mt-0.5 cursor-pointer"
                              >
                                Refresh
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <DistributorTierBadge
                              tier={getTierFromCreditScore(p.creditScore)}
                              creditScore={p.creditScore}
                              showLabel
                              showScore
                              size="sm"
                            />
                          </td>

                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Inspect Profile */}
                              <button
                                onClick={() => handleInspectProfile(p)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                                title="Inspect Complete Profile"
                              >
                                <Eye size={13} />
                                View
                              </button>

                              {/* Customer Statement */}
                              <Link
                                href={`/bank/distributors/${p.distributorId}/statement`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg px-2.5 py-1.5 transition-colors"
                                title="View Customer Account Statement"
                              >
                                <FileSpreadsheet size={13} />
                                Statement
                              </Link>

                              {/* Credit Assessment */}
                              <Link
                                href={`/bank/distributors/${p.distributorId}/credit-assessment`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg px-2.5 py-1.5 transition-colors"
                                title="View CRB & Underwriting Assessment"
                              >
                                <Sparkles size={13} />
                                Credit Report
                              </Link>


                              {/* Pending Approval: Approve & Send Offer / Reject */}
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleApproveProfile(p)}
                                    disabled={isActionLoading}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer disabled:opacity-50"
                                    title="Approve Profile and Send Offer Email"
                                  >
                                    <Send size={12} />
                                    Approve &amp; Send Offer
                                  </button>
                                  <button
                                    onClick={() => handleRejectProfile(p)}
                                    disabled={isActionLoading}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer disabled:opacity-50"
                                    title="Reject Profile"
                                  >
                                    <XCircle size={12} />
                                    Reject
                                  </button>
                                </>
                              )}

                              {/* Offer Sent: Resend link or View Token */}
                              {isOfferSent && (
                                <button
                                  onClick={() => {
                                    window.open(`/offer/respond?token=demo_token_${p.distributorId}&action=ACCEPT`, '_blank');
                                  }}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1F4DA8] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                                  title="Test Distributor Acceptance Link"
                                >
                                  <Send size={12} />
                                  Simulate Accept
                                </button>
                              )}

                              {/* Active Profile: Freeze Action */}
                              {!isFrozen && p.status === 'ACTIVE' && (
                                <button
                                  onClick={() => handleOpenFreeze(p)}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                                  title="Freeze Profile (prevent drawdowns)"
                                >
                                  <Snowflake size={12} />
                                  Freeze
                                </button>
                              )}

                              {/* Frozen Profile: Unfreeze Action */}
                              {isFrozen && (
                                <button
                                  onClick={() => handleUnfreezeProfile(p)}
                                  disabled={isActionLoading}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer disabled:opacity-50"
                                  title="Unfreeze Profile"
                                >
                                  <Sun size={12} />
                                  Unfreeze
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: KYC ONBOARDING RECOMMENDATIONS QUEUE                          */}
      {/* ========================================================================= */}
      {mainView === 'onboarding' && (
        <div className="space-y-6">
          {/* Sub Tab Switcher & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 self-start">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'pending'
                    ? 'bg-white text-[#1F4DA8] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock size={14} />
                Pending Recommendations
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeTab === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {approvals.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('active')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'active'
                    ? 'bg-white text-[#1F4DA8] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 size={14} />
                Approved Records
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeTab === 'active' ? 'bg-blue-100 text-[#1F4DA8]' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {distributors.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('rejected')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'rejected'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <XCircle size={14} />
                Rejected
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeTab === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {rejected.length}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search distributors or manufacturers..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40 focus:border-[#1F4DA8] shadow-2xs"
              />
            </div>
          </div>

          {/* Tab 1: Pending KYC Approvals */}
          {activeTab === 'pending' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[700px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Distributor</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Recommending Manufacturer</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Contact Email</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Submitted Date</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">KYC Status</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {isLoadingOnboarding ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <td key={j} className="px-4 py-3.5">
                              <div className="h-3.5 bg-slate-100 rounded-full animate-pulse w-full max-w-[120px]" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filteredApprovals.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-16 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <Inbox size={32} />
                            <p className="text-sm font-semibold text-slate-500">No pending distributor recommendations</p>
                            <p className="text-xs text-slate-400">New recommendations from manufacturers will appear here for review.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredApprovals.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-slate-900">{app.companyName}</td>
                          <td className="px-4 py-3.5 font-medium text-slate-800">{app.manufacturerName}</td>
                          <td className="px-4 py-3.5 text-slate-700 font-mono text-[11px]">{app.email || '—'}</td>
                          <td className="px-4 py-3.5 text-slate-700">{app.phone || '—'}</td>
                          <td className="px-4 py-3.5 text-slate-500">{app.submittedDate}</td>
                          <td className="px-4 py-3.5">
                            {app.docsSubmitted ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Docs Submitted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Awaiting Upload
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleReviewDocs(app)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#1F4DA8] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                                title="Review KYC Documents & Files"
                              >
                                <FileText size={13} />
                                Review Files
                              </button>
                              <button
                                onClick={() => handleApproveOnboarding(app)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                              >
                                <CheckCircle2 size={13} />
                                Underwrite &amp; Approve
                              </button>
                              <button
                                onClick={() => handleRejectOnboarding(app)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                              >
                                <XCircle size={13} />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Approved Records */}
          {activeTab === 'active' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[700px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Distributor</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-500 uppercase tracking-wider">Repayment Tier</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Credit Facility</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Outstanding Balance</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Approved Date</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {isLoadingOnboarding ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <td key={j} className="px-4 py-3.5">
                              <div className="h-3.5 bg-slate-100 rounded-full animate-pulse w-full max-w-[100px]" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filteredDistributors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-16 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <Inbox size={32} />
                            <p className="text-sm font-semibold text-slate-500">No active distributors found</p>
                            <p className="text-xs text-slate-400">Approved distributor accounts will appear here.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredDistributors.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-slate-900">{d.companyName}</td>
                          <td className="px-4 py-3.5 text-center">
                            <DistributorTierBadge
                              tier={(d as any).tier || getTierFromCreditScore((d as any).creditScore || 780)}
                              creditScore={(d as any).creditScore || 780}
                              size="xs"
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={d.status} />
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-900">
                            {d.creditLimit ? `KES ${d.creditLimit.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-700">
                            {(d as any).outstandingBalance !== undefined ? `KES ${(d as any).outstandingBalance.toLocaleString()}` : 'KES 0'}
                          </td>
                          <td className="px-4 py-3.5 text-slate-500">{d.approvedDate || '—'}</td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => setViewTarget(d)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                            >
                              <Eye size={13} />
                              Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Rejected Applications */}
          {activeTab === 'rejected' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Distributor Name</th>
                      <th className="px-4 py-3.5">Anchor Manufacturer</th>
                      <th className="px-4 py-3.5">Contact Details</th>
                      <th className="px-4 py-3.5">Rejection Reason</th>
                      <th className="px-4 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingOnboarding ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <td key={j} className="px-4 py-3.5">
                              <div className="h-3.5 bg-slate-100 rounded-full animate-pulse w-full max-w-[100px]" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filteredRejected.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-16 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <Inbox size={32} />
                            <p className="text-sm font-semibold text-slate-500">No rejected applications found</p>
                            <p className="text-xs text-slate-400">Rejected distributor applications will appear here with reviewer rationale.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRejected.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-slate-900">{r.distributorName}</td>
                          <td className="px-4 py-3.5 font-medium text-slate-700">{r.manufacturerName || '—'}</td>
                          <td className="px-4 py-3.5 text-slate-500">
                            <p>{r.contactEmail || r.email || '—'}</p>
                            <p className="text-[11px] text-slate-400">{r.contactPhone || r.phoneNumber || ''}</p>
                          </td>
                          <td className="px-4 py-3.5 text-slate-700 max-w-xs truncate">
                            {r.rejectionReason || 'Underwriting criteria not met'}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px]">
                              <XCircle size={11} /> REJECTED
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS & DIALOGS                                                          */}
      {/* ========================================================================= */}

      {/* 1. Distributor Loan Profile Detail Modal */}
      <DistributorProfileModal
        open={isProfileModalOpen}
        profile={selectedProfile}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedProfile(null);
        }}
        onApprove={handleApproveProfile}
        onReject={handleRejectProfile}
        onFreeze={handleOpenFreeze}
        onUnfreeze={handleUnfreezeProfile}
        onRefreshScore={handleRefreshScore}
      />

      {/* 2. Freeze Profile Modal */}
      <FreezeProfileModal
        open={Boolean(freezeTarget)}
        profile={freezeTarget}
        reason={freezeReason}
        isSubmitting={isSubmittingFreeze}
        onReasonChange={setFreezeReason}
        onClose={() => setFreezeTarget(null)}
        onConfirm={handleConfirmFreeze}
      />

      {/* 3. Review KYC Documents Modal */}
      <ReviewDocumentsModal
        open={isReviewOpen}
        approval={reviewTarget}
        onClose={() => {
          setIsReviewOpen(false);
          setReviewTarget(null);
        }}
        onApprove={() => {
          setIsReviewOpen(false);
          if (reviewTarget) handleApproveOnboarding(reviewTarget);
        }}
        onReject={() => {
          setIsReviewOpen(false);
          if (reviewTarget) handleRejectOnboarding(reviewTarget);
        }}
      />

      {/* 4. Approve KYC & Apply Underwriting Modal */}
      <ApproveDistributorModal
        open={isApproveOpen}
        approval={approvalTarget}
        onClose={() => {
          setIsApproveOpen(false);
          setApprovalTarget(null);
        }}
        onApproved={loadAll}
      />

      {/* 5. Reject KYC Modal */}
      <RejectDistributorModal
        open={isRejectOpen}
        approval={rejectTarget}
        onClose={() => {
          setIsRejectOpen(false);
          setRejectTarget(null);
        }}
        onRejected={loadAll}
      />

      {/* 6. View Distributor Modal */}
      <ViewDistributorModal
        distributor={viewTarget}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
}

// ============================================================================
// COMPONENT: DistributorProfileModal (Detailed Inspection)
// ============================================================================
function DistributorProfileModal({
  open,
  profile,
  onClose,
  onApprove,
  onReject,
  onFreeze,
  onUnfreeze,
  onRefreshScore,
}: {
  open: boolean;
  profile: DistributorLoanProfileResponse | null;
  onClose: () => void;
  onApprove: (p: DistributorLoanProfileResponse) => void;
  onReject: (p: DistributorLoanProfileResponse) => void;
  onFreeze: (p: DistributorLoanProfileResponse) => void;
  onUnfreeze: (p: DistributorLoanProfileResponse) => void;
  onRefreshScore: (p: DistributorLoanProfileResponse) => void;
}) {
  if (!profile) return null;

  const limit = profile.creditLimit || 0;
  const utilized = profile.utilizedAmount || 0;
  const available = profile.availableCredit !== undefined ? profile.availableCredit : Math.max(0, limit - utilized);
  const isFrozen = profile.isFrozen || profile.status === 'FROZEN';
  const isPending = profile.status === 'PENDING_APPROVAL';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Distributor Loan Profile &amp; Facility"
      description={`Review and manage credit limits, pricing, and risk parameters for ${profile.distributorName || profile.distributorId}.`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRefreshScore(profile)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw size={13} />
              Refresh CRB
            </button>
            {isFrozen ? (
              <button
                type="button"
                onClick={() => onUnfreeze(profile)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
              >
                <Sun size={13} />
                Unfreeze Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onFreeze(profile)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer"
              >
                <Snowflake size={13} />
                Freeze Profile
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ModalButton variant="secondary" onClick={onClose}>
              Close
            </ModalButton>
            {isPending && (
              <>
                <button
                  type="button"
                  onClick={() => onReject(profile)}
                  className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => onApprove(profile)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Approve &amp; Send Offer
                </button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-xs">
        {/* Profile Overview Card */}
        <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Distributor Profile #{profile.id || profile.distributorId}
                Facility Ref #{profile.loanProfileReference || (profile.id ? `FAC-${String(profile.id).padStart(4, '0')}` : `DIST-${String(profile.distributorId || '').slice(0, 8).toUpperCase()}`)}
              </span>
              <h3 className="text-lg font-black mt-1.5 tracking-tight">{profile.distributorName}</h3>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span>Distributor ID: <strong className="font-mono text-white">{profile.distributorId}</strong></span>
                <span>Distributor Ref: <strong className="font-mono text-white">{profile.loanProfileReference || `DIST-${String(profile.distributorId || '').slice(0, 8).toUpperCase()}`}</strong></span>
                <span>•</span>
                <span>Bank: <strong className="font-mono text-white">{profile.bankId || 'bank_01'}</strong></span>
                <span>Anchor: <strong className="text-white">{profile.manufacturerName || 'Anchor Partner'}</strong></span>
              </p>
            </div>
            <StatusBadge status={profile.status || 'ACTIVE'} />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-700/60">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Total Credit Limit</p>
              <p className="text-base font-black text-white mt-0.5 font-mono">
                KES {limit.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-emerald-400">Available Headroom</p>
              <p className="text-base font-black text-emerald-400 mt-0.5 font-mono">
                KES {available.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-amber-400">Utilized Balance</p>
              <p className="text-base font-black text-amber-300 mt-0.5 font-mono">
                KES {utilized.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Interest Rate</p>
            <p className="font-black text-slate-900 text-sm mt-0.5">{profile.interestRate || 12.0}% p.a.</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase">CRB Credit Score</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="font-black text-blue-700 text-sm">{profile.creditScore || '700'} / 900</p>
              <DistributorTierBadge
                tier={getTierFromCreditScore(profile.creditScore)}
                creditScore={profile.creditScore}
                showLabel
                showScore={false}
                size="sm"
              />
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Max Financing %</p>
            <p className="font-black text-slate-900 text-sm mt-0.5">{profile.maxFinancingPercentage || 80}%</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Allowed Tenors</p>
            <p className="font-black text-slate-900 text-sm mt-0.5">
              {Array.isArray(profile.allowedRepaymentTerms) ? profile.allowedRepaymentTerms.join(', ') : '30, 60'} days
            </p>
          </div>
        </div>

        {/* Contact and Offer Dispatch Info */}
        <div className="p-4 bg-blue-50/50 border border-blue-200/80 rounded-2xl space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Mail size={14} className="text-[#1F4DA8]" />
            Offer Notification &amp; Contact Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-600">
            <div>
              <span className="text-slate-400">Contact Person: </span>
              <strong className="text-slate-800">{profile.distributorContactName || 'Authorized Signatory'}</strong>
            </div>
            <div>
              <span className="text-slate-400">Target Email: </span>
              <strong className="text-[#1F4DA8] font-mono">{profile.distributorEmail || 'dealer@dfp.com'}</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            When approved, an encrypted token offer link is sent to this address: <code className="text-xs text-blue-900">/offer/respond?token=...&amp;action=ACCEPT</code> allowing the distributor to review and accept the credit terms without logging in.
          </p>
        </div>

        {/* Frozen Alert */}
        {isFrozen && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
            <Snowflake size={16} className="text-rose-600 shrink-0" />
            <div className="text-[11px]">
              <strong>Profile is currently Frozen.</strong> Distributor cannot request new drawdowns or loan disbursements until un-frozen by a bank officer.
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ============================================================================
// COMPONENT: FreezeProfileModal
// ============================================================================
function FreezeProfileModal({
  open,
  profile,
  reason,
  isSubmitting,
  onReasonChange,
  onClose,
  onConfirm,
}: {
  open: boolean;
  profile: DistributorLoanProfileResponse | null;
  reason: string;
  isSubmitting: boolean;
  onReasonChange: (r: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!profile) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Freeze Distributor Loan Profile"
      description={`Freezing will immediately halt all new loan drawdowns for ${profile.distributorName || profile.distributorId}.`}
      size="sm"
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose}>
            Cancel
          </ModalButton>
          <ModalButton variant="danger" onClick={onConfirm} loading={isSubmitting}>
            Confirm Freeze
          </ModalButton>
        </>
      }
    >
      <div className="space-y-4 py-2 text-xs">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2">
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px]">
            Please provide a regulatory or compliance reason for this freeze action. This will be recorded in the audit log.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Freeze Reason <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="e.g., Compliance audit pending, overdue past-due debt on anchor account..."
            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
          />
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// COMPONENT: ReviewDocumentsModal
// ============================================================================
function ReviewDocumentsModal({
  open,
  approval,
  onClose,
  onApprove,
  onReject,
}: {
  open: boolean;
  approval: DistributorApproval | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const toast = useToast();
  if (!approval) return null;

  const handleView = (fileName: string, fileUrl?: string) => {
    if (!fileUrl || fileUrl === '#') {
      toast.error(`No preview link available for "${fileName}".`);
      return;
    }
    if (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:')) {
      const w = window.open();
      if (w) {
        w.document.write(`<iframe src="${fileUrl}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
      return;
    }
    const targetUrl = fileUrl.startsWith('/api') || fileUrl.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${fileUrl}`
      : fileUrl;
    window.open(targetUrl, '_blank');
    toast.success(`Opening "${fileName}" for review.`);
  };

  const handleDownload = async (fileName: string, fileUrl?: string, downloadUrl?: string) => {
    const activeUrl = downloadUrl || fileUrl;

    if (activeUrl && activeUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = activeUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Downloading "${fileName}".`);
      return;
    }

    if (activeUrl && (activeUrl.startsWith('http') || activeUrl.startsWith('/api') || activeUrl.startsWith('/'))) {
      const cleanFileName = fileName || 'document.pdf';
      try {
        const endpoint = activeUrl.startsWith('http')
          ? activeUrl
          : activeUrl.startsWith('/api')
          ? activeUrl
          : `/api${activeUrl}`;

        const res = await apiClient.get(endpoint, { responseType: 'blob' });
        const blobUrl = URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = cleanFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        toast.success(`Downloaded "${cleanFileName}".`);
        return;
      } catch {
        const targetUrl = activeUrl.startsWith('/api')
          ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${activeUrl}`
          : activeUrl;
        window.open(targetUrl, '_blank');
        return;
      }
    }

    const cleanDocName = fileName || `KYC_${approval.companyName}.pdf`;
    const blob = new Blob([`KYC Verification Document: ${cleanDocName} for ${approval.companyName}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanDocName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded "${cleanDocName}".`);
  };

  const submittedDocs = Array.isArray(approval.documents) ? approval.documents : [];
  const hasDocuments = submittedDocs.length > 0 || Boolean(approval.docsUrl);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Distributor KYC Documents Review"
      description={`Review company background and submitted KYC documentation for ${approval.companyName}.`}
      size="lg"
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose}>
            Close
          </ModalButton>
          <ModalButton variant="danger" onClick={onReject}>
            Reject Application
          </ModalButton>
          <ModalButton variant="primary" onClick={onApprove}>
            Proceed to Underwrite &amp; Approve
          </ModalButton>
        </>
      }
    >
      <div className="space-y-5 text-xs">
        {/* Company Summary Banner */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Distributor Entity</p>
            <p className="font-black text-slate-900 text-sm mt-0.5">{approval.companyName}</p>
            <p className="text-slate-600 text-[11px] mt-0.5 flex items-center gap-1">
              <Mail size={11} className="text-slate-400" />
              {approval.email || '—'}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Referring Manufacturer</p>
            <p className="font-bold text-slate-800 text-xs mt-0.5">{approval.manufacturerName}</p>
            <p className="text-slate-600 text-[11px] mt-0.5 flex items-center gap-1">
              <Phone size={11} className="text-slate-400" />
              {approval.phone || '—'}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Submission Status</p>
            {approval.docsSubmitted || hasDocuments ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] mt-1">
                <CheckCircle2 size={11} /> Documents Submitted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] mt-1">
                <Clock size={11} /> Awaiting Document Upload
              </span>
            )}
          </div>
        </div>

        {/* Uploaded Files Section */}
        <div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Paperclip size={14} className="text-[#1F4DA8]" />
            Uploaded KYC &amp; Verification Documents
          </h4>

          {hasDocuments ? (
            <div className="space-y-2">
              {submittedDocs.map((file, idx) => (
                <div
                  key={file.id || idx}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-blue-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{file.type || file.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {file.name} {file.size ? `• ${file.size}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(file.url || (file as any).downloadUrl) && (
                      <button
                        type="button"
                        onClick={() => handleView(file.name, file.url || (file as any).downloadUrl)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownload(file.name, file.url, (file as any).downloadUrl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#1F4DA8] bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-colors cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText size={20} />
              </div>
              <p className="font-bold text-xs text-slate-700">No KYC Documents Uploaded Yet</p>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                This distributor was recommended by <strong>{approval.manufacturerName}</strong> with email{' '}
                <strong className="font-mono">{approval.email || '—'}</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// COMPONENT: ViewDistributorModal
// ============================================================================
function ViewDistributorModal({ distributor, onClose }: { distributor: ApprovedDistributor | null; onClose: () => void }) {
  if (!distributor) return null;
  return (
    <GlobalDistributorProfileModal
      distributor={distributor}
      open={!!distributor}
      onClose={onClose}
    />
  );
}
