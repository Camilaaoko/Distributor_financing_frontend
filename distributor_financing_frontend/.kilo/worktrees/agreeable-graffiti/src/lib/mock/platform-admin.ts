import type {
  ActivityLogEntry,
  Bank,
  BankAdmin,
  PlatformNotification,
  PlatformRoleDef,
} from '@/lib/types';

export const banks: Bank[] = [
  { id: 'bnk_01', name: 'KCB Bank', shortCode: 'KCB', adminCount: 4, status: 'Active' },
  { id: 'bnk_02', name: 'Equity Bank', shortCode: 'EQTY', adminCount: 3, status: 'Active' },
  { id: 'bnk_03', name: 'Co-operative Bank', shortCode: 'COOP', adminCount: 2, status: 'Active' },
  { id: 'bnk_04', name: 'Absa Kenya', shortCode: 'ABSA', adminCount: 2, status: 'Active' },
  { id: 'bnk_05', name: 'NCBA', shortCode: 'NCBA', adminCount: 2, status: 'Active' },
  { id: 'bnk_06', name: 'Stanbic Bank', shortCode: 'STBC', adminCount: 1, status: 'Active' },
  { id: 'bnk_07', name: 'I&M Bank', shortCode: 'I&M', adminCount: 1, status: 'Active' },
  { id: 'bnk_08', name: 'DTB', shortCode: 'DTB', adminCount: 1, status: 'Inactive' },
  { id: 'bnk_09', name: 'Family Bank', shortCode: 'FAM', adminCount: 1, status: 'Active' },
];

const AVATAR_COLORS = [
  'bg-[#1F4DA8]', 'bg-[#3A6FD8]', 'bg-[#2563EB]', 'bg-[#1D4ED8]',
  'bg-[#1F4DA8]', 'bg-[#3A6FD8]', 'bg-[#2563EB]', 'bg-[#1D4ED8]',
];

export const bankAdmins: BankAdmin[] = [
  { id: 'usr_001', firstName: 'Wanjiru', lastName: 'Kamau', email: 'wanjiru.kamau@kcbgroup.com', phone: '+254 712 345 601', nationalId: '27834501', employeeNumber: 'KCB-2291', bankId: 'bnk_01', bankName: 'KCB Bank', department: 'Trade Finance', role: 'Platform Admin', username: 'wkamau', status: 'Active', avatarColor: AVATAR_COLORS[0], lastLogin: '30 Jul 2026, 08:42', createdDate: '14 Jan 2025' },
  { id: 'usr_002', firstName: 'Otieno', lastName: 'Odhiambo', email: 'otieno.odhiambo@equitybank.co.ke', phone: '+254 722 118 843', nationalId: '25671209', employeeNumber: 'EQ-1187', bankId: 'bnk_02', bankName: 'Equity Bank', department: 'SME Banking', role: 'Bank Admin', username: 'oodhiambo', status: 'Active', avatarColor: AVATAR_COLORS[1], lastLogin: '30 Jul 2026, 07:15', createdDate: '02 Mar 2025' },
  { id: 'usr_003', firstName: 'Achieng', lastName: 'Mwangi', email: 'achieng.mwangi@co-opbank.co.ke', phone: '+254 733 902 214', nationalId: '29981144', employeeNumber: 'COOP-0532', bankId: 'bnk_03', bankName: 'Co-operative Bank', department: 'Risk & Compliance', role: 'Support Admin', username: 'amwangi', status: 'Pending', avatarColor: AVATAR_COLORS[2], lastLogin: '—', createdDate: '29 Jul 2026' },
  { id: 'usr_004', firstName: 'Njoroge', lastName: 'Kiptoo', email: 'njoroge.kiptoo@absa.co.ke', phone: '+254 701 556 320', nationalId: '24450938', employeeNumber: 'ABSA-3341', bankId: 'bnk_04', bankName: 'Absa Kenya', department: 'Corporate Banking', role: 'Bank Admin', username: 'nkiptoo', status: 'Active', avatarColor: AVATAR_COLORS[3], lastLogin: '29 Jul 2026, 19:03', createdDate: '18 Jun 2025' },
  { id: 'usr_005', firstName: 'Wambui', lastName: 'Njeri', email: 'wambui.njeri@ncbagroup.com', phone: '+254 745 218 907', nationalId: '28112376', employeeNumber: 'NCBA-0876', bankId: 'bnk_05', bankName: 'NCBA', department: 'Trade Finance', role: 'Bank Admin', username: 'wnjeri', status: 'Suspended', avatarColor: AVATAR_COLORS[4], lastLogin: '21 Jul 2026, 11:47', createdDate: '09 Sep 2024' },
  { id: 'usr_006', firstName: 'Mutiso', lastName: 'Kilonzo', email: 'mutiso.kilonzo@stanbicbank.co.ke', phone: '+254 710 774 512', nationalId: '26639087', employeeNumber: 'STBC-1420', bankId: 'bnk_06', bankName: 'Stanbic Bank', department: 'Digital Banking', role: 'Read Only Admin', username: 'mkilonzo', status: 'Active', avatarColor: AVATAR_COLORS[5], lastLogin: '30 Jul 2026, 06:58', createdDate: '11 Nov 2025' },
  { id: 'usr_007', firstName: 'Cherono', lastName: 'Rotich', email: 'cherono.rotich@imbank.com', phone: '+254 720 663 481', nationalId: '23987654', employeeNumber: 'IM-0221', bankId: 'bnk_07', bankName: 'I&M Bank', department: 'SME Banking', role: 'Bank Admin', username: 'crotich', status: 'Locked', avatarColor: AVATAR_COLORS[6], lastLogin: '12 Jul 2026, 14:22', createdDate: '30 Apr 2025' },
  { id: 'usr_008', firstName: 'Kiplagat', lastName: 'Mutua', email: 'kiplagat.mutua@dtbafrica.com', phone: '+254 733 448 902', nationalId: '25501187', employeeNumber: 'DTB-0987', bankId: 'bnk_08', bankName: 'DTB', department: 'Trade Finance', role: 'Bank Admin', username: 'kmutua', status: 'Inactive', avatarColor: AVATAR_COLORS[7], lastLogin: '02 Jun 2026, 09:11', createdDate: '20 Jan 2024' },
  { id: 'usr_009', firstName: 'Akinyi', lastName: 'Owino', email: 'akinyi.owino@familybank.co.ke', phone: '+254 715 337 665', nationalId: '29045521', employeeNumber: 'FAM-0455', bankId: 'bnk_09', bankName: 'Family Bank', department: 'Corporate Banking', role: 'Bank Admin', username: 'aowino', status: 'Active', avatarColor: AVATAR_COLORS[0], lastLogin: '30 Jul 2026, 08:02', createdDate: '05 Feb 2026' },
  { id: 'usr_010', firstName: 'Muthoni', lastName: 'Gatheru', email: 'muthoni.gatheru@kcbgroup.com', phone: '+254 728 990 213', nationalId: '27765432', employeeNumber: 'KCB-2455', bankId: 'bnk_01', bankName: 'KCB Bank', department: 'Risk & Compliance', role: 'Support Admin', username: 'mgatheru', status: 'Active', avatarColor: AVATAR_COLORS[1], lastLogin: '28 Jul 2026, 16:40', createdDate: '19 Aug 2025' },
  { id: 'usr_011', firstName: 'Barasa', lastName: 'Wafula', email: 'barasa.wafula@equitybank.co.ke', phone: '+254 700 112 998', nationalId: '24887761', employeeNumber: 'EQ-1290', bankId: 'bnk_02', bankName: 'Equity Bank', department: 'Digital Banking', role: 'Bank Admin', username: 'bwafula', status: 'Active', avatarColor: AVATAR_COLORS[2], lastLogin: '30 Jul 2026, 05:37', createdDate: '23 Dec 2025' },
  { id: 'usr_012', firstName: 'Chebet', lastName: 'Langat', email: 'chebet.langat@co-opbank.co.ke', phone: '+254 741 663 209', nationalId: '28556443', employeeNumber: 'COOP-0611', bankId: 'bnk_03', bankName: 'Co-operative Bank', department: 'SME Banking', role: 'Bank Admin', username: 'clangat', status: 'Pending', avatarColor: AVATAR_COLORS[3], lastLogin: '—', createdDate: '30 Jul 2026' },
];

export const platformRoles: PlatformRoleDef[] = [
  { name: 'Platform Super Admin', description: 'Full system access across all banks, tenants, and configuration.', permissionCount: 42, userCount: 2 },
  { name: 'Platform Admin', description: 'Manage bank administrators, banks, and platform-level settings.', permissionCount: 28, userCount: 3 },
  { name: 'Support Admin', description: 'Assist bank admins, view logs, and resolve access issues.', permissionCount: 14, userCount: 2 },
  { name: 'Read Only Admin', description: 'View-only access to dashboards, reports, and audit trails.', permissionCount: 6, userCount: 1 },
  { name: 'Bank Admin', description: 'Manage a single bank’s users, facilities, and approvals.', permissionCount: 18, userCount: 9 },
];

export const platformStatCards = [
  { label: 'Total Banks', value: '9', delta: '2', trend: 'positive' as const, icon: 'banks' as const },
  { label: 'Active Bank Admins', value: '9', delta: '3', trend: 'positive' as const, icon: 'users' as const },
  { label: 'Pending Approvals', value: '2', delta: '1', trend: 'negative' as const, icon: 'pending' as const },
  { label: 'Platform Users', value: '12', delta: '4', trend: 'positive' as const, icon: 'platformUsers' as const },
];

export const platformGrowthSeries = [
  { month: 'Jan', users: 4, banks: 5 },
  { month: 'Feb', users: 5, banks: 6 },
  { month: 'Mar', users: 6, banks: 6 },
  { month: 'Apr', users: 7, banks: 7 },
  { month: 'May', users: 9, banks: 8 },
  { month: 'Jun', users: 10, banks: 8 },
  { month: 'Jul', users: 12, banks: 9 },
];

export const userDistributionByBank = banks
  .filter((b) => (b.adminCount ?? 0) > 0)
  .map((b, i) => ({
    label: b.shortCode ?? '',
    value: b.adminCount ?? 0,
    color: ['#1F4DA8', '#F58220', '#3A6FD8', '#94A3B8', '#16A34A', '#1F4DA8', '#F58220', '#3A6FD8'][i % 8],
  }));

export const activeVsDisabled = [
  { label: 'Active', value: bankAdmins.filter((a) => a.status === 'Active').length, color: '#16A34A' },
  { label: 'Inactive', value: bankAdmins.filter((a) => a.status === 'Inactive').length, color: '#94A3B8' },
  { label: 'Suspended', value: bankAdmins.filter((a) => a.status === 'Suspended').length, color: '#DC2626' },
  { label: 'Pending', value: bankAdmins.filter((a) => a.status === 'Pending').length, color: '#F58220' },
  { label: 'Locked', value: bankAdmins.filter((a) => a.status === 'Locked').length, color: '#9333EA' },
];

export const activityLog: ActivityLogEntry[] = [
  { id: 'act_01', actor: 'System', action: 'Bank Admin created', target: 'Chebet Langat (Co-operative Bank)', time: '2 mins ago', type: 'created' },
  { id: 'act_02', actor: 'Wanjiru Kamau', action: 'Password reset', target: 'Cherono Rotich', time: '38 mins ago', type: 'security' },
  { id: 'act_03', actor: 'Wanjiru Kamau', action: 'Role updated', target: 'Barasa Wafula → Bank Admin', time: '1 hour ago', type: 'updated' },
  { id: 'act_04', actor: 'System', action: 'Login failed (3 attempts)', target: 'Cherono Rotich', time: '2 hours ago', type: 'warning' },
  { id: 'act_05', actor: 'Otieno Odhiambo', action: 'User deleted', target: 'Former admin – Boresha SACCO', time: '5 hours ago', type: 'deleted' },
  { id: 'act_06', actor: 'System', action: 'Permission changed', target: 'Support Admin role', time: '1 day ago', type: 'updated' },
];

export const platformNotifications: PlatformNotification[] = [
  { id: 'not_01', message: '2 bank admin accounts awaiting approval', time: '5 mins ago', type: 'approval' },
  { id: 'not_02', message: 'New bank admin registered at Co-operative Bank', time: '29 mins ago', type: 'registration' },
  { id: 'not_03', message: '3 failed login attempts for Cherono Rotich', time: '2 hours ago', type: 'security' },
  { id: 'not_04', message: 'Account locked: Cherono Rotich (I&M Bank)', time: '2 hours ago', type: 'lock' },
  { id: 'not_05', message: 'Scheduled maintenance window completed', time: '6 hours ago', type: 'system' },
];
