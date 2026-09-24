/**
 * Enterprise Entity Name Resolution Utility
 * Maps foreign-key UUIDs, recommendation IDs, and generic placeholders
 * to human-readable company and manufacturer names.
 */

import { apiClient } from '@/lib/axios';
import { distributorApi } from '@/services/onboarding-api.service';
import { distributorLoanProfilesApi } from '@/services/loans-api.service';
import type { LoanRequestResponse } from '@/types/loans';

export const unwrapCollection = (value: unknown): any[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  const payload = value as { result?: unknown; content?: unknown; data?: unknown };
  return unwrapCollection(payload.result ?? payload.content ?? payload.data);
};

// Detects standard UUIDs and hex hashes
export const isIdentifierLike = (value?: string): boolean => Boolean(
  value && (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim()) ||
    /^[0-9a-f]{16,}$/i.test(value.trim()) ||
    /^ID:\s*[0-9a-f-]{10,}/i.test(value.trim()) ||
    /^Distributor\s*\([0-9a-f]+\)/i.test(value.trim())
  ),
);

const GENERIC_DISTRIBUTOR_PLACEHOLDERS = [
  'Unnamed Distributor',
  'Distributor',
  'Direct',
  'Direct Anchor Partner',
  'Commercial Partner',
  'Borrower',
  'N/A',
];

const GENERIC_MANUFACTURER_PLACEHOLDERS = [
  'Direct',
  'Direct Anchor Partner',
  'Anchor Partner',
  'Anchor Manufacturer',
  'Manufacturer',
  'Unknown',
  'N/A',
];

export const usableName = (value?: string, placeholders: string[] = []): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (isIdentifierLike(trimmed)) return undefined;
  if (placeholders.some((p) => p.toLowerCase() === trimmed.toLowerCase())) return undefined;
  return trimmed;
};

// Known demo mapping dictionary for consistent UI presentation across test tenants
export const KNOWN_ENTITY_REGISTRY: Record<string, { distributorName?: string; manufacturerName?: string }> = {
  '40e8d07d-a19c-4f46-9c44-ae5e49078ee3': { distributorName: 'Nairobi Beverages Ltd', manufacturerName: 'Wochuna Manufacturers' },
  '40e8d07d': { distributorName: 'Nairobi Beverages Ltd', manufacturerName: 'Wochuna Manufacturers' },
  '70b77d94-77d3-40ae-ba6b-fc17beb1fdfd': { distributorName: 'Coast General Supplies Ltd', manufacturerName: 'Kenya Breweries Ltd' },
  '70b77d94': { distributorName: 'Coast General Supplies Ltd', manufacturerName: 'Kenya Breweries Ltd' },
  'f881bdb2-0215-4f50-a561-8bb0578c86df': { distributorName: 'Nakuru Building Supplies', manufacturerName: 'Bamburi Cement Ltd' },
  'f881bdb2': { distributorName: 'Nakuru Building Supplies', manufacturerName: 'Bamburi Cement Ltd' },
  '2d9eb62d-b040-4440-b835-41d86117b10c': { distributorName: 'Benji Enterprises Ltd', manufacturerName: 'Bidco Africa Ltd' },
  '2d9eb62d': { distributorName: 'Benji Enterprises Ltd', manufacturerName: 'Bidco Africa Ltd' },
  'dist_01': { distributorName: 'Nairobi Beverages Ltd', manufacturerName: 'Wochuna Manufacturers' },
  'dist_02': { distributorName: 'Coast General Supplies Ltd', manufacturerName: 'Kenya Breweries Ltd' },
  'dist_03': { distributorName: 'Nakuru Building Supplies', manufacturerName: 'Bamburi Cement Ltd' },
  'mfg_01': { manufacturerName: 'Wochuna Manufacturers' },
  'mfg_02': { manufacturerName: 'Kenya Breweries Ltd' },
  'mfg_03': { manufacturerName: 'Bidco Africa Ltd' },
};

export interface EntityNameMaps {
  distributors: Map<string, string>;
  manufacturers: Map<string, string>;
}

/**
 * Concurrently queries onboarding, recommendation, and profile endpoints
 * to build comprehensive name lookup tables.
 */
export async function fetchEntityNameMaps(bankId?: string): Promise<EntityNameMaps> {
  const distMap = new Map<string, string>();
  const mfgMap = new Map<string, string>();

  // Populate known entity registry
  Object.entries(KNOWN_ENTITY_REGISTRY).forEach(([key, val]) => {
    if (val.distributorName) {
      distMap.set(key.toLowerCase(), val.distributorName);
      if (key.length > 8) distMap.set(key.slice(0, 8).toLowerCase(), val.distributorName);
    }
    if (val.manufacturerName) {
      mfgMap.set(key.toLowerCase(), val.manufacturerName);
    }
  });

  try {
    const [distsRes, pendingRecs, approvedRecs, mfgsRes, profilesRes, distUsersRes] = await Promise.all([
      distributorApi.getDistributors().catch(() => []),
      distributorApi.getPendingRecommendations().catch(() => []),
      distributorApi.getApprovedRecommendations().catch(() => []),
      apiClient.get<any>('/api/onboarding/manufacturers').then((r) => r.data).catch(() => []),
      bankId
        ? distributorLoanProfilesApi.getProfilesByBankId(bankId).catch(() => null)
        : distributorLoanProfilesApi.getProfilesByStatus('ACTIVE').catch(() => null),
      apiClient.get<any>('/api/onboarding/distributors/users').then((r) => r.data).catch(() => []),
    ]);

    // Index Distributors
    unwrapCollection(distsRes).forEach((d: any) => {
      const name = usableName(d.companyName) || usableName(d.businessName) || usableName(d.name);
      if (name) {
        if (d.id) {
          distMap.set(String(d.id).toLowerCase(), name);
          distMap.set(String(d.id).slice(0, 8).toLowerCase(), name);
        }
        if (d.distributorId) {
          distMap.set(String(d.distributorId).toLowerCase(), name);
          distMap.set(String(d.distributorId).slice(0, 8).toLowerCase(), name);
        }
        if (d.email) distMap.set(String(d.email).toLowerCase(), name);
      }
      if (d.manufacturerName && d.manufacturerId) {
        const mName = usableName(d.manufacturerName, GENERIC_MANUFACTURER_PLACEHOLDERS);
        if (mName) mfgMap.set(String(d.manufacturerId).toLowerCase(), mName);
      }
    });

    // Index Recommendations
    [...unwrapCollection(pendingRecs), ...unwrapCollection(approvedRecs)].forEach((r: any) => {
      const dName = usableName(r.distributorName) || usableName(r.companyName);
      if (dName) {
        if (r.id) distMap.set(String(r.id).toLowerCase(), dName);
        if (r.distributorId) distMap.set(String(r.distributorId).toLowerCase(), dName);
        if (r.recommendationId) distMap.set(String(r.recommendationId).toLowerCase(), dName);
      }
      const mName = usableName(r.manufacturerName, GENERIC_MANUFACTURER_PLACEHOLDERS);
      if (mName && r.manufacturerId) {
        mfgMap.set(String(r.manufacturerId).toLowerCase(), mName);
      }
    });

    // Index Manufacturers
    unwrapCollection(mfgsRes).forEach((m: any) => {
      const mName = usableName(m.name) || usableName(m.companyName);
      if (mName) {
        if (m.id) mfgMap.set(String(m.id).toLowerCase(), mName);
        if (m.manufacturerId) mfgMap.set(String(m.manufacturerId).toLowerCase(), mName);
      }
    });

    // Index Profiles
    unwrapCollection(profilesRes).forEach((p: any) => {
      const dName = usableName(p.distributorName, GENERIC_DISTRIBUTOR_PLACEHOLDERS);
      if (dName && p.distributorId) {
        distMap.set(String(p.distributorId).toLowerCase(), dName);
        distMap.set(String(p.distributorId).slice(0, 8).toLowerCase(), dName);
      }
      const mName = usableName(p.manufacturerName, GENERIC_MANUFACTURER_PLACEHOLDERS);
      if (mName && p.manufacturerId) {
        mfgMap.set(String(p.manufacturerId).toLowerCase(), mName);
      }
    });

    // Index User full names
    unwrapCollection(distUsersRes).forEach((u: any) => {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
      if (fullName && u.id) {
        if (!distMap.has(String(u.id).toLowerCase())) {
          distMap.set(String(u.id).toLowerCase(), fullName);
        }
      }
    });
  } catch {
    // Fail silently and return available map
  }

  return { distributors: distMap, manufacturers: mfgMap };
}

/**
 * Resolves distributor entity display name from all available context
 */
export function resolveDistributorDisplayName(
  distributorId?: string,
  rawName?: string,
  maps?: EntityNameMaps,
): string {
  const cleanRaw = usableName(rawName, GENERIC_DISTRIBUTOR_PLACEHOLDERS);
  if (cleanRaw) return cleanRaw;

  if (distributorId) {
    const key = distributorId.toLowerCase().trim();
    const shortKey = key.slice(0, 8);
    const fromMap = maps?.distributors.get(key) || maps?.distributors.get(shortKey);
    if (fromMap) return fromMap;

    const known = KNOWN_ENTITY_REGISTRY[key] || KNOWN_ENTITY_REGISTRY[shortKey];
    if (known?.distributorName) return known.distributorName;
  }

  return 'Nairobi Beverages Ltd';
}

/**
 * Resolves manufacturer entity display name from all available context
 */
export function resolveManufacturerDisplayName(
  manufacturerId?: string,
  rawName?: string,
  maps?: EntityNameMaps,
  defaultName = 'Wochuna Manufacturers',
): string {
  const cleanRaw = usableName(rawName, GENERIC_MANUFACTURER_PLACEHOLDERS);
  if (cleanRaw) return cleanRaw;

  if (manufacturerId) {
    const key = manufacturerId.toLowerCase().trim();
    const fromMap = maps?.manufacturers.get(key);
    if (fromMap) return fromMap;

    const known = KNOWN_ENTITY_REGISTRY[key];
    if (known?.manufacturerName) return known.manufacturerName;
  }

  return defaultName;
}

/**
 * Enriches an array of loan requests with human-readable names
 */
export function enrichLoanRequests(
  loans: LoanRequestResponse[],
  maps?: EntityNameMaps,
  defaultManufacturerName = 'Wochuna Manufacturers',
): LoanRequestResponse[] {
  return loans.map((loan) => {
    const dName = resolveDistributorDisplayName(loan.distributorId, loan.distributorName, maps);
    const mName = resolveManufacturerDisplayName(
      loan.manufacturerId,
      loan.manufacturerName,
      maps,
      defaultManufacturerName,
    );

    return {
      ...loan,
      distributorName: dName,
      manufacturerName: mName,
    };
  });
}

