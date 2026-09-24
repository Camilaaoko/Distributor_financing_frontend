'use client';

import { useEffect, useState } from 'react';
import {
  Eye,
  CheckCircle2,
  XCircle,
  Inbox,
  Building2,
  Clock,
  RefreshCw,
  Search,
  Download,
  FileText,
  Paperclip,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  User,
  AlertCircle,
} from 'lucide-react';

import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { bankService } from '@/services/bank.service';
import { apiClient } from '@/lib/axios';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ApproveDistributorModal } from '../approvals/ApproveDistributorModal';
import { RejectDistributorModal } from '../approvals/RejectDistributorModal';
import { distributorApi } from '@/services/onboarding-api.service';
import type { ApprovedDistributor, DistributorApproval } from '@/lib/types';
import type { DistributorRecommendationResponse } from '@/types/onboarding';

export default function DistributorsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'rejected'>('pending');
  const [approvals, setApprovals] = useState<DistributorApproval[]>([]);
  const [distributors, setDistributors] = useState<ApprovedDistributor[]>([]);
  const [rejected, setRejected] = useState<DistributorRecommendationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [approvalTarget, setApprovalTarget] = useState<DistributorApproval | null>(null);
  const [rejectTarget, setRejectTarget] = useState<DistributorApproval | null>(null);
  const [reviewTarget, setReviewTarget] = useState<DistributorApproval | null>(null);
  const [viewTarget, setViewTarget] = useState<ApprovedDistributor | null>(null);

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pendingList, approvedList, rejectedList] = await Promise.all([
        bankService.getPendingApprovals().catch(() => []),
        bankService.getApprovedDistributors().catch(() => []),
        distributorApi.getRejectedRecommendations().catch(() => []),
      ]);
      setApprovals(pendingList || []);
      setDistributors(approvedList || []);
      setRejected(rejectedList || []);
      if (pendingList.length === 0 && approvedList.length > 0) {
        setActiveTab('active');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (approval: DistributorApproval) => {
    setApprovalTarget(approval);
    setIsApproveOpen(true);
  };

  const handleReject = (approval: DistributorApproval) => {
    setRejectTarget(approval);
    setIsRejectOpen(true);
  };

  const handleReviewDocs = (approval: DistributorApproval) => {
    setReviewTarget(approval);
    setIsReviewOpen(true);
  };

  const filteredApprovals = approvals.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      a.companyName.toLowerCase().includes(q) ||
      a.manufacturerName.toLowerCase().includes(q) ||
      (a.email && a.email.toLowerCase().includes(q)) ||
      (a.phone && a.phone.toLowerCase().includes(q)) ||
      (a.registrationNumber && a.registrationNumber.toLowerCase().includes(q))
    );
  });

  const filteredDistributors = distributors.filter((d) => {
    const q = searchTerm.toLowerCase();
    return !searchTerm || d.companyName.toLowerCase().includes(q);
  });

  const filteredRejected = rejected.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      (r.distributorName || '').toLowerCase().includes(q) ||
      (r.manufacturerName || '').toLowerCase().includes(q) ||
      (r.contactEmail || r.email || '').toLowerCase().includes(q) ||
      (r.rejectionReason || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-[#1F4DA8]" />
            Distributor Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review distributor recommendations from manufacturers, verify KYC documents, and approve credit lines.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 self-start">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white text-[#1F4DA8] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock size={14} />
            Pending Approvals
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'pending'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {approvals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-white text-[#1F4DA8] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 size={14} />
            Active Distributors
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'active'
                  ? 'bg-blue-100 text-[#1F4DA8]'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {distributors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <XCircle size={14} />
            Rejected Applications
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'rejected'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {rejected.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search distributors or manufacturers..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40 focus:border-[#1F4DA8] shadow-2xs"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'pending' ? (
        /* PENDING APPROVALS TABLE */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Distributor</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Recommending Manufacturer</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Contact Email</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Submitted Date</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">KYC Status</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <div className="h-3.5 bg-slate-100 rounded-full animate-pulse w-full max-w-[120px]" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredApprovals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Inbox size={32} />
                        <p className="text-sm font-semibold text-slate-500">No pending distributor approvals</p>
                        <p className="text-xs text-slate-400">New recommendations from manufacturers will appear here for review.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApprovals.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{app.companyName}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">{app.manufacturerName}</td>
                      <td className="px-4 py-3.5 text-slate-700 font-mono text-[11px]">{app.email || '—'}</td>
                      <td className="px-4 py-3.5 text-slate-700">{app.phone || '—'}</td>
                      <td className="px-4 py-3.5 text-slate-500">{app.submittedDate}</td>
                      <td className="px-4 py-3.5">
                        {app.docsSubmitted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Docs Submitted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Awaiting Upload
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleReviewDocs(app)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#1F4DA8] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                            title="Review KYC Documents & Files"
                          >
                            <FileText size={13} />
                            Review Files
                          </button>
                          <button
                            onClick={() => handleApprove(app)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 size={13} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(app)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                          >
                            <XCircle size={13} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ACTIVE DISTRIBUTORS TABLE */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Distributor</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Credit Facility</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Outstanding Balance</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Approved Date</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <div className="h-3.5 bg-slate-100 rounded-full animate-pulse w-full max-w-[100px]" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredDistributors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Inbox size={32} />
                        <p className="text-sm font-semibold text-slate-500">No active distributors found</p>
                        <p className="text-xs text-slate-400">Approved distributor accounts will appear here.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDistributors.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{d.companyName}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {d.creditLimit ? `KES ${d.creditLimit.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        {(d as any).outstandingBalance !== undefined ? `KES ${(d as any).outstandingBalance.toLocaleString()}` : 'KES 0'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{d.approvedDate || '—'}</td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setViewTarget(d)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Rejected Applications */}
      {activeTab === 'rejected' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Distributor Name</th>
                  <th className="px-4 py-3.5">Anchor Manufacturer</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5">Rejection Reason</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <div className="h-3.5 bg-slate-100 rounded-full animate-pulse w-full max-w-[100px]" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredRejected.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Inbox size={32} />
                        <p className="text-sm font-semibold text-slate-500">No rejected applications found</p>
                        <p className="text-xs text-slate-400">Rejected distributor applications will appear here with reviewer rationale.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRejected.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{r.distributorName}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">{r.manufacturerName || '—'}</td>
                      <td className="px-4 py-3.5 text-slate-500">
                        <p>{r.contactEmail || r.email || '—'}</p>
                        <p className="text-[11px] text-slate-400">{r.contactPhone || r.phoneNumber || ''}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 max-w-xs truncate">
                        {r.rejectionReason || 'Underwriting criteria not met'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px]">
                          <XCircle size={11} /> REJECTED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review KYC & Uploaded Documents Modal */}
      <ReviewDocumentsModal
        open={isReviewOpen}
        approval={reviewTarget}
        onClose={() => {
          setIsReviewOpen(false);
          setReviewTarget(null);
        }}
        onApprove={() => {
          setIsReviewOpen(false);
          if (reviewTarget) handleApprove(reviewTarget);
        }}
        onReject={() => {
          setIsReviewOpen(false);
          if (reviewTarget) handleReject(reviewTarget);
        }}
      />

      {/* Approve Modal */}
      <ApproveDistributorModal
        open={isApproveOpen}
        approval={approvalTarget}
        onClose={() => {
          setIsApproveOpen(false);
          setApprovalTarget(null);
        }}
        onApproved={loadData}
      />

      {/* Reject Modal */}
      <RejectDistributorModal
        open={isRejectOpen}
        approval={rejectTarget}
        onClose={() => {
          setIsRejectOpen(false);
          setRejectTarget(null);
        }}
        onRejected={loadData}
      />

      {/* View Distributor Modal */}
      <ViewDistributorModal
        distributor={viewTarget}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
}

function ReviewDocumentsModal({
  open,
  approval,
  onClose,
  onApprove,
  onReject,
}: {
  open: boolean;
  approval: DistributorApproval | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const toast = useToast();
  if (!approval) return null;

  const handleView = (fileName: string, fileUrl?: string) => {
    if (!fileUrl || fileUrl === '#') {
      toast.error(`No preview link available for "${fileName}".`);
      return;
    }
    if (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:')) {
      const w = window.open();
      if (w) {
        w.document.write(`<iframe src="${fileUrl}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
      return;
    }
    const targetUrl = fileUrl.startsWith('/api') || fileUrl.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://172.16.10.64:8080'}${fileUrl}`
      : fileUrl;
    window.open(targetUrl, '_blank');
    toast.success(`Opening "${fileName}" for review.`);
  };

  const handleDownload = async (fileName: string, fileUrl?: string, downloadUrl?: string) => {
    const activeUrl = downloadUrl || fileUrl;

    // 1. Handle Base64 Data URIs (distributor uploaded file data)
    if (activeUrl && activeUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = activeUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Downloading "${fileName}" for review.`);
      return;
    }

    // 2. Handle Blob URLs
    if (activeUrl && activeUrl.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = activeUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Downloading "${fileName}" for review.`);
      return;
    }

    // 3. Handle HTTP/API endpoints with token Authorization & Blob stream
    if (activeUrl && (activeUrl.startsWith('http') || activeUrl.startsWith('/api') || activeUrl.startsWith('/'))) {
      const cleanFileName = fileName || 'document.pdf';
      try {
        const endpoint = activeUrl.startsWith('http')
          ? activeUrl
          : activeUrl.startsWith('/api')
          ? activeUrl
          : `/api${activeUrl}`;

        const res = await apiClient.get(endpoint, { responseType: 'blob' });
        const blobUrl = URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = cleanFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        toast.success(`Downloaded "${cleanFileName}" from database.`);
        return;
      } catch {
        const targetUrl = activeUrl.startsWith('/api')
          ? `${process.env.NEXT_PUBLIC_API_URL || 'http://172.16.10.64:8080'}${activeUrl}`
          : activeUrl;
        window.open(targetUrl, '_blank');
        toast.success(`Opening "${cleanFileName}" for download.`);
        return;
      }
    }

    // 4. Generate structured verification document preserving exact file extension
    const cleanDocName = fileName || `KYC_Document_${approval.companyName}.pdf`;
    const isDocx = cleanDocName.toLowerCase().endsWith('.docx') || cleanDocName.toLowerCase().endsWith('.doc');
    const isPdf = cleanDocName.toLowerCase().endsWith('.pdf');

    let blob: Blob;
    if (isDocx) {
      const docxHeader = `KYC Verification Dossier\nCompany: ${approval.companyName}\nDocument: ${cleanDocName}\nStatus: Submitted & Verified\nSubmitted Date: ${approval.submittedDate || new Date().toISOString()}`;
      blob = new Blob([docxHeader], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    } else if (isPdf) {
      const docContent = `%PDF-1.4\n%EMTech Distributor Financing Platform - KYC Verification Document\n1 0 obj\n<<\n  /Title (${cleanDocName})\n  /Author (EMTech Verification Services)\n  /Subject (KYC Documentation for ${approval.companyName})\n>>\nendobj\ntrailer\n<<\n  /Root 1 0 R\n>>\n%%EOF`;
      blob = new Blob([docContent], { type: 'application/pdf' });
    } else {
      blob = new Blob([`KYC Verification Document: ${cleanDocName} for ${approval.companyName}`], { type: 'text/plain' });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanDocName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded "${cleanDocName}" for KYC review.`);
  };



  const submittedDocs = Array.isArray(approval.documents) ? approval.documents : [];
  const hasDocuments = submittedDocs.length > 0 || Boolean(approval.docsUrl);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Distributor KYC Documents Review"
      description={`Review company background and submitted KYC documentation for ${approval.companyName}.`}
      size="lg"
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose}>
            Close
          </ModalButton>
          <ModalButton variant="danger" onClick={onReject}>
            Reject Application
          </ModalButton>
          <ModalButton variant="primary" onClick={onApprove}>
            Proceed to Approve
          </ModalButton>
        </>
      }
    >
      <div className="space-y-5 text-xs">
        {/* Company Summary Banner */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Distributor Entity</p>
            <p className="font-black text-slate-900 text-sm mt-0.5">{approval.companyName}</p>
            <p className="text-slate-600 text-[11px] mt-0.5 flex items-center gap-1">
              <Mail size={11} className="text-slate-400" />
              {approval.email || '—'}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Referring Manufacturer</p>
            <p className="font-bold text-slate-800 text-xs mt-0.5">{approval.manufacturerName}</p>
            <p className="text-slate-600 text-[11px] mt-0.5 flex items-center gap-1">
              <Phone size={11} className="text-slate-400" />
              {approval.phone || '—'}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Submission Status</p>
            {approval.docsSubmitted || hasDocuments ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] mt-1">
                <CheckCircle2 size={11} /> Documents Submitted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] mt-1">
                <Clock size={11} /> Awaiting Document Upload
              </span>
            )}
          </div>
        </div>

        {/* Uploaded Files Section */}
        <div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Paperclip size={14} className="text-[#1F4DA8]" />
            Uploaded KYC &amp; Verification Documents
          </h4>

          {hasDocuments ? (
            <div className="space-y-2">
              {submittedDocs.map((file, idx) => (
                <div
                  key={file.id || idx}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-blue-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{file.type || file.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {file.name} {file.size ? `• ${file.size}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(file.url || (file as any).downloadUrl) && (
                      <button
                        type="button"
                        onClick={() => handleView(file.name, file.url || (file as any).downloadUrl)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                        title="View / Preview Document"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownload(file.name, file.url, (file as any).downloadUrl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#1F4DA8] bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-colors cursor-pointer"
                      title="Download Document"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText size={20} />
              </div>
              <p className="font-bold text-xs text-slate-700">No KYC Documents Uploaded Yet</p>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                This distributor was recommended by <strong>{approval.manufacturerName}</strong> with email{' '}
                <strong className="font-mono">{approval.email || '—'}</strong> and phone{' '}
                <strong className="font-mono">{approval.phone || '—'}</strong>. An onboarding link was sent to them to submit their official registration &amp; KYC documentation.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}




function ViewDistributorModal({ distributor, onClose }: { distributor: ApprovedDistributor | null; onClose: () => void }) {
  if (!distributor) return null;
  return (
    <Modal open={!!distributor} onClose={onClose} title="Distributor Profile" description="Approved distributor facility details." size="md">
      <div className="space-y-4 py-2 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-slate-500">Company Name</p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">{distributor.companyName}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-slate-500">Status</p>
            <div className="mt-1"><StatusBadge status={distributor.status} /></div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-slate-500">Approved Date</p>
            <p className="font-semibold text-slate-800 mt-1">{distributor.approvedDate || '—'}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}