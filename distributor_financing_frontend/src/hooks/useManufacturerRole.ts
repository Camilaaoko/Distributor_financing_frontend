'use client';

import { usePermissions } from '@/hooks/usePermissions';

export type ManufacturerRole = 'MANUFACTURER_MAKER' | 'MANUFACTURER_CHECKER';

/**
 * Adapter hook over centralized `usePermissions()` for manufacturer users.
 */
export function useManufacturerRole() {
  const permissions = usePermissions();

  const isMaker = permissions.hasPermission('CREATE_PURCHASE_ORDER') || permissions.hasPermission('VIEW_PORTFOLIO');
  const isChecker = permissions.hasPermission('CONFIRM_PURCHASE_ORDER') || permissions.hasPermission('APPROVE_MANUFACTURER_ORDER');
  const currentRole: ManufacturerRole = isChecker && !isMaker ? 'MANUFACTURER_CHECKER' : 'MANUFACTURER_MAKER';

  const switchRole = (newRole: ManufacturerRole) => {
    // Development / QA Simulation ONLY
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dfp_user');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          if (newRole === 'MANUFACTURER_CHECKER') {
            user.roleName = 'Manufacturer Checker';
            user.appRole = 'Manufacturer Checker';
            user.permissions = ['CONFIRM_PURCHASE_ORDER', 'VIEW_PORTFOLIO', 'VIEW_DISTRIBUTORS'];
          } else {
            user.roleName = 'Manufacturer Maker';
            user.appRole = 'Manufacturer Maker';
            user.permissions = ['CREATE_PURCHASE_ORDER', 'VIEW_PORTFOLIO', 'VIEW_DISTRIBUTORS'];
          }
          localStorage.setItem('dfp_user', JSON.stringify(user));
        } catch {}
      }
      localStorage.setItem('dfp_manufacturer_role', newRole);
      window.location.reload();
    }
  };

  return {
    role: currentRole,
    roleName: permissions.roleName,
    isMaker,
    isChecker,
    switchRole,
    user: permissions.user,
  };
}