/**
 * Onboarding Service API Types
 * Auto-generated from OpenAPI 3.1.0 specification (C:/Users/Mo12a/Downloads/on.json)
 * Base Path: /api/onboarding
 */

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
  | string;

export type TenantType = 'BANK' | 'MANUFACTURER' | 'DISTRIBUTOR' | 'PLATFORM';

export type OnboardingUserRole =
  | 'PLATFORM_ADMIN'
  | 'BANK_ADMIN'
  | 'BANK_USER'
  | 'BANK_MAKER'
  | 'BANK_CHECKER'
  | 'MANUFACTURER_ADMIN'
  | 'MANUFACTURER_USER'
  | 'MANUFACTURER_MAKER'
  | 'MANUFACTURER_CHECKER'
  | 'DISTRIBUTOR_ADMIN'
  | 'DISTRIBUTOR_USER'
  | 'DISTRIBUTOR_MAKER'
  | 'DISTRIBUTOR_CHECKER'
  | string;

export type OnboardingUserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | string;
export type BankStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'REJECTED' | string;
export type EntityStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | string;

export interface MessageAndResultResponse<T = any> {
  message?: string;
  success?: boolean;
  data?: T;
  result?: T;
}

export interface UpdateBankAdminRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  nationalIdNumber?: string;
  employeeId?: string;
}

export interface UserResponse {
  id?: string;
  parentEntityId?: string;
  branchCode?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  nationalIdNumber?: string;
  employeeId?: string;
  accountNumber?: string;
  role?: string;
  roleId?: string;
  roleName?: string;
  permissions?: string[];
  status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | string;
  userStatus?: string;
  credentialsIssued?: boolean;
  createdAt?: string;
  manufacturerName?: string;
  bankName?: string;
  distributorName?: string;
  location?: string;
  businessPermitNumber?: string;
  recommendationId?: string;
  kycStatus?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface RoleResponse {
  id?: string;
  name?: string;
  roleName?: string;
  code?: string;
  description?: string;
  tenantType?: 'BANK' | 'MANUFACTURER' | 'DISTRIBUTOR' | 'PLATFORM' | string;
  tenantId?: string;
  tenantName?: string;
  active?: boolean;
  status?: string;
  permissions?: string[];
  createdById?: string;
  isAssigned?: boolean;
  assignedToUserId?: string;
  assignedToUserEmail?: string;
  assignedToUserName?: string;
  assigned?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ManufacturerResponse {
  id?: string;
  bankId?: string;
  bankName?: string;
  name?: string;
  businessPermitNumber?: string;
  accountNumber?: string;
  location?: string;
  status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | string;
  bankAdminId?: string;
  bankAdminName?: string;
  bankAdminEmail?: string;
  createdAt?: string;
}

export type MessageAndResultResponseManufacturerResponse = MessageAndResultResponse<ManufacturerResponse>;

export interface UpdateManufacturerUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface UpdateDistributorUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface UpdateBankRequest {
  name?: string;
  branch?: string;
  location?: string;
}

export interface BankResponse {
  id?: string;
  name?: string;
  bankCode?: string;
  branch?: string;
  branchCode?: string;
  location?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'REJECTED' | string;
  createdAt?: string;
}

export interface UpdateBankUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface OnboardManufacturerUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalIdNumber: string;
  email: string;
  employeeId: string;
  roleId: string;
}

export type MessageAndResultResponseUserResponse = MessageAndResultResponse<UserResponse>;

export interface RecommendDistributorRequest {
  distributorName: string;
  email: string;
  phoneNumber: string;
  name?: string;
  phone?: string;
  contactPhone?: string;
  contactEmail?: string;
  businessName?: string;
}

export interface DistributorRecommendationResponse {
  id?: string;
  manufacturerId?: string;
  manufacturerName?: string;
  recommendedByUserId?: string;
  distributorName?: string;
  email?: string;
  phoneNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: string;
  docsSubmitted?: boolean;
  docsSubmittedAt?: string;
  businessRegistrationNumber?: string;
  accountNumber?: string;
  location?: string;
  firstName?: string;
  lastName?: string;
  nationalIdNumber?: string;
  employeeId?: string;
  kraPin?: string;
  consentToOpenBankAccount?: boolean;
  bankStatementsUrl?: string;
  nationalIdCopyUrl?: string;
  kraPinCertificateUrl?: string;
  businessRegistrationCertificateUrl?: string;
  documentUrl?: string;
  documents?: DocumentItemDto[];
  reviewedByBankUserId?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
}

export interface DocumentItemDto {
  id?: string;
  category?: string;
  documentType?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  status?: string;
  required?: boolean;
  preview?: string;
  url?: string;
  downloadUrl?: string;
}

export type MessageAndResultResponseDistributorRecommendationResponse = MessageAndResultResponse<DistributorRecommendationResponse>;

export interface OnboardManufacturerAdminRequest {
  bankId?: string;
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

export interface DistributorResponse {
  id?: string;
  bankId?: string;
  bankName?: string;
  manufacturerId?: string;
  manufacturerName?: string;
  recommendationId?: string;
  businessPermitNumber?: string;
  businessName?: string;
  accountNumber?: string;
  location?: string;
  status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  bankAdminId?: string;
  bankAdminName?: string;
  creditLimit?: number;
  interestRate?: number;
  maxTenorDays?: number;
  financingModelId?: number;
  loanProvisioningStatus?: string;
  createdAt?: string;
}

export type MessageAndResultResponseDistributorResponse = MessageAndResultResponse<DistributorResponse>;

export interface OnboardDistributorUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalIdNumber: string;
  email: string;
  employeeId: string;
  roleId: string;
}

export interface SubmitDistributorDocsRequest {
  recommendationId?: string;
  businessName?: string;
  businessRegistrationNumber?: string;
  accountNumber?: string;
  location?: string;
  firstName?: string;
  lastName?: string;
  nationalIdNumber?: string;
  phoneNumber?: string;
  employeeId?: string;
  email?: string;
  kraPin?: string;
  consentToOpenBankAccount?: boolean;
  bankStatementsUrl?: string;
  nationalIdCopyUrl?: string;
  kraPinCertificateUrl?: string;
  businessRegistrationCertificateUrl?: string;
  documentUrl?: string;
  documents?: DocumentItemDto[] | any[];
  docsSubmitted?: boolean;
}

export interface ReviewDistributorRequest {
  recommendationId?: string;
  approve?: boolean;
  approved?: boolean;
  rejectionReason?: string;
  status?: string;
  action?: string;
  creditLimit?: number;
  interestRate?: number;
  maxTenorDays?: number;
  financingModelId?: number;
}

export interface DistributorApplicationRequest {
  businessName?: string;
  businessRegistrationNumber?: string;
  accountNumber?: string;
  location?: string;
  firstName?: string;
  lastName?: string;
  nationalIdNumber?: string;
  phoneNumber?: string;
  employeeId?: string;
  email?: string;
  kraPin?: string;
  consentToOpenBankAccount?: boolean;
  bankStatementsUrl?: string;
  nationalIdCopyUrl?: string;
  kraPinCertificateUrl?: string;
  businessRegistrationCertificateUrl?: string;
  documentUrl?: string;
  recommendationId?: string;
  manufacturerId?: string;
}

export interface OnboardDistributorAdminRequest {
  bankId?: string;
  manufacturerId?: string;
  recommendationId?: string;
  businessPermitNumber?: string;
  businessName: string;
  businessRegistrationNumber?: string;
  businessAccountNumber: string;
  location: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  employeeId: string;
  creditLimit?: number;
  interestRate?: number;
  maxTenorDays?: number;
  financingModelId?: number;
}

export interface OnboardBankRequest {
  bankCode?: string;
  branchCode?: string;
  bankName?: string;
  branchName?: string;
  name?: string;
  branch?: string;
}

export type MessageAndResultResponseBankResponse = MessageAndResultResponse<BankResponse>;

export interface OnboardBankUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalIdNumber: string;
  email: string;
  employeeId: string;
  roleId: string;
}

export interface OnboardBankAdminRequest {
  bankId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  employeeId: string;
}

export interface AuditLogRecordRequest {
  userId: string;
  userFullName?: string;
  userRole?: string;
  action: string;
  actionCategory?: string;
  details?: string;
  tenantType?: 'BANK' | 'MANUFACTURER' | 'DISTRIBUTOR';
  tenantId?: string;
}

export interface AuditLogResponse {
  id?: string;
  userId?: string;
  userFullName?: string;
  userRole?: string;
  action?: string;
  actionCategory?: string;
  details?: string;
  tenantType?: 'BANK' | 'MANUFACTURER' | 'DISTRIBUTOR';
  tenantId?: string;
  timestamp?: string;
}

export interface PermissionDto {
  id?: string;
  name?: string;
  code?: string;
  description?: string;
  action?: string;
  category?: string;
  applicableTenantType?: string;
}

export interface UserProfilePermissionsDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  roleId?: string;
  roleName?: string;
  tenantType?: string;
  tenantId?: string;
  tenantName?: string;
  permissions?: string[];
}

export interface ManufacturerDashboardStatsResponse {
  totalRecommendedDistributors?: number;
  approvedDistributors?: number;
  pendingDistributors?: number;
  rejectedDistributors?: number;
  totalManufacturerUsers?: number;
  roleDistribution?: Record<string, number>;
  manufacturerUsers?: UserResponse[];
}

export interface DistributorDashboardStatsResponse {
  totalDistributorUsers?: number;
  roleDistribution?: Record<string, number>;
  distributorUsers?: UserResponse[];
}

export interface BankBranchDetailsResponse {
  bank?: BankResponse;
  admin?: UserResponse;
  users?: UserResponse[];
  roles?: RoleResponse[];
  totalUsers?: number;
  activeUsers?: number;
  totalManufacturers?: number;
  totalDistributors?: number;
}

export interface Branch {
  branchCode?: string;
  branchName?: string;
  name?: string;
  value?: string;
  id?: string;
  label?: string;
  code?: string;
}

export interface BankMetricsResponse {
  totalBanks?: number;
  activeBanks?: number;
  suspendedBanks?: number;
}

export interface BankSummaryDto {
  bankCode?: string;
  bankName?: string;
  code?: string;
  name?: string;
  id?: string;
  value?: string;
  label?: string;
}

export interface BankDashboardStatsResponse {
  totalManufacturers?: number;
  totalDistributors?: number;
  pendingDistributors?: number;
  approvedDistributors?: number;
  totalBankUsers?: number;
  roleDistribution?: Record<string, number>;
  bankUsers?: UserResponse[];
}

export interface BankAdminSummaryResponse {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  nationalIdNumber?: string;
  employeeId?: string;
  role?: 'PLATFORM_ADMIN' | 'BANK_ADMIN' | 'BANK_USER' | 'MANUFACTURER_ADMIN' | 'MANUFACTURER_USER' | 'DISTRIBUTOR_ADMIN' | 'DISTRIBUTOR_USER';
  userStatus?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  credentialsIssued?: boolean;
  bankId?: string;
  bankName?: string;
  bankCode?: string;
  branchCode?: string;
  branch?: string;
  bankStatus?: 'ACTIVE' | 'SUSPENDED';
  createdAt?: string;
}

export type Bank = BankResponse;
export type Distributor = DistributorResponse;
export type Manufacturer = ManufacturerResponse;
export type Role = RoleResponse;
export type OnboardingUser = UserResponse;

export type UpdateManufacturerUserPayload = UpdateManufacturerUserRequest;
export type UpdateDistributorUserPayload = UpdateDistributorUserRequest;
export type CreateRecommendationPayload = RecommendDistributorRequest;
export type ReviewRecommendationPayload = ReviewDistributorRequest;
export type CreateBankPayload = OnboardBankRequest;
export type UpdateBankPayload = UpdateBankRequest;
export type BankAdminPayload = OnboardBankAdminRequest;
export type ManufacturerOption = { id: string; name: string; value?: string; label?: string; [key: string]: any };
export type CreateManufacturerUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  employeeId?: string;
  role?: string;
  manufacturerName?: string;
  accountNumber?: string;
  location?: string;
  businessPermitNumber?: string;
};
export type CreateDistributorUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  employeeId?: string;
  role?: string;
};
