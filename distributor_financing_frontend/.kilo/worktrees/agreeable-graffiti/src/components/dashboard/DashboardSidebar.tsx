'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, CircleHelp, Settings } from 'lucide-react';
import {
  NAV_BY_ROLE,
  roleFromPathname,
  ROLE_SETTINGS_ROUTES,
  ROLE_PROFILE_ROUTES,
  ROLE_USER_LABEL,
  formatRoleTitle,
} from '@/config/nav';
import { useAuth } from '@/hooks/useAuth';
import styles from './DashboardSidebar.module.css';

export function DashboardSidebar({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = roleFromPathname(pathname);
  const items = NAV_BY_ROLE[role] || NAV_BY_ROLE.platform;
  const roleMeta = ROLE_USER_LABEL[role] || ROLE_USER_LABEL.platform;
  const settingsHref = ROLE_SETTINGS_ROUTES[role] || '/platform/profile';
  const profileHref = ROLE_PROFILE_ROUTES[role] || '/platform/profile';

  const systemItems = [
    { label: 'Settings', href: settingsHref, icon: Settings },
    { label: 'Help & Support', href: '/support', icon: CircleHelp },
  ];

  const name = user?.username || roleMeta.name;
  const roleTitle = formatRoleTitle(user?.role, roleMeta.roleTitle);

  // Permission & Role-Based Navigation Filtering
  const userRole = (user?.role || '').toUpperCase().trim();
  const isAdmin =
    userRole === 'PLATFORM_ADMIN' ||
    userRole === 'BANK_ADMIN' ||
    userRole === 'MANUFACTURER_ADMIN' ||
    userRole === 'DISTRIBUTOR_ADMIN';
  const permissions: string[] = user?.permissions || [];

  const visibleItems = items.filter((item) => {
    if (item.adminOnly && !isAdmin) {
      if (item.requiredPermission && permissions.includes(item.requiredPermission)) {
        return true;
      }
      return false;
    }
    return true;
  });

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
      aria-label="Dashboard sidebar"
    >
      <nav aria-label="Main navigation" className={styles.navigation}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isExact = pathname === item.href;
          const isSub =
            Boolean(item.href) &&
            item.href !== '/' &&
            item.href !== '/bank' &&
            item.href !== '/platform' &&
            item.href !== '/manufacturer' &&
            item.href !== '/dealer' &&
            pathname.startsWith(item.href + '/');
          const active = isExact || isSub;

          return (
            <Link
              key={item.href || item.label}
              href={item.href || '#'}
              onClick={onNavigate}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
              className={styles.link}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className={styles.system}>
          <p>SYSTEM</p>
          {systemItems.map((item) => {
            const SystemIcon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={styles.link}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
              >
                <SystemIcon size={22} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className={styles.footer}>
        <Link
          href={profileHref}
          onClick={onNavigate}
          aria-label={`Open profile for ${name}`}
          title={collapsed ? `${name} (${roleTitle})` : undefined}
        >
          <span className={styles.avatar}>
            {name.charAt(0).toUpperCase()}
            {user && <i aria-label="Signed in" />}
          </span>
          <span className={styles.identity}>
            <strong>{name}</strong>
            <small>{roleTitle}</small>
          </span>
          <ChevronRight size={19} className={styles.profileArrow} />
        </Link>
      </div>
    </aside>
  );
}

