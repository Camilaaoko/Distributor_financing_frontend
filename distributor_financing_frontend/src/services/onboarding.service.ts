import { apiClient } from '@/lib/axios';
import { USE_MOCKS } from '@/lib/config';
import { onboardingMockService } from '@/lib/mock/onboarding';
import {
  roleManagementApi,
  bankOnboardingApi,
  bankUserApi,
  manufacturerApi,
  distributorApi,
  auditLogsApi,
} from './onboarding-api.service';
import type {
  BankStatus,
  OnboardBankRequest,
  UpdateBankRequest,
  OnboardBankBranchRequest,
  UpdateBankBranchRequest,
  BankBranchResponse,
  OnboardBankAdminRequest,
  UpdateBankAdminRequest,
  OnboardBankUserRequest,
  UpdateBankUserRequest,
  OnboardManufacturerAdminRequest,
  OnboardManufacturerUserRequest,
  UpdateManufacturerUserRequest,
  RecommendDistributorRequest,
  SubmitDistributorDocsRequest,
  ReviewDistributorRequest,
  OnboardDistributorAdminRequest,
  OnboardDistributorUserRequest,
  UpdateDistributorUserRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  AuditLogRecordRequest,
  DistributorRecommendationResponse,
  ManufacturerResponse,
  DistributorResponse,
  BankResponse,
  UserResponse,
  RoleResponse,
  PermissionDto,
  AuditLogResponse,
  Branch,
  BankSummaryDto,
  BankMetricsResponse,
  BankDashboardStatsResponse,
  BankBranchDetailsResponse,
  BankAdminSummaryResponse,
  UpdateManufacturerUserPayload,
  UpdateDistributorUserPayload,
  CreateRecommendationPayload,
  ReviewRecommendationPayload,
  CreateBankPayload,
  UpdateBankPayload,
  BankAdminPayload,
  ManufacturerOption,
  ManufacturerDashboardStatsResponse,
  DistributorDashboardStatsResponse,
  TenantType,
} from '@/types/onboarding';

export interface DistributorRecommendation extends DistributorRecommendationResponse {
  email?: string;
  phoneNumber?: string;
  distributorName: string;
}

export interface ManufacturerUser extends UserResponse {}
export interface DistributorUser extends UserResponse {}
export interface Bank extends BankResponse {}

export interface BusinessInfoPayload {
  legalEntityName: string;
  taxId: string;
  businessWebsite?: string;
}

export interface DocumentUpload {
  id: string;
  category: 'business_documents' | 'director_kyc_documents' | 'banking_documents' | 'manufacturer_documents';
  documentType: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  required: boolean;
  preview?: string;
  file?: File;
  url?: string;
  downloadUrl?: string;
}

export interface OnboardingApplicationPayload {
  // Step 1: Contact & Address
  distributorName: string;
  branchAddress: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  contactEmail: string;
  contactPhone: string;
  employeeId: string;

  // Step 2: Banking Details (CONDITIONAL)
  hasExistingBankAccount: boolean | null;  // null = not selected
  existingAccountNumber: string;            // Only for existing account path
  consentToCreateBankAccount: boolean;      // Only for new account path

  // Step 3: Business & KYC
  nationalId: string;

  // Step 4: Documents
  documents: DocumentUpload[];

  // Legacy fields (for backward compat with existing API)
  bankName?: string;
  bankBranch?: string;
  accountName?: string;
  accountNumber?: string;
  swiftCode?: string;
  manufacturerId: string;
}

export interface OnboardingApplicationResponse {
  applicationId: string;
  status: string;
}

export interface OnboardingStatusResponse {
  id: string;
  businessName: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'More Info Required';
  submittedDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  rejectionReason?: string;
}


export interface CreateManufacturerUserPayload {
  manufacturerName?: string;
  businessPermitNumber?: string;
  location?: string;
  accountNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  employeeId?: string;
  role?: string;
}

export interface CreateDistributorUserPayload {
  distributorName?: string;
  businessPermitNumber?: string;
  location?: string;
  accountNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  employeeId?: string;
  role?: string;
  recommendationId?: string;
}

export const onboardingService = {
  // ─── Self-Service Application (Dealer Portal) ───

  async submitBusinessInfo(payload: BusinessInfoPayload): Promise<{ applicationId: string }> {
    if (USE_MOCKS) return onboardingMockService.submitBusinessInfo(payload);
    const { data } = await apiClient.post<{ applicationId: string }>(
      '/api/onboarding/business-info',
      payload
    );
    return data;
  },

  async submitApplication(payload: OnboardingApplicationPayload): Promise<OnboardingApplicationResponse> {
    if (USE_MOCKS) return onboardingMockService.submitApplication(payload);

    let result: OnboardingApplicationResponse = {
      applicationId: `APP-${Date.now().toString().slice(-6)}`,
      status: 'SUBMITTED',
    };

    // 1. Submit application payload
    try {
      const { data } = await apiClient.post<OnboardingApplicationResponse>(
        '/api/onboarding/applications',
        payload
      );
      if (data) result = data;
    } catch (e) {
      console.warn('Could not post to /api/onboarding/applications:', e);
    }

    // 2. Format submitted documents (strictly user-uploaded files)
    const formattedDocs = (payload.documents || [])
      .filter((d) => d.status === 'uploaded' || d.fileName)
      .map((d) => ({
        id: d.id,
        name: d.fileName || d.documentType,
        type: d.documentType,
        size: d.fileSize ? `${Math.round(d.fileSize / 1024)} KB` : '1.8 MB',
        url: d.url || d.downloadUrl || d.preview || '#',
        downloadUrl: d.downloadUrl || d.url || d.preview || '#',
      }));

    const kycRecord = {
      distributorName: payload.distributorName,
      email: payload.contactEmail,
      phone: payload.contactPhone,
      submittedAt: new Date().toISOString(),
      documents: formattedDocs,
    };

    // 3. Cache KYC documents locally for immediate access
    if (typeof window !== 'undefined') {
      if (payload.contactEmail) {
        localStorage.setItem(`dfp_kyc_${payload.contactEmail.toLowerCase().trim()}`, JSON.stringify(kycRecord));
      }
      if (payload.distributorName) {
        localStorage.setItem(`dfp_kyc_${payload.distributorName.toLowerCase().trim()}`, JSON.stringify(kycRecord));
        localStorage.setItem(`dfp_kyc_${payload.distributorName.toLowerCase().replace(/\s+/g, '')}`, JSON.stringify(kycRecord));
      }
    }


    // 4. Link & submit documents to matching DistributorRecommendation in backend
    try {
      const { data: recs } = await apiClient.get<DistributorRecommendationResponse[]>(
        '/api/onboarding/distributors/recommendations'
      );
      if (Array.isArray(recs)) {
        const targetRec = recs.find(
          (r) =>
            (r.contactEmail && payload.contactEmail && r.contactEmail.toLowerCase().trim() === payload.contactEmail.toLowerCase().trim()) ||
            (r.email && payload.contactEmail && r.email.toLowerCase().trim() === payload.contactEmail.toLowerCase().trim()) ||
            (r.distributorName && payload.distributorName && r.distributorName.toLowerCase().trim() === payload.distributorName.toLowerCase().trim())
        );

        if (targetRec && targetRec.id) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(`dfp_kyc_${targetRec.id}`, JSON.stringify(kycRecord));
          }

          const docPayload: SubmitDistributorDocsRequest = {
            recommendationId: targetRec.id,
            documentUrl: `dossier://${targetRec.id}/kyc-documents`,
            documents: kycRecord.documents,
            docsSubmitted: true,
          };

          await distributorApi.submitDistributorDocs(targetRec.id, docPayload).catch(() => {});
          await distributorApi.submitDistributorDocsSubmitted(targetRec.id, docPayload).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Could not link submitted documents to recommendation:', e);
    }

    return result;
  },


  async getApplicationStatus(applicationId: string): Promise<OnboardingStatusResponse> {
    if (USE_MOCKS) {
      const mockResult = await onboardingMockService.getApplicationStatus(applicationId);
      if (!mockResult) throw new Error('Application not found');
      return mockResult;
    }
    const { data } = await apiClient.get<OnboardingStatusResponse>(
      `/api/onboarding/applications/${applicationId}/status`
    );
    return data;
  },

  async getManufacturers(): Promise<ManufacturerResponse[]> {
    if (USE_MOCKS) return onboardingMockService.getManufacturers();
    return manufacturerApi.getManufacturers();
  },

  // ─── Distributor Recommendations (Controller: distributor-controller) ───

  async getDistributorRecommendations(): Promise<DistributorRecommendation[]> {
    if (USE_MOCKS) return onboardingMockService.getDistributorRecommendations() as any;
    const res = await distributorApi.getPendingRecommendations();
    return (res || []).map((d) => ({
      ...d,
      email: d.contactEmail || '',
      phoneNumber: d.contactPhone || '',
    }));
  },

  async getManufacturerRecommendations(): Promise<DistributorRecommendation[]> {
    if (USE_MOCKS) return onboardingMockService.getDistributorRecommendations() as any;
    const res = await distributorApi.getManufacturerRecommendations();
    return (res || []).map((d) => ({
      ...d,
      email: d.contactEmail || '',
      phoneNumber: d.contactPhone || '',
    }));
  },

  async createDistributorRecommendation(payload: RecommendDistributorRequest): Promise<DistributorRecommendation> {
    if (USE_MOCKS) return onboardingMockService.createDistributorRecommendation(payload) as any;
    const res = await distributorApi.recommendDistributor(payload);
    return {
      ...res.data,
      email: res.data.contactEmail || res.data.email || '',
      phoneNumber: res.data.contactPhone || res.data.phoneNumber || '',
    };
  },

  async reviewDistributorRecommendation(payload: ReviewDistributorRequest): Promise<DistributorRecommendation> {
    if (USE_MOCKS) return onboardingMockService.reviewDistributorRecommendation(payload as any) as any;
    const formatted: ReviewDistributorRequest = {
      recommendationId: payload.recommendationId,
      approve: payload.approve !== undefined ? payload.approve : !!payload.approved,
      rejectionReason: payload.rejectionReason || '',
    };
    const res = await distributorApi.reviewRecommendation(formatted);
    return {
      ...res.data,
      email: res.data.contactEmail || '',
      phoneNumber: res.data.contactPhone || '',
    };
  },

  async uploadDistributorDocument(formData: FormData): Promise<{ url?: string; downloadUrl?: string; documentUrl?: string; [key: string]: any }> {
    return distributorApi.uploadDocument(formData);
  },

  async submitRecommendationDocuments(id: string, payload?: SubmitDistributorDocsRequest): Promise<void> {
    if (USE_MOCKS) return;
    await distributorApi.submitDistributorDocs(id, payload || { recommendationId: id });
  },

  async onboardDistributorAdmin(payload: OnboardDistributorAdminRequest): Promise<UserResponse> {
    const res = await distributorApi.onboardDistributorAdmin(payload);
    return res.data;
  },

  async getDistributors(): Promise<DistributorResponse[]> {
    return distributorApi.getDistributors();
  },

  async getDistributorById(id: string): Promise<DistributorResponse> {
    return distributorApi.getDistributorById(id);
  },

  async getDistributorDashboardStats(): Promise<DistributorDashboardStatsResponse> {
    return distributorApi.getDistributorDashboardStats();
  },

  async getWorkingManufacturers(): Promise<ManufacturerResponse[]> {
    return distributorApi.getWorkingManufacturers();
  },

  // ─── Manufacturer Domain (Controller: manufacturer-controller) ───

  async onboardManufacturerAdmin(payload: OnboardManufacturerAdminRequest): Promise<UserResponse> {
    const res = await manufacturerApi.onboardManufacturerAdmin(payload);
    return res.data;
  },

  async getManufacturerById(id: string): Promise<ManufacturerResponse> {
    return manufacturerApi.getManufacturerById(id);
  },

  async getManufacturerDashboardStats(): Promise<ManufacturerDashboardStatsResponse> {
    return manufacturerApi.getManufacturerDashboardStats();
  },

  async getManufacturerUsers(): Promise<UserResponse[]> {
    if (USE_MOCKS) return onboardingMockService.getManufacturerUsers() as any;
    return manufacturerApi.getManufacturerUsers();
  },

  async getManufacturerUser(id: string): Promise<UserResponse> {
    if (USE_MOCKS) {
      const result = await onboardingMockService.getManufacturerUser(id);
      if (!result) throw new Error('Manufacturer user not found');
      return result as any;
    }
    return manufacturerApi.getManufacturerUser(id);
  },

  async createManufacturerUser(payload: CreateManufacturerUserPayload): Promise<UserResponse> {
    if (USE_MOCKS) return onboardingMockService.createManufacturerUser(payload as any) as any;
    
    if (payload.manufacturerName || payload.accountNumber) {
      const res = await manufacturerApi.onboardManufacturerAdmin({
        name: payload.manufacturerName || '',
        businessAccountNumber: payload.accountNumber || '',
        location: payload.location || 'Nairobi',
        businessPermitNumber: payload.businessPermitNumber || '',
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        nationalIdNumber: payload.nationalIdNumber,
        employeeId: payload.employeeId || '',
      });
      return res.data;
    }

    const res = await manufacturerApi.onboardManufacturerUser({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      nationalIdNumber: payload.nationalIdNumber,
      employeeId: payload.employeeId || '',
      roleId: payload.role || '',
    });
    return res.data;
  },

  async updateManufacturerUser(id: string, payload: UpdateManufacturerUserRequest): Promise<UserResponse> {
    if (USE_MOCKS) return onboardingMockService.updateManufacturerUser(id, payload as any) as any;
    return manufacturerApi.updateManufacturerUser(id, payload);
  },

  async patchManufacturerUser(id: string, payload: UpdateManufacturerUserRequest): Promise<UserResponse> {
    return manufacturerApi.updateManufacturerUser(id, payload);
  },

  async deleteManufacturerUser(id: string): Promise<void> {
    if (USE_MOCKS) return onboardingMockService.deleteManufacturerUser(id);
    return manufacturerApi.deactivateManufacturerUser(id);
  },

  async setManufacturerAdminStatus(id: string, status: string): Promise<UserResponse> {
    return manufacturerApi.setManufacturerAdminStatus(id, status);
  },

  async activateManufacturerAdmin(id: string): Promise<UserResponse> {
    return manufacturerApi.activateManufacturerAdmin(id);
  },

  async deactivateManufacturerAdmin(id: string): Promise<UserResponse> {
    return manufacturerApi.deactivateManufacturerAdmin(id);
  },

  // ─── Distributor Users (Controller: distributor-controller) ───

  async getDistributorUsers(): Promise<UserResponse[]> {
    if (USE_MOCKS) return onboardingMockService.getDistributorUsers() as any;
    return distributorApi.getDistributorUsers();
  },

  async getDistributorUser(id: string): Promise<UserResponse> {
    if (USE_MOCKS) {
      const result = await onboardingMockService.getDistributorUser(id);
      if (!result) throw new Error('Distributor user not found');
      return result as any;
    }
    return distributorApi.getDistributorUser(id);
  },

  async createDistributorUser(payload: CreateDistributorUserPayload): Promise<UserResponse> {
    if (USE_MOCKS) return onboardingMockService.createDistributorUser(payload as any) as any;
    const res = await distributorApi.onboardDistributorUser({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      nationalIdNumber: payload.nationalIdNumber,
      employeeId: payload.employeeId || '',
      roleId: payload.role || '',
    });
    return res.data;
  },

  async updateDistributorUser(id: string, payload: UpdateDistributorUserRequest): Promise<UserResponse> {
    if (USE_MOCKS) return onboardingMockService.updateDistributorUser(id, payload as any) as any;
    return distributorApi.updateDistributorUser(id, payload);
  },

  async patchDistributorUser(id: string, payload: UpdateDistributorUserRequest): Promise<UserResponse> {
    return distributorApi.updateDistributorUser(id, payload);
  },

  async deleteDistributorUser(id: string): Promise<void> {
    if (USE_MOCKS) return onboardingMockService.deleteDistributorUser(id);
    return distributorApi.deactivateDistributorUser(id);
  },

  async setDistributorAdminStatus(id: string, status: string): Promise<UserResponse> {
    return distributorApi.setDistributorAdminStatus(id, status);
  },

  async activateDistributorAdmin(id: string): Promise<UserResponse> {
    return distributorApi.activateDistributorAdmin(id);
  },

  async deactivateDistributorAdmin(id: string): Promise<UserResponse> {
    return distributorApi.deactivateDistributorAdmin(id);
  },

  // ─── Banks (Controller: bank-onboarding-controller) ───

  async getBanks(status?: BankStatus): Promise<BankResponse[]> {
    if (USE_MOCKS) return onboardingMockService.getBanks(status as string) as any;
    return bankOnboardingApi.getBanksByStatus(status);
  },

  async createBank(payload: OnboardBankRequest): Promise<BankResponse> {
    if (USE_MOCKS) return onboardingMockService.createBank(payload) as any;
    const res = await bankOnboardingApi.onboardBank(payload);
    return res.data;
  },

  async updateBank(id: string, payload: UpdateBankRequest): Promise<BankResponse> {
    if (USE_MOCKS) return onboardingMockService.updateBank(id, payload) as any;
    return bankOnboardingApi.updateBank(id, payload);
  },

  async deleteBank(id: string): Promise<void> {
    if (USE_MOCKS) return onboardingMockService.deleteBank(id);
    return bankOnboardingApi.deleteBank(id);
  },

  async setBankStatus(id: string, status: BankStatus): Promise<BankResponse> {
    if (USE_MOCKS) {
      await onboardingMockService.setBankStatus(id, status as any);
      return { id, name: '', bankCode: '', branch: '', branchCode: '', status, createdAt: new Date().toISOString() };
    }
    return bankOnboardingApi.setBankStatus(id, status);
  },

  async createBankAdmin(payload: OnboardBankAdminRequest): Promise<UserResponse> {
    if (USE_MOCKS) {
      const res = await onboardingMockService.createBankAdmin(payload);
      return { id: 'mock-admin', firstName: payload.firstName, lastName: payload.lastName, email: payload.email, phoneNumber: payload.phoneNumber, employeeId: payload.employeeId, nationalIdNumber: payload.nationalIdNumber, parentEntityId: payload.bankId, role: 'BANK_ADMIN', status: 'ACTIVE', credentialsIssued: true, createdAt: new Date().toISOString() };
    }
    const res = await bankOnboardingApi.onboardBankAdmin(payload);
    return res.data;
  },

  async getAllBankAdmins(): Promise<BankAdminSummaryResponse[]> {
    return bankOnboardingApi.getAllBankAdmins();
  },

  async updateBankAdmin(id: string, payload: UpdateBankAdminRequest): Promise<UserResponse> {
    return bankOnboardingApi.updateBankAdmin(id, payload);
  },

  async setBankAdminStatus(id: string, status: string): Promise<UserResponse> {
    return bankOnboardingApi.setBankAdminStatus(id, status);
  },

  async activateBankAdmin(id: string): Promise<UserResponse> {
    return bankOnboardingApi.activateBankAdmin(id);
  },

  async deactivateBankAdmin(id: string): Promise<UserResponse> {
    return bankOnboardingApi.deactivateBankAdmin(id);
  },

  async getBankDirectory(): Promise<BankSummaryDto[]> {
    return bankOnboardingApi.getBankDirectory();
  },

  // ─── Bank Branches (Controller: bank-onboarding-controller) ───

  async getBankBranches(bankId: string): Promise<BankBranchResponse[]> {
    return bankOnboardingApi.getBankBranches(bankId);
  },

  async getBankBranchById(branchId: string, bankId?: string): Promise<BankBranchResponse> {
    return bankOnboardingApi.getBankBranchById(branchId, bankId);
  },

  async createBankBranch(payload: OnboardBankBranchRequest, bankId?: string): Promise<BankBranchResponse> {
    const res = await bankOnboardingApi.onboardBankBranch(payload, bankId);
    return res.data;
  },

  async updateBankBranch(branchId: string, payload: UpdateBankBranchRequest, bankId?: string): Promise<BankBranchResponse> {
    return bankOnboardingApi.updateBankBranch(branchId, payload, bankId);
  },

  async deleteBankBranch(branchId: string, bankId?: string): Promise<void> {
    return bankOnboardingApi.deleteBankBranch(branchId, bankId);
  },

  async setBankBranchStatus(branchId: string, active: boolean, bankId?: string): Promise<BankBranchResponse> {
    return bankOnboardingApi.setBankBranchStatus(branchId, active, bankId);
  },

  async activateBankBranch(branchId: string, bankId?: string): Promise<BankBranchResponse> {
    return bankOnboardingApi.activateBankBranch(branchId, bankId);
  },

  async deactivateBankBranch(branchId: string, bankId?: string): Promise<BankBranchResponse> {
    return bankOnboardingApi.deactivateBankBranch(branchId, bankId);
  },

  // ─── Bank Branch Admins (Controller: bank-onboarding-controller) ───

  async getBankBranchAdmins(branchId: string, bankId?: string): Promise<UserResponse[]> {
    return bankOnboardingApi.getBankBranchAdmins(branchId, bankId);
  },

  async createBankBranchAdmin(
    branchId: string,
    payload: OnboardBankAdminRequest,
    bankId?: string
  ): Promise<UserResponse> {
    const res = await bankOnboardingApi.onboardBankBranchAdmin(branchId, payload, bankId);
    return res.data;
  },

  async updateBankBranchAdmin(id: string, payload: UpdateBankAdminRequest): Promise<UserResponse> {
    return bankOnboardingApi.updateBankBranchAdmin(id, payload);
  },

  async deleteBankBranchAdmin(id: string): Promise<void> {
    return bankOnboardingApi.deleteBankBranchAdmin(id);
  },

  async setBankBranchAdminStatus(id: string, active: boolean): Promise<UserResponse> {
    return bankOnboardingApi.setBankBranchAdminStatus(id, active);
  },

  async activateBankBranchAdmin(id: string): Promise<UserResponse> {
    return bankOnboardingApi.activateBankBranchAdmin(id);
  },

  async deactivateBankBranchAdmin(id: string): Promise<UserResponse> {
    return bankOnboardingApi.deactivateBankBranchAdmin(id);
  },

  async getBankBranchUsers(branchId: string): Promise<UserResponse[]> {
    return bankOnboardingApi.getBankBranchUsers(branchId);
  },

  async getAvailableBranches(bankCode: string, bankId?: string, bankName?: string): Promise<Branch[]> {
    return bankOnboardingApi.getAvailableBranches(bankCode, bankId, bankName);
  },

  async getBankBranchDetails(bankId: string): Promise<BankBranchDetailsResponse> {
    return bankOnboardingApi.getBankBranchDetails(bankId);
  },

  async getBankUsersByBankId(bankId: string): Promise<UserResponse[]> {
    return bankOnboardingApi.getBankUsersByBankId(bankId);
  },

  async getBankMetrics(): Promise<BankMetricsResponse> {
    return bankOnboardingApi.getBankMetrics();
  },

  async getBankDashboardStats(): Promise<BankDashboardStatsResponse> {
    return bankOnboardingApi.getBankDashboardStats();
  },

  // ─── Bank Users (Controller: bank-user-controller) ───

  async getBankUsers(): Promise<UserResponse[]> {
    return bankUserApi.getBankUsers();
  },

  async getBankUserById(id: string): Promise<UserResponse> {
    return bankUserApi.getBankUserById(id);
  },

  async createBankUser(payload: OnboardBankUserRequest): Promise<UserResponse> {
    if (USE_MOCKS) {
      const res = await onboardingMockService.createBankUser(payload as any);
      return { id: 'mock-user', firstName: payload.firstName, lastName: payload.lastName, email: payload.email, phoneNumber: payload.phoneNumber, employeeId: payload.employeeId, nationalIdNumber: payload.nationalIdNumber, parentEntityId: '', role: 'BANK_USER', status: 'ACTIVE', credentialsIssued: true, createdAt: new Date().toISOString() };
    }
    const res = await bankUserApi.onboardBankUser({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      nationalIdNumber: payload.nationalIdNumber,
      employeeId: payload.employeeId || '',
      roleId: payload.roleId || '',
    });
    return res.data;
  },

  async updateBankUser(id: string, payload: UpdateBankUserRequest): Promise<UserResponse> {
    return bankUserApi.updateBankUser(id, payload);
  },

  async deleteBankUser(id: string): Promise<void> {
    return bankUserApi.deleteBankUser(id);
  },

  async setBankUserStatus(id: string, status: string): Promise<UserResponse> {
    return bankOnboardingApi.setBankUserStatus(id, status);
  },

  async activateBankUser(id: string): Promise<UserResponse> {
    return bankOnboardingApi.activateBankUser(id);
  },

  async deactivateBankUser(id: string): Promise<UserResponse> {
    return bankOnboardingApi.deactivateBankUser(id);
  },

  // ─── Role & RBAC Management (Controller: Role Management) ───

  async getRoles(unassignedOnly = false): Promise<RoleResponse[]> {
    return roleManagementApi.getRoles(unassignedOnly);
  },

  async getAllRolesAcrossAllEntities(): Promise<RoleResponse[]> {
    return roleManagementApi.getAllRolesAcrossAllEntities();
  },

  async getUnassignedRoles(): Promise<RoleResponse[]> {
    return roleManagementApi.getUnassignedRoles();
  },

  async getAvailablePermissions(): Promise<PermissionDto[]> {
    return roleManagementApi.getAvailablePermissions();
  },

  async getPermissionsByTenantType(tenantType: TenantType | string): Promise<PermissionDto[]> {
    return roleManagementApi.getPermissionsByTenantType(tenantType);
  },

  async getRoleById(id: string): Promise<RoleResponse> {
    return roleManagementApi.getRoleById(id);
  },

  async createRole(payload: CreateRoleRequest): Promise<RoleResponse> {
    return roleManagementApi.createRole(payload);
  },

  async updateRole(id: string, payload: UpdateRoleRequest): Promise<RoleResponse> {
    return roleManagementApi.updateRole(id, payload);
  },

  async deleteRole(id: string): Promise<void> {
    return roleManagementApi.deleteRole(id);
  },

  async setRoleStatus(id: string, status: string): Promise<RoleResponse> {
    return roleManagementApi.setRoleStatus(id, status);
  },

  async activateRole(id: string): Promise<RoleResponse> {
    return roleManagementApi.activateRole(id);
  },

  async deactivateRole(id: string): Promise<RoleResponse> {
    return roleManagementApi.deactivateRole(id);
  },

  // ─── Audit Trail (Controller: Audit Logs) ───

  async getAuditLogs(): Promise<AuditLogResponse[]> {
    return auditLogsApi.getAuditLogs();
  },

  async recordAuditLog(payload: AuditLogRecordRequest): Promise<AuditLogResponse> {
    return auditLogsApi.recordAuditLog(payload);
  },
};

export type {
  UpdateManufacturerUserPayload,
  UpdateDistributorUserPayload,
  CreateRecommendationPayload,
  ReviewRecommendationPayload,
  CreateBankPayload,
  UpdateBankPayload,
  BankAdminPayload,
  ManufacturerOption,
};

export const DistributorOnboardingService = {
  onboardDistributorAdmin: (payload: OnboardDistributorAdminRequest) => onboardingService.onboardDistributorAdmin(payload),
  onboardDistributorUser: (payload: OnboardDistributorUserRequest) => onboardingService.createDistributorUser(payload as any),
  getDistributorById: (id: string) => onboardingService.getDistributorById(id),
  getDistributors: () => onboardingService.getDistributors(),
};

export default onboardingService;