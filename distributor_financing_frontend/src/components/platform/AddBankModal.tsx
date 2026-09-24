'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Landmark, Loader2, Search, X, Building2, MapPin } from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField, TextInput } from '@/components/ui/FormField';
import { platformService } from '@/services/platform.service';

interface BankOption {
  id: string;
  name: string;
  bankCode: string;
}

interface AddBankModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { bankCode: string; branchCode?: string; name?: string; bankName?: string; location?: string }) => Promise<boolean>;
  isSubmitting?: boolean;
}

export function AddBankModal({ open, onClose, onCreate, isSubmitting }: AddBankModalProps) {
  const [bankQuery, setBankQuery] = useState('');
  const [bankSuggestions, setBankSuggestions] = useState<BankOption[]>([]);
  const [showBankSuggestions, setShowBankSuggestions] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankOption | null>(null);

  const [form, setForm] = useState({
    bankName: '',
    bankCode: '',
    location: '',
  });
  const [errors, setErrors] = useState<{ bankName?: string; bankCode?: string; location?: string }>({});

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: { bankName?: string; bankCode?: string; location?: string } = {};
    let hasError = false;

    const bankName = selectedBank ? selectedBank.name : form.bankName.trim();
    const bankCode = selectedBank ? selectedBank.bankCode : form.bankCode.trim();

    if (!bankName) {
      newErrors.bankName = 'Bank Name is required.';
      hasError = true;
    }
    if (!bankCode) {
      newErrors.bankCode = 'Bank Code is required.';
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleClose = () => {
    setBankQuery('');
    setBankSuggestions([]);
    setShowBankSuggestions(false);
    setSelectedBank(null);
    setForm({ bankName: '', bankCode: '', location: '' });
    setErrors({});
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    onClose();
  };

  const handleBankInputChange = (value: string) => {
    setBankQuery(value);
    setField('bankName', value);
    if (selectedBank) {
      setSelectedBank(null);
      setField('bankCode', '');
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (!value.trim()) {
        setBankSuggestions([]);
        setShowBankSuggestions(false);
        return;
      }

      try {
        const directory = await platformService.getBankDirectory();
        const filtered = directory
          .filter(
            (bank) =>
              bank.bankName.toLowerCase().includes(value.toLowerCase()) ||
              bank.bankCode.toLowerCase().includes(value.toLowerCase())
          )
          .map((bank) => ({
            id: bank.bankCode,
            name: bank.bankName,
            bankCode: bank.bankCode,
          }));
        setBankSuggestions(filtered);
        setShowBankSuggestions(filtered.length > 0);
      } catch {
        setBankSuggestions([]);
        setShowBankSuggestions(false);
      }
    }, 300);
  };

  const handleBankSelect = (bank: BankOption) => {
    setSelectedBank(bank);
    setBankQuery(bank.name);
    setForm({
      bankName: bank.name,
      bankCode: bank.bankCode,
      location: form.location,
    });
    setBankSuggestions([]);
    setShowBankSuggestions(false);
    setErrors({});
    inputRef.current?.blur();
  };

  const handleBankInputFocus = () => {
    if (bankSuggestions.length > 0 && !selectedBank) {
      setShowBankSuggestions(true);
    }
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowBankSuggestions(false);
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleSubmit = async () => {
    if (!validate()) return;
    setErrors({});

    const bankName = selectedBank ? selectedBank.name : form.bankName.trim();
    const bankCode = selectedBank ? selectedBank.bankCode : form.bankCode.trim();

    const success = await onCreate({
      name: bankName,
      bankName,
      bankCode,
      location: form.location.trim() || undefined,
    });

    if (success) handleClose();
  };

  const clearBankSelection = () => {
    setSelectedBank(null);
    setBankQuery('');
    setForm({ bankName: '', bankCode: '', location: '' });
    setErrors({});
    inputRef.current?.focus();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Partner Bank"
      description="Onboard a licensed financial institution to the Distributor Financing Platform."
      size="md"
      footer={
        <>
          <ModalButton variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </ModalButton>
          <ModalButton onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating Bank...
              </>
            ) : (
              <>
                <Landmark size={16} />
                Create Bank
              </>
            )}
          </ModalButton>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-blue-50 text-[#1F4DA8] flex items-center justify-center shrink-0">
            <Building2 size={26} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Partner Bank Institution</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter the bank entity details. The Bank Administrator will manage individual branches and staff.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <FormField label="Bank Name" required hint="Select from Central Bank directory or type custom name">
            <div className="relative">
              <div className="relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={bankQuery || form.bankName}
                  onChange={(e) => handleBankInputChange(e.target.value)}
                  onFocus={handleBankInputFocus}
                  placeholder="Search bank directory (e.g., KCB, Equity, Absa)..."
                  className="w-full pl-10 pr-10 py-3 text-sm rounded-lg border border-[#E2E8F0] text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40 focus:border-[#1F4DA8] transition-all"
                  autoComplete="off"
                />
                {(bankQuery || form.bankName) && (
                  <button
                    type="button"
                    onClick={clearBankSelection}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Clear bank selection"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {showBankSuggestions && bankSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-[#E2E8F0] bg-white shadow-lg"
                >
                  {bankSuggestions.map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => handleBankSelect(bank)}
                      className="w-full px-4 py-3 text-left text-sm text-[#1E293B] hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium">{bank.name}</span>
                      <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        Code: {bank.bankCode}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedBank && (
              <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Selected Directory Partner: {selectedBank.name} (Code: {selectedBank.bankCode})
              </p>
            )}
            {errors.bankName && <p className="text-xs text-rose-600 font-medium mt-1">{errors.bankName}</p>}
          </FormField>

          <FormField label="Bank / Institution Code" required hint="Central bank regulatory code (e.g. 01, 11, 03)">
            <TextInput
              value={form.bankCode}
              onChange={(e) => setField('bankCode', e.target.value.toUpperCase())}
              placeholder="e.g. 01"
              className="font-mono text-sm uppercase"
            />
            {errors.bankCode && <p className="text-xs text-rose-600 font-medium mt-1">{errors.bankCode}</p>}
          </FormField>

          <FormField label="Headquarters / Location" hint="Primary operational headquarters or city (optional)">
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={form.location}
                onChange={(e) => setField('location', e.target.value)}
                placeholder="e.g. Nairobi, Kenya"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-[#E2E8F0] text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40 focus:border-[#1F4DA8] transition-all"
              />
            </div>
          </FormField>
        </div>
      </div>
    </Modal>
  );
}