'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Calendar, ChevronDown, Building2, Settings, User, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { roleFromPathname, ROLE_USER_LABEL } from '@/config/nav';
import { NotificationBell } from '@/components/dashboard/NotificationBell';


interface TopbarProps {
  title: string;
  welcomeName: string;
  tenantName: string;
  notificationCount?: number;
  avatarLetter?: string;
  dateRangeLabel?: string;
}

const NOTIFICATION_ROUTES: Record<string, string> = {
  manufacturer: '/manufacturer/notifications',
  bank: '/bank/notifications',
  platform: '/platform/notifications',
  dealer: '/dealer/notifications',
};

const SETTINGS_ROUTES: Record<string, string> = {
  manufacturer: '/manufacturer/settings',
  bank: '/bank/settings',
  platform: '/platform/profile',
  dealer: '/dealer/settings',
};

const PROFILE_ROUTES: Record<string, string> = {
  manufacturer: '/manufacturer/settings',
  bank: '/bank/settings',
  platform: '/platform/profile',
  dealer: '/dealer/profile',
};

export function Topbar({
  title,
  welcomeName,
  tenantName,
  notificationCount = 0,
  avatarLetter = 'M',
  dateRangeLabel = '30 Jul 2026 - 30 Jul 2026',
}: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: authUser, logout } = useAuth();
  const role = roleFromPathname(pathname);
  const userInfo = ROLE_USER_LABEL[role];

  const userDisplayName = authUser?.username || welcomeName;
  const userDisplayEmail = authUser?.email || '';
  const userAvatarLetter = (authUser?.username ? authUser.username.charAt(0) : (authUser?.email ? authUser.email.charAt(0) : avatarLetter)).toUpperCase();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setDateMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setAccountMenuOpen(false);
    logout();
    router.push('/login');
  };

  const handleNotificationsClick = () => {
    const route = NOTIFICATION_ROUTES[role];
    if (route) router.push(route);
  };

  const handleSettingsRoute = () => {
    const route = SETTINGS_ROUTES[role];
    if (route) router.push(route);
  };

  const handleProfileRoute = () => {
    const route = PROFILE_ROUTES[role];
    if (route) router.push(route);
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 lg:px-8 py-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1E293B] tracking-tight">{title}</h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          Welcome back, {userDisplayName}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Date Picker */}
        <div ref={dateRef} className="relative">
          <button
            onClick={() => setDateMenuOpen(!dateMenuOpen)}
            className="flex items-center gap-2 text-sm font-medium text-[#64748B] bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 shadow-sm hover:bg-[#F7F9FC] transition-colors"
          >
            <Calendar size={16} />
            {dateRangeLabel}
          </button>
          {dateMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-4 z-50">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Date Range</p>
              <div className="space-y-2">
                <button
                  onClick={() => { setDateMenuOpen(false); }}
                  className="w-full text-left text-sm font-medium text-[#1E293B] hover:bg-[#F7F9FC] rounded-lg px-3 py-2 transition-colors"
                >
                  Custom Range
                </button>
                <button
                  onClick={() => { setDateMenuOpen(false); }}
                  className="w-full text-left text-sm font-medium text-[#1E293B] hover:bg-[#F7F9FC] rounded-lg px-3 py-2 transition-colors"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => { setDateMenuOpen(false); }}
                  className="w-full text-left text-sm font-medium text-[#1E293B] hover:bg-[#F7F9FC] rounded-lg px-3 py-2 transition-colors"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => { setDateMenuOpen(false); }}
                  className="w-full text-left text-sm font-medium text-[#1E293B] hover:bg-[#F7F9FC] rounded-lg px-3 py-2 transition-colors"
                >
                  This Year
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Notifications Bell with In-App & Email indicators (Hidden for Platform Admin) */}
        {role !== 'platform' && <NotificationBell />}



        {/* Account Dropdown */}
        <div ref={accountRef} className="relative">
          <button
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl pl-1.5 pr-3 py-1.5 shadow-sm hover:bg-[#F7F9FC] transition-colors cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-[#1F4DA8] text-white font-bold flex items-center justify-center text-xs">
              {userAvatarLetter}
            </div>
            <span className="text-sm font-semibold text-[#1E293B] max-w-[140px] truncate">{tenantName}</span>
            <ChevronDown size={16} className={`text-[#64748B] transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {accountMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-[#E2E8F0] shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E2E8F0]">
                <p className="text-sm font-semibold text-[#1E293B] truncate">{tenantName}</p>
                {userDisplayEmail && <p className="text-xs text-[#64748B] truncate">{userDisplayEmail}</p>}
              </div>
              <div className="py-1">
                {role === 'manufacturer' && (
                  <button
                    onClick={() => { setAccountMenuOpen(false); router.push('/manufacturer/settings'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1E293B] hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                  >
                    <Building2 size={16} className="text-[#64748B]" />
                    Company Information
                  </button>
                )}
                {role !== 'platform' && (
                  <button
                    onClick={() => { setAccountMenuOpen(false); handleSettingsRoute(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1E293B] hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                  >
                    <Settings size={16} className="text-[#64748B]" />
                    Settings
                  </button>
                )}
                <button
                  onClick={() => { setAccountMenuOpen(false); handleProfileRoute(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1E293B] hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                >
                  <User size={16} className="text-[#64748B]" />
                  Profile
                </button>
                {role !== 'platform' && (
                  <button
                    onClick={() => { setAccountMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1E293B] hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                  >
                    <HelpCircle size={16} className="text-[#64748B]" />
                    Help
                  </button>
                )}
              </div>

              <div className="border-t border-[#E2E8F0] py-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#DC2626] hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}