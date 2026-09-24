import Link from 'next/link';
import Image from 'next/image';

export default function DealerConsentPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-between p-6">
      <header className="flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/emtech_color_logo.png"
            alt="EMTech House"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="font-semibold text-[#1E293B] text-base">EMTech House</span>
        </div>
        <Link
          href="/login"
          className="text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors"
        >
          ← Back to Login
        </Link>
      </header>

      <main className="max-w-xl w-full mx-auto my-auto bg-white p-8 sm:p-10 rounded-2xl shadow-lg shadow-slate-200/20 border border-[#E2E8F0] space-y-6">
        <div>
          <span className="text-xs font-semibold text-[#1F4DA8] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full">
            Dealer Onboarding
          </span>
          <h1 className="text-2xl font-semibold text-[#1E293B] mt-3">Data Sharing Consent</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Your referring manufacturer has initiated your onboarding onto the Distributor Financing Platform.
          </p>
        </div>

        <div className="bg-[#F7F9FC] p-4 rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] space-y-2">
          <p className="font-semibold text-[#1E293B]">By proceeding, you consent to:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Sharing past purchase and payment history with the financing bank.</li>
            <li>Preliminary credit assessment and revolving credit limit determination.</li>
            <li>Receiving application login credentials via email upon bank approval.</li>
          </ul>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-semibold text-[#64748B] hover:text-[#1E293B] bg-[#F7F9FC] hover:bg-[#E2E8F0] transition-colors flex items-center justify-center gap-1.5"
          >
            ← Back
          </Link>
          <Link
            href="/onboarding/application"
            className="w-full sm:flex-1 bg-[#1F4DA8] hover:bg-[#3A6FD8] text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-[#1F4DA8]/20"
          >
            I Consent &amp; Continue &rarr;
          </Link>
        </div>
      </main>

      <footer className="text-center text-xs text-[#64748B] max-w-7xl mx-auto w-full py-4 border-t border-[#E2E8F0]">
        &copy; {new Date().getFullYear()} EMTech House. All rights reserved.
      </footer>
    </div>
  );
}