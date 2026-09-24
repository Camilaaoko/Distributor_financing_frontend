import { repaymentsService, type RepaymentRecord } from '@/services/repayments.service';

export interface RepaymentReport { totalTransactions: number; completedTransactions: number; pendingTransactions: number; rejectedTransactions: number; totalRepaid: number; totalOutstanding: number; records: RepaymentRecord[]; }
export interface RepaymentReportParams { startDate?: string; endDate?: string; }

function toReport(records: RepaymentRecord[]): RepaymentReport {
  const completed = records.filter((item) => item.status === 'COMPLETED');
  return { totalTransactions: records.length, completedTransactions: completed.length, pendingTransactions: records.filter((item) => ['PENDING_CONFIRMATION', 'CONFIRMED', 'BANK_MAKER_VERIFIED'].includes(item.status)).length, rejectedTransactions: records.filter((item) => item.status === 'REJECTED').length, totalRepaid: completed.reduce((sum, item) => sum + item.totalAmount, 0), totalOutstanding: records.reduce((sum, item) => sum + (item.outstandingBalanceAfter ?? 0), 0), records };
}

export const repaymentReportsService = {
  async generate(params: RepaymentReportParams = {}): Promise<RepaymentReport> {
    // Repayment screens intentionally use local sample data during development.
    // The endpoint defined in report.json is wired into this contract but is not
    // called until the repayment service is moved to live data.
    const { content } = await repaymentsService.list({ size: 100 });
    const inRange = content.filter((record) => { const date = record.initiatedAt?.slice(0, 10); return (!params.startDate || !date || date >= params.startDate) && (!params.endDate || !date || date <= params.endDate); });
    return toReport(inRange);
  },
};
