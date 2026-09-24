'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import {
  initSessionTracking,
  cleanupSessionTracking,
  isSessionExpired,
  subscribeSessionEvent,
} from '@/lib/session';

const TOKEN_STORAGE_KEY = 'dfp_token';

export function SessionTimeoutProvider({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  const warnedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      cleanupSessionTracking();
      return;
    }

    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token || isSessionExpired(token)) {
      cleanupSessionTracking();
      logout();
      router.push('/login');
      return;
    }

    initSessionTracking();

    const unsubExpiring = subscribeSessionEvent('tokenExpiring', () => {
      if (warnedRef.current) return;
      warnedRef.current = true;
      toast.info(
        'Your session is about to expire. Please save your work — you will be signed out soon.',
      );
    });

    const handleAutoLogout = (message: string) => {
      cleanupSessionTracking();
      warnedRef.current = false;
      toast.error(message);
      logout();
      if (!pathname.startsWith('/login') && !pathname.startsWith('/forgot-password')) {
        router.push('/login');
      }
    };

    const unsubExpired = subscribeSessionEvent('tokenExpired', () => {
      handleAutoLogout('Your session has expired. You have been signed out.');
    });

    const unsubTimedOut = subscribeSessionEvent('sessionTimedOut', () => {
      handleAutoLogout('You have been signed out due to inactivity.');
    });

    const pollInterval = setInterval(() => {
      const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!currentToken || isSessionExpired(currentToken)) {
        handleAutoLogout('Your session has expired. You have been signed out.');
      }
    }, 30_000);

    return () => {
      clearInterval(pollInterval);
      unsubExpiring();
      unsubExpired();
      unsubTimedOut();
      cleanupSessionTracking();
      warnedRef.current = false;
    };
  }, [user, router, pathname, logout, toast]);

  return <>{children}</>;
}
