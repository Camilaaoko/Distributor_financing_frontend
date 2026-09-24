'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, UserPlus, Landmark, FileText } from 'lucide-react';
import { bankService } from '@/services/bank.service';

const ICONS: Record<string, typeof CheckCircle2> = {
  approved: CheckCircle2,
  rejected: XCircle,
  registrations: UserPlus,
  facilities: Landmark,
};

const COLORS: Record<string, string> = {
  approved: 'bg-green-50 text-[#16A34A]',
  rejected: 'bg-red-50 text-[#DC2626]',
  registrations: 'bg-blue-50 text-[#1F4DA8]',
  facilities: 'bg-blue-50 text-[#1F4DA8]',
};

export default function BankReportsPage() {
  const [cards, setCards] = useState<{ label: string; value: string; icon: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bankService.getReportsData().then((data) => {
      setCards(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports &amp; Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Summary of key metrics for your bank&apos;s operations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-11 w-11 rounded-xl bg-slate-100" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
                <div className="h-7 w-16 bg-slate-100 rounded" />
              </div>
            ))
          : cards.map((card) => {
              const Icon = ICONS[card.icon] ?? FileText;
              const color = COLORS[card.icon] ?? 'bg-slate-100 text-slate-600';
              return (
                <div key={card.label} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="text-sm font-medium text-slate-500">{card.label}</div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-3">{card.value}</div>
                </div>
              );
            })}
      </div>
    </div>
  );
}