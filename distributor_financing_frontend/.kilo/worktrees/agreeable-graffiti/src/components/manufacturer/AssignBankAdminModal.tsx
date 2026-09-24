'use client';

import React, { useState, useEffect } from 'react';
import { Landmark, UserCheck, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, Select } from '@/components/ui/FormField';
import { manufacturerApi, bankOnboardingApi } from '@/services/onboarding-api.service';
import type { BankAdminSummaryResponse } from '@/types/onboarding';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';

interface AssignBankAdminModalProps {
  manufacturerId: string | null;
  manufacturerName?: string;
  currentBankAdminId?: string;
  open: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

export function AssignBankAdminModal({
  manufacturerId,
  manufacturerName,
  currentBankAdminId,
  open,
  onClose,
  onAssigned,
}: AssignBankAdminModalProps) {
  const toast = useToast();
  const [bankAdmins, setBankAdmins] = useState<BankAdminSummaryResponse[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    setSelectedAdminId(currentBankAdminId || '');
    setError(null);

    const loadAdmins = async () => {
      setIsLoadingAdmins(true);
      try {
        const admins = await bankOnboardingApi.getAllBankAdmins();
        if (mounted) {
          setBankAdmins(admins || []);
        }
      } catch (err) {
        if (mounted) {
          setError(getErrorMessage(err, 'Failed to load bank administrators directory.'));
        }
      } finally {
        if (mounted) {
          setIsLoadingAdmins(false);
        }
      }
    };

    loadAdmins();
    return () => {
      mounted = false;
    };
  }, [open, currentBankAdminId]);

  const handleAssign = async () => {
    if (!manufacturerId || !selectedAdminId) {
      setError('Please select a Bank Administrator.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await manufacturerApi.assignBankAdmin(manufacturerId, selectedAdminId);
      toast.success(`Successfully assigned Bank Administrator to "${manufacturerName}".`);
      onAssigned();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to assign Bank Administrator.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAdmin = bankAdmins.find((a) => a.id === selectedAdminId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign Bank Relationship Administrator"
      description={`Map "${manufacturerName || 'Manufacturer'}" to an onboarded Bank Admin to oversee credit facilities and underwriting.`}
      size="md"
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </ModalButton>
          <ModalButton variant="primary" onClick={handleAssign} disabled={isSubmitting || !selectedAdminId}>
            {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
          </ModalButton>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <FormField label="Select Bank Administrator" required>
          <Select
            value={selectedAdminId}
            onChange={(e) => setSelectedAdminId(e.target.value)}
            disabled={isLoadingAdmins || isSubmitting}
            className="w-full text-xs"
          >
            <option value="">-- Choose Bank Admin / Relationship Officer --</option>
            {bankAdmins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.firstName} {admin.lastName} ({admin.bankName || 'Bank'} - {admin.email})
              </option>
            ))}
          </Select>
        </FormField>

        {selectedAdmin && (
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#1F4DA8] font-bold">
              <Landmark size={15} />
              <span>{selectedAdmin.bankName || 'Bank Branch'}</span>
            </div>
            <div className="text-slate-600 space-y-0.5 text-[11px]">
              <p>
                <strong>Officer:</strong> {selectedAdmin.firstName} {selectedAdmin.lastName}
              </p>
              <p>
                <strong>Email:</strong> {selectedAdmin.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedAdmin.phoneNumber || '—'}
              </p>
              {selectedAdmin.branch && (
                <p>
                  <strong>Branch:</strong> {selectedAdmin.branch} ({selectedAdmin.branchCode || '—'})
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

