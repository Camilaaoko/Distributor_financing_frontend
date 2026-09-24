'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, BarChart3, Building2, CalendarDays, ChevronRight, Factory, FileBarChart2, Landmark, MoreHorizontal, Package, Users, UserPlus, Zap, ArrowRight } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { platformService } from '@/services/platform.service';
import { manufacturerApi, distributorApi } from '@/services/onboarding-api.service';
import type { Bank, BankAdmin } from '@/lib/types';
import { AddBankAdminModal } from './AddBankAdminModal';
import { ViewBankAdminModal } from './ViewBankAdminModal';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import styles from './PlatformDashboard.module.css';

function dateLabel(value?: string) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}

function Panel({ icon: Icon, title, subtitle, action, children }: { icon: typeof Landmark; title: string; subtitle: string; action?: ReactNode; children: ReactNode }) {
  return <section className={styles.panel}><div className={styles.panelHeading}><Icon size={27} /><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>{children}</section>;
}

const actions = [
  { title: 'Manage Banks', description: 'View and manage partner banks', href: '/platform/banks', icon: Landmark, tone: 'blue' },
  { title: 'Manage Manufacturers', description: 'Oversee manufacturer accounts', href: '/platform/manufacturers', icon: Factory, tone: 'amber' },
  { title: 'Manage Distributors', description: 'View distributor registrations', href: '/platform/distributors', icon: Building2, tone: 'violet' },
  { title: 'Generate Report', description: 'View platform reports', href: '/platform/reports', icon: FileBarChart2, tone: 'blue' },
];

export function PlatformDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [admins, setAdmins] = useState<BankAdmin[]>([]);
  const [counts, setCounts] = useState({ manufacturers: 0, distributors: 0 });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [revision, setRevision] = useState(0);
  const [months, setMonths] = useState(6);
  const [asOf, setAsOf] = useState(() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; });
  const search = '';
  const [chooseBank, setChooseBank] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [viewAdmin, setViewAdmin] = useState<BankAdmin | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([platformService.listBanks(), platformService.listBankAdmins(), manufacturerApi.getManufacturers(), distributorApi.getDistributors()]).then(([bankResult, adminResult, manufacturerResult, distributorResult]) => {
      if (cancelled) return;
      setBanks(bankResult.status === 'fulfilled' ? bankResult.value.items : []);
      setAdmins(adminResult.status === 'fulfilled' ? adminResult.value.items : []);
      setCounts({ manufacturers: manufacturerResult.status === 'fulfilled' ? manufacturerResult.value.length : 0, distributors: distributorResult.status === 'fulfilled' ? distributorResult.value.length : 0 });
      setErrors([bankResult.status === 'rejected' ? 'banks' : '', adminResult.status === 'rejected' ? 'administrators' : '', manufacturerResult.status === 'rejected' ? 'manufacturers' : '', distributorResult.status === 'rejected' ? 'distributors' : ''].filter(Boolean));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [revision]);

  const reload = () => { setLoading(true); setRevision(value => value + 1); };
  const activeBanks = banks.filter(bank => bank.status.toUpperCase() === 'ACTIVE');
  const metrics = [
    { label: 'Total Banks', value: activeBanks.length, icon: Landmark, tone: 'blue', source: 'banks', note: 'Active bank partners' },
    { label: 'Total Users', value: null, icon: Users, tone: 'green', source: 'users', note: 'Across all organizations' },
    { label: 'Total Distributors', value: counts.distributors, icon: Package, tone: 'amber', source: 'distributors', note: 'Onboarded distributors' },
    { label: 'Total Manufacturers', value: counts.manufacturers, icon: Factory, tone: 'violet', source: 'manufacturers', note: 'Registered manufacturers' },
  ];
  const endDate = new Date(`${asOf}T23:59:59`);
  const chartData = Array.from({ length: months }, (_, index) => {
    const start = new Date(endDate.getFullYear(), endDate.getMonth() - months + index + 1, 1);
    const end = new Date(Math.min(new Date(start.getFullYear(), start.getMonth() + 1, 1).getTime() - 1, endDate.getTime()));
    const registered = (value?: string) => !!value && new Date(value) >= start && new Date(value) <= end;
    return { month: start.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }), banks: banks.filter(bank => registered(bank.createdAt)).length, admins: admins.filter(admin => registered(admin.createdDate)).length };
  });
  const query = search.trim().toLowerCase();
  const visibleBanks = banks.filter(bank => `${bank.name} ${bank.branch || ''}`.toLowerCase().includes(query)).slice(0, 5);
  const recentAdmins = [...admins].sort((a, b) => (Date.parse(b.createdDate) || 0) - (Date.parse(a.createdDate) || 0)).filter(admin => `${admin.firstName} ${admin.lastName} ${admin.bankName}`.toLowerCase().includes(query)).slice(0, 3);
  const viewAll = (href: string) => <Link className={styles.viewAll} href={href}>View All <ArrowRight size={15} /></Link>;

  return <div className={styles.dashboard}>
    <header className={styles.header}>
      <div className={styles.breadcrumb}>Platform <span>/</span> <strong>Dashboard</strong></div>
      <div className={styles.heading}><h1>Platform Administration</h1><p>Welcome back, {user?.username || 'Platform Admin'}</p><span>Here&apos;s what&apos;s happening across your distributor financing ecosystem.</span></div>
      <div className={styles.headerControls}><label className={styles.dateControl}><CalendarDays size={19} /><input aria-label="Chart end date" type="date" value={asOf} onChange={event => { if (event.target.value) setAsOf(event.target.value); }} /></label></div>
      <div className={styles.tagline}>
        <span className={styles.taglineText}>Enabling Growth<br />Through Trusted Partnerships</span>
        <svg className={styles.africaMap} viewBox="0 0 100 120" aria-hidden="true" focusable="false">
          <path d="M39 5 47 7 51 5 57 9 65 9 69 15 72 25 78 34 85 40 94 38 89 48 81 57 76 62 77 71 72 79 70 89 65 95 62 105 56 114 49 115 45 107 42 98 39 92 38 83 33 75 34 66 29 60 30 53 23 50 18 53 10 50 5 42 4 34 8 24 15 18 20 10 29 8 34 4Z" />
          <path d="m87 81 3 4-2 10-4 8-3-2 1-9Z" />
        </svg>
      </div>
    </header>
    {errors.length > 0 && <div role="alert" className={styles.error}>
      <span className={styles.errorIcon} aria-hidden="true"><AlertTriangle size={24} /></span>
      <span className={styles.errorMessage}>Unable to load {errors.join(', ')}.</span>
      <button onClick={reload} disabled={loading}>{loading ? 'Retrying…' : 'Retry'}</button>
    </div>}
    <section aria-label="Platform statistics" className={styles.metrics}>
      {metrics.map(metric => {
        const unavailable = metric.value === null || errors.includes(metric.source);
        return <article key={metric.label} className={styles.metric} aria-busy={loading}>
          <span className={`${styles.metricIcon} ${styles[metric.tone]}`}><metric.icon size={24} aria-hidden="true" /></span>
          <div>
            <h2>{metric.label}</h2>
            <strong aria-label={loading ? 'Loading' : unavailable ? 'Unavailable' : undefined}>{loading || unavailable ? '—' : metric.value?.toLocaleString()}</strong>
            <p>{metric.note}</p>
            {!loading && unavailable && <span className={styles.metricUnavailable}>Unavailable</span>}
          </div>
        </article>;
      })}
    </section>
    <div className={styles.grid}>
      <Panel icon={BarChart3} title="Platform Overview" subtitle={`Registrations over the last ${months} months`} action={<select aria-label="Chart period" value={months} onChange={event => setMonths(Number(event.target.value))}><option value={3}>Last 3 Months</option><option value={6}>Last 6 Months</option><option value={12}>Last 12 Months</option></select>}>
        <div className={styles.chart}>{loading ? <p className={styles.empty}>Loading registration history…</p> : errors.includes('banks') || errors.includes('administrators') ? <p className={styles.empty}>Registration history is unavailable. Please retry.</p> : <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 22, right: 14, left: -25, bottom: 6 }} barGap={5}><CartesianGrid vertical={false} stroke="#e6ecf4" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#7183a1', fontSize: 11 }} dy={9} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#7183a1', fontSize: 11 }} /><Tooltip cursor={{ fill: '#f5f8ff' }} contentStyle={{ borderRadius: 10, border: '1px solid #e6ecf4' }} /><Legend iconType="circle" iconSize={11} wrapperStyle={{ paddingTop: 30, fontSize: 12 }} /><Bar dataKey="banks" name="Bank Registrations" fill="#2477ed" radius={[3, 3, 0, 0]} maxBarSize={26} /><Bar dataKey="admins" name="Bank Admins" fill="#d5e5ff" radius={[3, 3, 0, 0]} maxBarSize={26} /></BarChart></ResponsiveContainer>}</div>
        {!loading && !errors.length && !chartData.some(point => point.banks || point.admins) && <p className={styles.chartNote}>No dated registrations in this period.</p>}
      </Panel>
      <Panel icon={Zap} title="Quick Actions" subtitle="Common administrative tasks"><div className={styles.actions}><button className={styles.action} onClick={() => setChooseBank(true)}><span className={`${styles.actionIcon} ${styles.blue}`}><UserPlus size={24} /></span><span><strong>Add Bank Admin</strong><small>Create a new bank administrator</small></span><ChevronRight size={18} /></button>{actions.map(action => <Link className={styles.action} href={action.href} key={action.title}><span className={`${styles.actionIcon} ${styles[action.tone]}`}><action.icon size={23} /></span><span><strong>{action.title}</strong><small>{action.description}</small></span><ChevronRight size={18} /></Link>)}</div></Panel>
      <Panel icon={Landmark} title="Partner Banks" subtitle="List of registered partner banks" action={viewAll('/platform/banks')}>
        <div className={styles.tableWrap}><table><thead><tr><th>Bank Name</th><th>Admins</th><th>Location</th><th>Status</th><th>Date Joined</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleBanks.map(bank => <tr key={bank.id}><td><Link href="/platform/banks" className={styles.bankName}><span><Landmark size={17} /></span>{bank.name}</Link></td><td>{errors.includes('administrators') ? '—' : admins.filter(admin => admin.bankId === bank.id || admin.bankId === bank.bankCode).length}</td><td>{bank.branch || '—'}</td><td><span className={`${styles.status} ${bank.status.toUpperCase() === 'ACTIVE' ? styles.active : ''}`}>{bank.status}</span></td><td className={styles.nowrap}>{dateLabel(bank.createdAt)}</td><td><Link href="/platform/banks" aria-label={`Manage ${bank.name}`}><MoreHorizontal size={18} /></Link></td></tr>)}</tbody></table></div>
        {(loading || errors.includes('banks') || !visibleBanks.length) && <p className={styles.empty}>{loading ? 'Loading partner banks…' : errors.includes('banks') ? 'Partner banks are unavailable.' : query ? 'No matching banks.' : 'No banks registered yet.'}</p>}
      </Panel>
      <Panel icon={Users} title="Recent Bank Admins" subtitle="Recently added bank administrators" action={viewAll('/platform/users')}>
        <div className={styles.admins}>{recentAdmins.map((admin, index) => <button className={styles.admin} key={admin.id} onClick={() => setViewAdmin(admin)}><span className={`${styles.avatar} ${styles[`avatar${index}`]}`}>{admin.firstName?.[0]}{admin.lastName?.[0]}</span><span className={styles.adminInfo}><strong>{admin.firstName} {admin.lastName}</strong><small>{admin.bankName || banks.find(bank => bank.id === admin.bankId)?.name || 'Partner Bank'}</small><small>Added {dateLabel(admin.createdDate)}</small></span><span className={`${styles.status} ${admin.status === 'Active' ? styles.active : ''}`}>{admin.status}</span><MoreHorizontal size={18} /></button>)}</div>
        {(loading || errors.includes('administrators') || !recentAdmins.length) && <p className={styles.empty}>{loading ? 'Loading administrators…' : errors.includes('administrators') ? 'Administrators are unavailable.' : query ? 'No matching administrators.' : 'No bank administrators yet.'}</p>}
      </Panel>
    </div>
    <Modal open={chooseBank} onClose={() => setChooseBank(false)} title="Add Bank Admin" description="Select the partner bank for the new administrator."><div className="space-y-2">{loading ? <p>Loading banks…</p> : activeBanks.length ? activeBanks.map(bank => <button key={bank.id} className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3 text-left hover:bg-blue-50" onClick={() => { setSelectedBank(bank); setChooseBank(false); }}><span>{bank.name}<small className="block text-slate-500">{bank.branch}</small></span><ChevronRight size={18} /></button>) : <p>No active banks available. <Link className="text-blue-600 underline" href="/platform/banks">Manage banks</Link></p>}</div></Modal>
    <AddBankAdminModal open={!!selectedBank} selectedBank={selectedBank} onClose={() => setSelectedBank(null)} isSubmitting={saving} onCreate={async input => { setSaving(true); try { await platformService.createBankAdmin(input); toast.success('Bank administrator created successfully.'); reload(); return true; } catch (error) { toast.error(getErrorMessage(error, 'Unable to create administrator.')); return false; } finally { setSaving(false); } }} />
    <ViewBankAdminModal admin={viewAdmin} onClose={() => setViewAdmin(null)} />
  </div>;
}
