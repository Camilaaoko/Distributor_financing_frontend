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

export function normalizeBankCode(input?: string | null): string {
  if (!input) return 'EQTY';
  const val = input.trim().toUpperCase();
  if (val.includes('EQUITY') || val === 'EQTY' || val === '68' || val === '068' || val === 'BNK_02') return 'EQTY';
  if (val.includes('KCB') || val === '01' || val === '001' || val === 'BNK_01') return 'KCB';
  if (val.includes('COOP') || val.includes('CO-OP') || val.includes('COOPERATIVE') || val === '11' || val === '011' || val === 'BNK_03') return 'COOP';
  if (val.includes('ABSA') || val === '03' || val === '003' || val === 'BNK_04') return 'ABSA';
  if (val.includes('STANBIC') || val === 'STAN' || val === '31' || val === '031' || val === 'BNK_05') return 'STAN';
  if (val.includes('NCBA') || val === '07' || val === '007' || val === 'BNK_06') return 'NCBA';
  if (val.includes('CHARTERED') || val === 'SCBK' || val === '02' || val === '002' || val === 'BNK_07') return 'SCBK';
  if (val.includes('DIAMOND') || val.includes('DTB') || val === 'DTBK' || val === '12' || val === '012' || val === 'BNK_08') return 'DTBK';
  if (val.includes('I&M') || val.includes('IMBK') || val === '10' || val === '010' || val === 'BNK_09') return 'IMBK';
  return val;
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
    const key = normalizeBankCode(bankCode);

    const mockBranches: Record<string, Branch[]> = {
      EQTY: [
        { branchCode: '010', branchName: 'Equity Centre Upper Hill', location: 'Upper Hill, Nairobi', city: 'Nairobi', branch: 'Equity Centre Upper Hill' },
        { branchCode: '011', branchName: 'Community Supreme Branch', location: 'Community, Nairobi', city: 'Nairobi', branch: 'Community Supreme Branch' },
        { branchCode: '012', branchName: 'Westlands Supreme Branch', location: 'Westlands, Nairobi', city: 'Nairobi', branch: 'Westlands Supreme Branch' },
        { branchCode: '013', branchName: 'Mombasa Digo Road Branch', location: 'Digo Road, Mombasa', city: 'Mombasa', branch: 'Mombasa Digo Road Branch' },
        { branchCode: '014', branchName: 'Kisumu Ang\'awa Branch', location: 'Ang\'awa Street, Kisumu', city: 'Kisumu', branch: 'Kisumu Ang\'awa Branch' },
        { branchCode: '015', branchName: 'Nakuru Kenyatta Avenue Branch', location: 'Kenyatta Avenue, Nakuru', city: 'Nakuru', branch: 'Nakuru Kenyatta Avenue Branch' },
        { branchCode: '016', branchName: 'Eldoret Uganda Road Branch', location: 'Uganda Road, Eldoret', city: 'Eldoret', branch: 'Eldoret Uganda Road Branch' },
        { branchCode: '017', branchName: 'Thika Commercial Branch', location: 'Commercial Street, Thika', city: 'Thika', branch: 'Thika Commercial Branch' },
        { branchCode: '018', branchName: 'Karen Hub Supreme Branch', location: 'Karen, Nairobi', city: 'Nairobi', branch: 'Karen Hub Supreme Branch' },
        { branchCode: '019', branchName: 'Kilimani Yaya Centre Branch', location: 'Kilimani, Nairobi', city: 'Nairobi', branch: 'Kilimani Yaya Centre Branch' },
        { branchCode: '020', branchName: 'Industrial Area Branch', location: 'Enterprise Road, Nairobi', city: 'Nairobi', branch: 'Industrial Area Branch' },
      ],
      KCB: [
        { branchCode: '001', branchName: 'Moi Avenue Branch', location: 'Moi Avenue, Nairobi', city: 'Nairobi', branch: 'Moi Avenue Branch' },
        { branchCode: '002', branchName: 'Kipande House Branch', location: 'Kenyatta Avenue, Nairobi', city: 'Nairobi', branch: 'Kipande House Branch' },
        { branchCode: '003', branchName: 'Upper Hill Branch', location: 'Upper Hill, Nairobi', city: 'Nairobi', branch: 'Upper Hill Branch' },
        { branchCode: '004', branchName: 'Mombasa Treasury Square Branch', location: 'Treasury Square, Mombasa', city: 'Mombasa', branch: 'Mombasa Treasury Square Branch' },
        { branchCode: '005', branchName: 'Kisumu Main Branch', location: 'Oginga Odinga Street, Kisumu', city: 'Kisumu', branch: 'Kisumu Main Branch' },
        { branchCode: '006', branchName: 'Nakuru West Branch', location: 'Club Road, Nakuru', city: 'Nakuru', branch: 'Nakuru West Branch' },
        { branchCode: '007', branchName: 'Westlands Commercial Branch', location: 'Westlands, Nairobi', city: 'Nairobi', branch: 'Westlands Commercial Branch' },
      ],
      COOP: [
        { branchCode: '020', branchName: 'Co-op House Branch', location: 'Haile Selassie Ave, Nairobi', city: 'Nairobi', branch: 'Co-op House Branch' },
        { branchCode: '021', branchName: 'City Hall Branch', location: 'City Hall Way, Nairobi', city: 'Nairobi', branch: 'City Hall Branch' },
        { branchCode: '022', branchName: 'University Way Branch', location: 'University Way, Nairobi', city: 'Nairobi', branch: 'University Way Branch' },
        { branchCode: '023', branchName: 'Mombasa Nkrumah Road Branch', location: 'Nkrumah Road, Mombasa', city: 'Mombasa', branch: 'Mombasa Nkrumah Road Branch' },
        { branchCode: '024', branchName: 'Kisumu Mega Plaza Branch', location: 'Oginga Odinga St, Kisumu', city: 'Kisumu', branch: 'Kisumu Mega Plaza Branch' },
      ],
      ABSA: [
        { branchCode: '030', branchName: 'Queensway Branch', location: 'Mama Ngina St, Nairobi', city: 'Nairobi', branch: 'Queensway Branch' },
        { branchCode: '031', branchName: 'Absa Westlands Branch', location: 'Woodvale Grove, Nairobi', city: 'Nairobi', branch: 'Absa Westlands Branch' },
        { branchCode: '032', branchName: 'Harambee Avenue Branch', location: 'Harambee Ave, Nairobi', city: 'Nairobi', branch: 'Harambee Avenue Branch' },
        { branchCode: '033', branchName: 'Nkrumah Road Branch', location: 'Nkrumah Road, Mombasa', city: 'Mombasa', branch: 'Nkrumah Road Branch' },
      ],
      STAN: [
        { branchCode: '040', branchName: 'Stanbic Chiromo Branch', location: 'Chiromo Road, Nairobi', city: 'Nairobi', branch: 'Stanbic Chiromo Branch' },
        { branchCode: '041', branchName: 'Kenyatta Avenue Branch', location: 'Kenyatta Ave, Nairobi', city: 'Nairobi', branch: 'Kenyatta Avenue Branch' },
        { branchCode: '042', branchName: 'Digo Road Branch', location: 'Digo Road, Mombasa', city: 'Mombasa', branch: 'Digo Road Branch' },
      ],
      NCBA: [
        { branchCode: '050', branchName: 'NCBA Upper Hill Head Office', location: 'Mara Road, Nairobi', city: 'Nairobi', branch: 'NCBA Upper Hill Head Office' },
        { branchCode: '051', branchName: 'Mama Ngina Branch', location: 'Mama Ngina St, Nairobi', city: 'Nairobi', branch: 'Mama Ngina Branch' },
        { branchCode: '052', branchName: 'Westgate Mall Branch', location: 'Westlands, Nairobi', city: 'Nairobi', branch: 'Westgate Mall Branch' },
      ],
      SCBK: [
        { branchCode: '060', branchName: 'StanChart Chiromo Branch', location: '48 Westlands Rd, Nairobi', city: 'Nairobi', branch: 'StanChart Chiromo Branch' },
        { branchCode: '061', branchName: 'StanChart Kenyatta Avenue', location: 'Kenyatta Ave, Nairobi', city: 'Nairobi', branch: 'StanChart Kenyatta Avenue' },
        { branchCode: '062', branchName: 'StanChart Treasury Square', location: 'Treasury Square, Mombasa', city: 'Mombasa', branch: 'StanChart Treasury Square' },
      ],
      DTBK: [
        { branchCode: '070', branchName: 'DTB Center Mombasa Road', location: 'Mombasa Rd, Nairobi', city: 'Nairobi', branch: 'DTB Center Mombasa Road' },
        { branchCode: '071', branchName: 'DTB Westlands Branch', location: 'Mpaka Rd, Nairobi', city: 'Nairobi', branch: 'DTB Westlands Branch' },
        { branchCode: '072', branchName: 'DTB Nation Centre', location: 'Kimathi St, Nairobi', city: 'Nairobi', branch: 'DTB Nation Centre' },
      ],
      IMBK: [
        { branchCode: '080', branchName: 'I&M Tower Branch', location: 'Kenyatta Ave, Nairobi', city: 'Nairobi', branch: 'I&M Tower Branch' },
        { branchCode: '081', branchName: 'I&M Parklands Branch', location: 'Parklands Rd, Nairobi', city: 'Nairobi', branch: 'I&M Parklands Branch' },
        { branchCode: '082', branchName: 'I&M Nyali Branch', location: 'Links Rd, Mombasa', city: 'Mombasa', branch: 'I&M Nyali Branch' },
      ],
    };

    return mockBranches[key] || [
      { branchCode: '001', branchName: 'Main / Head Office Branch', location: 'Nairobi CBD', city: 'Nairobi' },
      { branchCode: '002', branchName: 'Commercial Branch', location: 'Commercial District', city: 'Nairobi' },
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
