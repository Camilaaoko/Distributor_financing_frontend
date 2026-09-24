'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, Check } from 'lucide-react';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/lib/errors';
import { getPasswordRequirements } from '@/lib/validations';

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token');
  const toast = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);

  const requirements = getPasswordRequirements(newPassword);
  const minLengthMet = requirements.minLength;
  const specialCharMet = requirements.specialChar;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid = token && newPassword.length > 0 && minLengthMet && specialCharMet && confirmPassword.length > 0 && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('This reset link is invalid or missing a token. Request a new one.');
      return;
    }
    if (!isFormValid) {
      toast.error('Please check the password requirements.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.resetPassword({ token, newPassword });
      toast.success('Password has been reset successfully.');
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not reset your password. The link may have expired.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-4 space-y-3">
        <div className="h-12 w-12 mx-auto rounded-full bg-green-100 text-[#16A34A] flex items-center justify-center">
          <CheckCircle2 size={22} />
        </div>
        <h1 className="text-xl font-semibold text-[#1E293B]">Password reset</h1>
        <p className="text-sm text-[#64748B]">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-[#1E293B] tracking-tight">Reset your password</h1>
      <p className="text-sm text-[#64748B] mt-1 mb-6">Please, enter a new password.</p>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {!token && (
          <div className="text-sm font-medium text-[#F58220] bg-orange-50 border border-orange-200 rounded-xl px-3.5 py-2.5">
            This link is missing a reset token. You can still request a new one from the previous page.
          </div>
        )}

        <FormField label="New password" required>
          <Input
            isPassword
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (!touched) setTouched(true);
            }}
            onBlur={() => setTouched(true)}
            placeholder="Type your new password"
            required
            minLength={8}
          />
        </FormField>

        {touched && (
          <div className="space-y-2 pl-1">
            <div className="flex items-center gap-2 text-sm">
              {minLengthMet ? (
                <Check className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0" />
              )}
              <span className={minLengthMet ? 'text-[#16A34A]' : 'text-[#64748B]'}>
                Must be at least 8 characters.
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {specialCharMet ? (
                <Check className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0" />
              )}
              <span className={specialCharMet ? 'text-[#16A34A]' : 'text-[#64748B]'}>
                Must contain one special character.
              </span>
            </div>
          </div>
        )}

        <FormField label="Confirm password" required>
          <Input
            isPassword
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your new password"
            required
            minLength={8}
            error={confirmPassword.length > 0 && !passwordsMatch ? 'Your passwords don\'t match.' : undefined}
          />
        </FormField>


        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="w-full text-white font-semibold py-3.5 rounded-xl text-base transition-all shadow-lg shadow-[#1F4DA8]/25 active:scale-[0.99] bg-[#1F4DA8] hover:bg-[#3A6FD8] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Resetting…' : 'Confirm'}
        </button>
      </form>

      <Link
        href="/login"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-[#1F4DA8] hover:text-[#3A6FD8] transition-colors"
      >
        <ArrowLeft size={15} /> Back to Sign In
      </Link>
    </>
  );
}