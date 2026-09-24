'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, ChevronDown, LogOut, ChevronLeft, ChevronRight, Search, Settings, User, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { platformService } from '@/services/platform.service';
import { manufacturerApi, distributorApi } from '@/services/onboarding-api.service';
import { notificationsService } from '@/services/notifications.service';
import type { InAppNotificationResponse } from '@/types/notifications';
import {
  roleFromPathname,
  ROLE_HOMES,
  ROLE_SETTINGS_ROUTES,
  ROLE_PROFILE_ROUTES,
  ROLE_NOTIFICATIONS_ROUTES,
  ROLE_USER_LABEL,
  formatRoleTitle,
} from '@/config/nav';
import styles from './DashboardHeader.module.css';

type SearchItem = { id: string; label: string; detail: string; href: string };

export function DashboardHeader({
  onToggle,
  expanded,
  collapsed = false,
}: {
  onToggle: () => void;
  expanded: boolean;
  collapsed?: boolean;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const role = roleFromPathname(pathname);
  const homeHref = ROLE_HOMES[role] || '/platform';
  const settingsHref = ROLE_SETTINGS_ROUTES[role] || '/platform/profile';
  const profileHref = ROLE_PROFILE_ROUTES[role] || '/platform/profile';
  const notificationsHref = ROLE_NOTIFICATIONS_ROUTES[role] || '/platform/notifications';
  const roleMeta = ROLE_USER_LABEL[role] || ROLE_USER_LABEL.platform;

  const [panel, setPanel] = useState<'search' | 'notifications' | 'account' | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [searchState, setSearchState] = useState('');
  const [notifications, setNotifications] = useState<InAppNotificationResponse[]>([]);
  const [notificationState, setNotificationState] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [marking, setMarking] = useState<string | null>(null);
  const header = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const accountButton = useRef<HTMLButtonElement>(null);
  const notificationButton = useRef<HTMLButtonElement>(null);

  const displayName = user?.username || roleMeta.name;
  const displayRoleTitle = formatRoleTitle(user?.role, roleMeta.roleTitle);

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setPanel(null);
    };
    const keyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.key === '/' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        event.preventDefault();
        input.current?.focus();
        setPanel('search');
      }
      if (event.key === 'Escape') {
        setPanel(null);
        if (panel === 'account') accountButton.current?.focus();
        if (panel === 'notifications') notificationButton.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', keyboard);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', keyboard);
    };
  }, [panel]);

  useEffect(() => {
    if (!query.trim() || !user) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const data = await Promise.allSettled([
        platformService.listBanks(),
        platformService.listBankAdmins(),
        manufacturerApi.getManufacturers(),
        distributorApi.getDistributors(),
      ]);
      if (cancelled) return;
      const [banks, admins, manufacturers, distributors] = data;

      // Determine appropriate directory links based on current role
      const bankHref = role === 'bank' ? '/bank' : role === 'dealer' ? '/dealer/banks' : role === 'manufacturer' ? '/manufacturer/banks' : '/platform/banks';
      const mfgHref = role === 'bank' ? '/bank/manufacturers' : role === 'dealer' ? '/dealer/manufacturers' : role === 'manufacturer' ? '/manufacturer' : '/platform/manufacturers';
      const distHref = role === 'bank' ? '/bank/distributors' : role === 'dealer' ? '/dealer' : role === 'manufacturer' ? '/manufacturer/distributors' : '/platform/distributors';
      const userHref = role === 'bank' ? '/bank/users' : role === 'dealer' ? '/dealer/users' : role === 'manufacturer' ? '/manufacturer/users' : '/platform/users';

      const items: SearchItem[] = [
        ...(banks.status === 'fulfilled'
          ? banks.value.items.map((bank) => ({
              id: `bank-${bank.id}`,
              label: bank.name || 'Bank',
              detail: `Bank · ${bank.branch || 'Head Office'}`,
              href: bankHref,
            }))
          : []),
        ...(admins.status === 'fulfilled'
          ? admins.value.items.map((admin) => ({
              id: `admin-${admin.id}`,
              label: `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || 'Admin User',
              detail: `User · ${admin.email || ''}`,
              href: userHref,
            }))
          : []),
        ...(manufacturers.status === 'fulfilled'
          ? manufacturers.value.map((item) => ({
              id: `manufacturer-${item.id}`,
              label: item.name || 'Manufacturer',
              detail: 'Manufacturer · Anchor Partner',
              href: mfgHref,
            }))
          : []),
        ...(distributors.status === 'fulfilled'
          ? distributors.value.map((item) => ({
              id: `distributor-${item.id}`,
              label: item.businessName || 'Distributor',
              detail: 'Distributor · Commercial Partner',
              href: distHref,
            }))
          : []),
      ];
      const needle = query.trim().toLowerCase();
      setResults(items.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(needle)).slice(0, 12));
      setSearchState(data.some((result) => result.status === 'rejected') ? 'Some directories could not be loaded.' : '');
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, user, role]);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    const load = async () => {
      try {
        const items = await notificationsService.list(user.email);
        if (!cancelled) {
          setNotifications(items);
          setNotificationState('');
        }
      } catch {
        if (!cancelled) setNotificationState('Notifications are unavailable. Please retry.');
      }
    };
    void load();
    const timer = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [user?.email, refresh]);

  const unread = notifications.filter((item) => !item.read).length;
  const close = () => setPanel(null);

  return (
    <header ref={header} className={styles.header}>
      <Link
        href={homeHref}
        className={`${styles.brand} ${collapsed ? styles.compactBrand : ''}`}
        aria-label="Distributor Financing home"
      >
        <Image src="/images/emtech_color_logo.png" alt="E&M Tech" width={90} height={42} priority />
        <span>
          DISTRIBUTOR
          <br />
          FINANCING
        </span>
      </Link>
      <button
        className={`${styles.icon} ${styles.sidebarToggle}`}
        onClick={onToggle}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-expanded={expanded}
        aria-controls="dashboard-sidebar"
      >
        {expanded ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
      </button>

      <div className={styles.searchBox}>
        <Search size={23} />
        <input
          ref={input}
          value={query}
          aria-label="Search banks, administrators, manufacturers and distributors"
          aria-controls="dashboard-search-results"
          placeholder="Search anything (banks, users, distributors...)"
          onFocus={() => setPanel('search')}
          onChange={(event) => {
            setQuery(event.target.value);
            setResults([]);
            setSearchState(event.target.value.trim() ? 'Searching…' : '');
            setPanel('search');
          }}
        />
        {query ? (
          <button
            aria-label="Clear search"
            onClick={() => {
              setQuery('');
              setResults([]);
              setSearchState('');
              input.current?.focus();
            }}
          >
            <X size={17} />
          </button>
        ) : (
          <kbd>/</kbd>
        )}
        {panel === 'search' && (
          <div id="dashboard-search-results" className={styles.searchResults}>
            {!query.trim() ? (
              <p>Search banks, administrators, manufacturers and distributors across the portal.</p>
            ) : (
              <>
                <p role="status">
                  {!user ? 'Sign in to search the platform.' : searchState || `${results.length} matching results`}
                </p>
                {results.map((item) => (
                  <Link key={item.id} href={item.href} onClick={close}>
                    <strong>{item.label}</strong>
                    <small>{item.detail} · Open directory</small>
                  </Link>
                ))}
                {user && !results.length && !searchState && <p>No matches found. Try another search term.</p>}
              </>
            )}
          </div>
        )}
      </div>

      <div className={styles.tools}>
        <div className={styles.relative}>
          <button
            ref={notificationButton}
            className={styles.icon}
            aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
            aria-expanded={panel === 'notifications'}
            aria-controls="dashboard-header-notifications"
            onClick={() => {
              setPanel(panel === 'notifications' ? null : 'notifications');
              setNotificationState(user?.email ? 'Loading notifications…' : '');
              setRefresh((value) => value + 1);
            }}
          >
            <Bell size={25} />
            {unread > 0 && <span className={styles.badge}>{unread > 99 ? '99+' : unread}</span>}
          </button>
          {panel === 'notifications' && (
            <div id="dashboard-header-notifications" className={styles.popover}>
              <h2>Notifications</h2>
              {notificationState && (
                <p role="status">
                  {notificationState}{' '}
                  {notificationState.includes('unavailable') && (
                    <button onClick={() => setRefresh((value) => value + 1)}>Retry</button>
                  )}
                </p>
              )}
              {!user?.email && <p>Sign in to view your notifications.</p>}
              {user?.email && !notificationState && !notifications.length && <p>You have no notifications.</p>}
              {[...notifications]
                .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
                .slice(0, 5)
                .map((item) => (
                  <div key={item.id} className={styles.notification}>
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                    {!item.read && (
                      <button
                        disabled={marking === item.id}
                        onClick={async () => {
                          setMarking(item.id);
                          try {
                            await notificationsService.markRead(item.id);
                            setNotifications((items) =>
                              items.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry))
                            );
                          } catch {
                            setNotificationState('Unable to mark notification as read. Please retry.');
                          } finally {
                            setMarking(null);
                          }
                        }}
                      >
                        {marking === item.id ? 'Saving…' : 'Mark as read'}
                      </button>
                    )}
                  </div>
                ))}
              <Link href={notificationsHref} onClick={close}>
                View all notifications
              </Link>
            </div>
          )}
        </div>

        <Link className={styles.icon} href={settingsHref} aria-label="Account settings">
          <Settings size={25} />
        </Link>

        <div className={`${styles.relative} ${styles.account}`}>
          <button
            ref={accountButton}
            className={styles.accountButton}
            aria-expanded={panel === 'account'}
            aria-controls="dashboard-account-menu"
            onClick={() => setPanel(panel === 'account' ? null : 'account')}
          >
            <span className={styles.avatar}>{displayName[0].toUpperCase()}</span>
            <span className={styles.identity}>
              <strong>{displayName}</strong>
              <small>{displayRoleTitle}</small>
            </span>
            <ChevronDown size={16} />
          </button>
          {panel === 'account' && (
            <div id="dashboard-account-menu" className={styles.popover}>
              <p>{user?.email || `${displayName} (${displayRoleTitle})`}</p>
              <Link href={profileHref} onClick={close}>
                <User size={17} /> My profile
              </Link>
              <Link href={settingsHref} onClick={close}>
                <Settings size={17} /> Account settings
              </Link>
              <button
                onClick={() => {
                  close();
                  logout();
                  router.replace('/login');
                }}
              >
                <LogOut size={17} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
