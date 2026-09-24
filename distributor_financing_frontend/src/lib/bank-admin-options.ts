import type { BankAdminStatus, PlatformRoleName } from '@/lib/types';

/** The only roles the bank-admin backend API accepts. */
export const BANK_ADMIN_ROLES: PlatformRoleName[] = ['Bank Admin', 'Support Admin', 'Read Only Admin'];

/** The only statuses the bank-admin backend API accepts. */
export const BANK_ADMIN_STATUSES: BankAdminStatus[] = ['Active', 'Pending', 'Inactive', 'Locked'];
