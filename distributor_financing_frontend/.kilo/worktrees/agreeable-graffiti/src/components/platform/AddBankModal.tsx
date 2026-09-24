'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Landmark, Loader2, Search, X } from 'lucide-react';
import { Modal, ModalButton } from '@/components/ui/Modal';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/FormField';
import { platformService } from '@/services/platform.service';

interface BankOption {
  id: string;
  name: string;
  bankCode: string;
}

interface BranchOption {
  branchCode: string;
  branchName: string;
}

interface AddBankModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { bankCode: string; branchCode: string; name?: string; branch?: string }) => Promise<boolean>;
  isSubmitting?: boolean;
}

export function AddBankModal({ open, onClose, onCreate, isSubmitting }: AddBankModalProps) {
  const [bankQuery, setBankQuery] = useState('');
  const [bankSuggestions, setBankSuggestions] = useState<BankOption[]>([]);
  const [showBankSuggestions, setShowBankSuggestions] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankOption | null>(null);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [branchError, setBranchError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ branch: '' });
  const [errors, setErrors] = useState<{ branch?: string }>({});

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: { branch?: string } = {};
    let hasError = false;

    if (!selectedBank) {
      hasError = true;
    }
    if (!form.branch.trim()) {
      newErrors.branch = 'Branch is required.';
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
    setBranches([]);
    setIsLoadingBranches(false);
    setBranchError(null);
    setForm({ branch: '' });
    setErrors({});
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    onClose();
  };

  const handleBankInputChange = (value: string) => {
    setBankQuery(value);
    if (selectedBank) {
      setSelectedBank(null);
      setBranches([]);
      setBranchError(null);
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
          .filter((bank) =>
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
    setBankSuggestions([]);
    setShowBankSuggestions(false);
    setForm({ branch: '' });
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

  useEffect(() => {
    if (!selectedBank) {
      setBranches([]);
      setBranchError(null);
      setForm({ branch: '' });
      return;
    }

    const bankCode = selectedBank.bankCode || selectedBank.id;
    setIsLoadingBranches(true);
    setBranchError(null);

    platformService
      .fetchBranches(bankCode)
      .then((data) => {
        const branchList = Array.isArray(data) ? data : [];
        setBranches(branchList);
        if (branchList.length > 0) {
          setForm({ branch: branchList[0].branchCode });
          setErrors((prev) => ({ ...prev, branch: undefined }));
        } else {
          setForm({ branch: '' });
        }
        setIsLoadingBranches(false);
      })
      .catch(() => {
        setBranchError('Failed to load branches from backend');
        setBranches([]);
        setForm({ branch: '' });
        setIsLoadingBranches(false);
      });
  }, [selectedBank]);

  const handleRetryBranches = () => {
    if (!selectedBank) return;
    const bankCode = selectedBank.bankCode || selectedBank.id;
    setIsLoadingBranches(true);
    setBranchError(null);
    platformService
      .fetchBranches(bankCode)
      .then((data) => {
        const branchList = Array.isArray(data) ? data : [];
        setBranches(branchList);
        if (branchList.length > 0) {
          setForm({ branch: branchList[0].branchCode });
          setErrors((prev) => ({ ...prev, branch: undefined }));
        } else {
          setForm({ branch: '' });
        }
        setIsLoadingBranches(false);
      })
      .catch(() => {
        setBranchError('Failed to load branches from backend');
        setBranches([]);
        setForm({ branch: '' });
        setIsLoadingBranches(false);
      });
  };

  const handleSubmit = async () => {
    if (!validate() || !selectedBank) return;
    setErrors({});

    const selectedBranch = branches.find((b) => b.branchCode === form.branch);
    const success = await onCreate({
      name: selectedBank.name,
      bankCode: selectedBank.bankCode || selectedBank.id,
      branch: selectedBranch?.branchName ?? form.branch,
      branchCode: form.branch,
    });

    if (success) handleClose();
  };

  const clearBankSelection = () => {

    setSelectedBank(null);
    setBankQuery('');
    setBranches([]);
    setBranchError(null);
    setForm({ branch: '' });
    setErrors({});
    inputRef.current?.focus();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add New Bank"
      description="Add a partner bank to the Distributor Financing Platform."
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
            <Landmark size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Bank Information</p>
            <p className="text-xs text-slate-500 mt-0.5">Enter the details of the partner bank.</p>
          </div>
        </div>

        <div className="space-y-4">
          <FormField label="Bank Name" required>
            <div className="relative">
              <div className="relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={bankQuery}
                  onChange={(e) => handleBankInputChange(e.target.value)}
                  onFocus={handleBankInputFocus}
                  placeholder="Search for a bank..."
                  className="w-full pl-10 pr-10 py-3 text-sm rounded-lg border border-[#E2E8F0] text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40 focus:border-[#1F4DA8] transition-all"
                  autoComplete="off"
                />
                {bankQuery && (
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
                      className="w-full px-4 py-3 text-left text-sm text-[#1E293B] hover:bg-slate-50 transition-colors"
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedBank && (
              <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Selected: {selectedBank.name}
              </p>
            )}
          </FormField>

          <FormField label="Branch" required>
            <Select
              value={form.branch}
              onChange={(e) => setField('branch', e.target.value)}
              disabled={!selectedBank || isLoadingBranches}
              className="w-full"
            >
              {!selectedBank && <option value="" disabled>Select a bank first</option>}
              {selectedBank && isLoadingBranches && <option value="" disabled>Loading branches...</option>}
              {selectedBank && branchError && <option value="" disabled>Failed to load branches from backend</option>}
              {selectedBank && !isLoadingBranches && branches.length === 0 && (
                <option value="" disabled>No branches found in database for this bank</option>
              )}
              {branches.map((b) => (
                <option key={b.branchCode} value={b.branchCode}>
                  {b.branchName} ({b.branchCode})
                </option>
              ))}
            </Select>

            {selectedBank && !isLoadingBranches && branches.length === 0 && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
                <p className="text-amber-800 font-medium">
                  The backend has not seeded branch records for this bank yet. You can use Head Office:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBranches([{ branchCode: '001', branchName: 'Head Office' }]);
                    setForm({ branch: '001' });
                    setErrors({});
                  }}
                  className="px-3 py-1.5 bg-[#1F4DA8] text-white font-bold rounded-lg hover:bg-[#183c85] transition-all text-xs"
                >
                  Use &quot;Head Office (001)&quot;
                </button>
              </div>
            )}

            {branchError && (
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-xs text-rose-600 font-medium">{branchError}</p>
                <button
                  type="button"
                  onClick={handleRetryBranches}
                  className="text-xs text-[#1F4DA8] hover:underline font-medium"
                  disabled={isLoadingBranches}
                >
                  Retry
                </button>
              </div>
            )}
            {errors.branch && <p className="text-xs text-rose-600 font-medium mt-1.5">{errors.branch}</p>}
          </FormField>

        </div>
      </div>
    </Modal>
  );
}