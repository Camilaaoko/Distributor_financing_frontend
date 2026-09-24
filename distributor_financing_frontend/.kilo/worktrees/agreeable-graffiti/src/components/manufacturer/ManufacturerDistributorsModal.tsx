'use client';

import React, { useState, useEffect } from 'react';
import { Building2, RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { manufacturerApi } from '@/services/onboarding-api.service';
import type { DistributorResponse } from '@/types/onboarding';
import { getErrorMessage } from '@/lib/errors';
import { TextInput } from '@/components/ui/FormField';

interface ManufacturerDistributorsModalProps {
  manufacturerId: string | null;
  manufacturerName?: string;
  open: boolean;
  onClose: () => void;
}

export function ManufacturerDistributorsModal({
  manufacturerId,
  manufacturerName,
  open,
  onClose,
}: ManufacturerDistributorsModalProps) {
  const [distributors, setDistributors] = useState<DistributorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open || !manufacturerId) return;

    let mounted = true;
    const fetchDistributors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await manufacturerApi.getDistributorsForManufacturer(manufacturerId);
        if (mounted) {
          setDistributors(data || []);
        }
      } catch (err) {
        if (mounted) {
          setError(getErrorMessage(err, 'Failed to load connected distributors.'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDistributors();
    return () => {
      mounted = false;
    };
  }, [open, manufacturerId]);

  const filtered = distributors.filter((d) => {
    const term = search.toLowerCase();
    return (
      !search ||
      (d.businessName || '').toLowerCase().includes(term) ||
      (d.location || '').toLowerCase().includes(term) ||
      (d.businessPermitNumber || '').toLowerCase().includes(term)
    );
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Connected Distributors Network"
      description={`Distributors onboarded and recommended by ${manufacturerName || 'this anchor manufacturer'}.`}
      size="xl"
      footer={
        <ModalButton variant="secondary" onClick={onClose}>
          Close
        </ModalButton>
      }
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search distributor by business name or location..."
              className="pl-9 bg-slate-50 border-none text-xs w-full"
            />
          </div>
          <span className="text-xs font-bold text-slate-400 shrink-0">
            {filtered.length} {filtered.length === 1 ? 'Distributor' : 'Distributors'}
          </span>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#1F4DA8] mb-2" />
            <p className="text-xs font-semibold text-slate-600">Loading connected distributors...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 border border-dashed border-slate-200 rounded-2xl text-center space-y-2 bg-slate-50">
            <Building2 className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No Connected Distributors Found</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              {search ? 'No distributors match your search query.' : 'This manufacturer has not yet recommended any distributors.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
            {filtered.map((d) => (
              <div key={d.id} className="p-3.5 bg-white hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center font-bold text-xs shrink-0">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{d.businessName}</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Permit: {d.businessPermitNumber || '—'} {d.location ? `• ${d.location}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      d.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : d.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {d.status === 'ACTIVE' && <CheckCircle2 size={11} />}
                    {d.status === 'PENDING' && <Clock size={11} />}
                    {d.status === 'REJECTED' && <XCircle size={11} />}
                    {d.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

