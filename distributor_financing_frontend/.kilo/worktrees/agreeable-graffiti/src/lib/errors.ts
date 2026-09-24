import { isAxiosError } from 'axios';

/** Extract a user-friendly message from an API error, keyed off HTTP status. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  if (!error.response) {
    return 'Unable to reach the server. Check your connection and try again.';
  }

  const data = error.response.data as {
    message?: string;
    error?: string;
    // Spring Boot MethodArgumentNotValidException shape
    errors?: Array<{ field?: string; defaultMessage?: string }>;
    // Spring Boot ConstraintViolationException / ErrorResponse shape
    fieldErrors?: Record<string, string>;
    detail?: string;
  } | undefined;

  // Spring bean validation: array of field errors
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const parts = data.errors
      .map((e) => (e.field ? `${e.field}: ${e.defaultMessage}` : e.defaultMessage))
      .filter(Boolean);
    if (parts.length > 0) return parts.join(' | ');
  }

  // Spring ConstraintViolationException map
  if (data?.fieldErrors && typeof data.fieldErrors === 'object') {
    const parts = Object.entries(data.fieldErrors).map(([k, v]) => `${k}: ${v}`);
    if (parts.length > 0) return parts.join(' | ');
  }

  const serverMessage = data?.message || data?.error || data?.detail;

  switch (error.response.status) {
    case 400:
      return serverMessage || 'That request was invalid. Please check the form and try again.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return serverMessage || 'That record could not be found. It may have already been removed.';
    case 409:
      return serverMessage || 'That value is already in use by another account.';
    case 500:
      return serverMessage || 'A server error occurred. Please try again shortly.';

    default:
      return serverMessage || fallback;
  }
}
