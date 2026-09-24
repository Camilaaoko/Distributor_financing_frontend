import { apiClient } from '@/lib/axios';
import { USE_MOCKS } from '@/lib/config';
import { dealerMockService } from '@/lib/mock/dealer';
import type {
  CreditFacility,
  DrawdownRequest,
  DrawdownRequestPayload,
  RepaymentScheduleItem,
  MakeRepaymentPayload,
  MakeRepaymentResponse,
  RepaymentInitiateRequest,
  RepaymentApproveRequest,
  RepaymentRejectRequest,
  RepaymentRecord,
} from '@/lib/types';

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

export const repaymentsService = {
  // NOTE: This endpoint is NOT in the Repayments Service Swagger.
  // Kept for backward compatibility; remove if backend doesn't support it.
  async getSchedule(facilityId: string): Promise<RepaymentScheduleItem[]> {
    if (USE_MOCKS) return dealerMockService.getRepaymentSchedule(facilityId);
    return apiClient.get(`/api/repayments/schedule/${facilityId}`).then((res) => res.data);
  },

  // NOTE: Old endpoint, kept for backward compatibility.
  // The Swagger uses POST /repayments/initiate with different payload.
  async makeRepayment(payload: MakeRepaymentPayload): Promise<MakeRepaymentResponse> {
    if (USE_MOCKS) return dealerMockService.makeRepayment(payload);
    return apiClient.post('/api/repayments', payload).then((res) => res.data);
  },

  // --- Swagger-compliant Repayments API ---

  async initiateRepayment(payload: RepaymentInitiatePayload): Promise<RepaymentRecord> {
    if (USE_MOCKS) throw new Error('Mock not implemented for initiateRepayment');
    return apiClient.post<RepaymentRecord>('/api/repayments/initiate', payload).then((res) => res.data);
  },

  async approveRepayment(id: string, payload: RepaymentApprovePayload): Promise<RepaymentRecord> {
    if (USE_MOCKS) throw new Error('Mock not implemented for approveRepayment');
    return apiClient.post<RepaymentRecord>(`/api/repayments/${id}/approve`, payload).then((res) => res.data);
  },

  async rejectRepayment(id: string, payload: RepaymentRejectPayload): Promise<RepaymentRecord> {
    if (USE_MOCKS) throw new Error('Mock not implemented for rejectRepayment');
    return apiClient.post<RepaymentRecord>(`/api/repayments/${id}/reject`, payload).then((res) => res.data);
  },
};