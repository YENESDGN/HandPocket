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

## Phase A — Foundation ✅ Done

- **A-1 — Scaffold.** `npx create-expo-app@latest mobile -t` (TypeScript, expo-router tabs template) inside `HP-Mobile/`. Confirm `mobile/` is on the `mobile` branch worktree.
- **A-2 — Install stack.** `nativewind` + `tailwindcss`, `@supabase/supabase-js`, `axios`, `zustand`, `expo-secure-store`, `lucide-react-native`, `expo-location`, `expo-image-picker`/`expo-camera`. Configure `babel.config.js` (nativewind preset), `tailwind.config.js`, `metro.config.js`, `nativewind-env.d.ts`. Note: `@rnmapbox/maps` deferred to Phase G (requires dev build).
- **A-3 — Theme tokens.** Blue palette (`primary-blue #08b4fb`, secondary/tertiary/dark/darker) added to `tailwind.config.js`.
- **A-4 — Env.** `.env` with `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_URL`; gitignored.
- **A-5 — Port platform-agnostic layers.** `types/index.ts`, all 7 services, `api.ts` (`import.meta.env` → `process.env.EXPO_PUBLIC_*`), `supabase.ts` (SecureStore adapter + `detectSessionInUrl:false`).
- **A-6 — Port auth store.** `store/auth.ts` Zustand; `localStorage` → SecureStore.

## Phase B — Auth & Navigation Shell ✅ Done

- **B-1 — SecureStore session.** SecureStore adapter complete; `Platform.OS !== 'web'` guard added.
- **B-2 — Router layout.** `(auth)` + `(tabs)` groups; root `_layout.tsx` runs `initialize()`, loading spinner until ready.
- **B-3 — Route guards.** `isLoggedIn` redirect in `(tabs)/_layout.tsx`; role-based tab visibility (`href: null` for courier on deliveries tab).
- **B-4 — Login / Register.** `signIn`, `signUp → POST /users`, Gönderici/Kurye selector, error banner, loading spinner.
- **B-5 — Forgot password.** `resetPasswordForEmail`, success state.

## Phase C — Sender Screens ✅ Done

- **C-1 — Home** (`(tabs)/index.tsx`). Balance card (→ `/wallet`), Teslimat Oluştur CTA, last-3 tasks list.
- **C-2 — Create request** (`delivery/create.tsx`). Form + Nominatim geocoding + OSRM distance/time + price formula + balance check + 402 handling + image upload (best-effort). `autoCorrect={false}` + `autoCapitalize="words"` on address fields (Turkish character fix). Map deferred to Phase G.
- **C-3 — Deliveries list** (`(tabs)/deliveries.tsx`). 4 sections (active/pending/completed/failed), 7-day collapsible history, pull-to-refresh. `ACTIVE_STATUSES` includes `'delivered'` so tasks don't vanish while awaiting sender confirmation. Tab visible for both roles; couriers tapping an active task are routed to `/courier/navigation/[id]`.
- **C-4 — Delivery detail** (`delivery/[id].tsx`). 5-step timeline, proof photo fullscreen, `verifyTask`, `createDispute` + DisputeModal, `createReview` + ReviewModal, live tracking button.
- **C-5 — Tracking** (`delivery/tracking/[id].tsx`). 15s `getLatestLocation` polling, coordinate display, ETA, courier card. **Live map added**: `react-native-maps` `MapView` with `Marker` that tracks courier's polled location; falls back to Istanbul when location not yet available.
- **C-6 — Wallet** (`wallet.tsx`). Balance header, deposit/withdraw bottom-sheet modal, stats cards, transaction history. Refresh after transaction is fire-and-forget — prevents refresh errors from surfacing as transaction failures.

## Phase D — Courier Screens ✅ Done

- **D-1 — Jobs** (`(tabs)/index.tsx` courier branch). `getOpenTasks` FlatList, pull-to-refresh, tap → bottom-sheet Modal (addresses, stats, earnings), `acceptTask` → `/courier/navigation/[id]`.
- **D-2 — Navigation** (`courier/navigation/[id].tsx`). Task fetch + Nominatim geocoding + OSRM turn-by-turn steps; `expo-keep-awake`; `watchPositionAsync` → 30s throttled `postLocation`, status-gated to `accepted|picked_up`; manual step advance (Önceki/Sonraki); Cancel → `updateTaskStatus('cancelled')` → `/(tabs)`.
  - **Map** (added): `react-native-maps` `MapView` with `Polyline` route (OSRM `[lon,lat][]` → `{latitude,longitude}[]`) + pickup Marker (dark blue) + delivery Marker (primary blue). Works in Expo Go.
  - **State machine fix**: backend requires `accepted → picked_up → delivered`; `handleProofConfirm` now checks `taskStatusRef.current === 'accepted'` and calls `picked_up` first.
  - **Re-completion guard**: `DONE_STATUSES = {'delivered','completed','cancelled','disputed'}`; when `isDeliveryDone`, action buttons are replaced by a status banner — prevents re-submitting an already-delivered task.
- **D-3 — Proof of delivery** (ProofModal embedded in navigation screen). Camera or gallery pick; upload to `delivery-proofs/{taskId}/proof.jpg` (`image/jpeg` hardcoded); `setProofPhoto` → `updateTaskStatus('delivered')` → `refreshUser()` → `/(tabs)/profile`.
- **New packages:** `expo-keep-awake`, `react-native-maps`, `react-native-webview` installed. (`react-native-webview` is installed but not used for maps — requires dev build in Expo Go.)

### Phase D — Post-session Bug Fixes
| Bug | Root cause | Fix |
|-----|-----------|-----|
| Deliveries tab hidden for couriers | `href: null` on courier | Removed; tab visible both roles |
| Courier couldn't continue active delivery | `goDetail` routed to detail page | Routes to `/courier/navigation/[id]` when role=courier + active status |
| `'delivered'` tasks vanished | Not in `ACTIVE_STATUSES` | Added `'delivered'` to set |
| Login stuck at loading spinner | `signIn` awaited `getMe()` synchronously | Two-phase: `isLoggedIn: true` immediately after Supabase; profile fetch non-blocking |
| Splash never dismissed when backend down | `initialize()` no timeout | 6s race timeout in `_layout.tsx` |
| Long hangs on unreachable backend | No axios timeout | `timeout: 8000` ms added to axios instance |
| Wallet deposit appeared to fail | `refreshUser()` timeout caught as tx error | Fire-and-forget refresh (`catch(()=>{})`) after success |
| Turkish characters broken in address fields | iOS autocorrect interfered | `autoCorrect={false}` + `autoCapitalize="words"` |
| No map in navigation screen | Was using WebView + Leaflet (needs dev build) | Replaced with `react-native-maps` |
| No map in tracking screen | Placeholder text only | Added `react-native-maps` `MapView` + polled courier `Marker` |
| Auth hero images | `bg-dark.png` / `bg-light.png` displayed | Removed; replaced with logo+title `View`; asset files deleted |

## Phase E — Profile & Notifications ✅ Done

- **E-1 — Profile** (`(tabs)/profile.tsx`). Avatar upload via `expo-image-picker` → Supabase Storage + SecureStore URL cache; edit modal (`updateProfile` — full_name, phone_number); stats card (balance, rating, phone); wallet shortcut; dark mode toggle (Sun/Moon); delete account confirmation modal (`deleteAccount` + Supabase signOut); loading states for save/delete.
- **E-2 — Notification bell** (`shared/ui/NotificationBell.tsx`). Reuses `notificationService` (`getUnreadCount` 60s polling, `getNotifications`, `markRead`, `markAllRead`); badge capped at 99+; dropdown lazy-fetches on open; tab-visibility pause (skips poll when screen hidden, fires immediately on resume); tap → `markRead` + navigate to `/delivery/{request_id}`.
- **E-3 — Dark mode** (`shared/store/theme.ts`). `useThemeStore` Zustand store + `loadSaved`/`setDark` backed by SecureStore key `hp_theme`; `useThemeColors()` hook returns full palette; `_layout.tsx` loads saved theme before first render (no flash).

## Phase F — Push Notifications (FCM) ✅ Done

- **F-1 — Backend:** `users.push_token` column added; `POST /users/me/fcm-token` endpoint (rate-limited 20/min); `services/notify.py` fires Expo Push API (`https://exp.host/--/api/v2/push/send`) in a daemon thread after each DB notification insert — best-effort, never propagates failure.
- **F-2 — Mobile:** `expo-notifications` installed; `registerPushToken()` in `auth.ts` (static import, `projectId` lookup via `expo-constants`) requests permission + uploads Expo push token after login and on `initialize()`; `_layout.tsx` sets foreground handler (`shouldShowBanner`+`shouldShowList`+sound+badge — `shouldShowAlert` removed as deprecated in SDK 56), notification-tap handler (deep-links to `/delivery/{request_id}`).
- **F-3 — Preferences:** push token is registered automatically — no separate toggle needed at this scope.

## Phase G — Mobile-specific polish ✅ Done

- **G-1** Background location — `app.json` configures `expo-location` with `isAndroidBackgroundLocationEnabled`, `isAndroidForegroundServiceEnabled`, iOS `UIBackgroundModes: ["location", "fetch"]`, and Android `ACCESS_BACKGROUND_LOCATION` permission. ⚠️ Active background tracking requires a dev build (not Expo Go); foreground tracking in `courier/navigation/[id].tsx` is unchanged and works in Expo Go.
- **G-2** Biometric login — `expo-local-authentication` installed; `login.tsx` checks hardware + enrolled state on mount; "Biyometrik Giriş" button appears when biometric is available; credentials stored in SecureStore (`hp_bio_email` / `hp_bio_pass`) on successful password login and reused on biometric success.
- **G-3** Haptics — `expo-haptics` installed; `NotificationFeedbackType.Success` on task accept + delivery complete; `.Warning` on cancel; `.Error` on any failure — wired in `(tabs)/index.tsx` and `courier/navigation/[id].tsx`.
- **G-4** Deep linking — scheme changed from `"mobile"` to `"handpocket"` in `app.json`; expo-router handles `handpocket://` scheme links automatically (no manual `Linking` handler needed — that would cause double navigation); notification tap deep-links to `/delivery/{request_id}` via `addNotificationResponseReceivedListener`.
- **G-5** Offline cache — `@react-native-async-storage/async-storage` installed; `shared/store/taskCache.ts` (Zustand persist, key `hp-task-cache`) stores `openTasks` + `myTasks`; courier home and deliveries screens seed state from cache (no loading spinner on subsequent visits) and write back on fetch.

### Phase F+G — Post-session Bug Fixes
| Bug | Root cause | Fix |
|-----|-----------|-----|
| `shouldShowAlert` TypeScript error | Deprecated in expo-notifications SDK 56; replaced by `shouldShowBanner`+`shouldShowList` | Removed `shouldShowAlert` from handler |
| `dynamic import('expo-notifications')` unreliable | Metro resolves native modules at bundle time; dynamic import inconsistent with static import in `_layout.tsx` | Replaced with static `import * as Notifications` |
| `getExpoPushTokenAsync()` throws in standalone builds | `projectId` required since SDK 53+ | Added `Constants.expoConfig?.extra?.eas?.projectId` lookup |
| `handleDeepLink` navigated to wrong route | `Linking.parse('handpocket://delivery/abc')` sets `path='abc'`, losing hostname — would navigate to `/abc` not `/delivery/abc` | Removed; expo-router handles scheme links automatically |
| Double navigation on deep link | Manual `Linking.addEventListener` fired alongside expo-router's automatic handler | Removed manual handler; expo-router is sole handler |
| Duplicate `react-native` imports in `_layout.tsx` | `Platform` imported separately from `ActivityIndicator, View` | Merged into single import |

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
