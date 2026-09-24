/**
 * Notifications API Service (Consuming Yvonne APIs notifications.json - 27 Endpoints)
 * Spec: "D:\EMTECH\Distributor Financing\Yvonne APIs\notifications.json"
 */

import { apiClient } from '@/lib/axios';
import type {
  MessageAndResultResponse,
  WelcomeEmailRequest,
  RepaymentRejectedNotificationRequest,
  RepaymentInitiatedNotificationRequest,
  RepaymentDisbursedNotificationRequest,
  PasswordResetLinkRequest,
  PasswordResetConfirmationRequest,
  PasswordChangedNotificationRequest,
  ManufacturerRecommendationOutcomeRequest,
  LoanRequestSubmittedNotificationRequest,
  LoanActionRejectedNotificationRequest,
  FundsDisbursedNotificationRequest,
  FundsDisbursedConfirmationNeededNotificationRequest,
  DistributorRejectedNotificationRequest,
  DistributorRecommendedNotificationRequest,
  DistributorDocsSubmittedNotificationRequest,
  DistributorCheckerApprovedNotificationRequest,
  DistributorApprovedNotificationRequest,
  DisbursementConfirmedNotificationRequest,
  DisbursementAwaitingApprovalNotificationRequest,
  BankRepaymentReviewNeededNotificationRequest,
  BankRepaymentRejectedNotificationRequest,
  BankRepaymentReceivedNotificationRequest,
  BankRepaymentApprovedNotificationRequest,
  BankCheckerApprovedNotificationRequest,
  BankAdminRecommendationNotificationRequest,
  InAppNotificationResponse,
} from '@/types/notifications';

const BASE_PATH = '/api/notifications';

export const notificationsService = {
  // ─── 1. In-App Notifications (2 Endpoints) ──────────────────────────

  /**
   * Get in-app notifications for user
   * GET /api/notifications/in-app/{email}
   */
  async list(email: string): Promise<InAppNotificationResponse[]> {
    const { data } = await apiClient.get<InAppNotificationResponse[]>(
      `${BASE_PATH}/in-app/${encodeURIComponent(email)}`
    );
    return Array.isArray(data) ? data : [];
  },

  /**
   * Mark in-app notification as read
   * PATCH /api/notifications/in-app/{id}/read
   */
  async markRead(notificationId: string): Promise<void> {
    await apiClient.patch(`${BASE_PATH}/in-app/${notificationId}/read`);
  },

  // ─── 2. Email / Triggered Notifications (25 Endpoints) ──────────────

  /**
   * Welcome email notification
   * POST /api/notifications/welcome-email
   */
  async welcomeEmail(payload: WelcomeEmailRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/welcome-email`, payload);
    return data;
  },

  /**
   * Repayment rejected notification
   * POST /api/notifications/repayment-rejected
   */
  async repaymentRejected(payload: RepaymentRejectedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/repayment-rejected`, payload);
    return data;
  },

  /**
   * Repayment initiated notification
   * POST /api/notifications/repayment-initiated
   */
  async repaymentInitiated(payload: RepaymentInitiatedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/repayment-initiated`, payload);
    return data;
  },

  /**
   * Repayment disbursed notification
   * POST /api/notifications/repayment-disbursed
   */
  async repaymentDisbursed(payload: RepaymentDisbursedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/repayment-disbursed`, payload);
    return data;
  },

  /**
   * Password reset link notification
   * POST /api/notifications/password-reset-link
   */
  async passwordResetLink(payload: PasswordResetLinkRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/password-reset-link`, payload);
    return data;
  },

  /**
   * Password reset confirmation notification
   * POST /api/notifications/password-reset-confirmation
   */
  async passwordResetConfirmation(payload: PasswordResetConfirmationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/password-reset-confirmation`, payload);
    return data;
  },

  /**
   * Password changed notification
   * POST /api/notifications/password-changed
   */
  async passwordChanged(payload: PasswordChangedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/password-changed`, payload);
    return data;
  },

  /**
   * Manufacturer recommendation outcome notification
   * POST /api/notifications/manufacturer-recommendation-outcome
   */
  async manufacturerOutcome(payload: ManufacturerRecommendationOutcomeRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/manufacturer-recommendation-outcome`, payload);
    return data;
  },

  /**
   * Alias for manufacturerOutcome
   */
  async manufacturerRecommendationOutcome(payload: ManufacturerRecommendationOutcomeRequest): Promise<MessageAndResultResponse> {
    return this.manufacturerOutcome(payload);
  },

  /**
   * Loan request submitted notification
   * POST /api/notifications/loan-request-submitted
   */
  async loanRequestSubmitted(payload: LoanRequestSubmittedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/loan-request-submitted`, payload);
    return data;
  },

  /**
   * Loan action rejected notification
   * POST /api/notifications/loan-action-rejected
   */
  async loanActionRejected(payload: LoanActionRejectedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/loan-action-rejected`, payload);
    return data;
  },

  /**
   * Funds disbursed notification
   * POST /api/notifications/funds-disbursed
   */
  async fundsDisbursed(payload: FundsDisbursedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/funds-disbursed`, payload);
    return data;
  },

  /**
   * Funds disbursed confirmation needed notification
   * POST /api/notifications/funds-disbursed-confirmation-needed
   */
  async fundsDisbursedConfirmationNeeded(payload: FundsDisbursedConfirmationNeededNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/funds-disbursed-confirmation-needed`, payload);
    return data;
  },

  /**
   * Distributor rejected notification
   * POST /api/notifications/distributor-rejected
   */
  async distributorRejected(payload: DistributorRejectedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/distributor-rejected`, payload);
    return data;
  },

  /**
   * Distributor recommended notification
   * POST /api/notifications/distributor-recommended
   */
  async distributorRecommended(payload: DistributorRecommendedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/distributor-recommended`, payload);
    return data;
  },

  /**
   * Distributor documents submitted notification
   * POST /api/notifications/distributor-docs-submitted
   */
  async distributorDocsSubmitted(payload: DistributorDocsSubmittedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/distributor-docs-submitted`, payload);
    return data;
  },

  /**
   * Distributor checker approved notification
   * POST /api/notifications/distributor-checker-approved
   */
  async distributorCheckerApproved(payload: DistributorCheckerApprovedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/distributor-checker-approved`, payload);
    return data;
  },

  /**
   * Distributor approved notification
   * POST /api/notifications/distributor-approved
   */
  async distributorApproved(payload: DistributorApprovedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/distributor-approved`, payload);
    return data;
  },

  /**
   * Disbursement confirmed notification
   * POST /api/notifications/disbursement-confirmed
   */
  async disbursementConfirmed(payload: DisbursementConfirmedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/disbursement-confirmed`, payload);
    return data;
  },

  /**
   * Disbursement awaiting approval notification
   * POST /api/notifications/disbursement-awaiting-approval
   */
  async disbursementAwaitingApproval(payload: DisbursementAwaitingApprovalNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/disbursement-awaiting-approval`, payload);
    return data;
  },

  /**
   * Bank repayment review needed notification
   * POST /api/notifications/bank-repayment-review-needed
   */
  async bankRepaymentReviewNeeded(payload: BankRepaymentReviewNeededNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/bank-repayment-review-needed`, payload);
    return data;
  },

  /**
   * Bank repayment rejected notification
   * POST /api/notifications/bank-repayment-rejected
   */
  async bankRepaymentRejected(payload: BankRepaymentRejectedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/bank-repayment-rejected`, payload);
    return data;
  },

  /**
   * Bank repayment received notification
   * POST /api/notifications/bank-repayment-received
   */
  async bankRepaymentReceived(payload: BankRepaymentReceivedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/bank-repayment-received`, payload);
    return data;
  },

  /**
   * Bank repayment approved notification
   * POST /api/notifications/bank-repayment-approved
   */
  async bankRepaymentApproved(payload: BankRepaymentApprovedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/bank-repayment-approved`, payload);
    return data;
  },

  /**
   * Bank checker approved notification
   * POST /api/notifications/bank-checker-approved
   */
  async bankCheckerApproved(payload: BankCheckerApprovedNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/bank-checker-approved`, payload);
    return data;
  },

  /**
   * Bank admin recommendation notification
   * POST /api/notifications/bank-admin-recommendation
   */
  async bankAdminRecommendation(payload: BankAdminRecommendationNotificationRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/bank-admin-recommendation`, payload);
    return data;
  },
};