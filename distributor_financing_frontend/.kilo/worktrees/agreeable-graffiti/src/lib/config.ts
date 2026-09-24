/** Base URL for API Gateway. Set NEXT_PUBLIC_API_URL in .env.local. */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/api\/?$/, '').replace(/\/+$/, '');

/** Base URL for Notifications Service. Set NEXT_PUBLIC_NOTIFICATIONS_API_URL in .env.local. */
export const NOTIFICATIONS_API_URL = (process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || 'http://localhost:8080/api/notifications').replace(/\/+$/, '');

/**
 * Switch for live backend vs mock data.
 * When NEXT_PUBLIC_USE_MOCKS=false in .env.local, all requests go directly to the real Spring Boot backend & DB.
 */
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
