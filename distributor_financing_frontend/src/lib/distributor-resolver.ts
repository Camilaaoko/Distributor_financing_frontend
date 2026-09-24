import { apiClient } from '@/lib/axios';
import { facilitiesApi, distributorLoanProfilesApi } from '@/services/loans-api.service';
import type { Facility } from '@/types/loans';

export interface ResolvedDistributorContext {
  distributorId: string;
  facilityId?: number;
  facility?: Facility | null;
  businessName?: string;
}

/**
 * Universal canonical resolver for Distributor Entity ID & active Facility.
 * Resolves the underlying registered UUID from recommendation / user / entity records
 * and guarantees that email is NEVER used as a distributorId.
 */
export async function resolveDistributorContext(
  userEmail?: string,
  initialId?: string
): Promise<ResolvedDistributorContext> {
  const email = (userEmail || '').trim().toLowerCase();

  // 1. Check user-scoped cache or initialId if it's already a valid non-email UUID
  let candidateId = initialId && !initialId.includes('@') ? initialId : '';
  if (!candidateId && email && typeof window !== 'undefined') {
    const userScopedCached = localStorage.getItem(`dfp_dist_id_${email}`);
    if (userScopedCached && !userScopedCached.includes('@')) {
      candidateId = userScopedCached;
    }
  }

  // 2. Fetch all onboarding candidate records concurrently
  const [
    distUsersRes,
    distributorsRes,
    recsApprovedRes,
    recsMineRes,
    recsAllRes,
    profilesRes,
    facRes,
  ] = await Promise.all([
    apiClient.get<any[]>('/api/onboarding/distributors/users').catch(() => ({ data: [] })),
    apiClient.get<any[]>('/api/onboarding/distributors').catch(() => ({ data: [] })),
    apiClient.get<any[]>('/api/onboarding/distributors/recommendations/approved').catch(() => ({ data: [] })),
    apiClient.get<any[]>('/api/onboarding/distributors/recommendations/mine').catch(() => ({ data: [] })),
    apiClient.get<any[]>('/api/onboarding/distributors/recommendations').catch(() => ({ data: [] })),
    distributorLoanProfilesApi.getProfilesByStatus('ACTIVE').catch(() => null),
    facilitiesApi.getAllFacilities().catch(() => null),
  ]);

  const extractArray = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.result)) return res.result;
    return [];
  };

  const distUsers = extractArray(distUsersRes);
  const distributors = extractArray(distributorsRes);
  const recsApproved = extractArray(recsApprovedRes);
  const recsMine = extractArray(recsMineRes);
  const recsAll = extractArray(recsAllRes);
  const rawProfiles = extractArray((profilesRes as any)?.result || profilesRes);
  const activeFacilities: Facility[] = extractArray((facRes as any)?.result || (facRes as any)?.data || facRes);

  let matchedId = '';
  let matchedBusinessName = '';

  // 3. Match by email / username across user accounts (Priority 1)
  if (email) {
    const userMatch = distUsers.find((u) => {
      const uEmail = (u.email || '').toLowerCase().trim();
      const uUsername = (u.username || '').toLowerCase().trim();
      return uEmail === email || (uUsername && uUsername === email);
    });
    if (userMatch) {
      const distId = userMatch.distributorId || userMatch.entityId;
      if (distId && !distId.includes('@')) {
        matchedId = distId;
        matchedBusinessName = userMatch.businessName || userMatch.companyName || '';
      }
    }

    // Match across registered distributors (Priority 2)
    if (!matchedId) {
      const distMatch = distributors.find((d) => {
        const dEmail = (d.contactEmail || d.email || '').toLowerCase().trim();
        return dEmail === email;
      });
      if (distMatch?.id && !distMatch.id.includes('@')) {
        matchedId = distMatch.id;
        matchedBusinessName = distMatch.businessName || distMatch.name || distMatch.companyName || '';
      }
    }

    // Match across recommendations (Priority 3)
    if (!matchedId) {
      const allRecs = [...recsApproved, ...recsMine, ...recsAll];
      const recMatch = allRecs.find((r) => {
        const contact = (r.contactEmail || r.email || '').toLowerCase().trim();
        return contact === email;
      });
      if (recMatch?.id && !recMatch.id.includes('@')) {
        matchedId = recMatch.id;
        matchedBusinessName = recMatch.distributorName || recMatch.companyName || '';
      }
    }

    // Match across active profiles by email (Priority 4)
    if (!matchedId) {
      const profMatch = rawProfiles.find((p) => {
        const pEmail = (p.distributorEmail || '').toLowerCase().trim();
        return pEmail === email;
      });
      if (profMatch?.distributorId && !profMatch.distributorId.includes('@')) {
        matchedId = profMatch.distributorId;
      }
    }
  }

  // 4. If email matching didn't yield a result, check candidateId if valid non-email UUID
  if (!matchedId && candidateId && !candidateId.includes('@')) {
    matchedId = candidateId;
  }

  // 5. Match corresponding facility STRICTLY for matchedId
  let matchedFacility: Facility | null = null;
  if (matchedId && activeFacilities.length > 0) {
    matchedFacility =
      activeFacilities.find(
        (f) => String(f.distributorId) === String(matchedId) || String(f.id) === String(matchedId)
      ) || null;
  }

  // If facility not found in bulk list, attempt direct lookup by distributorId
  if (matchedId && !matchedFacility) {
    try {
      const singleFacRes = await facilitiesApi.getFacilitiesByDistributor(matchedId).catch(() => null);
      const rawFac = (singleFacRes as any)?.result || (singleFacRes as any)?.data || singleFacRes;
      if (Array.isArray(rawFac) && rawFac.length > 0) {
        matchedFacility = rawFac[0];
      } else if (rawFac && rawFac.id) {
        matchedFacility = rawFac;
      }
    } catch {
      // not found
    }
  }

  // Cache resolved non-email ID under user-specific key
  if (matchedId && !matchedId.includes('@') && email && typeof window !== 'undefined') {
    localStorage.setItem(`dfp_dist_id_${email}`, matchedId);
    localStorage.setItem('dfp_distributor_id', matchedId);
  }

  // Structured Debug Logging
  console.log('[DISTRIBUTOR_IDENTITY] Identity resolution:', {
    authenticatedUserEmail: email,
    candidateId,
    resolvedDistributorId: matchedId,
    resolvedFacilityId: matchedFacility?.id,
    facilityDistributorId: matchedFacility?.distributorId,
    facilityCreditLimit: matchedFacility?.creditLimit || matchedFacility?.totalLimit,
  });

  return {
    distributorId: matchedId,
    facilityId: matchedFacility?.id,
    facility: matchedFacility,
    businessName: matchedBusinessName,
  };
}
