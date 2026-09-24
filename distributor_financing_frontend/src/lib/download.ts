/**
 * CSV File Download Utility
 * Implements authenticated download handling with Content-Disposition parsing,
 * Blob URL triggers, and client-side fallback generation.
 */

import { API_URL } from '@/lib/config';

/**
 * Retrieves the current authentication token from localStorage or cookie.
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('dfp_token');
  if (token) return token;

  // Fallback to cookie
  const match = document.cookie.match(new RegExp('(^| )dfp_token=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Normalizes full or relative endpoint URL against API_URL.
 */
export function resolveApiUrl(endpointUrl: string): string {
  if (endpointUrl.startsWith('http://') || endpointUrl.startsWith('https://')) {
    return endpointUrl;
  }
  const cleanBase = API_URL.replace(/\/+$/, '');
  const cleanEndpoint = endpointUrl.startsWith('/') ? endpointUrl : `/${endpointUrl}`;
  return `${cleanBase}${cleanEndpoint}`;
}

/**
 * Client-side CSV generator for instant downloads or fallback.
 */
export function exportCsvClientSide(
  defaultFilename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
): void {
  const sanitize = (val: string | number | boolean | null | undefined) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(sanitize).join(','),
    ...rows.map((row) => row.map(sanitize).join(',')),
  ].join('\r\n');

  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = defaultFilename.endsWith('.csv') ? defaultFilename : `${defaultFilename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

export interface DownloadOptions {
  fallbackHeaders?: string[];
  fallbackRows?: (string | number | boolean | null | undefined)[][];
  onSuccess?: (filename: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Downloads report CSV via authenticated backend endpoint.
 * Fallbacks to client-side data formatting if backend endpoint is unavailable.
 */
export async function downloadReportCsv(
  endpointUrl: string,
  defaultFilename: string,
  options?: DownloadOptions,
): Promise<void> {
  const fullUrl = resolveApiUrl(endpointUrl);
  const token = getAuthToken();

  try {
    const headers: Record<string, string> = {
      Accept: 'text/csv, text/plain, application/json, */*',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // If server returned non-200, check if we have fallback data
      if (options?.fallbackHeaders && options.fallbackRows) {
        exportCsvClientSide(defaultFilename, options.fallbackHeaders, options.fallbackRows);
        options.onSuccess?.(defaultFilename);
        return;
      }
      throw new Error(`Download failed with status: ${response.status} (${response.statusText})`);
    }

    // Extract filename from Content-Disposition header if available
    const disposition = response.headers.get('Content-Disposition');
    let filename = defaultFilename;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1].trim();
      }
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    options?.onSuccess?.(filename);
  } catch (error: unknown) {
    // If network error occurred, try fallback data if provided
    if (options?.fallbackHeaders && options.fallbackRows) {
      exportCsvClientSide(defaultFilename, options.fallbackHeaders, options.fallbackRows);
      options.onSuccess?.(defaultFilename);
      return;
    }

    options?.onError?.(error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

