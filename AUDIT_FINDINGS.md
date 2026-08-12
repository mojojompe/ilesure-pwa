# ilesure-pwa (Renter PWA) — Detailed Audit Findings

**Date:** 2026-08-12 · Vite/React PWA (@paystack/inline-js, @react-oauth/google, react-signature-canvas, zustand) · Read-only, no code modified.
See the root [PROJECT_AUDIT.md](../PROJECT_AUDIT.md) for the cross-layer summary.

> **Design positive up front:** every *wired* payment path is server-authoritative — the client sends only IDs (`bookingId`/`listingId`/`tierId`) and redirects to the backend's Paystack `authorizationUrl`. `@paystack/inline-js` is installed but never used with a client amount, and **no Paystack secret key** exists in the frontend. The problems below are token handling, client-trust, and a large amount of **mocked/placeholder flows shipped as if real**.

**Totals (PWA-scoped): Critical 1 · High 5 · Medium 5 · Low 4.**

---

## CRITICAL

### P-C1. KYC identity verification is fully mocked and marks the user "verified" on the client
- **Category:** Route-protection / Client-trust · **Location:** `src/pages/booking/KYC.tsx:48-63`
- **Defect:** The NIN/BVN "Verify with Dojah" buttons call no backend. After a 2s timer they set local state **and mutate the persisted auth store**: `setUser({ ...user, ninVerified: true })`. `fetchStatus()`/`handleSync()` are also mocked; `kycService` is imported-but-commented.
- **Impact:** Any user reaches "All verifications complete! You can now proceed to book" with zero identity data. A KYC/AML bypass on a money platform if the backend trusts client flags — and the backend `/kyc/verify` independently fails to bind the reference to the caller (backend D-C1), so the whole gate is defeatable end to end.
- **Fix:** Wire NIN/BVN to the real Dojah widget + `kycService`; derive `ninVerified/bvnVerified` only from a server response.

---

## HIGH

### P-H1. Access **and refresh** JWTs stored in localStorage — XSS-stealable, persistent takeover
- **Category:** Token-storage / XSS · **Location:** `src/api/client.ts:70-113`, `src/stores/authStore.ts:44-84` (zustand `persist`→`localStorage`, key `ilesure_pwa_auth`)
- **Defect:** Both tokens live in `localStorage`. · **Impact:** Any XSS / malicious dependency / extension exfiltrates both with one line; the refresh token gives durable, renewable access that survives victim logout. · **Fix:** httpOnly+Secure+SameSite cookies (backend-set); keep only non-sensitive profile in JS-readable storage.

### P-H2. Plaintext email, password, and JWTs written to `console` in the auth service
- **Category:** Secret-exposure · **Location:** `src/api/authService.ts:104-113`
- **Defect:** `console.log('[AuthService] POST /auth/login', data)` logs `{email,password}`; the response log dumps `accessToken`+`refreshToken`; `googleLogin` logs the Google `id_token`. No build-time stripping. · **Impact:** Credentials/tokens land in console + any telemetry that captures it (Sentry breadcrumbs, session-replay, shared-device history); compliance failure. · **Fix:** Remove all credential/token logs; gate remaining behind `import.meta.env.DEV`.

### P-H3. Public-route allowlist mismatch breaks the entire onboarding/registration/OTP/forgot-password flow
- **Category:** Flow-mismatch / Route-protection · **Location:** `src/api/authContext.tsx:24-41` vs routes in `src/App.tsx:57-97`
- **Defect:** The guard treats only `['/login','/register','/auth','/','/verify-otp','/reset-password']` as public (exact match), but the real logged-out routes are `/onboarding`, `/auth/choice`, `/auth/role`, `/auth/school`, `/auth/forgot-password`, `/auth/otp`. None match (`/auth` is exact, not a prefix; `/verify-otp` & `/reset-password` don't exist). · **Impact:** A logged-out user tapping "Create One" → `/auth/role` is bounced to `/login`; onboarding, school selection, forgot-password, and post-register OTP are all broken for their intended users. · **Fix:** Prefix-match (`pathname.startsWith('/auth')`), add `/onboarding`, align with the route table.

### P-H4. Booking "Payment" screen self-reports success with a hardcoded amount and never verifies
- **Category:** Payment-integrity / Flow-mismatch · **Location:** `src/pages/booking/Payment.tsx:25-66` (route `/booking/payment/:id`, from `Signature.tsx:69`)
- **Defect:** No Paystack, no `/payments/verify`; a `setTimeout` sets `{ status:'completed', amount:1550000, reference:'PAY_MOCK_12345' }` and renders "Payment Successful!". A second, parallel path that diverges from the real `ListingDetail.handlePayment → payForBooking → redirect`. · **Impact:** Users completing Checkout → Signature → Payment see a confirmed, paid booking that never touched Paystack or the backend. · **Fix:** Replace the mock with initiate→redirect→verify.

### P-H5. Paystack callback URL points to a non-existent route → real payments can't be verified in-app
- **Category:** Flow-mismatch / Payment-integrity · **Location:** `src/api/bookingService.ts:172-174` & `src/api/sharedBookingService.ts:120-122` set `callbackUrl: origin + '/payment/callback'`; `src/App.tsx:56-99` defines **no** `/payment/callback` route.
- **Defect:** After the real redirect, Paystack returns to `{origin}/payment/callback`, which falls through to `<Route path="*" element={<NotFound/>}>`. · **Impact:** The genuine payment path lands on a 404 with no client `verify(reference)`; confirmation depends entirely on the webhook. · **Fix:** Add `/payment/callback` reading `reference` → `paymentService.verifyPayment` (mirror WEB-APP's `PaymentCallback.tsx`).

---

## MEDIUM
- **P-M1** `paymentService.initializePayment` contract accepts a client-supplied `amount` — `src/api/paymentService.ts:3-10,111-114`. Not currently called, but latent amount-tampering the moment it's wired (backend must reject client amounts).
- **P-M2** Role used for route authorization read from client-controlled storage — `src/api/authContext.tsx:30-38` (a crafted `localStorage` role renders a different shell; data safe only if backend enforces role on every route).
- **P-M3** `.gitignore` does not ignore `.env` — omits `.env`/`.env.*` (only `*.local`); WEB-APP correctly lists `.env`. Invites committing a future sensitive `VITE_*` value. Fix: add `.env`/`.env.*` (keep `!.env.example`).
- **P-M4** Contract e-signature flow is mocked — `src/pages/booking/Signature.tsx:25-71` (`contractService` commented); `handleSign` never reads the canvas or calls `signTenancyAgreement`; a `setTimeout` navigates on. No legal artifact recorded. Once wired, the server must bind the signature to the authenticated tenant+bookingId and store an immutable executed PDF (not trust a raw client image).
- **P-M5** Verbose request/response `console` logging leaks user data in production — `authService.ts:104-124`, `socketService.ts:43`; no `drop_console` in the Vite config. Fix: `esbuild.drop:['console']` for prod.

## LOW
- **P-L1** "Sign in with Google" is dead; `GoogleOAuthProvider` falls back to `dummy_client_id.apps.googleusercontent.com`; `googleLogin` unwired — `Login.tsx:153-167`, `main.tsx:9-14`, `authService.ts:110-114`. When implemented, backend must verify the `id_token` aud/iss/signature/expiry.
- **P-L2** Booking-summary "Total to Pay" trusted from a mock-augmented client object — `Checkout.tsx:26-40,132-147` spreads `{ paymentFrequency:'annually', isShortlet:false, roommateMatchingFee:0 }` over the server response (display only; actual charge from `payForBooking`).
- **P-L3** Leftover Vite template files using `innerHTML` — `src/main.ts:7`, `src/counter.ts:5` (static content, not imported by `main.tsx` — dead). Delete.
- **P-L4** `SchoolSelection` sets `innerHTML` from an image `onError` handler — `SchoolSelection.tsx:155` (static emoji, no injection; fragile React anti-pattern).

---

## Verified OK (PWA)
- Server-authoritative payment initiation in all real paths; `@paystack/inline-js` never used with a client amount; **no Paystack secret key** in the frontend (only `VITE_PAYSTACK_PUBLIC_KEY`, `config.ts:4`).
- Socket auth uses the handshake `auth` payload, not the URL; the axios interceptor attaches `Authorization` only to the app's own base URL (no analytics leak).

**Backend items to confirm (client can't guarantee):** `/payments/initialize` must reject client `amount`; every role-scoped/booking endpoint must enforce authz server-side; KYC must be re-validated server-side (backend D-C1); `/auth/google-login` must verify the Google `id_token`.
