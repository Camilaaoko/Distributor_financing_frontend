const STYLES: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-700',
  Shipped: 'bg-blue-100 text-[#1F4DA8]',
  Active: 'bg-emerald-100 text-emerald-700',
  Inactive: 'bg-slate-100 text-[#64748B]',
  Suspended: 'bg-red-100 text-red-700',
  Locked: 'bg-red-100 text-[#DC2626]',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STYLES[status] ?? 'bg-slate-100 text-[#64748B]'}`}>
      {status}
    </span>
  );
}