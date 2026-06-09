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
- FCM push (Faz F) için ayrı onay gerekir; o zamana kadar in-app polling kullanılır

## Stack
| Katman | Teknoloji |
|--------|-----------|
| Framework | Expo SDK 56 + expo-router |
| Stil | NativeWind v4 + Tailwind CSS v3 |
| Auth | @supabase/supabase-js + expo-secure-store |
| HTTP | axios + Zustand auth store |
| Harita | @rnmapbox/maps (Faz C/D) |
| Konum | expo-location |
| Kamera | expo-image-picker + expo-camera |
| İkonlar | lucide-react-native |

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
EXPO_PUBLIC_API_URL=http://localhost:8000
```
- `.env` gitignore'da — asla commit'leme
- `sb_secret_` ve `service_role` anahtarları **asla** bu dosyaya girmez; sadece `backend/.env`

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

## Faz Durumu
| Faz | İçerik | Durum |
|-----|--------|-------|
| A | Scaffold + ortak katman | ✅ Tamamlandı |
| B | Auth ekranları + navigasyon shell | ✅ Tamamlandı |
| C | Sender ekranları | ⏳ Sıradaki |
| D | Courier ekranları | — |
| E | Profil + bildirimler | — |
| F | FCM push (backend exception gerekir) | Ertelendi |
| G | Native cila | — |

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

## Faz C — Yapılacaklar (Sender Ekranları)
- C-1: Ana Sayfa — karşılama + "Teslimat Oluştur" CTA
- C-2: Teslimat Oluştur (`RequestPage` portu) — `@rnmapbox/maps`, form, fiyat formülü, bakiye kontrolü
- C-3: Teslimatlarım listesi — aktif/bekleyen/tamamlanan/başarısız bölümleri
- C-4: Teslimat Detay (`delivery/[id]`) — zaman çizelgesi, kanıt fotoğrafı, onay/itiraz/değerlendirme
- C-5: Canlı Takip (`tracking/[id]`) — 15 sn polling, kurye marker
- C-6: Cüzdan — bakiye özeti, para yatır/çek modalleri
