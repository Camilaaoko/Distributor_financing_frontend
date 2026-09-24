'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Coins,
  Plus,
  Search,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
  Percent,
  Clock,
  DollarSign,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Topbar } from '@/components/dashboard/Topbar';
import { Card } from '@/components/dashboard/Card';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import { financingModelsApi, pricingApi } from '@/services/loans-api.service';
import type {
  FinancingModelResponse,
  FinancingModelRequestDTO,
  PricingRequestDTO,
  FinancingModelType,
  PricingStructureType,
} from '@/types/loans';
import { getErrorMessage } from '@/lib/errors';

export default function BankFinancingModelsPage() {
  const toast = useToast();
  const [models, setModels] = useState<FinancingModelResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState<{
    name: string;
    description: string;
    modelType: FinancingModelType;
    baseInterestRate: string;
    minLoanAmount: string;
    maxLoanAmount: string;
    minTenorDays: string;
    maxTenorDays: string;
    pricingModelType: PricingStructureType;
    distributorProcessingFee: string;
    manufacturerProcessingFee: string;
    penaltyFees: string;
    gracePeriodDays: string;
  }>({
    name: '',
    description: '',
    modelType: 'REVOLVING',
    baseInterestRate: '14.0',
    minLoanAmount: '50000',
    maxLoanAmount: '5000000',
    minTenorDays: '7',
    maxTenorDays: '90',
    pricingModelType: 'PERCENTAGE',
    distributorProcessingFee: '1.5',
    manufacturerProcessingFee: '0.5',
    penaltyFees: '2.0',
    gracePeriodDays: '3',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await financingModelsApi.getAllFinancingModels();
      if (res && res.result) {
        const list = Array.isArray(res.result)
          ? res.result
          : Array.isArray(res.result.content)
          ? res.result.content
          : [];
        setModels(list);
      } else {
        setModels([]);
      }
    } catch {
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleStatus = async (model: FinancingModelResponse) => {
    const nextStatus = !model.isActive;
    try {
      await financingModelsApi.toggleFinancingModelStatus(model.id, nextStatus);
      setModels((prev) =>
        prev.map((m) => (m.id === model.id ? { ...m, isActive: nextStatus } : m))
      );
      toast.success(`Model "${model.name}" is now ${nextStatus ? 'Active' : 'Disabled'}.`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to toggle financing model status.'));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setModalError('Please provide a financing model name.');
      return;
    }

    const baseInterest = parseFloat(form.baseInterestRate);
    const minAmount = parseFloat(form.minLoanAmount);
    const maxAmount = parseFloat(form.maxLoanAmount);
    const minTenor = parseInt(form.minTenorDays, 10);
    const maxTenor = parseInt(form.maxTenorDays, 10);

    if (isNaN(baseInterest) || baseInterest <= 0) {
      setModalError('Please specify a valid base interest rate.');
      return;
    }
    if (isNaN(minAmount) || isNaN(maxAmount) || minAmount > maxAmount) {
      setModalError('Invalid loan amount range.');
      return;
    }
    if (isNaN(minTenor) || isNaN(maxTenor) || minTenor > maxTenor) {
      setModalError('Invalid tenor days range.');
      return;
    }

    setModalError(null);
    setIsSubmitting(true);

    try {
      const modelPayload: FinancingModelRequestDTO = {
        name: form.name.trim(),
        description: form.description.trim(),
        modelType: form.modelType,
        baseInterestRate: baseInterest,
        minLoanAmount: minAmount,
        maxLoanAmount: maxAmount,
        minTenorDays: minTenor,
        maxTenorDays: maxTenor,
      };

      const modelRes = await financingModelsApi.createFinancingModel(modelPayload);
      const createdId = modelRes?.result?.id || Date.now();

      // Configure associated Pricing matrix
      const pricingPayload: PricingRequestDTO = {
        financingModelId: createdId,
        pricingModelType: form.pricingModelType,
        distributorProcessingFee: parseFloat(form.distributorProcessingFee) || 1.0,
        manufacturerProcessingFee: parseFloat(form.manufacturerProcessingFee) || 0.5,
        penaltyFees: parseFloat(form.penaltyFees) || 2.0,
        gracePeriodDays: parseInt(form.gracePeriodDays, 10) || 3,
        pricings: [
          {
            pricingTenure: maxTenor,
            bankPricing: baseInterest,
            solvPricing: 0.5,
            pricingStructure: form.pricingModelType,
          },
        ],
      };

      await pricingApi.createPricing(pricingPayload).catch(() => {});

      toast.success(`Financing model "${form.name}" created and configured successfully.`);
      setCreateModalOpen(false);
      await loadData();
    } catch (err) {
      setModalError(getErrorMessage(err, 'Failed to create financing model.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = models.filter((m) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(term) ||
      m.description?.toLowerCase().includes(term);
    const matchesType = filterType === 'ALL' || m.modelType === filterType;
    return matchesSearch && matchesType;
  });

  const activeCount = models.filter((m) => m.isActive).length;
  const avgRate =
    models.length > 0
      ? (models.reduce((sum, m) => sum + (m.baseInterestRate || 0), 0) / models.length).toFixed(1)
      : '--';

  const validMinTenors = models.map((m) => m.minTenorDays).filter((d): d is number => typeof d === 'number' && d > 0);
  const validMaxTenors = models.map((m) => m.maxTenorDays).filter((d): d is number => typeof d === 'number' && d > 0);
  const minTenor = validMinTenors.length > 0 ? Math.min(...validMinTenors) : null;
  const maxTenor = validMaxTenors.length > 0 ? Math.max(...validMaxTenors) : null;
  const tenorHorizonDisplay =
    minTenor !== null && maxTenor !== null ? `${minTenor} - ${maxTenor} Days` : '--';

  const maxLoanAmounts = models.map((m) => m.maxLoanAmount).filter((a): a is number => typeof a === 'number' && a > 0);
  const highestCap = maxLoanAmounts.length > 0 ? Math.max(...maxLoanAmounts) : null;
  const facilityCapDisplay =
    highestCap !== null
      ? highestCap >= 1_000_000
        ? `KES ${(highestCap / 1_000_000).toFixed(1)}M`
        : `KES ${highestCap.toLocaleString()}`
      : '--';

  return (
    <div className="pb-10">
      <Topbar
        title="Financing Models & Pricing"
        welcomeName="Bank Admin"
        tenantName="EMTech Financing Portal"
        avatarLetter="B"
      />

      <div className="px-6 lg:px-8 space-y-6">
        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Models</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{activeCount}</h3>
              <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} />
                Live on Portal
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center">
              <Coins size={24} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Base Rate</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {avgRate !== '--' ? `${avgRate}% p.a.` : '--'}
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
                <Percent size={12} />
                Across All Tiers
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Percent size={24} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tenor Horizon</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{tenorHorizonDisplay}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
                <Clock size={12} />
                Revolving / Term
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max Facility Cap</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{facilityCapDisplay}</h3>
              <p className="text-xs font-semibold text-indigo-600 mt-1 flex items-center gap-1">
                <ShieldCheck size={12} />
                Single Entity Limit
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Toolbar & Filter */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search financing models..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/20 focus:border-[#1F4DA8] transition-all"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter by model type"
              className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/20 cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="REVOLVING">Revolving</option>
              <option value="DISCOUNTED">Discounted</option>
              <option value="FIXED_RATE">Fixed Rate</option>
              <option value="FLOATING_RATE">Floating Rate</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin text-[#1F4DA8]' : ''} />
            </button>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#1F4DA8] hover:bg-blue-800 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>New Financing Model</span>
            </button>
          </div>
        </div>

        {/* Models Grid & Empty State */}
        {isLoading ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <RefreshCw className="h-8 w-8 animate-spin text-[#1F4DA8] mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Loading financing models from server...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-8 space-y-3 shadow-xs">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center mx-auto">
              <Coins size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Financing Models Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || filterType !== 'ALL'
                ? 'No models match the search criteria. Try adjusting your filters.'
                : 'No financing models configured yet. Create a new model to set up terms and pricing for distributors.'}
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#1F4DA8] hover:bg-blue-800 rounded-xl shadow-xs transition-all cursor-pointer mt-2"
            >
              <Plus size={14} />
              <span>Create Financing Model</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((model) => (
              <div
                key={model.id}
                className={`bg-white rounded-2xl border transition-all duration-150 p-6 flex flex-col justify-between shadow-xs ${
                  model.isActive
                    ? 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                    : 'border-slate-200 bg-slate-50/60 opacity-75'
                }`}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#1F4DA8] border border-blue-200/60">
                        <Layers size={10} />
                        {model.modelType}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-2">{model.name}</h3>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(model)}
                      title={model.isActive ? 'Disable model' : 'Activate model'}
                      className="cursor-pointer text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {model.isActive ? (
                        <ToggleRight size={28} className="text-[#1F4DA8]" />
                      ) : (
                        <ToggleLeft size={28} className="text-slate-300" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                    {model.description || 'Configured distributor financing product with dynamic interest tiers.'}
                  </p>

                  {/* Metrics Breakdown */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                    <div className="bg-slate-50/80 p-2.5 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Base Interest</p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">{model.baseInterestRate}% p.a.</p>
                    </div>

                    <div className="bg-slate-50/80 p-2.5 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Tenor Range</p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">
                        {model.minTenorDays} - {model.maxTenorDays} Days
                      </p>
                    </div>

                    <div className="bg-slate-50/80 p-2.5 rounded-xl col-span-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Loan Limits</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        KES {model.minLoanAmount?.toLocaleString()} — KES {model.maxLoanAmount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Footer */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                  <span
                    className={`inline-flex items-center gap-1 font-bold ${
                      model.isActive ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        model.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                      }`}
                    />
                    {model.isActive ? 'Active on Portal' : 'Disabled'}
                  </span>

                  <span className="text-[11px] font-semibold text-slate-400">ID: #{model.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Financing Model"
        description="Configure loan parameters, interest rates, tenors, and pricing matrix"
        size="lg"
        footer={
          <>
            <ModalButton
              variant="secondary"
              onClick={() => setCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </ModalButton>
            <ModalButton
              variant="primary"
              onClick={handleCreate}
              loading={isSubmitting}
            >
              Save &amp; Publish Model
            </ModalButton>
          </>
        }

      >
        <form onSubmit={handleCreate} className="space-y-4">
          {modalError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <FormField label="Model Name" required>
                <TextInput
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. FMCG Accelerated Liquidity Model"
                />
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <FormField label="Description">
                <TextInput
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief summary of eligibility and off-taker criteria"
                />
              </FormField>
            </div>

            <FormField label="Financing Model Type" required>
              <select
                value={form.modelType}
                onChange={(e) => setForm({ ...form, modelType: e.target.value as FinancingModelType })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/20 font-medium"
              >
                <option value="REVOLVING">Revolving Credit</option>
                <option value="DISCOUNTED">Discounted Invoice</option>
                <option value="FIXED_RATE">Fixed Rate</option>
                <option value="FLOATING_RATE">Floating Rate</option>
              </select>
            </FormField>

            <FormField label="Base Interest Rate (% p.a.)" required>
              <TextInput
                type="number"
                step="0.1"
                value={form.baseInterestRate}
                onChange={(e) => setForm({ ...form, baseInterestRate: e.target.value })}
                placeholder="14.0"
              />
            </FormField>

            <FormField label="Min Loan Amount (KES)" required>
              <TextInput
                type="number"
                value={form.minLoanAmount}
                onChange={(e) => setForm({ ...form, minLoanAmount: e.target.value })}
                placeholder="50000"
              />
            </FormField>

            <FormField label="Max Loan Amount (KES)" required>
              <TextInput
                type="number"
                value={form.maxLoanAmount}
                onChange={(e) => setForm({ ...form, maxLoanAmount: e.target.value })}
                placeholder="5000000"
              />
            </FormField>

            <FormField label="Min Tenor (Days)" required>
              <TextInput
                type="number"
                value={form.minTenorDays}
                onChange={(e) => setForm({ ...form, minTenorDays: e.target.value })}
                placeholder="7"
              />
            </FormField>

            <FormField label="Max Tenor (Days)" required>
              <TextInput
                type="number"
                value={form.maxTenorDays}
                onChange={(e) => setForm({ ...form, maxTenorDays: e.target.value })}
                placeholder="90"
              />
            </FormField>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              Pricing &amp; Fee Matrix
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Distributor Fee (%)">
                <TextInput
                  type="number"
                  step="0.1"
                  value={form.distributorProcessingFee}
                  onChange={(e) => setForm({ ...form, distributorProcessingFee: e.target.value })}
                  placeholder="1.5"
                />
              </FormField>

              <FormField label="Penalty Fee (%)">
                <TextInput
                  type="number"
                  step="0.1"
                  value={form.penaltyFees}
                  onChange={(e) => setForm({ ...form, penaltyFees: e.target.value })}
                  placeholder="2.0"
                />
              </FormField>

              <FormField label="Grace Period (Days)">
                <TextInput
                  type="number"
                  value={form.gracePeriodDays}
                  onChange={(e) => setForm({ ...form, gracePeriodDays: e.target.value })}
                  placeholder="3"
                />
              </FormField>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
