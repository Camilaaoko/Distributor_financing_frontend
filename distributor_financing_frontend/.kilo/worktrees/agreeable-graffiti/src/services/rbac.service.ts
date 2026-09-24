import { apiClient } from '@/lib/axios';
import { USE_MOCKS } from '@/lib/config';
import { roleManagementApi } from './onboarding-api.service';
import type {
  StakeholderType,
  Permission,
  DynamicRole,
  CreateRolePayload,
  UpdateRolePayload,
  RoleResponse,
  PermissionDto,
  PermissionCode,
} from '@/lib/types';

export const SEED_PERMISSIONS: Permission[] = [
  // PLATFORM
  { id: 'p1', code: 'platform:banks:read', name: 'View Banks Directory', module: 'Bank Management', stakeholderType: 'PLATFORM', description: 'View list, branches, codes, and statuses of partner banks' },
  { id: 'p2', code: 'platform:banks:create', name: 'Onboard Partner Bank', module: 'Bank Management', stakeholderType: 'PLATFORM', description: 'Onboard new commercial bank partners via bank/branch codes' },
  { id: 'p3', code: 'platform:banks:update', name: 'Update Bank Profile', module: 'Bank Management', stakeholderType: 'PLATFORM', description: 'Edit bank name, branch details, location, and metadata' },
  { id: 'p4', code: 'platform:banks:status', name: 'Change Bank Status', module: 'Bank Management', stakeholderType: 'PLATFORM', description: 'Suspend, reactivate, or reject partner bank access' },
  { id: 'p5', code: 'platform:banks:delete', name: 'Delete Bank Record', module: 'Bank Management', stakeholderType: 'PLATFORM', description: 'Permanently remove a bank record from the directory' },

  { id: 'p6', code: 'platform:users:read', name: 'View Platform & Bank Admins', module: 'Platform Users', stakeholderType: 'PLATFORM', description: 'View administrators across the platform and partner banks' },
  { id: 'p7', code: 'platform:users:create', name: 'Create Bank Admin / Staff', module: 'Platform Users', stakeholderType: 'PLATFORM', description: 'Provision new Bank Admins with initial temporary credentials' },
  { id: 'p8', code: 'platform:users:update', name: 'Edit User Information', module: 'Platform Users', stakeholderType: 'PLATFORM', description: 'Update names, emails, phones, and employee IDs' },
  { id: 'p9', code: 'platform:users:status', name: 'Lock / Unlock Users', module: 'Platform Users', stakeholderType: 'PLATFORM', description: 'Enable, suspend, or lock user accounts' },
  { id: 'p10', code: 'platform:users:reset_pwd', name: 'Trigger Password Reset', module: 'Platform Users', stakeholderType: 'PLATFORM', description: 'Force a password reset for platform and bank administrators' },
  { id: 'p11', code: 'platform:users:delete', name: 'Deactivate User', module: 'Platform Users', stakeholderType: 'PLATFORM', description: 'Soft delete / remove administrative accounts' },

  { id: 'p12', code: 'platform:roles:read', name: 'View Roles & Permissions', module: 'Roles & RBAC', stakeholderType: 'PLATFORM', description: 'Browse all roles across all stakeholder types' },
  { id: 'p13', code: 'platform:roles:create', name: 'Create Custom Role', module: 'Roles & RBAC', stakeholderType: 'PLATFORM', description: 'Define new roles with custom permission matrices' },
  { id: 'p14', code: 'platform:roles:update', name: 'Modify Role Permissions', module: 'Roles & RBAC', stakeholderType: 'PLATFORM', description: 'Add or remove granular permissions from custom roles' },
  { id: 'p15', code: 'platform:roles:delete', name: 'Delete Role', module: 'Roles & RBAC', stakeholderType: 'PLATFORM', description: 'Remove unused custom roles (system roles locked)' },

  { id: 'p16', code: 'platform:audit:read', name: 'View System Audit Logs', module: 'Audit & Reports', stakeholderType: 'PLATFORM', description: 'Inspect security logs, authentication events, and API traces' },
  { id: 'p17', code: 'platform:reports:view', name: 'View Global Analytics', module: 'Audit & Reports', stakeholderType: 'PLATFORM', description: 'Access multi-bank volume, total liquidity, and default rates' },
  { id: 'p18', code: 'platform:reports:export', name: 'Export Platform Reports', module: 'Audit & Reports', stakeholderType: 'PLATFORM', description: 'Download CSV/Excel executive summaries' },

  // BANK
  { id: 'b1', code: 'bank:users:read', name: 'View Bank Staff List', module: 'Bank Users & Staff', stakeholderType: 'BANK', description: 'View internal loan officers, makers, and checkers' },
  { id: 'b2', code: 'bank:users:create', name: 'Onboard Bank User', module: 'Bank Users & Staff', stakeholderType: 'BANK', description: 'Provision internal Bank Maker and Bank Checker staff' },
  { id: 'b3', code: 'bank:users:update', name: 'Edit Bank Staff', module: 'Bank Users & Staff', stakeholderType: 'BANK', description: 'Update staff profile, contact information, and departments' },
  { id: 'b4', code: 'bank:users:deactivate', name: 'Deactivate Bank Staff', module: 'Bank Users & Staff', stakeholderType: 'BANK', description: 'Disable operational bank accounts' },
  { id: 'b5', code: 'bank:roles:manage', name: 'Manage Bank Roles', module: 'Bank Roles', stakeholderType: 'BANK', description: 'Customize operational roles within the bank tenant' },

  { id: 'b6', code: 'bank:manufacturers:read', name: 'View Anchor Manufacturers', module: 'Manufacturer KYC', stakeholderType: 'BANK', description: 'View onboarded manufacturers, KYC statuses, and bank accounts' },
  { id: 'b7', code: 'bank:manufacturers:verify', name: 'Verify Manufacturer KYC', module: 'Manufacturer KYC', stakeholderType: 'BANK', description: 'Review business permits, tax IDs, and approve anchor entities' },

  { id: 'b8', code: 'bank:distributors:read', name: 'View Distributor Referrals', module: 'Distributor Approvals', stakeholderType: 'BANK', description: 'View manufacturer recommendations and submitted ledgers' },
  { id: 'b9', code: 'bank:distributors:review', name: 'Review Financials (Maker)', module: 'Distributor Approvals', stakeholderType: 'BANK', description: 'Evaluate creditworthiness and propose credit limits' },
  { id: 'b10', code: 'bank:distributors:approve', name: 'Authorize Distributor (Checker)', module: 'Distributor Approvals', stakeholderType: 'BANK', description: 'Issue formal bank approval, set credit limit, and issue access' },
  { id: 'b11', code: 'bank:distributors:reject', name: 'Decline Referral', module: 'Distributor Approvals', stakeholderType: 'BANK', description: 'Reject distributor referrals with documented justification' },

  { id: 'b12', code: 'bank:loans:read', name: 'View Loan Portfolio', module: 'Credit & Loans', stakeholderType: 'BANK', description: 'Monitor active loans, drawdowns, and settlement schedules' },
  { id: 'b13', code: 'bank:loans:evaluate_maker', name: 'Prepare Loan Offer (Maker)', module: 'Credit & Loans', stakeholderType: 'BANK', description: 'Review loan drawdown request against approved credit limits' },
  { id: 'b14', code: 'bank:loans:authorize_checker', name: 'Authorize Disbursement (Checker)', module: 'Credit & Loans', stakeholderType: 'BANK', description: 'Authorize fund release to anchor manufacturer account' },
  { id: 'b15', code: 'bank:loans:restructure', name: 'Restructure Loan Facility', module: 'Credit & Loans', stakeholderType: 'BANK', description: 'Adjust tenor, grace periods, or interest rates' },

  { id: 'b16', code: 'bank:repayments:read', name: 'View Repayment Feeds', module: 'Collections & Reports', stakeholderType: 'BANK', description: 'Track incoming settlements from distributors' },
  { id: 'b17', code: 'bank:repayments:reconcile', name: 'Manual Repayment Reconciliation', module: 'Collections & Reports', stakeholderType: 'BANK', description: 'Reconcile offline/RTGS bank payments against loan balances' },
  { id: 'b18', code: 'bank:reports:view', name: 'View Portfolio Analytics', module: 'Collections & Reports', stakeholderType: 'BANK', description: 'Inspect PAR (Portfolio at Risk) and 30/60/90+ aging buckets' },
  { id: 'b19', code: 'bank:reports:export', name: 'Export Regulatory Reports', module: 'Collections & Reports', stakeholderType: 'BANK', description: 'Export Central Bank / statutory prudential reports' },

  // MANUFACTURER
  { id: 'm1', code: 'mfg:users:read', name: 'View Manufacturer Staff', module: 'Staff Management', stakeholderType: 'MANUFACTURER', description: 'View sales managers, finance makers, and checkers' },
  { id: 'm2', code: 'mfg:users:create', name: 'Add Manufacturer User', module: 'Staff Management', stakeholderType: 'MANUFACTURER', description: 'Onboard internal sales/finance staff' },
  { id: 'm3', code: 'mfg:users:update', name: 'Edit User Details', module: 'Staff Management', stakeholderType: 'MANUFACTURER', description: 'Update employee contact and assigned sales territories' },
  { id: 'm4', code: 'mfg:users:deactivate', name: 'Deactivate User', module: 'Staff Management', stakeholderType: 'MANUFACTURER', description: 'Disable internal staff accounts' },

  { id: 'm5', code: 'mfg:referrals:read', name: 'Track Distributor Referrals', module: 'Distributor Referrals', stakeholderType: 'MANUFACTURER', description: 'View onboarding status, KYC reviews, and approved credit limits' },
  { id: 'm6', code: 'mfg:referrals:create', name: 'Refer New Distributor', module: 'Distributor Referrals', stakeholderType: 'MANUFACTURER', description: 'Submit new distributor business info and upload payment ledgers' },
  { id: 'm7', code: 'mfg:referrals:submit_docs', name: 'Upload Financial Ledgers', module: 'Distributor Referrals', stakeholderType: 'MANUFACTURER', description: 'Attach historical CSV/Excel purchase records for scoring' },

  { id: 'm8', code: 'mfg:orders:read', name: 'View Purchase Orders', module: 'Orders & Invoices', stakeholderType: 'MANUFACTURER', description: 'Track purchase orders submitted by distributors' },
  { id: 'm9', code: 'mfg:invoices:create_maker', name: 'Generate Invoice (Maker)', module: 'Orders & Invoices', stakeholderType: 'MANUFACTURER', description: 'Upload delivery notes and raise financing invoice requests' },
  { id: 'm10', code: 'mfg:invoices:approve_checker', name: 'Sign-off Invoice (Checker)', module: 'Orders & Invoices', stakeholderType: 'MANUFACTURER', description: 'Confirm physical goods dispatch and request bank loan drawdown' },

  { id: 'm11', code: 'mfg:payments:read', name: 'View Bank Settlements', module: 'Settlement & Reports', stakeholderType: 'MANUFACTURER', description: 'Track bank disbursements credited to manufacturer bank account' },
  { id: 'm12', code: 'mfg:analytics:view', name: 'View Sales & Financing Stats', module: 'Settlement & Reports', stakeholderType: 'MANUFACTURER', description: 'Analyze top-performing distributors and credit turnover speeds' },
  { id: 'm13', code: 'mfg:reports:export', name: 'Export Reconciliation Reports', module: 'Settlement & Reports', stakeholderType: 'MANUFACTURER', description: 'Export monthly commercial sales and ledger statements' },

  // DISTRIBUTOR
  { id: 'd1', code: 'dist:profile:read', name: 'View Business Profile', module: 'Account & Profile', stakeholderType: 'DISTRIBUTOR', description: 'View assigned bank credit limits, utilized balances, and terms' },
  { id: 'd2', code: 'dist:profile:update', name: 'Update Business Details', module: 'Account & Profile', stakeholderType: 'DISTRIBUTOR', description: 'Submit updated contact information and business permits' },
  { id: 'd3', code: 'dist:users:manage', name: 'Manage Internal Users', module: 'Account & Profile', stakeholderType: 'DISTRIBUTOR', description: 'Provision staff (order placement vs. payment officers)' },

  { id: 'd4', code: 'dist:drawdowns:read', name: 'View Drawdown History', module: 'Credit Drawdowns', stakeholderType: 'DISTRIBUTOR', description: 'View outstanding credit drawdowns and upcoming due dates' },
  { id: 'd5', code: 'dist:drawdowns:create_maker', name: 'Request Financing (Maker)', module: 'Credit Drawdowns', stakeholderType: 'DISTRIBUTOR', description: 'Select approved purchase orders and request loan drawdown' },
  { id: 'd6', code: 'dist:drawdowns:approve_checker', name: 'Authorize Drawdown (Checker)', module: 'Credit Drawdowns', stakeholderType: 'DISTRIBUTOR', description: 'Legally sign off financing terms and submit to bank' },

  { id: 'd7', code: 'dist:repayments:read', name: 'View Repayment Schedules', module: 'Repayments', stakeholderType: 'DISTRIBUTOR', description: 'Inspect daily/weekly amortization schedules and interest fees' },
  { id: 'd8', code: 'dist:repayments:initiate', name: 'Make Repayment', module: 'Repayments', stakeholderType: 'DISTRIBUTOR', description: 'Trigger payments via M-Pesa, EFT/RTGS, or direct bank debit' },

  { id: 'd9', code: 'dist:statements:view', name: 'View Account Statements', module: 'Statements & Ledger', stakeholderType: 'DISTRIBUTOR', description: 'View full statement of account, drawdowns, and settlements' },
  { id: 'd10', code: 'dist:statements:export', name: 'Export Financial Ledger', module: 'Statements & Ledger', stakeholderType: 'DISTRIBUTOR', description: 'Download PDF statements and Excel accounting logs' },
];

export let mockRoles: DynamicRole[] = [
  {
    id: 'r1',
    name: 'Platform Administrator',
    code: 'PLATFORM_ADMIN',
    stakeholderType: 'PLATFORM',
    description: 'Super administrator with full platform control across all tenants',
    isSystem: true,
    permissions: SEED_PERMISSIONS.filter((p) => p.stakeholderType === 'PLATFORM'),
    createdAt: '2026-08-01T00:00:00Z',
  },
];

function mapRoleResponseToDynamicRole(role: RoleResponse): DynamicRole {
  const perms = (role.permissions || []).map((code) => {
    const found = SEED_PERMISSIONS.find((p) => p.code === code);
    return (
      found || {
        id: code,
        code,
        name: code.replace(/_/g, ' '),
        module: 'General',
        stakeholderType: ((role.tenantType as StakeholderType) || 'PLATFORM') as StakeholderType,
        description: code,
      }
    );
  });

  const roleName = role.name || role.roleName || 'Role';
  return {
    id: role.id || `role-${Date.now()}`,
    name: roleName,
    code: (role.code || roleName).toUpperCase().replace(/\s+/g, '_'),
    stakeholderType: ((role.tenantType as StakeholderType) || 'PLATFORM') as StakeholderType,
    description: role.description || '',
    isSystem: false,
    permissions: perms,
    createdAt: role.createdAt || new Date().toISOString(),
  };
}

export const rbacService = {
  async getPermissions(stakeholder?: StakeholderType): Promise<Permission[]> {
    if (USE_MOCKS) {
      return stakeholder
        ? SEED_PERMISSIONS.filter((p) => p.stakeholderType === stakeholder)
        : SEED_PERMISSIONS;
    }

    try {
      const dtos = stakeholder
        ? await roleManagementApi.getPermissionsByTenantType(stakeholder)
        : await roleManagementApi.getAvailablePermissions();

      if (dtos && dtos.length > 0) {
        return dtos.map((dto) => {
          const code = dto.code || dto.id || 'PERM';
          return {
            id: dto.id || code,
            code,
            name: dto.name || dto.description || code.replace(/_/g, ' '),
            module: dto.category || 'Permissions',
            stakeholderType: ((dto.applicableTenantType as StakeholderType) || stakeholder || 'PLATFORM') as StakeholderType,
            description: dto.description || '',
          };
        });
      }
      return stakeholder
        ? SEED_PERMISSIONS.filter((p) => p.stakeholderType === stakeholder)
        : SEED_PERMISSIONS;
    } catch {
      return stakeholder
        ? SEED_PERMISSIONS.filter((p) => p.stakeholderType === stakeholder)
        : SEED_PERMISSIONS;
    }
  },

  async getRoles(stakeholder?: StakeholderType): Promise<DynamicRole[]> {
    if (USE_MOCKS) {
      return stakeholder
        ? mockRoles.filter((r) => r.stakeholderType === stakeholder)
        : mockRoles;
    }

    try {
      const roles = stakeholder === 'PLATFORM'
        ? await roleManagementApi.getAllRolesAcrossAllEntities()
        : await roleManagementApi.getRoles();

      if (roles && roles.length > 0) {
        const mapped = roles.map(mapRoleResponseToDynamicRole);
        return stakeholder ? mapped.filter((r) => r.stakeholderType === stakeholder) : mapped;
      }
      return stakeholder
        ? mockRoles.filter((r) => r.stakeholderType === stakeholder)
        : mockRoles;
    } catch {
      return stakeholder
        ? mockRoles.filter((r) => r.stakeholderType === stakeholder)
        : mockRoles;
    }
  },


  async getRoleById(id: string): Promise<DynamicRole> {
    if (USE_MOCKS) {
      const found = mockRoles.find((r) => r.id === id);
      if (!found) throw new Error('Role not found');
      return found;
    }

    try {
      const role = await roleManagementApi.getRoleById(id);
      return mapRoleResponseToDynamicRole(role);
    } catch {
      const found = mockRoles.find((r) => r.id === id);
      if (!found) throw new Error('Role not found');
      return found;
    }
  },

  async createRole(payload: CreateRolePayload): Promise<DynamicRole> {
    if (USE_MOCKS) {
      const perms = SEED_PERMISSIONS.filter((p) => payload.permissionCodes.includes(p.code));
      const newRole: DynamicRole = {
        id: `role-${Date.now()}`,
        name: payload.name,
        code: payload.code.toUpperCase(),
        stakeholderType: payload.stakeholderType,
        description: payload.description,
        isSystem: false,
        permissions: perms,
        createdAt: new Date().toISOString(),
      };
      mockRoles = [newRole, ...mockRoles];
      return newRole;
    }

    try {
      const res = await roleManagementApi.createRole({
        name: payload.name,
        description: payload.description,
        permissions: payload.permissionCodes as PermissionCode[],
      });
      return mapRoleResponseToDynamicRole(res);
    } catch {
      const perms = SEED_PERMISSIONS.filter((p) => payload.permissionCodes.includes(p.code));
      const newRole: DynamicRole = {
        id: `role-${Date.now()}`,
        name: payload.name,
        code: payload.code.toUpperCase(),
        stakeholderType: payload.stakeholderType,
        description: payload.description,
        isSystem: false,
        permissions: perms,
        createdAt: new Date().toISOString(),
      };
      mockRoles = [newRole, ...mockRoles];
      return newRole;
    }
  },

  async updateRole(id: string, payload: UpdateRolePayload): Promise<DynamicRole> {
    if (USE_MOCKS) {
      const idx = mockRoles.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Role not found');
      const perms = SEED_PERMISSIONS.filter((p) => payload.permissionCodes.includes(p.code));
      mockRoles[idx] = {
        ...mockRoles[idx],
        name: payload.name,
        description: payload.description,
        permissions: perms,
      };
      return mockRoles[idx];
    }

    try {
      const res = await roleManagementApi.updateRole(id, {
        name: payload.name,
        description: payload.description,
        permissions: payload.permissionCodes as PermissionCode[],
      });
      return mapRoleResponseToDynamicRole(res);
    } catch {
      const idx = mockRoles.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Role not found');
      const perms = SEED_PERMISSIONS.filter((p) => payload.permissionCodes.includes(p.code));
      mockRoles[idx] = {
        ...mockRoles[idx],
        name: payload.name,
        description: payload.description,
        permissions: perms,
      };
      return mockRoles[idx];
    }
  },

  async deleteRole(id: string): Promise<void> {
    if (USE_MOCKS) {
      mockRoles = mockRoles.filter((r) => r.id !== id);
      return;
    }

    try {
      await roleManagementApi.deleteRole(id);
    } catch {
      mockRoles = mockRoles.filter((r) => r.id !== id);
    }
  },
};