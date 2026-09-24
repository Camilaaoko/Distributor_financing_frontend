# ENDPOINT AUDIT: Frontend vs Swagger Contracts

## Overview
This audit compares every frontend API call against the actual Swagger contracts provided.

**Sources:**
- Authentication Service: `onboarding-api.json` (local file) - port 8081
- Onboarding Service: Live Swagger at `http://172.16.3.60:8082/v3/api-docs` - port 8082
- Loans Service: Task description only (no live Swagger)
- Notifications Service: Task description only (no live Swagger)
- Repayments Service: Task description only (no live Swagger)
- Reports Service: **NOT AVAILABLE**

---

## AUTHENTICATION SERVICE

### Swagger Contract (from onboarding-api.json)
Base URL: `http://172.16.3.60:8080/api` (via Gateway)

| HTTP Method | Swagger Endpoint | Request Body | Response |
|-------------|------------------|--------------|----------|
| POST | `/auth/login` | `{identifier, password}` | `{token, email, username, role, mustResetPassword}` |
| POST | `/auth/logout` | - (Auth header) | `{message, success}` |
| POST | `/auth/forgot-password` | `{email}` | `{message, success}` |
| POST | `/auth/reset-password` | `{token, newPassword}` | `{message, success}` |
| POST | `/auth/change-password` | `{newPassword, username}` | `{message, success}` |
| POST | `/users` | `{firstName, lastName, email, phoneNumber, nationalIdNumber, employeeId, role, linkedEntityId}` | `{id, firstName, lastName, email, phoneNumber, nationalIdNumber, employeeId, role, approvalStatus, active, mustResetPassword}` |
| POST | `/users/distributors/approve` | `{distributorEntityId, approved, rejectionReason}` | `{message, success}` |
| PATCH | `/users/{email}/active` | query: `active=true|false` | `{message, success}` |
| DELETE | `/users/{email}` | - | `{message, success}` |
| POST | `/auth/register-admins` | Array of `{userId, firstName, lastName, email, phoneNumber, nationalIdNumber, role, entityId, active}` | Array of `{additionalProp1, additionalProp2, additionalProp3}` |

### Frontend Implementation (src/services/auth.service.ts)

| Frontend Method | Current Endpoint | Match Status | Notes |
|-----------------|------------------|--------------|-------|
| `login()` | `POST /api/auth/login` | **MATCH** | ✓ |
| `logout()` | `POST /api/auth/logout` | **MATCH** | ✓ |
| `requestPasswordReset()` | `POST /api/auth/forgot-password` | **MATCH** | ✓ |
| `resetPassword()` | `POST /api/auth/reset-password` | **MATCH** | ✓ |
| `changePassword()` | `POST /api/auth/change-password` | **MATCH** | ✓ |
| `me()` | `GET /api/auth/me` | **NOT IN SWAGGER** | Remove or mark unavailable |
| `createUser()` | - | **MISSING** | Need to implement `POST /users` |
| `approveDistributor()` | - | **MISSING** | Need to implement `POST /users/distributors/approve` |
| `activateUser()` | - | **MISSING** | Need to implement `PATCH /users/{email}/active` |
| `deleteUser()` | - | **MISSING** | Need to implement `DELETE /users/{email}` |
| `registerAdmins()` | - | **MISSING** | Need to implement `POST /auth/register-admins` |

### Type Mismatches
- `LoginResponse` in frontend has `bankId?, bankName?` - **NOT IN SWAGGER** (remove)
- `CreateUserRequest` in frontend matches Swagger ✓
- `UserResponse` in frontend missing `approvalStatus`, `active` fields

---

## ONBOARDING SERVICE

### Swagger Contract (Live at http://172.16.3.60:8082/v3/api-docs)
Base URL: `http://172.16.3.60:8080/api/onboarding` (via Gateway)

| HTTP Method | Swagger Endpoint | Request Body | Response |
|-------------|------------------|--------------|----------|
| GET | `/banks` | query: `status` (required, enum: PENDING/ACTIVE/SUSPENDED/REJECTED) | `BankResponse[]` `{id, name, status, createdAt}` |
| POST | `/banks` | `OnboardBankRequest` `{name, branch, location}` | `BankResponse` |
| PUT | `/banks/{id}` | `UpdateBankRequest` `{name, branch, location}` | `BankResponse` |
| DELETE | `/banks/{id}` | - | - |
| PATCH | `/banks/{id}/status` | query: `status` (required, enum: PENDING/ACTIVE/SUSPENDED/REJECTED) | `BankResponse` |
| POST | `/banks/admin` | `OnboardBankAdminRequest` `{bankId, firstName, lastName, email, phoneNumber, nationalIdNumber, employeeId}` | `MessageAndResultResponseUserResponse` |
| POST | `/banks/users` | `OnboardBankUserRequest` `{firstName, lastName, email, phoneNumber, nationalIdNumber, employeeId, role}` | `MessageAndResultResponseUserResponse` |
| GET | `/banks/users` | - | `UserResponse[]` |
| GET | `/manufacturers/users` | - | `UserResponse[]` |
| POST | `/manufacturers/users` | `OnboardManufacturerUserRequest` | `MessageAndResultResponseUserResponse` |
| GET | `/manufacturers/users/{id}` | - | `UserResponse` |
| PUT | `/manufacturers/users/{id}` | `UpdateManufacturerUserRequest` | `UserResponse` |
| PATCH | `/manufacturers/users/{id}` | `UpdateManufacturerUserRequest` | `UserResponse` |
| DELETE | `/manufacturers/users/{id}` | - | - |
| GET | `/distributors/users` | - | `UserResponse[]` |
| POST | `/distributors/users` | `OnboardDistributorUserRequest` | `MessageAndResultResponseUserResponse` |
| GET | `/distributors/users/{id}` | - | `UserResponse` |
| PUT | `/distributors/users/{id}` | `UpdateDistributorUserRequest` | `UserResponse` |
| PATCH | `/distributors/users/{id}` | `UpdateDistributorUserRequest` | `UserResponse` |
| DELETE | `/distributors/users/{id}` | - | - |
| GET | `/distributors/recommendations` | - | `DistributorRecommendationResponse[]` |
| POST | `/distributors/recommendations` | `RecommendDistributorRequest` `{distributorName, email, phoneNumber}` | `DistributorRecommendationResponse` |
| POST | `/distributors/recommendations/review` | `ReviewDistributorRequest` `{recommendationId, approve, rejectionReason}` | `MessageAndResultResponseDistributorRecommendationResponse` |

### Frontend Implementation (src/services/onboarding.service.ts)

| Frontend Method | Current Endpoint | Match Status | Notes |
|-----------------|------------------|--------------|-------|
| `getBanks(status?)` | `GET /api/onboarding/banks` | **MISMATCH** | `status` is required in Swagger, optional in frontend |
| `createBank()` | `POST /api/onboarding/banks` | **MATCH** | ✓ |
| `updateBank()` | `PUT /api/onboarding/banks/{id}` | **MATCH** | ✓ |
| `deleteBank()` | `DELETE /api/onboarding/banks/{id}` | **MATCH** | ✓ |
| `setBankStatus()` | `PATCH /api/onboarding/banks/{id}/status` | **MATCH** | ✓ (sends null body with query param) |
| `createBankAdmin()` | `POST /api/onboarding/banks/admin` | **MATCH** | ✓ |
| `createBankUser()` | `POST /api/onboarding/banks/users` | **MATCH** | ✓ |
| `getDistributorRecommendations()` | `GET /api/onboarding/distributors/recommendations` | **MATCH** | ✓ |
| `createDistributorRecommendation()` | `POST /api/onboarding/distributors/recommendations` | **MATCH** | ✓ |
| `reviewDistributorRecommendation()` | `POST /api/onboarding/distributors/recommendations/review` | **MATCH** | ✓ |
| `getManufacturerUsers()` | `GET /api/onboarding/manufacturers/users` | **MATCH** | ✓ |
| `getManufacturerUser(id)` | `GET /api/onboarding/manufacturers/users/{id}` | **MATCH** | ✓ |
| `createManufacturerUser()` | `POST /api/onboarding/manufacturers/users` | **MATCH** | ✓ |
| `updateManufacturerUser()` | `PUT /api/onboarding/manufacturers/users/{id}` | **MATCH** | ✓ |
| `patchManufacturerUser()` | `PATCH /api/onboarding/manufacturers/users/{id}` | **MATCH** | ✓ |
| `deleteManufacturerUser()` | `DELETE /api/onboarding/manufacturers/users/{id}` | **MATCH** | ✓ |
| `getDistributorUsers()` | `GET /api/onboarding/distributors/users` | **MATCH** | ✓ |
| `getDistributorUser(id)` | `GET /api/onboarding/distributors/users/{id}` | **MATCH** | ✓ |
| `createDistributorUser()` | `POST /api/onboarding/distributors/users` | **MATCH** | ✓ |
| `updateDistributorUser()` | `PUT /api/onboarding/distributors/users/{id}` | **MATCH** | ✓ |
| `patchDistributorUser()` | `PATCH /api/onboarding/distributors/users/{id}` | **MATCH** | ✓ |
| `deleteDistributorUser()` | `DELETE /api/onboarding/distributors/users/{id}` | **MATCH** | ✓ |

### NOT IN SWAGGER (Frontend throws errors - correct behavior)
| Frontend Method | Current Behavior | Notes |
|-----------------|------------------|-------|
| `submitBusinessInfo()` | Throws "not available" | Not in Swagger - **KEEP AS IS** |
| `submitApplication()` | Throws "not available" | Not in Swagger - **KEEP AS IS** |
| `getStatus()` | Throws "not available" | Not in Swagger - **KEEP AS IS** |
| `getManufacturers()` | Throws "not available" | Not in Swagger - **KEEP AS IS** |

### Type Mismatches
- `Bank` type in frontend has `shortCode?, adminCount?, status: 'Active'|'Inactive'|'PENDING'|'ACTIVE'|'SUSPENDED'|'REJECTED'` - Swagger `BankResponse` only has `id, name, status(PENDING|ACTIVE|SUSPENDED|REJECTED), createdAt` - **NO branch, location, shortCode, adminCount**
- `Bank` status enum includes `'Active'|'Inactive'` - Swagger only has `PENDING|ACTIVE|SUSPENDED|REJECTED`

---

## LOANS SERVICE

### Swagger Contract (from task description)
Base URL: `http://172.16.3.60:8080/api`

| HTTP Method | Swagger Endpoint | Request Body | Response |
|-------------|------------------|--------------|----------|
| GET | `/api/loans/credit-limits` | - | `CreditFacility[]` |
| GET | `/api/loans/credit-limits/{facilityId}` | - | `CreditFacility` |
| POST | `/api/loans/drawdowns` | `{facilityId, amount, purpose}` | `DrawdownRequest` |
| GET | `/api/loans/drawdowns?facilityId=` | - | `DrawdownRequest[]` |
| POST | `/api/loans/drawdowns/{drawdownId}/approve` | - | `DrawdownRequest` |

### Frontend Implementation (src/services/loans.service.ts)

| Frontend Method | Current Endpoint | Match Status | Notes |
|-----------------|------------------|--------------|-------|
| `listCreditLimits()` | `GET /api/loans/credit-limits` | **MATCH** | ✓ |
| `getCreditLimit(id)` | `GET /api/loans/credit-limits/{facilityId}` | **MATCH** | ✓ |
| `requestDrawdown()` | `POST /api/loans/drawdowns` | **MATCH** | ✓ |
| `listDrawdowns(facilityId?)` | `GET /api/loans/drawdowns?facilityId=` | **MATCH** | ✓ |
| `approveDrawdown(id)` | `POST /api/loans/drawdowns/{drawdownId}/approve` | **MATCH** | ✓ |

**All Loans endpoints MATCH the Swagger contract.** No changes needed.

---

## NOTIFICATIONS SERVICE

### Swagger Contract (from task description)
Base URL: `http://172.16.3.60:8080/api/notifications`

**In-App Notifications:**
| HTTP Method | Swagger Endpoint | Request Body | Response |
|-------------|------------------|--------------|----------|
| GET | `/notifications/in-app/{email}` | - | `InAppNotification[]` `{id, title, message, read, createdAt}` |
| PATCH | `/notifications/in-app/{id}/read` | - | - |

**Email/Push Notifications (25 endpoints):**
All POST endpoints returning `{message, result: {}}`:
- `/notifications/welcome-email`
- `/notifications/repayment-rejected`
- `/notifications/repayment-initiated`
- `/notifications/repayment-disbursed`
- `/notifications/password-reset-link`
- `/notifications/password-reset-confirmation`
- `/notifications/password-changed`
- `/notifications/manufacturer-recommendation-outcome`
- `/notifications/loan-request-submitted`
- `/notifications/loan-action-rejected`
- `/notifications/funds-disbursed`
- `/notifications/funds-disbursed-confirmation-needed`
- `/notifications/distributor-rejected`
- `/notifications/distributor-recommended`
- `/notifications/distributor-checker-approved`
- `/notifications/distributor-approved`
- `/notifications/disbursement-confirmed`
- `/notifications/disbursement-awaiting-approval`
- `/notifications/bank-repayment-review-needed`
- `/notifications/bank-repayment-rejected`
- `/notifications/bank-repayment-received`
- `/notifications/bank-repayment-approved`
- `/notifications/bank-checker-approved`
- `/notifications/bank-admin-recommendation`

### Frontend Implementation (src/services/notifications.service.ts)

| Frontend Method | Current Endpoint | Match Status | Notes |
|-----------------|------------------|--------------|-------|
| `list(email)` | `GET /api/notifications/in-app/{email}` | **MATCH** | ✓ |
| `markRead(id)` | `PATCH /api/notifications/in-app/{id}/read` | **MATCH** | ✓ |

### MISSING (25 notification endpoints)
All 25 notification POST endpoints are **MISSING** from frontend.

---

## REPAYMENTS SERVICE

### Swagger Contract (from task description)
Base URL: `http://172.16.3.60:8080/api`

| HTTP Method | Swagger Endpoint | Request Body | Response |
|-------------|------------------|--------------|----------|
| POST | `/repayments/initiate` | `{makerId, facilityId, amount, notes}` | Full repayment object with `status: PENDING_CONFIRMATION` |
| POST | `/repayments/{id}/approve` | `{checkerId, notes}` | - |
| POST | `/repayments/{id}/reject` | `{checkerId, reason, notes}` | - |

### Frontend Implementation (src/services/repayments.service.ts)

| Frontend Method | Current Endpoint | Match Status | Notes |
|-----------------|------------------|--------------|-------|
| `getSchedule(facilityId)` | `GET /api/repayments/schedule/{facilityId}` | **NOT IN SWAGGER** | Remove or mark unavailable |
| `makeRepayment(payload)` | `POST /api/repayments` | **MISMATCH** | Swagger uses `/repayments/initiate` with different payload |

### Type Mismatches
- Frontend `MakeRepaymentPayload`: `{facilityId, scheduleId, amount}`
- Swagger `InitiateRepaymentRequest`: `{makerId, facilityId, amount, notes}`
- Frontend expects `scheduleId` - **NOT IN SWAGGER**
- Swagger requires `makerId` - **MISSING IN FRONTEND**

---

## REPORTS SERVICE

**NOT AVAILABLE** - No Swagger contract provided.
- Current `src/services/reports.service.ts` has `getPortfolioSummary()` and `getRiskReport()` - **REMOVE or mark unavailable**

---

## SUMMARY OF REQUIRED ACTIONS

### P0 - Critical (Must Fix)

| Service | Action |
|---------|--------|
| **Auth** | Remove `me()` method; Add missing endpoints (`createUser`, `approveDistributor`, `activateUser`, `deleteUser`, `registerAdmins`); Fix `LoginResponse` type |
| **Axios** | Fix interceptor to NOT attach Authorization to unauthenticated endpoints; Create separate notifications client |
| **Notifications** | Implement all 25 notification POST endpoints; Use separate base URL |
| **Repayments** | Rewrite to match Swagger (`/repayments/initiate`, `/repayments/{id}/approve`, `/repayments/{id}/reject`); Fix types |
| **Onboarding** | Fix `getBanks()` - make `status` required parameter |
| **Reports** | Remove or mark all methods as unavailable |
| **Environment** | Fix `.env.example` to match actual variable names; Add `NEXT_PUBLIC_NOTIFICATIONS_API_URL` |

### P1 - High

| Service | Action |
|---------|--------|
| **Types** | Update all types to match Swagger exactly (remove extra fields, fix enums) |
| **Auth** | Add `registerAdmins`, `createUser`, `approveDistributor`, `activateUser`, `deleteUser` |
| **Notifications** | Add all 25 notification POST methods |
| **Repayments** | Complete rewrite with correct endpoints and types |
| **Auth Types** | Fix `LoginResponse` (remove bankId/bankName), add `UserResponse` with `approvalStatus`, `active` |

### P2 - Medium

| Service | Action |
|---------|--------|
| **Axios** | Create separate notifications API client |
| **Environment** | Fix `.env.example` to match actual usage |
| **Dealer Repayments Page** | Update to use new repayments service |

---

## PROPOSED IMPLEMENTATION ORDER

1. **Fix Environment & Config** - `.env.example`, `config.ts`, `axios.ts` (two clients)
2. **Update Types** - `src/lib/types.ts` with all Swagger-matched types
3. **Auth Service** - Fix existing + add missing endpoints
3. **Axios** - Fix interceptor + create notifications client
4. **Notifications Service** - Complete implementation (25 endpoints + in-app)
5. **Repayments Service** - Complete rewrite
6. **Onboarding Service** - Fix `getBanks()` status parameter
6. **Auth Service** - Add missing endpoints
7. **Reports Service** - Mark unavailable
7. **Environment** - Fix `.env.example`, `config.ts`
8. **Dealer Repayments Page** - Update to use new service
8. **Run lint & build** - Fix all errors