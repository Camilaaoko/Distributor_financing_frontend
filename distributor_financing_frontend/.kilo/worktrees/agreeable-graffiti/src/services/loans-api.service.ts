/**
 * Loans Microservice API Client (Consuming Camila APIs loans.json - 65 Endpoints)
 * Spec: "D:\EMTECH\Distributor Financing\Camila APIs\loans.json"
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
// 1. Loan Requests Controller (15 Endpoints)
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
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/requests`, payload, { headers });
    return data;
  },

  /** POST /api/loans/requests/with-document (1-Step Combined Upload) */
  async createLoanRequestWithDocument(
    poFile: File,
    payload: LoanRequestCreateDTO,
    idempotencyKey?: string
  ): Promise<MessageAndResultResponse> {
    const formData = new FormData();
    formData.append('poFile', poFile);
    formData.append(
      'request',
      new Blob([JSON.stringify(payload)], { type: 'application/json' })
    );
    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
    };
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/requests/with-document`,
      formData,
      { headers }
    );
    return data;
  },

  /** PATCH /api/loans/requests/{id}/purchase-order-document (Attach or Replace PO Document) */
  async attachPoDocument(id: number | string, poFile: File): Promise<MessageAndResultResponse> {
    const formData = new FormData();
    formData.append('poFile', poFile);
    const { data } = await apiClient.patch<MessageAndResultResponse>(
      `${BASE_PATH}/requests/${id}/purchase-order-document`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /** POST /api/loans/documents/upload (Upload PO or Invoice Document) */
  async uploadDocument(
    file: File,
    documentType: 'PURCHASE_ORDER' | 'INVOICE' = 'PURCHASE_ORDER'
  ): Promise<MessageAndResultResponse<{ fileName: string; downloadUrl: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<MessageAndResultResponse<{ fileName: string; downloadUrl: string }>>(
      `${BASE_PATH}/documents/upload`,
      formData,
      {
        params: { documentType },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /** Helper to construct document view/download URL */
  getDocumentDownloadUrl(fileNameOrUrl?: string): string {
    if (!fileNameOrUrl) return '';
    if (fileNameOrUrl.startsWith('http://') || fileNameOrUrl.startsWith('https://')) {
      return fileNameOrUrl;
    }
    if (fileNameOrUrl.startsWith('/api/loans/documents/download/')) {
      return fileNameOrUrl;
    }
    const cleanFileName = fileNameOrUrl.replace(/^\/+/, '').replace(/^api\/loans\/documents\/download\//, '');
    return `${BASE_PATH}/documents/download/${encodeURIComponent(cleanFileName)}`;
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

  /** PATCH /api/loans/requests/{id}/manufacturer-proforma-invoice */
  async attachProformaInvoice(id: number | string, payload: AttachProformaInvoiceDTO): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.patch<MessageAndResultResponse>(
      `${BASE_PATH}/requests/${id}/manufacturer-proforma-invoice`,
      payload
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
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/requests/status/${encodeURIComponent(status)}`, {
      params: toPageableParams(pageable),
    });
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
      `${BASE_PATH}/requests/number/${encodeURIComponent(loanRequestNumber)}`
    );
    return data;
  },

  /** GET /api/loans/requests/distributor/{distributorId} */
  async getLoanRequestsByDistributor(distributorId: string, pageable?: Pageable): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/requests/distributor/${encodeURIComponent(distributorId)}`,
      { params: toPageableParams(pageable) }
    );
    return data;
  },

  /** GET /api/loans/requests/dashboard/{distributorId} */
  async getDistributorDashboard(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/requests/dashboard/${encodeURIComponent(distributorId)}`
    );
    return data;
  },

  /** GET /api/loans/requests/dashboard/bank/{bankId} */
  async getBankDashboard(bankId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/requests/dashboard/bank/${encodeURIComponent(bankId)}`
    );
    return data;
  },

  /** GET /api/loans/requests/dashboard/bank/{bankId}/growth */
  async getGrowthSeries(bankId: string, months = 6): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/requests/dashboard/bank/${encodeURIComponent(bankId)}/growth`,
      { params: { months } }
    );
    return data;
  },

  /** GET /api/loans/requests/dashboard/bank/{bankId}/activity */
  async getBankActivity(bankId: string, limit = 20): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/requests/dashboard/bank/${encodeURIComponent(bankId)}/activity`,
      { params: { limit } }
    );
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Loan Approvals Controller (3 Endpoints)
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
// 3. Distributor Loan Profiles Controller (4 Endpoints)
// ─────────────────────────────────────────────────────────────────────────────

export const distributorLoanProfilesApi = {
  /** GET /api/loans/profiles/{distributorId} */
  async getProfileByDistributorId(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/profiles/${encodeURIComponent(distributorId)}`
    );
    return data;
  },

  /** PUT /api/loans/profiles/{distributorId}/credit-limit */
  async adjustCreditLimit(distributorId: string, payload: CreditLimitAdjustmentDTO): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(
      `${BASE_PATH}/profiles/${encodeURIComponent(distributorId)}/credit-limit`,
      payload
    );
    return data;
  },

  /** GET /api/loans/profiles/{distributorId}/credit-score */
  async getCreditScore(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/profiles/${encodeURIComponent(distributorId)}/credit-score`
    );
    return data;
  },

  /** POST /api/loans/profiles/{distributorId}/credit-score/refresh */
  async refreshCreditScore(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/profiles/${encodeURIComponent(distributorId)}/credit-score/refresh`
    );
    return data;
  },

  /** POST /api/loans/profiles (Bank Admin: Create profile with PENDING_APPROVAL) */
  async createLoanProfile(payload: CreateLoanProfileRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/profiles`, payload);
    return data;
  },

  /** POST /api/loans/profiles/{id}/approve (Bank Checker approves profile -> OFFER_SENT) */
  async approveProfile(id: number | string, payload?: LoanProfileApprovalRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/profiles/${id}/approve`, payload || {});
    return data;
  },

  /** POST /api/loans/profiles/{id}/accept-offer (Distributor accepts offer -> ACTIVE) */
  async acceptOffer(id: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/profiles/${id}/accept-offer`);
    return data;
  },

  /** POST /api/loans/profiles/{id}/reject-offer (Distributor declines offer) */
  async rejectOffer(id: number | string, payload?: { rejectionReason?: string }): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/profiles/${id}/reject-offer`, payload || {});
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Pricing Controller (6 Endpoints)
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
      `${BASE_PATH}/pricings/financing-model/${financingModelId}`
    );
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Financing Models Controller (9 Endpoints)
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
      { params: { isActive } }
    );
    return data;
  },

  /** GET /api/loans/financing-models/type/{modelType} */
  async getFinancingModelsByType(modelType: string, pageable?: Pageable): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/financing-models/type/${encodeURIComponent(modelType)}`,
      { params: toPageableParams(pageable) }
    );
    return data;
  },

  /** GET /api/loans/financing-models/name/{name} */
  async getFinancingModelByName(name: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/financing-models/name/${encodeURIComponent(name)}`
    );
    return data;
  },

  /** GET /api/loans/financing-models/active */
  async getActiveFinancingModels(): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/financing-models/active`);
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Facilities Controller (7 Endpoints)
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
      { params: { isActive } }
    );
    return data;
  },

  /** PUT /api/loans/facilities/{id}/adjust-utilization */
  async adjustUtilizedAmount(id: number | string, amount: number): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(
      `${BASE_PATH}/facilities/${id}/adjust-utilization`,
      null,
      { params: { amount } }
    );
    return data;
  },

  /** GET /api/loans/facilities/distributor/{distributorId} */
  async getFacilitiesByDistributor(distributorId: string, pageable?: Pageable): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/facilities/distributor/${encodeURIComponent(distributorId)}`,
      { params: toPageableParams(pageable) }
    );
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. Disbursements Controller (5 Endpoints)
// ─────────────────────────────────────────────────────────────────────────────

export const disbursementsApi = {
  /** GET /api/loans/disbursements/{id} */
  async getDisbursementById(id: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/disbursements/${id}`);
    return data;
  },

  /** GET /api/loans/disbursements/loan/{loanRequestId} */
  async getDisbursementsByLoanRequest(loanRequestId: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/disbursements/loan/${loanRequestId}`);
    return data;
  },

  /** POST /api/loans/disbursements/trigger/{loanRequestId} */
  async triggerDisbursement(
    loanRequestId: number | string,
    payload: DisbursementTriggerDTO,
    idempotencyKey?: string
  ): Promise<MessageAndResultResponse> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/disbursements/trigger/${loanRequestId}`,
      payload,
      { headers }
    );
    return data;
  },

  /** PUT /api/loans/disbursements/{id}/complete */
  async completeDisbursement(
    id: number | string,
    referenceNumber?: string,
    idempotencyKey?: string
  ): Promise<MessageAndResultResponse> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    const { data } = await apiClient.put<MessageAndResultResponse>(
      `${BASE_PATH}/disbursements/${id}/complete`,
      null,
      { params: referenceNumber ? { referenceNumber } : {}, headers }
    );
    return data;
  },

  /** PUT /api/loans/disbursements/{id}/fail */
  async failDisbursement(id: number | string, failureReason: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(
      `${BASE_PATH}/disbursements/${id}/fail`,
      null,
      { params: { failureReason } }
    );
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Internal Loans Controller (16 Endpoints)
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
      { params: { principalPortion, amount } }
    );
    return data;
  },

  /** POST /api/loans/internal/{loanId}/sweep-repayment */
  async applySweepRepayment(
    loanId: number | string,
    payload: SweepRepaymentApplicationRequest,
    idempotencyKey?: string
  ): Promise<MessageAndResultResponse> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/internal/${loanId}/sweep-repayment`,
      payload,
      { headers }
    );
    return data;
  },

  /** POST /api/loans/internal/{loanId}/mark-completed */
  async markCompleted(loanId: number | string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/internal/${loanId}/mark-completed`);
    return data;
  },

  /** POST /api/loans/internal/{loanId}/apply-repayment */
  async applyRepayment(
    loanId: number | string,
    payload: RepaymentApplicationRequest,
    idempotencyKey?: string
  ): Promise<MessageAndResultResponse> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/internal/${loanId}/apply-repayment`,
      payload,
      { headers }
    );
    return data;
  },

  /** POST /api/loans/internal/setup-distributor */
  async setupDistributor(payload: SetupDistributorRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(`${BASE_PATH}/internal/setup-distributor`, payload);
    return data;
  },

  /** GET /api/loans/internal/matured-loans */
  async getMaturedLoans(): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(`${BASE_PATH}/internal/matured-loans`);
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
      { params: { failureReason } }
    );
    return data;
  },

  /** PUT /api/loans/internal/disbursements/{disbursementId}/complete */
  async completeDisbursement(disbursementId: number | string, referenceNumber?: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.put<MessageAndResultResponse>(
      `${BASE_PATH}/internal/disbursements/${disbursementId}/complete`,
      null,
      { params: referenceNumber ? { referenceNumber } : {} }
    );
    return data;
  },

  /** POST /api/loans/internal/distributors/{distributorId}/profile */
  async createProfile(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/internal/distributors/${encodeURIComponent(distributorId)}/profile`
    );
    return data;
  },

  /** POST /api/loans/internal/credit-limit/{distributorId}/increase-utilization */
  async increaseUtilizedAmount(distributorId: string, amount: number): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/internal/credit-limit/${encodeURIComponent(distributorId)}/increase-utilization`,
      null,
      { params: { amount } }
    );
    return data;
  },

  /** POST /api/loans/internal/credit-limit/{distributorId}/decrease-utilization */
  async decreaseUtilizedAmount(distributorId: string, amount: number): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/internal/credit-limit/${encodeURIComponent(distributorId)}/decrease-utilization`,
      null,
      { params: { amount } }
    );
    return data;
  },

  /** GET /api/loans/internal/credit-limit/{distributorId} */
  async getCreditLimit(distributorId: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/internal/credit-limit/${encodeURIComponent(distributorId)}`
    );
    return data;
  },

  /** GET /api/loans/internal/credit-limit/{distributorId}/available */
  async hasAvailableCredit(distributorId: string, requiredAmount: number): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/internal/credit-limit/${encodeURIComponent(distributorId)}/available`,
      { params: { requiredAmount } }
    );
    return data;
  },

  /** GET /api/loans/internal/by-number/{loanRequestNumber} */
  async getLoanByNumber(loanRequestNumber: string): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.get<MessageAndResultResponse>(
      `${BASE_PATH}/internal/by-number/${encodeURIComponent(loanRequestNumber)}`
    );
    return data;
  },
};

/** Underwriting Microservice API stubs */
export const loanUnderwritingApi = {
  async overrideCreditLimit(distributorId: string, payload: {
    customCreditLimit: number;
    customInterestRate: number;
    customMaxTenorDays: number;
    overrideReason: string;
  }): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/underwriting/${encodeURIComponent(distributorId)}/override`,
      payload
    );
    return data;
  },

  async applyRecommendedLimit(distributorId: string, result: CreditAssessmentResult): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/underwriting/${encodeURIComponent(distributorId)}/apply-recommendation`,
      result
    );
    return data;
  },
};

/** Loans Service Client — distributor provisioning facade */
export const LoansServiceClient = {
  async setupDistributor(payload: SetupDistributorRequest): Promise<MessageAndResultResponse> {
    const { data } = await apiClient.post<MessageAndResultResponse>(
      `${BASE_PATH}/distributors/setup`,
      payload
    );
    return data;
  },
};

/** Loan Documents Controller (Upload, View, and Download) */
export const loanDocumentsApi = {
  /** POST /api/loans/documents/upload */
  async uploadDocument(
    file: File,
    documentType: 'PURCHASE_ORDER' | 'INVOICE' = 'PURCHASE_ORDER'
  ): Promise<MessageAndResultResponse<{ fileName: string; downloadUrl: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<MessageAndResultResponse<{ fileName: string; downloadUrl: string }>>(
      `${BASE_PATH}/documents/upload`,
      formData,
      {
        params: { documentType },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /** Helper to construct document view/download URL */
  getDocumentDownloadUrl(fileNameOrUrl?: string): string {
    if (!fileNameOrUrl) return '';
    if (fileNameOrUrl.startsWith('http://') || fileNameOrUrl.startsWith('https://')) {
      return fileNameOrUrl;
    }
    if (fileNameOrUrl.startsWith('/api/loans/documents/download/')) {
      return fileNameOrUrl;
    }
    const cleanFileName = fileNameOrUrl.replace(/^\/+/, '').replace(/^api\/loans\/documents\/download\//, '');
    return `${BASE_PATH}/documents/download/${encodeURIComponent(cleanFileName)}`;
  },
};

/** Convenience aggregator for legacy imports */
export const loansApi = {
  requests: loanRequestsApi,
  documents: loanDocumentsApi,
  approvals: loanApprovalsApi,
  profiles: distributorLoanProfilesApi,
  pricing: pricingApi,
  financingModels: financingModelsApi,
  facilities: facilitiesApi,
  disbursements: disbursementsApi,
  internal: internalLoansApi,
};

