'use client';

import { useState, useEffect } from 'react';
import { Landmark, Building2, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { TextInput } from '@/components/ui/FormField';
import type { Bank } from '@/lib/types';

interface EditBankModalProps {
  bank: Bank | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, input: { name: string; branch: string; location: string }) => Promise<boolean>;
  isSubmitting?: boolean;
}

export function EditBankModal({
  bank,
  open,
  onClose,
  onUpdate,
  isSubmitting = false,
}: EditBankModalProps) {
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bank) {
      setName(bank.name || '');
      setBranch(bank.branch || 'Head Office');
      setLocation((bank as any).location || bank.branch || 'Nairobi');
      setError(null);
    }
  }, [bank]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bank) return;
    if (!name.trim()) {
      setError('Bank name is required.');
      return;
    }

    try {
      const success = await onUpdate(bank.id, {
        name: name.trim(),
        branch: branch.trim() || 'Head Office',
        location: location.trim() || 'Nairobi',
      });
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update bank details.');
    }
  };

  if (!bank) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <Landmark size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Edit Bank Institution</h2>
            <p className="text-xs text-slate-500 font-normal">Update commercial banking partner details</p>
          </div>
        </div>
      }
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <ModalButton variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </ModalButton>
          <ModalButton variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </ModalButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Bank Code
          </label>
          <TextInput
            value={bank.bankCode || bank.id}
            disabled
            className="bg-slate-100 font-mono text-slate-500 cursor-not-allowed text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Bank Institution Name *
          </label>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kenya Commercial Bank"
            required
            className="text-xs font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Headquarters / Main Branch
            </label>
            <TextInput
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g. Head Office"
              className="text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Location / City
            </label>
            <TextInput
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Nairobi, Kenya"
              className="text-xs font-medium"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
