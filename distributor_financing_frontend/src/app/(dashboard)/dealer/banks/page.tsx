'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Landmark,
  Search,
  RefreshCw,
  AlertCircle,
  Mail,
  Phone,
  Building2,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { bankOnboardingApi } from '@/services/onboarding-api.service';
import type { BankSummaryDto, BankResponse } from '@/types/onboarding';
import { TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';

export default function DistributorBanksPage() {
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
      setError(getErrorMessage(err, 'Failed to load partner banks directory.'));
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
    toast.success(`Bank contact email copied: ${email}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredBanks = banks.filter((b) => {
    const term = search.toLowerCase();
    return (
      !search ||
      b.name.toLowerCase().includes(term) ||
      (b.bankCode || '').toLowerCase().includes(term) ||
      (b.branch || '').toLowerCase().includes(term) ||
      (b.branchCode || '').toLowerCase().includes(term)
    );
  });


  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Landmark className="h-7 w-7 text-[#1F4DA8]" />
            Financing Partner Banks
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View participating commercial banks and reach out to trade finance relationship officers.
          </p>
        </div>

        <button
          onClick={loadBanks}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Directory
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
          {filteredBanks.length} {filteredBanks.length === 1 ? 'Partner Bank' : 'Partner Banks'} Available
        </span>
      </div>

      {/* Grid of Bank Cards */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#1F4DA8] mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading partner banks directory...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700 shadow-sm">
          <AlertCircle className="h-6 w-6 mx-auto mb-2 text-rose-500" />
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={loadBanks}
            className="mt-3 px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : filteredBanks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm space-y-3">
          <Landmark className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Partner Banks Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search ? 'No banks match your search term.' : 'Partner banks will appear here once onboarded.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBanks.map((b) => {
            const contactEmail = `tradefinance@${b.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.ke`;
            const isCopied = copiedCode === b.id;

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center font-black text-base">
                      <Landmark size={20} />
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active Partner
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{b.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Branch: {b.branch || 'Corporate / Head Office'}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bank Code:</span>
                      <span className="font-mono font-bold text-slate-800">{b.bankCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Branch Code:</span>
                      <span className="font-mono font-bold text-slate-800">{b.branchCode}</span>
                    </div>
                  </div>
                </div>

                {/* Email Action Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={`mailto:${contactEmail}?subject=Distributor%20Financing%20Inquiry%20-%20Credit%20Facility`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#1F4DA8] hover:bg-[#183c85] rounded-xl transition-all shadow-xs"
                  >
                    <Mail size={14} />
                    Email Bank
                  </a>

                  <button
                    onClick={() => handleCopyEmail(contactEmail, b.id)}
                    className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    title="Copy bank contact email"
                  >
                    {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
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
