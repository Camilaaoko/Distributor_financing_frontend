'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Factory,
  Search,
  RefreshCw,
  AlertCircle,
  Building2,
  CheckCircle2,
  MapPin,
  FileText,
  CreditCard,
} from 'lucide-react';
import { distributorApi } from '@/services/onboarding-api.service';
import type { ManufacturerResponse } from '@/types/onboarding';
import { TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';

export default function DistributorManufacturersPage() {
  const toast = useToast();
  const [manufacturers, setManufacturers] = useState<ManufacturerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await distributorApi.getWorkingManufacturers();
      setManufacturers(data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load associated anchor manufacturers.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = manufacturers.filter((m) => {
    const term = search.toLowerCase();
    return (
      !search ||
      m.name.toLowerCase().includes(term) ||
      (m.location || '').toLowerCase().includes(term) ||
      (m.accountNumber || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Factory className="h-7 w-7 text-[#1F4DA8]" />
            Anchor Manufacturers
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Approved Anchor Manufacturers and corporate supply chain partners linked to your revolving credit facility.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Manufacturers
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search manufacturer by name or location..."
            className="pl-9 bg-slate-50 border-none text-sm w-full"
          />
        </div>

        <span className="text-xs font-bold text-slate-400">
          {filtered.length} {filtered.length === 1 ? 'Anchor Manufacturer' : 'Anchor Manufacturers'} Connected
        </span>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#1F4DA8] mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading connected manufacturers...</p>
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
          <Factory className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Anchor Manufacturers Connected</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search
              ? 'No manufacturers match your search criteria.'
              : 'Your verified partner manufacturers will appear here once credit facilities are authorized.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center font-black text-base">
                    <Factory size={20} />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={12} />
                    Verified Anchor
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{m.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {m.location || 'Nairobi, Kenya'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Business Permit:</span>
                    <span className="font-mono font-bold text-slate-800">{m.businessPermitNumber || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Disbursement Account:</span>
                    <span className="font-mono font-bold text-slate-800">{m.accountNumber || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Supply Chain Status</span>
                <span className="text-emerald-700 font-bold">Active Direct Orders</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

