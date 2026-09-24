import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/types';

export function usePermissions() {
  const { user } = useAuth();

  const role = user?.role ?? null;
  const permissions: string[] = Array.isArray(user?.permissions) ? user.permissions : [];

  const hasRole = (...roles: UserRole[]) => !!user && roles.includes(user.role);

  const hasPermission = (code: string) => {
    if (!user) return false;
    if (user.role === 'PLATFORM_ADMIN') return true;
    return permissions.includes(code);
  };

  const hasAnyPermission = (...codes: string[]) => {
    if (!user) return false;
    if (user.role === 'PLATFORM_ADMIN') return true;
    return codes.some((c) => permissions.includes(c));
  };

  const hasAllPermissions = (...codes: string[]) => {
    if (!user) return false;
    if (user.role === 'PLATFORM_ADMIN') return true;
    return codes.every((c) => permissions.includes(c));
  };

  return {
    user,
    role,
    permissions,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isBank: role ? role.startsWith('BANK_') : false,
    isManufacturer: role ? role.startsWith('MANUFACTURER_') : false,
    isDistributor: role ? role.startsWith('DISTRIBUTOR_') || role.startsWith('DEALER_') : false,
    isDealer: role ? role.startsWith('DISTRIBUTOR_') || role.startsWith('DEALER_') : false, // backward compatibility
    isPlatformAdmin: role === 'PLATFORM_ADMIN',
  };
}

export default usePermissions;
