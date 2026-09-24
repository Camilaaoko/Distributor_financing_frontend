'use client';

import { useCallback, useEffect, useState } from 'react';
import type { BankUser, BankUserRole, BankUserStatus } from '@/lib/types';
import type { BankBranchResponse, OnboardBankBranchRequest } from '@/types/onboarding';
import { getErrorMessage } from '@/lib/errors';
import { useToast } from '@/components/ui/Toast';
import { bankService, type CreateBankUserInput, type UpdateBankUserInput } from '@/services/bank.service';

export type SortKey = 'name' | 'role' | 'status' | 'lastLogin' | 'createdDate';
export type SortDirection = 'asc' | 'desc';

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 350;

const SORT_FIELD: Record<SortKey, string> = {
  name: 'firstName',
  role: 'role',
  status: 'status',
  lastLogin: 'lastLogin',
  createdDate: 'createdDate',
};

export function useBankUsers() {
  const toast = useToast();

  const [users, setUsers] = useState<BankUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const [branches, setBranches] = useState<BankBranchResponse[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<BankUserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<BankUserStatus | 'all'>('all');
  const [branchFilter, setBranchFilter] = useState<string | 'all'>('all');

  const [sortKey, setSortKey] = useState<SortKey>('createdDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Store back-reference for mutations so we can add/remove from local state
  const usersRef = { current: users };
  usersRef.current = users;

  const fetchBranches = useCallback(async () => {
    setIsLoadingBranches(true);
    try {
      const data = await bankService.getBankBranches();
      setBranches(data || []);
    } catch {
      setBranches([]);
    } finally {
      setIsLoadingBranches(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, statusFilter, branchFilter, sortKey, sortDirection]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await bankService.getBankUsers({
        search: debouncedSearch || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        branch: branchFilter === 'all' ? undefined : branchFilter,
        page: page - 1,
        size: PAGE_SIZE,
        sort: `${SORT_FIELD[sortKey]},${sortDirection}`,
      });
      setUsers(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(Math.max(1, result.totalPages));
      setSelectedIds([]);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load bank users.'));
      setUsers([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, roleFilter, statusFilter, branchFilter, page, sortKey, sortDirection]);

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
    const pageIds = users.map((u) => u.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected ? prev.filter((id) => !pageIds.includes(id)) : Array.from(new Set([...prev, ...pageIds])),
    );
  }, [users, selectedIds]);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const runMutation = useCallback(
    async (action: () => Promise<void>, successMessage: string, errorFallback: string) => {
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
    },
    [refresh, toast],
  );

  const createUser = useCallback(
    (input: CreateBankUserInput) =>
      runMutation(
        async () => {
          await bankService.createUser(input);
        },
        'Bank user created successfully.',
        'Failed to create bank user.',
      ),
    [runMutation],
  );

  const updateUser = useCallback(
    (id: string, _input: UpdateBankUserInput) =>
      runMutation(
        async () => {
          // Update is mock for now — just simulate success
          await new Promise((r) => setTimeout(r, 400));
        },
        'Bank user updated successfully.',
        'Failed to update bank user.',
      ),
    [runMutation],
  );

  const deleteUser = useCallback(
    (id: string) =>
      runMutation(
        async () => {
          await new Promise((r) => setTimeout(r, 400));
        },
        'Bank user deleted.',
        'Failed to delete bank user.',
      ),
    [runMutation],
  );

  const setUserStatus = useCallback(
    (id: string, status: BankUserStatus) =>
      runMutation(
        async () => {
          await new Promise((r) => setTimeout(r, 400));
        },
        `Status updated to ${status}.`,
        'Failed to update status.',
      ),
    [runMutation],
  );

  const bulkDelete = useCallback(
    () =>
      runMutation(
        async () => {
          await new Promise((r) => setTimeout(r, 400));
        },
        `${selectedIds.length} bank user(s) deleted.`,
        'Failed to delete selected bank users.',
      ),
    [runMutation, selectedIds],
  );

  const bulkSetStatus = useCallback(
    (status: BankUserStatus) =>
      runMutation(
        async () => {
          await new Promise((r) => setTimeout(r, 400));
        },
        `${selectedIds.length} bank user(s) updated.`,
        'Failed to update selected bank users.',
      ),
    [runMutation, selectedIds],
  );

  const createBranch = useCallback(
    (payload: OnboardBankBranchRequest) =>
      runMutation(
        async () => {
          await bankService.onboardBankBranch(payload);
          await fetchBranches();
        },
        `Branch "${payload.branchName || payload.branchCode}" created successfully.`,
        'Failed to create bank branch.',
      ),
    [runMutation, fetchBranches],
  );

  return {
    users,
    totalCount,
    isLoading,
    isMutating,
    branches,
    isLoadingBranches,
    fetchBranches,
    createBranch,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    branchFilter,
    setBranchFilter,
    sortKey,
    sortDirection,
    toggleSort,
    page,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,
    selectedIds,
    toggleSelect,
    toggleSelectAllOnPage,
    clearSelection,
    createUser,
    updateUser,
    deleteUser,
    setUserStatus,
    bulkDelete,
    bulkSetStatus,
    refresh,
  };
}

export type UseBankUsersReturn = ReturnType<typeof useBankUsers>;