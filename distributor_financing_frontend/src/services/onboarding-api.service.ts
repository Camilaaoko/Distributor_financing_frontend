import { apiClient } from '@/lib/axios';
import type {
  PermissionDto,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleResponse,
  Branch,
  BankSummaryDto,
  OnboardBankRequest,
  OnboardBankBranchRequest,
  UpdateBankBranchRequest,
  BankBranchResponse,
  MessageAndResultResponseBankBranchResponse,
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
  OnboardDistributorAdminRequest,
  OnboardDistributorUserRequest,
  UpdateDistributorUserRequest,
  DistributorResponse,
  DistributorDashboardStatsResponse,
  AuditLogRecordRequest,
  AuditLogResponse,
  BankStatus,
  TenantType,
  MessageAndResultResponse,
  MessageAndResultResponseBankResponse,
  MessageAndResultResponseUserResponse,
  MessageAndResultResponseDistributorRecommendationResponse,
} from '@/types/onboarding';
import { USE_MOCKS } from '@/lib/config';
import { platformMock } from '@/services/platform.mock';

const BASE_PATH = '/api/onboarding';

/**
 * ====================================================================
 * 1. Role Management API (12 Endpoints)
 * Controller: Role Management
 * ====================================================================
 */
export const roleManagementApi = {
  /**
   * Get available permissions for caller's organization type
   * GET /api/onboarding/roles/available-permissions
   */
  async getAvailablePermissions(): Promise<PermissionDto[]> {
    const { data } = await apiClient.get<PermissionDto[]>(`${BASE_PATH}/roles/available-permissions`);
    return data;
  },

  /**
   * Get permissions list
   * GET /api/onboarding/roles/permissions
   */
  async getPermissions(): Promise<PermissionDto[]> {
    const { data } = await apiClient.get<PermissionDto[]>(`${BASE_PATH}/roles/permissions`);
    return data;
  },

  /**
   * Get permissions by tenant type (BANK, MANUFACTURER, DISTRIBUTOR)
   * GET /api/onboarding/roles/permissions/{tenantType}
   */
  async getPermissionsByTenantType(tenantType: TenantType | string): Promise<PermissionDto[]> {
    const { data } = await apiClient.get<PermissionDto[]>(`${BASE_PATH}/roles/permissions/${tenantType}`);
    return data;
  },

  /**
   * Create a custom dynamic role with permissions for caller's organization
   * POST /api/onboarding/roles
   */
  async createRole(payload: CreateRoleRequest): Promise<RoleResponse> {
    const { data } = await apiClient.post<RoleResponse>(`${BASE_PATH}/roles`, payload);
    return data;
  },

  /**
   * Get all roles created for caller's organization (optionally filter by unassignedOnly)
   * GET /api/onboarding/roles
   */
  async getRoles(unassignedOnly = false): Promise<RoleResponse[]> {
    const { data } = await apiClient.get<RoleResponse[]>(`${BASE_PATH}/roles`, {
      params: unassignedOnly ? { unassignedOnly: true } : undefined,
    });
    return data;
  },

  /**
   * Get all roles across all entities
   * GET /api/onboarding/roles/all
   */
  async getAllRolesAcrossAllEntities(): Promise<RoleResponse[]> {
    const { data } = await apiClient.get<RoleResponse[]>(`${BASE_PATH}/roles/all`);
    return data;
  },

  /**
   * Get only unassigned roles for user creation dropdowns
   * GET /api/onboarding/roles/unassigned
   */
  async getUnassignedRoles(): Promise<RoleResponse[]> {
    const { data } = await apiClient.get<RoleResponse[]>(`${BASE_PATH}/roles/unassigned`);
    return data;
  },

  /**
   * Get role by ID
   * GET /api/onboarding/roles/{id}
   */
  async getRoleById(id: string): Promise<RoleResponse> {
    const { data } = await apiClient.get<RoleResponse>(`${BASE_PATH}/roles/${id}`);
    return data;
  },

  /**
   * Update a role's name, description, or permissions
   * PUT /api/onboarding/roles/{id}
   */
  async updateRole(id: string, payload: UpdateRoleRequest): Promise<RoleResponse> {
    const { data } = await apiClient.put<RoleResponse>(`${BASE_PATH}/roles/${id}`, payload);
    return data;
  },

  /**
   * Delete an unassigned custom role
   * DELETE /api/onboarding/roles/{id}
   */
  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/roles/${id}`);
  },

  /**
   * Set role status
   * PATCH /api/onboarding/roles/{id}/status
   */
  async setRoleStatus(id: string, status: string): Promise<RoleResponse> {
    const { data } = await apiClient.patch<RoleResponse>(`${BASE_PATH}/roles/${id}/status`, null, {
      params: { status },
    });
    return data;
  },

  /**
   * Activate role
   * PATCH /api/onboarding/roles/{id}/activate
   */
  async activateRole(id: string): Promise<RoleResponse> {
    const { data } = await apiClient.patch<RoleResponse>(`${BASE_PATH}/roles/${id}/activate`);
    return data;
  },

  /**
   * Deactivate role
   * PATCH /api/onboarding/roles/{id}/deactivate
   */
  async deactivateRole(id: string): Promise<RoleResponse> {
    const { data } = await apiClient.patch<RoleResponse>(`${BASE_PATH}/roles/${id}/deactivate`);
    return data;
  },
};

/**
 * ====================================================================
 * 2. Bank Onboarding & Operations API (25 Endpoints)
 * Controller: bank-onboarding-controller
 * ====================================================================
 */
export const bankOnboardingApi = {
  /**
   * Get banks by status filter (ACTIVE, SUSPENDED, PENDING)
   * GET /api/onboarding/banks
   */
  async getBanksByStatus(status?: BankStatus | string): Promise<BankResponse[]> {
    const { data } = await apiClient.get<BankResponse[]>(`${BASE_PATH}/banks`, {
      params: status ? { status } : undefined,
    });
    return data;
  },

  /**
   * Onboard a partner bank
   * POST /api/onboarding/banks
   */
  async onboardBank(payload: OnboardBankRequest): Promise<MessageAndResultResponseBankResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseBankResponse>(`${BASE_PATH}/banks`, payload);
    return data;
  },

  /**
   * Get bank details by ID
   * GET /api/onboarding/banks/{id}
   */
  async getBankById(id: string): Promise<BankResponse> {
    const { data } = await apiClient.get<BankResponse>(`${BASE_PATH}/banks/${id}`);
    return data;
  },

  /**
   * Update partner bank
   * PUT /api/onboarding/banks/{id}
   */
  async updateBank(id: string, payload: UpdateBankRequest): Promise<BankResponse> {
    const { data } = await apiClient.put<BankResponse>(`${BASE_PATH}/banks/${id}`, payload);
    return data;
  },

  /**
   * Delete bank
   * DELETE /api/onboarding/banks/{id}
   */
  async deleteBank(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/banks/${id}`);
  },

  /**
   * Set bank status (ACTIVE, SUSPENDED)
   * PATCH /api/onboarding/banks/{id}/status
   */
  async setBankStatus(id: string, status: BankStatus | string): Promise<BankResponse> {
    const { data } = await apiClient.patch<BankResponse>(`${BASE_PATH}/banks/${id}/status`, null, {
      params: { status },
    });
    return data;
  },

  /**
   * Onboard primary administrator for partner bank
   * POST /api/onboarding/banks/admin
   */
  async onboardBankAdmin(payload: OnboardBankAdminRequest): Promise<MessageAndResultResponseUserResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseUserResponse>(`${BASE_PATH}/banks/admin`, payload);
    return data;
  },

  /**
   * Get all bank admins across partner banks
   * GET /api/onboarding/banks/admins
   */
  async getAllBankAdmins(): Promise<BankAdminSummaryResponse[]> {
    const { data } = await apiClient.get<BankAdminSummaryResponse[]>(`${BASE_PATH}/banks/admins`);
    return data;
  },

  /**
   * Update bank admin details
   * PUT /api/onboarding/banks/admins/{id}
   */
  async updateBankAdmin(id: string, payload: UpdateBankAdminRequest): Promise<UserResponse> {
    const { data } = await apiClient.put<UserResponse>(`${BASE_PATH}/banks/admins/${id}`, payload);
    return data;
  },

  /**
   * Get all Bank Admins assigned to a bank
   * GET /api/onboarding/banks/{bankId}/admins
   */
  async getBankAdmins(bankId: string): Promise<UserResponse[]> {
    const { data } = await apiClient.get<UserResponse[]>(`${BASE_PATH}/banks/${bankId}/admins`);
    return data;
  },

  /**
   * Delete bank admin
   * DELETE /api/onboarding/banks/admins/{id}
   */
  async deleteBankAdmin(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/banks/admins/${id}`);
  },

  /**
   * Set bank admin status (active flag or status enum)
   * PATCH /api/onboarding/banks/admins/{id}/status?active=boolean
   */
  async setBankAdminStatus(id: string, activeOrStatus: boolean | string): Promise<UserResponse> {
    const params = typeof activeOrStatus === 'boolean' ? { active: activeOrStatus } : { status: activeOrStatus };
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/banks/admins/${id}/status`, null, {
      params,
    });
    return data;
  },

  /**
   * Activate bank admin
   * PATCH /api/onboarding/banks/admins/{id}/activate
   */
  async activateBankAdmin(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/banks/admins/${id}/activate`);
    return data;
  },

  /**
   * Deactivate bank admin
   * PATCH /api/onboarding/banks/admins/{id}/deactivate
   */
  async deactivateBankAdmin(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/banks/admins/${id}/deactivate`);
    return data;
  },

  /**
   * Get bank directory
   * GET /api/onboarding/banks/directory & /api/onboarding/banks/list
   */
  async getBankDirectory(): Promise<BankSummaryDto[]> {
    const { data } = await apiClient.get<BankSummaryDto[]>(`${BASE_PATH}/banks/directory`);
    return data;
  },

  /**
   * Get all onboarded branches for a bank
   * GET /api/onboarding/banks/{bankId}/branches
   */
  async getBankBranches(bankId: string): Promise<BankBranchResponse[]> {
    const { data } = await apiClient.get<BankBranchResponse[]>(`${BASE_PATH}/banks/${bankId}/branches`);
    return data;
  },

  /**
   * Onboard a branch for a bank (Bank Admin only)
   * POST /api/onboarding/banks/{bankId}/branches & POST /api/onboarding/banks/branches
   */
  async onboardBankBranch(payload: OnboardBankBranchRequest, bankId?: string): Promise<MessageAndResultResponseBankBranchResponse> {
    const endpoint = bankId ? `${BASE_PATH}/banks/${bankId}/branches` : `${BASE_PATH}/banks/branches`;
    const { data } = await apiClient.post<MessageAndResultResponseBankBranchResponse>(endpoint, payload);
    return data;
  },

  /**
   * Get bank branch details by branch ID
   * GET /api/onboarding/banks/branches/{branchId} & GET /api/onboarding/banks/{bankId}/branches/{branchId}
   */
  async getBankBranchById(branchId: string, bankId?: string): Promise<BankBranchResponse> {
    const endpoint = bankId
      ? `${BASE_PATH}/banks/${bankId}/branches/${branchId}`
      : `${BASE_PATH}/banks/branches/${branchId}`;
    const { data } = await apiClient.get<BankBranchResponse>(endpoint);
    return data;
  },

  /**
   * Update bank branch details
   * PUT /api/onboarding/banks/branches/{branchId} & PUT /api/onboarding/banks/{bankId}/branches/{branchId}
   */
  async updateBankBranch(
    branchId: string,
    payload: UpdateBankBranchRequest,
    bankId?: string
  ): Promise<BankBranchResponse> {
    const endpoint = bankId
      ? `${BASE_PATH}/banks/${bankId}/branches/${branchId}`
      : `${BASE_PATH}/banks/branches/${branchId}`;
    const { data } = await apiClient.put<BankBranchResponse>(endpoint, payload);
    return data;
  },

  /**
   * Delete a bank branch
   * DELETE /api/onboarding/banks/branches/{branchId} & DELETE /api/onboarding/banks/{bankId}/branches/{branchId}
   */
  async deleteBankBranch(branchId: string, bankId?: string): Promise<void> {
    const endpoint = bankId
      ? `${BASE_PATH}/banks/${bankId}/branches/${branchId}`
      : `${BASE_PATH}/banks/branches/${branchId}`;
    await apiClient.delete(endpoint);
  },

  /**
   * Activate or deactivate a bank branch and cascade to its branch users and manufacturers
   * PATCH /api/onboarding/banks/branches/{branchId}/status & PATCH /api/onboarding/banks/{bankId}/branches/{branchId}/status
   */
  async setBankBranchStatus(
    branchId: string,
    active: boolean,
    bankId?: string
  ): Promise<BankBranchResponse> {
    const endpoint = bankId
      ? `${BASE_PATH}/banks/${bankId}/branches/${branchId}/status`
      : `${BASE_PATH}/banks/branches/${branchId}/status`;
    const { data } = await apiClient.patch<BankBranchResponse>(endpoint, null, {
      params: { active },
    });
    return data;
  },

  /**
   * Activate a bank branch
   * PATCH /api/onboarding/banks/branches/{branchId}/activate
   */
  async activateBankBranch(branchId: string, bankId?: string): Promise<BankBranchResponse> {
    const endpoint = bankId
      ? `${BASE_PATH}/banks/${bankId}/branches/${branchId}/activate`
      : `${BASE_PATH}/banks/branches/${branchId}/activate`;
    const { data } = await apiClient.patch<BankBranchResponse>(endpoint);
    return data;
  },

  /**
   * Deactivate a bank branch
   * PATCH /api/onboarding/banks/branches/{branchId}/deactivate
   */
  async deactivateBankBranch(branchId: string, bankId?: string): Promise<BankBranchResponse> {
    const endpoint = bankId
      ? `${BASE_PATH}/banks/${bankId}/branches/${branchId}/deactivate`
      : `${BASE_PATH}/banks/branches/${branchId}/deactivate`;
    const { data } = await apiClient.patch<BankBranchResponse>(endpoint);
    return data;
  },

  /**
   * Get all branch admins assigned to a branch
   * GET /api/onboarding/banks/branches/{branchId}/admins & GET /api/onboarding/banks/{bankId}/branches/{branchId}/admins
   */
  async getBankBranchAdmins(branchId: string, bankId?: string): Promise<UserResponse[]> {
    const endpoint = bankId
      ? `${BASE_PATH}/banks/${bankId}/branches/${branchId}/admins`
      : `${BASE_PATH}/banks/branches/${branchId}/admins`;
    const { data } = await apiClient.get<UserResponse[]>(endpoint);
    return data;
  },

  /**
   * Assign / Onboard a Branch Admin to a bank branch
   * POST /api/onboarding/banks/branches/{branchId}/admins & POST /api/onboarding/banks/{bankId}/branches/{branchId}/admin
   */
  async onboardBankBranchAdmin(
    branchId: string,
    payload: OnboardBankAdminRequest,
    bankId?: string
  ): Promise<MessageAndResultResponseUserResponse> {
    const endpoint = bankId
      ? `${BASE_PATH}/banks/${bankId}/branches/${branchId}/admin`
      : `${BASE_PATH}/banks/branches/${branchId}/admins`;
    const { data } = await apiClient.post<MessageAndResultResponseUserResponse>(endpoint, payload);
    return data;
  },

  /**
   * Update branch admin details
   * PUT /api/onboarding/banks/branches/admins/{id}
   */
  async updateBankBranchAdmin(id: string, payload: UpdateBankAdminRequest): Promise<UserResponse> {
    const { data } = await apiClient.put<UserResponse>(`${BASE_PATH}/banks/branches/admins/${id}`, payload);
    return data;
  },

  /**
   * Delete a branch admin
   * DELETE /api/onboarding/banks/branches/admins/{id}
   */
  async deleteBankBranchAdmin(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/banks/branches/admins/${id}`);
  },

  /**
   * Set branch admin status (active flag)
   * PATCH /api/onboarding/banks/branches/admins/{id}/status?active=boolean
   */
  async setBankBranchAdminStatus(id: string, active: boolean): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(
      `${BASE_PATH}/banks/branches/admins/${id}/status`,
      null,
      { params: { active } }
    );
    return data;
  },

  /**
   * Activate branch admin
   * PATCH /api/onboarding/banks/branches/admins/{id}/activate
   */
  async activateBankBranchAdmin(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(
      `${BASE_PATH}/banks/branches/admins/${id}/activate`
    );
    return data;
  },

  /**
   * Deactivate branch admin
   * PATCH /api/onboarding/banks/branches/admins/{id}/deactivate
   */
  async deactivateBankBranchAdmin(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(
      `${BASE_PATH}/banks/branches/admins/${id}/deactivate`
    );
    return data;
  },

  /**
   * Get all users in a specific branch
   * GET /api/onboarding/banks/branches/{branchId}/users
   */
  async getBankBranchUsers(branchId: string): Promise<UserResponse[]> {
    const { data } = await apiClient.get<UserResponse[]>(`${BASE_PATH}/banks/branches/${branchId}/users`);
    return data;
  },

  /**
   * Get available directory branches for a bank (filtered by bankCode / bankId / bankName)
   * GET /api/onboarding/banks/{bankCode}/available-branches
   * GET /api/onboarding/banks/{bankCode}/branches/dropdown
   * GET /api/onboarding/banks/available-branches
   * GET /api/onboarding/banks/branches/dropdown
   */
  async getAvailableBranches(bankCode: string, bankId?: string, bankName?: string): Promise<Branch[]> {
    if (USE_MOCKS) {
      return platformMock.fetchBranches(bankCode || bankName || bankId || 'EQTY');
    }

    const params: Record<string, string> = {};
    if (bankCode) params.code = bankCode;
    if (bankId) params.bankId = bankId;
    if (bankName) params.bankName = bankName;

    const encodedCode = encodeURIComponent(bankCode || 'all');

    try {
      const { data } = await apiClient.get<Branch[]>(`${BASE_PATH}/banks/${encodedCode}/available-branches`, { params });
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // Fallback to next route
    }

    try {
      const { data } = await apiClient.get<Branch[]>(`${BASE_PATH}/banks/${encodedCode}/branches/dropdown`, { params });
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // Fallback to next route
    }

    try {
      const { data } = await apiClient.get<Branch[]>(`${BASE_PATH}/banks/available-branches`, { params });
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // Fallback to next route
    }

    try {
      const { data } = await apiClient.get<Branch[]>(`${BASE_PATH}/banks/branches/dropdown`, { params });
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // Fallback to mock data
    }

    return platformMock.fetchBranches(bankCode || bankName || bankId || 'EQTY');
  },

  /**
   * Get branches dropdown for bank
   * GET /api/onboarding/banks/{bankCode}/branches/dropdown
   */
  async getBranchesDropdown(bankCode: string, bankId?: string, bankName?: string): Promise<Branch[]> {
    return this.getAvailableBranches(bankCode, bankId, bankName);
  },

  /**
   * Get branches by bank code alias
   * GET /api/onboarding/banks/{bankCode}/branches
   */
  async getBranchesByBankCode(bankCode: string): Promise<Branch[]> {
    if (USE_MOCKS) return platformMock.fetchBranches(bankCode);
    const { data } = await apiClient.get<Branch[]>(`${BASE_PATH}/banks/${encodeURIComponent(bankCode)}/branches`);
    return data;
  },

  /**
   * Get branches by search parameter
   * GET /api/onboarding/banks/branches
   */
  async getBranchesByParam(params?: { bankCode?: string; search?: string }): Promise<Branch[]> {
    if (USE_MOCKS) return platformMock.fetchBranches(params?.bankCode || 'EQTY');
    const { data } = await apiClient.get<Branch[]>(`${BASE_PATH}/banks/branches`, { params });
    return data;
  },

  /**
   * Get aggregated bank branch details (Bank, Admin, Users, Roles, Stats)
   * GET /api/onboarding/banks/{bankId}/branch-details
   */
  async getBankBranchDetails(bankId: string): Promise<BankBranchDetailsResponse> {
    const { data } = await apiClient.get<BankBranchDetailsResponse>(`${BASE_PATH}/banks/${bankId}/branch-details`);
    return data;
  },

  /**
   * Get bank users by bank ID
   * GET /api/onboarding/banks/{bankId}/users
   */
  async getBankUsersByBankId(bankId: string): Promise<UserResponse[]> {
    const { data } = await apiClient.get<UserResponse[]>(`${BASE_PATH}/banks/${bankId}/users`);
    return data;
  },

  /**
   * Set bank user status
   * PATCH /api/onboarding/banks/users/{id}/status
   */
  async setBankUserStatus(id: string, status: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/banks/users/${id}/status`, null, {
      params: { status },
    });
    return data;
  },

  /**
   * Activate bank user
   * PATCH /api/onboarding/banks/users/{id}/activate
   */
  async activateBankUser(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/banks/users/${id}/activate`);
    return data;
  },

  /**
   * Deactivate bank user
   * PATCH /api/onboarding/banks/users/{id}/deactivate
   */
  async deactivateBankUser(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/banks/users/${id}/deactivate`);
    return data;
  },

  /**
   * Get bank permissions
   * GET /api/onboarding/banks/permissions
   */
  async getBankPermissions(): Promise<PermissionDto[]> {
    const { data } = await apiClient.get<PermissionDto[]>(`${BASE_PATH}/banks/permissions`);
    return data;
  },

  /**
   * Get bank metrics for platform overview cards
   * GET /api/onboarding/banks/metrics
   */
  async getBankMetrics(): Promise<BankMetricsResponse> {
    const { data } = await apiClient.get<BankMetricsResponse>(`${BASE_PATH}/banks/metrics`);
    return data;
  },

  /**
   * Get bank dashboard statistics (manufacturers, distributors, staff breakdown)
   * GET /api/onboarding/banks/dashboard-stats
   */
  async getBankDashboardStats(): Promise<BankDashboardStatsResponse> {
    const { data } = await apiClient.get<BankDashboardStatsResponse>(`${BASE_PATH}/banks/dashboard-stats`);
    return data;
  },
};

/**
 * ====================================================================
 * 3. Bank User Management API (5 Endpoints)
 * Controller: bank-user-controller
 * ====================================================================
 */
export const bankUserApi = {
  /**
   * Get all bank users for the caller's bank
   * GET /api/onboarding/banks/users
   */
  async getBankUsers(): Promise<UserResponse[]> {
    const { data } = await apiClient.get<UserResponse[]>(`${BASE_PATH}/banks/users`);
    return data;
  },

  /**
   * Onboard bank staff member (Maker/Checker)
   * POST /api/onboarding/banks/users
   */
  async onboardBankUser(payload: OnboardBankUserRequest): Promise<MessageAndResultResponseUserResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseUserResponse>(`${BASE_PATH}/banks/users`, payload);
    return data;
  },

  /**
   * Get bank user by ID
   * GET /api/onboarding/banks/users/{id}
   */
  async getBankUserById(id: string): Promise<UserResponse> {
    const { data } = await apiClient.get<UserResponse>(`${BASE_PATH}/banks/users/${id}`);
    return data;
  },

  /**
   * Update bank user details
   * PUT /api/onboarding/banks/users/{id}
   */
  async updateBankUser(id: string, payload: UpdateBankUserRequest): Promise<UserResponse> {
    const { data } = await apiClient.put<UserResponse>(`${BASE_PATH}/banks/users/${id}`, payload);
    return data;
  },

  /**
   * Deactivate bank user
   * DELETE /api/onboarding/banks/users/{id}
   */
  async deleteBankUser(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/banks/users/${id}`);
  },
};

/**
 * ====================================================================
 * 4. Manufacturer Management API (16 Endpoints)
 * Controller: manufacturer-controller
 * ====================================================================
 */
export const manufacturerApi = {
  /**
   * List all anchor manufacturers for the caller's bank
   * GET /api/onboarding/manufacturers
   */
  async getManufacturers(): Promise<ManufacturerResponse[]> {
    const { data } = await apiClient.get<ManufacturerResponse[]>(`${BASE_PATH}/manufacturers`);
    return data;
  },

  /**
   * Onboard an anchor manufacturer and primary administrator
   * POST /api/onboarding/manufacturers/admin & POST /api/onboarding/manufacturers
   */
  async onboardManufacturerAdmin(payload: OnboardManufacturerAdminRequest): Promise<MessageAndResultResponseUserResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseUserResponse>(`${BASE_PATH}/manufacturers/admin`, payload);
    return data;
  },

  /**
   * Get manufacturer by ID
   * GET /api/onboarding/manufacturers/{id}
   */
  async getManufacturerById(id: string): Promise<ManufacturerResponse> {
    const { data } = await apiClient.get<ManufacturerResponse>(`${BASE_PATH}/manufacturers/${id}`);
    return data;
  },

  /**
   * Get manufacturer dashboard statistics
   * GET /api/onboarding/manufacturers/dashboard-stats
   */
  async getManufacturerDashboardStats(): Promise<ManufacturerDashboardStatsResponse> {
    const { data } = await apiClient.get<ManufacturerDashboardStatsResponse>(`${BASE_PATH}/manufacturers/dashboard-stats`);
    return data;
  },

  /**
   * Map or assign a manufacturer to a specific bank admin
   * PUT /api/onboarding/manufacturers/{id}/assign-bank-admin?bankAdminId={bankAdminId}
   */
  async assignBankAdmin(id: string, bankAdminId: string): Promise<MessageAndResultResponse<ManufacturerResponse>> {
    const { data } = await apiClient.put<MessageAndResultResponse<ManufacturerResponse>>(
      `${BASE_PATH}/manufacturers/${id}/assign-bank-admin`,
      null,
      { params: { bankAdminId } }
    );
    return data;
  },

  /**
   * List all distributors linked to and recommended by this manufacturer
   * GET /api/onboarding/manufacturers/{id}/distributors
   */
  async getDistributorsForManufacturer(id: string): Promise<DistributorResponse[]> {
    const { data } = await apiClient.get<DistributorResponse[]>(`${BASE_PATH}/manufacturers/${id}/distributors`);
    return data;
  },

  /**
   * Get manufacturer permissions
   * GET /api/onboarding/manufacturers/permissions
   */
  async getManufacturerPermissions(): Promise<PermissionDto[]> {
    const { data } = await apiClient.get<PermissionDto[]>(`${BASE_PATH}/manufacturers/permissions`);
    return data;
  },

  /**
   * Get manufacturer recommendations
   * GET /api/onboarding/manufacturers/recommendations
   */
  async getManufacturerRecommendations(): Promise<DistributorRecommendationResponse[]> {
    const { data } = await apiClient.get<DistributorRecommendationResponse[]>(`${BASE_PATH}/manufacturers/recommendations`);
    return data;
  },

  /**
   * Recommend distributor via manufacturer endpoint
   * POST /api/onboarding/manufacturers/recommendations
   */
  async recommendDistributor(payload: RecommendDistributorRequest): Promise<MessageAndResultResponseDistributorRecommendationResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseDistributorRecommendationResponse>(
      `${BASE_PATH}/manufacturers/recommendations`,
      payload
    );
    return data;
  },

  /**
   * List staff users under manufacturer
   * GET /api/onboarding/manufacturers/users
   */
  async getManufacturerUsers(): Promise<UserResponse[]> {
    const { data } = await apiClient.get<UserResponse[]>(`${BASE_PATH}/manufacturers/users`);
    return data;
  },

  /**
   * Onboard staff user under manufacturer
   * POST /api/onboarding/manufacturers/users
   */
  async onboardManufacturerUser(payload: OnboardManufacturerUserRequest): Promise<MessageAndResultResponseUserResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseUserResponse>(`${BASE_PATH}/manufacturers/users`, payload);
    return data;
  },

  /**
   * Get manufacturer user details
   * GET /api/onboarding/manufacturers/users/{id}
   */
  async getManufacturerUser(id: string): Promise<UserResponse> {
    const { data } = await apiClient.get<UserResponse>(`${BASE_PATH}/manufacturers/users/${id}`);
    return data;
  },

  /**
   * Update manufacturer user details
   * PATCH /api/onboarding/manufacturers/users/{id}
   */
  async updateManufacturerUser(id: string, payload: UpdateManufacturerUserRequest): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/manufacturers/users/${id}`, payload);
    return data;
  },

  /**
   * Deactivate/Delete manufacturer user
   * DELETE /api/onboarding/manufacturers/users/{id}
   */
  async deactivateManufacturerUser(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/manufacturers/users/${id}`);
  },

  async deleteManufacturerUser(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/manufacturers/users/${id}`);
  },

  /**
   * Set manufacturer admin status
   * PATCH /api/onboarding/manufacturers/admins/{id}/status?active=boolean
   */
  async setManufacturerAdminStatus(id: string, activeOrStatus: boolean | string): Promise<UserResponse> {
    const params = typeof activeOrStatus === 'boolean' ? { active: activeOrStatus } : { status: activeOrStatus };
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/manufacturers/admins/${id}/status`, null, {
      params,
    });
    return data;
  },

  /**
   * Activate manufacturer admin
   * PATCH /api/onboarding/manufacturers/admins/{id}/activate
   */
  async activateManufacturerAdmin(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/manufacturers/admins/${id}/activate`);
    return data;
  },

  /**
   * Deactivate manufacturer admin
   * PATCH /api/onboarding/manufacturers/admins/{id}/deactivate
   */
  async deactivateManufacturerAdmin(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/manufacturers/admins/${id}/deactivate`);
    return data;
  },


  /**
   * Alias for getManufacturerDashboardStats
   */
  async getDashboardStats(): Promise<ManufacturerDashboardStatsResponse> {
    return this.getManufacturerDashboardStats();
  },

  /**
   * Alias for getManufacturerUser
   */
  async getManufacturerUserById(id: string): Promise<UserResponse> {
    return this.getManufacturerUser(id);
  },
};


/**
 * ====================================================================
 * 5. Distributor Management & Recommendations API (21 Endpoints)
 * Controller: distributor-controller
 * ====================================================================
 */
export const distributorApi = {
  /**
   * List all onboarded distributors
   * GET /api/onboarding/distributors
   */
  async getDistributors(): Promise<DistributorResponse[]> {
    const { data } = await apiClient.get<DistributorResponse[]>(`${BASE_PATH}/distributors`);
    return data;
  },

  /**
   * Onboard distributor corporate admin
   * POST /api/onboarding/distributors/admin & POST /api/onboarding/distributors
   */
  async onboardDistributorAdmin(payload: OnboardDistributorAdminRequest): Promise<MessageAndResultResponseUserResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseUserResponse>(`${BASE_PATH}/distributors/admin`, payload);
    return data;
  },

  /**
   * Get distributor by ID
   * GET /api/onboarding/distributors/{id}
   */
  async getDistributorById(id: string): Promise<DistributorResponse> {
    const { data } = await apiClient.get<DistributorResponse>(`${BASE_PATH}/distributors/${id}`);
    return data;
  },

  /**
   * Get distributor dashboard statistics
   * GET /api/onboarding/distributors/dashboard-stats
   */
  async getDistributorDashboardStats(): Promise<DistributorDashboardStatsResponse> {
    const { data } = await apiClient.get<DistributorDashboardStatsResponse>(`${BASE_PATH}/distributors/dashboard-stats`);
    return data;
  },

  /**
   * Get distributor permissions
   * GET /api/onboarding/distributors/permissions
   */
  async getDistributorPermissions(): Promise<PermissionDto[]> {
    const { data } = await apiClient.get<PermissionDto[]>(`${BASE_PATH}/distributors/permissions`);
    return data;
  },

  /**
   * Get working manufacturers associated with distributor
   * GET /api/onboarding/distributors/manufacturers
   */
  async getWorkingManufacturers(): Promise<ManufacturerResponse[]> {
    const { data } = await apiClient.get<ManufacturerResponse[]>(`${BASE_PATH}/distributors/manufacturers`);
    return data;
  },

  /**
   * Bank views pending distributor recommendations
   * GET /api/onboarding/distributors/recommendations
   */
  async getPendingRecommendations(): Promise<DistributorRecommendationResponse[]> {
    const { data } = await apiClient.get<DistributorRecommendationResponse[]>(`${BASE_PATH}/distributors/recommendations`);
    return data;
  },

  /**
   * Bank Admin lists all approved distributor recommendations
   * GET /api/onboarding/distributors/recommendations/approved
   */
  async getApprovedRecommendations(): Promise<DistributorRecommendationResponse[]> {
    const { data } = await apiClient.get<DistributorRecommendationResponse[]>(`${BASE_PATH}/distributors/recommendations/approved`);
    return data;
  },

  /**
   * Bank Admin lists all rejected distributor recommendations
   * GET /api/onboarding/distributors/recommendations/rejected
   */
  async getRejectedRecommendations(): Promise<DistributorRecommendationResponse[]> {
    const { data } = await apiClient.get<DistributorRecommendationResponse[]>(`${BASE_PATH}/distributors/recommendations/rejected`);
    return data;
  },

  /**
   * Get the anchor manufacturer who recommended this distributor
   * GET /api/onboarding/distributors/{id}/manufacturer
   */
  async getManufacturerForDistributor(id: string): Promise<ManufacturerResponse> {
    const { data } = await apiClient.get<ManufacturerResponse>(`${BASE_PATH}/distributors/${id}/manufacturer`);
    return data;
  },

  /**
   * Manufacturer retrieves their own submitted recommendations
   * GET /api/onboarding/distributors/recommendations/mine
   */
  async getManufacturerRecommendations(): Promise<DistributorRecommendationResponse[]> {
    const { data } = await apiClient.get<DistributorRecommendationResponse[]>(`${BASE_PATH}/distributors/recommendations/mine`);
    return data;
  },

  /**
   * Manufacturer recommends a distributor
   * POST /api/onboarding/distributors/recommendations
   */
  async recommendDistributor(payload: RecommendDistributorRequest): Promise<MessageAndResultResponseDistributorRecommendationResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseDistributorRecommendationResponse>(
      `${BASE_PATH}/distributors/recommendations`,
      payload
    );
    return data;
  },

  /**
   * Bank reviews recommendation (Approve/Reject)
   * POST /api/onboarding/distributors/recommendations/review
   */
  async reviewRecommendation(payload: ReviewDistributorRequest): Promise<MessageAndResultResponseDistributorRecommendationResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseDistributorRecommendationResponse>(
      `${BASE_PATH}/distributors/recommendations/review`,
      {
        recommendationId: payload.recommendationId,
        approve: payload.approve !== undefined ? payload.approve : !!payload.approved,
        rejectionReason: payload.rejectionReason || '',
      }
    );
    return data;
  },

  /**
   * Upload distributor document file (FormData)
   * POST /api/onboarding/distributors/documents/upload
   */
  async uploadDocument(formData: FormData): Promise<{ url?: string; downloadUrl?: string; documentUrl?: string; [key: string]: any }> {
    const { data } = await apiClient.post(
      `${BASE_PATH}/distributors/documents/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /**
   * Distributor submits documentation URL
   * POST /api/onboarding/distributors/recommendations/{id}/docs
   */
  async submitDistributorDocs(id: string, payload: SubmitDistributorDocsRequest): Promise<MessageAndResultResponseDistributorRecommendationResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseDistributorRecommendationResponse>(
      `${BASE_PATH}/distributors/recommendations/${id}/docs`,
      payload
    );
    return data;
  },

  /**
   * Distributor submits documentation (alias endpoint)
   * POST /api/onboarding/distributors/recommendations/{id}/documents-submitted
   */
  async submitDistributorDocsSubmitted(id: string, payload: SubmitDistributorDocsRequest): Promise<MessageAndResultResponseDistributorRecommendationResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseDistributorRecommendationResponse>(
      `${BASE_PATH}/distributors/recommendations/${id}/documents-submitted`,
      payload
    );
    return data;
  },

  /**
   * List staff users under distributor
   * GET /api/onboarding/distributors/users
   */
  async getDistributorUsers(): Promise<UserResponse[]> {
    const { data } = await apiClient.get<UserResponse[]>(`${BASE_PATH}/distributors/users`);
    return data;
  },

  /**
   * Onboard staff user under distributor
   * POST /api/onboarding/distributors/users
   */
  async onboardDistributorUser(payload: OnboardDistributorUserRequest): Promise<MessageAndResultResponseUserResponse> {
    const { data } = await apiClient.post<MessageAndResultResponseUserResponse>(`${BASE_PATH}/distributors/users`, payload);
    return data;
  },

  /**
   * Get distributor user details
   * GET /api/onboarding/distributors/users/{id}
   */
  async getDistributorUser(id: string): Promise<UserResponse> {
    const { data } = await apiClient.get<UserResponse>(`${BASE_PATH}/distributors/users/${id}`);
    return data;
  },

  /**
   * Update distributor user details
   * PATCH /api/onboarding/distributors/users/{id}
   */
  async updateDistributorUser(id: string, payload: UpdateDistributorUserRequest): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/distributors/users/${id}`, payload);
    return data;
  },

  /**
   * Deactivate/Delete distributor user
   * DELETE /api/onboarding/distributors/users/{id}
   */
  async deactivateDistributorUser(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/distributors/users/${id}`);
  },

  async deleteDistributorUser(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/distributors/users/${id}`);
  },

  /**
   * Set distributor admin status
   * PATCH /api/onboarding/distributors/admins/{id}/status?active=boolean
   */
  async setDistributorAdminStatus(id: string, activeOrStatus: boolean | string): Promise<UserResponse> {
    const params = typeof activeOrStatus === 'boolean' ? { active: activeOrStatus } : { status: activeOrStatus };
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/distributors/admins/${id}/status`, null, {
      params,
    });
    return data;
  },

  /**
   * Activate distributor admin
   * PATCH /api/onboarding/distributors/admins/{id}/activate
   */
  async activateDistributorAdmin(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/distributors/admins/${id}/activate`);
    return data;
  },

  /**
   * Deactivate distributor admin
   * PATCH /api/onboarding/distributors/admins/{id}/deactivate
   */
  async deactivateDistributorAdmin(id: string): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(`${BASE_PATH}/distributors/admins/${id}/deactivate`);
    return data;
  },

  /**
   * Alias for getDistributorDashboardStats
   */
  async getDashboardStats(): Promise<DistributorDashboardStatsResponse> {
    return this.getDistributorDashboardStats();
  },

  /**
   * Alias for getDistributorUser
   */
  async getDistributorUserById(id: string): Promise<UserResponse> {
    return this.getDistributorUser(id);
  },
};


/**
 * ====================================================================
 * 6. Audit Logs API (2 Endpoints)
 * Controller: Audit Logs
 * ====================================================================
 */
export const auditLogsApi = {
  /**
   * Get system audit logs (scoped to caller's organization)
   * GET /api/onboarding/audit-logs
   */
  async getAuditLogs(): Promise<AuditLogResponse[]> {
    const { data } = await apiClient.get<AuditLogResponse[]>(`${BASE_PATH}/audit-logs`);
    return data;
  },

  /**
   * Get all audit logs across all entities (Platform Admin)
   * GET /api/onboarding/audit-logs/all
   */
  async getAllAuditLogs(): Promise<AuditLogResponse[]> {
    const { data } = await apiClient.get<AuditLogResponse[]>(`${BASE_PATH}/audit-logs/all`);
    return data;
  },

  /**
   * Get audit logs for a specific entity (BANK, MANUFACTURER, DISTRIBUTOR)
   * GET /api/onboarding/audit-logs/entity/{tenantType}/{tenantId}
   */
  async getAuditLogsForEntity(tenantType: string, tenantId: string): Promise<AuditLogResponse[]> {
    const { data } = await apiClient.get<AuditLogResponse[]>(`${BASE_PATH}/audit-logs/entity/${tenantType}/${tenantId}`);
    return data;
  },

  /**
   * Get audit logs for a specific user
   * GET /api/onboarding/audit-logs/user/{userId}
   */
  async getAuditLogsForUser(userId: string): Promise<AuditLogResponse[]> {
    const { data } = await apiClient.get<AuditLogResponse[]>(`${BASE_PATH}/audit-logs/user/${userId}`);
    return data;
  },

  /**
   * Record audit log event
   * POST /api/onboarding/audit-logs/record
   */
  async recordAuditLog(payload: AuditLogRecordRequest): Promise<AuditLogResponse> {
    const { data } = await apiClient.post<AuditLogResponse>(`${BASE_PATH}/audit-logs/record`, payload);
    return data;
  },
};
