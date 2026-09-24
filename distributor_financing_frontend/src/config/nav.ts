import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ClipboardList,
  Landmark,
  Users,
  CreditCard,
  BarChart3,
  FileBarChart2,
  Settings,
  ShieldCheck,
  Building2,
  Factory,
  UserCheck,
  GitPullRequestArrow,
  PlusCircle,
  ListChecks,
  Wallet,
  Bell,
  Coins,
  Sparkles,
  FileSpreadsheet,
  LineChart,
} from 'lucide-react';
import type { OrganizationType } from '@/hooks/usePermissions';

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  badge?: number;
  requiredPermissions?: string[];
  anyPermission?: string[];
  adminOnly?: boolean;
  children?: NavItem[];
}

export const NAV_SCHEMAS: Record<OrganizationType, NavItem[]> = {
  DISTRIBUTOR: [
    { label: 'Dashboard', href: '/dealer', icon: LayoutDashboard },
    { label: 'Financing Drawdowns', href: '/dealer/drawdowns', icon: Coins },
    { label: 'My Statement', href: '/dealer/reports/my-statement', icon: FileSpreadsheet },
    { label: 'My Credit Assessment', href: '/dealer/credit-assessment', icon: Sparkles },
    { label: 'Repayments', href: '/dealer/repayments', icon: Wallet },
    { label: 'Partner Banks', href: '/dealer/banks', icon: Landmark },
    { label: 'Anchor Manufacturers', href: '/dealer/manufacturers', icon: Factory },
    {
      label: 'Distributor Users',
      href: '/dealer/users',
      icon: Users,
      anyPermission: ['MANAGE_DISTRIBUTOR_USERS', 'MANAGE_USERS'],
      adminOnly: true,
    },
    {
      label: 'Roles & Permissions',
      href: '/dealer/roles',
      icon: ShieldCheck,
      anyPermission: ['MANAGE_ROLES', 'MANAGE_DISTRIBUTOR_USERS'],
      adminOnly: true,
    },
    {
      label: 'Audit Trail',
      href: '/dealer/audit-trail',
      icon: ListChecks,
      anyPermission: ['VIEW_AUDIT_TRAIL', 'MANAGE_DISTRIBUTOR_USERS'],
      adminOnly: true,
    },
  ],

  BANK: [
    { label: 'Dashboard', href: '/bank', icon: LayoutDashboard },
    { label: 'Distributor Profiles', href: '/bank/distributors', icon: Building2 },
    {
      label: 'Loan Approvals',
      href: '/bank/approvals',
      icon: ShieldCheck,
      anyPermission: ['VIEW_LOAN_APPLICATIONS', 'APPROVE_BANK_LOAN', 'VIEW_MY_LOANS'],
    },
    { label: 'Financing Models', href: '/bank/financing-models', icon: Coins },
    { label: 'Credit Exposure & Limits', href: '/bank/float', icon: Wallet },
    { label: 'Repayment Review', href: '/bank/repayments', icon: Wallet },
    { label: 'Repayment Reports', href: '/bank/repayments/reports', icon: FileBarChart2 },
    {
      label: 'Reports & Analytics',
      icon: BarChart3,
      children: [
        { label: 'Portfolio Performance', href: '/bank/reports/portfolio-performance', icon: LineChart },
        { label: 'CBK Regulatory Returns', href: '/bank/reports/regulatory-cbk', icon: ShieldCheck },
        { label: 'Credit Underwriting', href: '/bank/reports/credit-assessments', icon: Sparkles },
        { label: 'Reports Hub', href: '/bank/reports', icon: BarChart3 },
      ],
    },
    { label: 'Manufacturers', href: '/bank/manufacturers', icon: Factory },
    {
      label: 'Bank Branches',
      href: '/bank/branches',
      icon: Landmark,
      anyPermission: ['MANAGE_BRANCHES', 'MANAGE_BANK_USERS'],
      adminOnly: true,
    },
    {
      label: 'Bank Staff & Users',
      href: '/bank/users',
      icon: UserCheck,
      anyPermission: ['MANAGE_BANK_USERS', 'MANAGE_USERS'],
      adminOnly: true,
    },
    {
      label: 'Roles and Permissions',
      href: '/bank/roles',
      icon: ShieldCheck,
      anyPermission: ['MANAGE_ROLES', 'MANAGE_BANK_USERS'],
      adminOnly: true,
    },
    {
      label: 'Audit Trails',
      href: '/bank/audit-trail',
      icon: ListChecks,
      anyPermission: ['VIEW_AUDIT_TRAIL', 'MANAGE_BANK_USERS'],
      adminOnly: true,
    },
  ],

  MANUFACTURER: [
    { label: 'Dashboard', href: '/manufacturer', icon: LayoutDashboard },
    { label: 'Anchor Portfolio Performance', href: '/manufacturer/reports', icon: BarChart3 },
    { label: 'Partner Bank', href: '/manufacturer/banks', icon: Landmark },
    { label: 'Distributors', href: '/manufacturer/distributors', icon: Building2 },
    {
      label: 'Users',
      href: '/manufacturer/users',
      icon: Users,
      anyPermission: ['MANAGE_MANUFACTURER_USERS', 'MANAGE_USERS'],
      adminOnly: true,
    },
    {
      label: 'Roles and Permissions',
      href: '/manufacturer/roles',
      icon: ShieldCheck,
      anyPermission: ['MANAGE_ROLES', 'MANAGE_MANUFACTURER_USERS'],
      adminOnly: true,
    },
    {
      label: 'Audit Trail',
      href: '/manufacturer/audit-trail',
      icon: ListChecks,
      anyPermission: ['VIEW_AUDIT_TRAIL', 'MANAGE_MANUFACTURER_USERS'],
      adminOnly: true,
    },
  ],

  PLATFORM: [
    { label: 'Dashboard', href: '/platform', icon: LayoutDashboard },
    { label: 'Reports & Analytics', href: '/platform/reports', icon: BarChart3 },
    { label: 'Bank Admins', href: '/platform/users', icon: Users },
    { label: 'Bank Users', href: '/platform/bank-users', icon: UserCheck },
    { label: 'Banks', href: '/platform/banks', icon: Landmark },
    { label: 'Manufacturers', href: '/platform/manufacturers', icon: Factory },
    { label: 'Distributors', href: '/platform/distributors', icon: Building2 },
    { label: 'Audit Trail', href: '/platform/audit-trail', icon: ListChecks },
  ],
};

// Legacy fallback map for backward compatibility
export const NAV_BY_ROLE: Record<'bank' | 'manufacturer' | 'dealer' | 'platform', NavItem[]> = {
  bank: NAV_SCHEMAS.BANK,
  manufacturer: NAV_SCHEMAS.MANUFACTURER,
  dealer: NAV_SCHEMAS.DISTRIBUTOR,
  platform: NAV_SCHEMAS.PLATFORM,
};

/**
 * Filter dynamic navigation items for the authenticated user based on organization and permissions.
 */
export function getNavigationForUser(
  organization: OrganizationType,
  hasPermissionFn: (perm: string) => boolean,
  isAdmin: boolean = false
): NavItem[] {
  const schema = NAV_SCHEMAS[organization] || NAV_SCHEMAS.DISTRIBUTOR;

  return schema
    .map((item) => {
      // If item has children, filter children first
      if (item.children && item.children.length > 0) {
        const filteredChildren = item.children.filter((child) => {
          if (child.adminOnly && !isAdmin) return false;
          if (child.anyPermission && child.anyPermission.length > 0) {
            return child.anyPermission.some((p) => hasPermissionFn(p));
          }
          if (child.requiredPermissions && child.requiredPermissions.length > 0) {
            return child.requiredPermissions.every((p) => hasPermissionFn(p));
          }
          return true;
        });

        if (filteredChildren.length === 0) return null;
        return { ...item, children: filteredChildren };
      }

      // Check item permissions
      if (item.adminOnly && !isAdmin) {
        // If user has explicit permissions, allow even if not base admin role
        if (item.anyPermission && item.anyPermission.some((p) => hasPermissionFn(p))) {
          return item;
        }
        return null;
      }

      if (item.anyPermission && item.anyPermission.length > 0) {
        const hasAny = item.anyPermission.some((p) => hasPermissionFn(p));
        if (!hasAny && !isAdmin) return null;
      }

      if (item.requiredPermissions && item.requiredPermissions.length > 0) {
        const hasAll = item.requiredPermissions.every((p) => hasPermissionFn(p));
        if (!hasAll && !isAdmin) return null;
      }

      return item;
    })
    .filter((item): item is NavItem => item !== null);
}

export const ROLE_USER_LABEL = {
  manufacturer: {
    letter: 'M',
    name: 'Manufacturer User',
    email: 'manufacturer@dfp.com',
  },
  bank: {
    letter: 'B',
    name: 'Bank User',
    email: 'bank@dfp.com',
  },
  dealer: {
    letter: 'D',
    name: 'Distributor User',
    email: 'dealer@dfp.com',
  },
  platform: {
    letter: 'P',
    name: 'Platform Admin',
    email: 'platform@dfp.com',
  },
} as const;

export function roleFromPathname(pathname: string): keyof typeof NAV_BY_ROLE {
  if (pathname.startsWith('/bank')) return 'bank';
  if (pathname.startsWith('/dealer') || pathname.startsWith('/portal')) return 'dealer';
  if (pathname.startsWith('/platform')) return 'platform';
  if (pathname.startsWith('/admin')) return 'bank';
  if (pathname.startsWith('/manufacturer')) return 'manufacturer';
  return 'dealer';
}
