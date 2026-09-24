'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <RouteGuard>
        <div className="min-h-screen flex bg-[#F7F9FC]">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar - fixed on all screens, visible by default on desktop */}
          <div
            className={`fixed z-50 transition-transform duration-300 ease-in-out h-full ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>

          {/* Main content area */}
          <div className="flex-1 min-w-0 flex flex-col min-h-screen lg:ml-64">
            {/* Mobile header bar */}
            <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[#E2E8F0] bg-white">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-[#E2E8F0] text-[#1E293B] hover:bg-[#F7F9FC] transition-colors"
                aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <span className="font-semibold text-[#1E293B] text-sm">EMTech House</span>
            </div>

            <div className="flex-1 min-h-0">{children}</div>
          </div>
        </div>
      </RouteGuard>
    </ToastProvider>
  );
}