'use client';

import React from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Landmark,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import type { CountyBankCoverage, BankBranchRecord } from '@/lib/geo/kenya-regions';

interface CountyBranchesModalProps {
  county: CountyBankCoverage | null;
  open: boolean;
  onClose: () => void;
}

export function CountyBranchesModal({ county, open, onClose }: CountyBranchesModalProps) {
  if (!county) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${county.countyName} County — Active Bank Branches`}
      description={`Code: ${county.countyCode} • ${county.regionName} • ${county.totalBranches} Active Branch Outlets`}
      size="xl"
      footer={<ModalButton variant="secondary" onClick={onClose}>Close</ModalButton>}
    >
      <div className="space-y-4">
        {/* Active Banks Summary Pills */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Active Partner Banks Operating in {county.countyName}
          </p>
          <div className="flex flex-wrap gap-2">
            {county.activeBanks.map((b) => (
              <div
                key={b.bankCode}
                className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs"
              >
                <Landmark size={14} className="text-[#1F4DA8]" />
                <span>{b.bankName}</span>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  {b.branchCount} {b.branchCount === 1 ? 'branch' : 'branches'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Branch Outlets Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
              <tr>
                <th className="px-4 py-3 text-left">Bank Institution</th>
                <th className="px-4 py-3 text-left">Branch Name & Code</th>
                <th className="px-4 py-3 text-left">Location / Address</th>
                <th className="px-4 py-3 text-left">Contact Info</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {county.branches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No physical branches registered for this county yet.
                  </td>
                </tr>
              ) : (
                county.branches.map((br) => (
                  <tr key={br.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1F4DA8] font-bold flex items-center justify-center text-[10px]">
                          {br.bankCode.slice(0, 3)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{br.bankName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Code: {br.bankCode}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{br.branchName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Branch Code: {br.branchCode}</p>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-xs">{br.location}, {br.city}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-[11px] space-y-0.5">
                      {br.contactPhone && (
                        <p className="flex items-center gap-1 text-slate-600">
                          <Phone size={11} className="text-slate-400" />
                          <span>{br.contactPhone}</span>
                        </p>
                      )}
                      {br.contactEmail && (
                        <p className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
                          <Mail size={11} className="text-slate-400" />
                          <span>{br.contactEmail}</span>
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} />
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
