import Link from 'next/link';
import { UserPlus, Landmark, Factory, Building2, ListChecks, FileBarChart2 } from 'lucide-react';

const ACTIONS = [
  { label: 'Add Bank Admin', href: '/platform/users', icon: UserPlus, color: 'text-[#1F4DA8]' },
  { label: 'Manage Banks', href: '/platform/banks', icon: Landmark, color: 'text-[#1F4DA8]' },
  { label: 'Manufacturers', href: '/platform/manufacturers', icon: Factory, color: 'text-[#1F4DA8]' },
  { label: 'Distributors', href: '/platform/distributors', icon: Building2, color: 'text-[#1F4DA8]' },
  { label: 'Audit Trail', href: '/platform/audit-trail', icon: ListChecks, color: 'text-[#1F4DA8]' },
  { label: 'Generate Report', href: '/platform/reports', icon: FileBarChart2, color: 'text-[#1F4DA8]' },
];

export function PlatformQuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {ACTIONS.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] py-4 px-3 text-center hover:bg-[#F7F9FC] hover:border-[#1F4DA8]/30 transition-all duration-200"
        >
          <action.icon size={20} className={action.color} />
          <span className="text-xs font-medium text-[#1E293B]">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}