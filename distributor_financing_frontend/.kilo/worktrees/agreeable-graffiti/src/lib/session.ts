'use client';

const TOKEN_STORAGE_KEY = 'dfp_token';

const WARNING_THRESHOLD_MS = 60_000;
const INACTIVITY_TIMEOUT_MS = 20 * 60_000;

const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'keydown',
  'scroll',
  'touchstart',
  'touchmove',
  'click',
] as const;

type SessionEventType = 'tokenExpiring' | 'tokenExpired' | 'sessionTimedOut';
type Listener = () => void;

const listeners: Record<SessionEventType, Set<Listener>> = {
  tokenExpiring: new Set(),
  tokenExpired: new Set(),
  sessionTimedOut: new Set(),
};

let lastActivity = Date.now();
let warningTimerId: ReturnType<typeof setTimeout> | null = null;
let inactivityTimerId: ReturnType<typeof setTimeout> | null = null;
let trackingStarted = false;

function onActivity() {
  lastActivity = Date.now();
  resetInactivityTimer();
  resetWarningTimer();
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function getTokenExpiry(token: string | null): number | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== 'number') return null;
  return exp * 1000;
}

export function isSessionExpiringSoon(token: string | null): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return false;
  return expiry - Date.now() <= WARNING_THRESHOLD_MS;
}

export function isSessionExpired(token: string | null): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return false;
  return Date.now() >= expiry;
}

export function isUserActive(): boolean {
  return Date.now() - lastActivity < INACTIVITY_TIMEOUT_MS;
}

export function notifySessionExpired(): void {
  notify('tokenExpired');
}

function resetInactivityTimer() {
  if (inactivityTimerId) clearTimeout(inactivityTimerId);
  inactivityTimerId = setTimeout(() => {
    notify('sessionTimedOut');
  }, INACTIVITY_TIMEOUT_MS);
}

function resetWarningTimer() {
  if (warningTimerId) clearTimeout(warningTimerId);

  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
  const expiry = getTokenExpiry(token);
  if (!expiry) return;

  const timeUntilExpiry = expiry - Date.now();
  const timeUntilWarning = timeUntilExpiry - WARNING_THRESHOLD_MS;

  if (timeUntilWarning > 0) {
    warningTimerId = setTimeout(() => {
      if (isUserActive()) {
        notify('tokenExpiring');
      } else {
        notify('sessionTimedOut');
      }
    }, timeUntilWarning);
  }
}

function notify(type: SessionEventType) {
  listeners[type].forEach((l) => l());
}

export function subscribeSessionEvent(type: SessionEventType, listener: Listener): () => void {
  listeners[type].add(listener);
  return () => listeners[type].delete(listener);
}

export function initSessionTracking(): void {
  if (typeof window === 'undefined' || trackingStarted) return;
  trackingStarted = true;

  ACTIVITY_EVENTS.forEach((event) => {
    document.addEventListener(event, onActivity, { passive: true });
  });

  lastActivity = Date.now();
  resetInactivityTimer();

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token && !isSessionExpired(token)) {
    resetWarningTimer();
  }
}

export function cleanupSessionTracking(): void {
  if (!trackingStarted) return;
  trackingStarted = false;

  ACTIVITY_EVENTS.forEach((event) => {
    document.removeEventListener(event, onActivity);
  });
  if (warningTimerId) clearTimeout(warningTimerId);
  if (inactivityTimerId) clearTimeout(inactivityTimerId);
}
