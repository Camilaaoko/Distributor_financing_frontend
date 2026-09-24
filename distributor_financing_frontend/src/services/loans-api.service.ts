/**
 * Loans Microservice API Client
 * Spec: api-docs (3).json — 80 endpoints across 10 controllers
 *
 * Controllers:
 *  1.  Loan Requests            (loanRequestsApi)         — 15 endpoints
 *  2.  Loan Approvals           (loanApprovalsApi)         —  3 endpoints
 *  3.  Distributor Loan Profiles(distributorLoanProfilesApi)—16 endpoints
 *  4.  Pricing                  (pricingApi)               —  6 endpoints
 *  5.  Financing Models         (financingModelsApi)       —  9 endpoints
 *  6.  Facilities               (facilitiesApi)            —  7 endpoints
 *  7.  Disbursements            (disbursementsApi)         —  5 endpoints
 *  8.  Internal Loans           (internalLoansApi)         — 16 endpoints
 *  9.  Underwriting             (loanUnderwritingApi)      —  6 endpoints
 * 10.  Loans (legacy)           (loansApi)                 —  5 endpoints
 * 11.  Loan Documents           (loanDocumentsApi)         —  2 endpoints
 */

import { apiClient } from '@/lib/axios';
import type {
  MessageAndResultResponse,
  Pageable,
  LoanRequestCreateDTO,
  LoanRequestUpdateRequest,
  AttachProformaInvoiceDTO,
  LoanApprovalDecisionDTO,
  CreditLimitAdjustmentDTO,
  FinancingModelRequestDTO,
  PricingRequestDTO,
  Facility,
  DisbursementTriggerDTO,
  RepaymentApplicationRequest,
  SweepRepaymentApplicationRequest,
  SetupDistributorRequest,
  CreditAssessmentResult,
  CreateLoanProfileRequest,
  LoanProfileApprovalRequest,
  OfferAcceptanceRequest,
  OfferResponseRequest,
  StatementAssessmentRequest,
  CustomLimitOverrideRequest,
  CrbAssessmentRequest,
  DocumentType,
} from '@/types/loans';

const BASE_PATH = '/api/loans';

function toPageableParams(pageable?: Pageable) {
  if (!pageable) return {};
  const params: Record<string, any> = {};
  if (pageable.page !== undefined) params.page = pageable.page;
  if (pageable.size !== undefined) params.size = pageable.size;
  if (pageable.sort && pageable.sort.length > 0) params.sort = pageable.sort;
  return params;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Loan Requests Controller — 15 endpoints
// ─────────────────────────────────────────────────────────────────────────────

export const loanRequestsApi = {
  /** GET /api/loans/requests */
  async getAllLoanRequests(pageable?: Pageable): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/requests`, {
      params: toPageableParams(pageable),
    });
    return data;
  },

  /** POST /api/loans/requests */
  async createLoanRequest(payload: LoanRequestCreateDTO, idempotencyKey?: string): Promise<MessageAndResultResponse> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/requests`, payload, { headers });
    return data;
  },

  /**
   * POST /api/loans/requests/with-document
   * Submits a loan application while uploading the signed Purchase Order document (PDF, PNG, JPG).
   */
  async createLoanRequestWithDocument(
    request: LoanRequestCreateDTO,
    poFile: File,
  ): Promise<MessageAndResultResponse> {
    const formData = new FormData();
    formData.append('poFile', poFile);
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/requests/with-document`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  /** GET /api/loans/requests/{id} */
  async getLoanRequestById(id: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/requests/${id}`);
    return data;
  },

  /** PUT /api/loans/requests/{id} */
  async updateLoanRequest(id: number | string, payload: LoanRequestUpdateRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(`${BASE_PATH}/requests/${id}`, payload);
    return data;
  },

  /** PUT /api/loans/requests/{id}/cancel */
  async cancelLoanRequest(id: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(`${BASE_PATH}/requests/${id}/cancel`);
    return data;
  },

  /**
   * PATCH /api/loans/requests/{id}/purchase-order-document
   * Attaches or replaces a PO document on an existing loan request.
   */
  async attachPoDocument(id: number | string, poFile: File): Promise<MessageAndResultResponse> {
    const formData = new FormData();
    formData.append('poFile', poFile);
    const { data } = await apiClient.patch<MessageAndResultResponse>(
      `${BASE_PATH}/requests/${id}/purchase-order-document`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  /** PATCH /api/loans/requests/{id}/manufacturer-proforma-invoice */
  async attachProformaInvoice(id: number | string, payload: AttachProformaInvoiceDTO): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.patch<MessageAndResultResponse>(
      `${BASE_PATH}/requests/${id}/manufacturer-proforma-invoice`,
      payload,
    );
    return data;
  },

  /** GET /api/loans/requests/{id}/breakdown */
  async getLoanBreakdown(id: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/requests/${id}/breakdown`);
    return data;
  },

  /** GET /api/loans/requests/status/{status} */
  async getLoanRequestsByStatus(status: string, pageable?: Pageable): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/requests/status/${encodeURIComponent(status)}`,
      { params: toPageableParams(pageable) },
    );
    return data;
  },

  /** GET /api/loans/requests/quote */
  async getFinancingQuote(params: {
    distributorId: string;
    financingModelId?: number;
    invoiceAmount?: number;
  }): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/requests/quote`, { params });
    return data;
  },

  /** GET /api/loans/requests/number/{loanRequestNumber} */
  async getLoanRequestByNumber(loanRequestNumber: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/requests/number/${encodeURIComponent(loanRequestNumber)}`,
    );
    return data;
  },

  /** GET /api/loans/requests/distributor/{distributorId} */
  async getLoanRequestsByDistributor(distributorId: string, pageable?: Pageable): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/requests/distributor/${encodeURIComponent(distributorId)}`,
      { params: toPageableParams(pageable) },
    );
    return data;
  },

  /** GET /api/loans/requests/dashboard/{distributorId} */
  async getDistributorDashboard(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/requests/dashboard/${encodeURIComponent(distributorId)}`,
    );
    return data;
  },

  /** GET /api/loans/requests/dashboard/bank/{bankId} */
  async getBankDashboard(bankId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/requests/dashboard/bank/${encodeURIComponent(bankId)}`,
    );
    return data;
  },

  /** GET /api/loans/requests/dashboard/bank/{bankId}/growth */
  async getGrowthSeries(bankId: string, months = 6): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/requests/dashboard/bank/${encodeURIComponent(bankId)}/growth`,
      { params: { months } },
    );
    return data;
  },

  /** GET /api/loans/requests/dashboard/bank/{bankId}/activity */
  async getBankActivity(bankId: string, limit = 20): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/requests/dashboard/bank/${encodeURIComponent(bankId)}/activity`,
      { params: { limit } },
    );
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Loan Approvals Controller — 3 endpoints
// ─────────────────────────────────────────────────────────────────────────────

export const loanApprovalsApi = {
  /** POST /api/loans/{loanId}/decision */
  async approveOrRejectLoan(loanId: number | string, payload: LoanApprovalDecisionDTO): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/${loanId}/decision`, payload);
    return data;
  },

  /** GET /api/loans/{loanId}/approvals */
  async getApprovalHistory(loanId: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/${loanId}/approvals`);
    return data;
  },

  /** GET /api/loans/{loanId}/approvals/latest */
  async getLatestApproval(loanId: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/${loanId}/approvals/latest`);
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Distributor Loan Profiles Controller — 16 endpoints
// ─────────────────────────────────────────────────────────────────────────────

export const distributorLoanProfilesApi = {
  /** POST /api/loans/profiles — Bank Admin: Create profile with PENDING_APPROVAL */
  async createLoanProfile(payload: CreateLoanProfileRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/profiles`, payload);
    return data;
  },

  /** GET /api/loans/profiles/{distributorId} */
  async getProfileByDistributorId(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/profiles/${encodeURIComponent(distributorId)}`,
    );
    return data;
  },

  /** GET /api/loans/profiles/id/{profileId} */
  async getProfileById(profileId: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/profiles/id/${profileId}`);
    return data;
  },

  /** GET /api/loans/profiles/status/{status} */
  async getProfilesByStatus(status: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/profiles/status/${encodeURIComponent(status)}`,
    );
    return data;
  },

  /** GET /api/loans/profiles/bank/{bankId} */
  async getProfilesByBankId(bankId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/profiles/bank/${encodeURIComponent(bankId)}`,
    );
    return data;
  },

  /** GET /api/loans/profiles/pending-offers/{distributorId} */
  async getPendingOffers(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/profiles/pending-offers/${encodeURIComponent(distributorId)}`,
    );
    return data;
  },

  /** PUT /api/loans/profiles/{distributorId}/credit-limit */
  async adjustCreditLimit(distributorId: string, payload: CreditLimitAdjustmentDTO): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(
      `${BASE_PATH}/profiles/${encodeURIComponent(distributorId)}/credit-limit`,
      payload,
    );
    return data;
  },

  /** GET /api/loans/profiles/{distributorId}/credit-score */
  async getCreditScore(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/profiles/${encodeURIComponent(distributorId)}/credit-score`,
    );
    return data;
  },

  /** POST /api/loans/profiles/{distributorId}/credit-score/refresh */
  async refreshCreditScore(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/profiles/${encodeURIComponent(distributorId)}/credit-score/refresh`,
    );
    return data;
  },

  /** POST /api/loans/profiles/{id}/approve — Bank Checker: PENDING_APPROVAL → OFFER_SENT */
  async approveProfile(id: number | string, payload?: LoanProfileApprovalRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/profiles/${id}/approve`,
      payload || {},
    );
    return data;
  },

  /** POST /api/loans/profiles/{id}/reject — Bank Checker rejects the loan profile */
  async rejectProfile(id: number | string, payload?: LoanProfileApprovalRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/profiles/${id}/reject`,
      payload || {},
    );
    return data;
  },

  /** POST /api/loans/profiles/{id}/accept-offer — Distributor accepts the bank's financing offer → ACTIVE */
  async acceptOffer(id: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/profiles/${id}/accept-offer`);
    return data;
  },

  /** POST /api/loans/profiles/{id}/reject-offer — Distributor rejects the financing offer → OFFER_REJECTED */
  async rejectOffer(id: number | string, payload?: OfferAcceptanceRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/profiles/${id}/reject-offer`,
      payload || {},
    );
    return data;
  },

  /** POST /api/loans/profiles/{id}/freeze — Temporarily suspends a profile from requesting loans */
  async freezeProfile(id: number | string, reason: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/profiles/${id}/freeze`,
      null,
      { params: { reason } },
    );
    return data;
  },

  /** POST /api/loans/profiles/{id}/unfreeze — Restores a frozen profile to ACTIVE */
  async unfreezeProfile(id: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/profiles/${id}/unfreeze`);
    return data;
  },

  /**
   * GET /api/loans/profiles/offer/respond?token=...&action=ACCEPT|REJECT
   * Public endpoint — no auth required. Called when a distributor clicks the link in the offer email.
   */
  async respondToOffer(token: string, action: 'ACCEPT' | 'REJECT', rejectionReason?: string): Promise<MessageAndResultResponse> {
    const params: Record<string, string> = { token, action };
    if (rejectionReason) params.rejectionReason = rejectionReason;
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/profiles/offer/respond`,
      { params },
    );
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Pricing Controller — 6 endpoints
// ─────────────────────────────────────────────────────────────────────────────

export const pricingApi = {
  /** GET /api/loans/pricings */
  async getAllPricings(): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/pricings`);
    return data;
  },

  /** POST /api/loans/pricings */
  async createPricing(payload: PricingRequestDTO): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/pricings`, payload);
    return data;
  },

  /** GET /api/loans/pricings/{id} */
  async getPricingById(id: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/pricings/${id}`);
    return data;
  },

  /** PUT /api/loans/pricings/{id} */
  async updatePricing(id: number | string, payload: PricingRequestDTO): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(`${BASE_PATH}/pricings/${id}`, payload);
    return data;
  },

  /** DELETE /api/loans/pricings/{id} */
  async deletePricing(id: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.delete<MessageAndResultResponse>(`${BASE_PATH}/pricings/${id}`);
    return data;
  },

  /** GET /api/loans/pricings/financing-model/{financingModelId} */
  async getPricingByFinancingModelId(financingModelId: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/pricings/financing-model/${financingModelId}`,
    );
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Financing Models Controller — 9 endpoints
// ─────────────────────────────────────────────────────────────────────────────

export const financingModelsApi = {
  /** GET /api/loans/financing-models */
  async getAllFinancingModels(pageable?: Pageable): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/financing-models`, {
      params: toPageableParams(pageable),
    });
    return data;
  },

  /** POST /api/loans/financing-models */
  async createFinancingModel(payload: FinancingModelRequestDTO): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/financing-models`, payload);
    return data;
  },

  /** GET /api/loans/financing-models/{id} */
  async getFinancingModelById(id: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/financing-models/${id}`);
    return data;
  },

  /** PUT /api/loans/financing-models/{id} */
  async updateFinancingModel(id: number | string, payload: FinancingModelRequestDTO): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(`${BASE_PATH}/financing-models/${id}`, payload);
    return data;
  },

  /** DELETE /api/loans/financing-models/{id} */
  async deleteFinancingModel(id: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.delete<MessageAndResultResponse>(`${BASE_PATH}/financing-models/${id}`);
    return data;
  },

  /** PUT /api/loans/financing-models/{id}/status */
  async toggleFinancingModelStatus(id: number | string, isActive: boolean): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(
      `${BASE_PATH}/financing-models/${id}/status`,
      null,
      { params: { isActive } },
    );
    return data;
  },

  /** GET /api/loans/financing-models/active */
  async getActiveFinancingModels(): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/financing-models/active`);
    return data;
  },

  /** GET /api/loans/financing-models/type/{modelType} */
  async getFinancingModelsByType(modelType: string, pageable?: Pageable): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/financing-models/type/${encodeURIComponent(modelType)}`,
      { params: toPageableParams(pageable) },
    );
    return data;
  },

  /** GET /api/loans/financing-models/name/{name} */
  async getFinancingModelByName(name: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/financing-models/name/${encodeURIComponent(name)}`,
    );
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Facilities Controller — 7 endpoints
// ─────────────────────────────────────────────────────────────────────────────

export const facilitiesApi = {
  /** GET /api/loans/facilities */
  async getAllFacilities(pageable?: Pageable): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/facilities`, {
      params: toPageableParams(pageable),
    });
    return data;
  },

  /** GET /api/loans/facilities/{id} */
  async getFacilityById(id: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/facilities/${id}`);
    return data;
  },

  /** PUT /api/loans/facilities/{id} */
  async updateFacility(id: number | string, payload: Facility): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(`${BASE_PATH}/facilities/${id}`, payload);
    return data;
  },

  /** DELETE /api/loans/facilities/{id} */
  async deleteFacility(id: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.delete<MessageAndResultResponse>(`${BASE_PATH}/facilities/${id}`);
    return data;
  },

  /** PUT /api/loans/facilities/{id}/status */
  async toggleFacilityStatus(id: number | string, isActive: boolean): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(
      `${BASE_PATH}/facilities/${id}/status`,
      null,
      { params: { isActive } },
    );
    return data;
  },

  /** PUT /api/loans/facilities/{id}/adjust-utilization */
  async adjustUtilizedAmount(id: number | string, amount: number): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(
      `${BASE_PATH}/facilities/${id}/adjust-utilization`,
      null,
      { params: { amount } },
    );
    return data;
  },

  /** GET /api/loans/facilities/distributor/{distributorId} */
  async getFacilitiesByDistributor(distributorId: string, pageable?: Pageable): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/facilities/distributor/${encodeURIComponent(distributorId)}`,
      { params: toPageableParams(pageable) },
    );
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. Disbursements Controller — 5 endpoints
// ─────────────────────────────────────────────────────────────────────────────

export const disbursementsApi = {
  /** GET /api/loans/disbursements/{id} */
  async getDisbursementById(id: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/disbursements/${id}`);
    return data;
  },

  /** GET /api/loans/disbursements/loan/{loanRequestId} */
  async getDisbursementsByLoanRequest(loanRequestId: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/disbursements/loan/${loanRequestId}`,
    );
    return data;
  },

  /** POST /api/loans/disbursements/trigger/{loanRequestId} */
  async triggerDisbursement(
    loanRequestId: number | string,
    payload: DisbursementTriggerDTO,
    idempotencyKey?: string,
  ): Promise<MessageAndResultResponse> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/disbursements/trigger/${loanRequestId}`,
      payload,
      { headers },
    );
    return data;
  },

  /** PUT /api/loans/disbursements/{id}/complete */
  async completeDisbursement(
    id: number | string,
    referenceNumber?: string,
    idempotencyKey?: string,
  ): Promise<MessageAndResultResponse> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    const { data } = await apiClient.put<MessageAndResultResponse>(
      `${BASE_PATH}/disbursements/${id}/complete`,
      null,
      { params: referenceNumber ? { referenceNumber } : {}, headers },
    );
    return data;
  },

  /** PUT /api/loans/disbursements/{id}/fail */
  async failDisbursement(id: number | string, failureReason: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(
      `${BASE_PATH}/disbursements/${id}/fail`,
      null,
      { params: { failureReason } },
    );
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Internal Loans Controller — 16 endpoints
// ─────────────────────────────────────────────────────────────────────────────

export const internalLoansApi = {
  /** GET /api/loans/internal/{loanId}/terms */
  async getLoanTerms(loanId: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/internal/${loanId}/terms`);
    return data;
  },

  /** POST /api/loans/internal/{loanId}/update-paid */
  async updatePaid(loanId: number | string, principalPortion: number, amount: number): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/internal/${loanId}/update-paid`,
      null,
      { params: { principalPortion, amount } },
    );
    return data;
  },

  /** POST /api/loans/internal/{loanId}/sweep-repayment */
  async applySweepRepayment(
    loanId: number | string,
    payload: SweepRepaymentApplicationRequest,
    idempotencyKey?: string,
  ): Promise<MessageAndResultResponse> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/internal/${loanId}/sweep-repayment`,
      payload,
      { headers },
    );
    return data;
  },

  /** POST /api/loans/internal/{loanId}/mark-completed */
  async markCompleted(loanId: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/internal/${loanId}/mark-completed`,
    );
    return data;
  },

  /** POST /api/loans/internal/{loanId}/apply-repayment */
  async applyRepayment(
    loanId: number | string,
    payload: RepaymentApplicationRequest,
    idempotencyKey?: string,
  ): Promise<MessageAndResultResponse> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/internal/${loanId}/apply-repayment`,
      payload,
      { headers },
    );
    return data;
  },

  /** POST /api/loans/internal/setup-distributor */
  async setupDistributor(payload: SetupDistributorRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/internal/setup-distributor`,
      payload,
    );
    return data;
  },

  /** POST /api/loans/internal/repair/activate-pending-profiles */
  async activatePendingProfiles(): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/internal/repair/activate-pending-profiles`,
    );
    return data;
  },

  /** POST /api/loans/internal/facilities */
  async createFacility(payload: Facility): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/internal/facilities`, payload);
    return data;
  },

  /** PUT /api/loans/internal/disbursements/{disbursementId}/fail */
  async failDisbursement(disbursementId: number | string, failureReason: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(
      `${BASE_PATH}/internal/disbursements/${disbursementId}/fail`,
      null,
      { params: { failureReason } },
    );
    return data;
  },

  /** PUT /api/loans/internal/disbursements/{disbursementId}/complete */
  async completeDisbursement(disbursementId: number | string, referenceNumber?: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(
      `${BASE_PATH}/internal/disbursements/${disbursementId}/complete`,
      null,
      { params: referenceNumber ? { referenceNumber } : {} },
    );
    return data;
  },

  /** POST /api/loans/internal/distributors/{distributorId}/profile */
  async createProfile(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/internal/distributors/${encodeURIComponent(distributorId)}/profile`,
    );
    return data;
  },

  /** POST /api/loans/internal/credit-limit/{distributorId}/increase-utilization */
  async increaseUtilizedAmount(distributorId: string, amount: number): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/internal/credit-limit/${encodeURIComponent(distributorId)}/increase-utilization`,
      null,
      { params: { amount } },
    );
    return data;
  },

  /** POST /api/loans/internal/credit-limit/{distributorId}/decrease-utilization */
  async decreaseUtilizedAmount(distributorId: string, amount: number): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/internal/credit-limit/${encodeURIComponent(distributorId)}/decrease-utilization`,
      null,
      { params: { amount } },
    );
    return data;
  },

  /** GET /api/loans/internal/credit-limit/{distributorId} */
  async getCreditLimit(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/internal/credit-limit/${encodeURIComponent(distributorId)}`,
    );
    return data;
  },

  /** GET /api/loans/internal/credit-limit/{distributorId}/available */
  async hasAvailableCredit(distributorId: string, requiredAmount?: number): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/internal/credit-limit/${encodeURIComponent(distributorId)}/available`,
      { params: requiredAmount !== undefined ? { requiredAmount } : {} },
    );
    return data;
  },

  /** GET /api/loans/internal/matured-loans */
  async getMaturedLoans(): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/internal/matured-loans`);
    return data;
  },

  /** GET /api/loans/internal/by-number/{loanRequestNumber} */
  async getLoanByNumber(loanRequestNumber: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/internal/by-number/${encodeURIComponent(loanRequestNumber)}`,
    );
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. Underwriting & Credit Assessment Controller — 6 endpoints
// ─────────────────────────────────────────────────────────────────────────────

export const loanUnderwritingApi = {
  /**
   * POST /api/loans/underwriting/assess-statement
   * Upload a bank statement PDF for automated cash-flow metric extraction and credit limit recommendation.
   */
  async assessStatement(file: File, creditScore?: number): Promise<MessageAndResultResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/underwriting/assess-statement`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: creditScore !== undefined ? { creditScore } : {},
      },
    );
    return data;
  },

  /**
   * POST /api/loans/underwriting/assess-metrics
   * Evaluates structured statement metrics JSON to calculate credit limit and pricing tiers.
   */
  async assessMetrics(payload: StatementAssessmentRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/underwriting/assess-metrics`,
      payload,
    );
    return data;
  },

  /**
   * POST /api/loans/underwriting/distributors/{distributorId}/evaluate-statement
   * Evaluates a statement PDF for a registered distributor and blends their profile credit score.
   */
  async evaluateDistributorStatement(distributorId: string, file: File): Promise<MessageAndResultResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/underwriting/distributors/${encodeURIComponent(distributorId)}/evaluate-statement`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  /**
   * POST /api/loans/underwriting/distributors/{distributorId}/assess-stored-statement
   * Automatically fetches the KYC bank statement on file and runs underwriting — no re-upload needed.
   */
  async assessStoredStatement(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/underwriting/distributors/${encodeURIComponent(distributorId)}/assess-stored-statement`,
    );
    return data;
  },

  /**
   * POST /api/loans/underwriting/distributors/{distributorId}/apply-recommended
   * Applies the assessed credit limit, interest rate, and terms to the distributor loan profile.
   */
  async applyRecommendedLimit(distributorId: string, result: CreditAssessmentResult): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/underwriting/distributors/${encodeURIComponent(distributorId)}/apply-recommended`,
      result,
    );
    return data;
  },

  /**
   * POST /api/loans/underwriting/distributors/{distributorId}/override-limit
   * Allows bank officers to manually override credit limit, interest rate, and terms with audit reasoning.
   */
  async overrideCreditLimit(distributorId: string, payload: CustomLimitOverrideRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/underwriting/distributors/${encodeURIComponent(distributorId)}/override-limit`,
      payload,
    );
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. Loans Controller (legacy /loans path) — 5 endpoints
// ─────────────────────────────────────────────────────────────────────────────

export const loansLegacyApi = {
  /** POST /api/loans/apply — Submit a new loan application */
  async applyForLoan(payload: Record<string, any>): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/apply`, payload);
    return data;
  },

  /** GET /api/loans/{loanId} — Retrieve loan details by ID */
  async getLoan(loanId: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/${loanId}`);
    return data;
  },

  /** GET /api/loans/distributor/{distributorId} */
  async getLoansByDistributor(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/distributor/${encodeURIComponent(distributorId)}`,
    );
    return data;
  },

  /** PUT /api/loans/{loanId}/approve — Approve a loan application */
  async approveLoan(loanId: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(`${BASE_PATH}/${loanId}/approve`);
    return data;
  },

  /** POST /api/loans/{loanId}/disburse — Disburse an approved loan */
  async disburseLoan(loanId: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/${loanId}/disburse`);
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 11. Loan Documents Controller — 2 endpoints
// ─────────────────────────────────────────────────────────────────────────────

export const loanDocumentsApi = {
  /**
   * POST /api/loans/documents/upload
   * Uploads a PDF, PNG, or JPG document and returns its stored document URL.
   */
  async uploadDocument(file: File, documentType: DocumentType = 'PURCHASE_ORDER'): Promise<MessageAndResultResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/documents/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: { documentType },
      },
    );
    return data;
  },

  /**
   * GET /api/loans/documents/download/{fileName}
   * Downloads a stored document by file name. Returns a blob.
   */
  async downloadDocument(fileName: string): Promise<Blob> {
    const { data } = await apiClient.get<Blob>(
      `${BASE_PATH}/documents/download/${encodeURIComponent(fileName)}`,
      { responseType: 'blob' },
    );
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 12. CRB Credit Assessment Controller — 5 endpoints (loansV19.json)
// ─────────────────────────────────────────────────────────────────────────────

export const crbCreditAssessmentApi = {
  /** GET /api/loans/crb/tiers — Returns configured platform credit tier matrix */
  async getPlatformTiers(): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/crb/tiers`);
    return data;
  },

  /** GET /api/loans/crb/distributors/{distributorId}/report — Fetches latest recorded CRB score and report */
  async getLatestCrbReport(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/crb/distributors/${encodeURIComponent(distributorId)}/report`,
    );
    return data;
  },

  /** POST /api/loans/crb/assess — Executes a CRB bureau check and evaluates tier limits/pricing */
  async assessDistributor(payload: CrbAssessmentRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/crb/assess`, payload);
    return data;
  },

  /** POST /api/loans/crb/assess/{distributorId} — Quick CRB check on an existing registered distributor */
  async assessDistributorById(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/crb/assess/${encodeURIComponent(distributorId)}`,
    );
    return data;
  },

  /** POST /api/loans/crb/distributors/{distributorId}/apply-tier — Applies credit tier terms */
  async applyCrbTier(
    distributorId: string,
    tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'DECLINED',
  ): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/crb/distributors/${encodeURIComponent(distributorId)}/apply-tier`,
      null,
      { params: { tier } },
    );
    return data;
  },
};

export const crbApi = crbCreditAssessmentApi;

// ─────────────────────────────────────────────────────────────────────────────
// Backward-compat facade (keeps existing import paths working)
// ─────────────────────────────────────────────────────────────────────────────

/** @deprecated Use internalLoansApi.setupDistributor directly */
export const LoansServiceClient = {
  async setupDistributor(payload: SetupDistributorRequest): Promise<MessageAndResultResponse> {
    return internalLoansApi.setupDistributor(payload);
  },
};

/** Convenience aggregator */
export const loansApi = {
  requests: loanRequestsApi,
  approvals: loanApprovalsApi,
  profiles: distributorLoanProfilesApi,
  pricing: pricingApi,
  financingModels: financingModelsApi,
  facilities: facilitiesApi,
  disbursements: disbursementsApi,
  internal: internalLoansApi,
  underwriting: loanUnderwritingApi,
  crb: crbCreditAssessmentApi,
  legacy: loansLegacyApi,
  documents: loanDocumentsApi,
};
