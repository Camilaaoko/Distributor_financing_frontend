'use client';

import { usePermissions } from '@/hooks/usePermissions';

/**
 * Backward compatibility re-export of usePermissions.
 */
export function usePermission() {
  const permissions = usePermissions();

  return {
    hasPermission: permissions.hasPermission,
    hasAnyPermission: permissions.hasAnyPermission,
    hasAllPermissions: permissions.hasAllPermissions,
    permissions: permissions.permissions,
    isSuperAdmin: permissions.isPlatformAdmin,
  };
}

export default usePermission;