'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LogOut } from 'lucide-react';
import { NAV_BY_ROLE, roleFromPathname, type NavItem } from '@/config/nav';
import { useAuth } from '@/hooks/useAuth';
import styles from './Sidebar.module.css';

function groupIsActive(item: NavItem, pathname: string): boolean {
  if (item.href) return pathname === item.href;
  return item.children?.some((child) => pathname === child.href) ?? false;
}

export function Sidebar({ onNavigate, hideBrand = false }: { onNavigate?: () => void; hideBrand?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const role = roleFromPathname(pathname);
  const isPlatformDashboard = pathname === '/platform';
  const items = NAV_BY_ROLE[role];
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const displayName =
    authUser?.username ||
    (authUser?.role ? authUser.role.replace(/_/g, ' ') : '') ||
    (role === 'bank' ? 'Bank Admin' : role === 'manufacturer' ? 'Manufacturer Admin' : role === 'dealer' ? 'Distributor Admin' : 'Platform Admin');

  const displayEmail = authUser?.email || '';
  const avatarLetter = (displayName || displayEmail || 'U').charAt(0).toUpperCase();

  return (
    <aside className={`${role === 'platform' ? styles.platform : ''} w-64 shrink-0 sidebar-bg text-white flex flex-col h-full ${hideBrand ? 'min-h-0' : 'min-h-screen'} border-r border-[#1A3F8A]`}>
      {/* Brand */}
      <div className={`${hideBrand ? 'hidden' : 'flex'} items-center gap-2.5 px-5 bg-white border-b border-slate-200 shadow-xs ${isPlatformDashboard ? 'h-[74px]' : 'py-3.5'}`}>
        <Image
          src="/images/emtech_color_logo.png"
          alt="E&M Tech"
          width={120}
          height={40}
          className="h-9 w-auto object-contain shrink-0"
          priority
        />
        <div className="border-l border-slate-200 pl-2.5">
          <span className={`${isPlatformDashboard ? 'text-sm' : 'text-[10px]'} text-[#1F4DA8] font-bold tracking-tight uppercase block leading-tight`}>
            Distributor<br />Financing
          </span>
        </div>
      </div>



      {/* Nav */}
      <nav aria-label="Main navigation" className={`min-h-0 flex-1 px-3 overflow-y-auto py-4 ${isPlatformDashboard ? 'space-y-2' : 'space-y-1'}`}>
        {items.map((item) => {
          const Icon = item.icon;

          if (item.children) {
            const active = groupIsActive(item, pathname);
            const isOpen = openGroups[item.label] ?? active;

            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => setOpenGroups((prev) => ({ ...prev, [item.label]: !isOpen }))}
                  aria-expanded={isOpen}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'text-white sidebar-active'
                      : 'text-white/70 hover:text-white hover:bg-[#2A5CC0]'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="mt-1 ml-4 pl-3.5 border-l border-white/20 space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href ?? '#'}
                          onClick={onNavigate}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            childActive
                              ? 'sidebar-active text-white shadow-md shadow-[#F58220]/30'
                              : 'text-white/70 hover:text-white hover:bg-[#2A5CC0]'
                          }`}
                        >
                          <ChildIcon size={16} className="shrink-0" />
                          <span className="flex-1">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href ?? '#'}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 ${isPlatformDashboard ? 'py-3.5' : 'py-2.5'} rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'sidebar-active text-white shadow-md shadow-[#F58220]/30'
                  : 'text-white/70 hover:text-white hover:bg-[#2A5CC0]'
              }`}
            >
              <Icon size={isPlatformDashboard ? 23 : 18} className="shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="text-[11px] font-bold bg-[#F58220] text-white rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className={`${role === 'platform' ? styles.footer : ''} shrink-0 p-4 border-t border-[#1A3F8A]`}>
        <div className="flex items-center gap-3 rounded-xl bg-[#1A3F8A]/60 px-3 py-2.5">
          <div className="h-9 w-9 rounded-full bg-[#F58220] text-white font-bold flex items-center justify-center text-sm shrink-0">
            {avatarLetter}
          </div>
          <div className="text-xs min-w-0 flex-1">
            <div className="font-semibold text-white truncate capitalize" title={displayName}>
              {displayName}
            </div>
            {displayEmail ? (
              <div className="text-white/60 truncate text-[11px] font-medium" title={displayEmail}>
                {displayEmail}
              </div>
            ) : null}
          </div>
          <button
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
            className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
