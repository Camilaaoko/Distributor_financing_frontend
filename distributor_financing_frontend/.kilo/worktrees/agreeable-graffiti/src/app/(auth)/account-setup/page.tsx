'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/lib/errors';
import { getPasswordRequirements } from '@/lib/validations';
import { Mail, Lock, ArrowRight, Check, XCircle, Eye, EyeOff } from 'lucide-react';

export default function AccountSetupPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const requirements = getPasswordRequirements(newPassword);
  const minLengthMet = requirements.minLength; // >= 8 characters
  const specialCharMet = requirements.specialChar;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid =
    username.trim().length > 0 &&
    newPassword.length >= 8 &&
    minLengthMet &&
    specialCharMet &&
    confirmPassword.length > 0 &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isFormValid) {
      toast.error('Please check the form requirements.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.changePassword({ username: username.trim(), newPassword });
      toast.success('Account setup complete. Please sign in with your new credentials.');
      logout();
      router.push('/login');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not complete account setup. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F7F9FC]">
      {/* LEFT COLUMN: EMTech Blue Hero */}
      <div className="lg:w-5/12 xl:w-[42%] bg-[#1F4DA8] text-white flex flex-col justify-between p-8 xl:p-14 relative overflow-hidden lg:min-h-screen">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3A6FD8] rounded-full blur-[100px]" />
        </div>

        {/* Header */}
        <div className="relative z-10">
          <Image
            src="/images/emtech_color_logo.png"
            alt="EMTech House"
            width={160}
            height={48}
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Hero Body */}
        <div className="flex-1 flex flex-col justify-center py-4 max-w-xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 text-white/90 rounded-full text-xs font-semibold uppercase tracking-wider border border-white/20 self-start">
            <span className="w-2 h-2 rounded-full bg-[#F58220] animate-pulse" />
            First Login Setup
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-white">
            Complete your <span className="text-[#F58220]">account setup</span>
          </h1>

          <p className="text-white/70 text-base sm:text-lg leading-relaxed font-normal">
            Set your permanent username and password to activate your account.
          </p>

          {/* Info Box */}
          <div className="p-6 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-white/40 via-[#F58220] to-white/40" />
            <p className="text-white/90 text-sm">Your temporary credentials will no longer work after setup.</p>
            <p className="text-white/90 text-sm">You will need to sign in again with your new username and password.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-white/40 flex items-center justify-between border-t border-white/10 pt-4 relative z-10">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Bank-level 256-bit AES Encryption
          </span>
          <span>&copy; {new Date().getFullYear()} EMTech House</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Form */}
      <div className="lg:w-7/12 xl:w-[58%] bg-white flex flex-col p-6 sm:p-10 xl:p-12 lg:min-h-screen">
        {/* Top Header */}
        <div className="flex justify-between items-center text-xs text-[#64748B]">
          <span className="font-semibold text-[#1E293B] bg-[#F7F9FC] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
            Multi-Tenant Portal v3.0
          </span>
          <div className="flex gap-4 font-semibold">
            <Link href="/privacy" className="hover:text-[#1F4DA8] transition-colors">
              Privacy
            </Link>
            <Link href="/support" className="hover:text-[#1F4DA8] transition-colors">
              Support
            </Link>
          </div>
        </div>

        {/* Center Form */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full space-y-6">
            <div>
              <h2 className="text-3xl font-semibold text-[#1E293B] tracking-tight">Set up your account</h2>
              <p className="text-sm text-[#64748B] mt-1">Choose a unique username and create a permanent password.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="text-sm font-medium text-[#DC2626] bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                  {error}
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full pl-11 pr-4 py-3 text-sm font-medium rounded-xl border border-[#E2E8F0] text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8] transition-all"
                    required
                    autoComplete="username"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* New Password with Eye Toggle */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (!touched) setTouched(true);
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 text-sm font-medium rounded-xl border border-[#E2E8F0] text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8] transition-all"
                    required
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Live Password Requirements Checklist */}
              {touched && (
                <div className="space-y-1.5 pl-1 py-1">
                  <div className="flex items-center gap-2 text-xs">
                    {minLengthMet ? (
                      <Check className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0" />
                    )}
                    <span className={minLengthMet ? 'text-[#16A34A] font-medium' : 'text-[#64748B]'}>
                      Must be at least 8 characters (currently {newPassword.length}).
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {specialCharMet ? (
                      <Check className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0" />
                    )}
                    <span className={specialCharMet ? 'text-[#16A34A] font-medium' : 'text-[#64748B]'}>
                      Must contain at least one special character (e.g. !@#$%^&amp;*).
                    </span>
                  </div>
                </div>
              )}

              {/* Confirm Password with Eye Toggle */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 text-sm font-medium rounded-xl border border-[#E2E8F0] text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8] transition-all"
                    required
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    Passwords do not match.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="w-full text-white font-semibold py-3.5 rounded-xl text-base transition-all shadow-lg shadow-[#1F4DA8]/25 active:scale-[0.99] flex items-center justify-center gap-2 mt-2 bg-[#1F4DA8] hover:bg-[#3A6FD8] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{isSubmitting ? 'Setting up…' : 'Set Up Account'}</span>
                {!isSubmitting && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            <div className="text-center text-xs text-[#64748B]">
              <span>Need help? </span>
              <Link href="/support" className="font-semibold text-[#1F4DA8] hover:underline">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}