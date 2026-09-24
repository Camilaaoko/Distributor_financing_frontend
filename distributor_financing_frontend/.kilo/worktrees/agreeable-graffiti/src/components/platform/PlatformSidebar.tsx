'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, CircleHelp, Package, Settings } from 'lucide-react';
import { NAV_BY_ROLE } from '@/config/nav';
import { useAuth } from '@/hooks/useAuth';
import styles from './PlatformSidebar.module.css';

export function PlatformSidebar({ collapsed, onNavigate }: { collapsed: boolean; onNavigate: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const items = [...NAV_BY_ROLE.platform];
  items.splice(items.findIndex(item => item.href === '/platform/reports'), 0, { label: 'Financing Products', href: '/platform/financing-products', icon: Package });
  const systemItems = [
    { label: 'Settings', href: '/platform/profile', icon: Settings },
    { label: 'Help & Support', href: '/support', icon: CircleHelp },
  ];
  const name = user?.username || 'Platform Admin';
  return <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`} aria-label="Platform sidebar">
    <nav aria-label="Platform navigation" className={styles.navigation}>
      {items.map(item => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return <Link key={item.href} href={item.href!} onClick={onNavigate} aria-label={item.label} aria-current={active ? 'page' : undefined} title={collapsed ? item.label : undefined} className={styles.link}><Icon size={22} /><span>{item.label}</span></Link>;
      })}
      <div className={styles.system}>
        <p>SYSTEM</p>
        {systemItems.map(item => <Link key={item.href} href={item.href} onClick={onNavigate} className={styles.link} aria-label={item.label} aria-current={pathname === item.href ? 'page' : undefined} title={collapsed ? item.label : undefined}><item.icon size={22} /><span>{item.label}</span></Link>)}
      </div>
    </nav>
    <div className={styles.footer}><Link href="/platform/profile" onClick={onNavigate} aria-label={`Open profile for ${name}`} title={collapsed ? name : undefined}><span className={styles.avatar}>{name.charAt(0).toUpperCase()}{user && <i aria-label="Signed in" />}</span><span className={styles.identity}><strong>{name}</strong><small>Administrator</small></span><ChevronRight size={19} className={styles.profileArrow} /></Link></div>
  </aside>;
}
