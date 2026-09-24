'use client';

import { useAuth } from '@/hooks/useAuth';

export function usePermission() {
  const { user } = useAuth();
  const permissions: string[] = user?.permissions ?? [];
  const isSuperAdmin = user?.role === 'PLATFORM_ADMIN';

  const hasPermission = (permission: string | string[]): boolean => {
    if (isSuperAdmin) return true;
    if (!permission) return true;
    if (Array.isArray(permission)) {
      return permission.every((p) => permissions.includes(p));
    }
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permList: string[]): boolean => {
    if (isSuperAdmin) return true;
    if (!permList || permList.length === 0) return true;
    return permList.some((p) => permissions.includes(p));
  };

  return {
    hasPermission,
    hasAnyPermission,
    permissions,
    isSuperAdmin,
  };
}