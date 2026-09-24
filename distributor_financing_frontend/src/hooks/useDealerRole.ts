'use client';

import { usePermissions } from '@/hooks/usePermissions';

export type DealerRole = 'DEALER_MAKER' | 'DEALER_CHECKER';

/**
 * Adapter hook over centralized `usePermissions()`.
 * Consumes authoritative backend permissions and dynamic AppRole.
 */
export function useDealerRole() {
  const permissions = usePermissions();

  const isChecker = permissions.canApproveDistributorLoan;
  const isMaker = permissions.canApplyFinancing;
  const currentRole: DealerRole = isChecker && !isMaker ? 'DEALER_CHECKER' : 'DEALER_MAKER';

  const switchRole = (newRole: DealerRole) => {
    // Development / QA Simulation ONLY
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dfp_user');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          if (newRole === 'DEALER_CHECKER') {
            user.roleName = 'Distributor Checker';
            user.appRole = 'Distributor Checker';
            user.permissions = ['APPROVE_DISTRIBUTOR_LOAN', 'VIEW_MY_LOANS'];
          } else {
            user.roleName = 'Distributor Maker';
            user.appRole = 'Distributor Maker';
            user.permissions = ['APPLY_FINANCING', 'VIEW_MY_LOANS', 'CANCEL_LOAN_REQUEST'];
          }
          localStorage.setItem('dfp_user', JSON.stringify(user));
        } catch {}
      }
      localStorage.setItem('dfp_dealer_role', newRole);
      window.location.reload();
    }
  };

  return {
    role: currentRole,
    roleName: permissions.roleName,
    isMaker,
    isChecker,
    canApplyFinancing: permissions.canApplyFinancing,
    canApproveDistributorLoan: permissions.canApproveDistributorLoan,
    canCancelLoan: permissions.canCancelLoan,
    canViewLoans: permissions.canViewLoans,
    hasPermission: permissions.hasPermission,
    switchRole,
    user: permissions.user,
  };
}
