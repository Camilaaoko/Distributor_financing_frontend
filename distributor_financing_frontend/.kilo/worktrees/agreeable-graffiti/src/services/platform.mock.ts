import type { BankAdmin, BankAdminStatus, BankSummaryDto, Branch, MessageAndResultResponseUserResponse, UserResponse } from '@/lib/types';
import { bankAdmins as seedAdmins } from '@/lib/mock/platform-admin';
import type {
  CreateBankAdminInput,
  ListBankAdminsParams,
  ListBankAdminsResult,
  UpdateBankAdminInput,
} from './platform.service';

// Local Bank type for mock (matches backend API shape)
type Bank = {
  id: string;
  name: string;
  bankCode?: string;
  branch: string;
  branchCode?: string;
  location?: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  createdAt: string;
};

type CreateBankPayload = {
  bankCode?: string;
  branchCode?: string;
  name?: string;
  branch?: string;
  location?: string;
};

type UpdateBankPayload = {
  name: string;
  branch: string;
  location: string;
};

// In-memory store used while NEXT_PUBLIC_USE_MOCKS=true. Mirrors the shape
// the real /platform/bank-admins API is expected to return once it ships.
let store: BankAdmin[] = [...seedAdmins];

// In-memory store for banks (matches backend API shape)
let bankStore: Bank[] = [
  { id: 'bnk_01', name: 'KCB Bank', branch: 'Head Office', location: 'Nairobi', status: 'ACTIVE', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'bnk_02', name: 'Equity Bank', branch: 'Head Office', location: 'Nairobi', status: 'ACTIVE', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'bnk_03', name: 'Co-op Bank', branch: 'Head Office', location: 'Nairobi', status: 'PENDING', createdAt: '2026-06-01T00:00:00Z' },
];

const AVATAR_COLORS = [
  'bg-indigo-600', 'bg-emerald-600', 'bg-sky-600', 'bg-amber-500',
  'bg-rose-600', 'bg-violet-600', 'bg-teal-600', 'bg-fuchsia-600',
];

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
const uid = () => `usr_${Math.random().toString(36).slice(2, 9)}`;

const today = () =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());

function applyFilters(list: BankAdmin[], params: ListBankAdminsParams): BankAdmin[] {
  const q = params.search?.trim().toLowerCase();
  const createdAfter = params.createdAfter ? new Date(params.createdAfter) : null;
  const createdBefore = params.createdBefore ? new Date(params.createdBefore) : null;

  return list.filter((a) => {
    const matchesSearch =
      !q ||
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.phone.toLowerCase().includes(q) ||
      a.employeeNumber.toLowerCase().includes(q);

    const matchesBank = !params.bankId || a.bankId === params.bankId;
    const matchesStatus = !params.status || a.status === params.status;
    const matchesRole = !params.role || a.role === params.role;

    const created = new Date(a.createdDate);
    const matchesAfter = !createdAfter || created >= createdAfter;
    const matchesBefore = !createdBefore || created <= createdBefore;

    return matchesSearch && matchesBank && matchesStatus && matchesRole && matchesAfter && matchesBefore;
  });
}

function applySort(list: BankAdmin[], sort: string | undefined): BankAdmin[] {
  const [field, direction] = (sort ?? 'createdDate,desc').split(',');
  const dir = direction === 'asc' ? 1 : -1;
  const copy = [...list];
  copy.sort((a, b) => {
    switch (field) {
      case 'firstName':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`) * dir;
      case 'bankName':
        return a.bankName.localeCompare(b.bankName) * dir;
      case 'role':
        return a.role.localeCompare(b.role) * dir;
      case 'status':
        return a.status.localeCompare(b.status) * dir;
      case 'lastLogin':
        return a.lastLogin.localeCompare(b.lastLogin) * dir;
      case 'createdDate':
      default:
        return (new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()) * dir;
    }
  });
  return copy;
}

export const platformMock = {
  async listBankAdmins(params: ListBankAdminsParams = {}): Promise<ListBankAdminsResult> {
    await delay();
    const filtered = applyFilters(store, params);
    const sorted = applySort(filtered, params.sort);
    const page = params.page ?? 0;
    const size = params.size ?? (sorted.length || 1);
    const start = page * size;
    const items = sorted.slice(start, start + size);
    return {
      items,
      totalCount: sorted.length,
      totalPages: Math.max(1, Math.ceil(sorted.length / size)),
    };
  },

  async getBankAdmin(id: string): Promise<BankAdmin> {
    await delay(200);
    const found = store.find((a) => a.id === id);
    if (!found) throw new Error('Bank admin not found');
    return found;
  },

  async createBankAdmin(input: CreateBankAdminInput): Promise<BankAdmin> {
    await delay(600);
    const bank = bankStore.find((b) => b.id === input.bankId);
    const created: BankAdmin = {
      ...input,
      id: uid(),
      bankName: bank?.name ?? 'Unknown Bank',
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      lastLogin: '—',
      createdDate: today(),
    };
    store = [created, ...store];
    return created;
  },

  async updateBankAdmin(id: string, input: UpdateBankAdminInput): Promise<BankAdmin> {
    await delay(500);
    let updated: BankAdmin | undefined;
    store = store.map((a) => {
      if (a.id !== id) return a;
      const bank = input.bankId ? bankStore.find((b) => b.id === input.bankId) : undefined;
      updated = { ...a, ...input, bankName: bank?.name ?? a.bankName };
      return updated;
    });
    if (!updated) throw new Error('Bank admin not found');
    return updated;
  },

  async setStatus(id: string, status: BankAdminStatus): Promise<BankAdmin> {
    return platformMock.updateBankAdmin(id, { status });
  },

  async approveBankAdmin(id: string): Promise<BankAdmin> {
    return platformMock.updateBankAdmin(id, { status: 'Active' });
  },

  async deleteBankAdmin(id: string): Promise<void> {
    await delay(450);
    store = store.filter((a) => a.id !== id);
  },

  async bulkDelete(ids: string[]): Promise<void> {
    await delay(500);
    store = store.filter((a) => !ids.includes(a.id));
  },

  async bulkSetStatus(ids: string[], status: BankAdminStatus): Promise<void> {
    await delay(500);
    store = store.map((a) => (ids.includes(a.id) ? { ...a, status } : a));
  },

  async resetPassword(
    _id: string,
    _options: { forceChange: boolean; sendEmail: boolean }
  ): Promise<{ temporaryPassword: string }> {
    await delay(600);
    return { temporaryPassword: `Tmp-${Math.random().toString(36).slice(2, 8)}!` };
  },

  // ─── Banks ───
  async getBankDirectory(): Promise<BankSummaryDto[]> {
    await delay(200);
    return [
      { bankCode: 'KCB', bankName: 'KCB Bank Kenya' },
      { bankCode: 'EQTY', bankName: 'Equity Bank' },
      { bankCode: 'COOP', bankName: 'Co-operative Bank of Kenya' },
      { bankCode: 'ABSA', bankName: 'Absa Bank Kenya' },
      { bankCode: 'SCBK', bankName: 'Standard Chartered Kenya' },
      { bankCode: 'NCBA', bankName: 'NCBA Bank' },
      { bankCode: 'DTBK', bankName: 'Diamond Trust Bank' },
      { bankCode: 'STAN', bankName: 'Stanbic Bank Kenya' },
      { bankCode: 'IMBK', bankName: 'I&M Bank' },
    ];
  },

  async fetchBranches(bankCode: string): Promise<Branch[]> {
    await delay(200);
    const mockBranches: Record<string, Branch[]> = {
      KCB: [
        { branchCode: '001', branchName: 'Moi Avenue Branch' },
        { branchCode: '002', branchName: 'Kipande House Branch' },
        { branchCode: '003', branchName: 'Upper Hill Branch' },
      ],
      EQTY: [
        { branchCode: '010', branchName: 'Equity Centre Upper Hill' },
        { branchCode: '011', branchName: 'Community Branch' },
        { branchCode: '012', branchName: 'Westlands Supreme Branch' },
      ],
      COOP: [
        { branchCode: '020', branchName: 'Co-op House Branch' },
        { branchCode: '021', branchName: 'City Hall Branch' },
      ],
    };
    return mockBranches[bankCode] || [
      { branchCode: '001', branchName: 'Main / Head Office Branch' },
      { branchCode: '002', branchName: 'Commercial Branch' },
    ];
  },

  async listBanks(params: { status?: string; page?: number; size?: number } = {}): Promise<{
    items: Bank[];
    totalCount: number;
    totalPages: number;
  }> {
    await delay();
    let list = [...bankStore];
    if (params.status) list = list.filter(b => b.status === params.status);
    const page = params.page ?? 0;
    const size = params.size ?? (list.length || 1);
    const start = page * size;
    return {
      items: list.slice(start, start + size),
      totalCount: list.length,
      totalPages: Math.max(1, Math.ceil(list.length / size)),
    };
  },

  async createBank(input: CreateBankPayload): Promise<Bank> {
    await delay(500);
    const directory = await this.getBankDirectory();
    const found = input.bankCode ? directory.find(d => d.bankCode === input.bankCode) : null;
    const newBank: Bank = {
      id: `bnk_${Math.random().toString(36).slice(2, 9)}`,
      name: input.name || found?.bankName || input.bankCode || 'Partner Bank',
      bankCode: input.bankCode || 'BNK',
      branch: input.branch || 'Head Office',
      branchCode: input.branchCode || '001',
      location: input.location || 'Nairobi',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    bankStore = [newBank, ...bankStore];
    return newBank;
  },

  async updateBank(id: string, input: UpdateBankPayload): Promise<Bank> {
    await delay(500);
    const idx = bankStore.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Bank not found');
    bankStore[idx] = { ...bankStore[idx], ...input };
    return bankStore[idx];
  },

  async deleteBank(id: string): Promise<void> {
    await delay(450);
    bankStore = bankStore.filter(b => b.id !== id);
  },

  async setBankStatus(id: string, status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED'): Promise<void> {
    await delay(500);
    const idx = bankStore.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Bank not found');
    bankStore[idx].status = status;
  },

  async createBankUser(input: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nationalIdNumber: string;
    employeeId: string;
    role: string;
  }): Promise<MessageAndResultResponseUserResponse> {
    await delay(500);
    const user: UserResponse = {
      id: `usr_${Math.random().toString(36).slice(2, 9)}`,
      parentEntityId: 'bnk_01',
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phoneNumber: input.phoneNumber,
      role: input.role,
      kycStatus: 'VERIFIED',
      status: 'ACTIVE',
      credentialsIssued: true,
      createdAt: new Date().toISOString(),
    };
    return {
      message: 'Bank user created successfully',
      success: true,
      data: user,
    };
  },
};
