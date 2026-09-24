'use client';

import { AlertTriangle } from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';

interface DeleteDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isDeleting?: boolean;
}

export function DeleteDialog({
  open,
  title = 'Delete Bank Administrator?',
  description = 'This action cannot be undone. The account and all associated access will be permanently removed.',
  onClose,
  onConfirm,
  isDeleting,
}: DeleteDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose}>Cancel</ModalButton>
          <ModalButton variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete User'}
          </ModalButton>
        </>
      }
    >
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
          <AlertTriangle size={22} />
        </div>
        <p className="text-sm text-slate-500 max-w-sm">{description}</p>
      </div>
    </Modal>
  );
}
