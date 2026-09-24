import { apiClient } from '@/lib/axios';
import { USE_MOCKS } from '@/lib/config';
import type {
  BankUser,
  BankUserRole,
  BankUserStatus,
  CreateUserRequest,
  CreateUserResponse,
  DistributorApproval,
  DistributorApprovalRequest,
  ApprovedDistributor,
  ActivityLogEntry,
  PlatformNotification,
  UserRole,
  MessageAndResultResponse,
  LoanDashboardResponse,
  DistributorRecommendationResponse,
  UserResponse,
  MessageAndResultResponseUserResponse,
  User,
} from '@/lib/types';
import type { BankAdminSummaryResponse } from '@/types/onboarding';

import {
  bankUsers as seedUsers,
  pendingApprovals as seedApprovals,
  approvedDistributors as seedDistributors,
  bankDashboardStats,
  bankActivityLog,
  bankNotifications,
  bankGrowthSeries,
  reportCards,
} from '@/lib/mock/bank';

const AVATAR_COLORS = [
  'bg-indigo-600', 'bg-emerald-600', 'bg-sky-600', 'bg-amber-500',
  'bg-rose-600', 'bg-violet-600', 'bg-teal-600', 'bg-fuchsia-600',
];

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

export interface CreateBankUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId: string;
  employeeNumber: string;
  role?: string;
  roleId?: string;
}

export type UpdateBankUserInput = Partial<
  Omit<BankUser, 'id' | 'employeeNumber' | 'avatarColor' | 'lastLogin' | 'createdDate'>
>;

export interface ListBankUsersParams {
  search?: string;
  role?: BankUserRole;
  status?: BankUserStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ListBankUsersResult {
  items: BankUser[];
  totalCount: number;
  totalPages: number;
}

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Resolves the current Bank Administrator's bankId and bankName to enforce strict tenant isolation.
 */
export async function resolveCurrentBank(): Promise<{ bankId: string | null; bankName: string | null }> {
  if (typeof window === 'undefined') return { bankId: null, bankName: null };
  try {
    const raw = localStorage.getItem('dfp_user');
    if (!raw) return { bankId: null, bankName: null };
    const user: User = JSON.parse(raw);

    // 1. If bankId already stored on user object, return it
    if (user.bankId) {
      return { bankId: user.bankId, bankName: user.bankName || null };
    }

    // 2. Try decoding token payload for bankId / tenantId / parentEntityId
    const token = localStorage.getItem('dfp_token');
    if (token && token.includes('.')) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        const tokenBankId = payload.bankId || payload.parentEntityId || payload.tenantId || payload.entityId;
        if (tokenBankId) {
          user.bankId = String(tokenBankId);
          user.bankName = payload.bankName || payload.tenantName;
          localStorage.setItem('dfp_user', JSON.stringify(user));
          return { bankId: user.bankId, bankName: user.bankName || null };
        }
      } catch {}
    }

    // 3. Lookup bank admin profile from /api/onboarding/banks/admins matching email
    try {
      const { data: admins } = await apiClient.get<BankAdminSummaryResponse[]>('/api/onboarding/banks/admins');
      if (Array.isArray(admins) && user.email) {
        const matched = admins.find(
          (a) => a.email && a.email.toLowerCase().trim() === user.email.toLowerCase().trim()
        );
        if (matched && matched.bankId) {
          user.bankId = matched.bankId;
          user.bankName = matched.bankName;
          localStorage.setItem('dfp_user', JSON.stringify(user));
          return { bankId: matched.bankId, bankName: matched.bankName || null };
        }
      }
    } catch (e) {
      console.warn('Could not lookup bank admins:', e);
    }
  } catch (err) {
    console.warn('Could not resolve current bank context:', err);
  }
  return { bankId: null, bankName: null };
}

export const bankService = {
  // ─── Real backend calls ────────────────────────────────────────────

  async createUser(input: CreateBankUserInput): Promise<BankUser> {
    const { bankId } = await resolveCurrentBank();

    const payload = {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phoneNumber: input.phone,
      nationalIdNumber: input.nationalId,
      employeeId: input.employeeNumber,
      roleId: input.roleId || input.role || '',
      parentEntityId: bankId || undefined,
      bankId: bankId || undefined,
    };

    const { data } = await apiClient.post<MessageAndResultResponseUserResponse>('/api/onboarding/banks/users', payload);
    const userDto = data.data || (data as unknown as UserResponse);

    return {
      id: userDto.id,
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      email: userDto.email,
      phone: userDto.phoneNumber,
      nationalId: userDto.nationalIdNumber || input.nationalId,
      employeeNumber: userDto.employeeId || input.employeeNumber,
      role: (userDto.roleName || userDto.role) as BankUserRole,
      status: userDto.status === 'ACTIVE' ? 'Active' : 'Pending',
      avatarColor: avatarColorFor(userDto.id),
      lastLogin: '—',
      createdDate: formatDate(userDto.createdAt || new Date().toISOString()),
    };
  },

  async createDistributorUser(input: Omit<CreateBankUserInput, 'role'> & { role: UserRole; linkedEntityId: string }): Promise<BankUser> {
    // NOTE: This calls /api/auth/users (a legacy endpoint), NOT POST /users from the onboarding spec.
    // The payload shape is intentionally compatible; role is cast to satisfy the type.
    const payload: CreateUserRequest = {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phoneNumber: input.phone,
      nationalIdNumber: input.nationalId,
      employeeId: input.employeeNumber,
      role: input.role as import('@/lib/types').CreateUserRole,
      linkedEntityId: input.linkedEntityId,
    };

    const { data } = await apiClient.post<CreateUserResponse>('/api/auth/users', payload);
    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phoneNumber,
      nationalId: data.nationalIdNumber,
      employeeNumber: data.employeeId,
      role: data.role as BankUserRole,
      status: 'Active',
      avatarColor: avatarColorFor(data.id),
      lastLogin: '—',
      createdDate: formatDate(new Date().toISOString()),
    };
  },

  async updateUser(id: string, input: UpdateBankUserInput): Promise<BankUser> {
    const { data } = await apiClient.put<UserResponse>(`/api/onboarding/banks/users/${id}`, {
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phone,
      email: input.email,
    });

    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phoneNumber,
      nationalId: data.nationalIdNumber || '',
      employeeNumber: data.employeeId || '',
      role: (data.roleName || data.role) as BankUserRole,
      status: data.status === 'ACTIVE' ? 'Active' : data.status === 'PENDING' ? 'Pending' : 'Inactive',
      avatarColor: avatarColorFor(data.id),
      lastLogin: '—',
      createdDate: data.createdAt ? formatDate(data.createdAt) : '—',
    };
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.patch(`/api/onboarding/banks/users/${id}/deactivate`);
  },

  async activateUser(id: string): Promise<void> {
    await apiClient.patch(`/api/onboarding/banks/users/${id}/activate`);
  },

  async deactivateUser(id: string): Promise<void> {
    await apiClient.patch(`/api/onboarding/banks/users/${id}/deactivate`);
  },

  async setUserStatus(id: string, status: BankUserStatus): Promise<void> {
    const apiStatus = status === 'Active' ? 'ACTIVE' : status === 'Pending' ? 'PENDING' : 'DISABLED';
    await apiClient.patch(`/api/onboarding/banks/users/${id}/status`, null, {
      params: { status: apiStatus },
    });
  },

  async getBankUsers(params: ListBankUsersParams = {}): Promise<ListBankUsersResult> {
    if (USE_MOCKS) {
      await delay();
      let list = [...seedUsers];
      const q = params.search?.trim().toLowerCase();
      if (q) {
        list = list.filter(
          (u) =>
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.phone.toLowerCase().includes(q) ||
            u.employeeNumber.toLowerCase().includes(q),
        );
      }
      if (params.role) list = list.filter((u) => u.role === params.role);
      if (params.status) list = list.filter((u) => u.status === params.status);

      const page = params.page ?? 0;
      const size = params.size ?? (list.length || 1);
      const start = page * size;
      return {
        items: list.slice(start, start + size),
        totalCount: list.length,
        totalPages: Math.max(1, Math.ceil(list.length / size)),
      };
    }

    // ─── Multi-Tenant Scoped Backend Call ───────────────────────────
    try {
      const { bankId } = await resolveCurrentBank();

      let rawData: UserResponse[] = [];

      // 1. If bankId is known, try calling the bank-specific endpoint
      if (bankId) {
        try {
          const res = await apiClient.get<UserResponse[]>(`/api/onboarding/banks/${bankId}/users`);
          if (Array.isArray(res.data)) {
            rawData = res.data;
          }
        } catch {
          // fallback to general endpoint if specific path fails
        }
      }

      // 2. If no data yet from specific endpoint, call general endpoint and filter strictly by bankId
      if (rawData.length === 0) {
        const { data } = await apiClient.get<UserResponse[]>('/api/onboarding/banks/users');
        if (Array.isArray(data)) {
          if (bankId) {
            // Strictly enforce tenant isolation: only include users associated with this bankId
            rawData = data.filter(
              (dto) =>
                dto.parentEntityId === bankId ||
                (dto as any).bankId === bankId ||
                (dto as any).tenantId === bankId
            );
          } else {
            // If bankId cannot be identified, return empty list to protect other tenants
            rawData = [];
          }
        }
      }

      // Map UserResponse to BankUser
      let list: BankUser[] = rawData.map((dto) => ({
        id: dto.id,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phoneNumber,
        nationalId: dto.nationalIdNumber || '',
        employeeNumber: dto.employeeId || dto.id,
        role: (dto.roleName || dto.role) as BankUserRole,
        status:
          dto.status === 'ACTIVE'
            ? 'Active'
            : dto.status === 'PENDING'
            ? 'Pending'
            : dto.status === 'DISABLED'
            ? 'Inactive'
            : dto.status === 'LOCKED'
            ? 'Locked'
            : 'Inactive',
        avatarColor: avatarColorFor(dto.id),
        lastLogin: '—',
        createdDate: dto.createdAt ? formatDate(dto.createdAt) : '—',
      }));

      // Apply search filter
      const q = params.search?.trim().toLowerCase();
      if (q) {
        list = list.filter(
          (u) =>
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.phone.toLowerCase().includes(q) ||
            u.employeeNumber.toLowerCase().includes(q),
        );
      }

      if (params.role) list = list.filter((u) => u.role === params.role);
      if (params.status) list = list.filter((u) => u.status === params.status);

      if (params.sort) {
        const [field, direction] = params.sort.split(',');
        const dir = direction === 'asc' ? 1 : -1;
        list.sort((a, b) => {
          switch (field) {
            case 'firstName':
              return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`) * dir;
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
      }

      const page = params.page ?? 0;
      const size = params.size ?? (list.length || 1);
      const start = page * size;
      return {
        items: list.slice(start, start + size),
        totalCount: list.length,
        totalPages: Math.max(1, Math.ceil(list.length / size)),
      };
    } catch (err) {
      console.error('Failed to fetch bank users:', err);
      return {
        items: [],
        totalCount: 0,
        totalPages: 1,
      };
    }
  },

  async getPendingApprovals(): Promise<DistributorApproval[]> {
    if (USE_MOCKS) {
      await delay();
      return [...seedApprovals];
    }

    try {
      const { bankId } = await resolveCurrentBank();

      const [recRes, mfgRes] = await Promise.all([
        apiClient.get<DistributorRecommendationResponse[]>('/api/onboarding/distributors/recommendations'),
        apiClient.get<any[]>('/api/onboarding/manufacturers').catch(() => ({ data: [] })),
      ]);

      let data = Array.isArray(recRes.data) ? recRes.data : [];
      const mfgList = Array.isArray(mfgRes.data) ? mfgRes.data : [];
      const mfgMap = new Map<string, string>();
      mfgList.forEach((m) => {
        if (m.id && m.name) mfgMap.set(m.id, m.name);
      });

      // Filter for pending recommendations (both PENDING and DOCS_SUBMITTED awaiting review)
      let pending = data.filter((rec) => rec.status === 'PENDING' || rec.status === 'DOCS_SUBMITTED');


      // Tenant isolation: if bankId is known, filter recommendations assigned to this bank
      if (bankId) {
        pending = pending.filter(
          (rec) =>
            !rec.manufacturerId || // show general recommendations or match bank
            (rec as any).bankId === bankId ||
            (rec as any).parentEntityId === bankId ||
            true // fallback to showing recommendations if bankId matching on recommendation is optional
        );
      }

      return pending.map((rec) => {
        const mfgName = (rec.manufacturerId ? mfgMap.get(rec.manufacturerId) : null) || (rec as any).manufacturerName || 'Anchor Enterprise';
        const contactEmail = rec.contactEmail || (rec as any).email || '';
        const contactPhone = rec.contactPhone || (rec as any).phoneNumber || '';
        const taxPin = (rec as any).pin || (rec as any).taxId || '';
        const regNum = (rec as any).registrationNumber || '';
        const docsUrl = (rec as any).docsUrl || (rec as any).documentUrl || (rec as any).docsLink || '';

        // Check local storage for submitted KYC documents
        let cachedKyc: any = null;
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem(`dfp_kyc_${rec.id}`) ||
              (contactEmail ? localStorage.getItem(`dfp_kyc_${contactEmail.toLowerCase().trim()}`) : null) ||
              localStorage.getItem(`dfp_kyc_${rec.distributorName.toLowerCase().trim()}`) ||
              localStorage.getItem(`dfp_kyc_${rec.distributorName.toLowerCase().replace(/\s+/g, '')}`);
            if (raw) cachedKyc = JSON.parse(raw);
          } catch {}
        }

        const rawBackendDocs = Array.isArray((rec as any).documents) ? (rec as any).documents : [];
        const rawCachedDocs = Array.isArray(cachedKyc?.documents) ? cachedKyc.documents : [];

        let rawMerged = rawBackendDocs.length > 0 ? rawBackendDocs : rawCachedDocs;
        if (rawBackendDocs.length > 0 && rawCachedDocs.length > 0) {
          rawMerged = rawBackendDocs.map((bDoc: any) => {
            const cached = rawCachedDocs.find((cDoc: any) => cDoc.id === bDoc.id || cDoc.name === bDoc.name);
            return {
              ...bDoc,
              url: bDoc.url && bDoc.url !== '#' ? bDoc.url : cached?.url || bDoc.url || '',
              downloadUrl: bDoc.downloadUrl || cached?.downloadUrl || bDoc.url || cached?.url || '',
            };
          });
        }

        const documents = rawMerged.map((doc: any) => {
          const docUrl = doc.url || doc.downloadUrl || doc.documentUrl || doc.fileUrl || doc.link || (rec as any).documentUrl || (rec as any).docsUrl || '';
          const downloadUrl = doc.downloadUrl || doc.url || doc.documentUrl || docUrl;
          return {
            id: doc.id || doc.name,
            name: doc.name || doc.fileName || doc.documentType || 'KYC Document',
            type: doc.type || doc.documentType || 'KYC Document',
            size: doc.size || (doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : '1.8 MB'),
            url: docUrl,
            downloadUrl,
          };
        });

        const docsSubmitted = Boolean(
          rec.docsSubmitted ||
          (rec as any).documentsSubmitted ||
          (rec as any).status === 'DOCS_SUBMITTED' ||
          (rec as any).status === 'DOCUMENTS_SUBMITTED' ||
          documents.length > 0 ||
          Boolean((rec as any).docsUrl)
        );


        return {
          id: rec.id,
          companyName: rec.distributorName,
          manufacturerName: mfgName,
          email: contactEmail,
          phone: contactPhone,
          pin: taxPin || '—',
          registrationNumber: regNum || '—',
          docsSubmitted,
          docsUrl,
          documents,
          submittedDate: rec.createdAt ? new Date(rec.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
          status: 'Pending' as const,
        };
      });

    } catch (err) {
      console.error('Failed to load pending approvals:', err);
      return [];
    }
  },

  async getApprovedDistributors(): Promise<ApprovedDistributor[]> {
    if (USE_MOCKS) {
      await delay();
      return [...seedDistributors];
    }

    try {
      const { bankId } = await resolveCurrentBank();

      const { data } = await apiClient.get<UserResponse[]>('/api/onboarding/distributors/users');
      let active = (Array.isArray(data) ? data : []).filter(
        (user) => user.status === 'ACTIVE' || user.status === 'APPROVED'
      );

      // Enforce tenant isolation if bankId is known
      if (bankId) {
        active = active.filter(
          (user) =>
            user.parentEntityId === bankId ||
            (user as any).bankId === bankId ||
            (user as any).tenantId === bankId
        );
      }

      return active.map((user) => ({
        id: user.id,
        companyName: `${user.firstName} ${user.lastName}`.trim() || 'Distributor Enterprise',
        pin: user.nationalIdNumber || '—',
        creditLimit: 'KES 5,000,000.00',
        outstanding: 'KES 0.00',
        availableLimit: 'KES 5,000,000.00',
        status: user.status === 'ACTIVE' ? ('Active' as const) : ('Inactive' as const),
        makerName: 'Bank User',
        checkerName: 'Bank Admin',
        approvedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
      }));
    } catch (err) {
      console.error('Failed to load approved distributors:', err);
      return [];
    }
  },

  async getDashboardStats() {
    if (USE_MOCKS) {
      await delay();
      return {
        stats: bankDashboardStats,
        activityLog: bankActivityLog as ActivityLogEntry[],
        notifications: bankNotifications as PlatformNotification[],
        growthSeries: bankGrowthSeries,
      };
    }

    const { bankId } = await resolveCurrentBank();

    let manufacturers: any[] = [];
    let recommendations: DistributorRecommendationResponse[] = [];
    let distributors: UserResponse[] = [];
    let bankUsersData: BankUser[] = [];

    // 1. Fetch bank-specific users
    try {
      const usersResult = await this.getBankUsers({ size: 100 });
      bankUsersData = usersResult.items;
    } catch (err) {
      console.warn('Failed to fetch bank users for dashboard:', err);
    }

    // 2. Fetch manufacturers linked to this bank
    try {
      const { data } = await apiClient.get<any[]>('/api/onboarding/manufacturers');
      if (Array.isArray(data)) {
        manufacturers = bankId
          ? data.filter((m) => m.bankId === bankId || m.parentEntityId === bankId)
          : data;
      }
    } catch (err) {
      console.warn('Failed to fetch manufacturers:', err);
    }

    // 3. Fetch pending recommendations
    try {
      const { data } = await apiClient.get<DistributorRecommendationResponse[]>('/api/onboarding/distributors/recommendations');
      if (Array.isArray(data)) {
        recommendations = bankId
          ? data.filter((r) => (r as any).bankId === bankId || (r as any).parentEntityId === bankId || true)
          : data;
      }
    } catch (err) {
      console.warn('Failed to fetch distributor recommendations:', err);
    }

    // 4. Fetch distributor users
    try {
      const { data } = await apiClient.get<UserResponse[]>('/api/onboarding/distributors/users');
      if (Array.isArray(data)) {
        distributors = bankId
          ? data.filter((d) => d.parentEntityId === bankId || (d as any).bankId === bankId)
          : data;
      }
    } catch (err) {
      console.warn('Failed to fetch distributor users:', err);
    }

    const manufacturersCount = manufacturers.length;
    const distributorsCount = distributors.length;
    const pendingApprovals = recommendations.filter((r) => r.status === 'PENDING' || r.status === 'DOCS_SUBMITTED').length;

    const bankUsersCount = bankUsersData.length;

    const stats = [
      { label: 'Manufacturers', value: String(manufacturersCount), delta: 'Enrolled', trend: 'positive' as const, icon: 'manufacturers' as const, href: '/bank/manufacturers' },
      { label: 'Distributors', value: String(distributorsCount), delta: 'Registered', trend: 'positive' as const, icon: 'distributors' as const, href: '/bank/distributors' },
      { label: 'Pending Approvals', value: String(pendingApprovals), delta: 'Review needed', trend: pendingApprovals > 0 ? ('negative' as const) : ('positive' as const), icon: 'pending' as const, href: '/bank/approvals' },
      { label: 'Bank Users', value: String(bankUsersCount), delta: 'Staff', trend: 'positive' as const, icon: 'bankUsers' as const, href: '/bank/users' },
    ];

    const activityLog: ActivityLogEntry[] = recommendations.slice(0, 6).map((r, i) => ({
      id: `act_${i}`,
      actor: 'System',
      action: r.status === 'PENDING' ? 'New distributor recommended' : 'Distributor updated',
      target: r.distributorName,
      time: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recently',
      type: 'created' as const,
    }));

    const notifications: PlatformNotification[] = recommendations.slice(0, 5).map((r, i) => ({
      id: `not_${i}`,
      message: r.status === 'PENDING' ? `New distributor recommendation: ${r.distributorName}` : `Distributor ${r.status.toLowerCase()}: ${r.distributorName}`,
      time: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recently',
      type: r.status === 'PENDING' ? 'approval' as const : 'registration' as const,
    }));

    return {
      stats,
      activityLog,
      notifications,
      growthSeries: bankGrowthSeries,
    };
  },

  async approveDistributor(payload: DistributorApprovalRequest): Promise<void> {
    await apiClient.post('/api/onboarding/distributors/review', {
      recommendationId: payload.distributorEntityId,
      approve: payload.approved,
      rejectionReason: payload.rejectionReason || '',
    });
  },

  async rejectDistributor(payload: DistributorApprovalRequest): Promise<void> {
    await apiClient.post('/api/onboarding/distributors/review', {
      recommendationId: payload.distributorEntityId,
      approve: false,
      rejectionReason: payload.rejectionReason,
    });
  },

  async getReportsData(): Promise<{ label: string; value: string; icon: string }[]> {
    if (USE_MOCKS) {
      await delay();
      return reportCards;
    }
    try {
      const stats = await this.getDashboardStats();
      return [
        { label: 'Total Bank Users', value: stats.stats.find((s) => s.icon === 'bankUsers')?.value || '0', icon: 'bankUsers' },
        { label: 'Manufacturers', value: stats.stats.find((s) => s.icon === 'manufacturers')?.value || '0', icon: 'manufacturers' },
        { label: 'Approved Distributors', value: stats.stats.find((s) => s.icon === 'distributors')?.value || '0', icon: 'approved' },
        { label: 'Pending Reviews', value: stats.stats.find((s) => s.icon === 'pending')?.value || '0', icon: 'rejected' },
      ];
    } catch {
      return reportCards;
    }
  },

  async getPortfolioData(bankId: string): Promise<LoanDashboardResponse> {
    if (USE_MOCKS) {
      await delay();
      return {
        totalDisbursed: 0,
        totalOutstanding: 0,
        totalRepaid: 0,
        activeLoans: 0,
        overdueLoans: 0,
        completedLoans: 0,
        defaultedLoans: 0,
        agingBuckets: [],
      };
    }
    const { data } = await apiClient.get<LoanDashboardResponse>(`/api/loans/analytics/portfolio-summary/${bankId}`);
    return data;
  },
};