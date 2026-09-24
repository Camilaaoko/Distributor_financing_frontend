# FRONTEND FIX PLAN

**Date:** 2026-08-24
**Based on:** FRONTEND_AUDIT_VERIFIED.md (38 verified findings)
**Status:** Ready for implementation prioritization

---

## PRIORITY CLASSIFICATION

### P0 — Security / Data Exposure / Authentication (Must Fix First)
Blocks production deployment; enables unauthorized access or data leaks.

| Issue | File | Current Behavior | Desired Behavior | Frontend-Only? | Risk | Fix |
|-------|------|------------------|------------------|----------------|------|-----|
| P0-1: Auth interceptor sends token to login endpoints | src/lib/axios.ts:12-16 | url.startsWith(endpoint) fails on absolute URLs; token sent to /auth/login, /auth/forgot-password, /auth/reset-password | Only attach Authorization to authenticated endpoints | Yes | Low | Fix isUnauthenticatedEndpoint to handle absolute URLs: check config.url?.includes(endpoint) or parse pathname |
| P0-2: No middleware route protection | src/proxy.ts:9-18 | Auth check commented out; all dashboard routes accessible without login | Middleware validates JWT cookie and redirects to /login | Yes | Low | Uncomment auth check; verify token via API or decode JWT client-side |
| P0-3: USE_MOCKS defaults to true | src/lib/config.ts:12 | process.env.NEXT_PUBLIC_USE_MOCKS !== 'false' defaults to true if env var missing | Default to false; require explicit NEXT_PUBLIC_USE_MOCKS=true for mock mode | Yes | Low | Change to process.env.NEXT_PUBLIC_USE_MOCKS === 'true' |
| P0-4: Demo credentials in production login | src/app/(auth)/login/page.tsx:289-315 | 6 demo accounts with passwords visible in production build | Guard with process.env.NODE_ENV === 'development' | Yes | Low | Wrap demo credentials section in dev-only check |
| P0-5: No token refresh on 401 | src/lib/axios.ts | No response interceptor; expired JWT causes silent failures | Add 401 interceptor that attempts refresh token, then redirects to login | Yes (needs backend refresh endpoint) | Medium | Add axios response interceptor; coordinate with backend for /auth/refresh endpoint |
| P0-6: Bank portfolio requires bankId | src/services/bank.service.ts:332-334 | Throws error if no bankId; LoginResponse lacks bankId | Fetch bankId from user profile after login, or add to login response | Yes (backend must provide) | Medium | Call /api/auth/me or user profile endpoint after login to get bankId; store in AuthContext |

### P1 — Broken Production Functionality
Features that don't work in production (USE_MOCKS=false) due to missing/wrong implementations.

| Issue | File | Current Behavior | Desired Behavior | Frontend-Only? | Risk | Fix |
|-------|------|------------------|------------------|----------------|------|-----|
| P1-1: Repayments page uses wrong endpoints | src/app/(dashboard)/dealer/repayments/page.tsx + src/services/repayments.service.ts | Uses getSchedule (not in Swagger) and makeRepayment (wrong payload); Swagger endpoints implemented but unused | Rewrite page to use initiateRepayment, pproveRepayment, ejectRepayment only | Yes | High | 1. Remove getSchedule and makeRepayment from service 2. Rewrite page to use Swagger-compliant methods 3. Update UI flow for maker/checker workflow |
| P1-2: Duplicate useEffects in repayments page | src/app/(dashboard)/dealer/repayments/page.tsx | loadFacilities called 3x, loadRepayments called 3x | Single useEffect each with proper dependencies | Yes | Low | Deduplicate; keep one useEffect for facilities, one for repayments |
| P1-3: Role derived from URL pathname | src/config/nav.ts:93-98 | oleFromPathname() determines navigation; bank user can access /platform | Use user.role from AuthContext for navigation and route guards | Yes | Low | Import useAuth in Sidebar; switch on user?.role |
| P1-4: Platform service CRUD throws | src/services/platform.service.ts:322-349 | getBankAdmin, updateBankAdmin, setStatus, approveBankAdmin, deleteBankAdmin, resetPassword all throw | Implement when backend endpoints available; for now show "coming soon" or disable | Backend-dependent | Medium | Coordinate with backend; add feature flags to disable UI until ready |
| P1-5: Bank approve/reject use same endpoint | src/services/bank.service.ts:150-156 | Both POST to /api/auth/users/distributors/approve | Verify with backend; likely reject uses different endpoint or payload | Backend-dependent | Medium | Confirm with backend team; update service accordingly |
| P1-6: Onboarding getBanks missing required status | src/services/onboarding.service.ts:320 | status parameter optional; Swagger requires it | Make status required parameter | Yes | Low | Change signature to getBanks(status: BankStatus) |
| P1-7: /auth/me endpoint not in Swagger | src/services/auth.service.ts:97-100 | Calls GET /api/auth/me which doesn't exist in backend | Remove or coordinate with backend to add endpoint | Backend-dependent | Low | Remove me() method; use stored user data instead |
| P1-8: Notifications API double-path | src/services/notifications.service.ts | Base URL /api/notifications + endpoint /notifications/welcome-email = double | Verify gateway routing; adjust base URL or endpoint paths | Backend-dependent | Medium | Test against live backend; adjust if needed |

### P2 — Backend Integration Mismatches
Frontend code exists but untested against real backend; may need adjustments.

| Issue | File | Current Behavior | Desired Behavior | Frontend-Only? | Risk | Fix |
|-------|------|------------------|------------------|----------------|------|-----|
| P2-1: Auth endpoints untested (createUser, approveDistributor, activateUser, deleteUser, registerAdmins) | src/services/auth.service.ts:104-127 | Methods exist but throw "Mock not implemented" when USE_MOCKS=true | Test against live backend; remove mock throws | Backend-dependent | Medium | Set USE_MOCKS=false; test each endpoint; fix any contract mismatches |
| P2-2: Loans service untested | src/services/loans.service.ts | All endpoints match task description but untested | Test against live backend | Backend-dependent | Low | Test when backend available |
| P2-3: Notifications service 25 endpoints untested | src/services/notifications.service.ts | All endpoints implemented but untested | Test against live backend | Backend-dependent | Medium | Test when backend available |
| P2-4: Bank service getBankUsers throws | src/services/bank.service.ts:212 | Throws "Backend endpoint for listing bank users not yet implemented" | Implement when backend ready | Backend-dependent | Medium | Coordinate with backend |
| P2-5: Bank getPortfolioData throws without bankId | src/services/bank.service.ts:332-334 | Throws if bankId not available | Resolved by P0-6 (fetch bankId after login) | Backend-dependent | Medium | See P0-6 |

### P3 — UX / Reliability
User experience issues, error handling, consistency.

| Issue | File | Current Behavior | Desired Behavior | Frontend-Only? | Risk | Fix |
|-------|------|------------------|------------------|----------------|------|-----|
| P3-1: No error boundaries | (dashboard)/layout.tsx | React errors crash entire dashboard | Add ErrorBoundary component wrapping children | Yes | Low | Create ErrorBoundary component; wrap dashboard layout children |
| P3-2: Hardcoded welcome names | All 4 dashboard pages | Static strings: "Bank Admin", "Platform Admin", "Acme Manufacturing Ltd", "Nairobi Wholesale Distributors" | Use user.firstName + ' ' + user.lastName from AuthContext | Yes | Low | Import useAuth in each dashboard page; display dynamic name |
| P3-3: Password reset token not validated | src/app/(auth)/reset-password/ResetPasswordForm.tsx:16 | Token read from URL but no validation before form render | Call backend to validate token on mount; show error if invalid | Yes (needs backend endpoint) | Medium | Add useEffect on mount to validate token via API |
| P3-4: Logout doesn't clear TenantProvider | src/providers/AuthProvider.tsx + src/providers/TenantProvider.tsx | Tenant state persists after logout | Clear tenant on logout | Yes | Low | Add logout callback to TenantProvider or merge providers |
| P3-6: Duplicate StatusBadge component | src/app/(dashboard)/dealer/page.tsx:181 + drawdowns/page.tsx:95 | Same component defined twice | Extract to shared component in components/ui/ | Yes | Low | Create components/ui/StatusBadge.tsx; import in both pages |
| P3-7: Inconsistent date/currency formatting | Multiple pages | Multiple formats used inconsistently | Create formatting utilities in lib/utils.ts | Yes | Low | Add ormatCurrency, ormatDate, ormatRelativeTime utilities |
| P3-8: Unescaped apostrophe | src/app/(dashboard)/manufacturer/financing/page.tsx:257 | React warning for unescaped ' | Use &apos; or ' in JSX text | Yes | Low | Fix the string |

### P4 — Performance
Optimization opportunities.

| Issue | File | Current Behavior | Desired Behavior | Frontend-Only? | Risk | Fix |
|-------|------|------------------|------------------|----------------|------|-----|
| P4-1: All dashboard pages are "use client" | All (dashboard) pages | Every page hydrates on client; no Server Components | Convert static pages to RSC where possible | Yes | Medium | Remove 'use client' from pages that don't need interactivity; keep for interactive ones |
| P4-2: No code splitting for charts | Multiple pages | recharts imported in all dashboard bundles | Dynamic import for chart components | Yes | Low | Wrap chart components in dynamic(() => import(...), { ssr: false }) |
| P4-3: Large client components | dealer/page.tsx (814 lines), manufacturer/page.tsx (314 lines) | Monolithic components hydrate entirely | Split into smaller components; lazy load where possible | Yes | Medium | Extract sub-components; use React.memo for pure components |

### P5 — Code Quality
Lint errors, unused code, type safety.

| Issue | File | Current Behavior | Desired Behavior | Frontend-Only? | Risk | Fix |
|-------|------|------------------|------------------|----------------|------|-----|
| P5-1: 19 ESLint errors (setState in useEffect) | 9 files | Synchronous setState in useEffect triggers cascading renders | Refactor to lazy initialization or derived state | Yes | Low | Use useState(() => initialValue) for initial state; remove effects that only initialize state |
| P5-2: AuthProvider synchronous setState | src/providers/AuthProvider.tsx:21-31 | setUser/setIsLoading in useEffect | Lazy initial state from localStorage | Yes | Low | const [user, setUser] = useState(() => { const stored = localStorage.getItem('dfp_user'); return stored ? JSON.parse(stored) : null; }) |
| P5-3: useBankUsers setPage(1) in effect | src/hooks/useBankUsers.ts:53 | Resets page on filter change via effect | Use key prop on list component or derived state | Yes | Low | Add key={debouncedSearch + roleFilter + statusFilter} to list component |
| P5-4: usePlatformAdmin setPage(1) in effect | src/hooks/usePlatformAdmin.ts:68 | Same pattern | Same fix | Yes | Low | Same as P5-3 |
| P5-5: useDealerRole/useManufacturerRole any type | src/hooks/useDealerRole.ts:21, useManufacturerRole.ts:19 | setOverrideRole typed as ny | Add proper type for role override | Yes | Low | Define 	ype DealerRole = 'MAKER' | 'CHECKER' and use it |
| P5-6: 67 unused variable warnings | 20+ files | Unused Lucide icon imports, unused parameters | Remove unused imports | Yes | Low | Run 
pm run lint -- --fix for auto-fixable; manually remove rest |
| P5-7: Duplicate mapScheduleStatus | src/app/(dashboard)/dealer/repayments/page.tsx:41-54, 110-123 | Defined as useCallback and regular function | Remove duplicate | Yes | Low | Keep one definition |
| P5-8: Duplicate useCallback functions (x3) | src/app/(dashboard)/dealer/repayments/page.tsx | handleInitiateRepayment, handleAction, openActionModal defined 3 times each | Remove duplicates from lines 211-285 and 316-383 | Yes | Low | Keep only first definition (lines 135-202) |
| P5-9: Unused formatCurrency/getStatusBadge | src/app/(dashboard)/dealer/repayments/page.tsx:199,590 | Defined but never used | Remove or use in table | Yes | Low | Remove or integrate into table rendering |
| P5-10: Docker env vars baked at build time | Dockerfile:18-23 | ARG -> ENV at build; cannot change at runtime | Use runtime config or separate builds | Yes | Medium | Option A: Use Next.js runtime env (server-only). Option B: Build separate images per environment. |

---

## RECOMMENDED IMPLEMENTATION ORDER

### Week 1: Critical Security & Auth (P0)
1. **P0-1** Fix axios interceptor URL matching (30 min)
2. **P0-2** Enable middleware auth guard (1 hr)
3. **P0-3** Fix USE_MOCKS default to false (15 min)
4. **P0-4** Hide demo credentials in production (15 min)
5. **P0-5** Add 401 interceptor with refresh flow (2-4 hrs, needs backend coordination)
6. **P0-6** Fetch bankId after login for portfolio (1-2 hrs, needs backend)

### Week 2: Broken Functionality (P1)
7. **P1-1** Rewrite repayments page + service (4-6 hrs)
8. **P1-2** Deduplicate repayments page effects (30 min)
9. **P1-3** Fix role derivation from user object (1 hr)
10. **P1-4** Platform service - coordinate with backend (ongoing)
11. **P1-5** Bank approve/reject endpoint verification (30 min + backend)
12. **P1-6** Fix onboarding getBanks status param (15 min)
13. **P1-7** Remove /auth/me call (15 min)
14. **P1-8** Notifications API routing verification (1 hr + backend)

### Week 3: Backend Integration (P2) + UX (P3)
15. **P2-1** Test auth endpoints against backend (2-4 hrs)
16. **P2-2** Test loans service (1-2 hrs)
17. **P2-3** Test notifications service (2-3 hrs)
18. **P3-1** Add ErrorBoundary to dashboard layout (1 hr)
19. **P3-2** Dynamic welcome names from auth (1 hr)
20. **P3-3** Validate reset password token (1 hr + backend)
21. **P3-4** Clear tenant on logout (30 min)
22. **P3-6** Extract shared StatusBadge (30 min)
23. **P3-7** Create formatting utilities (1 hr)
24. **P3-8** Fix unescaped apostrophe (5 min)

### Week 4: Performance (P4) + Code Quality (P5)
25. **P4-1** Convert static pages to RSC (2-3 hrs)
26. **P4-2** Dynamic import charts (1 hr)
27. **P4-3** Split large components (2-3 hrs)
28. **P5-1** Fix all 19 setState-in-effect errors (2-3 hrs)
29. **P5-2** AuthProvider lazy initial state (30 min)
30. **P5-3/4** Fix useBankUsers/usePlatformAdmin page reset (1 hr)
31. **P5-5** Fix any types in role hooks (30 min)
32. **P5-6** Remove unused imports (1 hr)
33. **P5-7/8/9** Cleanup repayments page duplicates (1 hr)
34. **P5-10** Docker runtime env strategy (1-2 hrs)

---

## TESTING PROCEDURES

### For Each Fix:
1. Run 
pm run lint — verify no new errors
2. Run 
pm run build — verify compilation passes
3. Test in browser with USE_MOCKS=true
4. If backend available, test with USE_MOCKS=false
5. Verify affected user journeys work

### Critical Path Tests:
- Login with each role -> correct dashboard
- Direct URL access to /bank, /platform, /manufacturer, /dealer -> redirect to login
- Expired token -> API request -> refresh -> retry
- Logout -> login again -> clean state
- Forgot password -> reset password -> login
- Bank admin approve distributor -> verify API call
- Distributor maker repayment flow -> maker initiates, checker approves

---

## BACKEND DEPENDENCIES REQUIRING COORDINATION

1. **Token refresh endpoint** — Need /auth/refresh or similar
2. **User profile endpoint with bankId** — Need /api/auth/me or /api/users/{email} with bankId
3. **Bank approve/reject distributor** — Confirm correct endpoint for reject
4. **Platform CRUD endpoints** — GET/PUT/PATCH/DELETE /api/onboarding/banks/users/{id}
5. **Password reset token validation** — Need endpoint to validate token before form render
6. **Notifications gateway routing** — Verify base URL and path structure
7. **Reports service** — Need Swagger contract

---

## FRONTEND-ONLY FIXES (No Backend Required)

Can be implemented immediately:
- P0-1, P0-2, P0-3, P0-4
- P1-2, P1-3, P1-6, P1-7
- P3-1, P3-2, P3-4, P3-6, P3-7, P3-8
- P4-1, P4-2, P4-3
- P5-1 through P5-9
- P5-10 (architectural, no backend)

---

## RISK ASSESSMENT

| Change | Risk Level | Rollback Plan |
|--------|------------|---------------|
| Axios interceptor fix | Low | Revert axios.ts; test login flow |
| Middleware enable | Medium | Comment out auth check again; test public access |
| USE_MOCKS default | Low | Revert config.ts; verify Docker builds |
| Demo credentials hide | Zero | Revert login/page.tsx |
| Repayments rewrite | High | Feature flag; keep old page as fallback |
| Role from user object | Low | Revert nav.ts; test all role navigations |
| ErrorBoundary | Low | Remove ErrorBoundary if issues |
| Docker runtime env | Medium | Revert to build-time env; rebuild images |

---

## SUCCESS CRITERIA

- [ ] 
pm run lint = 0 errors, 0 warnings (or only acceptable warnings)
- [ ] 
pm run build = success with no TypeScript errors
- [ ] All 14 user journeys verified working (mock + real)
- [ ] Direct URL access blocked without auth
- [ ] Expired token handled gracefully with refresh
- [ ] No demo credentials in production build
- [ ] No mock data in production (USE_MOCKS=false)
- [ ] Bank portfolio loads without error
- [ ] Repayments page uses correct Swagger endpoints
- [ ] All dashboard pages show dynamic user/tenant data
