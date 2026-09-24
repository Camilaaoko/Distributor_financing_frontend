'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { CheckCircle2, CircleDollarSign, Clock3, RefreshCw, Search, ShieldCheck, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { repaymentsService, type RepaymentRecord, type RepaymentSummary } from '@/services/repayments.service';
import { useAuth } from '@/hooks/useAuth';
import { loanRequestsApi } from '@/services/loans-api.service';
import { resolveDistributorContext } from '@/lib/distributor-resolver';
import type { LoanRequestResponse } from '@/types/loans';

type Mode = 'dealer' | 'bank';
const money = (amount = 0, currency = 'KES') => new Intl.NumberFormat('en-KE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
const dateTime = (value?: string) => value ? new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
const statusStyle: Record<string, string> = { COMPLETED: 'bg-emerald-50 text-emerald-700', CONFIRMED: 'bg-emerald-50 text-emerald-700', REJECTED: 'bg-rose-50 text-rose-700', FAILED: 'bg-rose-50 text-rose-700', PENDING_CONFIRMATION: 'bg-amber-50 text-amber-700', BANK_MAKER_VERIFIED: 'bg-blue-50 text-blue-700', BANK_CHECKER_APPROVED_UPDATED: 'bg-indigo-50 text-indigo-700' };

export function RepaymentsDashboard({ mode }: { mode: Mode }) {
  const toast = useToast();
  const { user } = useAuth();
  const [records, setRecords] = useState<RepaymentRecord[]>([]);
  const [summary, setSummary] = useState<RepaymentSummary>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [initiationType, setInitiationType] = useState<'repayment' | 'sweep'>('repayment');
  const [form, setForm] = useState({ facilityId: '', accountNumber: '', amount: '', penalty: '', loanId: '', notes: '' });
  const [working, setWorking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, nextSummary] = await Promise.all([
        mode === 'bank' ? repaymentsService.pending() : repaymentsService.list({ search, size: 50 }).then((result) => result.content),
        repaymentsService.summary(),
      ]);
      let loanRecords: RepaymentRecord[] = [];
      if (mode === 'dealer' && user?.email) {
        const context = await resolveDistributorContext(user.email, user.distributorId).catch(() => null);
        if (context?.distributorId) {
          const response = await loanRequestsApi.getLoanRequestsByDistributor(context.distributorId).catch(() => null);
          const result = (response as any)?.result ?? (response as any)?.data ?? response;
          const loans: LoanRequestResponse[] = Array.isArray(result) ? result : Array.isArray(result?.content) ? result.content : [];
          loanRecords = loans.map((loan) => {
            const status = (loan.status || '').toUpperCase();
            const isDisbursed = ['DISBURSED', 'ACTIVE', 'PARTIALLY_DISBURSED', 'PARTIALLY_REPAID'].includes(status);
            const isTerminal = ['COMPLETED', 'REPAID', 'SETTLED'].includes(status);
            return {
              id: `loan-${loan.id}`,
              facilityId: String(loan.facilityId || 'Unassigned'),
              loanId: loan.id,
              totalAmount: Number(loan.remainingBalance ?? loan.principalAmount) || 0,
              status: isTerminal ? 'COMPLETED' : isDisbursed ? 'PENDING_CONFIRMATION' : 'BANK_MAKER_VERIFIED',
              source: 'LOAN_APPLICATION',
              reference: loan.loanRequestNumber || `LOAN-${loan.id}`,
              initiatedAt: loan.disbursedAt || loan.createdAt,
              notes: `Loan status: ${status || 'PENDING'}`,
            };
          });
        }
      }
      setRecords([...loanRecords, ...list]);
      setSummary(nextSummary);
    } catch (error) {
      console.error(error);
      toast.error('Could not load repayments. Please try again.');
    } finally { setLoading(false); }
  }, [mode, search, toast, user?.email, user?.distributorId]);

  useEffect(() => { load(); }, [load]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.facilityId.trim() || !form.accountNumber.trim() || !Number.isFinite(amount) || amount <= 0) { toast.error('Facility, account number, and a valid amount are required.'); return; }
    setWorking('initiate');
    try {
      const penalty = Number(form.penalty);
      if (initiationType === 'sweep' && (!Number.isFinite(penalty) || penalty < 0)) { toast.error('Enter the penalty to apply to this sweep.'); return; }
      const payload = { facilityId: form.facilityId.trim(), accountNumber: form.accountNumber.trim(), amount, loanId: form.loanId ? Number(form.loanId) : undefined, penaltiesAmount: initiationType === 'sweep' ? penalty : undefined, notes: form.notes.trim() || undefined };
      if (initiationType === 'sweep') await repaymentsService.initiateSweep(payload);
      else await repaymentsService.initiate(payload);
      toast.success(`${initiationType === 'sweep' ? 'Sweep' : 'Repayment'} initiated and awaiting bank verification.`);
      setShowForm(false); setForm({ facilityId: '', accountNumber: '', amount: '', penalty: '', loanId: '', notes: '' }); await load();
    } catch (error: any) { toast.error(error?.response?.data?.message ?? 'Could not initiate repayment.'); }
    finally { setWorking(null); }
  };

  const action = async (record: RepaymentRecord, type: 'verify' | 'approve' | 'reject') => {
    const reason = type === 'reject' ? window.prompt('Reason for rejecting this repayment:') : undefined;
    if (type === 'reject' && !reason?.trim()) return;
    setWorking(record.id + type);
    try {
      if (type === 'verify') await repaymentsService.bankMakerVerify(record.id);
      if (type === 'approve') await repaymentsService.bankCheckerApprove(record.id);
      if (type === 'reject') await repaymentsService.reject(record.id, { reason: reason!.trim() });
      toast.success(`Repayment ${type === 'verify' ? 'verified' : type + 'd'} successfully.`); await load();
    } catch (error: any) { toast.error(error?.response?.data?.message ?? `Could not ${type} repayment.`); }
    finally { setWorking(null); }
  };

  const currency = summary.currency || 'KES';
  return <main className="mx-auto min-h-screen max-w-[1600px] space-y-6 bg-slate-50 p-6">
    <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
      <div><h1 className="text-2xl font-bold text-slate-900">{mode === 'bank' ? 'Repayment Review' : 'My Repayments'}</h1><p className="mt-1 text-sm text-slate-500">{mode === 'bank' ? 'Verify, approve, or reject incoming repayment instructions.' : 'Initiate repayments and track their processing status.'}</p></div>
      <div className="flex gap-2"><button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><RefreshCw size={16} /> Refresh</button>{mode === 'dealer' && <><button onClick={() => { setInitiationType('sweep'); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"><RefreshCw size={16} /> Initiate sweep</button><button onClick={() => { setInitiationType('repayment'); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"><CircleDollarSign size={16} /> Initiate repayment</button></>}</div>
    </header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Amount repaid" value={money(summary.totalAmountRepaid, currency)} icon={<CheckCircle2 className="text-emerald-600" />} />
      <Metric label="Outstanding balance" value={money(summary.currentOutstandingBalance, currency)} icon={<CircleDollarSign className="text-rose-500" />} />
      <Metric label="Pending repayments" value={String(summary.pendingRepaymentsCount ?? 0)} icon={<Clock3 className="text-amber-500" />} />
      <Metric label="Available limit" value={money(summary.availableLimit, currency)} icon={<ShieldCheck className="text-blue-600" />} />
    </section>
    {showForm && <form onSubmit={submit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"><h2 className="col-span-full text-base font-bold text-slate-900">Initiate {initiationType === 'sweep' ? 'account sweep' : 'repayment'}</h2><p className="col-span-full -mt-3 text-sm text-slate-500">{initiationType === 'sweep' ? 'Creates a SWEEP_INITIATED instruction. The penalty is added to the settlement total, then bank-maker verification and bank-checker approval apply the sweep.' : 'Creates a manual repayment instruction for bank processing.'}</p><Field label="Facility ID" value={form.facilityId} onChange={(facilityId) => setForm({ ...form, facilityId })} required /><Field label="Settlement account number" value={form.accountNumber} onChange={(accountNumber) => setForm({ ...form, accountNumber })} required /><Field label="Principal amount (KES)" type="number" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} required />{initiationType === 'sweep' ? <Field label="Sweep penalty (KES)" type="number" value={form.penalty} onChange={(penalty) => setForm({ ...form, penalty })} required /> : <Field label="Loan ID (optional)" type="number" value={form.loanId} onChange={(loanId) => setForm({ ...form, loanId })} />}<label className="md:col-span-2 text-sm font-medium text-slate-700">Notes<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 p-2" rows={2} /></label><div className="col-span-full flex justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button><button disabled={working === 'initiate'} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{working === 'initiate' ? 'Submitting…' : `Submit ${initiationType === 'sweep' ? 'sweep' : 'repayment'}`}</button></div></form>}
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="font-bold text-slate-900">{mode === 'bank' ? 'Pending repayment queue' : 'Repayment history'}</h2><p className="text-sm text-slate-500">{records.length} record{records.length === 1 ? '' : 's'}</p></div>{mode === 'dealer' && <label className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reference" className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm" /></label>}</div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Reference</th><th className="p-3">Facility</th><th className="p-3">Amount</th><th className="p-3">Source</th><th className="p-3">Initiated</th><th className="p-3">Status</th>{mode === 'bank' && <th className="p-3">Actions</th>}</tr></thead><tbody>{loading ? <tr><td colSpan={mode === 'bank' ? 7 : 6} className="p-8 text-center text-slate-500">Loading repayments…</td></tr> : records.length === 0 ? <tr><td colSpan={mode === 'bank' ? 7 : 6} className="p-8 text-center text-slate-500">No repayments found.</td></tr> : records.map((record) => <tr key={record.id} className="border-b border-slate-100"><td className="p-3 font-mono text-xs font-semibold">{record.reference || record.id}</td><td className="p-3">{record.facilityId}</td><td className="p-3 font-semibold">{money(record.totalAmount, currency)}</td><td className="p-3">{record.source || 'MANUAL'}</td><td className="p-3 text-slate-500">{dateTime(record.initiatedAt)}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyle[record.status] || 'bg-slate-100 text-slate-600'}`}>{record.status.replaceAll('_', ' ')}</span></td>{mode === 'bank' && <td className="p-3 whitespace-nowrap"><button disabled={working === record.id + 'verify'} onClick={() => action(record, 'verify')} className="mr-2 text-xs font-semibold text-blue-700">Verify</button><button disabled={working === record.id + 'approve'} onClick={() => action(record, 'approve')} className="mr-2 text-xs font-semibold text-emerald-700">Approve</button><button disabled={working === record.id + 'reject'} onClick={() => action(record, 'reject')} className="text-xs font-semibold text-rose-700">Reject</button></td>}</tr>)}</tbody></table></div></section>
  </main>;
}
function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) { return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500"><span>{label}</span>{icon}</div><p className="mt-3 text-xl font-bold text-slate-900">{value}</p></div>; }
function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="text-sm font-medium text-slate-700">{label}<input required={required} type={type} min={type === 'number' ? '0' : undefined} step={type === 'number' ? 'any' : undefined} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2" /></label>; }
