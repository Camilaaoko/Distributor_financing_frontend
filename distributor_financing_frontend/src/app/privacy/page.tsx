import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#1F4DA8] hover:underline"
        >
          <ArrowLeft size={14} /> Back to Login
        </Link>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1F4DA8] rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Privacy Policy</h1>
            <p className="text-xs text-slate-500">Distributor Financing Platform (DFP)</p>
          </div>
        </div>

        <div className="prose prose-slate text-xs leading-relaxed space-y-4 text-slate-600">
          <p>
            Your privacy and commercial trade security are paramount. The Distributor Financing Platform adheres
            to strict enterprise data protection guidelines in compliance with the Data Protection Act and
            Central Bank regulations.
          </p>
          <h3 className="text-sm font-bold text-slate-800">1. Information We Collect</h3>
          <p>
            We process corporate identity data, national identification numbers, employee credentials, and
            invoicing data strictly to facilitate underwriting and credit facility disbursements.
          </p>
          <h3 className="text-sm font-bold text-slate-800">2. Security &amp; Encryption</h3>
          <p>
            All communications are encrypted using TLS 1.3 in transit and AES-256 at rest across multi-tenant
            banking partitions.
          </p>
        </div>
      </div>
    </div>
  );
}

