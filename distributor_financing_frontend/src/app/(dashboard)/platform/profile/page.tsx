'use client';

import { useState } from 'react';
import { ShieldCheck, KeyRound } from 'lucide-react';
import { FormField, TextInput } from '@/components/ui/FormField';
import { ModalButton } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/errors';

function ChangePasswordCard() {
  const toast = useToast();
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await authService.changePassword({ username: user?.username ?? '', newPassword });
      toast.success('Password changed successfully.');
      reset();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to change password.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 max-w-2xl">
      <div className="flex items-center gap-2.5 mb-4">
        <KeyRound size={18} className="text-[#1F4DA8]" />
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Change Password</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="New Password" required>
            <TextInput
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              minLength={8}
              required
            />
          </FormField>
          <FormField label="Confirm New Password" required>
            <TextInput
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              minLength={8}
              required
            />
          </FormField>
        </div>

        <div className="flex justify-end">
          <ModalButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating…' : 'Update Password'}
          </ModalButton>
        </div>
      </form>
    </div>
  );
}

export default function PlatformProfilePage() {
  const { user } = useAuth();
  const displayName = user?.username || 'Platform Admin';
  const displayEmail = user?.email || '';
  const avatarLetter = (displayName || displayEmail || 'P').charAt(0).toUpperCase();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your platform administrator account.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-[#1F4DA8] text-white font-bold flex items-center justify-center text-xl shrink-0">
            {avatarLetter}
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{displayName}</div>
            {displayEmail ? <div className="text-sm text-slate-500">{displayEmail}</div> : null}
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-[#1F4DA8]">
            <ShieldCheck size={12} /> Platform Super Admin
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Username</span>
            <span className="font-semibold text-slate-900">{user?.username || 'platform.admin'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Role</span>
            <span className="font-semibold text-slate-900">{user?.role || 'PLATFORM_ADMIN'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Account Status</span>
            <span className="font-semibold text-emerald-600">Active</span>
          </div>
        </div>
      </div>

      <ChangePasswordCard />
    </div>
  );
}
