'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Bank, BankAdmin } from '@/lib/types';
import { getErrorMessage } from '@/lib/errors';
import { useToast } from '@/components/ui/Toast';
import { platformService, type CreateBankAdminInput } from '@/services/platform.service';

export function useBanks() {
  const toast = useToast();

  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [result, adminResult, dirResult] = await Promise.all([
        platformService.listBanks().catch(() => ({ items: [] as any[], totalCount: 0, totalPages: 1 })),
        platformService.listBankAdmins().catch(() => ({ items: [] as BankAdmin[], totalCount: 0, totalPages: 1 })),
        platformService.getBankDirectory().catch(() => [] as any[]),
      ]);

      const admins = adminResult?.items || [];
      const bankItems = result?.items || [];
      const dirLookup = new Map<string, any>();
      (dirResult || []).forEach((d) => {
        if (d.bankCode) dirLookup.set(d.bankCode, d);
        if (d.id) dirLookup.set(d.id, d);
      });

      const mappedBanks: Bank[] = bankItems.map((item) => {
        const code = item.bankCode || item.id || '';
        const dirInfo = dirLookup.get(code) || dirLookup.get(item.id) || {};

        const matchingAdmins = admins.filter((a) => {
          if (a.bankId && (a.bankId === item.id || a.bankId === item.bankCode)) return true;
          if (a.bankName && (item.name || dirInfo.bankName)) {
            const bName = (item.name || dirInfo.bankName || '').toLowerCase().trim();
            const cleanAdminBank = a.bankName.toLowerCase().trim();
            return cleanAdminBank.includes(bName) || bName.includes(cleanAdminBank);
          }
          return false;
        });

        const bankName = item.name || dirInfo.bankName || dirInfo.name || `Partner Bank (${code})`;
        const branchName = item.branch || dirInfo.branch || 'Head Office';

        return {
          id: item.id || code,
          name: bankName,
          bankCode: item.bankCode || code,
          branch: branchName,
          branchCode: item.branchCode || '001',
          shortCode: item.bankCode || code,
          adminCount: matchingAdmins.length,
          status: (item.status as Bank['status']) || 'Active',
          createdAt: item.createdAt,
        };
      });

      setBanks(mappedBanks);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to load banks.');
      setError(message);
      setBanks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        await refresh();
      } finally {
        if (!cancelled) {
          // mounted
        }
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const createBank = useCallback(
    async (input: { bankCode: string; branchCode: string; name?: string; branch?: string }): Promise<boolean> => {
      setIsMutating(true);
      try {
        await platformService.createBank({
          bankCode: input.bankCode,
          branchCode: input.branchCode,
        });
        toast.success('Bank added successfully.');
        await refresh();
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to create bank.'));
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [refresh, toast]
  );

  const createBankAdmin = useCallback(
    async (input: CreateBankAdminInput): Promise<boolean> => {
      setIsMutating(true);
      try {
        await platformService.createBankAdmin(input);
        toast.success(`Bank administrator account created for ${input.firstName} ${input.lastName}.`);
        await refresh();
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to create bank administrator.'));
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [refresh, toast]
  );

  const updateBank = useCallback(
    async (id: string, input: { name: string; branch: string; location: string }): Promise<boolean> => {
      setIsMutating(true);
      try {
        await platformService.updateBank(id, input);
        toast.success('Bank updated successfully.');
        await refresh();
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to update bank.'));
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [refresh, toast]
  );

  const deleteBank = useCallback(
    async (id: string): Promise<boolean> => {
      setIsMutating(true);
      try {
        await platformService.deleteBank(id);
        toast.success('Bank deleted.');
        await refresh();
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to delete bank.'));
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [refresh, toast]
  );

  const setBankStatus = useCallback(
    async (id: string, status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED'): Promise<boolean> => {
      setIsMutating(true);
      try {
        await platformService.setBankStatus(id, status);
        toast.success(`Bank status updated to ${status}.`);
        await refresh();
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to update bank status.'));
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [refresh, toast]
  );

  return {
    banks,
    isLoading,
    isMutating,
    error,
    refresh,
    createBank,
    createBankAdmin,
    updateBank,
    deleteBank,
    setBankStatus,
  };
}

export type UseBanksReturn = ReturnType<typeof useBanks>;