"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Upload, FileText, ArrowLeft, ArrowRight } from "lucide-react";
import { Card } from "@/components/dashboard/Card";
import { ManufacturerHeader } from "@/components/dashboard/ManufacturerHeader";
import { onboardingService } from "@/services/onboarding.service";
import { useToast } from "@/components/ui/Toast";
import { getErrorMessage } from "@/lib/errors";

interface DistributorBasicInfo {
  name: string;
  registrationNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

interface PaymentHistoryRow {
  orderId: string;
  date: string;
  amount: number;
  status: string;
}

const mockPaymentHistory: PaymentHistoryRow[] = [
  { orderId: "ORD-2026-001", date: "2026-01-15", amount: 2500000, status: "Paid" },
  { orderId: "ORD-2026-002", date: "2026-02-20", amount: 3200000, status: "Paid" },
  { orderId: "ORD-2026-003", date: "2026-03-10", amount: 1800000, status: "Paid" },
  { orderId: "ORD-2026-004", date: "2026-04-05", amount: 4100000, status: "Paid" },
  { orderId: "ORD-2026-005", date: "2026-05-12", amount: 2900000, status: "Pending" },
];

export default function ReferDistributorPage() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState<DistributorBasicInfo>({
    name: "",
    registrationNumber: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
  });
  const [paymentHistoryFile, setPaymentHistoryFile] = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<PaymentHistoryRow[]>([]);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBasicInfoChange = (field: keyof DistributorBasicInfo, value: string) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentHistoryFile(file);
      setPaymentPreview(mockPaymentHistory);
    }
  };

  const validateStep1 = () => {
    return basicInfo.name && basicInfo.registrationNumber && basicInfo.contactPerson && basicInfo.email && basicInfo.phone && basicInfo.address;
  };

  const validateStep2 = () => {
    return paymentHistoryFile !== null;
  };

  const validateStep3 = () => {
    return consentChecked;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;
    setIsSubmitting(true);
    try {
      const rec = await onboardingService.createDistributorRecommendation({
        distributorName: basicInfo.name,
        email: basicInfo.email,
        phoneNumber: basicInfo.phone,
      });

      if (rec?.id && paymentHistoryFile) {
        await onboardingService.submitRecommendationDocuments(rec.id).catch(() => {});
      }

      toast.success(`Distributor referral for "${basicInfo.name}" submitted successfully!`);
      router.push("/manufacturer/referrals");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to submit distributor referral."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: "Basic Info", description: "Distributor details & contact" },
    { number: 2, label: "Payment History", description: "Upload CSV/Excel for credit assessment" },
    { number: 3, label: "Consent", description: "Explicit data sharing consent" },
  ];

  return (
    <div className="space-y-6 p-6 max-w-[1000px] mx-auto bg-slate-50 min-h-screen">
      <ManufacturerHeader
        title="Refer Distributor"
        subtitle="Onboard a new distributor by sharing their payment history for credit assessment. Complete all 3 steps to submit the referral."
      />

      {/* STEPPER HEADER */}
      <Card className="bg-white border-slate-200/80 shadow-xs rounded-xl p-6">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const isActive = idx + 1 === step;
            const isCompleted = idx + 1 < step;
            return (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center flex-1 relative">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300 ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isActive
                        ? "bg-[#F97316] text-white shadow-lg shadow-[#F97316]/40"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : s.number}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`font-semibold text-sm ${isActive || isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                      {s.label}
                    </p>
                    <p className="text-[11px] text-slate-500">{s.description}</p>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className="absolute top-5 left-1/2 w-full h-1.5 z-0"
                      style={{ transform: "translateX(-50%)" }}
                    >
                      <div
                        className="h-full rounded transition-all duration-300"
                        style={{
                          backgroundColor: isCompleted ? "#10B981" : "#E2E8F0",
                          width: isCompleted ? "100%" : "0%",
                        }}
                      />
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </Card>

      {/* STEP CONTENT */}
      <Card className="bg-white border-slate-200/80 shadow-xs rounded-xl p-6">
        {/* STEP 1: BASIC INFO */}
        {step === 1 && (
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#F97316] text-white flex items-center justify-center text-sm font-bold">1</div>
              <h3 className="text-lg font-semibold text-slate-900">Step 1: Basic Information</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">Enter the distributor&apos;s business and contact details.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Distributor Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kisumu Retailers Ltd"
                  value={basicInfo.name}
                  onChange={(e) => handleBasicInfoChange("name", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CPR/2023/11092"
                  value={basicInfo.registrationNumber}
                  onChange={(e) => handleBasicInfoChange("registrationNumber", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Otieno"
                  value={basicInfo.contactPerson}
                  onChange={(e) => handleBasicInfoChange("contactPerson", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Corporate Email *</label>
                <input
                  type="email"
                  required
                  placeholder="contact@distributor.com"
                  value={basicInfo.email}
                  onChange={(e) => handleBasicInfoChange("email", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+254 7XX XXX XXX"
                  value={basicInfo.phone}
                  onChange={(e) => handleBasicInfoChange("phone", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch / Location Address *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Physical address of the distributor branch"
                  value={basicInfo.address}
                  onChange={(e) => handleBasicInfoChange("address", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={!validateStep1()}
                onClick={handleNext}
                className="px-5 py-2.5 bg-[#F97316] hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: PAYMENT HISTORY */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">✓</div>
              <div className="w-8 h-8 rounded-full bg-[#F97316] text-white flex items-center justify-center text-sm font-bold">2</div>
              <h3 className="text-lg font-semibold text-slate-900">Step 2: Payment History Upload</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">Upload a CSV or Excel file containing the distributor&apos;s historical purchase and payment records. This data enables partner banks to calculate appropriate credit limits.</p>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 mb-1">Drag & drop CSV/Excel file here, or click to browse</p>
              <p className="text-[11px] text-slate-400">Max file size: 10MB | Supported: .csv, .xlsx, .xls</p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="payment-history-upload"
              />
              <label htmlFor="payment-history-upload" className="mt-4 inline-block px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors">
                Choose File
              </label>
            </div>

            {paymentHistoryFile && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800">{paymentHistoryFile.name}</span>
                    <span className="text-[11px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">{(paymentHistoryFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setPaymentHistoryFile(null); setPaymentPreview([]); }}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Preview: Payment History (First 5 Rows)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Amount (KES)</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {paymentPreview.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="p-3 font-mono text-slate-900">{row.orderId}</td>
                            <td className="p-3 text-slate-600">{row.date}</td>
                            <td className="p-3 font-semibold">KES {row.amount.toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                row.status === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                              }`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">Showing 5 of {paymentPreview.length} rows. Total: KES {paymentPreview.reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                disabled={!validateStep2()}
                onClick={handleNext}
                className="px-5 py-2.5 bg-[#F97316] hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONSENT */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">✓</div>
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">✓</div>
              <div className="w-8 h-8 rounded-full bg-[#F97316] text-white flex items-center justify-center text-sm font-bold">3</div>
              <h3 className="text-lg font-semibold text-slate-900">Step 3: Explicit Consent</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">The distributor must provide explicit consent for their data to be shared with partner banks for credit assessment.</p>

            <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent-checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-[#F97316] border-slate-300 rounded focus:ring-[#F97316] focus:ring-2 cursor-pointer"
                />
                <label htmlFor="consent-checkbox" className="text-sm text-slate-700 leading-relaxed cursor-pointer">
                  <strong className="text-slate-900">I consent to the sharing of my distributor&apos;s data for verification and onboarding purposes.</strong>
                  <br />
                  <span className="text-slate-500">This includes business details, contact information, and payment history uploaded in Step 2. Data will be shared with partner banks solely for credit limit assessment and distributor onboarding on the Distributor Financing Platform.</span>
                </label>
              </div>

              <div className="text-[11px] text-slate-500 pl-7 border-l-2 border-blue-200">
                <p>Consent will be timestamped at submission and recorded in the audit trail per data protection regulations.</p>
                <p className="mt-1">The distributor may withdraw consent at any time by contacting the manufacturer or platform administrator.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Summary</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Distributor:</dt>
                  <dd className="font-medium text-slate-900">{basicInfo.name || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Registration No:</dt>
                  <dd className="font-medium text-slate-900">{basicInfo.registrationNumber || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Contact:</dt>
                  <dd className="font-medium text-slate-900">{basicInfo.contactPerson} ({basicInfo.email})</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Payment History:</dt>
                  <dd className="font-medium text-slate-900">{paymentHistoryFile ? `${paymentPreview.length} records uploaded` : "Not uploaded"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Consent:</dt>
                  <dd className={`font-medium ${consentChecked ? "text-emerald-600" : "text-rose-600"}`}>
                    {consentChecked ? "Granted" : "Not granted"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                disabled={!validateStep3() || isSubmitting}
                onClick={handleSubmit}
                className="px-5 py-2.5 bg-[#F97316] hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                {isSubmitting ? "Submitting..." : "Submit Referral"}
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}