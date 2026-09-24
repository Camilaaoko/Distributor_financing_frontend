'use client';

import { useState } from 'react';
import { KeyRound, Copy, Check } from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import type { BankAdmin } from '@/lib/types';

interface ResetPasswordModalProps {
  admin: BankAdmin | null;
  onClose: () => void;
  onReset: (id: string, options: { forceChange: boolean; sendEmail: boolean }) => Promise<{ temporaryPassword: string }>;
  isSubmitting?: boolean;
}

export function ResetPasswordModal({ admin, onClose, onReset, isSubmitting }: ResetPasswordModalProps) {
  const [forceChange, setForceChange] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!admin) return null;

  const handleClose = () => {
    setTempPassword(null);
    setCopied(false);
    setForceChange(true);
    setSendEmail(true);
    onClose();
  };

  const handleGenerate = async () => {
    try {
      const result = await onReset(admin.id, { forceChange, sendEmail });
      setTempPassword(result.temporaryPassword);
    } catch {
      // Error toast is already shown by the hook; keep the modal open so the admin can retry.
    }
  };

  const handleCopy = async () => {
    if (!tempPassword) return;
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Modal
      open={!!admin}
      onClose={handleClose}
      title="Reset Password"
      description={`Generate a new temporary password for ${admin.firstName} ${admin.lastName}.`}
      size="sm"
      footer={
        tempPassword ? (
          <ModalButton onClick={handleClose}>Done</ModalButton>
        ) : (
          <>
            <ModalButton variant="secondary" onClick={handleClose}>Cancel</ModalButton>
            <ModalButton onClick={handleGenerate} disabled={isSubmitting}>
              {isSubmitting ? 'Generating…' : 'Reset Password'}
            </ModalButton>
          </>
        )
      }
    >
      {!tempPassword ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 px-3.5 py-3">
            <KeyRound size={18} className="text-[#1F4DA8] shrink-0" />
            <p className="text-sm text-[#1F4DA8]">
              A secure temporary password will be generated for this account.
            </p>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={forceChange}
              onChange={(e) => setForceChange(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#1F4DA8] focus:ring-[#1F4DA8]"
            />
            Force password change on next login
          </label>

          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#1F4DA8] focus:ring-[#1F4DA8]"
            />
            Send the new password to {admin.email}
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Temporary password generated successfully. Share it securely — it won&apos;t be shown again.
          </p>
          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-900 text-white px-4 py-3 font-mono text-sm">
            <span>{tempPassword}</span>
            <button onClick={handleCopy} className="text-slate-300 hover:text-white shrink-0">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
