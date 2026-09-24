import { Suspense } from 'react';
import Image from 'next/image';
import { ResetPasswordForm } from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F7F9FC] relative flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-white shadow-xl border border-[#E2E8F0] rounded-3xl p-8 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Image
            src="/images/emtech_color_logo.png"
            alt="EMTech House"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
          />
          <span className="font-semibold text-lg tracking-tight text-[#1E293B]">EMTech House</span>
        </div>

        <Suspense fallback={<div className="text-sm text-[#64748B] py-8 text-center">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}