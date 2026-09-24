'use client';

import { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';

interface CanProps {
  do?: string | string[];
  any?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ do: permission, any: anyPermissions, children, fallback = null }: CanProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  if (anyPermissions && anyPermissions.length > 0) {
    return hasAnyPermission(anyPermissions) ? <>{children}</> : <>{fallback}</>;
  }

  if (permission) {
    const isAllowed = Array.isArray(permission)
      ? hasAllPermissions(permission)
      : hasPermission(permission);
    return isAllowed ? <>{children}</> : <>{fallback}</>;
  }

  return <>{children}</>;
}