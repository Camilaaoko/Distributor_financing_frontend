"use client";

import type { User } from "@/lib/types";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { assetPath } from "@/lib/assets";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { ROLE_HOME_ROUTE } from "@/lib/constants";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await authService.login({
        identifier,
        password,
      });

      let bankId: string | undefined = undefined;
      let bankName: string | undefined = undefined;
      let distributorId: string | undefined = undefined;
      let userEmail = response.email;
      let userUsername = response.username;

      let userRoleName = response.roleName || response.appRole;
      let userPermissions = response.permissions;

      // 1. Decode JWT payload
      if (response.token && response.token.includes('.')) {
        try {
          const payload = JSON.parse(atob(response.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
          bankId = payload.bankId || payload.tenantId || payload.entityId;
          bankName = payload.bankName || payload.tenantName;
          // Extract distributorId — backends may use different claim names
          distributorId =
            payload.distributorId ||
            payload.distributor_id ||
            (payload.role && (payload.role.toUpperCase().includes('DISTRIBUTOR') || payload.role.toUpperCase().includes('DEALER'))
              ? payload.parentEntityId || payload.entityId
              : undefined);
          if (!userEmail) userEmail = payload.email || (payload.sub && payload.sub.includes('@') ? payload.sub : undefined);
          if (!userUsername) userUsername = payload.username || payload.name || payload.preferred_username || (payload.sub && !payload.sub.includes('@') ? payload.sub : undefined);
          if (!userRoleName) userRoleName = payload.roleName || payload.appRole || payload.role_name || payload.subRole;
          if (!userPermissions && Array.isArray(payload.permissions)) userPermissions = payload.permissions;
          if (!userPermissions && Array.isArray(payload.authorities)) userPermissions = payload.authorities;
        } catch {}
      }

      // 2. Fallback to typed identifier if email or username not explicitly provided
      if (!userEmail && identifier.includes('@')) {
        userEmail = identifier.trim();
      }
      if (!userUsername) {
        userUsername = identifier.includes('@') ? identifier.split('@')[0] : identifier.trim();
      }

      // 3. If bankId not in token, resolve from /api/onboarding/banks/admins for bank roles
      if (!bankId && response.role && response.role.toUpperCase().includes('BANK')) {
        try {
          const adminsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://172.16.10.64:8080'}/api/onboarding/banks/admins`, {
            headers: { Authorization: `Bearer ${response.token}` }
          });
          if (adminsRes.ok) {
            const admins = await adminsRes.json();
            if (Array.isArray(admins)) {
              const matched = admins.find(
                (a: any) => a.email && a.email.toLowerCase().trim() === (userEmail || '').toLowerCase().trim()
              );
              if (matched) {
                bankId = matched.bankId;
                bankName = matched.bankName;
              }
            }
          }
        } catch {}
      }

      // 4. If distributorId not in token or is an email, resolve from onboarding endpoints
      if (
        (!distributorId || distributorId.includes('@')) &&
        response.role &&
        (response.role.toUpperCase().includes('DISTRIBUTOR') || response.role.toUpperCase().includes('DEALER'))
      ) {
        try {
          const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://172.16.10.64:8080';
          const authHeader = { Authorization: `Bearer ${response.token}` };

          // Try distributor users first
          const distUsersRes = await fetch(`${apiBase}/api/onboarding/distributors/users`, { headers: authHeader }).catch(() => null);
          if (distUsersRes && distUsersRes.ok) {
            const users = await distUsersRes.json().catch(() => []);
            if (Array.isArray(users)) {
              const matched = users.find(
                (u: any) =>
                  (u.email && u.email.toLowerCase().trim() === (userEmail || '').toLowerCase().trim()) ||
                  (u.username && u.username.toLowerCase().trim() === (userUsername || '').toLowerCase().trim()) ||
                  (response.userId && String(u.id) === String(response.userId))
              );
              if (matched) {
                const resolved = matched.distributorId || matched.entityId;
                if (resolved && !resolved.includes('@')) {
                  distributorId = resolved;
                }
              }
            }
          }

          // If still not resolved, try distributors directory
          if (!distributorId || distributorId.includes('@')) {
            const distsRes = await fetch(`${apiBase}/api/onboarding/distributors`, { headers: authHeader }).catch(() => null);
            if (distsRes && distsRes.ok) {
              const dists = await distsRes.json().catch(() => []);
              if (Array.isArray(dists)) {
                const matched = dists.find(
                  (d: any) =>
                    (d.contactEmail && d.contactEmail.toLowerCase().trim() === (userEmail || '').toLowerCase().trim()) ||
                    (d.email && d.email.toLowerCase().trim() === (userEmail || '').toLowerCase().trim())
                );
                if (matched?.id && !matched.id.includes('@')) {
                  distributorId = matched.id;
                }
              }
            }
          }

          // If still not resolved, try approved recommendations
          if (!distributorId || distributorId.includes('@')) {
            const recsRes = await fetch(`${apiBase}/api/onboarding/distributors/recommendations/approved`, { headers: authHeader }).catch(() => null);
            if (recsRes && recsRes.ok) {
              const recs = await recsRes.json().catch(() => []);
              if (Array.isArray(recs)) {
                const matched = recs.find(
                  (r: any) =>
                    (r.contactEmail && r.contactEmail.toLowerCase().trim() === (userEmail || '').toLowerCase().trim()) ||
                    (r.email && r.email.toLowerCase().trim() === (userEmail || '').toLowerCase().trim())
                );
                if (matched?.id && !matched.id.includes('@')) {
                  distributorId = matched.id;
                }
              }
            }
          }
        } catch (e) {
          console.warn('[LOGIN] Could not pre-resolve distributorId:', e);
        }
      }

      if (distributorId && !distributorId.includes('@') && userEmail && typeof window !== 'undefined') {
        localStorage.setItem(`dfp_dist_id_${userEmail.toLowerCase().trim()}`, distributorId);
        localStorage.setItem('dfp_distributor_id', distributorId);
      }

      console.log('[DISTRIBUTOR_IDENTITY] Login authentication completed:', {
        authenticatedUserId: response.userId,
        authenticatedUsername: userUsername,
        authenticatedEmail: userEmail,
        resolvedDistributorId: distributorId,
      });

      const user: User = {
        userId: response.userId,
        email: userEmail || '',
        username: userUsername || '',
        role: response.role,
        roleCode: response.roleCode,
        roleName: userRoleName,
        appRole: userRoleName,
        permissions: userPermissions,
        mustResetPassword: response.mustResetPassword,
        bankId,
        bankName,
        distributorId,
      };

      login(user, response.token);

      // PLATFORM_ADMIN is a pre-provisioned system account with username already set.
      if (response.mustResetPassword && response.role !== 'PLATFORM_ADMIN') {
        router.push('/account-setup');
        return;
      }

      const normalizedRole = (user.role || '').toUpperCase().trim();
      let route = ROLE_HOME_ROUTE[normalizedRole];

      if (!route) {
        if (normalizedRole.includes('MANUFACTURER')) {
          route = '/manufacturer';
        } else if (normalizedRole.includes('DISTRIBUTOR') || normalizedRole.includes('DEALER')) {
          route = '/dealer';
        } else if (normalizedRole.includes('PLATFORM')) {
          route = '/platform';
        } else if (normalizedRole.includes('BANK')) {
          route = '/bank';
        } else {
          route = '/dashboard';
        }
      }

      router.push(route);

    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError(err.response?.data?.message || "Invalid email or password.");
      } else {
        setError(getErrorMessage(err, "Invalid email or password."));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F7F9FC]">

      {/* LEFT COLUMN: EMTech Blue Hero */}
      <div className="lg:w-1/2 xl:w-[48%] bg-[#1F4DA8] text-white flex flex-col justify-between p-8 xl:p-14 relative overflow-hidden lg:min-h-screen">
        {/* Background ambient lighting */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3A6FD8] rounded-full blur-[100px]" />
        </div>

        {/* Hero Body */}
        <div className="flex-1 flex flex-col justify-start pt-6 sm:pt-10 xl:pt-14 max-w-xl space-y-6 relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-white">
            Welcome to the{' '}
            <span className="text-[#F58220]">
              Distributor Financing
            </span>{' '}
            Platform
          </h1>

          <p className="text-white/70 text-base sm:text-lg leading-relaxed font-normal">
            Multi-tenancy platform
          </p>
        </div>

        {/* Footer */}
        <div className="text-xs text-white/40 flex items-center justify-end border-t border-white/10 pt-4 relative z-10">
          <span>&copy; {new Date().getFullYear()} EMTech House</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Form */}
      <div className="lg:w-1/2 xl:w-[52%] bg-white flex flex-col justify-between p-6 sm:p-10 xl:p-12 lg:min-h-screen">
        {/* Top Header with Centered Logo */}
        <div className="flex flex-col items-center justify-center w-full pt-1 pb-4">
          <Image
            src={assetPath("/images/emtech_color_logo.png")}
            alt="EMTech House"
            width={260}
            height={80}
            className="h-16 sm:h-20 w-auto object-contain"
            priority
          />
        </div>

        {/* Center Form — vertically centered */}
        <div className="my-auto py-4 sm:py-6 flex items-center justify-center">
          <div className="max-w-md w-full space-y-6">
            <form className="space-y-4" onSubmit={handleSubmit}>

              {error && (
                <div className="text-sm font-medium text-[#DC2626] bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5" role="alert">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="email or username"
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm font-medium rounded-xl border border-[#E2E8F0] text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8] transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#1F4DA8] hover:text-[#3A6FD8] transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-2.5 sm:py-3 text-sm font-medium rounded-xl border border-[#E2E8F0] text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center pt-0.5">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#1F4DA8] focus:ring-[#1F4DA8] border-[#E2E8F0] rounded cursor-pointer transition-colors"
                />
                <label htmlFor="remember" className="ml-2.5 block text-xs font-semibold text-[#64748B] cursor-pointer select-none">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white font-semibold py-3 sm:py-3.5 rounded-xl text-sm sm:text-base transition-all shadow-md shadow-[#1F4DA8]/20 active:scale-[0.99] flex items-center justify-center gap-2 mt-2 bg-[#1F4DA8] hover:bg-[#3A6FD8] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{isSubmitting ? "Signing in…" : "Continue to Dashboard"}</span>
                {!isSubmitting && (
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-[#64748B] pt-4 border-t border-[#E2E8F0]">
          Distributors entering via manufacturer referral?{' '}
          <Link href="/onboarding/consent" className="font-semibold text-[#1F4DA8] hover:underline">
            Complete Data Consent
          </Link>
        </div>

      </div>
    </div>
  );
}
