'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Bank, BankAdmin, BankAdminStatus, PlatformRoleName } from '@/lib/types';
import { getErrorMessage } from '@/lib/errors';
import { useToast } from '@/components/ui/Toast';
import {
  platformService,
  type CreateBankAdminInput,
  type UpdateBankAdminInput,
} from '@/services/platform.service';

export type SortKey = 'name' | 'bank' | 'role' | 'status' | 'lastLogin' | 'createdDate';
export type SortDirection = 'asc' | 'desc';

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 350;

// Maps table sort keys to the backend DTO field names they sort by.
const SORT_FIELD: Record<SortKey, string> = {
  name: 'firstName',
  bank: 'bankName',
  role: 'role',
  status: 'status',
  lastLogin: 'lastLogin',
  createdDate: 'createdDate',
};

function dateFilterToCreatedAfter(dateFilter: 'all' | '7d' | '30d' | '90d'): string | undefined {
  if (dateFilter === 'all') return undefined;
  const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff.toISOString();
}

export function usePlatformAdmin() {
  const toast = useToast();

  const [admins, setAdmins] = useState<BankAdmin[]>([]);
  const [banksList, setBanksList] = useState<Bank[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [bankFilter, setBankFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<BankAdminStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<PlatformRoleName | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');

  const [sortKey, setSortKey] = useState<SortKey>('createdDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Debounce free-text search so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  // Any filter/search/sort change should reset back to page 1.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, bankFilter, statusFilter, roleFilter, dateFilter, sortKey, sortDirection]);

  const loadBanks = useCallback(async (): Promise<Bank[]> => {
    try {
      const res = await platformService.listBanks({ status: 'ACTIVE' });
      const mapped: Bank[] = res.items.map((b) => ({
        id: b.id,
        name: b.name,
        bankCode: b.bankCode,
        branch: b.branch,
        branchCode: b.branchCode,
        status: b.status as Bank['status'],
        createdAt: b.createdAt,
      }));
      setBanksList(mapped);
      return mapped;
    } catch {
      return [];
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeBanks = banksList.length > 0 ? banksList : await loadBanks();
      const result = await platformService.listBankAdmins({
        search: debouncedSearch || undefined,
        bankId: bankFilter === 'all' ? undefined : bankFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        role: roleFilter === 'all' ? undefined : roleFilter,
        createdAfter: dateFilterToCreatedAfter(dateFilter),
        page: page - 1,
        size: PAGE_SIZE,
        sort: `${SORT_FIELD[sortKey]},${sortDirection}`,
      });

      const itemsWithBankNames = result.items.map((a) => {
        const bank = activeBanks.find((b) => b.id === a.bankId || b.bankCode === a.bankId);
        return {
          ...a,
          bankName: bank ? `${bank.name}${bank.branch ? ` (${bank.branch})` : ''}` : a.bankName || a.bankId || '—',
        };
      });

      setAdmins(itemsWithBankNames);
      setTotalCount(result.totalCount);
      setTotalPages(Math.max(1, result.totalPages));
      setSelectedIds([]);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load bank administrators.'));
      setAdmins([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, bankFilter, statusFilter, roleFilter, dateFilter, page, sortKey, sortDirection, banksList, loadBanks]);

  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleSort = useCallback((key: SortKey) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prevKey;
      }
      setSortDirection('asc');
      return key;
    });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const toggleSelectAllOnPage = useCallback(() => {
    const pageIds = admins.map((a) => a.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected ? prev.filter((id) => !pageIds.includes(id)) : Array.from(new Set([...prev, ...pageIds]))
    );
  }, [admins, selectedIds]);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  /** Runs a mutation, toasting on success/failure. Returns whether it succeeded. */
  const runMutation = useCallback(async (action: () => Promise<void>, successMessage: string, errorFallback: string) => {
    setIsMutating(true);
    try {
      await action();
      toast.success(successMessage);
      await refresh();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, errorFallback));
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [refresh, toast]);

  const createAdmin = useCallback((input: CreateBankAdminInput) =>
    runMutation(
      async () => { await platformService.createBankAdmin(input); },
      'Bank administrator created successfully.',
      'Failed to create bank administrator.'
    ), [runMutation]);

  const updateAdmin = useCallback((id: string, input: UpdateBankAdminInput) =>
    runMutation(
      async () => { await platformService.updateBankAdmin(id, input); },
      'Bank administrator updated successfully.',
      'Failed to update bank administrator.'
    ), [runMutation]);

  const deleteAdmin = useCallback((id: string) =>
    runMutation(
      async () => { await platformService.deleteBankAdmin(id); },
      'Bank administrator deleted.',
      'Failed to delete bank administrator.'
    ), [runMutation]);

  const setStatus = useCallback((id: string, status: BankAdminStatus) =>
    runMutation(
      async () => { await platformService.setStatus(id, status); },
      `Status updated to ${status}.`,
      'Failed to update status.'
    ), [runMutation]);

  const approveAdmin = useCallback((id: string) =>
    runMutation(
      async () => { await platformService.approveBankAdmin(id); },
      'Bank administrator approved.',
      'Failed to approve bank administrator.'
    ), [runMutation]);

  const bulkDelete = useCallback(() =>
    runMutation(
      async () => { await platformService.bulkDelete(selectedIds); },
      `${selectedIds.length} bank administrator(s) deleted.`,
      'Failed to delete selected bank administrators.'
    ), [runMutation, selectedIds]);

  const bulkSetStatus = useCallback((status: BankAdminStatus) =>
    runMutation(
      async () => { await platformService.bulkSetStatus(selectedIds, status); },
      `${selectedIds.length} bank administrator(s) updated.`,
      'Failed to update selected bank administrators.'
    ), [runMutation, selectedIds]);

  const resetPassword = useCallback(
    async (id: string, options: { forceChange: boolean; sendEmail: boolean }) => {
      setIsMutating(true);
      try {
        const result = await platformService.resetPassword(id, options);
        toast.success('Password reset successfully.');
        return result;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to reset password.'));
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [toast]
  );

  const exportRows = useCallback(
    (format: 'csv' | 'excel') => {
      const rows = selectedIds.length
        ? admins.filter((a) => selectedIds.includes(a.id))
        : admins;
      const header = ['Full Name', 'Email', 'Phone', 'Bank', 'Role', 'Status', 'Last Login', 'Created Date'];
      const lines = rows.map((a) =>
        [`${a.firstName} ${a.lastName}`, a.email, a.phone, a.bankName, a.role, a.status, a.lastLogin, a.createdDate]
          .map((v) => `"${v}"`)
          .join(',')
      );
      const csv = [header.join(','), ...lines].join('\n');
      const blob = new Blob([csv], { type: format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bank-admins.${format === 'csv' ? 'csv' : 'xls'}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [admins, selectedIds]
  );

  return {
    admins,
    totalCount,
    banks: banksList,
    isLoading,
    isMutating,
    search, setSearch,
    bankFilter, setBankFilter,
    statusFilter, setStatusFilter,
    roleFilter, setRoleFilter,
    dateFilter, setDateFilter,
    sortKey, sortDirection, toggleSort,
    page, setPage, totalPages, pageSize: PAGE_SIZE,
    selectedIds, toggleSelect, toggleSelectAllOnPage, clearSelection,
    createAdmin, updateAdmin, deleteAdmin, setStatus, approveAdmin, bulkDelete, bulkSetStatus, resetPassword,
    exportRows,
    refresh,
  };
}

export type UsePlatformAdminReturn = ReturnType<typeof usePlatformAdmin>;
