'use client';

import { useState } from 'react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput } from '@/components/ui/FormField';
import { onboardingService, type ManufacturerUser, type UpdateManufacturerUserPayload } from '@/services/onboarding.service';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';

interface EditManufacturerUserModalProps {
  user: ManufacturerUser | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export function EditManufacturerUserModal({ user, onClose, onUpdated }: EditManufacturerUserModalProps) {
  if (!user) return null;
  return <EditManufacturerUserForm user={user} onClose={onClose} onUpdated={onUpdated} />;
}

function EditManufacturerUserForm({
  user,
  onClose,
  onUpdated,
}: {
  user: ManufacturerUser;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState<UpdateManufacturerUserPayload>({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof UpdateManufacturerUserPayload>(key: K, value: UpdateManufacturerUserPayload[K]) =>
    setForm((f: UpdateManufacturerUserPayload) => ({ ...f, [key]: value }));


  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await onboardingService.updateManufacturerUser(user.id, form);
      toast.success('Manufacturer user updated successfully.');
      onClose();
      onUpdated?.();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update manufacturer user.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Edit Manufacturer User"
      description={`Update details for ${user.manufacturerName || 'Manufacturer'}`}
      size="md"
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </ModalButton>
          <ModalButton variant="primary" onClick={handleSubmit} loading={isSubmitting}>
            Save Changes
          </ModalButton>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="First Name" required>
            <TextInput
              value={form.firstName || ''}
              onChange={(e) => set('firstName', e.target.value)}
            />
          </FormField>

          <FormField label="Last Name" required>
            <TextInput
              value={form.lastName || ''}
              onChange={(e) => set('lastName', e.target.value)}
            />
          </FormField>

          <FormField label="Corporate Email" required className="sm:col-span-2">
            <TextInput
              type="email"
              value={form.email || ''}
              onChange={(e) => set('email', e.target.value)}
            />
          </FormField>

          <FormField label="Phone Number" required className="sm:col-span-2">
            <TextInput
              value={form.phoneNumber || ''}
              onChange={(e) => set('phoneNumber', e.target.value)}
            />
          </FormField>
        </div>
      </div>
    </Modal>
  );
}