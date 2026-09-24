export const APP_NAME = 'Distributor Financing Capital';

export const AUTH_TOKEN_COOKIE = 'dfp_token';

/**
 * Maps backend roles to the dashboard each user should see after login.
 * These keys match the role values returned by the Spring Boot API.
 */
export const ROLE_HOME_ROUTE: Record<string, string> = {
  // Platform Admin
  PLATFORM_ADMIN: '/platform',

  // Bank
  BANK_ADMIN: '/bank',
  BANK_MAKER: '/bank',
  BANK_CHECKER: '/bank',
  BANK_USER: '/bank',
  BANK: '/bank',

  // Manufacturer
  MANUFACTURER_ADMIN: '/manufacturer',
  MANUFACTURER_MAKER: '/manufacturer',
  MANUFACTURER_CHECKER: '/manufacturer',
  MANUFACTURER_USER: '/manufacturer',
  MANUFACTURER: '/manufacturer',

  // Distributor / Dealer
  DISTRIBUTOR_ADMIN: '/dealer',
  DISTRIBUTOR_MAKER: '/dealer',
  DISTRIBUTOR_CHECKER: '/dealer',
  DISTRIBUTOR_USER: '/dealer',
  DISTRIBUTOR: '/dealer',
  DEALER: '/dealer',
};