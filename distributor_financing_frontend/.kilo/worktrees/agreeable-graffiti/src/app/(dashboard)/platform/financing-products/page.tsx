'use client';

import { useEffect, useState } from 'react';
import { financingModelsApi } from '@/services/loans-api.service';
import type { FinancingModelResponse } from '@/types/loans';

export default function FinancingProductsPage() {
  const [products, setProducts] = useState<FinancingModelResponse[]>([]);
  const [status, setStatus] = useState('Loading financing products…');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    financingModelsApi.getActiveFinancingModels().then(response => {
      if (cancelled) return;
      const items = Array.isArray(response) ? response : response.result;
      if (!Array.isArray(items)) throw new Error('Invalid response');
      setProducts(items);
      setStatus(items.length ? '' : 'No active financing products.');
    }).catch(() => { if (!cancelled) setStatus('Unable to load financing products.'); });
    return () => { cancelled = true; };
  }, [revision]);
  return <div className="p-6 space-y-5"><div><h1 className="text-2xl font-semibold text-slate-900">Financing Products</h1><p className="text-sm text-slate-500 mt-1">Active financing products available on the platform.</p></div>
    {status && <p role="status" className="rounded-xl border border-slate-200 bg-white p-4 text-sm">{status} {status.startsWith('Unable') && <button className="ml-3 text-blue-700 underline" onClick={() => { setStatus('Loading financing products…'); setRevision(value => value + 1); }}>Retry</button>}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{products.map(product => <article key={product.id} className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">{product.name}</h2><p className="mt-2 text-sm text-slate-500">{product.description || product.modelType.replaceAll('_', ' ')}</p><dl className="mt-4 text-sm space-y-2"><div className="flex justify-between"><dt>Base interest rate</dt><dd>{product.baseInterestRate}%</dd></div><div className="flex justify-between"><dt>Tenor</dt><dd>{product.minTenorDays}–{product.maxTenorDays} days</dd></div></dl></article>)}</div>
  </div>;
}
