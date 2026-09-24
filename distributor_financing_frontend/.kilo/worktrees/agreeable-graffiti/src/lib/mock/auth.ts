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
      email: 'platform@dfp.com',
      username: 'platform.admin',
      role: 'PLATFORM_ADMIN' as UserRole,
      mustResetPassword: false,
    },
  },
  {
    identifier: 'yvonewochuna',
    password: 'demo123',
    user: {
      email: 'yvonewochuna@emtech.com',
      username: 'yvonewochuna',
      role: 'PLATFORM_ADMIN' as UserRole,
      mustResetPassword: false,
    },
  },
  // Bank Maker (KCB Bank)
  {
    identifier: 'james.omondi@kcbgroup.com',
    password: 'demo123',
    user: {
      email: 'james.omondi@kcbgroup.com',
      username: 'james.omondi',
      role: 'BANK_MAKER' as UserRole,
      mustResetPassword: false,
      bankId: 'bnk_01',
      bankName: 'KCB Bank',
    },
  },
  // Bank Checker (KCB Bank)
  {
    identifier: 'caroline.wanjiku@kcbgroup.com',
    password: 'demo123',
    user: {
      email: 'caroline.wanjiku@kcbgroup.com',
      username: 'caroline.wanjiku',
      role: 'BANK_CHECKER' as UserRole,
      mustResetPassword: false,
      bankId: 'bnk_01',
      bankName: 'KCB Bank',
    },
  },
  // Manufacturer
  {
    identifier: 'manufacturer@dfp.com',
    password: 'demo123',
    user: {
      email: 'manufacturer@dfp.com',
      username: 'manufacturer',
      role: 'MANUFACTURER_MAKER' as UserRole,
      mustResetPassword: false,
    },
  },
  // Dealer
  {
    identifier: 'dealer@dfp.com',
    password: 'demo123',
    user: {
      email: 'dealer@dfp.com',
      username: 'dealer',
      role: 'DISTRIBUTOR_MAKER' as UserRole,
      mustResetPassword: false,
    },
  },
  // First-login test user (temporary credentials)
  {
    identifier: 'newuser@dfp.com',
    password: 'tempPass123!',
    user: {
      email: 'newuser@dfp.com',
      username: '',
      role: 'DISTRIBUTOR_MAKER' as UserRole,
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
    email: string;
    username: string;
    role: UserRole;
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
      email: mockUser.user.email,
      username: mockUser.user.username,
      role: mockUser.user.role,
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