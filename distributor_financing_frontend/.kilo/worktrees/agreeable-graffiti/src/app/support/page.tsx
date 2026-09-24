import React from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowLeft, Mail, Phone, LifeBuoy } from 'lucide-react';

export default function SupportPage() {
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
            <LifeBuoy size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Technical Support &amp; Help Desk</h1>
            <p className="text-xs text-slate-500">Distributor Financing Platform (DFP)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <Mail className="h-6 w-6 text-[#1F4DA8]" />
            <h3 className="text-sm font-bold text-slate-900">Email Support</h3>
            <p className="text-xs text-slate-500">
              For technical inquiries, password resets, or API integration assistance:
            </p>
            <a
              href="mailto:support@emtechhouse.co.ke"
              className="text-xs font-bold text-[#1F4DA8] hover:underline block"
            >
              support@emtechhouse.co.ke
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <Phone className="h-6 w-6 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Hotline Support</h3>
            <p className="text-xs text-slate-500">
              Available Monday to Friday, 8:00 AM – 5:00 PM EAT:
            </p>
            <span className="text-xs font-bold text-slate-900 block">+254 (0) 20 123 4567</span>
          </div>
        </div>
      </div>
    </div>
  );
}

