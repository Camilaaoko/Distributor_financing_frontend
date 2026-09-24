import { apiClient } from '@/lib/axios';
import { USE_MOCKS } from '@/lib/config';
import { platformMock } from './platform.mock';
import type {
  Bank,
  BankAdmin,
  BankAdminApiRole,
  BankAdminApiStatus,
  BankAdminDto,
  BankAdminStatus,
  BankResponse,
  BankSummaryDto,
  Branch,
  CreateUserResponse,
  PlatformRoleName,
  MessageAndResultResponseUserResponse,
  OnboardBankAdminRequest,
  OnboardBankRequest,
  UpdateBankRequest,
  UserResponse,
} from '@/lib/types';

// Platform Admin functionality uses API Gateway (port 8080):
// - POST /banks
// - GET /banks
// - PUT /banks/{id}
// - DELETE /banks/{id}
// - PATCH /banks/{id}/status
// - POST /banks/admin
// - POST /banks/users

const AVATAR_COLORS = [
  'bg-indigo-600', 'bg-emerald-600', 'bg-sky-600', 'bg-amber-500',
  'bg-rose-600', 'bg-violet-600', 'bg-teal-600', 'bg-fuchsia-600',
];

/** Deterministic pick so a user's avatar color stays stable across refreshes. */
function avatarColorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(value));
}


// The backend recognizes only these 4 statuses / 3 roles for bank admins.
// 'Inactive' and legacy 'Suspended' selections both collapse to DISABLED —
// the API has no separate "suspended" state.
const STATUS_TO_API: Record<BankAdminStatus, BankAdminApiStatus> = {
  Active: 'ACTIVE',
  Pending: 'PENDING',
  Locked: 'LOCKED',
  Inactive: 'DISABLED',
  Suspended: 'DISABLED',
};

const STATUS_FROM_API: Record<BankAdminApiStatus, BankAdminStatus> = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  LOCKED: 'Locked',
  DISABLED: 'Inactive',
};

const ROLE_TO_API: Record<string, BankAdminApiRole> = {
  'Bank Admin': 'BANK_ADMIN',
  'Support Admin': 'SUPPORT_ADMIN',
  'Read Only Admin': 'READ_ONLY_ADMIN',
};

const ROLE_FROM_API: Record<BankAdminApiRole, PlatformRoleName> = {
  BANK_ADMIN: 'Bank Admin',
  SUPPORT_ADMIN: 'Support Admin',
  READ_ONLY_ADMIN: 'Read Only Admin',
};

export function mapStatusToApi(status: BankAdminStatus): BankAdminApiStatus {
  return STATUS_TO_API[status];
}

export function mapStatusFromApi(status: BankAdminApiStatus): BankAdminStatus {
  return STATUS_FROM_API[status] ?? 'Inactive';
}

export function mapRoleToApi(role: PlatformRoleName): BankAdminApiRole {
  return ROLE_TO_API[role] ?? 'BANK_ADMIN';
}

export function mapRoleFromApi(role: BankAdminApiRole): PlatformRoleName {
  return ROLE_FROM_API[role] ?? 'Bank Admin';
}

function mapDtoToBankAdmin(dto: BankAdminDto): BankAdmin {
  return {
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    phone: dto.phone ?? '',
    nationalId: dto.nationalId ?? '',
    employeeNumber: dto.employeeNumber,
    bankId: dto.bankId,
    bankName: dto.bankName,
    department: dto.department ?? '',
    role: mapRoleFromApi(dto.role),
    username: dto.username ?? '',
    status: mapStatusFromApi(dto.status),
    avatarColor: avatarColorFor(dto.id),
    lastLogin: formatDateTime(dto.lastLogin),
    createdDate: formatDate(dto.createdDate),
  };
}

export type CreateBankAdminInput = Omit<
  BankAdmin,
  'id' | 'avatarColor' | 'lastLogin' | 'createdDate' | 'bankName'
>;

export type UpdateBankAdminInput = Partial<
  Omit<BankAdmin, 'id' | 'createdDate'>
>;


export interface ListBankAdminsParams {
  search?: string;
  bankId?: string;
  status?: BankAdminStatus;
  role?: PlatformRoleName;
  createdAfter?: string;
  createdBefore?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ListBankAdminsResult {
  items: BankAdmin[];
  totalCount: number;
  totalPages: number;
}

function buildCreatePayload(input: CreateBankAdminInput) {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    nationalId: input.nationalId,
    employeeNumber: input.employeeNumber,
    bankId: input.bankId,
    department: input.department,
    role: mapRoleToApi(input.role),
    username: input.username,
    status: mapStatusToApi(input.status),
  };
}

function buildUpdatePayload(input: UpdateBankAdminInput) {
  const payload: Record<string, unknown> = { ...input };
  if (input.role) payload.role = mapRoleToApi(input.role);
  if (input.status) payload.status = mapStatusToApi(input.status);
  return payload;
}

export const platformService = {
  // ─── Banks (Onboarding Service - port 8082) ───

  async listBanks(params?: { status?: string; page?: number; size?: number }): Promise<{
    items: BankResponse[];
    totalCount: number;
    totalPages: number;
  }> {
    if (USE_MOCKS) return platformMock.listBanks(params);
    const queryParams: Record<string, any> = {};
    if (params?.status && params.status !== 'ALL') {
      queryParams.status = params.status;
    }
    const { data } = await apiClient.get<BankResponse[]>('/api/onboarding/banks', { params: queryParams });
    if (Array.isArray(data)) {
      return { items: data, totalCount: data.length, totalPages: 1 };
    }
    return data || { items: [], totalCount: 0, totalPages: 1 };
  },


  async getBankDirectory(): Promise<BankSummaryDto[]> {
    if (USE_MOCKS) return platformMock.getBankDirectory();
    const { data } = await apiClient.get<BankSummaryDto[]>('/api/onboarding/banks/directory');
    return data;
  },

  async fetchBranches(bankCode: string): Promise<Branch[]> {
    if (USE_MOCKS) return platformMock.fetchBranches(bankCode);
    const { data } = await apiClient.get<Branch[]>(`/api/onboarding/banks/${encodeURIComponent(bankCode)}/available-branches`);
    return data;
  },

  async createBank(input: { bankCode: string; branchCode: string }): Promise<BankResponse> {
    if (USE_MOCKS) return platformMock.createBank(input);
    const payload: OnboardBankRequest = {
      bankCode: input.bankCode,
      branchCode: input.branchCode,
    };
    const { data } = await apiClient.post<BankResponse>('/api/onboarding/banks', payload);
    return data;
  },

  async updateBank(id: string, input: UpdateBankRequest): Promise<BankResponse> {
    if (USE_MOCKS) return platformMock.updateBank(id, { name: input.name ?? '', branch: input.branch ?? '', location: input.location ?? '' }) as unknown as BankResponse;
    const { data } = await apiClient.put<BankResponse>(`/api/onboarding/banks/${id}`, input);
    return data;
  },

  async deleteBank(id: string): Promise<void> {
    if (USE_MOCKS) return platformMock.deleteBank(id);
    await apiClient.delete(`/api/onboarding/banks/${id}`);
  },

  async setBankStatus(id: string, status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED'): Promise<BankResponse | void> {
    if (USE_MOCKS) return platformMock.setBankStatus(id, status);
    const { data } = await apiClient.patch<BankResponse>(`/api/onboarding/banks/${id}/status`, null, { params: { status } });
    return data;
  },

  // ─── Bank Admins (Onboarding Service - port 8082) ───

  async createBankAdmin(input: CreateBankAdminInput): Promise<BankAdmin> {
    if (USE_MOCKS) return platformMock.createBankAdmin(input);

    const payload: OnboardBankAdminRequest = {
      bankId: input.bankId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phoneNumber: input.phone,
      nationalIdNumber: input.nationalId,
      employeeId: input.employeeNumber,
    };

    const { data } = await apiClient.post<MessageAndResultResponseUserResponse>('/api/onboarding/banks/admin', payload);

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to create bank admin');
    }

    const dto = data.data;
    return {
      id: dto.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phoneNumber || input.phone,
      nationalId: input.nationalId,
      employeeNumber: input.employeeNumber,
      bankId: dto.parentEntityId || input.bankId,
      bankName: '',
      department: input.department || '',
      role: 'Bank Admin',
      username: input.username || '',
      status: dto.status === 'ACTIVE' ? 'Active' : dto.status === 'PENDING' ? 'Pending' : 'Inactive',
      avatarColor: avatarColorFor(dto.id),
      lastLogin: '—',
      createdDate: formatDate(dto.createdAt),
    };
  },

  // ─── Bank Admin CRUD (Onboarding Service - port 8082) ───

  async listBankAdmins(params: ListBankAdminsParams = {}): Promise<ListBankAdminsResult> {
    if (USE_MOCKS) return platformMock.listBankAdmins(params);

    let data: any[] = [];
    try {
      const res = await apiClient.get<any[]>('/api/onboarding/banks/admins');
      data = Array.isArray(res.data) ? res.data : [];
    } catch {
      const res = await apiClient.get<any[]>('/api/onboarding/banks/users');
      data = Array.isArray(res.data) ? res.data : [];
    }

    // Map BankAdminSummaryResponse / UserResponse to BankAdmin
    const items: BankAdmin[] = data.map((dto) => ({
      id: dto.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phoneNumber || '',
      nationalId: dto.nationalIdNumber || '',
      employeeNumber: dto.employeeId || dto.accountNumber || '',
      bankId: dto.bankId || dto.parentEntityId || '',
      bankName: dto.bankName ? `${dto.bankName}${dto.branch ? ` (${dto.branch})` : ''}` : (dto.branch || ''),
      department: dto.branch || dto.department || '',
      role: 'Bank Admin',
      username: dto.email,
      status: (dto.userStatus === 'ACTIVE' || dto.status === 'ACTIVE')
        ? 'Active'
        : (dto.userStatus === 'PENDING' || dto.status === 'PENDING')
        ? 'Pending'
        : (dto.userStatus === 'SUSPENDED' || dto.status === 'SUSPENDED')
        ? 'Suspended'
        : (dto.userStatus === 'LOCKED' || dto.status === 'LOCKED')
        ? 'Locked'
        : 'Inactive',
      avatarColor: avatarColorFor(dto.id),
      lastLogin: '—',
      createdDate: dto.createdAt ? formatDateTime(dto.createdAt) : '—',
    }));



    // Apply client-side filtering/pagination since backend returns flat array
    const filtered = items.filter((a) => {
      const q = params.search?.trim().toLowerCase();
      const matchesSearch =
        !q ||
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        a.employeeNumber.toLowerCase().includes(q);
      const matchesBank = !params.bankId || a.bankId === params.bankId;
      const matchesStatus = !params.status || a.status === params.status;
      const matchesRole = !params.role || a.role === params.role;
      return matchesSearch && matchesBank && matchesStatus && matchesRole;
    });

    const sorted = filtered.sort((a, b) => {
      const [field, direction] = (params.sort ?? 'createdDate,desc').split(',');
      const dir = direction === 'asc' ? 1 : -1;
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

    const page = params.page ?? 0;
    const size = params.size ?? (sorted.length || 1);
    const start = page * size;

    return {
      items: sorted.slice(start, start + size),
      totalCount: sorted.length,
      totalPages: Math.max(1, Math.ceil(sorted.length / size)),
    };
  },

  async getBankAdmin(id: string): Promise<UserResponse> {
    if (USE_MOCKS) {
      const a = await platformMock.getBankAdmin(id);
      return {
        id: a.id,
        parentEntityId: a.bankId,
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        phoneNumber: a.phone,
        role: a.role,
        status: a.status,
        createdAt: a.createdDate,
      };
    }
    const { data } = await apiClient.get<UserResponse>(`/api/onboarding/banks/users/${id}`);
    return data;
  },

  async updateBankAdmin(id: string, input: UpdateBankAdminInput): Promise<UserResponse> {
    if (USE_MOCKS) {
      const a = await platformMock.updateBankAdmin(id, input);
      return {
        id: a.id,
        parentEntityId: a.bankId,
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        phoneNumber: a.phone,
        role: a.role,
        status: a.status,
        createdAt: a.createdDate,
      };
    }
    const { data } = await apiClient.put<UserResponse>(`/api/onboarding/banks/admins/${id}`, {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phoneNumber: input.phone,
      nationalIdNumber: input.nationalId,
      employeeId: input.employeeNumber,
    });
    return data;
  },

  async setStatus(id: string, status: BankAdminStatus): Promise<BankAdmin> {
    if (USE_MOCKS) return platformMock.setStatus(id, status);
    const apiStatus = mapStatusToApi(status);
    if (apiStatus === 'ACTIVE') {
      await apiClient.patch(`/api/onboarding/banks/admins/${id}/activate`);
    } else {
      await apiClient.patch(`/api/onboarding/banks/admins/${id}/deactivate`);
    }
    return {
      id,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationalId: '',
      employeeNumber: '',
      bankId: '',
      bankName: '',
      department: '',
      role: 'Bank Admin',
      username: '',
      status,
      avatarColor: avatarColorFor(id),
      lastLogin: '—',
      createdDate: '—',
    };
  },

  async approveBankAdmin(id: string): Promise<BankAdmin> {
    if (USE_MOCKS) return platformMock.approveBankAdmin(id);
    await apiClient.patch(`/api/onboarding/banks/admins/${id}/activate`);
    return {
      id,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationalId: '',
      employeeNumber: '',
      bankId: '',
      bankName: '',
      department: '',
      role: 'Bank Admin',
      username: '',
      status: 'Active',
      avatarColor: avatarColorFor(id),
      lastLogin: '—',
      createdDate: '—',
    };
  },

  async deleteBankAdmin(id: string): Promise<void> {
    if (USE_MOCKS) return platformMock.deleteBankAdmin(id);
    try {
      await apiClient.patch(`/api/onboarding/banks/admins/${id}/deactivate`);
    } catch {
      await apiClient.patch(`/api/onboarding/banks/users/${id}/deactivate`);
    }
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
    if (USE_MOCKS) return platformMock.createBankUser(input);
    const { data } = await apiClient.post<MessageAndResultResponseUserResponse>('/api/onboarding/banks/users', input);
    return data;
  },

  async bulkDelete(ids: string[]): Promise<void> {
    if (USE_MOCKS) return platformMock.bulkDelete(ids);
    await Promise.all(ids.map((id) => platformService.deleteBankAdmin(id)));
  },

  async bulkSetStatus(ids: string[], status: BankAdminStatus): Promise<void> {
    if (USE_MOCKS) return platformMock.bulkSetStatus(ids, status);
    await Promise.all(ids.map((id) => platformService.setStatus(id, status)));
  },

  async resetPassword(
    id: string,
    options: { forceChange: boolean; sendEmail: boolean }
  ): Promise<{ temporaryPassword: string }> {
    if (USE_MOCKS) return platformMock.resetPassword(id, options);
    // TODO: Backend endpoint /platform/bank-admins/{id}/reset-password does not exist
    throw new Error('Backend endpoint for resetting bank admin password not yet implemented');
  },
};