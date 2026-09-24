'use client';

import { Modal, ModalButton } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import type { BankAdmin } from '@/lib/types';
import { platformRoles } from '@/lib/mock/platform-admin';

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200/70 p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900 text-right">{value}</span>
    </div>
  );
}

export function ViewBankAdminModal({ admin, onClose }: { admin: BankAdmin | null; onClose: () => void }) {
  if (!admin) return null;
  const roleDef = platformRoles.find((r) => r.name === admin.role);

  return (
    <Modal
      open={!!admin}
      onClose={onClose}
      title="Bank Administrator Details"
      size="xl"
      footer={<ModalButton variant="secondary" onClick={onClose}>Close</ModalButton>}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className={`h-16 w-16 rounded-full ${admin.avatarColor} text-white font-bold flex items-center justify-center text-xl shrink-0`}>
            {admin.firstName[0]}{admin.lastName[0]}
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{admin.firstName} {admin.lastName}</div>
            <div className="text-sm text-slate-500">@{admin.username}</div>
          </div>
          <div className="ml-auto"><StatusBadge status={admin.status} /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoSection title="Personal Information">
            <Row label="Email" value={admin.email} />
            <Row label="Phone" value={admin.phone} />
            <Row label="National ID" value={admin.nationalId} />
          </InfoSection>

          <InfoSection title="Bank Information">
            <Row label="Bank" value={admin.bankName} />
            <Row label="Department" value={admin.department} />
            <Row label="Employee Number" value={admin.employeeNumber} />
          </InfoSection>

          <InfoSection title="Account Information">
            <Row label="Username" value={admin.username} />
            <Row label="Role" value={admin.role} />
            <Row label="Status" value={<StatusBadge status={admin.status} />} />
          </InfoSection>

          <InfoSection title="Activity Information">
            <Row label="Last Login" value={admin.lastLogin} />
            <Row label="Created Date" value={admin.createdDate} />
          </InfoSection>
        </div>

        <InfoSection title="Permissions">
          <p className="text-sm text-slate-600">
            {roleDef?.description ?? 'No description available for this role.'}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-[#1F4DA8]">
              {roleDef?.permissionCount ?? 0} permissions granted
            </span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {roleDef?.userCount ?? 0} users with this role
            </span>
          </div>
        </InfoSection>
      </div>
    </Modal>
  );
}
