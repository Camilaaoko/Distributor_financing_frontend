/**
 * Onboarding Service API Types
 * Auto-aligned with OpenAPI 3.1.0 specification (onboarding.json)
 * Base Gateway Path: /api/onboarding
 */

// ==========================================
// 1. Core System Enums
// ==========================================

export type PermissionCode =
  | 'LOAN_REVIEW'
  | 'LOAN_APPROVE'
  | 'LOAN_DISBURSE'
  | 'REPAYMENT_REVIEW'
  | 'REPAYMENT_APPROVE'
  | 'DISTRIBUTOR_REVIEW'
  | 'MANUFACTURER_ONBOARDING'
  | 'INVOICE_CREATE'
  | 'INVOICE_APPROVE'
  | 'DISTRIBUTOR_RECOMMEND'
  | 'LOAN_REQUEST'
  | 'LOAN_VIEW'
  | 'REPAYMENT_INITIATE'
  | 'INVOICE_VIEW'
  | 'USER_MANAGEMENT'
  | 'ROLE_MANAGEMENT'
  | 'VIEW_REPORTS'
  | 'VIEW_AUDIT_LOGS'
  | 'APPLY_FINANCING'
  | 'APPROVE_DISTRIBUTOR_LOAN'
  | 'CANCEL_LOAN_REQUEST'
  | 'VIEW_MY_LOANS'
  | (string & {});

export type TenantType = 'BANK' | 'MANUFACTURER' | 'DISTRIBUTOR' | 'PLATFORM';

export type OnboardingUserRole =
  | 'PLATFORM_ADMIN'
  | 'BANK_ADMIN'
  | 'BANK_USER'
  | 'MANUFACTURER_ADMIN'
  | 'MANUFACTURER_USER'
  | 'DISTRIBUTOR_ADMIN'
  | 'DISTRIBUTOR_USER';

export type OnboardingUserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export type BankStatus = 'ACTIVE' | 'SUSPENDED';

export type EntityStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

// ==========================================
// 2. Generic Message & Result Response Wrapper
// ==========================================

export interface MessageAndResultResponse<T> {
  message: string;
  success: boolean;
  data: T;
}

// ==========================================
// 3. Role & Permission Management Types
// ==========================================

export interface PermissionDto {
  code: string;
  description: string;
  name?: string;
  category?: string;
  tenantType?: TenantType | string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: PermissionCode[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: PermissionCode[];
}

export interface RoleResponse {
  id: string;
  name: string;
  description?: string;
  tenantType?: TenantType;
  tenantId?: string;
  permissions?: PermissionCode[];
  createdById?: string;
  isAssigned?: boolean;
  assignedToUserId?: string;
  assignedToUserEmail?: string;
  assignedToUserName?: string;
  status?: string;
}

// ==========================================
// 4. Bank & Branch Management Types
// ==========================================

export interface Branch {
  branchCode: string;
  branchName: string;
  location?: string;
  city?: string;
  branch?: string;
  name?: string;
  value?: string;
  id?: string;
  label?: string;
  code?: string;
}

export interface BankSummaryDto {
  bankCode: string;
  bankName: string;
  code?: string;
  name?: string;
  id?: string;
  value?: string;
  label?: string;
}

export interface OnboardBankRequest {
  bankCode: string;
  branchCode?: string;
  bankName?: string;
  branchName?: string;
  name?: string;
  branch?: string;
  location?: string;
}

export interface OnboardBankBranchRequest {
  bankId?: string;
  branchCode: string;
  branchName?: string;
  branch?: string;
  location?: string;
}

export interface UpdateBankBranchRequest {
  branchName?: string;
  branchCode?: string;
  location?: string;
}

export interface BankBranchResponse {
  id: string;
  bankId?: string;
  bankName?: string;
  bankCode?: string;
  branchName?: string;
  branchCode?: string;
  branch?: string;
  location?: string;
  status: BankStatus | 'ACTIVE' | 'SUSPENDED';
  adminsCount?: number;
  usersCount?: number;
  createdAt: string;
}

export type MessageAndResultResponseBankBranchResponse = MessageAndResultResponse<BankBranchResponse>;

export interface UpdateBankRequest {
  name?: string;
  branch?: string;
  location?: string;
}

export interface BankResponse {
  id: string;
  name: string;
  bankCode?: string;
  branch?: string;
  branchCode?: string;
  location?: string;
  status: BankStatus | 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  branchesCount?: number;
  adminsCount?: number;
  createdAt: string;
}

export type Bank = BankResponse;

export type MessageAndResultResponseBankResponse = MessageAndResultResponse<BankResponse>;

export interface BankMetricsResponse {
  totalBanks: number;
  activeBanks: number;
  suspendedBanks: number;
}

export interface BankDashboardStatsResponse {
  approvedDistributors: number;
  pendingDistributors: number;
  totalManufacturers: number;
  totalBankUsers: number;
}

export interface BankBranchDetailsResponse {
  bankCode?: string;
  bankName?: string;
  branchCode?: string;
  branchName?: string;
  bank?: BankResponse;
  admin?: UserResponse;
  users?: UserResponse[];
  roles?: RoleResponse[];
  totalUsers?: number;
  activeUsers?: number;
  totalManufacturers?: number;
  totalDistributors?: number;
}

export interface BankAdminSummaryResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  employeeId: string;
  role: OnboardingUserRole;
  userStatus: OnboardingUserStatus;
  credentialsIssued: boolean;
  bankId: string;
  bankName: string;
  bankCode: string;
  branchCode: string;
  branch: string;
  bankStatus: BankStatus;
  createdAt: string;
}

// ==========================================
// 5. User Management Types (Bank, Manufacturer, Distributor)
// ==========================================

export interface UserResponse {
  id: string;
  parentEntityId?: string;
  branchCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber?: string;
  employeeId?: string;
  accountNumber?: string;
  role: OnboardingUserRole | string;
  roleId?: string;
  roleName?: string;
  permissions?: PermissionCode[];
  status: OnboardingUserStatus | string;
  credentialsIssued?: boolean;
  createdAt: string;
  manufacturerName?: string;
  businessPermitNumber?: string;
  location?: string;
  kycStatus?: string;
  recommendationId?: string;
  bankAdminId?: string;
  bankId?: string;
}

export type ManufacturerUser = UserResponse;
export type DistributorUser = UserResponse;

export type MessageAndResultResponseUserResponse = MessageAndResultResponse<UserResponse>;

// --- Bank Users ---
export interface OnboardBankAdminRequest {
  bankId?: string;
  branchId?: string;
  roleId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  employeeId: string;
}

export interface OnboardBankUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalIdNumber: string;
  email: string;
  employeeId: string;
  roleId?: string;
  role?: string;
  branchId?: string;
}

export interface UpdateBankUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

// --- Manufacturer Users ---
export interface OnboardManufacturerAdminRequest {
  name: string;
  businessAccountNumber: string;
  location: string;
  businessPermitNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  employeeId: string;
}

export interface OnboardManufacturerUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalIdNumber: string;
  email: string;
  employeeId?: string;
  roleId?: string;
  role?: string;
  manufacturerName?: string;
  businessPermitNumber?: string;
  location?: string;
  accountNumber?: string;
}

export interface UpdateManufacturerUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

// --- Distributor Users ---
export interface OnboardDistributorAdminRequest {
  recommendationId: string;
  businessName: string;
  businessAccountNumber: string;
  location: string;
  businessPermitNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  employeeId: string;
}

export interface OnboardDistributorUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalIdNumber: string;
  email: string;
  employeeId?: string;
  roleId?: string;
  role?: string;
  recommendationId?: string;
  businessPermitNumber?: string;
}

export interface UpdateDistributorUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

// ==========================================
// 6. Manufacturer Domain Types
// ==========================================

export interface ManufacturerResponse {
  id: string;
  bankId?: string;
  name: string;
  businessPermitNumber?: string;
  accountNumber?: string;
  location?: string;
  status: EntityStatus;
  createdAt: string;
}

export interface ManufacturerDashboardStatsResponse {
  totalRecommendedDistributors: number;
  approvedDistributors: number;
  pendingDistributors: number;
  rejectedDistributors: number;
  totalManufacturerUsers: number;
  roleDistribution?: Record<string, number>;
  manufacturerUsers?: UserResponse[];
}

// ==========================================
// 7. Distributor Domain & Recommendations Types
// ==========================================

export interface RecommendDistributorRequest {
  distributorName: string;
  email: string;
  phoneNumber: string;
}

export interface ReviewDistributorRequest {
  recommendationId: string;
  approve?: boolean;
  approved?: boolean;
  rejectionReason?: string;
}

export interface DistributorRecommendationResponse {
  id: string;
  manufacturerId?: string;
  manufacturerName?: string;
  recommendedByUserId?: string;
  distributorName: string;
  contactEmail?: string;
  contactPhone?: string;
  email?: string;
  phoneNumber?: string;
  status: string;
  docsSubmitted?: boolean;
  docsSubmittedAt?: string;
  reviewedByBankUserId?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export type DistributorRecommendation = DistributorRecommendationResponse;

export type MessageAndResultResponseDistributorRecommendationResponse = MessageAndResultResponse<DistributorRecommendationResponse>;

export interface DistributorResponse {
  id: string;
  bankId?: string;
  manufacturerId?: string;
  recommendationId?: string;
  businessPermitNumber?: string;
  businessName: string;
  accountNumber?: string;
  location?: string;
  status: EntityStatus;
  createdAt: string;
}

export interface DistributorDashboardStatsResponse {
  totalDistributorUsers: number;
  roleDistribution?: Record<string, number>;
  distributorUsers?: UserResponse[];
}


// ==========================================
// 8. Audit Logs Domain Types
// ==========================================

export interface AuditLogRecordRequest {
  userId: string;
  userFullName?: string;
  userRole?: string;
  action: string;
  actionCategory?: string;
  details?: string;
  tenantType?: TenantType;
  tenantId?: string;
}

export interface AuditLogResponse {
  id: string;
  userId: string;
  userFullName?: string;
  userRole?: string;
  action: string;
  actionCategory?: string;
  details?: string;
  tenantType?: TenantType;
  tenantId?: string;
  timestamp: string;
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

export interface BankingDetailsState {
  hasExistingBankAccount: boolean | null;
  existingAccountNumber: string;
  consentToCreateBankAccount: boolean;
}

export interface BankingValidationErrors {
  hasExistingBankAccount?: string;
  existingAccountNumber?: string;
  consentToCreateBankAccount?: string;
}

export interface UpdateBankAdminRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  nationalIdNumber?: string;
  employeeId?: string;
}

export interface SubmitDistributorDocsRequest {
  recommendationId?: string;
  documentUrl?: string;
  documents?: any[];
  docsSubmitted?: boolean;
  [key: string]: any;
}

export type UpdateManufacturerUserPayload = UpdateManufacturerUserRequest;
export type UpdateDistributorUserPayload = UpdateDistributorUserRequest;
export type CreateRecommendationPayload = RecommendDistributorRequest;
export type ReviewRecommendationPayload = ReviewDistributorRequest;
export type CreateBankPayload = OnboardBankRequest;
export type UpdateBankPayload = UpdateBankRequest;
export type BankAdminPayload = OnboardBankAdminRequest;

export interface ManufacturerOption {
  id: string;
  name: string;
  industry: string;
}


