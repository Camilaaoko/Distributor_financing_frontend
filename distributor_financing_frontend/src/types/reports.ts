/**
 * Reports & Analytics Microservice Type Definitions
 * Spec: reortss.json & Task Specifications
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. Customer Account Statements (Distributor & Bank View)
// ─────────────────────────────────────────────────────────────────────────────

export type StatementTransactionType =
  | 'DISBURSEMENT'
  | 'PROCESSING_FEE'
  | 'REPAYMENT'
  | 'INTEREST_CHARGE'
  | 'PENALTY_FEE'
  | 'FACILITY_FEE';

export interface StatementLedgerEntry {
  id: string;
  date: string;
  transactionRef: string;
  type: StatementTransactionType;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export type LoanSubAccountStatus =
  | 'ACTIVE'
  | 'OVERDUE'
  | 'PARTIALLY_PAID'
  | 'COMPLETED'
  | 'DISBURSED'
  | 'PENDING';

export interface ActiveLoanSubAccount {
  id: string;
  loanNumber: string;
  invoiceNumber: string;
  purchaseOrderNumber: string;
  principal: number;
  disbursedDate: string;
  dueDate: string;
  status: LoanSubAccountStatus;
  remainingBalance: number;
  daysPastDue?: number;
  interestRate?: number;
}

export interface DistributorStatementHeader {
  distributorId: string;
  distributorName: string;
  kraPin: string;
  bankId?: string;
  bankName: string;
  facilityLimit: number;
  availableLimit: number;
  utilizedLimit: number;
  sanctionedRate: number; // e.g. 13.5%
  tenorDays: number; // e.g. 60
  facilityStatus: 'ACTIVE' | 'FROZEN' | 'SUSPENDED';
  statementDate: string;
  currency: string;
}

export interface PeriodFinancialSummary {
  openingBalance: number;
  totalDraws: number;
  interestApplied: number;
  fees: number;
  totalRepaid: number;
  closingBalance: number;
  startDate: string;
  endDate: string;
}

export interface CustomerStatementResponse {
  header: DistributorStatementHeader;
  summary: PeriodFinancialSummary;
  activeLoans: ActiveLoanSubAccount[];
  ledger: StatementLedgerEntry[];
}

export interface StatementFilterParams {
  distributorId?: string;
  facilityId?: string;
  startDate?: string;
  endDate?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Portfolio Performance & Credit Risk Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export interface PortfolioKpiMetrics {
  grossPortfolioVolume: number;
  totalDisbursed: number;
  totalRepaid: number;
  activeBorrowersCount: number;
  collectionEfficiencyPercent: number; // e.g. 96.8%
  defaultRatePercent: number; // e.g. 1.4%
  weightedAverageTenorDays: number;
  weightedAverageInterestRate: number;
}

export type RiskThresholdLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ParRiskBanner {
  metric: 'PAR 30' | 'PAR 60' | 'PAR 90';
  percentage: number;
  amount: number;
  thresholdLevel: 'GREEN' | 'YELLOW' | 'RED';
  targetBenchmarkPercent: number;
}

export type CbkAgingCategory =
  | 'NORMAL'
  | 'WATCH'
  | 'SUBSTANDARD'
  | 'DOUBTFUL'
  | 'LOSS';

export interface AgingScheduleItem {
  category: CbkAgingCategory;
  categoryLabel: string; // e.g. "Normal (0-30 days)"
  daysPastDueRange: string;
  accountCount: number;
  portfolioAmount: number;
  portfolioPercentage: number;
  provisionRatePercent: number;
  statutoryProvisionAmount: number;
}

export interface AnchorConcentrationItem {
  manufacturerId: string;
  manufacturerName: string;
  exposureAmount: number;
  exposurePercentage: number;
  activeDistributorsCount: number;
  par90Rate: number;
  color?: string;
}

export interface DisbursementRepaymentTrendPoint {
  month: string; // e.g. "Apr 2026"
  disbursements: number;
  repayments: number;
  grossOutstanding: number;
}

export interface PortfolioPerformanceResponse {
  kpis: PortfolioKpiMetrics;
  parBanners: {
    par30: ParRiskBanner;
    par60: ParRiskBanner;
    par90: ParRiskBanner;
  };
  agingSchedule: AgingScheduleItem[];
  anchorConcentration: AnchorConcentrationItem[];
  historicalTrajectory: DisbursementRepaymentTrendPoint[];
  lastUpdated: string;
}

export interface PortfolioFilterParams {
  bankId?: string;
  manufacturerId?: string;
  startDate?: string;
  endDate?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Central Bank of Kenya (CBK/PG/04) Regulatory Reports
// ─────────────────────────────────────────────────────────────────────────────

export interface SupervisoryReturnSummary {
  grossLoans: number;
  totalNpls: number; // Substandard + Doubtful + Loss
  nplRatioPercent: number;
  totalGeneralProvisions: number; // Normal (1%) + Watch (3%)
  totalSpecificProvisions: number; // Substandard (20%) + Doubtful (50%) + Loss (100%)
  netStatutoryProvisionRequired: number;
  provisionHeldByBank: number;
  provisionSurplusDeficit: number;
  isCompliant: boolean;
  reportingPeriod: string;
}

export interface PrudentialScheduleItem {
  category: CbkAgingCategory;
  classificationName: string;
  criteria: string;
  numberOfAccounts: number;
  grossOutstanding: number;
  requiredProvisionPercent: number;
  statutoryProvisionAmount: number;
  provisionType: 'General Provision' | 'Specific Provision';
}

export interface SectoralCreditConcentrationItem {
  sectorCode: string;
  sectorName: string;
  facilityCount: number;
  exposureAmount: number;
  portfolioSharePercent: number;
  averageRiskGrade: string;
}

export interface LargeExposureItem {
  borrowerId: string;
  borrowerName: string;
  kraPin: string;
  anchorManufacturer: string;
  sanctionedFacilityLimit: number;
  totalOutstandingAmount: number;
  percentOfCoreCapital: number;
  singleBorrowerLimitPercent: number; // usually 25.0%
  status: 'COMPLIANT' | 'EXCEEDS_LIMIT';
}

export interface CbkRegulatorySummaryResponse {
  period: string;
  bankId?: string;
  bankName: string;
  supervisorySummary: SupervisoryReturnSummary;
  prudentialSchedule: PrudentialScheduleItem[];
  sectoralConcentration: SectoralCreditConcentrationItem[];
  largeExposures: LargeExposureItem[];
  generatedAt: string;
}

export interface CbkRegulatoryFilterParams {
  bankId?: string;
  period?: string; // e.g. "Q1-2026", "Q2-2026", "Q3-2026", "Q4-2026"
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Credit Assessment & CRB Bureau Underwriting Reports
// ─────────────────────────────────────────────────────────────────────────────

export type CrbRiskBracket = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UnderwritingDecision = 'APPROVED' | 'CONDITIONAL' | 'REFERRED' | 'REJECTED';
export type CovenantStatus = 'PASSED' | 'WARNING' | 'FAILED';

export interface FinancialCovenantItem {
  id: string;
  covenantName: string;
  benchmarkRule: string;
  actualValue: string | number;
  status: CovenantStatus;
  notes: string;
}

export interface CashflowMatrix {
  averageMonthlyTurnover: number;
  dscr: number; // Debt Service Coverage Ratio (e.g. 1.85)
  minimumOperatingBalance: number;
  peakSeasonTurnover?: number;
  cashflowVolatilityPercent: number;
  workingCapitalCycleDays: number;
  netMonthlyOperatingIncome: number;
}

export interface CrbCreditBureauData {
  crbScore: number; // 300 to 850
  bureauName: 'Metropol CRB' | 'TransUnion Africa' | 'CreditInfo';
  riskBracket: CrbRiskBracket;
  inquiriesLast6Months: number;
  delinquentAccountsCount: number;
  creditHistoryMonths: number;
  cleanTaxCompliance: boolean;
  scoreDate: string;
}

export interface RecommendedTerms {
  recommendedFacilityLimit: number;
  recommendedRatePercent: number;
  maxTenorDays: number;
  riskTier: string;
  decision: UnderwritingDecision;
  decisionRationale: string;
}

export interface BorrowerCreditAssessmentReport {
  distributorId: string;
  distributorName: string;
  kraPin: string;
  businessRegistrationNumber: string;
  contactEmail: string;
  contactPhone: string;
  bankId: string;
  bankName: string;
  anchorManufacturerName: string;
  assessmentDate: string;
  underwritingOfficer: string;
  crbData: CrbCreditBureauData;
  cashflowMatrix: CashflowMatrix;
  covenants: FinancialCovenantItem[];
  recommendedTerms: RecommendedTerms;
}

export interface CreditAssessmentPipelineItem {
  distributorId: string;
  distributorName: string;
  kraPin: string;
  anchorManufacturer: string;
  bankName: string;
  crbScore: number;
  riskBracket: CrbRiskBracket;
  riskTier: string;
  averageMonthlyTurnover: number;
  dscr: number;
  recommendedLimit: number;
  sanctionedLimit?: number;
  covenantsPassed: number;
  covenantsTotal: number;
  decision: UnderwritingDecision;
  assessmentDate: string;
}

export interface CreditAssessmentSummaryResponse {
  totalAssessmentsCount: number;
  averageCrbScore: number;
  approvedVolume: number;
  rejectionRatePercent: number;
  averageDscr: number;
  assessments: CreditAssessmentPipelineItem[];
}

export interface CreditAssessmentFilterParams {
  bankId?: string;
  riskTier?: string;
  decision?: string;
  startDate?: string;
  endDate?: string;
}
