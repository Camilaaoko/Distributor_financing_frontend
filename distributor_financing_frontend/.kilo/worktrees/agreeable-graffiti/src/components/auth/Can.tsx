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
  const { hasPermission, hasAnyPermission } = usePermission();

  if (anyPermissions && anyPermissions.length > 0) {
    return hasAnyPermission(anyPermissions) ? <>{children}</> : <>{fallback}</>;
  }

  if (permission) {
    return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
  }

  return <>{children}</>;
}