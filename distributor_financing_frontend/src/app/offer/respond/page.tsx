'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { assetPath } from '@/lib/assets';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Clock,
  Wallet,
  Percent,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { distributorLoanProfilesApi } from '@/services/loans-api.service';

type PageState = 'loading' | 'confirm_reject' | 'success_accept' | 'success_reject' | 'error' | 'invalid';

interface OfferDetails {
  creditLimit?: number;
  interestRate?: number;
  tenorDays?: number;
  distributorName?: string;
  bankName?: string;
  expiresAt?: string;
}

function OfferRespondContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const action = (searchParams.get('action') || '').toUpperCase() as 'ACCEPT' | 'REJECT' | '';

  const [state, setState] = useState<PageState>('loading');
  const [offerDetails, setOfferDetails] = useState<OfferDetails>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const processResponse = useCallback(async (resolvedAction: 'ACCEPT' | 'REJECT', reason?: string) => {
    setIsSubmitting(true);
    try {
      const res = await distributorLoanProfilesApi.respondToOffer(token, resolvedAction, reason);
      // Extract offer details from response if available
      const result = (res as any)?.result || (res as any);
      setOfferDetails((prev) => ({
        ...prev,
        creditLimit: result?.creditLimit ?? prev.creditLimit,
        interestRate: result?.interestRate ?? prev.interestRate,
        tenorDays: result?.allowedRepaymentTerms?.[0] ?? prev.tenorDays,
        distributorName: result?.distributorName ?? prev.distributorName,
        bankName: result?.bankName ?? prev.bankName,
      }));
      setState(resolvedAction === 'ACCEPT' ? 'success_accept' : 'success_reject');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong. The link may have expired or already been used.';
      setErrorMessage(msg);
      setState('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setState('invalid');
      return;
    }
    if (action !== 'ACCEPT' && action !== 'REJECT') {
      setState('invalid');
      return;
    }

    if (action === 'REJECT') {
      // Show confirmation step before sending the reject
      setState('confirm_reject');
    } else {
      // ACCEPT — process immediately
      processResponse('ACCEPT');
    }
  }, [token, action, processResponse]);

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center p-4">
      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#1F4DA8] px-6 py-5 flex items-center gap-3">
          <Image
            src={assetPath('/images/emtech_logo_png.png')}
            alt="EMTech House"
            width={120}
            height={36}
            className="h-8 w-auto object-contain brightness-0 invert"
          />
          <div className="h-6 w-px bg-white/30" />
          <span className="text-white text-sm font-semibold">Credit Facility Offer</span>
        </div>

        <div className="p-6 sm:p-8">
          {/* ── LOADING ── */}
          {state === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <Loader2 size={40} className="text-[#1F4DA8] animate-spin" />
              <p className="text-sm font-semibold text-slate-700">Processing your response…</p>
              <p className="text-xs text-slate-400">Please wait, this will only take a moment.</p>
            </div>
          )}

          {/* ── CONFIRM REJECT ── */}
          {state === 'confirm_reject' && (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <XCircle size={22} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Decline Credit Facility Offer</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    You are about to decline this revolving credit facility. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-800">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>
                  Declining this offer will notify your bank partner. You may need to re-apply or contact your
                  relationship manager to re-initiate the process.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Reason for declining <span className="text-slate-400 font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Terms do not meet our current requirements…"
                  className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 resize-none placeholder-slate-400"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => processResponse('REJECT', rejectionReason || undefined)}
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <><Loader2 size={15} className="animate-spin" /> Declining…</>
                  ) : (
                    <><XCircle size={15} /> Confirm Decline</>
                  )}
                </button>
                <Link
                  href="/login"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>
          )}

          {/* ── SUCCESS: ACCEPTED ── */}
          {state === 'success_accept' && (
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center gap-3 pt-2">
                <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Offer Accepted!</h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Your revolving credit facility has been activated. Login credentials have been sent to your
                    registered email address.
                  </p>
                </div>
              </div>

              {/* Facility summary if details were returned */}
              {(offerDetails.creditLimit || offerDetails.interestRate) && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-3">
                  {offerDetails.creditLimit && (
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Wallet size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Credit Limit</div>
                        <div className="text-sm font-black text-slate-900">
                          KES {offerDetails.creditLimit.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                  {offerDetails.interestRate && (
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 text-[#1F4DA8] flex items-center justify-center shrink-0">
                        <Percent size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Interest Rate</div>
                        <div className="text-sm font-black text-slate-900">{offerDetails.interestRate}% p.a.</div>
                      </div>
                    </div>
                  )}
                  {offerDetails.tenorDays && (
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Max Tenor</div>
                        <div className="text-sm font-black text-slate-900">{offerDetails.tenorDays} days</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</div>
                      <div className="text-sm font-black text-emerald-700">Active</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-[#1F4DA8] leading-relaxed">
                <strong className="font-bold">What happens next?</strong> Your login credentials have been sent to
                your registered email. Use them to access the Distributor Financing Platform and start requesting
                inventory financing drawdowns.
              </div>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#1F4DA8] hover:bg-[#1A3F8A] text-white text-sm font-bold rounded-xl transition-colors"
              >
                Go to Login <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* ── SUCCESS: REJECTED ── */}
          {state === 'success_reject' && (
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center gap-3 pt-2">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                  <XCircle size={32} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Offer Declined</h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    You have declined the credit facility offer. Your bank partner has been notified.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 leading-relaxed">
                If this was a mistake or you change your mind, please contact your relationship manager or the
                platform support team to request a new offer.
              </div>

              <Link
                href="/support"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Contact Support <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* ── ERROR ── */}
          {state === 'error' && (
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center gap-3 pt-2">
                <div className="h-14 w-14 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center">
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Unable to Process</h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">{errorMessage}</p>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-700 leading-relaxed space-y-1">
                <p className="font-bold">Common reasons this can happen:</p>
                <ul className="list-disc list-inside space-y-0.5 text-rose-600">
                  <li>The offer link has expired (links are valid for 7 days)</li>
                  <li>The offer has already been accepted or declined</li>
                  <li>The link was modified or is incomplete</li>
                </ul>
              </div>

              <Link
                href="/support"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#1F4DA8] hover:bg-[#1A3F8A] text-white text-sm font-bold rounded-xl transition-colors"
              >
                Contact Support <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* ── INVALID (no token / bad action) ── */}
          {state === 'invalid' && (
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center gap-3 pt-2">
                <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center">
                  <Clock size={32} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Invalid Link</h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    This link is missing required parameters. Please use the exact link provided in your offer email.
                  </p>
                </div>
              </div>

              <Link
                href="/support"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-700 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Contact Support <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-400 text-center">
        &copy; {new Date().getFullYear()} EMTech House &mdash; Distributor Financing Platform
      </p>
    </div>
  );
}

export default function OfferRespondPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 size={32} className="animate-spin text-blue-400" />
            <p className="text-sm font-semibold">Loading offer response...</p>
          </div>
        </div>
      }
    >
      <OfferRespondContent />
    </Suspense>
  );
}
