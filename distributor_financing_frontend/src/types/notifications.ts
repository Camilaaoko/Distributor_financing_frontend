/**
 * Notification Service Types
 * Generated from Yvonne APIs: "D:\EMTECH\Distributor Financing\Yvonne APIs\notifications.json"
 */

export interface MessageAndResultResponse {
  message?: string;
  result?: Record<string, unknown> | null;
  success?: boolean;
}

export interface WelcomeEmailRequest {
  email: string;
  fullName: string;
  tempPassword: string;
}

export interface RepaymentRejectedNotificationRequest {
  makerEmail: string;
  facilityNumber: string;
  amount: string;
  reason: string;
}

export interface RepaymentInitiatedNotificationRequest {
  distributorCheckerEmail: string;
  facilityNumber: string;
  amount: string;
  makerName: string;
}

export interface RepaymentDisbursedNotificationRequest {
  distributorCheckerEmail: string;
  facilityNumber: string;
  amount: string;
}

export interface PasswordResetLinkRequest {
  email: string;
  resetLink: string;
}

export interface PasswordResetConfirmationRequest {
  email: string;
}

export interface PasswordChangedNotificationRequest {
  email: string;
}

export interface ManufacturerRecommendationOutcomeRequest {
  manufacturerEmail: string;
  distributorName: string;
  approved: boolean;
  reason?: string;
}

export interface LoanRequestSubmittedNotificationRequest {
  distributorCheckerEmail: string;
  loanRequestId: string;
  makerName: string;
  amount: string;
}

export interface LoanActionRejectedNotificationRequest {
  makerEmail: string;
  loanRequestId: string;
  reason: string;
}

export interface FundsDisbursedNotificationRequest {
  manufacturerMakerEmail: string;
  loanRequestId: string;
  amount: string;
}

export interface FundsDisbursedConfirmationNeededNotificationRequest {
  manufacturerCheckerEmail: string;
  loanRequestId: string;
  amount: string;
}

export interface DistributorRejectedNotificationRequest {
  distributorEmail: string;
  reason: string;
}

export interface DistributorRecommendedNotificationRequest {
  distributorName: string;
  distributorEmail: string;
  distributorPhone: string;
  manufacturerName: string;
  docsLink: string;
}

export interface DistributorDocsSubmittedNotificationRequest {
  bankAdminEmail?: string;
  distributorName?: string;
  manufacturerName?: string;
}

export interface DistributorCheckerApprovedNotificationRequest {
  bankCheckerEmail: string;
  loanRequestId: string;
  amount: string;
  approvedByName: string;
}

export interface DistributorApprovedNotificationRequest {
  distributorEmail: string;
  tempPassword: string;
}

export interface DisbursementConfirmedNotificationRequest {
  recipientEmail: string;
  loanRequestId: string;
  amount: string;
}

export interface DisbursementAwaitingApprovalNotificationRequest {
  bankCheckerEmail: string;
  loanRequestId: string;
  amount: string;
  processedByName: string;
}

export interface BankRepaymentReviewNeededNotificationRequest {
  bankCheckerEmail: string;
  facilityNumber: string;
  amount: string;
  outstandingBalance?: string;
  penalty?: string;
}

export interface BankRepaymentRejectedNotificationRequest {
  bankMakerEmail: string;
  facilityNumber: string;
  amount: string;
  reason: string;
}

export interface BankRepaymentReceivedNotificationRequest {
  bankMakerEmail: string;
  facilityNumber: string;
  amount: string;
}

export interface BankRepaymentApprovedNotificationRequest {
  distributorCheckerEmail: string;
  facilityNumber: string;
  amountReceived: string;
  outstandingBalance?: string;
  penalty?: string;
  reason?: string;
}

export interface BankCheckerApprovedNotificationRequest {
  bankMakerEmail: string;
  loanRequestId: string;
  amount: string;
  approvedByName: string;
}

export interface BankAdminRecommendationNotificationRequest {
  bankAdminEmail: string;
  distributorName: string;
  distributorEmail: string;
  distributorPhone: string;
  manufacturerName: string;
}

export interface InAppNotificationResponse {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Aliases for backwards compatibility
export type InAppNotification = InAppNotificationResponse;
export type NotificationMessageAndResultResponse = MessageAndResultResponse;
export type RepaymentRejectedRequest = RepaymentRejectedNotificationRequest;
export type RepaymentInitiatedRequest = RepaymentInitiatedNotificationRequest;
export type RepaymentDisbursedRequest = RepaymentDisbursedNotificationRequest;
export type PasswordChangedRequest = PasswordChangedNotificationRequest;
export type LoanRequestSubmittedRequest = LoanRequestSubmittedNotificationRequest;
export type LoanActionRejectedRequest = LoanActionRejectedNotificationRequest;
export type FundsDisbursedRequest = FundsDisbursedNotificationRequest;
export type FundsDisbursedConfirmationNeededRequest = FundsDisbursedConfirmationNeededNotificationRequest;
export type DistributorRejectedRequest = DistributorRejectedNotificationRequest;
export type DistributorRecommendedRequest = DistributorRecommendedNotificationRequest;
export type DistributorDocsSubmittedRequest = DistributorDocsSubmittedNotificationRequest;
export type DistributorCheckerApprovedRequest = DistributorCheckerApprovedNotificationRequest;
export type DistributorApprovedRequest = DistributorApprovedNotificationRequest;
export type DisbursementConfirmedRequest = DisbursementConfirmedNotificationRequest;
export type DisbursementAwaitingApprovalRequest = DisbursementAwaitingApprovalNotificationRequest;
export type BankRepaymentReviewNeededRequest = BankRepaymentReviewNeededNotificationRequest;
export type BankRepaymentRejectedRequest = BankRepaymentRejectedNotificationRequest;
export type BankRepaymentReceivedRequest = BankRepaymentReceivedNotificationRequest;
export type BankRepaymentApprovedRequest = BankRepaymentApprovedNotificationRequest;
export type BankCheckerApprovedRequest = BankCheckerApprovedNotificationRequest;
export type BankAdminRecommendationRequest = BankAdminRecommendationNotificationRequest;

