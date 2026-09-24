import { apiClient } from '@/lib/axios';
import { USE_MOCKS } from '@/lib/config';
import { dealerMockService } from '@/lib/mock/dealer';
import {
  loanRequestsApi,
  loanApprovalsApi,
  distributorLoanProfilesApi,
  pricingApi,
  financingModelsApi,
  facilitiesApi,
  disbursementsApi,
  internalLoansApi,
} from './loans-api.service';

export * from '@/types/loans';
export * from './loans-api.service';

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

export const loansService = {
  // Legacy / convenience adapter methods
  async listCreditLimits(): Promise<CreditFacility[]> {
    if (USE_MOCKS) return dealerMockService.getFacilities();
    try {
      const res = await facilitiesApi.getAllFacilities();
      if (Array.isArray(res.result)) return res.result;
      if (Array.isArray(res.result?.content)) return res.result.content;
      return [];
    } catch {
      return apiClient.get('/api/loans/credit-limits').then((res) => res.data).catch(() => []);
    }
  },

  async getCreditLimit(facilityId: string): Promise<CreditFacility | undefined> {
    if (USE_MOCKS) return dealerMockService.getFacility(facilityId);
    try {
      const res = await facilitiesApi.getFacilityById(facilityId);
      return res.result;
    } catch {
      return apiClient.get(`/api/loans/credit-limits/${facilityId}`).then((res) => res.data).catch(() => undefined);
    }
  },

  async requestDrawdown(payload: DrawdownRequestPayload): Promise<DrawdownRequest> {
    if (USE_MOCKS) return dealerMockService.requestDrawdown(payload);
    const res = await loanRequestsApi.createLoanRequest({
      facilityId: Number(payload.facilityId) || undefined,
      principalAmount: payload.amount,
      purpose: payload.purpose,
      distributorId: 'current-distributor',
      createdByUserId: 'current-user',
      tenorDays: 30,
    });
    return res.result || res as any;
  },

  async listDrawdowns(facilityId?: string): Promise<DrawdownRequest[]> {
    if (USE_MOCKS) return dealerMockService.getDrawdownHistory(facilityId);
    try {
      const res = await loanRequestsApi.getAllLoanRequests();
      if (Array.isArray(res.result)) return res.result;
      if (Array.isArray(res.result?.content)) return res.result.content;
      return [];
    } catch {
      const params = facilityId ? `?facilityId=${facilityId}` : '';
      return apiClient.get(`/api/loans/drawdowns${params}`).then((res) => res.data).catch(() => []);
    }
  },

  async approveDrawdown(drawdownId: string): Promise<DrawdownRequest> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 400));
      const drawdown = (await dealerMockService.getDrawdownHistory()).find((d) => d.id === drawdownId);
      if (drawdown) {
        drawdown.status = 'Approved';
        drawdown.approvedDate = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
        drawdown.approvedBy = 'Current User';
      }
      return drawdown!;
    }
    const res = await loanApprovalsApi.approveOrRejectLoan(drawdownId, {
      approved: true,
      approvalLevel: 'BANK',
      approvedBy: 'Bank Admin',
    });
    return res.result || res as any;
  },

  // Direct domain API clients
  requests: loanRequestsApi,
  approvals: loanApprovalsApi,
  profiles: distributorLoanProfilesApi,
  pricing: pricingApi,
  financingModels: financingModelsApi,
  facilities: facilitiesApi,
  disbursements: disbursementsApi,
  internal: internalLoansApi,
};

export default loansService;
