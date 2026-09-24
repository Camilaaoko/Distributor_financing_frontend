import type {
  ActivityLogEntry,
  BankUser,
  DistributorApproval,
  ApprovedDistributor,
  PlatformNotification,
} from '@/lib/types';

const AVATAR_COLORS = [
  'bg-indigo-600', 'bg-emerald-600', 'bg-sky-600', 'bg-amber-500',
  'bg-rose-600', 'bg-violet-600', 'bg-teal-600', 'bg-fuchsia-600',
];

export const bankUsers: BankUser[] = [
  { id: 'bu_001', firstName: 'James', lastName: 'Omondi', email: 'james.omondi@kcbgroup.com', phone: '+254 712 111 222', nationalId: '30123456', employeeNumber: 'KCB-MKR-001', role: 'BANK_MAKER', status: 'Active', avatarColor: AVATAR_COLORS[0], lastLogin: '30 Jul 2026, 09:15', createdDate: '14 Jan 2025' },
  { id: 'bu_002', firstName: 'Caroline', lastName: 'Wanjiku', email: 'caroline.wanjiku@kcbgroup.com', phone: '+254 723 333 444', nationalId: '27890123', employeeNumber: 'KCB-CHK-001', role: 'BANK_CHECKER', status: 'Active', avatarColor: AVATAR_COLORS[1], lastLogin: '30 Jul 2026, 08:42', createdDate: '14 Jan 2025' },
  { id: 'bu_003', firstName: 'Peter', lastName: 'Mutua', email: 'peter.mutua@equitybank.co.ke', phone: '+254 734 555 666', nationalId: '26789012', employeeNumber: 'EQ-MKR-003', role: 'BANK_MAKER', status: 'Active', avatarColor: AVATAR_COLORS[2], lastLogin: '29 Jul 2026, 16:20', createdDate: '02 Mar 2025' },
  { id: 'bu_004', firstName: 'Jane', lastName: 'Kiprop', email: 'jane.kiprop@equitybank.co.ke', phone: '+254 745 777 888', nationalId: '25678901', employeeNumber: 'EQ-CHK-002', role: 'BANK_CHECKER', status: 'Active', avatarColor: AVATAR_COLORS[3], lastLogin: '29 Jul 2026, 14:55', createdDate: '02 Mar 2025' },
  { id: 'bu_005', firstName: 'Samuel', lastName: 'Njoroge', email: 'samuel.njoroge@co-opbank.co.ke', phone: '+254 756 999 000', nationalId: '24567890', employeeNumber: 'COOP-MKR-005', role: 'BANK_MAKER', status: 'Pending', avatarColor: AVATAR_COLORS[4], lastLogin: '—', createdDate: '28 Jul 2026' },
  { id: 'bu_006', firstName: 'Grace', lastName: 'Akello', email: 'grace.akello@ncbagroup.com', phone: '+254 767 111 333', nationalId: '23456789', employeeNumber: 'NCBA-MKR-002', role: 'BANK_MAKER', status: 'Active', avatarColor: AVATAR_COLORS[5], lastLogin: '28 Jul 2026, 11:30', createdDate: '09 Sep 2024' },
  { id: 'bu_007', firstName: 'David', lastName: 'Kiprono', email: 'david.kiprono@stanbicbank.co.ke', phone: '+254 778 444 555', nationalId: '22345678', employeeNumber: 'STBC-CHK-003', role: 'BANK_CHECKER', status: 'Locked', avatarColor: AVATAR_COLORS[6], lastLogin: '12 Jul 2026, 14:22', createdDate: '11 Nov 2025' },
  { id: 'bu_008', firstName: 'Nancy', lastName: 'Wambui', email: 'nancy.wambui@absa.co.ke', phone: '+254 789 666 777', nationalId: '21234567', employeeNumber: 'ABSA-MKR-004', role: 'BANK_MAKER', status: 'Inactive', avatarColor: AVATAR_COLORS[7], lastLogin: '02 Jun 2026, 09:11', createdDate: '20 Jan 2024' },
];

export const pendingApprovals: DistributorApproval[] = [
  { id: 'app_001', companyName: 'Mombasa Hardware Ltd', manufacturerName: 'East Africa Cables', pin: 'P051234567A', registrationNumber: 'REG-2026-00412', submittedDate: '30 Jul 2026', status: 'Pending' },
  { id: 'app_002', companyName: 'Nakuru Building Supplies', manufacturerName: 'Bamburi Cement Ltd', pin: 'P059876543B', registrationNumber: 'REG-2026-00428', submittedDate: '29 Jul 2026', status: 'Pending' },
  { id: 'app_003', companyName: 'Kisumu Traders Co.', manufacturerName: 'Bidco Africa Ltd', pin: 'P051122334C', registrationNumber: 'REG-2026-00435', submittedDate: '28 Jul 2026', status: 'Pending' },
  { id: 'app_004', companyName: 'Eldoret Wholesalers Ltd', manufacturerName: 'Kenya Breweries Ltd', pin: 'P054433221D', registrationNumber: 'REG-2026-00401', submittedDate: '26 Jul 2026', status: 'Pending' },
  { id: 'app_005', companyName: 'Thika Industrial Partners', manufacturerName: 'Mabati Rolling Mills', pin: 'P057788990E', registrationNumber: 'REG-2026-00389', submittedDate: '24 Jul 2026', status: 'Pending' },
];

export const approvedDistributors: ApprovedDistributor[] = [
  { id: 'dist_001', companyName: 'Coast General Supplies', pin: 'P051112223A', creditLimit: 'KES 5,000,000', outstanding: 'KES 2,150,000', availableLimit: 'KES 2,850,000', status: 'Active', makerName: 'James Omonda', checkerName: 'Caroline Wanjiku', approvedDate: '15 Jul 2026' },
  { id: 'dist_002', companyName: 'Rift Valley Traders', pin: 'P054445556B', creditLimit: 'KES 3,500,000', outstanding: 'KES 800,000', availableLimit: 'KES 2,700,000', status: 'Active', makerName: 'Peter Mutua', checkerName: 'Jane Kiprop', approvedDate: '10 Jul 2026' },
  { id: 'dist_003', companyName: 'Central Province Distributors', pin: 'P056667778C', creditLimit: 'KES 8,000,000', outstanding: 'KES 5,200,000', availableLimit: 'KES 2,800,000', status: 'Active', makerName: 'Grace Akello', checkerName: 'Caroline Wanjiku', approvedDate: '05 Jul 2026' },
  { id: 'dist_004', companyName: 'Eastern Region Wholesalers', pin: 'P059990001D', creditLimit: 'KES 2,000,000', outstanding: 'KES 1,950,000', availableLimit: 'KES 50,000', status: 'Active', makerName: 'James Omonda', checkerName: 'David Kiprono', approvedDate: '28 Jun 2026' },
  { id: 'dist_005', companyName: 'Northern Frontier Supplies', pin: 'P052223334E', creditLimit: 'KES 6,000,000', outstanding: 'KES 0', availableLimit: 'KES 6,000,000', status: 'Active', makerName: 'Samuel Njoroge', checkerName: 'Caroline Wanjiku', approvedDate: '20 Jun 2026' },
  { id: 'dist_006', companyName: 'Coastline General Merchants', pin: 'P057776665F', creditLimit: 'KES 4,000,000', outstanding: 'KES 3,100,000', availableLimit: 'KES 900,000', status: 'Inactive', makerName: 'Peter Mutua', checkerName: 'David Kiprono', approvedDate: '15 May 2026' },
];

export const bankDashboardStats = [
  { label: 'Manufacturers', value: '1', delta: 'Enrolled', trend: 'positive' as const, icon: 'manufacturers' as const, href: '/bank/manufacturers' },
  { label: 'Distributors', value: String(approvedDistributors.length), delta: 'Registered', trend: 'positive' as const, icon: 'distributors' as const, href: '/bank/distributors' },
  { label: 'Pending Approvals', value: String(pendingApprovals.length), delta: 'Review needed', trend: 'negative' as const, icon: 'pending' as const, href: '/bank/approvals' },
  { label: 'Bank Users', value: String(bankUsers.length), delta: 'Staff', trend: 'positive' as const, icon: 'bankUsers' as const, href: '/bank/users' },
];


export const bankActivityLog: ActivityLogEntry[] = [
  { id: 'bact_01', actor: 'James Omonda', action: 'Distributor created', target: 'Mombasa Hardware Ltd', time: '15 mins ago', type: 'created' },
  { id: 'bact_02', actor: 'Caroline Wanjiku', action: 'Facility approved', target: 'Rift Valley Traders — KES 3.5M', time: '1 hour ago', type: 'updated' },
  { id: 'bact_03', actor: 'Peter Mutua', action: 'Drawdown request submitted', target: 'Central Coast Distributors — KES 1.2M', time: '3 hours ago', type: 'created' },
  { id: 'bact_04', actor: 'System', action: 'Login failed (3 attempts)', target: 'Nancy Wambui', time: '5 hours ago', type: 'warning' },
  { id: 'bact_05', actor: 'Jane Kiprop', action: 'Password reset', target: 'Samuel Njoroge', time: '1 day ago', type: 'security' },
  { id: 'bact_06', actor: 'Grace Akello', action: 'Credit limit updated', target: 'Northern Frontier Supplies → KES 6M', time: '2 days ago', type: 'updated' },
];

export const bankNotifications: PlatformNotification[] = [
  { id: 'bnot_01', message: '5 new distributor approvals pending review', time: '10 mins ago', type: 'approval' },
  { id: 'bnot_02', message: 'Facility drawdown exceeded 80% — Eastern Cooperative', time: '45 mins ago', type: 'security' },
  { id: 'bnot_03', message: 'New manufacturer onboarding request — Mabati Mills', time: '2 hours ago', type: 'registration' },
  { id: 'bnot_04', message: 'Account locked: David Kiprono (Stanbic)', time: '3 hours ago', type: 'lock' },
  { id: 'bnot_05', message: 'Scheduled system maintenance — Aug 6, 02:00–04:00 EAT', time: '6 hours ago', type: 'system' },
];

export const bankGrowthSeries = [
  { month: 'Jan', distributors: 8, approvals: 12, facilities: 6 },
  { month: 'Feb', distributors: 10, approvals: 15, facilities: 8 },
  { month: 'Mar', distributors: 13, approvals: 18, facilities: 10 },
  { month: 'Apr', distributors: 15, approvals: 20, facilities: 12 },
  { month: 'May', distributors: 18, approvals: 24, facilities: 14 },
  { month: 'Jun', distributors: 20, approvals: 28, facilities: 16 },
  { month: 'Jul', distributors: 24, approvals: 32, facilities: 20 },
];

export const bankPortfolioStats = [
  { label: 'Total Portfolio', value: 'KES 28,500,000', delta: '12%', trend: 'positive' as const, icon: 'portfolio' as const },
  { label: 'Utilized Credit', value: 'KES 13,200,000', delta: '8%', trend: 'negative' as const, icon: 'utilized' as const },
  { label: 'Available Credit', value: 'KES 15,300,000', delta: '5%', trend: 'positive' as const, icon: 'available' as const },
  { label: 'Outstanding Loans', value: 'KES 13,200,000', delta: '3%', trend: 'positive' as const, icon: 'outstanding' as const },
];

export const creditUtilizationData = approvedDistributors.map((d) => ({
  name: d.companyName.split(' ').slice(0, 2).join(' '),
  creditLimit: parseInt(d.creditLimit.replace(/[^0-9]/g, ''), 10),
  outstanding: parseInt(d.outstanding.replace(/[^0-9]/g, ''), 10),
  available: parseInt(d.availableLimit.replace(/[^0-9]/g, ''), 10),
}));

export const reportCards = [
  { label: 'Approved Today', value: '2', icon: 'approved' as const },
  { label: 'Rejected Today', value: '0', icon: 'rejected' as const },
  { label: 'New Registrations', value: '3', icon: 'registrations' as const },
  { label: 'Active Facilities', value: String(approvedDistributors.filter((d) => d.status === 'Active').length), icon: 'facilities' as const },
];