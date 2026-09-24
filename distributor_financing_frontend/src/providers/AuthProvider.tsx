'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { AUTH_TOKEN_COOKIE } from '@/lib/constants';
import { authService } from '@/services/auth.service';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('dfp_user') : null;
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore malformed cache
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((nextUser: User, token: string) => {
    setUser(nextUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dfp_token', token);
      localStorage.setItem('dfp_user', JSON.stringify(nextUser));
      document.cookie = `${AUTH_TOKEN_COOKIE}=${token}; path=/`;
    }
  }, []);

  const logout = useCallback(() => {
    // Best-effort: invalidate the session server-side, but never block the
    // local sign-out on it (the user should always be able to log out).
    authService.logout().catch(() => {});
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dfp_token');
      localStorage.removeItem('dfp_user');
      localStorage.removeItem('dfp_distributor_id');
      try {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('dfp_dist_id_')) {
            localStorage.removeItem(k);
          }
        });
      } catch {}
      document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0`;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider');
  return ctx;
}
