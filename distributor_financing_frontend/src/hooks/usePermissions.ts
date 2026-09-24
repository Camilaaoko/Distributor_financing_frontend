'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/types';

export type OrganizationType = 'DISTRIBUTOR' | 'BANK' | 'MANUFACTURER' | 'PLATFORM';

/**
 * Resolves the business organization from the user's base authenticated role.
 */
export function resolveOrganization(role?: string | null): OrganizationType {
  const norm = (role || '').toUpperCase().trim();
  if (norm.includes('DISTRIBUTOR') || norm.includes('DEALER')) return 'DISTRIBUTOR';
  if (norm.includes('BANK')) return 'BANK';
  if (norm.includes('MANUFACTURER')) return 'MANUFACTURER';
  if (norm.includes('PLATFORM') || norm.includes('SUPER_ADMIN')) return 'PLATFORM';
  return 'DISTRIBUTOR';
}

/**
 * Dynamic Organization, AppRole, and Permissions Hook.
 * The backend is the authoritative source for user roles, dynamic AppRoles, and permissions.
 */
export function usePermissions() {
  const { user } = useAuth();

  const role = user?.role ?? null;
  const rawPermissions: string[] = Array.isArray(user?.permissions) ? user.permissions : [];
  const organization = resolveOrganization(role);

  // Business AppRole representing the user's role on the platform
  const appRole =
    user?.appRole ||
    user?.roleName ||
    (organization === 'DISTRIBUTOR'
      ? role === 'DISTRIBUTOR_ADMIN'
        ? 'Distributor Administrator'
        : 'Distributor User'
      : organization === 'BANK'
      ? role === 'BANK_ADMIN'
        ? 'Bank Administrator'
        : 'Bank User'
      : organization === 'MANUFACTURER'
      ? role === 'MANUFACTURER_ADMIN'
        ? 'Manufacturer Administrator'
        : 'Manufacturer User'
      : 'Platform Administrator');

  const roleName = appRole;

  // Build a normalized lookup set from user's raw permissions
  // Support both space-separated ("APPROVE DISTRIBUTOR LOAN"), underscore ("APPROVE_DISTRIBUTOR_LOAN"),
  // lowercase, colon notation, etc.
  const userPermSet = useMemo(() => {
    const set = new Set<string>();
    for (const p of rawPermissions) {
      if (!p || typeof p !== 'string') continue;
      const trimmed = p.trim();
      set.add(trimmed);
      set.add(trimmed.toUpperCase());
      set.add(trimmed.toLowerCase());
      // Convert spaces / dashes to underscores
      const underscored = trimmed.toUpperCase().replace(/[\s\-]+/g, '_');
      set.add(underscored);
      // Convert underscores to spaces
      const spaced = trimmed.toUpperCase().replace(/_/g, ' ');
      set.add(spaced);
    }
    return set;
  }, [rawPermissions]);

  /**
   * Permission code synonyms mapping between backend enum codes and RBAC colon notation.
   */
  const PERMISSION_SYNONYMS: Record<string, string[]> = {
    // Distributor
    APPLY_FINANCING: ['APPLY_FINANCING', 'APPLY FINANCING', 'dist:drawdowns:create_maker', 'CREATE_FINANCING', 'REQUEST_FINANCING'],
    APPROVE_DISTRIBUTOR_LOAN: ['APPROVE_DISTRIBUTOR_LOAN', 'APPROVE DISTRIBUTOR LOAN', 'dist:drawdowns:approve_checker', 'AUTHORIZE_DISTRIBUTOR_LOAN'],
    VIEW_MY_LOANS: ['VIEW_MY_LOANS', 'VIEW MY LOANS', 'dist:drawdowns:read', 'VIEW_LOANS', 'VIEW LOANS', 'READ_LOANS'],
    CANCEL_LOAN_REQUEST: ['CANCEL_LOAN_REQUEST', 'CANCEL LOAN REQUEST', 'dist:drawdowns:cancel'],
    VIEW_MY_INVOICES: ['VIEW_MY_INVOICES', 'VIEW MY INVOICES', 'VIEW_INVOICES', 'VIEW INVOICES'],
    VIEW_AVAILABLE_CREDIT: ['VIEW_AVAILABLE_CREDIT', 'VIEW AVAILABLE CREDIT', 'dist:profile:read'],
    VIEW_MY_REPAYMENTS: ['VIEW_MY_REPAYMENTS', 'VIEW MY REPAYMENTS', 'VIEW_REPAYMENTS', 'VIEW REPAYMENTS', 'dist:repayments:read'],
    APPROVE_DISTRIBUTOR_REPAYMENT: ['APPROVE_DISTRIBUTOR_REPAYMENT', 'APPROVE DISTRIBUTOR REPAYMENT', 'dist:repayments:approve'],
    REJECT_DISTRIBUTOR_REPAYMENT: ['REJECT_DISTRIBUTOR_REPAYMENT', 'REJECT DISTRIBUTOR REPAYMENT', 'dist:repayments:reject'],
    MANAGE_DISTRIBUTOR_USERS: ['MANAGE_DISTRIBUTOR_USERS', 'MANAGE DISTRIBUTOR USERS', 'dist:users:manage', 'MANAGE_USERS', 'USER_MANAGEMENT'],

    // Bank
    APPROVE_BANK_LOAN: [
      'APPROVE_BANK_LOAN',
      'APPROVE BANK LOAN',
      'bank:loans:authorize_checker',
      'AUTHORIZE_BANK_LOAN',
      'APPROVE_LOAN',
      'APPROVE LOAN',
      'AUTHORIZE_DISBURSEMENT',
      'AUTHORIZE DISBURSEMENT',
      'bank:loans:approve',
      'bank:loans:authorize',
    ],
    REJECT_BANK_LOAN: ['REJECT_BANK_LOAN', 'REJECT BANK LOAN', 'bank:loans:reject', 'REJECT_LOAN', 'REJECT LOAN'],
    DISBURSE_LOAN: [
      'DISBURSE_LOAN',
      'DISBURSE LOAN',
      'bank:loans:disburse',
      'bank:disbursements:trigger',
      'DISBURSE_FUNDS',
      'DISBURSE FUNDS',
      'TRIGGER_DISBURSEMENT',
      'TRIGGER DISBURSEMENT',
      'bank:loans:authorize_checker',
      'APPROVE_BANK_LOAN',
    ],
    VIEW_LOAN_APPLICATIONS: ['VIEW_LOAN_APPLICATIONS', 'VIEW LOAN APPLICATIONS', 'bank:loans:read', 'VIEW_LOANS', 'VIEW LOANS', 'VIEW_MY_LOANS', 'VIEW MY LOANS'],
    VIEW_LOANS: ['VIEW_LOANS', 'VIEW LOANS', 'bank:loans:read', 'VIEW_LOAN_APPLICATIONS', 'VIEW LOAN APPLICATIONS', 'VIEW_MY_LOANS', 'VIEW MY LOANS'],
    MANAGE_BANK_USERS: ['MANAGE_BANK_USERS', 'MANAGE BANK USERS', 'bank:users:read', 'bank:users:create', 'bank:users:update', 'MANAGE_USERS', 'USER_MANAGEMENT'],
    USER_MANAGEMENT: ['USER_MANAGEMENT', 'USER MANAGEMENT', 'bank:users:read', 'bank:users:create', 'MANAGE_BANK_USERS', 'MANAGE_DISTRIBUTOR_USERS', 'MANAGE_MANUFACTURER_USERS', 'MANAGE_USERS'],
    MANAGE_BANK_FACILITIES: ['MANAGE_BANK_FACILITIES', 'MANAGE BANK FACILITIES', 'bank:loans:restructure'],
    MANAGE_BRANCHES: ['MANAGE_BRANCHES', 'MANAGE BRANCHES', 'platform:banks:update', 'bank:branches:manage'],

    // Manufacturer
    VIEW_PURCHASE_ORDERS: ['VIEW_PURCHASE_ORDERS', 'VIEW PURCHASE ORDERS', 'mfg:orders:read'],
    CONFIRM_DELIVERY: ['CONFIRM_DELIVERY', 'CONFIRM DELIVERY', 'mfg:invoices:approve_checker'],
    VIEW_INVOICES: ['VIEW_INVOICES', 'VIEW INVOICES', 'mfg:invoices:create_maker', 'mfg:invoices:approve_checker'],
    GENERATE_STATEMENT: ['GENERATE_STATEMENT', 'GENERATE STATEMENT', 'mfg:reports:export'],
    MANAGE_MANUFACTURER_USERS: ['MANAGE_MANUFACTURER_USERS', 'MANAGE MANUFACTURER USERS', 'mfg:users:read', 'mfg:users:create', 'MANAGE_USERS', 'USER_MANAGEMENT'],
    VIEW_PORTFOLIO: ['VIEW_PORTFOLIO', 'VIEW PORTFOLIO', 'mfg:analytics:view'],
    VIEW_DISTRIBUTORS: ['VIEW_DISTRIBUTORS', 'VIEW DISTRIBUTORS', 'mfg:referrals:read'],

    // Platform & Shared
    MANAGE_ROLES: ['MANAGE_ROLES', 'MANAGE ROLES', 'platform:roles:manage', 'platform:roles:create', 'platform:roles:update', 'bank:roles:manage'],
    VIEW_REPORTS: ['VIEW_REPORTS', 'VIEW REPORTS', 'platform:reports:view', 'bank:reports:view', 'mfg:analytics:view'],
    VIEW_AUDIT_TRAIL: ['VIEW_AUDIT_TRAIL', 'VIEW AUDIT TRAIL', 'platform:audit:read'],
  };

  /**
   * Primary permission checker.
   * Returns true if the user's session contains the requested permission code.
   * Platform Admins inherit full access.
   */
  const hasPermission = (code: string): boolean => {
    if (!user) return false;
    if (user.role === 'PLATFORM_ADMIN') return true;

    const synonyms = PERMISSION_SYNONYMS[code] || [code];

    // 1. Authoritative permissions from backend session/JWT
    if (rawPermissions.length > 0) {
      if (userPermSet.has('*')) return true;
      if (
        userPermSet.has(code) ||
        userPermSet.has(code.toUpperCase()) ||
        userPermSet.has(code.toUpperCase().replace(/_/g, ' ')) ||
        userPermSet.has(code.toUpperCase().replace(/[\s\-]+/g, '_'))
      ) {
        return true;
      }
      for (const syn of synonyms) {
        if (
          userPermSet.has(syn) ||
          userPermSet.has(syn.toUpperCase()) ||
          userPermSet.has(syn.toUpperCase().replace(/_/g, ' ')) ||
          userPermSet.has(syn.toUpperCase().replace(/[\s\-]+/g, '_'))
        ) {
          return true;
        }
      }
      // CRITICAL: When rawPermissions is provided by the backend, it is AUTHORITATIVE.
      // Do NOT fall through to permissive defaults if the permission was not granted.
      return false;
    }

    // 2. Safe defaults ONLY for legacy/mock sessions when permissions array is completely empty
    const normalizedRole = (role || '').toUpperCase();
    const normalizedRoleName = (appRole || '').toUpperCase();

    // Admin Persona Fallbacks
    if (
      normalizedRole === 'DISTRIBUTOR_ADMIN' ||
      normalizedRole === 'BANK_ADMIN' ||
      normalizedRole === 'MANUFACTURER_ADMIN' ||
      normalizedRoleName.includes('ADMINISTRATOR') ||
      normalizedRoleName.includes('ADMIN')
    ) {
      if (organization === 'DISTRIBUTOR') {
        const allowed = [
          'APPLY_FINANCING',
          'APPROVE_DISTRIBUTOR_LOAN',
          'VIEW_MY_LOANS',
          'CANCEL_LOAN_REQUEST',
          'VIEW_MY_INVOICES',
          'VIEW_AVAILABLE_CREDIT',
          'VIEW_MY_REPAYMENTS',
          'APPROVE_DISTRIBUTOR_REPAYMENT',
          'REJECT_DISTRIBUTOR_REPAYMENT',
          'MANAGE_DISTRIBUTOR_USERS',
          'USER_MANAGEMENT',
          'MANAGE_ROLES',
          'VIEW_REPORTS',
          'VIEW_AUDIT_TRAIL',
        ];
        return allowed.includes(code) || synonyms.some((s) => allowed.includes(s));
      }
      if (organization === 'BANK') {
        const allowed = [
          'VIEW_LOAN_APPLICATIONS',
          'VIEW_LOANS',
          'APPROVE_BANK_LOAN',
          'REJECT_BANK_LOAN',
          'DISBURSE_LOAN',
          'MANAGE_BANK_USERS',
          'USER_MANAGEMENT',
          'MANAGE_ROLES',
          'MANAGE_BRANCHES',
          'MANAGE_BANK_FACILITIES',
          'VIEW_REPORTS',
          'VIEW_AUDIT_TRAIL',
        ];
        return allowed.includes(code) || synonyms.some((s) => allowed.includes(s));
      }
      if (organization === 'MANUFACTURER') {
        const allowed = [
          'VIEW_PORTFOLIO',
          'VIEW_DISTRIBUTORS',
          'VIEW_PURCHASE_ORDERS',
          'CONFIRM_DELIVERY',
          'VIEW_INVOICES',
          'GENERATE_STATEMENT',
          'MANAGE_MANUFACTURER_USERS',
          'USER_MANAGEMENT',
          'MANAGE_ROLES',
          'VIEW_REPORTS',
          'VIEW_AUDIT_TRAIL',
        ];
        return allowed.includes(code) || synonyms.some((s) => allowed.includes(s));
      }
    }

    // Checker / Approver Persona Fallbacks
    if (
      normalizedRoleName.includes('CHECKER') ||
      normalizedRoleName.includes('APPROVER') ||
      normalizedRoleName.includes('SANCTION') ||
      normalizedRoleName.includes('AUTHORIZER') ||
      normalizedRole === 'DISTRIBUTOR_CHECKER' ||
      normalizedRole === 'BANK_CHECKER'
    ) {
      if (organization === 'DISTRIBUTOR') {
        const allowed = [
          'APPROVE_DISTRIBUTOR_LOAN',
          'VIEW_MY_LOANS',
          'VIEW_MY_INVOICES',
          'VIEW_AVAILABLE_CREDIT',
          'APPROVE_DISTRIBUTOR_REPAYMENT',
          'REJECT_DISTRIBUTOR_REPAYMENT',
          'VIEW_MY_REPAYMENTS',
          'VIEW_REPORTS',
        ];
        return allowed.includes(code) || synonyms.some((s) => allowed.includes(s));
      }
      if (organization === 'BANK') {
        const allowed = [
          'VIEW_LOAN_APPLICATIONS',
          'VIEW_LOANS',
          'APPROVE_BANK_LOAN',
          'REJECT_BANK_LOAN',
          'DISBURSE_LOAN',
          'VIEW_REPORTS',
        ];
        return allowed.includes(code) || synonyms.some((s) => allowed.includes(s));
      }
      if (organization === 'MANUFACTURER') {
        const allowed = [
          'VIEW_PORTFOLIO',
          'VIEW_DISTRIBUTORS',
          'VIEW_PURCHASE_ORDERS',
          'CONFIRM_DELIVERY',
          'VIEW_INVOICES',
          'VIEW_REPORTS',
        ];
        return allowed.includes(code) || synonyms.some((s) => allowed.includes(s));
      }
    }

    // Maker Persona Fallbacks
    if (
      normalizedRoleName.includes('MAKER') ||
      normalizedRoleName.includes('OPERATOR') ||
      normalizedRole === 'DISTRIBUTOR_MAKER' ||
      normalizedRole === 'BANK_MAKER'
    ) {
      if (organization === 'DISTRIBUTOR') {
        const allowed = [
          'APPLY_FINANCING',
          'VIEW_MY_LOANS',
          'CANCEL_LOAN_REQUEST',
          'VIEW_MY_INVOICES',
          'VIEW_AVAILABLE_CREDIT',
          'VIEW_MY_REPAYMENTS',
          'VIEW_REPORTS',
        ];
        return allowed.includes(code) || synonyms.some((s) => allowed.includes(s));
      }
      if (organization === 'BANK') {
        const allowed = [
          'VIEW_LOAN_APPLICATIONS',
          'VIEW_LOANS',
          'MANAGE_BANK_FACILITIES',
          'VIEW_REPORTS',
        ];
        return allowed.includes(code) || synonyms.some((s) => allowed.includes(s));
      }
      if (organization === 'MANUFACTURER') {
        const allowed = [
          'VIEW_PORTFOLIO',
          'VIEW_DISTRIBUTORS',
          'VIEW_PURCHASE_ORDERS',
          'VIEW_INVOICES',
          'GENERATE_STATEMENT',
          'VIEW_REPORTS',
        ];
        return allowed.includes(code) || synonyms.some((s) => allowed.includes(s));
      }
    }

    // Default read-only fallbacks per organization
    if (organization === 'DISTRIBUTOR') {
      const allowed = ['VIEW_MY_LOANS', 'VIEW_MY_INVOICES', 'VIEW_AVAILABLE_CREDIT', 'VIEW_MY_REPAYMENTS'];
      return allowed.includes(code) || synonyms.some((s) => allowed.includes(s));
    }
    if (organization === 'BANK') {
      const allowed = ['VIEW_LOAN_APPLICATIONS', 'VIEW_LOANS', 'VIEW_REPORTS'];
      return allowed.includes(code) || synonyms.some((s) => allowed.includes(s));
    }
    if (organization === 'MANUFACTURER') {
      const allowed = ['VIEW_PORTFOLIO', 'VIEW_DISTRIBUTORS', 'VIEW_PURCHASE_ORDERS', 'VIEW_INVOICES', 'VIEW_REPORTS'];
      return allowed.includes(code) || synonyms.some((s) => allowed.includes(s));
    }

    return false;
  };

  const hasAnyPermission = (...codes: (string | string[])[]): boolean => {
    if (!user) return false;
    if (user.role === 'PLATFORM_ADMIN') return true;
    const flat = codes.flat();
    return flat.some((c) => hasPermission(c));
  };

  const hasAllPermissions = (...codes: (string | string[])[]): boolean => {
    if (!user) return false;
    if (user.role === 'PLATFORM_ADMIN') return true;
    const flat = codes.flat();
    return flat.every((c) => hasPermission(c));
  };

  const hasRole = (...roles: UserRole[]) => !!user && roles.includes(user.role);

  const hasOrganization = (org: OrganizationType): boolean => organization === org;

  return {
    user,
    role,
    roleName,
    appRole,
    organization,
    permissions: rawPermissions,
    hasRole,
    hasOrganization,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Distributor Specific Capabilities
    canApplyFinancing: hasPermission('APPLY_FINANCING'),
    canApproveDistributorLoan: hasPermission('APPROVE_DISTRIBUTOR_LOAN'),
    canCancelLoan: hasPermission('CANCEL_LOAN_REQUEST'),
    canViewLoans: hasPermission('VIEW_MY_LOANS'),
    canManageDistributorUsers: hasPermission('MANAGE_DISTRIBUTOR_USERS'),

    // Bank Specific Capabilities
    canViewLoanApplications: hasPermission('VIEW_LOAN_APPLICATIONS') || hasPermission('VIEW_MY_LOANS'),
    canApproveBankLoan: hasPermission('APPROVE_BANK_LOAN'),
    canRejectBankLoan: hasPermission('REJECT_BANK_LOAN'),
    canDisburseLoan: hasPermission('DISBURSE_LOAN') || hasPermission('APPROVE_BANK_LOAN'),
    canManageBankUsers: hasPermission('MANAGE_BANK_USERS'),
    canManageBranches: hasPermission('MANAGE_BRANCHES'),
    canManageRoles: hasPermission('MANAGE_ROLES'),

    // Manufacturer Specific Capabilities
    canManageManufacturerUsers: hasPermission('MANAGE_MANUFACTURER_USERS'),
    canViewAnchorPortfolio: hasPermission('VIEW_PORTFOLIO') || hasPermission('VIEW_REPORTS'),

    // General Capabilities
    canViewReports: hasPermission('VIEW_REPORTS'),
    canViewAuditTrail: hasPermission('VIEW_AUDIT_TRAIL'),

    // Domain Helpers
    isDistributor: organization === 'DISTRIBUTOR',
    isBank: organization === 'BANK',
    isManufacturer: organization === 'MANUFACTURER',
    isPlatformAdmin: organization === 'PLATFORM',

    // Role Persona Helpers
    isMaker: hasPermission('APPLY_FINANCING'),
    isChecker: hasPermission('APPROVE_DISTRIBUTOR_LOAN') || hasPermission('APPROVE_BANK_LOAN') || hasPermission('CONFIRM_DELIVERY'),
    isAdmin:
      role === 'DISTRIBUTOR_ADMIN' ||
      role === 'BANK_ADMIN' ||
      role === 'MANUFACTURER_ADMIN' ||
      role === 'PLATFORM_ADMIN' ||
      hasPermission('MANAGE_DISTRIBUTOR_USERS') ||
      hasPermission('MANAGE_BANK_USERS') ||
      hasPermission('MANAGE_MANUFACTURER_USERS') ||
      hasPermission('MANAGE_ROLES'),
  };
}

export default usePermissions;
