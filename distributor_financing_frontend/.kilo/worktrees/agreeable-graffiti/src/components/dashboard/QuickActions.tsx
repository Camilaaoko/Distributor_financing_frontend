'use client';

import { useRouter } from 'next/navigation';
import { Landmark, FileText, ShoppingCart, Boxes, Users, FileBarChart2 } from 'lucide-react';
import { quickActions } from '@/lib/mock/manufacturer-dashboard';

const ICONS = {
  financing: { Icon: Landmark, color: 'text-[#1F4DA8]' },
  invoice: { Icon: FileText, color: 'text-[#1F4DA8]' },
  orders: { Icon: ShoppingCart, color: 'text-[#1F4DA8]' },
  inventory: { Icon: Boxes, color: 'text-[#1F4DA8]' },
  users: { Icon: Users, color: 'text-[#1F4DA8]' },
  report: { Icon: FileBarChart2, color: 'text-[#1F4DA8]' },
} as const;

const ACTION_ROUTES: Record<string, string> = {
  financing: '/manufacturer/financing',
  invoice: '/manufacturer/invoices',
  orders: '/manufacturer/purchase-orders',
  inventory: '/manufacturer/products',
  users: '/manufacturer/dealers',
  report: '/manufacturer/reports',
};

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {quickActions.map((action) => {
        const { Icon, color } = ICONS[action.icon];
        const route = ACTION_ROUTES[action.icon];

        return (
          <button
            key={action.label}
            onClick={() => route && router.push(route)}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] py-4 px-3 text-center hover:bg-[#F7F9FC] hover:border-[#1F4DA8]/30 transition-all duration-200 cursor-pointer"
          >
            <Icon size={20} className={color} />
            <span className="text-xs font-medium text-[#1E293B]">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}