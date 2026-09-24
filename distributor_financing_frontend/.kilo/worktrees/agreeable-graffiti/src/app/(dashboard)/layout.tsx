'use client';

import { useEffect, useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ToastProvider } from '@/components/ui/Toast';
import styles from './layout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const collapsed = isDesktop && desktopCollapsed;
  const expanded = isDesktop ? !desktopCollapsed : sidebarOpen;

  return (
    <ToastProvider>
      <div className={styles.shell} data-collapsed={collapsed}>
        <DashboardHeader
          collapsed={collapsed}
          expanded={expanded}
          onToggle={() =>
            isDesktop
              ? setDesktopCollapsed((value) => !value)
              : setSidebarOpen((value) => !value)
          }
        />
        <div className={styles.body}>
          {sidebarOpen && (
            <button
              aria-label="Close sidebar"
              className={styles.backdrop}
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div
            id="dashboard-sidebar"
            inert={!isDesktop && !sidebarOpen}
            className={styles.sidebar}
            data-open={sidebarOpen}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setSidebarOpen(false);
            }}
          >
            <DashboardSidebar
              collapsed={collapsed}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
          <main className={styles.main}>
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
