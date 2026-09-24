import type {
  ApprovedDistributor,
} from '@/lib/types';

export interface CreditFacility {
  id: string;
  distributorId: string;
  distributorName: string;
  bankName: string;
  creditLimit: number;
  outstanding: number;
  availableLimit: number;
  interestRate: number;
  status: 'Active' | 'Inactive' | 'Suspended';
  currency: string;
  startDate: string;
  expiryDate: string;
  facilityType: 'Revolving' | 'Term';
}

export interface DrawdownRequest {
  id: string;
  facilityId: string;
  distributorId: string;
  distributorName: string;
  amount: number;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Disbursed';
  requestedDate: string;
  approvedDate?: string;
  disbursedDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface RepaymentScheduleItem {
  id: string;
  facilityId: string;
  distributorId: string;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  status: 'Upcoming' | 'Due' | 'Paid' | 'Overdue' | 'Partial';
  paidDate?: string;
  paidAmount?: number;
  transactionRef?: string;
}

export interface DealerProfile {
  id: string;
  businessName: string;
  tradingName: string;
  taxId: string;
  registrationNumber: string;
  businessType: string;
  industry: string;
  physicalAddress: string;
  postalAddress: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  website?: string;
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
  swiftCode?: string;
  directorName: string;
  directorNationalId: string;
  directorPhone: string;
  directorEmail: string;
  onboardingDate: string;
  status: 'Active' | 'Pending' | 'Suspended';
  kycStatus: 'Verified' | 'Pending' | 'Rejected';
}

const DELAY = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const dealerFacilities: CreditFacility[] = [
  {
    id: 'fac_001',
    distributorId: 'dist_001',
    distributorName: 'Coast General Supplies',
    bankName: 'KCB Bank',
    creditLimit: 5000000,
    outstanding: 2150000,
    availableLimit: 2850000,
    interestRate: 13.5,
    status: 'Active',
    currency: 'KES',
    startDate: '15 Jul 2026',
    expiryDate: '15 Jul 2027',
    facilityType: 'Revolving',
  },
  {
    id: 'fac_002',
    distributorId: 'dist_002',
    distributorName: 'Rift Valley Traders',
    bankName: 'Equity Bank',
    creditLimit: 3500000,
    outstanding: 800000,
    availableLimit: 2700000,
    interestRate: 12.8,
    status: 'Active',
    currency: 'KES',
    startDate: '10 Jul 2026',
    expiryDate: '10 Jul 2027',
    facilityType: 'Revolving',
  },
  {
    id: 'fac_003',
    distributorId: 'dist_003',
    distributorName: 'Central Province Distributors',
    bankName: 'Co-operative Bank',
    creditLimit: 8000000,
    outstanding: 5200000,
    availableLimit: 2800000,
    interestRate: 14.2,
    status: 'Active',
    currency: 'KES',
    startDate: '05 Jul 2026',
    expiryDate: '05 Jul 2027',
    facilityType: 'Revolving',
  },
];

export const drawdownHistory: DrawdownRequest[] = [
  {
    id: 'dd_001',
    facilityId: 'fac_001',
    distributorId: 'dist_001',
    distributorName: 'Coast General Supplies',
    amount: 1200000,
    purpose: 'Inventory restocking - electrical cables',
    status: 'Disbursed',
    requestedDate: '20 Jul 2026',
    approvedDate: '21 Jul 2026',
    disbursedDate: '22 Jul 2026',
    approvedBy: 'James Omondi',
  },
  {
    id: 'dd_002',
    facilityId: 'fac_001',
    distributorId: 'dist_001',
    distributorName: 'Coast General Supplies',
    amount: 950000,
    purpose: 'Bulk purchase - PVC conduits',
    status: 'Disbursed',
    requestedDate: '25 Jul 2026',
    approvedDate: '26 Jul 2026',
    disbursedDate: '26 Jul 2026',
    approvedBy: 'Caroline Wanjiku',
  },
  {
    id: 'dd_003',
    facilityId: 'fac_002',
    distributorId: 'dist_002',
    distributorName: 'Rift Valley Traders',
    amount: 500000,
    purpose: 'Seasonal stock - cement',
    status: 'Disbursed',
    requestedDate: '15 Jul 2026',
    approvedDate: '16 Jul 2026',
    disbursedDate: '17 Jul 2026',
    approvedBy: 'Peter Mutua',
  },
  {
    id: 'dd_004',
    facilityId: 'fac_003',
    distributorId: 'dist_003',
    distributorName: 'Central Province Distributors',
    amount: 2500000,
    purpose: 'New product line - solar panels',
    status: 'Approved',
    requestedDate: '28 Jul 2026',
    approvedDate: '29 Jul 2026',
    approvedBy: 'Grace Akello',
  },
  {
    id: 'dd_005',
    facilityId: 'fac_001',
    distributorId: 'dist_001',
    distributorName: 'Coast General Supplies',
    amount: 800000,
    purpose: 'Emergency restock - switchgear',
    status: 'Pending',
    requestedDate: '30 Jul 2026',
  },
];

export const repaymentSchedules: RepaymentScheduleItem[] = [
  {
    id: 'rs_001',
    facilityId: 'fac_001',
    distributorId: 'dist_001',
    dueDate: '15 Aug 2026',
    principalAmount: 150000,
    interestAmount: 24188,
    totalAmount: 174188,
    status: 'Upcoming',
  },
  {
    id: 'rs_002',
    facilityId: 'fac_001',
    distributorId: 'dist_001',
    dueDate: '15 Sep 2026',
    principalAmount: 150000,
    interestAmount: 22463,
    totalAmount: 172463,
    status: 'Upcoming',
  },
  {
    id: 'rs_003',
    facilityId: 'fac_001',
    distributorId: 'dist_001',
    dueDate: '15 Jul 2026',
    principalAmount: 150000,
    interestAmount: 25875,
    totalAmount: 175875,
    status: 'Paid',
    paidDate: '14 Jul 2026',
    paidAmount: 175875,
    transactionRef: 'TXN-2026-0714-001',
  },
  {
    id: 'rs_004',
    facilityId: 'fac_001',
    distributorId: 'dist_001',
    dueDate: '15 Jun 2026',
    principalAmount: 150000,
    interestAmount: 27250,
    totalAmount: 177250,
    status: 'Paid',
    paidDate: '14 Jun 2026',
    paidAmount: 177250,
    transactionRef: 'TXN-2026-0614-001',
  },
  {
    id: 'rs_005',
    facilityId: 'fac_002',
    distributorId: 'dist_002',
    dueDate: '10 Aug 2026',
    principalAmount: 100000,
    interestAmount: 8533,
    totalAmount: 108533,
    status: 'Upcoming',
  },
  {
    id: 'rs_006',
    facilityId: 'fac_003',
    distributorId: 'dist_003',
    dueDate: '05 Aug 2026',
    principalAmount: 200000,
    interestAmount: 30500,
    totalAmount: 230500,
    status: 'Upcoming',
  },
];

export const dealerProfile: DealerProfile = {
  id: 'dist_001',
  businessName: 'Coast General Supplies Limited',
  tradingName: 'Coast General Supplies',
  taxId: 'P051112223A',
  registrationNumber: 'CPR/2018/123456',
  businessType: 'Private Limited Company',
  industry: 'Wholesale - Electrical & Construction Materials',
  physicalAddress: 'Plot 45, Mombasa Road, Industrial Area, Mombasa, Kenya',
  postalAddress: 'P.O. Box 80450 - 80100, Mombasa, Kenya',
  contactPerson: 'Mr. Hassan Ali',
  contactPhone: '+254 722 444 555',
  contactEmail: 'hassan.ali@coastgeneral.co.ke',
  website: 'www.coastgeneral.co.ke',
  bankName: 'KCB Bank',
  bankBranch: 'Mombasa Treasury Square',
  accountName: 'Coast General Supplies Limited',
  accountNumber: '1234567890',
  swiftCode: 'KCBLKENX',
  directorName: 'Mr. Hassan Ali',
  directorNationalId: '27834501',
  directorPhone: '+254 722 444 555',
  directorEmail: 'hassan.ali@coastgeneral.co.ke',
  onboardingDate: '15 Jul 2026',
  status: 'Active',
  kycStatus: 'Verified',
};

export const dealerMockService = {
  async getFacilities(distributorId?: string): Promise<CreditFacility[]> {
    await DELAY();
    let list = [...dealerFacilities];
    if (distributorId) {
      list = list.filter((f) => f.distributorId === distributorId);
    }
    return list;
  },

  async getFacility(id: string): Promise<CreditFacility | undefined> {
    await DELAY(200);
    return dealerFacilities.find((f) => f.id === id);
  },

  async getDrawdownHistory(facilityId?: string): Promise<DrawdownRequest[]> {
    await DELAY();
    let list = [...drawdownHistory].sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime());
    if (facilityId) {
      list = list.filter((d) => d.facilityId === facilityId);
    }
    return list;
  },

  async requestDrawdown(payload: { facilityId: string; amount: number; purpose: string }): Promise<DrawdownRequest> {
    await DELAY(600);
    const facility = dealerFacilities.find((f) => f.id === payload.facilityId);
    if (!facility) throw new Error('Facility not found');
    if (payload.amount > facility.availableLimit) throw new Error('Amount exceeds available limit');

    const newDrawdown: DrawdownRequest = {
      id: `dd_${Date.now()}`,
      facilityId: payload.facilityId,
      distributorId: facility.distributorId,
      distributorName: facility.distributorName,
      amount: payload.amount,
      purpose: payload.purpose,
      status: 'Pending',
      requestedDate: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
    };
    drawdownHistory.unshift(newDrawdown);
    return newDrawdown;
  },

  async getRepaymentSchedule(facilityId: string): Promise<RepaymentScheduleItem[]> {
    await DELAY();
    return repaymentSchedules
      .filter((r) => r.facilityId === facilityId)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },

  async makeRepayment(payload: { facilityId: string; scheduleId: string; amount: number }): Promise<{ success: boolean; transactionRef: string }> {
    await DELAY(800);
    const schedule = repaymentSchedules.find((r) => r.id === payload.scheduleId && r.facilityId === payload.facilityId);
    if (!schedule) throw new Error('Repayment schedule not found');
    if (schedule.status === 'Paid') throw new Error('Already paid');
    if (payload.amount !== schedule.totalAmount) throw new Error('Partial payments not supported in demo');

    schedule.status = 'Paid';
    schedule.paidDate = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
    schedule.paidAmount = payload.amount;
    schedule.transactionRef = `TXN-${Date.now()}`;

    const facility = dealerFacilities.find((f) => f.id === payload.facilityId);
    if (facility) {
      facility.outstanding -= schedule.principalAmount;
      facility.availableLimit += schedule.principalAmount;
    }

    return { success: true, transactionRef: schedule.transactionRef };
  },

  async getProfile(distributorId: string): Promise<DealerProfile | undefined> {
    await DELAY(200);
    return dealerProfile.id === distributorId ? dealerProfile : undefined;
  },

  async updateProfile(distributorId: string, updates: Partial<DealerProfile>): Promise<DealerProfile> {
    await DELAY(500);
    Object.assign(dealerProfile, updates);
    return { ...dealerProfile };
  },
};