'use client';

import { useState } from 'react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput } from '@/components/ui/FormField';
import { onboardingService, type CreateManufacturerUserPayload } from '@/services/onboarding.service';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import { Building2, User } from 'lucide-react';

interface AddManufacturerUserModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const EMPTY_FORM: CreateManufacturerUserPayload = {
  manufacturerName: '',
  businessPermitNumber: '',
  location: '',
  accountNumber: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  nationalIdNumber: '',
  employeeId: '',
  role: 'MANUFACTURER_ADMIN',
};

export function AddManufacturerUserModal({ open, onClose, onCreated }: AddManufacturerUserModalProps) {
  const toast = useToast();
  const [form, setForm] = useState<CreateManufacturerUserPayload>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof CreateManufacturerUserPayload>(key: K, value: CreateManufacturerUserPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (
      !form.manufacturerName?.trim() ||
      !form.location?.trim() ||
      !form.accountNumber?.trim() ||
      !form.firstName.trim() ||
      !form.phoneNumber.trim() ||
      !form.nationalIdNumber.trim() ||
      !form.employeeId?.trim()
    ) {
      setError('Please fill in all required company and representative fields.');
      return;
    }

    const phoneClean = form.phoneNumber.trim().replace(/\s+/g, '');
    const idClean = form.nationalIdNumber.trim().replace(/\s+/g, '');

    // Validate phone: must be 07xxxxxxxx, 01xxxxxxxx, or +254xxxxxxxxx (9 digits)
    const phoneValid = /^(07|01)[0-9]{8}$/.test(phoneClean) || /^\+254[0-9]{9}$/.test(phoneClean);
    if (!phoneValid) {
      setError('Phone number must be in the format 07XXXXXXXX, 01XXXXXXXX, or +254XXXXXXXXX.');
      return;
    }

    // Validate national ID: exactly 8 digits
    if (!/^[0-9]{8}$/.test(idClean)) {
      setError('National ID number must be exactly 8 digits.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onboardingService.createManufacturerUser({
        manufacturerName: form.manufacturerName?.trim() || '',
        businessPermitNumber: form.businessPermitNumber?.trim() || '',
        location: form.location?.trim() || '',
        accountNumber: form.accountNumber?.trim() || '',
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: phoneClean,
        nationalIdNumber: idClean,
        employeeId: form.employeeId?.trim() || undefined,
        role: form.role || 'MANUFACTURER_MAKER',
      });


      toast.success(`Manufacturer "${form.manufacturerName}" onboarded. Login credentials sent to ${form.email}.`);
      handleClose();
      onCreated?.();
    } catch (err) {
      if (typeof window !== 'undefined') {
        // Log full response for debugging
        const { isAxiosError } = await import('axios');
        if (isAxiosError(err)) console.error('[AddManufacturerModal] 400 response body:', err.response?.data);
      }
      const msg = getErrorMessage(err, 'Failed to onboard manufacturer.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Onboard Anchor Manufacturer"
      description="Register an anchor manufacturer and configure their corporate representative access."
      size="xl"
      footer={
        <>
          <ModalButton variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </ModalButton>
          <ModalButton variant="primary" onClick={handleSubmit} loading={isSubmitting}>
            Onboard Manufacturer
          </ModalButton>
        </>
      }
    >
      <div className="space-y-6 max-h-[72vh] overflow-y-auto px-1 py-1">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3.5 leading-relaxed font-medium">
            {error}
          </div>
        )}

        {/* Section 1: Company Profile Card */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/60">
            <div className="h-7 w-7 rounded-lg bg-blue-100 text-[#1F4DA8] flex items-center justify-center">
              <Building2 size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                1. Anchor Enterprise Profile
              </h3>
              <p className="text-[11px] text-slate-500">Official business registration &amp; disbursement details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Manufacturer / Enterprise Name" required>
              <TextInput
                value={form.manufacturerName}
                onChange={(e) => set('manufacturerName', e.target.value)}
                placeholder="e.g. East African Breweries PLC"
              />
            </FormField>

            <FormField label="Registration / Permit Number" required hint="Company certificate number">
              <TextInput
                value={form.businessPermitNumber || ''}
                onChange={(e) => set('businessPermitNumber', e.target.value)}
                placeholder="e.g. CPR/2024/98124"
              />
            </FormField>

            <FormField label="Physical Location" required hint="Headquarters / City">
              <TextInput
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="e.g. Ruaraka, Nairobi"
              />
            </FormField>

            <FormField label="Settlement Account Number" required hint="Commercial bank account for payouts">
              <TextInput
                value={form.accountNumber}
                onChange={(e) => set('accountNumber', e.target.value)}
                placeholder="e.g. 0112984716200"
              />
            </FormField>
          </div>
        </div>

        {/* Section 2: Contact Person / Primary Administrator Card */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/60">
            <div className="h-7 w-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <User size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                2. Primary Corporate Representative
              </h3>
              <p className="text-[11px] text-slate-500">User account receiving the initial activation &amp; login credentials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <TextInput
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                placeholder="e.g. Evans"
              />
            </FormField>

            <FormField label="Last Name" required>
              <TextInput
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                placeholder="e.g. Omondi"
              />
            </FormField>

            <FormField
              label="Corporate Email Address"
              required
              hint="Temporary password will be delivered to this inbox"
            >
              <TextInput
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="e.g. e.omondi@eabl.com"
              />
            </FormField>

            <FormField label="Phone Number" required>
              <TextInput
                value={form.phoneNumber}
                onChange={(e) => set('phoneNumber', e.target.value)}
                placeholder="e.g. +254 712 345 678"
              />
            </FormField>

            <FormField label="National ID Number" required>
              <TextInput
                value={form.nationalIdNumber}
                onChange={(e) => set('nationalIdNumber', e.target.value)}
                placeholder="e.g. 29871234"
              />
            </FormField>

            <FormField label="Employee Number / ID" required hint="Admin's internal employee ID">
              <TextInput
                value={form.employeeId || ''}
                onChange={(e) => set('employeeId', e.target.value)}
                placeholder="e.g. EABL-M-104"
              />
            </FormField>
          </div>
        </div>
      </div>
    </Modal>
  );
}