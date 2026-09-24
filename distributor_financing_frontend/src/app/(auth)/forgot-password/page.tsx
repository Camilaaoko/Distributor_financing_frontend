'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { assetPath } from '@/lib/assets';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/lib/errors';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authService.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send the reset link. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F7F9FC] relative flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-white shadow-xl border border-[#E2E8F0] rounded-3xl p-8 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Image
            src={assetPath('/images/emtech_color_logo.png')}
            alt="EMTech House"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
          />
          <span className="font-semibold text-lg tracking-tight text-[#1E293B]">EMTech House</span>
        </div>

        {sent ? (
          <div className="text-center py-4 space-y-3">
            <div className="h-12 w-12 mx-auto rounded-full bg-green-100 text-[#16A34A] flex items-center justify-center">
              <MailCheck size={22} />
            </div>
            <h1 className="text-xl font-semibold text-[#1E293B]">Check your email</h1>
            <p className="text-sm text-[#64748B] max-w-xs mx-auto">
              If an account exists for <span className="font-semibold text-[#1E293B]">{email}</span>, a password reset link is on its way.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-[#1E293B] tracking-tight">Forgot your password?</h1>
            <p className="text-sm text-[#64748B] mt-1 mb-6">
              Enter your business email and we&apos;ll send you a link to reset it.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="text-sm font-medium text-[#DC2626] bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Business Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-[#E2E8F0] text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white font-semibold py-3.5 rounded-xl text-base transition-all shadow-lg shadow-[#1F4DA8]/25 active:scale-[0.99] bg-[#1F4DA8] hover:bg-[#3A6FD8] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-[#1F4DA8] hover:text-[#3A6FD8] transition-colors"
        >
          <ArrowLeft size={15} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
