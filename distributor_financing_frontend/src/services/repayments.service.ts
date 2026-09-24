import { repaymentMockService } from '@/lib/mock/repayments';

export type RepaymentStatus = 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'REJECTED' | 'BANK_MAKER_VERIFIED' | 'BANK_CHECKER_APPROVED_UPDATED' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'SWEEP_INITIATED' | 'SWEEP_APPLIED' | 'REVERSAL_INITIATED' | 'REVERSED' | 'RETRYING' | 'MANUAL_REVIEW_REQUIRED';

export interface RepaymentRecord {
  id: string; facilityId: string; loanId?: number; accountNumber?: string; distributorId?: string; totalAmount: number;
  outstandingBalanceBefore?: number; outstandingBalanceAfter?: number; status: RepaymentStatus; source?: string;
  reference?: string; notes?: string; initiatedAt?: string; processedAt?: string; rejectionReason?: string;
  principalAllocated?: number; penaltiesAllocated?: number; isFullRepayment?: boolean;
}
export interface RepaymentSummary { currency?: string; totalTransactionsCount?: number; completedRepaymentsCount?: number; pendingRepaymentsCount?: number; totalAmountRepaid?: number; currentOutstandingBalance?: number; availableLimit?: number; }
export interface RepaymentQuery { facilityId?: string; distributorId?: string; status?: RepaymentStatus; search?: string; page?: number; size?: number; }
export interface InitiateRepaymentPayload { facilityId: string; loanId?: number; accountNumber: string; amount: number; penaltiesAmount?: number; notes?: string; }
export interface RepaymentActionPayload { notes?: string; reason?: string; }
export const repaymentsService = {
  async list(query: RepaymentQuery = {}): Promise<{ content: RepaymentRecord[]; totalElements: number }> {
    return repaymentMockService.list(query);
  },
  async pending(): Promise<RepaymentRecord[]> { return repaymentMockService.pending(); },
  async summary(_params: Pick<RepaymentQuery, 'facilityId' | 'distributorId'> = {}): Promise<RepaymentSummary> { return repaymentMockService.summary(); },
  async initiate(payload: InitiateRepaymentPayload): Promise<RepaymentRecord> { return repaymentMockService.initiate(payload); },
  async initiateSweep(payload: InitiateRepaymentPayload): Promise<RepaymentRecord> { return repaymentMockService.initiateSweep(payload); },
  async confirm(id: string, payload: RepaymentActionPayload = {}): Promise<RepaymentRecord> { return repaymentMockService.confirm(id, payload); },
  async bankCheckerApprove(id: string, payload: RepaymentActionPayload = {}): Promise<RepaymentRecord> { return repaymentMockService.bankCheckerApprove(id, payload); },
  async approve(id: string, payload: RepaymentActionPayload = {}): Promise<RepaymentRecord> { return repaymentMockService.confirm(id, payload); },
  async reject(id: string, payload: RepaymentActionPayload): Promise<RepaymentRecord> { return repaymentMockService.reject(id, payload); },
  async bankMakerVerify(id: string, payload: RepaymentActionPayload = {}): Promise<RepaymentRecord> { return repaymentMockService.bankMakerVerify(id, payload); },
};
