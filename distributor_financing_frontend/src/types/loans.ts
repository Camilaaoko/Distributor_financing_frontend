/**
 * Loans Service Types
 * Generated from Camila APIs: "D:\EMTECH\Distributor Financing\Camila APIs\loans.json"
 */

export interface MessageAndResultResponse<T = any> {
  message?: string;
  result?: T;
  data?: T;
  success?: boolean;
}

export interface Pageable {
  page?: number;
  size?: number;
  sort?: string[];
}

export type FinancingModelType = 'FIXED_RATE' | 'FLOATING_RATE' | 'DISCOUNTED' | 'REVOLVING';
export type PricingStructureType = 'FLAT_FEE' | 'PERCENTAGE' | 'TIERED' | 'HYBRID';
export type ApprovalLevelType = 'CHECKER' | 'BANK';

export interface TenurePricingDTO {
  pricingTenure: number;
  bankPricing: number;
  solvPricing: number;
  pricingStructure: PricingStructureType;
}

export interface PricingRequestDTO {
  financingModelId: number;
  pricingModelType: PricingStructureType;
  manufacturerProcessingFee?: number;
  distributorProcessingFee?: number;
  transactionFees?: number;
  penaltyFees?: number;
  pastDuePercentage?: number;
  gracePeriodDays?: number;
  pricings?: TenurePricingDTO[];
}

export interface PricingResponse extends PricingRequestDTO {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancingModelRequestDTO {
  name: string;
  description?: string;
  modelType: FinancingModelType;
  baseInterestRate: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  minTenorDays: number;
  maxTenorDays: number;
}

export interface FinancingModelResponse extends FinancingModelRequestDTO {
  id: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  pricing?: PricingResponse;
}

export interface Facility {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  facilityName?: string;
  distributorId?: string;
  totalLimit?: number;
  creditLimit?: number;
  utilizedAmount?: number;
  availableBalance?: number;
  availableCredit?: number;
  interestRate?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  maxFinancingPercentage?: number;
  description?: string;
}

export interface CreditLimitAdjustmentDTO {
  newCreditLimit: number;
  reason?: string;
}

export interface CreditScoreResponse {
  distributorId: string;
  creditScore: number;
  ratingGrade?: string;
  riskCategory?: 'LOW' | 'MEDIUM' | 'HIGH';
  lastRefreshedAt?: string;
}

export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export interface StatementTransaction {
  date?: string;
  description?: string;
  debitAmount?: number;
  creditAmount?: number;
  runningBalance?: number;
  isDishonor?: boolean;
}

export interface StatementMetrics {
  totalCredits?: number;
  totalDebits?: number;
  averageMonthlyTurnover?: number;
  averageDailyBalance?: number;
  netMonthlyCashFlow?: number;
  coefficientOfVariation?: number;
  statementMonthsCount?: number;
  totalTransactionCount?: number;
  bouncedTransactionsCount?: number;
  periodStartDate?: string;
  periodEndDate?: string;
  transactionsSample?: StatementTransaction[];
}

export interface CreditAssessmentResult {
  distributorId?: string;
  recommendedCreditLimit?: number;
  baseTurnoverLimit?: number;
  calculatedRawLimit?: number;
  liquidityMultiplier?: number;
  volatilityHaircut?: number;
  dishonorPenalty?: number;
  creditScoreMultiplier?: number;
  combinedMultiplier?: number;
  riskTier?: RiskTier;
  recommendedInterestRate?: number;
  recommendedMaxTenorDays?: number;
  assessedCreditScore?: number;
  rationaleSummary?: string;
  statementMetrics?: StatementMetrics;
  evaluatedAt?: string;
  // Compatibility aliases
  recommendedTenorDays?: number;
  assessmentDetails?: string[];
  lastAssessedAt?: string;
}

export type LoanProfileStatus =
  | 'PENDING_APPROVAL'
  | 'OFFER_SENT'
  | 'ACTIVE'
  | 'REJECTED'
  | 'OFFER_REJECTED'
  | 'EXPIRED'
  | 'FROZEN'
  | 'CANCELLED'
  | string;

export interface CreateLoanProfileRequest {
  distributorId: string;
  bankId: string;
  manufacturerId?: string;
  creditLimit: number;
  interestRate: number;
  financingModelId: number;
  validFrom?: string;
  validUntil?: string;
  allowedRepaymentTerms?: number[];
  maxFinancingPercentage?: number;
  gracePeriodDays?: number;
  /** Distributor's email — used by the backend to send the credit limit offer email */
  distributorEmail?: string;
  /** Distributor contact name shown in the offer email */
  distributorContactName?: string;
}

export interface LoanProfileApprovalRequest {
  comments?: string;
  rejectionReason?: string;
}

export interface OfferAcceptanceRequest {
  rejectionReason?: string;
}

export interface OfferResponseRequest {
  token: string;
  action: 'ACCEPT' | 'REJECT';
  rejectionReason?: string;
}

export interface DistributorLoanProfileResponse {
  id?: number;
  distributorId?: string;
  distributorName?: string;
  manufacturerId?: string;
  manufacturerName?: string;
  bankId?: string;
  creditLimit: number;
  utilizedAmount: number;
  availableCredit: number;
  creditScore?: number;
  status: LoanProfileStatus;
  isFrozen?: boolean;
  interestRate?: number;
  allowedRepaymentTerms?: number[];
  maxFinancingPercentage?: number;
  gracePeriodDays?: number;
  financingModelId?: number;
  distributorEmail?: string;
  distributorContactName?: string;
  loanProfileReference?: string;
}

export type LoanRequestStatus =
  | 'PENDING_MANUFACTURER_CONFIRMATION'
  | 'PENDING'
  | 'CHECKER_APPROVED'
  | 'APPROVED'
  | 'PROCESSING'
  | 'DISBURSED'
  | 'PARTIALLY_DISBURSED'
  | 'PARTIALLY_REPAID'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'REJECTED'
  | 'CANCELLED'
  | string;

export interface LoanRequestResponse {
  id: number;
  loanRequestNumber?: string;
  distributorId: string;
  distributorName?: string;
  manufacturerId?: string;
  manufacturerName?: string;
  facilityId?: number;
  facilityName?: string;
  financingModelId?: number;
  financingModelName?: string;
  principalAmount: number;
  tenorDays: number;
  purpose: string;
  invoiceNumber?: string;
  invoiceAmount?: number;
  invoiceDate?: string;
  invoiceDueDate?: string;
  invoiceUrl?: string;
  purchaseOrderNumber?: string;
  purchaseOrderDocumentUrl?: string;
  purchaseOrderFileName?: string;
  maxFinancingPercentage?: number;
  status: LoanRequestStatus;
  interestRate?: number;
  totalInterest?: number;
  processingFee?: number;
  totalRepayable?: number;
  dueDate?: string;
  repaymentDate?: string;
  disbursedAt?: string;
  repaidAmount?: number;
  remainingBalance?: number;
  rejectionReason?: string;
  createdByUserId?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoanRequestCreateDTO {
  distributorId: string;
  createdByUserId: string;
  principalAmount: number;
  financingModelId?: number;
  facilityId?: number;
  tenorDays: number;
  purpose: string;
  invoiceNumber?: string;
  invoiceAmount?: number;
  invoiceDate?: string;
  invoiceDueDate?: string;
  invoiceUrl?: string;
  purchaseOrderNumber?: string;
  manufacturerId?: string;
  maxFinancingPercentage?: number;
}

export interface LoanRequestUpdateRequest {
  principalAmount?: number;
  tenorDays?: number;
  purpose?: string;
  financingModelId?: number;
  invoiceNumber?: string;
  invoiceAmount?: number;
  invoiceDate?: string;
  invoiceDueDate?: string;
  invoiceUrl?: string;
  purchaseOrderNumber?: string;
  manufacturerId?: string;
  maxFinancingPercentage?: number;
}

export interface AttachProformaInvoiceDTO {
  invoiceNumber: string;
  invoiceAmount: number;
  invoiceDate?: string;
  invoiceDueDate?: string;
  invoiceUrl?: string;
  comments?: string;
  confirmedBy?: string;
}

export interface LoanApprovalDecisionDTO {
  approved: boolean;
  approvalLevel: ApprovalLevelType;
  approvedBy?: string;
  approvedAmount?: number;
  approvedInterestRate?: number;
  approvedTenorDays?: number;
  comments?: string;
  rejectionReason?: string;
}

export interface LoanApprovalHistoryItem {
  id?: number;
  loanRequestId: number;
  approvalLevel: ApprovalLevelType;
  decision: 'APPROVED' | 'REJECTED' | 'PENDING';
  approvedBy: string;
  approvedAmount?: number;
  approvedInterestRate?: number;
  approvedTenorDays?: number;
  comments?: string;
  rejectionReason?: string;
  decisionDate: string;
}

export interface LoanBreakdownResponse {
  loanRequestId: number;
  principalAmount: number;
  interestAmount: number;
  processingFee: number;
  exciseDuty: number;
  vat: number;
  totalRepaymentAmount: number;
  monthlyInstallment?: number;
  dueDate: string;
}

export interface FinancingQuoteResponse {
  distributorId: string;
  financingModelId?: number;
  invoiceAmount: number;
  eligibleLoanAmount: number;
  estimatedInterest: number;
  estimatedFees: number;
  estimatedTotalRepayment: number;
  tenorDays: number;
  dueDate?: string;
}

export interface DisbursementTriggerDTO {
  disbursementAmount: number;
  disbursementDate: string;
  destinationAccount?: string;
  narrative?: string;
}

export interface DisbursementResponse {
  id: number;
  loanRequestId: number;
  disbursementAmount: number;
  disbursementDate: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  referenceNumber?: string;
  failureReason?: string;
  destinationAccount?: string;
  narrative?: string;
  createdAt?: string;
}

export interface RepaymentApplicationRequest {
  repaymentId?: string;
  principalAllocation?: number;
  interestAllocation?: number;
  feesAllocation?: number;
  processingFeeAllocation?: number;
  exciseDutyAllocation?: number;
  vatAllocation?: number;
  penaltiesAllocation?: number;
  isFullRepayment?: boolean;
  reference?: string;
  processedAt?: string;
}

export interface SweepRepaymentApplicationRequest {
  repaymentId?: string;
  penaltiesAllocation?: number;
  reference?: string;
  processedAt?: string;
}

export interface SetupDistributorRequest {
  distributorId: string;
  bankId: string;
  manufacturerId: string;
  creditLimit: number;
  interestRate: number;
  maxTenorDays: number;
  financingModelId: number;
}

export interface DistributorDashboardData {
  totalCreditLimit: number;
  utilizedAmount: number;
  availableLimit: number;
  activeFacilitiesCount: number;
  pendingRequestsCount: number;
  recentLoans?: any[];
}

export interface BankDashboardData {
  totalDisbursed: number;
  totalOutstanding: number;
  totalActiveFacilities: number;
  pendingApprovalsCount: number;
  repaymentRate?: number;
  growthSeries?: { month: string; amount: number }[];
  recentActivity?: any[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Underwriting types
// ─────────────────────────────────────────────────────────────────────────────

export interface StatementAssessmentRequest {
  avgMonthlyTurnover?: number;
  avgMonthlyInflows?: number;
  avgMonthlyOutflows?: number;
  monthsCovered?: number;
  totalCredits?: number;
  totalDebits?: number;
  [key: string]: any;
}

export interface CustomLimitOverrideRequest {
  customCreditLimit: number;
  customInterestRate: number;
  customMaxTenorDays: number;
  overrideReason: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CRB Assessment types
// ─────────────────────────────────────────────────────────────────────────────

export interface CrbAssessmentRequest {
  distributorId: string;
  nationalId?: string;
  taxNumber?: string;
  businessRegistrationNumber?: string;
  consentGiven?: boolean;
  autoApply?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Loan Documents types
// ─────────────────────────────────────────────────────────────────────────────

export type DocumentType = 'PURCHASE_ORDER' | 'INVOICE' | 'BANK_STATEMENT' | string;

