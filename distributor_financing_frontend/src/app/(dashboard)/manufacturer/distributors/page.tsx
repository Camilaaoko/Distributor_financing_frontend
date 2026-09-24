'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Mail,
  Phone,
  ArrowUpRight,
  FileCheck2,
  Send,
} from 'lucide-react';
import { distributorApi } from '@/services/onboarding-api.service';
import { notificationsService } from '@/services/notifications.service';
import { apiClient } from '@/lib/axios';
import { useAuthContext } from '@/providers/AuthProvider';

import type { DistributorRecommendationResponse } from '@/types/onboarding';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import { DistributorTierBadge } from '@/components/distributor/DistributorTierBadge';
import { getErrorMessage } from '@/lib/errors';

const PHONE_REGEX = /^(?:(07|01)\d{8}|\+254\d{9})$/;

export default function ManufacturerDistributorsPage() {
  const toast = useToast();
  const { user } = useAuthContext();
  const [recommendations, setRecommendations] = useState<DistributorRecommendationResponse[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Recommend Modal State
  const [recommendModalOpen, setRecommendModalOpen] = useState(false);
  const [distributorName, setDistributorName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch recommendations submitted by this manufacturer
      let data: DistributorRecommendationResponse[] = [];
      try {
        data = await distributorApi.getManufacturerRecommendations();
      } catch {
        data = await distributorApi.getPendingRecommendations();
      }
      setRecommendations(data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load distributor recommendations.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenRecommend = () => {
    setDistributorName('');
    setEmail('');
    setPhone('');
    setModalError(null);
    setRecommendModalOpen(true);
  };

  const handleRecommend = async () => {
    const nameTrim = distributorName.trim();
    const emailTrim = email.trim().toLowerCase();
    const phoneClean = phone.trim().replace(/\s+/g, '');

    if (!nameTrim || !emailTrim || !phoneClean) {
      setModalError('Please fill in distributor business name, email, and phone number.');
      return;
    }

    if (!PHONE_REGEX.test(phoneClean)) {
      setModalError('Invalid phone number. Use 07XXXXXXXX, 01XXXXXXXX, or +254XXXXXXXXX.');
      return;
    }

    setModalError(null);
    setIsSubmitting(true);
    try {
      await distributorApi.recommendDistributor({
        distributorName: nameTrim,
        email: emailTrim,
        phoneNumber: phoneClean,
      });

      // Dispatch custom role-scoped notifications
      const mfgName = user?.username || 'Anchor Manufacturer';
      const origin = typeof window !== 'undefined' ? window.location.origin : '';

      notificationsService.distributorRecommended({
        distributorName: nameTrim,
        distributorEmail: emailTrim,
        distributorPhone: phoneClean,
        manufacturerName: mfgName,
        docsLink: `${origin}/onboarding/application?email=${encodeURIComponent(emailTrim)}&name=${encodeURIComponent(nameTrim)}&phone=${encodeURIComponent(phoneClean)}`,
      }).catch(() => {});


      // 2. Fetch real bank admin emails from onboarding service
      try {
        const { data: admins } = await apiClient.get<any[]>('/api/onboarding/banks/admins');
        const adminEmails = Array.isArray(admins)
          ? admins.map((a: any) => a.email).filter(Boolean)
          : [];
        const uniqueBankEmails = Array.from(new Set([...adminEmails, 'bank@dfp.com']));

        uniqueBankEmails.forEach((bEmail) => {
          notificationsService.bankAdminRecommendation({
            bankAdminEmail: bEmail,
            distributorName: nameTrim,
            distributorEmail: emailTrim,
            distributorPhone: phoneClean,
            manufacturerName: mfgName,
          }).catch((err) => {
            console.warn(`Failed to notify bank admin ${bEmail}:`, err);
          });
        });
      } catch (e) {
        // Fallback to default alias
        notificationsService.bankAdminRecommendation({
          bankAdminEmail: 'bank@dfp.com',
          distributorName: nameTrim,
          distributorEmail: emailTrim,
          distributorPhone: phoneClean,
          manufacturerName: mfgName,
        }).catch(() => {});
      }

      toast.success(`Distributor "${nameTrim}" recommended successfully. Application sent to bank for review.`);
      setRecommendModalOpen(false);
      await loadData();


    } catch (err) {
      setModalError(getErrorMessage(err, 'Failed to submit distributor recommendation.'));
    } finally {
      setIsSubmitting(false);
    }

  };

  const filtered = recommendations.filter((r) => {
    const term = search.toLowerCase();
    const name = r.distributorName || '';
    const em = r.contactEmail || r.email || '';
    const ph = r.contactPhone || r.phoneNumber || '';

    const matchesSearch =
      !search ||
      name.toLowerCase().includes(term) ||
      em.toLowerCase().includes(term) ||
      ph.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (iso: string | undefined) => {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-[#1F4DA8]" />
            Distributors &amp; Referrals
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Recommend distributors for bank credit lines and track underwriting approval progress.
          </p>
        </div>

        <button
          onClick={handleOpenRecommend}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-[#1F4DA8] rounded-xl hover:bg-[#183c85] transition-all shadow-sm hover:shadow active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Recommend Distributor
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search distributor name, email, or phone..."
            className="pl-9 bg-slate-50 border-none text-sm w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === st ? 'bg-white text-[#1F4DA8] shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#1F4DA8] mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading recommended distributors...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700 shadow-sm">
          <AlertCircle className="h-6 w-6 mx-auto mb-2 text-rose-500" />
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={loadData}
            className="mt-3 px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm space-y-3">
          <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Distributors Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || statusFilter !== 'ALL'
              ? 'No distributor referrals match your filter criteria.'
              : 'Recommend your key commercial distributors to unlock bank credit financing.'}
          </p>
          {!search && (
            <button
              onClick={handleOpenRecommend}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#1F4DA8] rounded-xl hover:bg-[#183c85] transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" /> Recommend Distributor
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Distributor Name</th>
                  <th className="px-4 py-3.5 text-center">Repayment Tier</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5">Referred Date</th>
                  <th className="px-4 py-3.5">Financing Status</th>
                  <th className="px-5 py-3.5 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((d) => {
                  const emailVal = d.contactEmail || d.email || '—';
                  const phoneVal = d.contactPhone || d.phoneNumber || '—';
                  const isApproved = d.status === 'APPROVED';
                  const isRejected = d.status === 'REJECTED';

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{d.distributorName}</div>
                        <div className="text-[10px] text-slate-400">Distribution Partner</div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <DistributorTierBadge
                          tier={isApproved ? 'Gold' : 'Silver'}
                          size="xs"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-slate-800 font-medium">{emailVal}</div>
                        <div className="text-[10px] text-slate-400">{phoneVal}</div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                        {formatDate(d.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isRejected
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isApproved ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Approved by Bank
                            </>
                          ) : isRejected ? (
                            <>
                              <XCircle className="h-3 w-3" /> Declined
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" /> Underwriting Review
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-500 max-w-xs truncate">
                        {d.rejectionReason ? (
                          <span className="text-rose-600 font-medium">Reason: {d.rejectionReason}</span>
                        ) : isApproved ? (
                          <span className="text-emerald-700 font-medium">Active Credit Facility</span>
                        ) : d.docsSubmitted ? (
                          <span className="text-blue-600 font-medium">Financial KYC Attached</span>
                        ) : (
                          <span className="text-slate-400">Awaiting Bank Decision</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recommend Distributor Modal */}
      <Modal
        open={recommendModalOpen}
        onClose={() => setRecommendModalOpen(false)}
        title="Recommend Distributor for Financing"
        description="Submit a distributor company to your partner bank for credit facility evaluation."
        size="md"
        footer={
          <>
            <ModalButton variant="secondary" onClick={() => setRecommendModalOpen(false)}>
              Cancel
            </ModalButton>
            <ModalButton onClick={handleRecommend} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Recommendation'}
            </ModalButton>
          </>
        }
      >
        <div className="space-y-4">
          {modalError && (
            <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
              {modalError}
            </div>
          )}

          <FormField label="Distributor Business Name" required>
            <TextInput
              value={distributorName}
              onChange={(e) => setDistributorName(e.target.value)}
              placeholder="e.g. Acme Beverages Distributors Ltd"
            />
          </FormField>

          <FormField label="Contact Email Address" required hint="Invitation & KYC link will be dispatched here">
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="orders@acmedistributors.com"
            />
          </FormField>

          <FormField label="Contact Phone Number" required hint="Format: 07XXXXXXXX or +2547XXXXXXXX">
            <TextInput
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254712345678"
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

