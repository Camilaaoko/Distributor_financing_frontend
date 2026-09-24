import type { BusinessInfoPayload, OnboardingApplicationPayload, OnboardingStatusResponse } from '@/services/onboarding.service';
import type { ManufacturerResponse } from '@/types/onboarding';
import type {

  DistributorRecommendation,
  CreateRecommendationPayload,
  ReviewRecommendationPayload,
  ManufacturerUser,
  CreateManufacturerUserPayload,
  UpdateManufacturerUserPayload,
  DistributorUser,
  CreateDistributorUserPayload,
  UpdateDistributorUserPayload,
  Bank,
  CreateBankPayload,
  UpdateBankPayload,
  BankAdminPayload,
} from '@/services/onboarding.service';

export interface OnboardingApplication {
  id: string;
  businessName: string;
  taxId: string;
  registrationNumber: string;
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
  manufacturerId: string;
  manufacturerName: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'More Info Required';
  submittedDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

const DELAY = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const onboardingApplications: OnboardingApplication[] = [
  {
    id: 'app_001',
    businessName: 'Coast General Supplies Limited',
    taxId: 'P051112223A',
    registrationNumber: 'CPR/2018/123456',
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
    manufacturerId: 'mfg_001',
    manufacturerName: 'East Africa Cables Ltd',
    status: 'Approved',
    submittedDate: '10 Jul 2026',
    reviewedDate: '15 Jul 2026',
    reviewedBy: 'James Omondi',
  },
  {
    id: 'app_002',
    businessName: 'Rift Valley Traders Limited',
    taxId: 'P054445556B',
    registrationNumber: 'CPR/2019/789012',
    physicalAddress: 'Plot 12, Nakuru Industrial Park, Nakuru, Kenya',
    postalAddress: 'P.O. Box 12450 - 20100, Nakuru, Kenya',
    contactPerson: 'Ms. Grace Wanjiku',
    contactPhone: '+254 733 666 777',
    contactEmail: 'grace.wanjiku@riftvalleytraders.co.ke',
    bankName: 'Equity Bank',
    bankBranch: 'Nakuru Branch',
    accountName: 'Rift Valley Traders Limited',
    accountNumber: '0987654321',
    directorName: 'Ms. Grace Wanjiku',
    directorNationalId: '25678901',
    directorPhone: '+254 733 666 777',
    directorEmail: 'grace.wanjiku@riftvalleytraders.co.ke',
    manufacturerId: 'mfg_002',
    manufacturerName: 'Bamburi Cement Ltd',
    status: 'Approved',
    submittedDate: '05 Jul 2026',
    reviewedDate: '10 Jul 2026',
    reviewedBy: 'Peter Mutua',
  },
];

export const manufacturers = [
  { id: 'mfg_001', name: 'East Africa Cables Ltd', industry: 'Electrical Cables Manufacturing' },
  { id: 'mfg_002', name: 'Bamburi Cement Ltd', industry: 'Cement Manufacturing' },
  { id: 'mfg_003', name: 'Bidco Africa Ltd', industry: 'FMCG Manufacturing' },
  { id: 'mfg_004', name: 'Kenya Breweries Ltd', industry: 'Beverage Manufacturing' },
  { id: 'mfg_005', name: 'Mabati Rolling Mills', industry: 'Steel Manufacturing' },
];

// Mock data for new backend endpoints
export const mockDistributorRecommendations: DistributorRecommendation[] = [
  { id: 'rec_001', distributorName: 'ABC Distributors Ltd', email: 'abc@distributors.com', phoneNumber: '+254 700 111 222', status: 'PENDING', createdAt: '2026-07-01T10:00:00Z' },
  { id: 'rec_002', distributorName: 'XYZ Trading Co', email: 'xyz@trading.com', phoneNumber: '+254 700 333 444', status: 'APPROVED', createdAt: '2026-06-15T14:30:00Z' },
];

export const mockManufacturerUsers: ManufacturerUser[] = [
  { id: 'mfg_user_001', businessPermitNumber: 'BP001', manufacturerName: 'East Africa Cables Ltd', firstName: 'John', lastName: 'Kamau', email: 'john.kamau@eacables.com', phoneNumber: '+254 711 222 333', nationalIdNumber: '12345678', employeeId: 'EMP001', role: 'MANUFACTURER_MAKER', kycStatus: 'APPROVED', status: 'ACTIVE', credentialsIssued: true, createdAt: '2026-01-15T08:00:00Z' },
  { id: 'mfg_user_002', businessPermitNumber: 'BP002', manufacturerName: 'Bamburi Cement Ltd', firstName: 'Mary', lastName: 'Wanjiru', email: 'mary.wanjiru@bamburi.com', phoneNumber: '+254 711 444 555', nationalIdNumber: '23456789', employeeId: 'EMP002', role: 'MANUFACTURER_CHECKER', kycStatus: 'APPROVED', status: 'ACTIVE', credentialsIssued: true, createdAt: '2026-02-20T09:00:00Z' },
];

export const mockDistributorUsers: DistributorUser[] = [
  { id: 'dist_user_001', recommendationId: 'rec_001', businessPermitNumber: 'BP100', firstName: 'Peter', lastName: 'Omondi', email: 'peter.omondi@abc.com', phoneNumber: '+254 722 111 222', nationalIdNumber: '34567890', employeeId: 'EMP100', role: 'DISTRIBUTOR_MAKER', kycStatus: 'APPROVED', status: 'ACTIVE', credentialsIssued: true, createdAt: '2026-03-10T10:00:00Z' },
  { id: 'dist_user_002', recommendationId: 'rec_002', businessPermitNumber: 'BP101', firstName: 'Jane', lastName: 'Wambui', email: 'jane.wambui@xyz.com', phoneNumber: '+254 722 333 444', nationalIdNumber: '45678901', employeeId: 'EMP101', role: 'DISTRIBUTOR_CHECKER', kycStatus: 'APPROVED', status: 'ACTIVE', credentialsIssued: true, createdAt: '2026-04-05T11:00:00Z' },
];

export const mockBanks: Bank[] = [
  { id: 'bank_001', name: 'KCB Bank', bankCode: '01', branch: 'Head Office', branchCode: '001', location: 'Nairobi', status: 'ACTIVE', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'bank_002', name: 'Equity Bank', bankCode: '68', branch: 'Head Office', branchCode: '001', location: 'Nairobi', status: 'ACTIVE', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'bank_003', name: 'Co-op Bank', bankCode: '11', branch: 'Head Office', branchCode: '001', location: 'Nairobi', status: 'PENDING', createdAt: '2026-06-01T00:00:00Z' },
];


export const onboardingMockService = {
  // Original methods
  async submitBusinessInfo(payload: BusinessInfoPayload): Promise<{ applicationId: string }> {
    await DELAY(500);
    return { applicationId: `app_${Date.now()}` };
  },

  async submitApplication(payload: OnboardingApplicationPayload): Promise<{ applicationId: string; status: string }> {
    await DELAY(800);
    const fullName = `${payload.firstName || ''} ${payload.lastName || ''}`.trim();
    const application: OnboardingApplication = {
      id: `app_${Date.now()}`,
      businessName: payload.distributorName || 'Distributor Application',
      taxId: 'N/A',
      registrationNumber: payload.registrationNumber || '',
      physicalAddress: payload.branchAddress || '',
      postalAddress: payload.branchAddress || '',
      contactPerson: fullName,
      contactPhone: payload.contactPhone || '',
      contactEmail: payload.contactEmail || '',
      website: '',
      bankName: payload.hasExistingBankAccount ? 'Existing Bank Account' : 'New Account Requested',
      bankBranch: payload.branchAddress || '',
      accountName: payload.distributorName || '',
      accountNumber: payload.hasExistingBankAccount ? payload.existingAccountNumber : 'PENDING_CREATION',
      swiftCode: payload.hasExistingBankAccount ? 'EXISTING' : 'N/A',
      directorName: fullName,
      directorNationalId: payload.nationalId || '',
      directorPhone: payload.contactPhone || '',
      directorEmail: payload.contactEmail || '',
      manufacturerId: payload.manufacturerId || '',
      manufacturerName: manufacturers.find((m) => m.id === payload.manufacturerId)?.name ?? 'Partner Manufacturer',
      status: 'Submitted',
      submittedDate: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
    };
    onboardingApplications.unshift(application);
    return { applicationId: application.id, status: application.status };
  },

  async getStatus(applicationId: string): Promise<OnboardingStatusResponse | undefined> {
    await DELAY(200);
    const app = onboardingApplications.find((a) => a.id === applicationId);
    if (!app) return undefined;
    return {
      id: app.id,
      businessName: app.businessName,
      status: app.status,
      submittedDate: app.submittedDate,
      reviewedDate: app.reviewedDate,
      reviewedBy: app.reviewedBy,
      rejectionReason: app.rejectionReason,
    };
  },

  async getApplicationStatus(applicationId: string): Promise<OnboardingStatusResponse | undefined> {
    return this.getStatus(applicationId);
  },

  async getManufacturers(): Promise<ManufacturerResponse[]> {
    await DELAY(200);
    return manufacturers.map((m) => ({
      id: m.id,
      name: m.name,
      industry: m.industry,
      status: 'ACTIVE' as const,
      accountNumber: '0112984716200',
      location: 'Nairobi',
      createdAt: '2026-01-01T00:00:00Z',
    }));

  },

  // Distributor Recommendations

  async getDistributorRecommendations(): Promise<DistributorRecommendation[]> {
    await DELAY(200);
    return [...mockDistributorRecommendations];
  },

  async createDistributorRecommendation(payload: CreateRecommendationPayload): Promise<DistributorRecommendation> {
    await DELAY(500);
    const newRec: DistributorRecommendation = {
      id: `rec_${Date.now()}`,
      distributorName: payload.distributorName || 'Distributor',
      email: payload.email || '',
      phoneNumber: payload.phoneNumber || '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    mockDistributorRecommendations.unshift(newRec);
    return newRec;
  },

  async reviewDistributorRecommendation(payload: ReviewRecommendationPayload): Promise<DistributorRecommendation> {
    await DELAY(500);
    const idx = mockDistributorRecommendations.findIndex(r => r.id === payload.recommendationId);
    if (idx === -1) throw new Error('Recommendation not found');
    mockDistributorRecommendations[idx].status = payload.approve ? 'APPROVED' : 'REJECTED';
    return mockDistributorRecommendations[idx];
  },

  // Manufacturer Users
  async getManufacturerUsers(): Promise<ManufacturerUser[]> {
    await DELAY(200);
    return [...mockManufacturerUsers];
  },

  async getManufacturerUser(id: string): Promise<ManufacturerUser | undefined> {
    await DELAY(200);
    return mockManufacturerUsers.find(u => u.id === id);
  },

  async createManufacturerUser(payload: CreateManufacturerUserPayload): Promise<ManufacturerUser> {
    await DELAY(500);
    const newUser: ManufacturerUser = {
      id: `mfg_user_${Date.now()}`,
      businessPermitNumber: payload.businessPermitNumber,
      manufacturerName: payload.manufacturerName,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      nationalIdNumber: payload.nationalIdNumber,
      employeeId: payload.employeeId,
      role: payload.role || 'MANUFACTURER_MAKER',
      kycStatus: 'PENDING',

      status: 'PENDING',
      credentialsIssued: false,
      createdAt: new Date().toISOString(),
    };
    mockManufacturerUsers.unshift(newUser);
    return newUser;
  },

  async updateManufacturerUser(id: string, payload: UpdateManufacturerUserPayload): Promise<ManufacturerUser> {
    await DELAY(500);
    const idx = mockManufacturerUsers.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Manufacturer user not found');
    mockManufacturerUsers[idx] = { ...mockManufacturerUsers[idx], ...payload };
    return mockManufacturerUsers[idx];
  },

  async patchManufacturerUser(id: string, payload: UpdateManufacturerUserPayload): Promise<ManufacturerUser> {
    return this.updateManufacturerUser(id, payload);
  },

  async deleteManufacturerUser(id: string): Promise<void> {
    await DELAY(500);
    const idx = mockManufacturerUsers.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Manufacturer user not found');
    mockManufacturerUsers.splice(idx, 1);
  },

  // Distributor Users
  async getDistributorUsers(): Promise<DistributorUser[]> {
    await DELAY(200);
    return [...mockDistributorUsers];
  },

  async getDistributorUser(id: string): Promise<DistributorUser | undefined> {
    await DELAY(200);
    return mockDistributorUsers.find(u => u.id === id);
  },

  async createDistributorUser(payload: CreateDistributorUserPayload): Promise<DistributorUser> {
    await DELAY(500);
    const newUser: DistributorUser = {
      id: `dist_user_${Date.now()}`,
      recommendationId: payload.recommendationId,
      businessPermitNumber: payload.businessPermitNumber,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      nationalIdNumber: payload.nationalIdNumber,
      employeeId: payload.employeeId,
      role: payload.role || 'DISTRIBUTOR_MAKER',
      kycStatus: 'PENDING',

      status: 'PENDING',
      credentialsIssued: false,
      createdAt: new Date().toISOString(),
    };
    mockDistributorUsers.unshift(newUser);
    return newUser;
  },

  async updateDistributorUser(id: string, payload: UpdateDistributorUserPayload): Promise<DistributorUser> {
    await DELAY(500);
    const idx = mockDistributorUsers.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Distributor user not found');
    mockDistributorUsers[idx] = { ...mockDistributorUsers[idx], ...payload };
    return mockDistributorUsers[idx];
  },

  async patchDistributorUser(id: string, payload: UpdateDistributorUserPayload): Promise<DistributorUser> {
    return this.updateDistributorUser(id, payload);
  },

  async deleteDistributorUser(id: string): Promise<void> {
    await DELAY(500);
    const idx = mockDistributorUsers.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Distributor user not found');
    mockDistributorUsers.splice(idx, 1);
  },

  // Banks
  async getBanks(status?: string): Promise<Bank[]> {
    await DELAY(200);
    let list = [...mockBanks];
    if (status) list = list.filter(b => b.status === status);
    return list;
  },

  async createBank(payload: CreateBankPayload): Promise<Bank> {
    await DELAY(500);
    const newBank: Bank = {
      id: `bank_${Date.now()}`,
      name: (payload as any).bankName || (payload as any).name || payload.bankCode || 'Partner Bank',
      bankCode: payload.bankCode || '01',
      branch: (payload as any).branchName || (payload as any).branch || payload.branchCode || 'Main Branch',
      branchCode: payload.branchCode || '001',
      location: 'Nairobi',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    mockBanks.unshift(newBank);
    return newBank;
  },

  async updateBank(id: string, payload: UpdateBankPayload): Promise<Bank> {
    await DELAY(500);
    const idx = mockBanks.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Bank not found');
    mockBanks[idx] = { ...mockBanks[idx], ...payload };
    return mockBanks[idx];
  },

  async deleteBank(id: string): Promise<void> {
    await DELAY(500);
    const idx = mockBanks.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Bank not found');
    mockBanks.splice(idx, 1);
  },

  async setBankStatus(id: string, status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED'): Promise<void> {
    await DELAY(500);
    const idx = mockBanks.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Bank not found');
    mockBanks[idx].status = status;
  },

  // Bank Admins
  async createBankAdmin(payload: BankAdminPayload): Promise<{ message: string; success: boolean }> {
    await DELAY(500);
    return { message: 'Bank admin created successfully', success: true };
  },

  // Bank Users
  async createBankUser(payload: { firstName: string; lastName: string; email: string; phoneNumber: string; nationalIdNumber: string; employeeId: string; role: string }): Promise<{ message: string; success: boolean }> {
    await DELAY(500);
    return { message: 'Bank user created successfully', success: true };
  },
};