/**
 * Reports & Analytics Microservice API Client
 * OpenAPI Specification: reortss.json (/reports/**)
 */

import { apiClient } from '@/lib/axios';
import { USE_REPORT_MOCKS } from '@/lib/config';
import { downloadReportCsv } from '@/lib/download';
import { distributorLoanProfilesApi, loanRequestsApi } from '@/services/loans-api.service';
import type {
  DistributorLoanProfileResponse,
  LoanRequestResponse,
  MessageAndResultResponse,
} from '@/types/loans';
import {
  defaultMockStatement,
  mockDistributorStatements,
  mockPortfolioPerformance,
  mockCbkRegulatory,
  mockSingleCreditAssessment,
  mockCreditAssessmentSummary,
} from '@/lib/mock/reports';
import type {
  CustomerStatementResponse,
  StatementFilterParams,
  PortfolioPerformanceResponse,
  PortfolioFilterParams,
  CbkRegulatorySummaryResponse,
  CbkRegulatoryFilterParams,
  CreditAssessmentSummaryResponse,
  CreditAssessmentFilterParams,
  BorrowerCreditAssessmentReport,
} from '@/types/reports';

const BASE_PATH = '/api/reports';

function cleanParams(params?: object): Record<string, string> {
  if (!params) return {};
  const cleaned: Record<string, string> = {};
  Object.entries(params as Record<string, unknown>).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
      cleaned[k] = String(v);
    }
  });
  return cleaned;
}

/** Unwrap the standard Reports Service envelope declared in reports2.json. */
async function getReport<T>(path: string, params?: object): Promise<T> {
  const { data } = await apiClient.get(`${BASE_PATH}${path}`, { params: cleanParams(params) });
  const result = data?.result ?? data?.data ?? data;
  if (result === undefined || result === null) throw new Error('Reports service returned no data.');
  return result as T;
}

/**
 * Keeps the mock underwriting report aligned with the facility used by the
 * drawdowns ledger. Narrative/cashflow fixture data remains local, while
 * facility terms always come from the distributor's loan profile.
 */
async function getSyncedCreditAssessmentMock(
  distributorId: string,
): Promise<BorrowerCreditAssessmentReport> {
  try {
    const [profileResponse, loansResponse] = await Promise.all([
      distributorLoanProfilesApi.getProfileByDistributorId(distributorId),
      loanRequestsApi.getLoanRequestsByDistributor(distributorId),
    ]);
    const profile =
      (profileResponse as MessageAndResultResponse<DistributorLoanProfileResponse>).result ??
      (profileResponse as unknown as DistributorLoanProfileResponse);
    if (!profile || Number(profile.creditLimit) <= 0) {
      throw new Error('Distributor loan profile is unavailable.');
    }

    const score = Number(profile.creditScore) || mockSingleCreditAssessment.crbData.crbScore;
    const maxTenorDays = Array.isArray(profile.allowedRepaymentTerms) && profile.allowedRepaymentTerms.length > 0
      ? Math.max(...profile.allowedRepaymentTerms.map(Number).filter(Number.isFinite))
      : mockSingleCreditAssessment.recommendedTerms.maxTenorDays;
    const loanResult =
      (loansResponse as MessageAndResultResponse<LoanRequestResponse[] | { content?: LoanRequestResponse[] }>).result ??
      (loansResponse as MessageAndResultResponse<LoanRequestResponse[] | { content?: LoanRequestResponse[] }>).data;
    const loans = Array.isArray(loanResult) ? loanResult : loanResult?.content ?? [];
    const anchorManufacturerName =
      loans.find((loan) => loan.manufacturerName)?.manufacturerName ||
      mockSingleCreditAssessment.anchorManufacturerName;

    return {
      ...mockSingleCreditAssessment,
      distributorId,
      distributorName: profile.distributorName || mockSingleCreditAssessment.distributorName,
      bankId: profile.bankId || mockSingleCreditAssessment.bankId,
      anchorManufacturerName,
      covenants: mockSingleCreditAssessment.covenants.map((covenant) =>
        covenant.id === 'cov-04'
          ? {
              ...covenant,
              actualValue: `42 months active with ${anchorManufacturerName}`,
              notes: `Active distribution relationship with ${anchorManufacturerName}.`,
            }
          : covenant,
      ),
      crbData: { ...mockSingleCreditAssessment.crbData, crbScore: score },
      recommendedTerms: {
        ...mockSingleCreditAssessment.recommendedTerms,
        recommendedFacilityLimit: Number(profile.creditLimit),
        recommendedRatePercent: Number(profile.interestRate) || mockSingleCreditAssessment.recommendedTerms.recommendedRatePercent,
        maxTenorDays,
        decisionRationale: `Distributor demonstrates strong cashflow throughput and repayment capacity with an established partnership with Anchor Manufacturer ${anchorManufacturerName}.`,
      },
    };
  } catch (error) {
    console.warn('[REPORTS] Could not load distributor loan profile; using the report fixture.', error);
    return { ...mockSingleCreditAssessment, distributorId };
  }
}



export const reportsService = {
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Customer Statements
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/reports/statements/my-statement
   * Resolves distributor from caller JWT and returns their statement.
   */
  async getMyStatement(params?: StatementFilterParams): Promise<CustomerStatementResponse> {
    if (USE_REPORT_MOCKS) return defaultMockStatement;

    const { data } = await apiClient.get(`${BASE_PATH}/statements/my-statement`, {
      params: cleanParams(params),
    });
    const result = data?.result || data?.data || data;
    if (!result) throw new Error('The statement service returned no data.');
    return result;
  },

  /**
   * Export My Statement as CSV stream
   */
  async exportMyStatementCsv(params?: StatementFilterParams, fallbackData?: CustomerStatementResponse): Promise<void> {
    const query = new URLSearchParams(cleanParams(params)).toString();
    const endpoint = `${BASE_PATH}/statements/my-statement/export/csv${query ? `?${query}` : ''}`;
    const filename = `My_Statement_${params?.startDate || 'all'}_to_${params?.endDate || 'latest'}.csv`;

    const statement = fallbackData || defaultMockStatement;
    const fallbackHeaders = ['Date', 'Transaction Ref', 'Type', 'Description', 'Debit (KES)', 'Credit (KES)', 'Running Balance (KES)'];
    const fallbackRows = statement.ledger.map((item) => [
      item.date,
      item.transactionRef,
      item.type,
      item.description,
      item.debit,
      item.credit,
      item.runningBalance,
    ]);

    return downloadReportCsv(endpoint, filename, {
      fallbackHeaders,
      fallbackRows,
    });
  },

  /**
   * GET /api/reports/statements/distributor/{distributorId}
   * Returns financial statement for a designated distributor.
   */
  async getCustomerStatement(
    distributorId: string,
    params?: StatementFilterParams,
  ): Promise<CustomerStatementResponse> {
    if (USE_REPORT_MOCKS) {
      return mockDistributorStatements[distributorId] || defaultMockStatement;
    }

    const { data } = await apiClient.get(
      `${BASE_PATH}/statements/distributor/${encodeURIComponent(distributorId)}`,
      { params: cleanParams(params) },
    );
    const result = data?.result || data?.data || data;
    if (!result) throw new Error('The statement service returned no data.');
    return result;
  },

  /**
   * Export Customer Statement as CSV stream
   */
  async exportCustomerStatementCsv(
    distributorId: string,
    params?: StatementFilterParams,
    fallbackData?: CustomerStatementResponse,
  ): Promise<void> {
    const query = new URLSearchParams(cleanParams(params)).toString();
    const endpoint = `${BASE_PATH}/statements/distributor/${encodeURIComponent(distributorId)}/export/csv${
      query ? `?${query}` : ''
    }`;
    const filename = `Statement_${distributorId}_${params?.startDate || 'all'}_to_${params?.endDate || 'latest'}.csv`;

    const statement = fallbackData || mockDistributorStatements[distributorId] || defaultMockStatement;
    const fallbackHeaders = ['Date', 'Transaction Ref', 'Type', 'Description', 'Debit (KES)', 'Credit (KES)', 'Running Balance (KES)'];
    const fallbackRows = statement.ledger.map((item) => [
      item.date,
      item.transactionRef,
      item.type,
      item.description,
      item.debit,
      item.credit,
      item.runningBalance,
    ]);

    return downloadReportCsv(endpoint, filename, {
      fallbackHeaders,
      fallbackRows,
    });
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Portfolio Performance & Credit Risk
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/reports/portfolio/performance
   * Returns active loans, gross portfolio, PAR 30/60/90, NPL ratio %, collection efficiency, aging buckets.
   */
  async getPortfolioPerformance(params?: PortfolioFilterParams): Promise<PortfolioPerformanceResponse> {
    if (USE_REPORT_MOCKS) return mockPortfolioPerformance;

    try {
      const { data } = await apiClient.get(`${BASE_PATH}/portfolio/performance`, {
        params: cleanParams(params),
      });
      return data?.result || data?.data || data || mockPortfolioPerformance;
    } catch (err) {
      console.warn('Backend getPortfolioPerformance failed, using fallback:', err);
      return mockPortfolioPerformance;
    }
  },

  /**
   * Export Portfolio Performance Report as CSV
   */
  async exportPortfolioPerformanceCsv(
    params?: PortfolioFilterParams,
    fallbackData?: PortfolioPerformanceResponse,
  ): Promise<void> {
    const query = new URLSearchParams(cleanParams(params)).toString();
    const endpoint = `${BASE_PATH}/portfolio/export/csv${query ? `?${query}` : ''}`;
    const filename = `Portfolio_Performance_Report_${new Date().toISOString().split('T')[0]}.csv`;

    const portfolio = fallbackData || mockPortfolioPerformance;
    const fallbackHeaders = [
      'Aging Bucket / Category',
      'Days Past Due',
      'Account Count',
      'Portfolio Amount (KES)',
      'Portfolio Share %',
      'Statutory Provision Rate %',
      'Statutory Provision Amount (KES)',
    ];
    const fallbackRows = portfolio.agingSchedule.map((bucket) => [
      bucket.categoryLabel,
      bucket.daysPastDueRange,
      bucket.accountCount,
      bucket.portfolioAmount,
      `${bucket.portfolioPercentage}%`,
      `${bucket.provisionRatePercent}%`,
      bucket.statutoryProvisionAmount,
    ]);

    return downloadReportCsv(endpoint, filename, {
      fallbackHeaders,
      fallbackRows,
    });
  },

  /**
   * GET /api/reports/portfolio/bank/{bankId}
   */
  async getPortfolioByBank(bankId: string): Promise<PortfolioPerformanceResponse> {
    if (USE_REPORT_MOCKS) return mockPortfolioPerformance;

    return getReport<PortfolioPerformanceResponse>(`/portfolio/bank/${encodeURIComponent(bankId)}`);
  },

  /** GET /api/reports/revenue */
  async getRevenueReport(params?: Pick<StatementFilterParams, 'startDate' | 'endDate'>): Promise<unknown> {
    return getReport('/revenue', params);
  },

  /** GET /api/reports/repayments */
  async getRepaymentReport(params?: Pick<StatementFilterParams, 'startDate' | 'endDate'>): Promise<unknown> {
    return getReport('/repayments', params);
  },

  /** GET /api/reports/platform/summary */
  async getPlatformSummary(): Promise<unknown> {
    return getReport('/platform/summary');
  },

  /** GET /api/reports/geographic */
  async getGeographicReport(): Promise<unknown> {
    return getReport('/geographic');
  },

  /** GET /api/reports/funnel */
  async getFunnelReport(): Promise<unknown> {
    return getReport('/funnel');
  },

  /** GET /api/reports/defaulters?bankId */
  async getDefaultersReport(bankId?: string): Promise<unknown> {
    return getReport('/defaulters', { bankId });
  },

  /** GET /api/reports/credit-utilization?bankId */
  async getCreditUtilization(bankId?: string): Promise<unknown> {
    return getReport('/credit-utilization', { bankId });
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Central Bank of Kenya (CBK/PG/04) Regulatory Reports
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/reports/regulatory/cbk/summary
   * Generates CBK/PG/04 Asset Classification and Sectoral Exposures.
   */
  async getCBKRegulatorySummary(params?: CbkRegulatoryFilterParams): Promise<CbkRegulatorySummaryResponse> {
    const period = params?.period || 'Q3-2026';
    if (USE_REPORT_MOCKS) return mockCbkRegulatory[period] || mockCbkRegulatory['Q3-2026'];

    try {
      const { data } = await apiClient.get(`${BASE_PATH}/regulatory/cbk/summary`, {
        params: cleanParams(params),
      });
      return data?.result || data?.data || data || mockCbkRegulatory['Q3-2026'];
    } catch (err) {
      console.warn('Backend getCBKRegulatorySummary failed, using fallback:', err);
      return mockCbkRegulatory[period] || mockCbkRegulatory['Q3-2026'];
    }
  },

  /**
   * Export CBK Prudential Return as CSV
   */
  async exportCBKRegulatoryCsv(
    params?: CbkRegulatoryFilterParams,
    fallbackData?: CbkRegulatorySummaryResponse,
  ): Promise<void> {
    const query = new URLSearchParams(cleanParams(params)).toString();
    const endpoint = `${BASE_PATH}/regulatory/cbk/export/csv${query ? `?${query}` : ''}`;
    const period = params?.period || 'Q3-2026';
    const filename = `CBK_PG04_Supervisory_Return_${period}.csv`;

    const cbkData = fallbackData || mockCbkRegulatory[period] || mockCbkRegulatory['Q3-2026'];
    const fallbackHeaders = [
      'Classification Category',
      'Classification Name',
      'Criteria & Arrears Profile',
      'Number of Accounts',
      'Gross Outstanding (KES)',
      'Required Provision Rate %',
      'Statutory Provision Amount (KES)',
      'Provision Type',
    ];
    const fallbackRows = cbkData.prudentialSchedule.map((item) => [
      item.category,
      item.classificationName,
      item.criteria,
      item.numberOfAccounts,
      item.grossOutstanding,
      `${item.requiredProvisionPercent}%`,
      item.statutoryProvisionAmount,
      item.provisionType,
    ]);

    return downloadReportCsv(endpoint, filename, {
      fallbackHeaders,
      fallbackRows,
    });
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Credit Assessments & Underwriting
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/reports/credit-assessments
   * Returns aggregated pipeline of borrower credit assessments and risk tiers.
   */
  async getCreditAssessmentSummary(
    params?: CreditAssessmentFilterParams,
  ): Promise<CreditAssessmentSummaryResponse> {
    if (USE_REPORT_MOCKS) return mockCreditAssessmentSummary;

    try {
      const { data } = await apiClient.get(`${BASE_PATH}/credit-assessments`, {
        params: cleanParams(params),
      });
      return data?.result || data?.data || data || mockCreditAssessmentSummary;
    } catch (err) {
      console.warn('Backend getCreditAssessmentSummary failed, using fallback:', err);
      return mockCreditAssessmentSummary;
    }
  },

  /**
   * Export Credit Assessment Summary as CSV
   */
  async exportCreditAssessmentCsv(
    params?: CreditAssessmentFilterParams,
    fallbackData?: CreditAssessmentSummaryResponse,
  ): Promise<void> {
    const query = new URLSearchParams(cleanParams(params)).toString();
    const endpoint = `${BASE_PATH}/credit-assessments/export/csv${query ? `?${query}` : ''}`;
    const filename = `Credit_Assessment_Summary_${new Date().toISOString().split('T')[0]}.csv`;

    const summary = fallbackData || mockCreditAssessmentSummary;
    const fallbackHeaders = [
      'Distributor Name',
      'KRA PIN',
      'Anchor Manufacturer',
      'Bank Name',
      'CRB Score',
      'Risk Tier',
      'Monthly Turnover (KES)',
      'DSCR',
      'Recommended Limit (KES)',
      'Sanctioned Limit (KES)',
      'Covenants Passed',
      'Decision',
      'Assessment Date',
    ];
    const fallbackRows = summary.assessments.map((item) => [
      item.distributorName,
      item.kraPin,
      item.anchorManufacturer,
      item.bankName,
      item.crbScore,
      item.riskTier,
      item.averageMonthlyTurnover,
      `${item.dscr}x`,
      item.recommendedLimit,
      item.sanctionedLimit ?? 0,
      `${item.covenantsPassed}/${item.covenantsTotal}`,
      item.decision,
      item.assessmentDate,
    ]);

    return downloadReportCsv(endpoint, filename, {
      fallbackHeaders,
      fallbackRows,
    });
  },

  /**
   * GET /api/reports/credit-assessments/distributor/{distributorId}
   * Returns CRB scores, bank statement cashflow metrics, DSCR, and underwriting parameters.
   */
  async getCreditAssessmentReport(distributorId: string): Promise<BorrowerCreditAssessmentReport> {
    if (USE_REPORT_MOCKS) {
      return getSyncedCreditAssessmentMock(distributorId);
    }

    try {
      const { data } = await apiClient.get(
        `${BASE_PATH}/credit-assessments/distributor/${encodeURIComponent(distributorId)}`,
      );
      return data?.result || data?.data || data || mockSingleCreditAssessment;
    } catch (err) {
      console.warn(`Backend getCreditAssessmentReport failed for ${distributorId}, using fallback:`, err);
      return {
        ...mockSingleCreditAssessment,
        distributorId,
      };
    }
  },
};
