'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Landmark,
  Search,
  RefreshCw,
  AlertCircle,
  Mail,
  Building2,
  Copy,
  Check,
  ShieldCheck,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { bankOnboardingApi } from '@/services/onboarding-api.service';
import type { BankResponse } from '@/types/onboarding';
import { TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';

export default function ManufacturerBanksPage() {
  const toast = useToast();
  const [banks, setBanks] = useState<BankResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadBanks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bankOnboardingApi.getBanksByStatus('ACTIVE');
      setBanks(data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load associated financing banks.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

  const handleCopyEmail = (email: string, bankId: string) => {
    navigator.clipboard.writeText(email);
    setCopiedCode(bankId);
    toast.success(`Contact email copied: ${email}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredBanks = banks.filter((b) => {
    const term = search.toLowerCase();
    return (
      !search ||
      (b.name || '').toLowerCase().includes(term) ||
      (b.bankCode || '').toLowerCase().includes(term) ||
      (b.branch || '').toLowerCase().includes(term) ||
      (b.branchCode || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Landmark className="h-7 w-7 text-[#1F4DA8]" />
            Associated Financing Partner Bank
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Commercial banking partner underwriting credit facilities and settlement clearing for your distributor network.
          </p>
        </div>

        <button
          onClick={loadBanks}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-[#1F4DA8]' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bank name or bank code..."
            className="pl-9 bg-slate-50 border-none text-sm w-full"
          />
        </div>

        <span className="text-xs font-bold text-slate-400">
          {filteredBanks.length} {filteredBanks.length === 1 ? 'Associated Bank' : 'Associated Banks'} Configured
        </span>
      </div>

      {/* Grid of Bank Cards */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#1F4DA8] mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading partner bank details...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700 shadow-sm">
          <AlertCircle className="h-6 w-6 mx-auto mb-2 text-rose-500" />
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={loadBanks}
            className="mt-3 px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredBanks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm space-y-3">
          <Landmark className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Associated Bank Assigned</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search ? 'No banks match your search term.' : 'Your enterprise partner bank will appear here once linked by the bank administrator.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBanks.map((b) => {
            const bankName = b.name || 'bank';
            const contactEmail = `underwriting@${bankName.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.ke`;
            const isCopied = copiedCode === b.id;

            return (
              <div
                key={b.id || b.bankCode}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-[#1F4DA8]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center font-black">
                      <Landmark size={24} />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={12} />
                      Active Underwriting Partner
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900">{b.name || 'Bank Partner'}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Branch: {b.branch || 'Corporate Banking Division'}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Bank Code:</span>
                      <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {b.bankCode}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Branch Code:</span>
                      <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {b.branchCode}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Financing Mode:</span>
                      <span className="font-bold text-slate-700">Anchor-Led Credit</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={`mailto:${contactEmail}?subject=Anchor%20Manufacturer%20Financing%20Coordination`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-white bg-[#1F4DA8] hover:bg-[#183c85] rounded-xl transition-all shadow-xs"
                  >
                    <Mail size={14} />
                    <span>Contact Relationship Desk</span>
                  </a>

                  <button
                    onClick={() => handleCopyEmail(contactEmail, b.id || '')}
                    className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    title="Copy desk email"
                  >
                    {isCopied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

