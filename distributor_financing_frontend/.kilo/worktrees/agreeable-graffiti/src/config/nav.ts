import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Landmark,
  Users,
  CreditCard,
  BarChart3,
  ShieldCheck,
  Building2,
  Factory,
  UserCheck,
  ListChecks,
  Wallet,
  Coins,
  Package,
  ShoppingCart,
  Receipt,
  ArrowDownToLine,
  CheckSquare,
  Briefcase,
  GitPullRequestArrow,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  badge?: number;
  adminOnly?: boolean;
  requiredPermission?: string;
  children?: NavItem[];
}

export const NAV_BY_ROLE: Record<'bank' | 'manufacturer' | 'dealer' | 'platform', NavItem[]> = {
  bank: [
    { label: 'Dashboard', href: '/bank', icon: LayoutDashboard },
    { label: 'Financing Models', href: '/bank/financing-models', icon: Coins },
    { label: 'Float', href: '/bank/float', icon: Wallet },
    { label: 'Manufacturers', href: '/bank/manufacturers', icon: Factory },
    { label: 'Distributors', href: '/bank/distributors', icon: Building2 },
    { label: 'Approvals', href: '/bank/approvals', icon: CheckSquare },
    { label: 'Portfolio', href: '/bank/portfolio', icon: Briefcase },
    { label: 'Reports', href: '/bank/reports', icon: BarChart3 },
    { label: 'Users', href: '/bank/users', icon: UserCheck, adminOnly: true, requiredPermission: 'USER_MANAGEMENT' },
    { label: 'Roles and Permissions', href: '/bank/roles', icon: ShieldCheck, adminOnly: true, requiredPermission: 'ROLE_MANAGEMENT' },
    { label: 'Audit Trails', href: '/bank/audit-trail', icon: ListChecks },
  ],

  manufacturer: [
    { label: 'Dashboard', href: '/manufacturer', icon: LayoutDashboard },
    { label: 'Partner Bank', href: '/manufacturer/banks', icon: Landmark },
    { label: 'Purchase Orders', href: '/manufacturer/purchase-orders', icon: ShoppingCart },
    { label: 'Credit Requests', href: '/manufacturer/credit-requests', icon: CreditCard },
    { label: 'Distributors', href: '/manufacturer/distributors', icon: Building2 },
    { label: 'Referrals', href: '/manufacturer/referrals', icon: GitPullRequestArrow },
    { label: 'Payments', href: '/manufacturer/payments', icon: Receipt },
    { label: 'Reports', href: '/manufacturer/reports', icon: BarChart3 },
    { label: 'Users', href: '/manufacturer/users', icon: Users, adminOnly: true, requiredPermission: 'USER_MANAGEMENT' },
    { label: 'Roles and Permissions', href: '/manufacturer/roles', icon: ShieldCheck, adminOnly: true, requiredPermission: 'ROLE_MANAGEMENT' },
    { label: 'Audit Trail', href: '/manufacturer/audit-trail', icon: ListChecks },
  ],

  dealer: [
    { label: 'Dashboard', href: '/dealer', icon: LayoutDashboard },
    { label: 'Drawdowns', href: '/dealer/drawdowns', icon: ArrowDownToLine },
    { label: 'Repayments', href: '/dealer/repayments', icon: Receipt },
    { label: 'Manufacturers', href: '/dealer/manufacturers', icon: Factory },
    { label: 'Banks', href: '/dealer/banks', icon: Landmark },
    { label: 'Users', href: '/dealer/users', icon: Users, adminOnly: true, requiredPermission: 'USER_MANAGEMENT' },
    { label: 'Roles and Permissions', href: '/dealer/roles', icon: ShieldCheck, adminOnly: true, requiredPermission: 'ROLE_MANAGEMENT' },
    { label: 'Audit Trail', href: '/dealer/audit-trail', icon: ListChecks },
  ],

  platform: [
    { label: 'Dashboard', href: '/platform', icon: LayoutDashboard },
    { label: 'Bank Admins', href: '/platform/users', icon: Users },
    { label: 'Banks', href: '/platform/banks', icon: Landmark },
    { label: 'Financing Products', href: '/platform/financing-products', icon: Package },
    { label: 'Reports', href: '/platform/reports', icon: BarChart3 },
    { label: 'Audit Trail', href: '/platform/audit-trail', icon: ListChecks },
  ],
};

export const ROLE_USER_LABEL = {
  manufacturer: {
    letter: 'M',
    name: 'Manufacturer Admin',
    email: 'manufacturer@dfp.com',
    roleTitle: 'Anchor Enterprise',
  },
  bank: {
    letter: 'B',
    name: 'Bank User',
    email: 'bank@dfp.com',
    roleTitle: 'Bank User',
  },
  dealer: {
    letter: 'D',
    name: 'Distributor Admin',
    email: 'dealer@dfp.com',
    roleTitle: 'Commercial Distributor',
  },
  platform: {
    letter: 'P',
    name: 'Platform Admin',
    email: 'platform@dfp.com',
    roleTitle: 'System Administrator',
  },
} as const;

export function formatRoleTitle(role?: string, fallback = 'User'): string {
  if (!role) return fallback;
  const normalized = role.toUpperCase().trim();
  if (normalized === 'PLATFORM_ADMIN') return 'Platform Administrator';
  if (normalized === 'BANK_ADMIN') return 'Bank Administrator';
  if (normalized === 'BANK_MAKER') return 'Bank Maker';
  if (normalized === 'BANK_CHECKER') return 'Bank Checker';
  if (normalized === 'BANK_USER') return 'Bank Staff User';
  if (normalized === 'MANUFACTURER_ADMIN') return 'Manufacturer Administrator';
  if (normalized === 'MANUFACTURER_MAKER') return 'Manufacturer Maker';
  if (normalized === 'MANUFACTURER_CHECKER') return 'Manufacturer Checker';
  if (normalized === 'MANUFACTURER_USER') return 'Manufacturer User';
  if (normalized === 'DISTRIBUTOR_ADMIN') return 'Distributor Administrator';
  if (normalized === 'DISTRIBUTOR_MAKER') return 'Distributor Maker';
  if (normalized === 'DISTRIBUTOR_CHECKER') return 'Distributor Checker';
  if (normalized === 'DISTRIBUTOR_USER') return 'Distributor User';
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const ROLE_HOMES: Record<keyof typeof NAV_BY_ROLE, string> = {
  platform: '/platform',
  bank: '/bank',
  manufacturer: '/manufacturer',
  dealer: '/dealer',
};

export const ROLE_SETTINGS_ROUTES: Record<keyof typeof NAV_BY_ROLE, string> = {
  platform: '/platform/profile',
  bank: '/bank/settings',
  manufacturer: '/manufacturer/settings',
  dealer: '/dealer/settings',
};

export const ROLE_PROFILE_ROUTES: Record<keyof typeof NAV_BY_ROLE, string> = {
  platform: '/platform/profile',
  bank: '/bank/settings',
  manufacturer: '/manufacturer/settings',
  dealer: '/dealer/profile',
};

export const ROLE_NOTIFICATIONS_ROUTES: Record<keyof typeof NAV_BY_ROLE, string> = {
  platform: '/platform/notifications',
  bank: '/bank/notifications',
  manufacturer: '/manufacturer/notifications',
  dealer: '/dealer/notifications',
};

export function roleFromPathname(pathname: string): keyof typeof NAV_BY_ROLE {
  if (pathname.startsWith('/bank')) return 'bank';
  if (pathname.startsWith('/dealer')) return 'dealer';
  if (pathname.startsWith('/platform')) return 'platform';
  if (pathname.startsWith('/manufacturer')) return 'manufacturer';
  return 'platform';
}