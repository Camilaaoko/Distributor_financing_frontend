"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Clock,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/dashboard/Card";
import { useToast } from "@/components/ui/Toast";
import { repaymentsService, type RepaymentInitiatePayload } from '@/services/repayments.service';
import type { RepaymentRecord } from '@/lib/types';
import { loansService, type CreditFacility } from '@/services/loans.service';

interface RepaymentRecordExtended extends RepaymentRecord {
  manufacturer?: string;
  facilityNumber?: string;
}

function formatAmount(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(Number(val))) return '0';
  return Number(val).toLocaleString();
}

export default function RepaymentsPage() {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [repaymentAmount, setRepaymentAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [facilities, setFacilities] = useState<CreditFacility[]>([]);
  const [repayments, setRepayments] = useState<RepaymentRecordExtended[]>([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(true);
  const [isLoadingRepayments, setIsLoadingRepayments] = useState(true);
  const [selectedRepayment, setSelectedRepayment] = useState<RepaymentRecordExtended | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [actionNotes, setActionNotes] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const mapScheduleStatus = useCallback((status: string): 'PENDING_CONFIRMATION' | 'APPROVED' | 'REJECTED' | 'PROCESSED' => {
    switch (status) {
      case 'Paid':
        return 'PROCESSED';
      case 'Pending':
        return 'PENDING_CONFIRMATION';
      case 'Overdue':
        return 'PENDING_CONFIRMATION';
      case 'Partial':
        return 'PROCESSED';
      default:
        return 'PENDING_CONFIRMATION';
    }
  }, []);

  const loadFacilities = useCallback(async () => {
    setIsLoadingFacilities(true);
    try {
      const data = await loansService.listCreditLimits();
      setFacilities(data);
      if (data.length > 0 && !selectedFacility) {
        setSelectedFacility(data[0].id);
      }
    } catch (err) {
      toast.error('Failed to load credit facilities');
      console.error(err);
    } finally {
      setIsLoadingFacilities(false);
    }
  }, [toast, selectedFacility]);

  const loadRepayments = useCallback(async (facilityId: string) => {
    setIsLoadingRepayments(true);
    try {
      const schedule = await repaymentsService.getSchedule(facilityId);
      // Transform schedule items to repayment records for display
      const mapped: RepaymentRecordExtended[] = schedule.map((item, index) => ({
        id: item.id,
        facilityId: item.facilityId,
        distributorId: item.distributorId,
        totalAmount: item.totalAmount,
        outstandingBalanceBefore: 0,
        outstandingBalanceAfter: 0,
        status: mapScheduleStatus(item.status),
        makerId: '',
        checkerId: '',
        rejectionReason: '',
        initiatedAt: item.dueDate,
        confirmedAt: item.paidDate || '',
        rejectedAt: '',
        processedAt: '',
        reference: `REP-${facilityId}-${index + 1}`,
        notes: '',
        isFullRepayment: item.status === 'Paid',
        newAvailableLimit: 0,
        penaltiesAllocated: item.interestAmount,
        principalAllocated: item.principalAmount,
        manufacturer: '',
        facilityNumber: facilityId,
      }));
      setRepayments(mapped);
    } catch (err) {
      toast.error('Failed to load repayment schedule');
      console.error(err);
    } finally {
      setIsLoadingRepayments(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  useEffect(() => {
    if (selectedFacility) {
      loadRepayments(selectedFacility);
    }
  }, [selectedFacility, loadRepayments]);

  const handleInitiateRepayment = useCallback(async () => {
    if (!selectedFacility || !repaymentAmount.trim()) {
      toast.error('Please select a facility and enter an amount');
      return;
    }

    const amount = parseFloat(repaymentAmount.replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: RepaymentInitiatePayload = {
        makerId: 'current-user-id', // TODO: Get from auth context
        facilityId: selectedFacility,
        amount,
        notes: notes.trim(),
      };

      await repaymentsService.initiateRepayment(payload);
      toast.success('Repayment initiated successfully - awaiting checker approval');
      setShowModal(false);
      setRepaymentAmount('');
      setNotes('');
      await loadRepayments(selectedFacility);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const message = error?.response?.data?.message || error?.message || 'Failed to initiate repayment';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedFacility, repaymentAmount, notes, toast, loadRepayments]);

  const handleAction = useCallback(async () => {
    if (!selectedRepayment) return;
    if (actionType === 'reject' && !actionNotes.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    setIsSubmittingAction(true);
    try {
      if (actionType === 'approve') {
        await repaymentsService.approveRepayment(selectedRepayment.id, {
          checkerId: 'current-checker-id', // TODO: Get from auth context
          notes: actionNotes.trim(),
        });
        toast.success('Repayment approved successfully');
      } else {
        await repaymentsService.rejectRepayment(selectedRepayment.id, {
          checkerId: 'current-checker-id', // TODO: Get from auth context
          reason: actionNotes.trim(),
          notes: '',
        });
        toast.success('Repayment rejected');
      }
      setShowActionModal(false);
      setActionNotes('');
      await loadRepayments(selectedFacility);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const message = error?.response?.data?.message || error?.message || `Failed to ${actionType} repayment`;
      toast.error(message);
    } finally {
      setIsSubmittingAction(false);
    }
  }, [selectedRepayment, actionType, actionNotes, toast, selectedFacility, loadRepayments]);

  const openActionModal = useCallback((repayment: RepaymentRecordExtended, type: 'approve' | 'reject') => {
    setSelectedRepayment(repayment);
    setActionType(type);
    setActionNotes('');
    setShowActionModal(true);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      PENDING_CONFIRMATION: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending Confirmation' },
      APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Approved' },
      REJECTED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Rejected' },
      PROCESSED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Processed' },
    };
    return configs[status as keyof typeof configs] || configs.PENDING_CONFIRMATION;
  };

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  useEffect(() => {
    if (selectedFacility) {
      loadRepayments(selectedFacility);
    }
  }, [selectedFacility, loadRepayments]);

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Repayment Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Trigger facility repayments to clear outstanding balances and restore your revolving credit limit.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={isLoadingFacilities}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          <Wallet className="w-4 h-4" />
          Initiate Repayment
        </button>
      </div>

      {/* FACILITY SELECTOR & OVERVIEW */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Select Facility</h3>
            <p className="text-xs text-slate-500 mt-0.5">Choose an active credit facility to manage repayments</p>
          </div>
          <div className="w-full md:w-96">
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              disabled={isLoadingFacilities}
              className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-lg p-2.5 pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer bg-no-repeat bg-right bg-[length:16px]"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")" }}
            >
              {isLoadingFacilities ? (
                <option value="" disabled>Loading facilities...</option>
              ) : facilities.length === 0 ? (
                <option value="" disabled>No active facilities found</option>
              ) : (
                facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.id} - {f.distributorName || 'Distributor'} (Outstanding: {formatAmount(f.outstanding ?? (f as any).outstandingBalance ?? (f as any).utilizedLimit)} {f.currency || 'KES'})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* OVERVIEW CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Outstanding</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {facilities.length > 0 
                ? facilities.reduce((sum, f) => sum + (Number(f.outstanding ?? (f as any).outstandingBalance ?? (f as any).utilizedLimit) || 0), 0).toLocaleString() 
                : '0'} KES
            </div>
            <p className="text-xs text-slate-500 mt-1">Across {facilities.length} active facilit{'y' + (facilities.length === 1 ? '' : 'ies')}</p>
          </Card>

          <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Next Due</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-rose-600">
              {facilities.length > 0 ? 'Check schedule' : 'N/A'}
            </div>
            <p className="text-xs text-slate-500 mt-1">View repayment schedule for details</p>
          </Card>

          <Card className="bg-white border-slate-200/80 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Auto-Restoration</span>
              <RefreshCw className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-sm font-bold text-emerald-600">Simulated Instant</div>
            <p className="text-xs text-slate-500 mt-1">Full repayment restores available limit</p>
          </Card>
        </div>
      </div>

      {/* REPAYMENT SCHEDULE TABLE */}
      <Card className="bg-white border-slate-200/80 shadow-sm rounded-xl p-6">
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Repayment Schedule</h3>
            <p className="text-xs text-slate-500 mt-0.5">Order of allocation: Fees \u2192 Interest \u2192 Outstanding Principal</p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search reference..."
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg pl-8 pr-3 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Facility ID</th>
                <th className="p-3">Manufacturer</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Principal / Interest</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoadingRepayments ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="p-3">
                        <div className="h-3.5 bg-slate-100 rounded-full animate-pulse w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : repayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Wallet size={32} />
                      <p className="text-sm font-semibold text-slate-500">No repayment schedule found</p>
                      <p className="text-xs">Select a facility to view its schedule.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                repayments.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-semibold text-slate-900">{rep.reference}</td>
                    <td className="p-3 font-medium">{rep.facilityId}</td>
                    <td className="p-3 text-slate-600">{rep.manufacturer || 'N/A'}</td>
                    <td className="p-3 font-bold text-emerald-600">{formatAmount(rep.totalAmount)}</td>
                    <td className="p-3 text-slate-500">{formatAmount(rep.principalAllocated)} / {formatAmount(rep.penaltiesAllocated)}</td>
                    <td className="p-3 text-slate-500">{rep.initiatedAt}</td>
                    <td className="p-3">
                      {(() => {
                        const config = getStatusBadge(rep.status);
                        return (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.bg} ${config.text} ${config.border}`}>
                            {config.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-3">
                      {rep.status === 'PENDING_CONFIRMATION' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openActionModal(rep, 'approve')}
                            className="h-8 px-2.5 text-xs font-semibold flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => openActionModal(rep, 'reject')}
                            className="h-8 px-2.5 text-xs font-semibold flex items-center gap-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                      {rep.status === 'APPROVED' && (
                        <span className="text-xs text-emerald-600 font-medium">Awaiting processing</span>
                      )}
                      {rep.status === 'REJECTED' && (
                        <span className="text-xs text-rose-600 font-medium">Rejected</span>
                      )}
                      {rep.status === 'PROCESSED' && (
                        <span className="text-xs text-emerald-600 font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* INITIATE REPAYMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Initiate Facility Repayment</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Active Facility</label>
                <select
                  value={selectedFacility}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.id} - {f.distributorName || 'Distributor'} (Outstanding: {formatAmount(f.outstanding ?? (f as any).outstandingBalance ?? (f as any).utilizedLimit)} {f.currency || 'KES'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Repayment Amount (KES)</label>
                <input
                  type="text"
                  placeholder="e.g. 4,500,000"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Notes (Optional)</label>
                <textarea
                  placeholder="Enter any notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1 text-slate-600 text-[11px]">
                <div className="flex justify-between">
                  <span>Channel:</span>
                  <span className="font-semibold text-slate-800">Mobile Money / CBS Virtual Account</span>
                </div>
                <div className="flex justify-between">
                  <span>Allocation Order:</span>
                  <span className="font-semibold text-slate-800">Fees → Interest → Principal</span>
                </div>
                <div className="flex justify-between">
                  <span>Revolving Limit:</span>
                  <span className="font-semibold text-emerald-600">Restores instantly on 100% repayment</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => { setShowModal(false); setRepaymentAmount(''); setNotes(''); }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInitiateRepayment}
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {isSubmitting ? (
                  <> <Loader2 size={14} className="animate-spin mr-1" /> Submitting... </>
                ) : (
                  'Submit Repayment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE/REJECT ACTION MODAL */}
      {showActionModal && selectedRepayment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {actionType === 'approve' ? 'Approve Repayment' : 'Reject Repayment'}
              </h3>
              <button onClick={() => { setShowActionModal(false); setActionNotes(''); }} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                <div className="font-semibold text-slate-900">{selectedRepayment.reference}</div>
                <div className="text-slate-500">Facility: {selectedRepayment.facilityId}</div>
                <div className="text-slate-500">Amount: {formatAmount(selectedRepayment.totalAmount)}</div>
              </div>

              {actionType === 'reject' && (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Rejection Reason (Required)</label>
                  <textarea
                    placeholder="Enter rejection reason..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              )}

              {actionType === 'approve' && (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Notes (Optional)</label>
                  <textarea
                    placeholder="Enter any notes..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1 text-slate-600 text-[11px]">
                <div className="font-semibold">{actionType === 'approve' ? 'Approval' : 'Rejection'} will be recorded with your checker ID.</div>
                <div>The maker will be notified of the decision.</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => { setShowActionModal(false); setActionNotes(''); }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={isSubmittingAction || (actionType === 'reject' && !actionNotes.trim())}
                className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                  actionType === 'approve' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                } disabled:opacity-50`}
              >
                {isSubmittingAction ? (
                  <> <Loader2 size={14} className="animate-spin mr-1" /> Processing... </>
                ) : (
                  actionType === 'approve' ? 'Approve' : 'Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusBadge(status: string) {
  const configs = {
    PENDING_CONFIRMATION: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending Confirmation' },
    APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Approved' },
    REJECTED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Rejected' },
    PROCESSED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Processed' },
  };
  return configs[status as keyof typeof configs] || configs.PENDING_CONFIRMATION;
}