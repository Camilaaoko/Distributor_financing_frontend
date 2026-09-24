'use client';

import { useState } from 'react';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';
import { Filters } from '@/components/platform/Filters';
import { BankAdminTable } from '@/components/platform/BankAdminTable';
import { EditBankAdminModal } from '@/components/platform/EditBankAdminModal';
import { ViewBankAdminModal } from '@/components/platform/ViewBankAdminModal';
import { DeleteDialog } from '@/components/platform/DeleteDialog';
import { ResetPasswordModal } from '@/components/platform/ResetPasswordModal';
import type { BankAdmin } from '@/lib/types';

export default function BankUsersPage() {
  const admin = usePlatformAdmin();

  const [viewTarget, setViewTarget] = useState<BankAdmin | null>(null);
  const [editTarget, setEditTarget] = useState<BankAdmin | null>(null);
  const [resetTarget, setResetTarget] = useState<BankAdmin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BankAdmin | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  return (
    <div className="p-6 lg:p-8 space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bank Administrators</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          View and manage administrator accounts across all partner banks with full audit traceability.
        </p>
      </div>


      <Filters
        admin={admin}
        onRequestBulkDelete={() => setBulkDeleteOpen(true)}
      />

      <BankAdminTable
        admin={admin}
        onView={setViewTarget}
        onEdit={setEditTarget}
        onResetPassword={setResetTarget}
        onDeleteRequest={setDeleteTarget}
      />

      <EditBankAdminModal
        admin={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={admin.updateAdmin}
        isSubmitting={admin.isMutating}
        banks={admin.banks}
      />

      <ViewBankAdminModal admin={viewTarget} onClose={() => setViewTarget(null)} />

      <ResetPasswordModal
        admin={resetTarget}
        onClose={() => setResetTarget(null)}
        onReset={admin.resetPassword}
        isSubmitting={admin.isMutating}
      />

      <DeleteDialog
        open={!!deleteTarget}
        description={
          deleteTarget
            ? `${deleteTarget.firstName} ${deleteTarget.lastName}'s administrator account will be permanently removed. This action cannot be undone.`
            : undefined
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            const success = await admin.deleteAdmin(deleteTarget.id);
            if (success) setDeleteTarget(null);
          }
        }}
        isDeleting={admin.isMutating}
      />

      <DeleteDialog
        open={bulkDeleteOpen}
        title={`Delete ${admin.selectedIds.length} Bank Administrators?`}
        description="All selected accounts will be permanently removed. This action cannot be undone."
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={async () => {
          const success = await admin.bulkDelete();
          if (success) setBulkDeleteOpen(false);
        }}
        isDeleting={admin.isMutating}
      />
    </div>
  );
}
