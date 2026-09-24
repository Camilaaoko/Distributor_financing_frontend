export type UserRole =
  | 'PLATFORM_ADMIN'
  | 'BANK_ADMIN'
  | 'BANK_CHECKER'
  | 'BANK_MAKER'
  | 'BANK_USER'
  | 'MANUFACTURER_ADMIN'
  | 'MANUFACTURER_MAKER'
  | 'MANUFACTURER_CHECKER'
  | 'MANUFACTURER_USER'
  | 'DISTRIBUTOR_ADMIN'
  | 'DISTRIBUTOR_MAKER'
  | 'DISTRIBUTOR_CHECKER'
  | 'DISTRIBUTOR_USER'
  | string;


export interface User {
  id?: string;
  userId?: string;
  email: string;
  username: string;
  role: UserRole;
  roleCode?: string;
  roleId?: string;
  roleName?: string;
  appRole?: string;
  permissions?: string[];
  mustResetPassword?: boolean;
  bankId?: string;
  bankName?: string;
  bankCode?: string;
  distributorId?: string;
  distributorName?: string;
  manufacturerId?: string;
  manufacturerName?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
}

// --- Platform Admin domain ---

export type BankAdminStatus = 'Active' | 'Inactive' | 'Suspended' | 'Pending' | 'Locked';

export type PlatformRoleName =
  | 'Platform Super Admin'
  | 'Platform Admin'
  | 'Support Admin'
  | 'Read Only Admin'
  | 'Bank Admin';

export interface Bank {
  id: string;
  name: string;
  bankCode?: string;
  branch?: string;
  branchCode?: string;
  shortCode?: string;
  adminCount?: number;
  status: 'Active' | 'Inactive' | 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  createdAt?: string;
}

export interface BankAdmin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId: string;
  employeeNumber: string;
  bankId: string;
  bankName: string;
  department: string;
  role: PlatformRoleName;
  username: string;
  status: BankAdminStatus;
  avatarColor: string;
  lastLogin: string;
  createdDate: string;
}

// --- Platform Admin API (Spring Boot backend) ---

/** Status values accepted/returned by the bank-admin backend API. */
export type BankAdminApiStatus = 'ACTIVE' | 'PENDING' | 'DISABLED' | 'LOCKED';

/** Role values accepted/returned by the bank-admin backend API. */
export type BankAdminApiRole = 'BANK_ADMIN' | 'SUPPORT_ADMIN' | 'READ_ONLY_ADMIN';

export interface BankAdminDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId?: string;
  employeeNumber: string;
  bankId: string;
  bankName: string;
  department?: string;
  role: BankAdminApiRole;
  username?: string;
  status: BankAdminApiStatus;
  lastLogin?: string | null;
  createdDate: string;
}

// --- Authentication Service API ---

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId?: string;
  email: string;
  username: string;
  role: UserRole;
  roleCode?: string;
  roleName?: string;
  appRole?: string;
  permissions?: string[];
  mustResetPassword: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  username: string;
  newPassword: string;
}

export interface RegisterAdminRequest {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  role: string;
  entityId: number;
  active: boolean;
}

export interface RegisterAdminResponse {
  additionalProp1: string;
  additionalProp2: string;
  additionalProp3: string;
}

// --- User Management API (POST /users) ---

/**
 * Role values accepted by the Authentication Service POST /users endpoint.
 * Matches the enum defined in the onboarding-api.json spec exactly.
 * Use this (not the broader UserRole) when creating users via authService.createUser().
 */
export type CreateUserRole =
  | 'PLATFORM_ADMIN'
  | 'BANK_ADMIN'
  | 'BANK_MAKER'
  | 'BANK_CHECKER'
  | 'DISTRIBUTOR_MAKER'
  | 'DISTRIBUTOR_CHECKER'
  | 'MANUFACTURER_MAKER'
  | 'MANUFACTURER_CHECKER';

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  employeeId: string;
  role: CreateUserRole;
  linkedEntityId?: string;
}

/** Approval status values returned by the Authentication Service spec. */
export type UserApprovalStatus = 'NOT_APPLICABLE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CreateUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  employeeId: string;
  role: UserRole;
  approvalStatus: UserApprovalStatus;
  active: boolean;
  mustResetPassword: boolean;
}

export interface ApproveDistributorRequest {
  distributorEntityId: string;
  approved: boolean;
  rejectionReason: string;
}

export interface ActivateUserRequest {
  active: boolean;
}

/** Spring Data Page<T> response shape. */
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * Generic response wrapper used by the Authentication Service.
 * Spec shape: { message: string; success: boolean }
 * The optional `result` field is retained for backward compatibility with
 * older service responses that return data in a `result` envelope.
 */
export interface MessageAndResultResponse<T = unknown> {
  message: string;
  success: boolean;
  result?: T;
}

export interface ActivityLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  type: 'created' | 'updated' | 'deleted' | 'security' | 'warning';
}

export interface PlatformNotification {
  id: string;
  message: string;
  time: string;
  type: 'approval' | 'registration' | 'security' | 'lock' | 'system';
}

export interface PlatformRoleDef {
  name: PlatformRoleName;
  description: string;
  permissionCount: number;
  userCount: number;
}

// --- Bank Admin domain ---

export type BankUserRole = 'BANK_MAKER' | 'BANK_CHECKER' | string;

export type BankUserStatus = 'Active' | 'Inactive' | 'Pending' | 'Locked';

export interface BankUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId: string;
  employeeNumber: string;
  role: BankUserRole;
  branchId?: string;
  branchCode?: string;
  branchName?: string;
  status: BankUserStatus;
  avatarColor: string;
  lastLogin: string;
  createdDate: string;
}

export interface DistributorApproval {
  id: string;
  companyName: string;
  manufacturerName: string;
  email?: string;
  phone?: string;
  pin?: string;
  registrationNumber?: string;
  docsSubmitted?: boolean;
  docsUrl?: string;
  documents?: Array<{ id?: string; name: string; type?: string; url?: string; size?: string }>;
  submittedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}


export interface ApprovedDistributor {
  id: string;
  companyName: string;
  pin: string;
  creditLimit: string;
  outstanding: string;
  availableLimit: string;
  status: 'Active' | 'Inactive';
  makerName: string;
  checkerName: string;
  approvedDate: string;
  manufacturerId?: string;
  manufacturerName?: string;
  email?: string;
  phone?: string;
}

export interface DistributorApprovalRequest {
  distributorEntityId: string;
  approved: boolean;
  rejectionReason: string;
}

// --- Loans Service: Bank Dashboard ---

export interface AgingBucket {
  range: string;
  count: number;
  amount: number;
}

export interface LoanDashboardResponse {
  totalDisbursed: number;
  totalOutstanding: number;
  totalRepaid: number;
  activeLoans: number;
  overdueLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  agingBuckets: AgingBucket[];
}

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

export interface DrawdownRequestPayload {
  facilityId: string;
  amount: number;
  purpose: string;
}

// --- Notifications Service ---
export * from '@/types/notifications';


// --- Repayments Service ---

export interface RepaymentInitiateRequest {
  makerId: string;
  facilityId: string;
  amount: number;
  notes: string;
}

export interface RepaymentApproveRequest {
  checkerId: string;
  notes: string;
}

export interface RepaymentRejectRequest {
  checkerId: string;
  reason: string;
  notes: string;
}

export interface RepaymentRecord {
  id: string;
  facilityId: string;
  distributorId: string;
  totalAmount: number;
  outstandingBalanceBefore: number;
  outstandingBalanceAfter: number;
  status: 'PENDING_CONFIRMATION' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  makerId: string;
  checkerId: string;
  rejectionReason: string;
  initiatedAt: string;
  confirmedAt: string;
  rejectedAt: string;
  processedAt: string;
  reference: string;
  notes: string;
  isFullRepayment: boolean;
  newAvailableLimit: number;
  penaltiesAllocated: number;
  principalAllocated: number;
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

export interface MakeRepaymentPayload {
  facilityId: string;
  scheduleId: string;
  amount: number;
}

export interface MakeRepaymentResponse {
  success: boolean;
  transactionRef: string;
}

export interface RepaymentInitiateRequest {
  makerId: string;
  facilityId: string;
  amount: number;
  notes: string;
}

export interface RepaymentApproveRequest {
  checkerId: string;
  notes: string;
}

export interface RepaymentRejectRequest {
  checkerId: string;
  reason: string;
  notes: string;
}

export interface RepaymentApprovePayload {
  checkerId: string;
  notes: string;
}

export interface RepaymentRejectPayload {
  checkerId: string;
  reason: string;
  notes: string;
}

export interface RepaymentInitiatePayload {
  makerId: string;
  facilityId: string;
  amount: number;
  notes: string;
}

export interface RepaymentApprovePayload {
  checkerId: string;
  notes: string;
}

export interface RepaymentRejectPayload {
  checkerId: string;
  reason: string;
  notes: string;
}

// --- Onboarding Service ---

export type BankStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export interface BankResponse {
  id: string;
  name: string;
  bankCode?: string;
  branch?: string;
  branchCode?: string;
  status: BankStatus;
  createdAt: string;
}

export interface BankSummaryDto {
  bankCode: string;
  bankName: string;
}

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

export interface OnboardBankRequest {
  bankCode: string;
  branchCode?: string;
  bankName?: string;
  name?: string;
  location?: string;
}

export interface UpdateBankRequest {
  name?: string;
  branch?: string;
  location?: string;
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

export interface OnboardBankUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  employeeId: string;
  role: string;
}

export interface OnboardManufacturerUserRequest {
  manufacturerName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  accountNumber: string;
  location: string;
  businessPermitNumber?: string;
  employeeId?: string;
  role: string;
}

export interface UpdateManufacturerUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface OnboardDistributorUserRequest {
  recommendationId: string;
  businessPermitNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  employeeId: string;
  role: string;
}

export interface UpdateDistributorUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface DistributorRecommendationResponse {
  id: string;
  manufacturerId?: string;
  recommendedByUserId?: string;
  distributorName: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
  docsSubmitted?: boolean;
  docsSubmittedAt?: string;
  reviewedByBankUserId?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface RecommendDistributorRequest {
  distributorName: string;
  email: string;
  phoneNumber: string;
}

export interface ReviewDistributorRequest {
  recommendationId: string;
  approved: boolean;
  rejectionReason?: string;
}

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
  role: string;
  roleId?: string;
  roleName?: string;
  permissions?: string[];
  kycStatus?: string;
  status: string;
  credentialsIssued?: boolean;
  createdAt: string;
  manufacturerName?: string;
  businessPermitNumber?: string;
  location?: string;
  recommendationId?: string;
}

export interface MessageAndResultResponseUserResponse {
  message: string;
  success: boolean;
  data: UserResponse;
}


export interface MessageAndResultResponseDistributorRecommendationResponse {
  message: string;
  success: boolean;
  data: DistributorRecommendationResponse;
}

// --- Dynamic RBAC & Permissions ---

export type StakeholderType = 'PLATFORM' | 'BANK' | 'MANUFACTURER' | 'DISTRIBUTOR';

export interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
  stakeholderType: StakeholderType;
  description?: string;
}

export interface DynamicRole {
  id: string;
  name: string;
  code: string;
  stakeholderType: StakeholderType;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
  createdAt?: string;
}

export interface CreateRolePayload {
  name: string;
  code: string;
  stakeholderType: StakeholderType;
  description?: string;
  permissionCodes: string[];
}

export interface UpdateRolePayload {
  name: string;
  description?: string;
  permissionCodes: string[];
}

// --- Reports Service API Types ---
export * from '@/types/reports';

// --- Onboarding Service API Types ---
export * from '@/types/onboarding';

