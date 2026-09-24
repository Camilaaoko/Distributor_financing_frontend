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
    rationaleSummary?: string;
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
      // Validation failure (e.g. principal exceeds invoice amount, tenor not in allowed terms)
      return serverMessage || 'Validation failure: please check input values and constraints.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      // Wrong role or maker approving their own request (maker-checker rule)
      return serverMessage || 'You are not authorised to perform this action.';
    case 404:
      // Distributor profile not found or entity not found
      return serverMessage || 'Distributor profile not found. Please contact the bank.';
    case 409:
      // Conflict e.g. duplicate invoice number or permit
      return serverMessage || 'Conflict detected: this record or invoice number is already in use.';
    case 422:
      // Bank statement could not be parsed — show rationaleSummary field from response
      return data?.rationaleSummary || serverMessage || 'Bank statement could not be parsed.';
    case 500:
      return serverMessage || 'A server error occurred. Please try again shortly.';
    case 502:
    case 503:
    case 504:
      return serverMessage || 'The server is temporarily unavailable. Please try again in a few moments.';

    default:
      return serverMessage || fallback;
  }
}
