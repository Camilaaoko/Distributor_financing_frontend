'use client';

import React, { useState, useEffect } from 'react';
import { Landmark, Users, ShieldCheck, Factory, Building2, RefreshCw, AlertCircle, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { bankOnboardingApi } from '@/services/onboarding-api.service';
import type { BankBranchDetailsResponse, UserResponse } from '@/types/onboarding';
import { getErrorMessage } from '@/lib/errors';

interface BankBranchDetailsModalProps {
  bankId: string | null;
  bankName?: string;
  open: boolean;
  onClose: () => void;
}

export function BankBranchDetailsModal({
  bankId,
  bankName,
  open,
  onClose,
}: BankBranchDetailsModalProps) {
  const [details, setDetails] = useState<BankBranchDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !bankId) return;

    let mounted = true;
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await bankOnboardingApi.getBankBranchDetails(bankId);
        if (mounted) {
          setDetails(data);
        }
      } catch (err) {
        if (mounted) {
          setError(getErrorMessage(err, 'Failed to load bank branch overview.'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetails();
    return () => {
      mounted = false;
    };
  }, [open, bankId]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bank Branch Ecosystem Overview"
      description={`Operational profile, administration, and dynamic roles for ${bankName || 'this bank branch'}.`}
      size="xl"
      footer={
        <ModalButton variant="secondary" onClick={onClose}>
          Close
        </ModalButton>
      }
    >
      <div className="space-y-5 text-xs">
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#1F4DA8] mb-2" />
            <p className="font-semibold text-slate-600">Loading branch ecosystem details...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : details ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                  <Users size={12} className="text-[#1F4DA8]" />
                  Total Staff
                </div>
                <div className="text-xl font-black text-slate-900">{details.totalUsers ?? details.users?.length ?? 0}</div>
                <span className="text-[10px] font-semibold text-emerald-600">
                  {details.activeUsers ?? 0} active
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                  <ShieldCheck size={12} className="text-indigo-600" />
                  Custom Roles
                </div>
                <div className="text-xl font-black text-slate-900">{details.roles?.length ?? 0}</div>
                <span className="text-[10px] font-semibold text-indigo-600">Branch policies</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                  <Factory size={12} className="text-emerald-600" />
                  Manufacturers
                </div>
                <div className="text-xl font-black text-slate-900">{details.totalManufacturers ?? 0}</div>
                <span className="text-[10px] font-semibold text-emerald-600">Active anchors</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                  <Building2 size={12} className="text-blue-600" />
                  Distributors
                </div>
                <div className="text-xl font-black text-slate-900">{details.totalDistributors ?? 0}</div>
                <span className="text-[10px] font-semibold text-blue-600">Credit facilities</span>
              </div>
            </div>

            {/* Admin Overview */}
            {details.admin && (
              <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Landmark size={15} className="text-[#1F4DA8]" />
                    <span>Primary Bank Administrator</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    Active
                  </span>
                </div>
                <p className="font-semibold text-slate-800">
                  {details.admin.firstName} {details.admin.lastName} ({details.admin.email})
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Phone: {details.admin.phoneNumber || '—'}
                </p>
              </div>
            )}

            {/* Staff Users List */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                Branch Users ({details.users?.length ?? 0})
              </h4>
              {(!details.users || details.users.length === 0) ? (
                <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl text-slate-400">
                  No additional staff users provisioned yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {details.users.map((u: UserResponse) => (
                    <div key={u.id} className="p-2.5 bg-white hover:bg-slate-50 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {u.roleName || u.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
