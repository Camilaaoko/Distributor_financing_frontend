'use client';

import { useState } from 'react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import { bankService } from '@/services/bank.service';
import { notificationsService } from '@/services/notifications.service';
import type { DistributorApproval } from '@/lib/types';


interface RejectDistributorModalProps {
  approval: DistributorApproval | null;
  open: boolean;
  onClose: () => void;
  onRejected: () => void;
}

export function RejectDistributorModal({ approval, open, onClose, onRejected }: RejectDistributorModalProps) {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  if (!approval) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a rejection reason.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await bankService.rejectDistributor({
        distributorEntityId: approval.id,
        approved: false,
        rejectionReason: reason.trim(),
      });

      // Dispatch in-app & email notifications
      notificationsService.distributorRejected({
        distributorEmail: approval.registrationNumber || 'distributor@company.co.ke',
        reason: reason.trim(),
      }).catch(() => {});

      const mfgEmails = ['manufacturer@dfp.com', 'admin@manufacturer.co.ke'];
      mfgEmails.forEach((mEmail) => {
        notificationsService.manufacturerRecommendationOutcome({
          manufacturerEmail: mEmail,
          distributorName: approval.companyName,
          approved: false,
          reason: reason.trim(),
        }).catch(() => {});
      });



      toast.success(`Distributor "${approval.companyName}" has been rejected. Notifications sent to manufacturer & distributor.`);
      handleClose();
      onRejected();

    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to reject distributor.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Reject Distributor"
      description={`Reject the registration for "${approval.companyName}".`}
      size="sm"
      footer={
        <>
          <ModalButton variant="secondary" onClick={handleClose}>Cancel</ModalButton>
          <ModalButton variant="danger" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Rejecting…' : 'Reject Distributor'}
          </ModalButton>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-100 px-3.5 py-3">
          <p className="text-sm text-rose-900">
            This action cannot be undone. The manufacturer will be notified of the rejection.
          </p>
        </div>

        <FormField label="Rejection Reason" required>
          <TextInput
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Incomplete business registration documents"
          />
        </FormField>
      </div>
    </Modal>
  );
}