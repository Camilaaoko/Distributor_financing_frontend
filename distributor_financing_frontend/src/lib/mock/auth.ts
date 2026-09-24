import type { User, UserRole } from '@/lib/types';

// Mock users for authentication - matches the roles in UserRole type
const MOCK_USERS: Array<{
  identifier: string;
  password: string;
  user: User;
}> = [
  // Platform Admin
  {
    identifier: 'platform@dfp.com',
    password: 'demo123',
    user: {
      id: 'usr_platform_01',
      email: 'platform@dfp.com',
      username: 'platform.admin',
      role: 'PLATFORM_ADMIN' as UserRole,
      roleName: 'Platform Super Admin',
      appRole: 'Platform Super Admin',
      permissions: ['*'],
      mustResetPassword: false,
    },
  },
  // Bank Admin (Default KCB)
  {
    identifier: 'admin@bank.com',
    password: 'demo123',
    user: {
      id: 'usr_bank_admin_01',
      email: 'admin@bank.com',
      username: 'bank.admin',
      role: 'BANK_ADMIN' as UserRole,
      roleName: 'Bank Admin',
      appRole: 'Bank Admin',
      permissions: [
        'APPROVE_BANK_LOAN',
        'DISBURSE_LOAN',
        'VIEW_LOANS',
        'MANAGE_BANK_FACILITIES',
        'VIEW_REPORTS',
        'MANAGE_BANK_USERS',
      ],
      mustResetPassword: false,
      bankId: 'bnk_01',
      bankName: 'KCB Bank',
      bankCode: 'KCB',
    },
  },
  // Bank Admin (Equity Bank)
  {
    identifier: 'admin@equity.com',
    password: 'demo123',
    user: {
      id: 'usr_equity_admin_01',
      email: 'admin@equity.com',
      username: 'equity.admin',
      role: 'BANK_ADMIN' as UserRole,
      roleName: 'Bank Admin',
      appRole: 'Bank Admin',
      permissions: [
        'APPROVE_BANK_LOAN',
        'DISBURSE_LOAN',
        'VIEW_LOANS',
        'MANAGE_BANK_FACILITIES',
        'VIEW_REPORTS',
        'MANAGE_BANK_USERS',
      ],
      mustResetPassword: false,
      bankId: 'bnk_02',
      bankName: 'Equity Bank',
      bankCode: 'EQTY',
    },
  },
  {
    identifier: 'equity.admin@equitybank.co.ke',
    password: 'demo123',
    user: {
      id: 'usr_equity_admin_02',
      email: 'equity.admin@equitybank.co.ke',
      username: 'equity.admin',
      role: 'BANK_ADMIN' as UserRole,
      roleName: 'Bank Admin',
      appRole: 'Bank Admin',
      permissions: [
        'APPROVE_BANK_LOAN',
        'DISBURSE_LOAN',
        'VIEW_LOANS',
        'MANAGE_BANK_FACILITIES',
        'VIEW_REPORTS',
        'MANAGE_BANK_USERS',
      ],
      mustResetPassword: false,
      bankId: 'bnk_02',
      bankName: 'Equity Bank',
      bankCode: 'EQTY',
    },
  },
  // Bank Maker
  {
    identifier: 'james.omondi@kcbgroup.com',
    password: 'demo123',
    user: {
      id: 'usr_bank_maker_01',
      email: 'james.omondi@kcbgroup.com',
      username: 'james.omondi',
      role: 'BANK_USER' as UserRole,
      roleName: 'Bank Credit Underwriter',
      appRole: 'Bank Maker',
      permissions: ['VIEW_LOANS', 'MANAGE_BANK_FACILITIES', 'VIEW_REPORTS'],
      mustResetPassword: false,
      bankId: 'bnk_01',
      bankName: 'KCB Bank',
    },
  },
  // Bank Checker
  {
    identifier: 'caroline.wanjiku@kcbgroup.com',
    password: 'demo123',
    user: {
      id: 'usr_bank_checker_01',
      email: 'caroline.wanjiku@kcbgroup.com',
      username: 'caroline.wanjiku',
      role: 'BANK_USER' as UserRole,
      roleName: 'Bank Approver',
      appRole: 'Bank Checker',
      permissions: ['APPROVE_BANK_LOAN', 'DISBURSE_LOAN', 'VIEW_LOANS', 'VIEW_REPORTS'],
      mustResetPassword: false,
      bankId: 'bnk_01',
      bankName: 'KCB Bank',
    },
  },
  // Distributor Admin / Dealer
  // Distributor Maker (Default & Named)
  {
    identifier: 'dealer@dfp.com',
    password: 'demo123',
    user: {
      id: 'usr_dist_maker_01',
      userId: 'usr_dist_maker_01',
      email: 'dealer@dfp.com',
      username: 'distributor.maker',
      role: 'DISTRIBUTOR_USER' as UserRole,
      roleName: 'Distributor Maker',
      appRole: 'Distributor Maker',
      permissions: ['APPLY_FINANCING', 'VIEW_MY_LOANS', 'CANCEL_LOAN_REQUEST'],
      mustResetPassword: false,
      distributorId: 'dist_01',
      distributorName: 'Nairobi Beverages Ltd',
    },
  },
  {
    identifier: 'maker.dealer@dfp.com',
    password: 'demo123',
    user: {
      id: 'usr_dist_maker_01',
      userId: 'usr_dist_maker_01',
      email: 'maker.dealer@dfp.com',
      username: 'john.kipchumba',
      role: 'DISTRIBUTOR_USER' as UserRole,
      roleName: 'Distributor Maker',
      appRole: 'Distributor Maker',
      permissions: ['APPLY_FINANCING', 'VIEW_MY_LOANS', 'CANCEL_LOAN_REQUEST'],
      mustResetPassword: false,
      distributorId: 'dist_01',
      distributorName: 'Nairobi Beverages Ltd',
    },
  },
  // Distributor Checker
  {
    identifier: 'checker.dealer@dfp.com',
    password: 'demo123',
    user: {
      id: 'usr_dist_checker_01',
      userId: 'usr_dist_checker_01',
      email: 'checker.dealer@dfp.com',
      username: 'sarah.wanjiku',
      role: 'DISTRIBUTOR_USER' as UserRole,
      roleName: 'Distributor Checker',
      appRole: 'Distributor Checker',
      permissions: ['APPROVE_DISTRIBUTOR_LOAN', 'VIEW_MY_LOANS'],
      mustResetPassword: false,
      distributorId: 'dist_01',
      distributorName: 'Nairobi Beverages Ltd',
    },
  },
  // Distributor Admin
  {
    identifier: 'admin.dealer@dfp.com',
    password: 'demo123',
    user: {
      id: 'usr_dist_admin_01',
      userId: 'usr_dist_admin_01',
      email: 'admin.dealer@dfp.com',
      username: 'distributor.admin',
      role: 'DISTRIBUTOR_ADMIN' as UserRole,
      roleName: 'Distributor Admin',
      appRole: 'Distributor Admin',
      permissions: [
        'APPLY_FINANCING',
        'APPROVE_DISTRIBUTOR_LOAN',
        'VIEW_MY_LOANS',
        'CANCEL_LOAN_REQUEST',
        'MANAGE_DISTRIBUTOR_USERS',
      ],
      mustResetPassword: false,
      distributorId: 'dist_01',
      distributorName: 'Nairobi Beverages Ltd',
    },
  },
  // Manufacturer Maker / Admin
  {
    identifier: 'manufacturer@dfp.com',
    password: 'demo123',
    user: {
      id: 'usr_mfg_01',
      email: 'manufacturer@dfp.com',
      username: 'manufacturer',
      role: 'MANUFACTURER_USER' as UserRole,
      roleName: 'Anchor Manufacturer Operations',
      appRole: 'Manufacturer Maker',
      permissions: ['VIEW_PURCHASE_ORDERS', 'CONFIRM_DELIVERY', 'VIEW_INVOICES', 'GENERATE_STATEMENT'],
      mustResetPassword: false,
      manufacturerId: 'mfg_01',
      manufacturerName: 'East Africa Breweries',
    },
  },
  {
    identifier: 'admin.mfg@dfp.com',
    password: 'demo123',
    user: {
      id: 'usr_mfg_admin_01',
      email: 'admin.mfg@dfp.com',
      username: 'mfg.admin',
      role: 'MANUFACTURER_ADMIN' as UserRole,
      roleName: 'Anchor Manufacturer Admin',
      appRole: 'Manufacturer Admin',
      permissions: [
        'VIEW_PURCHASE_ORDERS',
        'CONFIRM_DELIVERY',
        'VIEW_INVOICES',
        'GENERATE_STATEMENT',
        'MANAGE_MANUFACTURER_USERS',
      ],
      mustResetPassword: false,
      manufacturerId: 'mfg_01',
      manufacturerName: 'East Africa Breweries',
    },
  },
  // First-login test user (temporary credentials)
  {
    identifier: 'newuser@dfp.com',
    password: 'tempPass123!',
    user: {
      id: 'usr_new_01',
      email: 'newuser@dfp.com',
      username: '',
      role: 'DISTRIBUTOR_USER' as UserRole,
      roleName: 'Distributor Maker',
      appRole: 'Distributor Maker',
      permissions: ['APPLY_FINANCING', 'VIEW_MY_LOANS'],
      mustResetPassword: true,
    },
  },
];

// In-memory store for password reset tokens (token -> email)
const RESET_TOKEN_STORE: Map<string, string> = new Map();

const DELAY = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

function generateResetToken(): string {
  // Generate a UUID-like token for demo purposes
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export const authMockService = {
  async login(payload: { identifier: string; password: string }): Promise<{
    token: string;
    userId?: string;
    email: string;
    username: string;
    role: UserRole;
    roleName?: string;
    appRole?: string;
    permissions?: string[];
    mustResetPassword: boolean;
  }> {
    await DELAY(500);
    
    // Try exact match first (email or username)
    let mockUser = MOCK_USERS.find(
      (u) => u.identifier.toLowerCase() === payload.identifier.toLowerCase()
    );
    
    // If not found, try matching by email or username in the user object
    if (!mockUser) {
      mockUser = MOCK_USERS.find(
        (u) =>
          u.user.email.toLowerCase() === payload.identifier.toLowerCase() ||
          u.user.username.toLowerCase() === payload.identifier.toLowerCase()
      );
    }

    if (!mockUser || mockUser.password !== payload.password) {
      throw new Error('Invalid email or password.');
    }

    return {
      token: `mock-token-${Date.now()}`,
      userId: mockUser.user.id || mockUser.user.userId,
      email: mockUser.user.email,
      username: mockUser.user.username,
      role: mockUser.user.role,
      roleName: mockUser.user.roleName,
      appRole: mockUser.user.appRole,
      permissions: mockUser.user.permissions,
      mustResetPassword: mockUser.user.mustResetPassword ?? false,
    };
  },

  async logout(): Promise<void> {
    await DELAY(100);
    // No-op for mock
  },

  async requestPasswordReset(email: string): Promise<{ message: string; success: boolean; result: null }> {
    await DELAY(500);
    const mockUser = MOCK_USERS.find(
      (u) => u.user.email.toLowerCase() === email.toLowerCase()
    );
    if (!mockUser) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent.', success: true, result: null };
    }
    
    // Generate a reset token and store the mapping
    const token = generateResetToken();
    RESET_TOKEN_STORE.set(token, email.toLowerCase());
    
    // For demo purposes, log the token so it can be used for testing
    console.log(`[MOCK] Password reset token for ${email}: ${token}`);
    
    return { message: 'Password reset link sent.', success: true, result: null };
  },

  async resetPassword(payload: { token: string; newPassword: string }): Promise<{ message: string; success: boolean; result: null }> {
    await DELAY(500);
    
    // Look up the email associated with this token
    const email = RESET_TOKEN_STORE.get(payload.token);
    
    if (!email) {
      throw new Error('Your password reset link is invalid or has expired. Please request a new one.');
    }
    
    // Find the user by email and update their password
    const userIndex = MOCK_USERS.findIndex(
      (u) => u.user.email.toLowerCase() === email.toLowerCase()
    );
    
    if (userIndex === -1) {
      throw new Error('Unable to reset password. User not found.');
    }
    
    // Update the password
    MOCK_USERS[userIndex].password = payload.newPassword;
    
    // Remove the used token (one-time use)
    RESET_TOKEN_STORE.delete(payload.token);
    
    return { message: 'Password reset successful.', success: true, result: null };
  },

  async changePassword(payload: { username: string; newPassword: string }): Promise<{ message: string; success: boolean; result: null }> {
    await DELAY(500);

    // Find the user with mustResetPassword = true (first login user)
    const userIndex = MOCK_USERS.findIndex(
      (u) => u.user.mustResetPassword === true && u.user.email
    );

    if (userIndex === -1) {
      throw new Error('No user found requiring password setup.');
    }

    // Check if username is already taken by another user
    const usernameTaken = MOCK_USERS.some(
      (u, i) => i !== userIndex && u.user.username.toLowerCase() === payload.username.toLowerCase()
    );

    if (usernameTaken) {
      throw new Error('That username is already in use.');
    }

    // Update username, password, and mustResetPassword
    MOCK_USERS[userIndex].user.username = payload.username;
    MOCK_USERS[userIndex].password = payload.newPassword;
    MOCK_USERS[userIndex].user.mustResetPassword = false;

    return { message: 'Account setup complete. Please sign in with your new credentials.', success: true, result: null };
  },

  async me(): Promise<User> {
    await DELAY(200);
    // This would typically read from token, but for mock we'll throw
    throw new Error('Not implemented in mock');
  },
};