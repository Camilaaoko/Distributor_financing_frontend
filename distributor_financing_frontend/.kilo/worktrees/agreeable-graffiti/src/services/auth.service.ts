import { apiClient } from '@/lib/axios';
import { USE_MOCKS } from '@/lib/config';
import { authMockService } from '@/lib/mock/auth';
import type {
  User,
  UserRole,
  CreateUserRole,
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  CreateUserRequest,
  CreateUserResponse,
  ApproveDistributorRequest,
  ActivateUserRequest,
  RegisterAdminRequest,
  RegisterAdminResponse,
  MessageAndResultResponse,
} from '@/lib/types';

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  username: string;
  newPassword: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  employeeId: string;
  /** Must be one of the 8 roles accepted by POST /users per the onboarding-api spec. */
  role: CreateUserRole;
  linkedEntityId?: string;
}

export interface ApproveDistributorPayload {
  distributorEntityId: string;
  approved: boolean;
  rejectionReason: string;
}

export interface ActivateUserPayload {
  active: boolean;
}

export interface RegisterAdminsPayload {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdNumber: string;
  role: string;
  entityId: number;
  active: boolean;
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    if (USE_MOCKS) return authMockService.login(payload);
    return apiClient.post<LoginResponse>('/api/auth/login', payload).then((res) => res.data);
  },

  async logout(): Promise<void> {
    if (USE_MOCKS) return authMockService.logout();
    return apiClient.post('/api/auth/logout').then((res) => res.data);
  },

  async requestPasswordReset(email: string): Promise<MessageAndResultResponse<unknown>> {
    if (USE_MOCKS) return authMockService.requestPasswordReset(email);
    return apiClient.post<MessageAndResultResponse<unknown>>('/api/auth/forgot-password', { email }).then((res) => res.data);
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<MessageAndResultResponse<unknown>> {
    if (USE_MOCKS) return authMockService.resetPassword(payload);
    return apiClient.post<MessageAndResultResponse<unknown>>('/api/auth/reset-password', payload).then((res) => res.data);
  },

  async changePassword(payload: ChangePasswordPayload): Promise<MessageAndResultResponse<unknown>> {
    if (USE_MOCKS) return authMockService.changePassword(payload);
    return apiClient.post<MessageAndResultResponse<unknown>>('/api/auth/change-password', payload).then((res) => res.data);
  },

  // NOTE: /auth/me endpoint is NOT documented in the backend OpenAPI.
  // Kept for backward compatibility; remove if backend doesn't support it.
  async me(): Promise<User> {
    if (USE_MOCKS) return authMockService.me();
    return apiClient.get<User>('/api/auth/me').then((res) => res.data);
  },

  // --- User Management ---

  async createUser(payload: CreateUserPayload): Promise<CreateUserResponse> {
    if (USE_MOCKS) throw new Error('Mock not implemented for createUser');
    return apiClient.post<CreateUserResponse>('/api/users', payload).then((res) => res.data);
  },

  async approveDistributor(payload: ApproveDistributorPayload): Promise<MessageAndResultResponse<unknown>> {
    if (USE_MOCKS) throw new Error('Mock not implemented for approveDistributor');
    return apiClient.post<MessageAndResultResponse<unknown>>('/api/users/distributors/approve', payload).then((res) => res.data);
  },

  async activateUser(email: string, payload: ActivateUserPayload): Promise<MessageAndResultResponse<unknown>> {
    if (USE_MOCKS) throw new Error('Mock not implemented for activateUser');
    return apiClient.patch<MessageAndResultResponse<unknown>>(`/api/users/${encodeURIComponent(email)}/active`, null, { params: { active: payload.active } }).then((res) => res.data);
  },

  async deleteUser(email: string): Promise<MessageAndResultResponse<unknown>> {
    if (USE_MOCKS) throw new Error('Mock not implemented for deleteUser');
    return apiClient.delete<MessageAndResultResponse<unknown>>(`/api/users/${encodeURIComponent(email)}`).then((res) => res.data);
  },

  async registerAdmins(payload: RegisterAdminsPayload[]): Promise<RegisterAdminResponse[]> {
    if (USE_MOCKS) throw new Error('Mock not implemented for registerAdmins');
    return apiClient.post<RegisterAdminResponse[]>('/api/auth/register-admins', payload).then((res) => res.data);
  },
};