@AGENTS.md

# HandPocket Mobile — Proje Bağlamı

## Genel
- **Tip**: React Native / Expo kargo uygulaması (web'in native portu)
- **Renk**: #08b4fb (primary-blue — web ile aynı palet)
- **Dil**: Türkçe
- **Expo SDK**: 56 — kod yazmadan önce https://docs.expo.dev/versions/v56.0.0/ oku
- **Branch**: `mobile` (git worktree — `HP-Mobile/` dizini)

## Kısıtlar
- `backend/` ve `frontend/` **dokunulmaz** — mobile branch'te bile olsa
- App Store / Play Store yayını kapsam dışı
- FCM push → Expo Push API üzerinden tamamlandı (Faz F ✅)

## Stack
| Katman | Teknoloji | Durum |
|--------|-----------|-------|
| Framework | Expo SDK 56 + expo-router | ✅ |
| Stil | NativeWind v4 + Tailwind CSS v3 | ✅ |
| Auth | @supabase/supabase-js + expo-secure-store | ✅ |
| HTTP | axios + Zustand auth store | ✅ |
| Harita | react-native-maps (Expo Go'da çalışır) | ✅ kurulu + aktif (navigation + tracking) |
| Harita (gelişmiş) | @rnmapbox/maps | ⚠️ Kurulu değil — dev build gerektirir (kapsam dışı) |
| WebView | react-native-webview | ✅ kurulu — Expo Go'da kullanılamaz (dev build gerekir) |
| Konum | expo-location | ✅ (arka plan modu app.json'da yapılandırıldı — dev build gerektirir) |
| Kamera | expo-image-picker + expo-camera | ✅ paket mevcut |
| İkonlar | lucide-react-native | ✅ |
| Push Bildirimleri | expo-notifications + Expo Push API | ✅ Faz F |
| Biyometrik | expo-local-authentication | ✅ Faz G |
| Dokunsal Geri Bildirim | expo-haptics | ✅ Faz G |
| Çevrimdışı Önbellek | zustand persist + @react-native-async-storage | ✅ Faz G |

## Mimari — Modular Monolith

```
src/
  modules/
    auth/           screens/ components/ hooks/
    delivery/       screens/ components/ hooks/   (sender akışı)
    courier/        screens/ components/ hooks/   (kurye akışı)
    wallet/         screens/ components/ hooks/
    notifications/  screens/ components/ hooks/
    profile/        screens/ components/ hooks/
  shared/
    api/
      api.ts              (axios client — EXPO_PUBLIC_API_URL)
      supabase.ts         (supabase client — SecureStore adapter)
      services/           (tüm backend çağrıları buradan)
        taskService.ts
        userService.ts
        walletService.ts
        locationService.ts
        reviewService.ts
        disputeService.ts
        notificationService.ts
    types/
      index.ts            (web'den birebir kopyalandı)
    store/
      auth.ts             (Zustand — localStorage → SecureStore)
    ui/                   (cross-module reusable components)
    hooks/                (cross-module hooks)
  app/                    (expo-router layouts + route files)
```

## Ortam Değişkenleri
```
EXPO_PUBLIC_SUPABASE_URL=https://sejyumjofcqcaatvdyam.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon jwt>
EXPO_PUBLIC_API_URL=http://<LAN_IP>:8000   ← localhost değil, makinenin LAN IP'si
```
- `.env` gitignore'da — asla commit'leme
- `sb_secret_` ve `service_role` anahtarları **asla** bu dosyaya girmez; sadece `backend/.env`
- LAN IP değişirse `.env` güncelle + `expo start --clear` ile yeniden başlat

## Backend Başlatma
```bash
cd HandPocket/backend
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```
- `--host 0.0.0.0` **zorunlu** — aksi hâlde telefon/emülatör backend'e erişemez
- `backend/.env` gerekli: `DATABASE_URL` + `SUPABASE_URL`

## Web → Mobile Uyarlama Kuralları
| Web | Mobile |
|-----|--------|
| `import.meta.env.VITE_*` | `process.env.EXPO_PUBLIC_*` |
| `localStorage` | `expo-secure-store` |
| `react-router-dom` | `expo-router` |
| Tailwind v4 CSS | NativeWind v4 |
| `lucide-react` | `lucide-react-native` |
| `mapbox-gl` | `@rnmapbox/maps` |
| `html.dark` CSS dark mode | NativeWind `dark:` |
| `navigator.geolocation` | `expo-location` |
| `<input type="file">` | `expo-image-picker` |

## NativeWind Kuralları
- Tailwind `dark:` varyantları kullanılabilir (web'deki `html.dark` yerine)
- RN'de flex default `flex-col` — `flex-row` açıkça belirtilmeli
- `className` prop NativeWind ile çalışır; style prop'u ile karıştırma

## lucide-react-native Kuralları (öğrenilen dersler)
- **Transform + layout style**: `style={{ transform }}` veya `style={{ marginTop }}` gibi layout prop'ları doğrudan SVG ikonuna uygulanamaz — `<View style={{ transform: [...] }}><Icon /></View>` veya `<View style={{ marginTop: 2 }}><Icon /></View>` şeklinde View'a sar
- **Fill + Color çakışması**: `fill={color}` ve `color={color}` aynı renk olursa ikonun iç çizgileri (örn. CheckCircle'daki tik) gizlenir; `fill` ile outline-fill ayrımına dikkat et
- **React.ReactNode tipi**: `React.ReactNode` için `import { type ReactNode } from 'react'` gerekir — `React.*` namespace erişimi ayrı import ister

## Modal / Polling Kodlama Kalıpları
- **Modal state sıfırlama**: Modal'ın iç state'i yalnızca `handleClose` ile sıfırlanırsa başarılı kapanma yolunda sıfırlanmaz; `useEffect(() => { if (!visible) setState(initialValue); }, [visible])` kalıbını kullan
- **setInterval stale closure**: `setInterval(() => fn(state), ms)` ile state değerini closure'a geçme — her zaman stale kalır; bunun yerine fn içinde API'dan güncel değeri çek, temizlemeyi API yanıtına göre yap

## Route Haritası (Faz A–D)
| Route | Dosya | Kısıt |
|-------|-------|-------|
| `/(auth)/login` | `src/app/(auth)/login.tsx` | public |
| `/(auth)/register` | `src/app/(auth)/register.tsx` | public |
| `/(auth)/forgot-password` | `src/app/(auth)/forgot-password.tsx` | public |
| `/(tabs)` → `/(tabs)/index` | `src/app/(tabs)/index.tsx` | auth |
| `/(tabs)/deliveries` | `src/app/(tabs)/deliveries.tsx` | auth (her iki rol) |
| `/(tabs)/profile` | `src/app/(tabs)/profile.tsx` | auth |
| `/delivery/create` | `src/app/delivery/create.tsx` | sender |
| `/delivery/[id]` | `src/app/delivery/[id].tsx` | auth |
| `/delivery/tracking/[id]` | `src/app/delivery/tracking/[id].tsx` | sender |
| `/wallet` | `src/app/wallet.tsx` | auth |
| `/courier/navigation/[id]` | `src/app/courier/navigation/[id].tsx` | courier |

## Faz Durumu
| Faz | İçerik | Durum |
|-----|--------|-------|
| A | Scaffold + ortak katman | ✅ Tamamlandı |
| B | Auth ekranları + navigasyon shell | ✅ Tamamlandı |
| C | Sender ekranları | ✅ Tamamlandı |
| D | Courier ekranları | ✅ Tamamlandı |
| E | Profil + bildirimler | ✅ Tamamlandı |
| F | FCM push (Expo Push API) | ✅ Tamamlandı |
| G | Native cila (biometric, haptics, deep link, offline cache) | ✅ Tamamlandı |

## Faz A — Tamamlananlar
- Expo SDK 56 scaffold (`src/app/` expo-router, TypeScript)
- NativeWind v4 kurulumu: `metro.config.js`, `tailwind.config.js`, `nativewind-env.d.ts`, `global.css`
- Tema token'ları tailwind config'e eklendi (`primary-blue`, `secondary-blue`, `tertiary-blue`, `dark-blue`, `darker-blue`)
- `.env` yapılandırıldı (`EXPO_PUBLIC_*`)
- `shared/api/supabase.ts` — SecureStore adapter + `detectSessionInUrl: false`
- `shared/api/api.ts` — axios + JWT interceptor
- Tüm 7 servis `shared/api/services/` altına kopyalandı
- `shared/types/index.ts` — web'den birebir kopyalandı
- `shared/store/auth.ts` — `localStorage` → `SecureStore` ile uyarlandı

## Faz B — Tamamlananlar
- Root `_layout.tsx`: `initialize()` + `isLoggedIn` gate; hazır olana kadar loading spinner
- `app/(auth)/` route grubu: `_layout.tsx` (fade animasyonlu Stack)
- `(auth)/login.tsx`: e-posta + parola, hata bandı, kayıt/şifre-unut linkleri
- `(auth)/register.tsx`: ad-soyad, e-posta×2, parola×2, Gönderici/Kurye seçici
- `(auth)/forgot-password.tsx`: `supabase.auth.resetPasswordForEmail`, başarı durumu
- `app/(tabs)/` route grubu: rol bazlı tab bar (sender → Ana Sayfa + Teslimatlar + Profil; courier → İşler + Profil)
- `(tabs)/_layout.tsx`: `isLoggedIn` guard → `/(auth)/login` yönlendirmesi
- `(tabs)/profile.tsx`: bakiye/puan/telefon kartı + Çıkış Yap butonu
- `supabase.ts`: `Platform.OS !== 'web'` koruması — SSR/Node.js ortamında SecureStore çağrısı engellendi
- `nativewind-env.d.ts`: `*.css` modül tipi tanımı eklendi (TS hataları giderildi)

## Faz C — Tamamlananlar (Sender Ekranları)
- C-1: `(tabs)/index.tsx` — karşılama, bakiye kartı (→ `/wallet`), Teslimat Oluştur CTA (→ `/delivery/create`), son 3 teslimat özeti
- C-2: `delivery/create.tsx` — form (açıklama, alış/teslimat adresi, ağırlık, öncelik), Nominatim geocoding + OSRM mesafe/süre, fiyat formülü (`distance×weight×multiplier`), bakiye kontrolü + 402 yönetimi, expo-image-picker + Supabase Storage upload (best-effort), `createTask()` → `delivery/[id]`'e yönlendirme. **Not:** `@rnmapbox/maps` kurulu değil — harita görünümü dev build ile Faz G'ye ertelendi; hesaplama Nominatim+OSRM üzerinden çalışıyor.
- C-3: `(tabs)/deliveries.tsx` — 4 bölüm (aktif/bekleyen/başarılı/başarısız), 7 günlük geçmiş collapsible, pull-to-refresh
- C-4: `delivery/[id].tsx` — 5 adımlı durum zaman çizelgesi, kanıt fotoğrafı tam ekran, gönderici onayı (`verifyTask`), itiraz (`createDispute` + `DisputeModal`), değerlendirme (`createReview` + `ReviewModal`), Canlı Takip butonu
- C-5: `delivery/tracking/[id].tsx` — 15 sn `getLatestLocation` polling, koordinat gösterimi, ETA, kurye kartı. **Not:** harita görünümü dev build gerektirir.
- C-6: `wallet.tsx` — bakiye başlığı, Yükle/Çek bottom-sheet modal (hızlı tutar seçimi), istatistik kartları, işlem geçmişi
- `shared/ui/StatusBadge.tsx` — tüm statüsler için renk kodlu badge
- `shared/ui/ReviewModal.tsx` — 5 yıldız + opsiyonel yorum
- `shared/ui/DisputeModal.tsx` — sebep textarea (min 5 karakter)

## Cursor Kuralları

### Core Directives (always)
- ZERO CHATTER: No greetings, pleasantries, or explanations unless explicitly asked.
- Output ONLY code inside standard markdown blocks.
- Never explain how code works unless the user explicitly requests it.
- Maximum token efficiency: no filler, no padding, no repetition.

### Architecture (always)
- Functional programming — pure functions, immutability, no class-based OOP.
- Modular monolith, feature-first organization (no cross-feature imports).
- Unidirectional data flow — root actions flow down to isolated leaf nodes.
- Components strictly isolated but highly cohesive.

### TypeScript / React (mobile files)
- Strict typing always — never use `any`.
- All shared types live in `shared/types/index.ts`.
- Functional components only — no class components.
- Declarative — derive UI from state, no imperative manipulation.
- State via Zustand.

### Session Rules (from memory)
- English only — no Turkish responses.
- Code/architecture reviews → keyword-only, no explanations.

## Faz E — Tamamlananlar (Profil + Bildirimler)
- **E-1 Profil** (`(tabs)/profile.tsx`): avatar upload (`expo-image-picker` → Supabase Storage + SecureStore URL); profil düzenleme modal (`updateProfile`); istatistik kartı; cüzdan kısayolu; karanlık mod toggle; hesap silme onay modal'ı (`deleteAccount`)
- **E-2 Bildirim bell** (`shared/ui/NotificationBell.tsx`): `getUnreadCount` 60 sn polling; badge 99+ sınırlı; dropdown lazy-fetch; sekme görünürlüğüne göre duraklama/devam; tap → `markRead` + `/delivery/{request_id}`
- **E-3 Karanlık mod** (`shared/store/theme.ts`): `useThemeStore` Zustand + SecureStore (`hp_theme`); `useThemeColors()` hook; `_layout.tsx`'de ilk render öncesi yüklenir (flash yok)

## Faz F — Tamamlananlar (Push Bildirimleri)
- **Backend**: `users.push_token` kolonu eklendi; `POST /users/me/fcm-token` endpoint (rate-limited 20/dk); `services/notify.py` her DB notification insert'inden sonra Expo Push API'ye daemon thread'de istek atar (best-effort)
- **Mobile `auth.ts`**: `registerPushToken()` statik import + `expo-constants` ile `projectId` lookup; login ve `initialize()` sonrası çağrılır
- **Mobile `_layout.tsx`**: `setNotificationHandler` (`shouldShowBanner`+`shouldShowList`+sound+badge — `shouldShowAlert` SDK 56'da deprecated); tap handler `/delivery/{request_id}`'e yönlendirir
- **Derin bağlantı**: `handpocket://` şeması `app.json`'da tanımlı; expo-router otomatik handle eder — ayrı `Linking` handler gerekmez

## Faz G — Tamamlananlar (Native Cila)
- **G-1 Arka plan konum**: `app.json` `expo-location` plugin'i → `isAndroidBackgroundLocationEnabled`, iOS `UIBackgroundModes: ["location","fetch"]` ⚠️ dev build gerektirir (Expo Go'da foreground tracking çalışır)
- **G-2 Biyometrik giriş**: `expo-local-authentication`; login ekranı `hasHardwareAsync`+`isEnrolledAsync` kontrol; başarılı şifre girişinde SecureStore'a (`hp_bio_email`/`hp_bio_pass`) kaydeder; biometrik başarısında okuyup `signIn` çağırır
- **G-3 Dokunsal geri bildirim**: `expo-haptics`; `Success` → görev kabul + teslimat tamamlama; `Warning` → iptal; `Error` → tüm hata durumları
- **G-4 Derin bağlantı**: scheme `"mobile"` → `"handpocket"`; expo-router otomatik yönetir; bildirim tap'i `addNotificationResponseReceivedListener` ile `/delivery/{id}`'e yönlendirir
- **G-5 Çevrimdışı önbellek**: `@react-native-async-storage/async-storage`; `shared/store/taskCache.ts` (Zustand persist, anahtar `hp-task-cache`); `openTasks`+`myTasks` önbelleğe alınır; courier ana ekran ve teslimatlar ekranı önbellekten başlar

---

## Faz D — Tamamlananlar (Courier Ekranları)
- D-1: `(tabs)/index.tsx` kurye kolu — `getOpenTasks` FlatList; pull-to-refresh; tap → bottom-sheet Modal (detay + stats + kazanç); `acceptTask` → `/courier/navigation/[id]`
- D-2: `courier/navigation/[id].tsx` — görev fetch + Nominatim geocoding + OSRM adım adım talimatlar; `watchPositionAsync` → 30 sn throttled `postLocation`; `accepted|picked_up` status guard; `expo-keep-awake`; İptal → `updateTaskStatus('cancelled')` → `/(tabs)`
  - **Harita**: `react-native-maps` (`MapView` + `Polyline` + `Marker`) — OSRM `[lon,lat][]` → `{latitude,longitude}[]` dönüşümü; pikap marker (koyu mavi) + teslimat marker (primary mavi); `initialRegion` from/to orta noktası
  - **State machine fix**: backend `accepted → picked_up → delivered` sırasını zorlar; `handleProofConfirm` içinde `taskStatusRef === 'accepted'` ise önce `picked_up` çağrılır, ardından `delivered`
  - **Yeniden tamamlama önlemi**: `DONE_STATUSES = {'delivered','completed','cancelled','disputed'}` — `isDeliveryDone` true ise butonlar yerine durum banner'ı gösterilir
- D-3: ProofModal (navigation ekranına gömülü) — kamera/galeri seçimi; Supabase Storage `delivery-proofs/{taskId}/proof.jpg` upload (`image/jpeg` sabit — URI'den ext çekme değil); `setProofPhoto` → `updateTaskStatus('delivered')` → `refreshUser()` → `/(tabs)/profile`
- **Yeni paketler**: `expo-keep-awake`, `react-native-maps`, `react-native-webview` kuruldu

### Faz D — Hata Düzeltmeleri (session 2)
- **deliveries.tsx — kurye görünürlüğü**: `href: null` kaldırıldı; tab artık her iki rol için görünür; tab başlığı her iki rol için `'Teslimatlar'`
- **deliveries.tsx — kurye yönlendirmesi**: `goDetail(task)` kurye + aktif task → `/courier/navigation/${task.id}`; diğerleri → `/delivery/${task.id}`
- **deliveries.tsx — 'delivered' eksikliği**: `ACTIVE_STATUSES = new Set(['accepted','picked_up','delivered'])` — `'delivered'` eklenmeden önce gönderici onayı bekleyen teslimatlar listeden kayboluyordu
- **auth.ts — login takılması**: `signIn` Supabase auth'tan sonra `isLoggedIn: true, loading: false` hemen set eder; profil fetch arka planda non-blocking çalışır; backend erişilemezse giriş yine de başarılı sayılır
- **_layout.tsx — splash takılması**: `initialize()` için 6 saniyelik race timeout; backend down olsa bile uygulama açılır
- **api.ts — axios timeout**: `timeout: 8000` ms — asılı kalan istekler 8 saniyede timeout'a girer
- **wallet.tsx — yükleme yansımıyor**: `handleTransaction` başarıdan sonra `load()` + `refreshUser()` fire-and-forget (`catch(()=>{})`) — refresh hatası kullanıcıya başarısız işlem olarak yansımıyordu
- **delivery/create.tsx — Türkçe karakter**: adres alanlarına `autoCorrect={false}` + `autoCapitalize="words"` — iOS autocorrect Türkçe bileşik karakterleri bozuyordu
- **delivery/tracking/[id].tsx — harita**: `react-native-maps` `MapView` + `Marker` eklendi; `region` 15 sn polling ile kurye konumuna güncellenir; konum yoksa İstanbul fallback
- **Auth ekranları**: hero `ImageBackground` (`bg-dark.png` / `bg-light.png`) kaldırıldı; yerini sadece logo + başlık `View` aldı; `bg-dark.png` + `bg-light.png` asset dosyaları silindi
- **ImageBackground sarma kuralı**: yalnızca ana `return` SafeAreaView sarılır; loading-state SafeAreaViews (ek layout stilleri içerir) **sarılmaz** — aksi hâlde stray `</ImageBackground>` oluşur
