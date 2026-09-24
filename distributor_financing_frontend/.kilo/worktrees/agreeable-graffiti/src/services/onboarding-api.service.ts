/**
 * Onboarding Microservice API Client (Consuming Camila APIs on.json - 114 Endpoints)
 * Spec: "C:/Users/Mo12a/Downloads/on.json"
 */

import { apiClient } from '@/lib/axios';
import type {
  PermissionDto,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleResponse,
  Branch,
  BankSummaryDto,
  OnboardBankRequest,
  UpdateBankRequest,
  BankResponse,
  BankMetricsResponse,
  BankDashboardStatsResponse,
  BankBranchDetailsResponse,
  BankAdminSummaryResponse,
  UserResponse,
  OnboardBankAdminRequest,
  UpdateBankAdminRequest,
  OnboardBankUserRequest,
  UpdateBankUserRequest,
  OnboardManufacturerAdminRequest,
  OnboardManufacturerUserRequest,
  UpdateManufacturerUserRequest,
  ManufacturerResponse,
  ManufacturerDashboardStatsResponse,
  RecommendDistributorRequest,
  DistributorRecommendationResponse,
  SubmitDistributorDocsRequest,
  ReviewDistributorRequest,
  DistributorApplicationRequest,
  OnboardDistributorAdminRequest,
  OnboardDistributorUserRequest,
  UpdateDistributorUserRequest,
  DistributorResponse,
  DistributorDashboardStatsResponse,
  AuditLogRecordRequest,
  AuditLogResponse,
  UserProfilePermissionsDto,
  BankStatus,
  TenantType,
  MessageAndResultResponse,
  MessageAndResultResponseBankResponse,
  MessageAndResultResponseUserResponse,
  MessageAndResultResponseDistributorRecommendationResponse,
  MessageAndResultResponseDistributorResponse,
  MessageAndResultResponseManufacturerResponse,
} from '@/types/onboarding';

const BASE_PATH = '/api/onboarding';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Role Management API (14 Endpoints)
// ─────────────────────────────────────────────────────────────────────────────
export const roleManagementApi = {
  /** GET /api/onboarding/roles/available-permissions */
  async getAvailablePermissions(): Promise<PermissionDto[]> {
    const { data } = await apiClient.get<PermissionDto[]>(`${BASE_PATH}/roles/available-permissions`);
    return data;
  },

  /** GET /api/onboarding/roles/permissions */
  async getPermissions(): Promise<PermissionDto[]> {
    const { data } = await apiClient.get<PermissionDto[]>(`${BASE_PATH}/roles/permissions`);
    return data;
  },

  /** GET /api/onboarding/roles/permissions/{tenantType} */
  async getPermissionsByTenantType(tenantType: TenantType | string): Promise<PermissionDto[]> {
    const { data } = await apiClient.get<PermissionDto[]>(`${BASE_PATH}/roles/permissions/${tenantType}`);
    return data;
  },

  /** POST /api/onboarding/roles */
  async createRole(payload: CreateRoleRequest): Promise<RoleResponse> {
    const { data } = await apiClient.post<RoleResponse>(`${BASE_PATH}/roles`, payload);
    return data;
  },

  /** GET /api/onboarding/roles (or /roles/list, /roles/all) */
  async getRoles(unassignedOnly = false): Promise<RoleResponse[]> {
    const { data } = await apiClient.get<RoleResponse[]>(`${BASE_PATH}/roles`, {
      params: unassignedOnly ? { unassignedOnly: true } : undefined,
    });
    return data;
  },

  /** GET /api/onboarding/roles/all */
  async getAllRolesAcrossAllEntities(): Promise<RoleResponse[]> {
    const { data } = await apiClient.get<RoleResponse[]>(`${BASE_PATH}/roles/all`);
    return data;
  },

  /** GET /api/onboarding/roles/unassigned */
  async getUnassignedRoles(): Promise<RoleResponse[]> {
    const { data } = await apiClient.get<RoleResponse[]>(`${BASE_PATH}/roles/unassigned`);
    return data;
  },

  /** GET /api/onboarding/roles/{id} */
  async getRoleById(id: string): Promise<RoleResponse> {
    const { data } = await apiClient.get<RoleResponse>(`${BASE_PATH}/roles/${id}`);
    return data;
  },

  /** PUT /api/onboarding/roles/{id} */
  async updateRole(id: string, payload: UpdateRoleRequest): Promise<RoleResponse> {
    const { data } = await apiClient.put<RoleResponse>(`${BASE_PATH}/roles/${id}`, payload);
    return data;
  },

  /** DELETE /api/onboarding/roles/{id} */
  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/roles/${id}`);
  },

  /** PATCH /api/onboarding/roles/{id}/status */
  async setRoleStatus(id: string, status: string): Promise<RoleResponse> {
    const { data } = await apiClient.patch<RoleResponse>(`${BASE_PATH}/roles/${id}/status`, null, {
      params: { status },
    });
    return data;
  },

  /** PATCH /api/onboarding/roles/{id}/activate */
  async activateRole(id: string): Promise<RoleResponse> {
    const { data } = await apiClient.patch<RoleResponse>(`${BASE_PATH}/roles/${id}/activate`);
    return data;
  },

  /** PATCH /api/onboarding/roles/{id}/deactivate */
  async deactivateRole(id: string): Promise<RoleResponse> {
    const { data } = await apiClient.patch<RoleResponse>(`${BASE_PATH}/roles/${id}/deactivate`);
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Bank Onboarding & Users API (27 Endpoints)
// ─────────────────────────────────────────────────────────────────────────────
export const bankOnboardingApi = {
  /** GET /api/onboarding/banks/directory */
  async getBankDirectory(): Promise<BankSummaryDto[]> {
    const { data } = await apiClient.get<BankSummaryDto[]>(`${BASE_PATH}/banks/directory`);
    return data;
  },

  /** GET /api/onboarding/banks/{bankCode}/branches (or /available-branches, /branches) */
  async getBranches(bankCode: string): Promise<Branch[]> {
    const { data } = await apiClient.get<Branch[]>(`${BASE_PATH}/banks/${encodeURIComponent(bankCode)}/branches`);
    return data;
  },

  /** GET /api/onboarding/banks/branches?bankCode={bankCode} */
  async getBranchesByParam(bankCode: string): Promise<Branch[]> {
    const { data } = await apiClient.get<Branch[]>(`${BASE_PATH}/banks/branches`, {
      params: { bankCode },
    });
    return data;
  },

  /** POST /api/onboarding/banks */
  async onboardBank(payload: OnboardBankRequest): Promise<BankResponse> {
    const { data } = await apiClient.post<BankResponse>(`${BASE_PATH}/banks`, payload);
    return data;
  },

  /** GET /api/onboarding/banks */
  async getBanks(): Promise<BankResponse[]> {
    const { data } = await apiClient.get<BankResponse[]>(`${BASE_PATH}/banks`);
    return data;
  },

  /** GET /api/onboarding/banks/list (or GET /banks?status=ACTIVE) */
  async getBanksByStatus(status?: string): Promise<BankResponse[]> {
    const { data } = await apiClient.get<BankResponse[]>(`${BASE_PATH}/banks/list`, {
      params: status ? { status } : undefined,
    });
    return data;
  },

  /** GET /api/onboarding/banks/{id} */
  async getBankById(id: string): Promise<BankResponse> {
    const { data } = await apiClient.get<BankResponse>(`${BASE_PATH}/banks/${id}`);
    return data;
  },

  /** PUT /api/onboarding/banks/{id} */
  async updateBank(id: string, payload: UpdateBankRequest): Promise<BankResponse> {
    const { data } = await apiClient.put<BankResponse>(`${BASE_PATH}/banks/${id}`, payload);
    return data;
  },

  /** PATCH /api/onboarding/banks/{id}/status */
  async setBankStatus(id: string, status: BankStatus | string): Promise<BankResponse> {
    const { data } = await apiClient.patch<BankResponse>(`${BASE_PATH}/banks/${id}/status`, null, {
      params: { status },
    });
    return data;
  },

  /** GET /api/onboarding/banks/metrics */
  async getBankMetrics(): Promise<BankMetricsResponse> {
    const { data } = await apiClient.get<BankMetricsResponse>(`${BASE_PATH}/banks/metrics`);
    return data;
  },

  /** GET /api/onboarding/banks/dashboard-stats */
  async getBankDashboardStats(): Promise<BankDashboardStatsResponse> {
    const { data } = await apiClient.get<BankDashboardStatsResponse>(`${BASE_PATH}/banks/dashboard-stats`);
    return data;
  },

  /** GET /api/onboarding/banks/{bankId}/branch-details */
  async getBankBranchDetails(bankId: string): Promise<BankBranchDetailsResponse> {
    const { data } = await apiClient.get<BankBranchDetailsResponse>(`${BASE_PATH}/banks/${bankId}/branch-details`);
    return data;
  },

  /** GET /api/onboarding/banks/roles (or /banks/{bankId}/roles) */
  async getBankRoles(bankId?: string): Promise<RoleResponse[]> {
    const url = bankId ? `${BASE_PATH}/banks/${bankId}/roles` : `${BASE_PATH}/banks/roles`;
    const { data } = await apiClient.get<RoleResponse[]>(url);
    return data;
  },

  /** GET /api/onboarding/banks/permissions */
  async getBankPermissions(): Promise<PermissionDto[]> {
    const { data } = await apiClient.get<PermissionDto[]>(`${BASE_PATH}/banks/permissions`);
    return data;
  },

  /** POST /api/onboarding/banks/admin */
  async onboardBankAdmin(payload: OnboardBankAdminRequest): Promise<UserResponse> {
    const { data } = await apiClient.post<UserResponse>(`${BASE_PATH}/banks/admin`, payload);
    return data;
  },

  /** GET /api/onboarding/banks/admins */
  async getAllBankAdmins(): Promise<BankAdminSummaryResponse[]> {
    const { data } = await apiClient.get<BankAdminSummaryResponse[]>(`${BASE_PATH}/banks/admins`);
    return data;
  },

  /** GET /api/onboarding/banks/admins/{id} */
  async getBankAdminById(id: string): Promise<UserResponse> {
    const { data } = await apiClient.get<UserResponse>(`${BASE_PATH}/banks/admins/${id}`);
    return data;
  },

  /** PUT /api/onboarding/banks/admins/{id} */
  async updateBankAdmin(id: string, payload: UpdateBankAdminRequest): Promise<UserResponse> {
    const { data } = await apiClient.put<UserResponse>(`${BASE_PATH}/banks/admins/${id}`, payload);
    return data;
  },

  /** PATCH /api/onboarding/banks/admins/{id}/status */
  async setBankAdminStatus(id: string, status: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/banks/admins/${id}/status`, null, {
      params: { status },
    });
    return data;
  },

  /** PATCH /api/onboarding/banks/admins/{id}/activate */
  async activateBankAdmin(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/banks/admins/${id}/activate`);
    return data;
  },

  /** PATCH /api/onboarding/banks/admins/{id}/deactivate */
  async deactivateBankAdmin(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/banks/admins/${id}/deactivate`);
    return data;
  },

  /** POST /api/onboarding/banks/users */
  async onboardBankUser(payload: OnboardBankUserRequest): Promise<UserResponse> {
    const { data } = await apiClient.post<UserResponse>(`${BASE_PATH}/banks/users`, payload);
    return data;
  },

  /** GET /api/onboarding/banks/users (or /banks/{bankId}/users) */
  async getBankUsers(bankId?: string): Promise<UserResponse[]> {
    const url = bankId ? `${BASE_PATH}/banks/${bankId}/users` : `${BASE_PATH}/banks/users`;
    const { data } = await apiClient.get<UserResponse[]>(url);
    return data;
  },

  /** GET /api/onboarding/banks/users/{id} */
  async getBankUserById(id: string): Promise<UserResponse> {
    const { data } = await apiClient.get<UserResponse>(`${BASE_PATH}/banks/users/${id}`);
    return data;
  },

  /** PUT /api/onboarding/banks/users/{id} */
  async updateBankUser(id: string, payload: UpdateBankUserRequest): Promise<UserResponse> {
    const { data } = await apiClient.put<UserResponse>(`${BASE_PATH}/banks/users/${id}`, payload);
    return data;
  },

  /** DELETE /api/onboarding/banks/users/{id} */
  async deleteBankUser(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/banks/users/${id}`);
  },

  /** PATCH /api/onboarding/banks/users/{id}/activate */
  async activateBankUser(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/banks/users/${id}/activate`);
    return data;
  },

  /** PATCH /api/onboarding/banks/users/{id}/deactivate */
  async deactivateBankUser(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/banks/users/${id}/deactivate`);
    return data;
  },

  /** PATCH /api/onboarding/banks/users/{id}/status */
  async setBankUserStatus(id: string, status: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/banks/users/${id}/status`, null, {
      params: { status },
    });
    return data;
  },

  // Aliases for compatibility
  getAvailableBranches: (bankCode: string) => bankOnboardingApi.getBranches(bankCode),
  getBankUsersByBankId: (bankId: string) => bankOnboardingApi.getBankUsers(bankId),
  async deleteBank(id: string): Promise<void> {
    await bankOnboardingApi.setBankStatus(id, 'SUSPENDED');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Manufacturer API (17 Endpoints)
// ─────────────────────────────────────────────────────────────────────────────
export const manufacturerApi = {
  /** POST /api/onboarding/manufacturers */
  async onboardManufacturer(payload: OnboardManufacturerAdminRequest): Promise<MessageAndResultResponseManufacturerResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseManufacturerResponse>(`${BASE_PATH}/manufacturers`, payload);
    return data;
  },

  /** GET /api/onboarding/manufacturers */
  async getManufacturers(): Promise<ManufacturerResponse[]> {
    const { data } = await apiClient.get<ManufacturerResponse[]>(`${BASE_PATH}/manufacturers`);
    return data;
  },

  /** GET /api/onboarding/manufacturers/{id} */
  async getManufacturerById(id: string): Promise<ManufacturerResponse> {
    const { data } = await apiClient.get<ManufacturerResponse>(`${BASE_PATH}/manufacturers/${id}`);
    return data;
  },

  /** PUT /api/onboarding/manufacturers/{id} */
  async updateManufacturer(id: string, payload: Partial<OnboardManufacturerAdminRequest>): Promise<ManufacturerResponse> {
    const { data } = await apiClient.put<ManufacturerResponse>(`${BASE_PATH}/manufacturers/${id}`, payload);
    return data;
  },

  /** PUT /api/onboarding/manufacturers/{id}/assign-bank-admin */
  async assignBankAdmin(id: string, bankAdminId: string): Promise<MessageAndResultResponse<ManufacturerResponse>> {
    const { data } = await apiClient.put<MessageAndResultResponse<ManufacturerResponse>>(
      `${BASE_PATH}/manufacturers/${id}/assign-bank-admin`,
      null,
      { params: { bankAdminId } }
    );
    return data;
  },

  /** GET /api/onboarding/manufacturers/{id}/distributors */
  async getDistributorsForManufacturer(id: string): Promise<DistributorResponse[]> {
    const { data } = await apiClient.get<DistributorResponse[]>(`${BASE_PATH}/manufacturers/${id}/distributors`);
    return data;
  },

  /** GET /api/onboarding/manufacturers/{id}/roles */
  async getRolesForManufacturer(id: string): Promise<RoleResponse[]> {
    const { data } = await apiClient.get<RoleResponse[]>(`${BASE_PATH}/manufacturers/${id}/roles`);
    return data;
  },

  /** GET /api/onboarding/manufacturers/permissions */
  async getManufacturerPermissions(): Promise<PermissionDto[]> {
    const { data } = await apiClient.get<PermissionDto[]>(`${BASE_PATH}/manufacturers/permissions`);
    return data;
  },

  /** GET /api/onboarding/manufacturers/dashboard/stats */
  async getDashboardStats(): Promise<ManufacturerDashboardStatsResponse> {
    const { data } = await apiClient.get<ManufacturerDashboardStatsResponse>(`${BASE_PATH}/manufacturers/dashboard/stats`);
    return data;
  },

  /** POST /api/onboarding/manufacturers/admin */
  async onboardManufacturerAdmin(payload: OnboardManufacturerAdminRequest): Promise<MessageAndResultResponseUserResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseUserResponse>(`${BASE_PATH}/manufacturers/admin`, payload);
    return data;
  },

  /** PATCH /api/onboarding/manufacturers/admins/{id}/status */
  async setManufacturerAdminStatus(id: string, status: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/manufacturers/admins/${id}/status`, null, {
      params: { status },
    });
    return data;
  },

  /** PATCH /api/onboarding/manufacturers/admins/{id}/activate */
  async activateManufacturerAdmin(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/manufacturers/admins/${id}/activate`);
    return data;
  },

  /** PATCH /api/onboarding/manufacturers/admins/{id}/deactivate */
  async deactivateManufacturerAdmin(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/manufacturers/admins/${id}/deactivate`);
    return data;
  },

  /** POST /api/onboarding/manufacturers/users */
  async onboardManufacturerUser(payload: OnboardManufacturerUserRequest): Promise<UserResponse> {
    const { data } = await apiClient.post<UserResponse>(`${BASE_PATH}/manufacturers/users`, payload);
    return data;
  },

  /** GET /api/onboarding/manufacturers/users */
  async getManufacturerUsers(): Promise<UserResponse[]> {
    const { data } = await apiClient.get<UserResponse[]>(`${BASE_PATH}/manufacturers/users`);
    return data;
  },

  /** GET /api/onboarding/manufacturers/users/{id} */
  async getManufacturerUserById(id: string): Promise<UserResponse> {
    const { data } = await apiClient.get<UserResponse>(`${BASE_PATH}/manufacturers/users/${id}`);
    return data;
  },

  /** PUT /api/onboarding/manufacturers/users/{id} */
  async updateManufacturerUser(id: string, payload: UpdateManufacturerUserRequest): Promise<UserResponse> {
    const { data } = await apiClient.put<UserResponse>(`${BASE_PATH}/manufacturers/users/${id}`, payload);
    return data;
  },

  /** PATCH /api/onboarding/manufacturers/users/{id}/deactivate */
  async deactivateManufacturerUser(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/manufacturers/users/${id}/deactivate`);
    return data;
  },

  /** POST /api/onboarding/manufacturers/recommendations */
  async recommendDistributor(payload: RecommendDistributorRequest): Promise<MessageAndResultResponseDistributorRecommendationResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseDistributorRecommendationResponse>(
      `${BASE_PATH}/manufacturers/recommendations`,
      payload
    );
    return data;
  },

  /** GET /api/onboarding/manufacturers/recommendations */
  async getManufacturerRecommendations(): Promise<DistributorRecommendationResponse[]> {
    const { data } = await apiClient.get<DistributorRecommendationResponse[]>(`${BASE_PATH}/manufacturers/recommendations`);
    return data;
  },

  // Aliases for compatibility
  getManufacturerUser: (id: string) => manufacturerApi.getManufacturerUserById(id),
  getManufacturerDashboardStats: () => manufacturerApi.getDashboardStats(),
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Distributor API (39 Endpoints)
// ─────────────────────────────────────────────────────────────────────────────
export const distributorApi = {
  /** POST /api/onboarding/distributors */
  async onboardDistributor(payload: OnboardDistributorAdminRequest): Promise<MessageAndResultResponseDistributorResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseDistributorResponse>(`${BASE_PATH}/distributors`, payload);
    return data;
  },

  /** GET /api/onboarding/distributors */
  async getDistributors(): Promise<DistributorResponse[]> {
    const { data } = await apiClient.get<DistributorResponse[]>(`${BASE_PATH}/distributors`);
    return data;
  },

  /** GET /api/onboarding/distributors/{id} */
  async getDistributorById(id: string): Promise<DistributorResponse> {
    const { data } = await apiClient.get<DistributorResponse>(`${BASE_PATH}/distributors/${id}`);
    return data;
  },

  /** PUT /api/onboarding/distributors/{id} */
  async updateDistributor(id: string, payload: Partial<OnboardDistributorAdminRequest>): Promise<DistributorResponse> {
    const { data } = await apiClient.put<DistributorResponse>(`${BASE_PATH}/distributors/${id}`, payload);
    return data;
  },

  /** POST /api/onboarding/distributors/{id}/reprovision-loans */
  async reprovisionLoans(id: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/distributors/${id}/reprovision-loans`);
    return data;
  },

  /** GET /api/onboarding/distributors/manufacturers */
  async getWorkingManufacturers(): Promise<ManufacturerResponse[]> {
    const { data } = await apiClient.get<ManufacturerResponse[]>(`${BASE_PATH}/distributors/manufacturers`);
    return data;
  },

  /** GET /api/onboarding/distributors/{id}/manufacturer */
  async getManufacturerForDistributor(id: string): Promise<ManufacturerResponse> {
    const { data } = await apiClient.get<ManufacturerResponse>(`${BASE_PATH}/distributors/${id}/manufacturer`);
    return data;
  },

  /** GET /api/onboarding/distributors/{id}/roles */
  async getRolesForDistributor(id: string): Promise<RoleResponse[]> {
    const { data } = await apiClient.get<RoleResponse[]>(`${BASE_PATH}/distributors/${id}/roles`);
    return data;
  },

  /** GET /api/onboarding/distributors/permissions */
  async getDistributorPermissions(): Promise<PermissionDto[]> {
    const { data } = await apiClient.get<PermissionDto[]>(`${BASE_PATH}/distributors/permissions`);
    return data;
  },

  /** GET /api/onboarding/distributors/dashboard/stats */
  async getDashboardStats(): Promise<DistributorDashboardStatsResponse> {
    const { data } = await apiClient.get<DistributorDashboardStatsResponse>(`${BASE_PATH}/distributors/dashboard/stats`);
    return data;
  },

  /** POST /api/onboarding/distributors/admin */
  async onboardDistributorAdmin(payload: OnboardDistributorAdminRequest): Promise<MessageAndResultResponseUserResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseUserResponse>(`${BASE_PATH}/distributors/admin`, payload);
    return data;
  },

  /** PATCH /api/onboarding/distributors/admins/{id}/status */
  async setDistributorAdminStatus(id: string, status: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/distributors/admins/${id}/status`, null, {
      params: { status },
    });
    return data;
  },

  /** PATCH /api/onboarding/distributors/admins/{id}/activate */
  async activateDistributorAdmin(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/distributors/admins/${id}/activate`);
    return data;
  },

  /** PATCH /api/onboarding/distributors/admins/{id}/deactivate */
  async deactivateDistributorAdmin(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/distributors/admins/${id}/deactivate`);
    return data;
  },

  /** POST /api/onboarding/distributors/users */
  async onboardDistributorUser(payload: OnboardDistributorUserRequest): Promise<UserResponse> {
    const { data } = await apiClient.post<UserResponse>(`${BASE_PATH}/distributors/users`, payload);
    return data;
  },

  /** GET /api/onboarding/distributors/users (or /distributors/{distributorId}/users) */
  async getDistributorUsers(distributorId?: string): Promise<UserResponse[]> {
    const url = distributorId ? `${BASE_PATH}/distributors/${distributorId}/users` : `${BASE_PATH}/distributors/users`;
    const { data } = await apiClient.get<UserResponse[]>(url);
    return data;
  },

  /** GET /api/onboarding/distributors/users/{id} */
  async getDistributorUserById(id: string): Promise<UserResponse> {
    const { data } = await apiClient.get<UserResponse>(`${BASE_PATH}/distributors/users/${id}`);
    return data;
  },

  /** PUT /api/onboarding/distributors/users/{id} */
  async updateDistributorUser(id: string, payload: UpdateDistributorUserRequest): Promise<UserResponse> {
    const { data } = await apiClient.put<UserResponse>(`${BASE_PATH}/distributors/users/${id}`, payload);
    return data;
  },

  /** PATCH /api/onboarding/distributors/users/{id}/deactivate */
  async deactivateDistributorUser(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/distributors/users/${id}/deactivate`);
    return data;
  },

  /** GET /api/onboarding/distributors/recommendations */
  async getRecommendations(): Promise<DistributorRecommendationResponse[]> {
    const { data } = await apiClient.get<DistributorRecommendationResponse[]>(`${BASE_PATH}/distributors/recommendations`);
    return data;
  },

  /** GET /api/onboarding/distributors/recommendations/{id} */
  async getRecommendationById(id: string): Promise<DistributorRecommendationResponse> {
    const { data } = await apiClient.get<DistributorRecommendationResponse>(`${BASE_PATH}/distributors/recommendations/${id}`);
    return data;
  },

  /** GET /api/onboarding/distributors/recommendations/approved (or /distributors/approved) */
  async getApprovedRecommendations(): Promise<DistributorRecommendationResponse[]> {
    const { data } = await apiClient.get<DistributorRecommendationResponse[]>(`${BASE_PATH}/distributors/recommendations/approved`);
    return data;
  },

  /** GET /api/onboarding/distributors/recommendations/rejected (or /distributors/rejected) */
  async getRejectedRecommendations(): Promise<DistributorRecommendationResponse[]> {
    const { data } = await apiClient.get<DistributorRecommendationResponse[]>(`${BASE_PATH}/distributors/recommendations/rejected`);
    return data;
  },

  /** GET /api/onboarding/distributors/recommendations/mine */
  async getManufacturerRecommendations(): Promise<DistributorRecommendationResponse[]> {
    const { data } = await apiClient.get<DistributorRecommendationResponse[]>(`${BASE_PATH}/distributors/recommendations/mine`);
    return data;
  },

  /** POST /api/onboarding/distributors/recommendations/{id}/submit-application */
  async submitDistributorDocs(id: string, payload: SubmitDistributorDocsRequest): Promise<DistributorRecommendationResponse> {
    const { data } = await apiClient.post<DistributorRecommendationResponse>(
      `${BASE_PATH}/distributors/recommendations/${id}/submit-application`,
      payload
    );
    return data;
  },

  /** POST /api/onboarding/distributors/recommendations/{id}/review (or /distributors/review, /distributors/approve) */
  async reviewRecommendation(id: string, payload: ReviewDistributorRequest): Promise<DistributorRecommendationResponse> {
    const { data } = await apiClient.post<DistributorRecommendationResponse>(
      `${BASE_PATH}/distributors/recommendations/${id}/review`,
      payload
    );
    return data;
  },

  /** POST /api/onboarding/distributors/internal/{distributorId}/provision-credentials */
  async provisionDistributorCredentials(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/distributors/internal/${distributorId}/provision-credentials`
    );
    return data;
  },

  /** POST /api/onboarding/distributors/internal/{distributorId}/notify-offer-rejected */
  async notifyOfferRejected(distributorId: string, reason?: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/distributors/internal/${distributorId}/notify-offer-rejected`,
      null,
      { params: reason ? { reason } : undefined }
    );
    return data;
  },

  /** GET /api/onboarding/distributors/internal/{distributorId}/bank-statement */
  async getBankStatementForDistributor(distributorId: string): Promise<any> {
    const { data } = await apiClient.get(`${BASE_PATH}/distributors/internal/${distributorId}/bank-statement`);
    return data;
  },

  // Aliases for compatibility
  getDistributorUser: (id: string) => distributorApi.getDistributorUserById(id),
  getDistributorDashboardStats: () => distributorApi.getDashboardStats(),
  getPendingRecommendations: () => distributorApi.getRecommendations(),
  recommendDistributor: (payload: RecommendDistributorRequest) => manufacturerApi.recommendDistributor(payload),
  uploadDocument: (file: File | FormData, documentType?: string) => distributorDocumentsApi.uploadDocument(file, documentType),
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Distributor Documents API (4 Endpoints)
// ─────────────────────────────────────────────────────────────────────────────
export const distributorDocumentsApi = {
  /** POST /api/onboarding/distributors/documents/upload */
  async uploadDocument(
    file: File | FormData,
    documentType = 'bank-statements'
  ): Promise<{ fileName?: string; downloadUrl?: string; fileUrl?: string; url?: string; [key: string]: any }> {
    let body: FormData;
    if (typeof FormData !== 'undefined' && file instanceof FormData) {
      body = file;
    } else {
      body = new FormData();
      body.append('file', file as File);
    }
    const { data } = await apiClient.post<any>(
      `${BASE_PATH}/distributors/documents/upload`,
      body,
      {
        params: { documentType },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data?.data || data?.result || data;
  },

  /** GET /api/onboarding/distributors/documents/download/{fileName} */
  getDocumentDownloadUrl(fileNameOrUrl?: string): string {
    if (!fileNameOrUrl) return '';
    if (fileNameOrUrl.startsWith('http://') || fileNameOrUrl.startsWith('https://')) {
      return fileNameOrUrl;
    }
    if (fileNameOrUrl.startsWith('/api/onboarding/distributors/documents/download/')) {
      return fileNameOrUrl;
    }
    const cleanFileName = fileNameOrUrl.replace(/^\/+/, '').replace(/^api\/onboarding\/distributors\/documents\/download\//, '');
    return `${BASE_PATH}/distributors/documents/download/${encodeURIComponent(cleanFileName)}`;
  },

  /** GET /api/onboarding/distributors/documents/download-attachment/{fileName} */
  getDocumentAttachmentUrl(fileName: string): string {
    return `${BASE_PATH}/distributors/documents/download-attachment/${encodeURIComponent(fileName)}`;
  },

  /** GET /api/onboarding/distributors/documents/recommendations/{recommendationId}/download/{documentType} */
  getRecommendationDocumentUrl(recommendationId: string, documentType: string): string {
    return `${BASE_PATH}/distributors/documents/recommendations/${recommendationId}/download/${documentType}`;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Distributor Applications API (12 Endpoints)
// ─────────────────────────────────────────────────────────────────────────────
export const distributorApplicationsApi = {
  /** POST /api/onboarding/applications */
  async createApplication(payload: DistributorApplicationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/applications`, payload);
    return data;
  },

  /** GET /api/onboarding/applications */
  async getApplications(): Promise<DistributorApplicationRequest[]> {
    const { data } = await apiClient.get<DistributorApplicationRequest[]>(`${BASE_PATH}/applications`);
    return data;
  },

  /** GET /api/onboarding/applications/{id} */
  async getApplicationById(id: string): Promise<DistributorApplicationRequest> {
    const { data } = await apiClient.get<DistributorApplicationRequest>(`${BASE_PATH}/applications/${id}`);
    return data;
  },

  /** POST /api/onboarding/applications/{id}/submit */
  async submitApplication(id: string, payload?: any): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/applications/${id}/submit`, payload || {});
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. Audit Logs API (10 Endpoints)
// ─────────────────────────────────────────────────────────────────────────────
export const auditLogsApi = {
  /** POST /api/onboarding/audit-logs/record */
  async recordAuditLog(payload: AuditLogRecordRequest): Promise<AuditLogResponse> {
    const { data } = await apiClient.post<AuditLogResponse>(`${BASE_PATH}/audit-logs/record`, payload);
    return data;
  },

  /** GET /api/onboarding/audit-trail (or /audit-logs) */
  async getAuditLogs(): Promise<AuditLogResponse[]> {
    const { data } = await apiClient.get<AuditLogResponse[]>(`${BASE_PATH}/audit-trail`);
    return data;
  },

  /** GET /api/onboarding/audit-trail/all (Platform Admin) */
  async getAllAuditLogs(): Promise<AuditLogResponse[]> {
    const { data } = await apiClient.get<AuditLogResponse[]>(`${BASE_PATH}/audit-trail/all`);
    return data;
  },

  /** GET /api/onboarding/audit-trail/entity/{tenantType}/{tenantId} */
  async getAuditLogsForEntity(tenantType: TenantType | string, tenantId: string): Promise<AuditLogResponse[]> {
    const { data } = await apiClient.get<AuditLogResponse[]>(`${BASE_PATH}/audit-trail/entity/${tenantType}/${tenantId}`);
    return data;
  },

  /** GET /api/onboarding/audit-trail/user/{userId} */
  async getAuditLogsForUser(userId: string): Promise<AuditLogResponse[]> {
    const { data } = await apiClient.get<AuditLogResponse[]>(`${BASE_PATH}/audit-trail/user/${userId}`);
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. User Permissions API (3 Endpoints)
// ─────────────────────────────────────────────────────────────────────────────
export const userPermissionsApi = {
  /** GET /api/onboarding/users/permissions/{email} */
  async getUserPermissions(email: string): Promise<UserProfilePermissionsDto> {
    const { data } = await apiClient.get<UserProfilePermissionsDto>(`${BASE_PATH}/users/permissions/${encodeURIComponent(email)}`);
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Aggregated Services & Legacy Compatibility Adapters
// ─────────────────────────────────────────────────────────────────────────────
export const onboardingService = {
  // Roles
  getRoles: roleManagementApi.getRoles,
  getAllRoles: roleManagementApi.getAllRolesAcrossAllEntities,
  getRoleById: roleManagementApi.getRoleById,
  createRole: roleManagementApi.createRole,
  updateRole: roleManagementApi.updateRole,
  deleteRole: roleManagementApi.deleteRole,
  getPermissions: roleManagementApi.getPermissions,
  getPermissionsByTenantType: roleManagementApi.getPermissionsByTenantType,
  getAvailablePermissions: roleManagementApi.getAvailablePermissions,

  // Banks
  getBankDirectory: bankOnboardingApi.getBankDirectory,
  getBranches: bankOnboardingApi.getBranches,
  onboardBank: bankOnboardingApi.onboardBank,
  getBanks: bankOnboardingApi.getBanks,
  getBankById: bankOnboardingApi.getBankById,
  updateBank: bankOnboardingApi.updateBank,
  setBankStatus: bankOnboardingApi.setBankStatus,
  getBankMetrics: bankOnboardingApi.getBankMetrics,
  getBankDashboardStats: bankOnboardingApi.getBankDashboardStats,
  getBankBranchDetails: bankOnboardingApi.getBankBranchDetails,
  onboardBankAdmin: bankOnboardingApi.onboardBankAdmin,
  getAllBankAdmins: bankOnboardingApi.getAllBankAdmins,
  onboardBankUser: bankOnboardingApi.onboardBankUser,
  getBankUsers: bankOnboardingApi.getBankUsers,

  // Manufacturers
  onboardManufacturer: manufacturerApi.onboardManufacturer,
  getManufacturers: manufacturerApi.getManufacturers,
  getManufacturerById: manufacturerApi.getManufacturerById,
  updateManufacturer: manufacturerApi.updateManufacturer,
  assignBankAdmin: manufacturerApi.assignBankAdmin,
  onboardManufacturerUser: manufacturerApi.onboardManufacturerUser,
  getManufacturerUsers: manufacturerApi.getManufacturerUsers,
  recommendDistributor: manufacturerApi.recommendDistributor,
  getManufacturerRecommendations: manufacturerApi.getManufacturerRecommendations,

  // Distributors
  onboardDistributor: distributorApi.onboardDistributor,
  getDistributors: distributorApi.getDistributors,
  getDistributorById: distributorApi.getDistributorById,
  updateDistributor: distributorApi.updateDistributor,
  getWorkingManufacturers: distributorApi.getWorkingManufacturers,
  onboardDistributorUser: distributorApi.onboardDistributorUser,
  getDistributorUsers: distributorApi.getDistributorUsers,
  getRecommendations: distributorApi.getRecommendations,
  reviewRecommendation: distributorApi.reviewRecommendation,

  // Documents
  uploadDocument: distributorDocumentsApi.uploadDocument,
  getDocumentDownloadUrl: distributorDocumentsApi.getDocumentDownloadUrl,

  // Audit Logs
  getAuditLogs: auditLogsApi.getAuditLogs,
  getAllAuditLogs: auditLogsApi.getAllAuditLogs,
  recordAuditLog: auditLogsApi.recordAuditLog,

  // Direct APIs
  roles: roleManagementApi,
  banks: bankOnboardingApi,
  manufacturers: manufacturerApi,
  distributors: distributorApi,
  documents: distributorDocumentsApi,
  applications: distributorApplicationsApi,
  auditLogs: auditLogsApi,
  userPermissions: userPermissionsApi,
};

export const rolesApi = roleManagementApi;
export const auditTrailApi = auditLogsApi;
export const bankUserApi = bankOnboardingApi;
export const distributorUserApi = distributorApi;
export const manufacturerUserApi = manufacturerApi;

export default onboardingService;
