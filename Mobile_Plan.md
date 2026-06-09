# HandPocket Mobile — Phased Port Plan

## Context

HandPocket's web app (v0.1, Faz 1–8.1) is **frozen and demo-ready**. The backend (FastAPI + Supabase, JWT/REST) is **mobile-ready** and will **not be touched**. The goal now is a **native mobile client** (iOS + Android) that talks to the *same* backend, so any action taken on mobile (create a delivery, accept a task, etc.) appears on web automatically — they share one database. This is **data-level integration**, not shared UI code.

**Stack decision:** Expo + React Native. The web's platform-agnostic layers (`services/`, `store/auth.ts`, `lib/api.ts`, `lib/supabase.ts`, `types/index.ts`) carry over with only env-access changes; the DOM/Tailwind/Mapbox-GL UI is rebuilt natively.

**Hard constraints**
- ❌ Do not modify `backend/`, the database, or `frontend/` (web). Mobile lives in a new sibling dir on the `mobile` branch.
- ❌ Web is frozen → we **cannot** extract a shared workspace package (that edits web). **Decision (locked): COPY** the client-layer TS files (`services/`, `store/auth.ts`, `lib/api.ts`, `types/`) into mobile rather than share them. Web stays 100% untouched. Divergence risk is near-zero today because **both backend and web are frozen** — these thin wrappers aren't changing. Revisit a shared monorepo package only if web ever unfreezes *and* the backend starts evolving actively.
- ⚠️ **Push (FCM)** is the one feature that *requires* a backend column (`users.fcm_token`) + endpoint. It is deferred to Phase F and explicitly flagged as needing a backend exception. Until then, in-app polling (already built) works unchanged.

**Where it lives:** `HP-Mobile/mobile/` (new top-level dir, committed to the `mobile` branch). `frontend/` and `backend/` stay put, untouched.

---

## Port Mapping (web → mobile)

| Web | Mobile | Reuse |
|-----|--------|-------|
| `services/*.ts` | same | **Copy as-is** (plain axios) |
| `store/auth.ts` | same | Copy; swap Supabase storage adapter |
| `lib/api.ts` | same | Copy; `import.meta.env` → `process.env.EXPO_PUBLIC_*` |
| `lib/supabase.ts` | same | Copy; add SecureStore adapter + `detectSessionInUrl:false` |
| `types/index.ts` | same | **Copy as-is** |
| `react-router-dom` | `expo-router` | Rebuild routing |
| Tailwind v4 classes | `nativewind` | Rebuild styles (not 1:1) |
| `mapbox-gl` | `@rnmapbox/maps` | Rebuild map; Nominatim/OSRM `fetch` logic reusable |
| `lucide-react` | `lucide-react-native` | Drop-in icon swap |
| `html.dark` + CSS dark mode | NativeWind `dark:` / theme ctx | Rebuild mechanism |
| `NotificationBell` 60s polling | native header bell, same polling | Reuse service, rebuild UI |

---

## Phase A — Foundation (scaffold + shared layers)

- **A-1 — Scaffold.** `npx create-expo-app@latest mobile -t` (TypeScript, expo-router tabs template) inside `HP-Mobile/`. Confirm `mobile/` is on the `mobile` branch worktree.
- **A-2 — Install stack.** `nativewind` + `tailwindcss`, `@supabase/supabase-js`, `axios`, `zustand`, `expo-secure-store`, `lucide-react-native`, `@rnmapbox/maps`, `expo-location`, `expo-image-picker`/`expo-camera`. Configure `babel.config.js` (nativewind preset), `tailwind.config.js`, `metro.config.js`, `nativewind-env.d.ts`.
- **A-3 — Theme tokens.** Port the blue palette (`--color-primary-blue #08b4fb`, secondary/tertiary/dark/darker) + fonts into `tailwind.config.js` so NativeWind classes (`bg-primary-blue`, etc.) match web naming.
- **A-4 — Env.** `.env` with `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_URL`; gitignore it. Same Supabase project as web.
- **A-5 — Port platform-agnostic layers.** Copy `types/index.ts` and `services/*` verbatim. Copy `lib/api.ts` swapping `import.meta.env.VITE_API_URL` → `process.env.EXPO_PUBLIC_API_URL`. Copy `lib/supabase.ts` adding the **SecureStore storage adapter** + `auth: { storage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false }`.
- **A-6 — Port auth store.** Copy `store/auth.ts` (Zustand is identical on RN). Verify `initialize()` works with the new persisted-session adapter.

**Exit check:** app boots on a simulator, `api` client can hit `EXPO_PUBLIC_API_URL/health`.

## Phase B — Auth & Navigation Shell

- **B-1 — SecureStore session.** Finish the supabase SecureStore adapter (`getItem/setItem/removeItem`); verify token survives app restart.
- **B-2 — Router layout.** `expo-router` groups: `(auth)` (login/register/forgot) and `(tabs)` (role-based). Root `_layout.tsx` runs `useAuthStore.initialize()` and gates `(auth)` vs `(tabs)` on `isLoggedIn`.
- **B-3 — Route guards.** Port web's `PrivateRoute`/`SenderRoute`/`CourierRoute`/`AdminRoute` logic as a redirect guard in layouts, keyed on `isLoggedIn` + `role`.
- **B-4 — Login / Register screens.** Port `AuthPage` flows (`signIn`, `signUp` → `POST /users`) to native forms.
- **B-5 — Forgot password.** Port `ForgotPasswordPage` (currently mock on web; keep parity, mark for later real `resetPasswordForEmail`).

**Exit check:** register → login → land on role-correct tabs; kill/reopen app stays logged in.

## Phase C — Sender Screens

- **C-1 — Home.** Landing + "create delivery" CTA.
- **C-2 — Create request** (`RequestPage`). `@rnmapbox/maps` map, form (description, pickup/delivery, weight, urgency, optional photo). Reuse price formula `distance_km × weight_kg × open_time_multiplier` and the pre-submit **balance check** (`wallet_balance >= price`, 402 handling, `refreshUser()`).
- **C-3 — Deliveries list.** Port `ProfilePage` Teslimatlar tab tables (active / pending / completed / failed; 7-day history split) as native sections.
- **C-4 — Delivery detail** (`delivery/[id]`). Status timeline + proof photo + **sender confirmation** (`verifyTask`) + **dispute** (`createDispute`) + **review** (`createReview`).
- **C-5 — Tracking** (`tracking/[id]`). 15s `getLatestLocation` polling, live courier marker, ETA.
- **C-6 — Wallet.** `getWalletSummary`, deposit/withdraw modals (`deposit`/`withdraw` + `refreshUser`).

## Phase D — Courier Screens

- **D-1 — Jobs** (`RecieverPage`). `getOpenTasks` list + map + detail panel + `acceptTask` → navigation.
- **D-2 — Navigation** (`NavigationPage`). Turn-by-turn (OSRM), `expo-keep-awake`, **live location push** via `expo-location` `watchPositionAsync` → throttled `postLocation` (30s), status-gated to `accepted|picked_up`.
- **D-3 — Proof of delivery.** Full-screen `expo-camera`/`expo-image-picker` → upload to Supabase Storage `delivery-proofs` (best-effort) → `setProofPhoto` → status `picked_up`→`delivered` → `refreshUser`.

## Phase E — Profile & Notifications (cross-role)

- **E-1 — Profile.** Merge Settings/Security/Preferences into native screens; avatar via image picker; `updateProfile`, `deleteAccount`.
- **E-2 — Notification bell.** Native header bell reusing `notificationService` (`getUnreadCount` 60s polling, `getNotifications`, `markRead`, deep-link to `delivery/{id}`). Respect tab-visibility pause like web.
- **E-3 — Dark mode.** Theme toggle backed by NativeWind `dark:` + persisted preference (SecureStore/AsyncStorage), replacing web's `html.dark` mechanism.

## Phase F — Push Notifications (FCM) ⚠️ needs backend exception

> Deferred; the **only** phase touching backend. Get explicit go-ahead before starting.
- **F-1 — Backend (exception):** add `users.fcm_token` column + `POST /users/me/fcm-token`; in `services/notify.py safe_notify`, fire FCM after DB insert (best-effort).
- **F-2 — Mobile:** `expo-notifications` — request permission, get token → `POST /users/me/fcm-token`; foreground banner; background tap → deep-link `delivery/{id}`.
- **F-3 — Preferences:** wire push toggle to a real `notify_push` pref.

## Phase G — Mobile-specific polish

- **G-1** Background location (courier) — `expo-location` background mode.
- **G-2** Biometric login — `expo-local-authentication`.
- **G-3** Haptics on accept/deliver/error.
- **G-4** Deep linking — `handpocket://delivery/{id}` + universal/app links.
- **G-5** Offline cache — `zustand persist` for last-fetched lists.

> **Release (App Store / Play Store) is explicitly out of scope** — this project will not be published.

---

## Risks / Notes

- **Logic divergence (the cost of the COPY decision):** two copies of the thin client wrappers exist. If a backend contract changes (new field, renamed endpoint), both copies must be updated; updating only one makes mobile and web behave differently against the same backend. Mitigation: keep copies byte-identical; both backend + web are frozen so this is near-zero risk now. The single backend + single database remain shared — copying only duplicates client-side wrappers, never data.
- **Supabase RN auth:** must use SecureStore adapter + `detectSessionInUrl:false`, else session won't persist / will error.
- **Mapbox native:** `@rnmapbox/maps` needs a config plugin + a dev build (not Expo Go) and a Mapbox download token. Plan a dev-client build at A-2.
- **NativeWind ≠ Tailwind 1:1:** flex defaults differ (RN is `flex-col` by default); layouts are rebuilt, not copy-pasted.
- **FCM is the hard backend boundary** — everything A–E ships with zero backend changes.

## Verification (per phase)

- **A/B:** boot on iOS sim + Android emulator; `/health` reachable; register→login→persist-across-restart.
- **C/D end-to-end (two accounts, web + mobile cross-check):** sender creates on mobile → courier sees it on web *and* mobile (`getOpenTasks`) → accept → live track (mobile sender sees moving marker) → proof upload → sender verify → wallet credited → notifications fire on both clients.
- **E:** toggle dark mode persists; bell badge increments within 60s of a triggering action.
- **F/G (when reached):** push received in background → tap deep-links to `delivery/{id}`; biometric unlock works on a physical device.
