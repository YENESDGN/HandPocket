# Plan.md — v1.0 Yol Haritası

Bu plan, v0.1'in (Faz 1-8.1 — bkz. [CLAUDE.md](CLAUDE.md)) tamamlanmasından sonra **deploy edilebilir bir web ürünü** ve **kuralarbilir bir mobil uygulama** için kalan işleri kapsar.

**v0.1 durumu**: Tüm core akışlar çalışıyor (auth, talep oluşturma, kabul, navigasyon, teslim, gönderici onayı, reviews, disputes, in-app bildirim). Güvenlik ve performans sertleştirildi. Demo edilebilir durumda.

**Kalan boşluklar iki parçaya ayrıldı**:
- **Part A — Web v1.0 (Production-Grade)**: Gerçek ödeme, AI doğrulama, üretim altyapısı, e-posta bildirim. Sahte cüzdan ve manuel onay yerine para akan, denetlenebilir sistem.
- **Part B — Mobile App**: React Native veya Flutter port, FCM push, mobil-spesifik akışlar. Backend hazır; yeni istemci.

---

# PART A — Web v1.0 (Production-Grade)

Hedef: Halka açık bir URL'de gerçek kullanıcılarla çalışabilen, para akan, denetlenebilir bir sürüm.

## A1. Üretim Altyapısı (kod dışı + minimum kod)

**Mevcut durum**: Backend `metadata.create_all()` kullanıyor, Sentry yok, staging yok, deploy edilmedi.

**Yapılacaklar**
- [ ] **Alembic** migration kurulumu — mevcut şemayı baseline olarak işaretle; sonraki her model değişikliği migration ile
- [ ] **Sentry** entegrasyonu — `sentry-sdk[fastapi]`, `main.py`'de 3 satır init; frontend tarafında `@sentry/react`
- [ ] **Render/Fly.io deploy** — backend (Dockerfile + `gunicorn` + `uvicorn.workers.UvicornWorker`) + frontend (Vercel/Netlify static)
- [ ] **Staging environment** — `staging` branch'inden free instance; gerçek Supabase project ayrı
- [ ] **`.env` production**: `FRONTEND_URL=https://handpocket.com`, `DATABASE_URL` (Supabase prod pooler), `SUPABASE_JWT_SECRET`, `IYZICO_*`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`, `SENTRY_DSN`
- [ ] **Supabase Storage**: `delivery-proofs` bucket'ı prod project'te public olarak kurulmalı
- [ ] **HTTPS + custom domain** — Cloudflare DNS + Render/Fly TLS termination
- [ ] **Notifications cron**: `DELETE /notifications/purge?older_than_days=30` günde bir çalışsın (Render Cron Job / cron-job.org)
- [ ] **Locations retention cron**: `locations` tablosu eski kayıtları temizleyen endpoint + cron (yeni endpoint gerekli)

**Efor**: ~2 gün. **Bağımlılık**: yok. **Önce yapılmalı** — A2-A4 production'da test edilecek.

---

## A2. Gerçek Ödeme (iyzico)

**Mevcut durum**: [wallet.py](backend/src/routers/wallet.py) `deposit` sadece sayıyı artırıyor. Gerçek para akışı yok.

**Karar gerekli**: Sağlayıcı seçimi — **iyzico** (TR pazar, TRY native, KOBİ dostu) önerilir. Alternatifler: Stripe (Atlas gerekli), PayTR.

**Yapılacaklar**
- [ ] Backend: `iyzipay` paketi + `.env` → `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `IYZICO_BASE_URL`
- [ ] Backend: `routers/wallet.py`:
  - `POST /wallet/deposit/init` — iyzico checkout form token döner, `pending_deposit` kaydı oluşturur
  - `POST /wallet/deposit/callback` — iyzico webhook → imza doğrulama → bakiyeyi gerçekten yükle, `wallet_transactions` yaz
  - Mevcut basit `POST /wallet/deposit` → `DEV_MODE` env flag arkasına alınır (production'da 404)
- [ ] Backend: `wallet_transactions` tablosuna `provider`, `provider_ref` (iyzico paymentId), `idempotency_key` kolonları
- [ ] Backend: `POST /wallet/refund` — iptal edilmiş teslimat için gönderici iadesi (iyzico refund API)
- [ ] Backend: Webhook idempotency — aynı paymentId iki kez gelirse no-op
- [ ] Frontend: [WalletModal.tsx](frontend/src/components/WalletModal.tsx) — Bakiye Yükle butonu → `/deposit/init` → iyzico checkout sayfasına `window.location.href` ile yönlendirme
- [ ] Frontend: yeni route `/profil/odeme-sonuc` — `?status=success|failure` query'sini okuyup toast gösterir, `/profil?tab=cuzdan`'a yönlendirir
- [ ] Para çekme (withdraw): v1.0'da **manuel banka transferi talebi** olarak kalır
  - Yeni model: `WithdrawalRequest(id, user_id, amount, iban, status: pending|approved|rejected|paid, created_at)`
  - User: `POST /wallet/withdraw-request` (IBAN + tutar) → bakiye dondurulur
  - Admin: yeni "Para Çekme Talepleri" sekmesi → "Onayla" / "Reddet" / "Ödendi olarak işaretle"
  - Otomatik IBAN dağıtımı v1.1'e ertelenir

**Efor**: ~3 gün (sandbox + canlı test). **Bağımlılık**: A1 (production deploy). **Risk**: iyzico sözleşme + TC kimlik doğrulama — sandbox demo için yeterli, gerçek para öncesi yasal süreç.

---

## A3. AI Görüntü Doğrulama (Claude Vision)

**Mevcut durum**: Proof fotoğrafı Supabase Storage'a yükleniyor. AI kontrolü yok. Kurye fake fotoğraf yükleyip ödemeyi alabilir.

**Karar gerekli**: Doğrulama derinliği
- (a) **Hafif**: dosya gerçekten görüntü mü + EXIF GPS teslimat adresine yakın mı (`piexif` + Nominatim reverse) — ücretsiz ama kullanıcı EXIF'i strip edebilir
- (b) **Orta**: Cloud Vision label detection — paket/kapı/etiket tespiti — düşük maliyet, dolaylı sinyal
- (c) **Tam**: Claude Vision API — "bu bir teslim edilmiş kargo fotoğrafı mı?" — yüksek doğruluk, ~$0.01/foto

**Önerilen: (c) Claude Vision** + EXIF fallback

**Yapılacaklar**
- [ ] Backend: `services/proof_ai.py` — Anthropic SDK ile fotoğrafı analiz et:
  ```
  { verdict: "accept"|"review"|"reject", confidence: 0..1, reason: str }
  ```
- [ ] Backend: `PATCH /tasks/{id}/proof` — yükleme sonrası async (BackgroundTasks) ile AI tetikle → `proof_ai_result` jsonb kolonuna yaz
- [ ] Backend: yeni kolon `DeliveryRequest.proof_ai_result` (jsonb, nullable)
- [ ] Backend: yeni cron / endpoint — `verdict === "accept"` ise gönderici 24 saat içinde itiraz etmezse otomatik `completed` (sender'ı zorlamak yerine güven katmanı)
- [ ] Backend: `verdict === "reject"` ise gönderici onayı zorunlu, otomatik tamamlama yok; UI'da uyarı
- [ ] Backend: AI çağrı başarısızlığı sessiz fallback — `verdict = null` ile saklanır, mevcut akış bozulmaz
- [ ] Frontend: [DeliveryDetailPage.tsx](frontend/src/pages/DeliveryDetailPage.tsx) — proof fotoğrafı yanında AI rozeti:
  - ✅ "AI Doğruladı" (yeşil) | ⚠ "İnceleme Gerekli" (sarı) | ❌ "AI Reddetti" (kırmızı, reason gösterilir)
- [ ] Frontend: AdminDashboard — `verdict === "reject"` task'ları için "AI Şüpheli" filtresi

**Efor**: ~1.5 gün. **Bağımlılık**: yok (sender confirmation zaten var).

---

## A4. E-posta Bildirim Kanalı (Resend)

**Mevcut durum**: In-app bildirim çalışıyor (Faz 7). [Preferences.tsx](frontend/src/components/Preferences.tsx) E-Posta/SMS/Push toggle'ları sadece `useState`, backend'e bağlı değil.

**Karar gerekli**: Sağlayıcı — **Resend** (modern, dev-friendly, TR'de kullanılabilir, ücretsiz tier yeterli) önerilir. Alternatif: SendGrid, Postmark.

**Kapsam**: SMS ve Push v1.0 dışı (SMS pahalı, Push mobil branch'le birlikte). Sadece **email** eklenir.

**Yapılacaklar**
- [ ] Backend: `users` tablosuna `notify_email: bool = True` kolonu (Alembic migration)
- [ ] Backend: `services/notify.py` `safe_notify` içinde DB insert sonrası, kullanıcının `notify_email = True` ise Resend ile email gönder (best-effort, hata sessiz)
- [ ] Backend: `services/email.py` — Resend SDK wrapper + 8 tip için TR HTML şablonu (`task_accepted`, `task_picked_up`, `task_delivered`, `task_verified`, `task_cancelled`, `dispute_opened`, `dispute_resolved`, `task_created` — sonuncusu kullanılmıyor)
- [ ] Backend: `from_address` doğrulanmış domain (`noreply@handpocket.com`) — DNS SPF/DKIM kurulumu
- [ ] Backend: email throttle — aynı kullanıcıya aynı request için 60 saniye içinde max 1 email (Redis veya basit in-memory TTL dict)
- [ ] Frontend: [Preferences.tsx](frontend/src/components/Preferences.tsx) E-Posta toggle'ı `useAuthStore.updateProfile({ notify_email })` ile gerçek backend'e bağlanır
- [ ] Frontend: SMS ve Push toggle'larına "Yakında" badge eklenir, disabled state
- [ ] Frontend: yeni `userService.updateNotificationPreferences()` (veya mevcut `updateMe` genişletilir)

**Efor**: ~1.5 gün. **Bağımlılık**: A1 (production deploy — Resend doğrulanmış domain gerekir).

---

## A5. UX & Üretim Cilası

**Mevcut durum**: Demo için yeterli ama gerçek kullanıcı geri bildirimi sonrası düzeltilmesi gereken küçük detaylar var.

**Yapılacaklar**
- [ ] **E-posta doğrulama akışı** — Supabase Auth'da "Confirm email" prod'da açık olmalı; AuthPage'de "doğrulama linki gönderildi" ekranı
- [ ] **Şifre sıfırlama** — [ForgotPasswordPage.tsx](frontend/src/pages/ForgotPasswordPage.tsx) mock; `supabase.auth.resetPasswordForEmail` çağrısı ve callback route eklenmeli
- [ ] **Telefon doğrulama** (opsiyonel) — kayıt sırasında telefon SMS OTP (Supabase Auth Phone)
- [ ] **KVKK + Kullanım Koşulları sayfaları** — yasal zorunluluk; Footer linklerinden erişim
- [ ] **Onboarding tour** — yeni gönderici/kurye için ilk girişte 3-4 adım modal turu (`react-joyride`)
- [ ] **Boş durum görselleri** — `ProfilePage` tabloları boşken sadece "Kayıt bulunamadı" metni var; illüstrasyon + CTA eklenmeli
- [ ] **Error boundary** — top-level React `ErrorBoundary` + Sentry'e raporlama
- [ ] **Loading skeleton'lar** — DeliveryDetailPage, ProfilePage, RecieverPage için spinner yerine skeleton UI
- [ ] **Mobile responsive denetimi** — tüm sayfaların 375px genişlikte çalıştığının doğrulanması (Profile sidebar collapse, Request form stack, vs.)

**Efor**: ~2-3 gün. **Bağımlılık**: A1-A4 sonrasında polish olarak yapılır.

---

## Part A Özet Tablosu

| Sıra | Madde | Efor | Bağımlılık |
|------|-------|------|------------|
| A1 | Üretim altyapısı (Alembic, Sentry, deploy, cron) | 2 gün | — |
| A2 | iyzico ödeme | 3 gün | A1 |
| A3 | Claude Vision proof doğrulama | 1.5 gün | — (paralel) |
| A4 | Email bildirim (Resend) | 1.5 gün | A1 |
| A5 | UX cilası + yasal sayfalar | 2-3 gün | A1-A4 |

**Toplam**: ~10-11 iş günü.

---

# PART B — Mobile App

Hedef: iOS + Android'de çalışan, push bildirimleri olan, App Store / Play Store'a sunulabilir uygulama. Backend zaten hazır.

## B0. Framework Kararı

**Karar gerekli**: 
- **React Native + Expo** — web tarafıyla TypeScript + Zustand kod paylaşımı; Expo ile native modüller (location, push) hızlı
- **Flutter + Riverpod** — `.cursor/rules/frontend-standards.mdc`'de Zustand → Riverpod portu zaten not edilmiş; performans + UI kalite avantajı
- **Native (Swift + Kotlin)** — v1.0 için aşırı

**Önerilen: React Native + Expo** — web kodunun %40-60'ı (services, types, store) doğrudan taşınabilir; takım tek dilde kalır.

---

## B1. Proje Kurulumu

**Yapılacaklar**
- [ ] Yeni branch / repo: `mobile/` (monorepo) veya `handpocket-mobile` (ayrı repo)
- [ ] `npx create-expo-app` → TypeScript şablonu
- [ ] **Paylaşılan paket**: `frontend/src/services/`, `frontend/src/types/`, `frontend/src/store/auth.ts` taşınabilir (web Tailwind hariç) — `shared/` workspace veya copy
- [ ] **Auth**: `@supabase/supabase-js` mobil destekliyor; secure storage için `expo-secure-store` ile token persistence
- [ ] **Navigation**: `expo-router` (file-based, web React Router'a yakın)
- [ ] **State**: aynı Zustand store'lar (web ile birebir)
- [ ] **UI kit**: Tailwind benzeri için `nativewind` (Tailwind v4 syntax) veya `tamagui`
- [ ] **API client**: `axios` mobilde de çalışır, `lib/api.ts` doğrudan taşınır

**Efor**: ~2 gün.

---

## B2. Ekran Portları

Web sayfalarının mobil karşılıkları. Her ekran tek sorumluluk, dokunma-öncelikli tasarım.

**Sender ekranları**
- [ ] `(auth)/login` + `(auth)/register` — `AuthPage`'in mobil versiyonu
- [ ] `(tabs)/home` — landing + hızlı talep oluştur CTA
- [ ] `(tabs)/create` — `RequestPage` — Mapbox React Native (`@rnmapbox/maps`) + form
- [ ] `(tabs)/deliveries` — `ProfilePage` Teslimatlar sekmesi (tab navigation)
- [ ] `(tabs)/wallet` — `WalletPanel`
- [ ] `(tabs)/profile` — Settings/Security/Preferences birleşik
- [ ] `delivery/[id]` — `DeliveryDetailPage` + sender confirmation + dispute modal
- [ ] `tracking/[id]` — `TrackingPage` canlı kurye konumu (mobil cihazın doğal güçlü yanı)

**Courier ekranları**
- [ ] `(tabs)/jobs` — `RecieverPage` — açık talepler listesi + harita
- [ ] `(tabs)/navigation` — `NavigationPage` — adım adım, ekran kilidi engelleme (`expo-keep-awake`), background location
- [ ] `delivery/[id]/proof` — ProofOfDeliveryModal'ın full-screen versiyonu (mobil kamera entegrasyonu)

**Ortak**
- [ ] NotificationBell yerine native bell (header'da) + iOS/Android notification center entegrasyonu

**Efor**: ~7-10 gün.

---

## B3. FCM Push Notifications

**Mevcut durum**: Web'de 60 sn polling yeterli. Mobilde uygulama backgroundda olduğunda polling imkansız → push zorunlu.

**Yapılacaklar**
- [ ] **Firebase project** kur — iOS (APNs sertifikası) + Android (google-services.json)
- [ ] Backend: `firebase-admin` SDK + `.env` → `FCM_SERVICE_ACCOUNT_JSON`
- [ ] Backend: `users` tablosuna `fcm_token: str | null` kolonu (Alembic)
- [ ] Backend: `POST /users/me/fcm-token` — mobil app login sonrası ve token refresh'te çağırır
- [ ] Backend: `services/notify.py` `safe_notify` içinde DB insert + email sonrası, kullanıcının `fcm_token` varsa FCM `send()` çağrısı (best-effort)
- [ ] Backend: `data` payload'a `request_id` koy ki mobil app tıklandığında `/delivery/{id}`'e deep-link yapsın
- [ ] Mobile: `expo-notifications` setup — izin iste, token al → `POST /users/me/fcm-token`
- [ ] Mobile: notification handler — foreground'da banner, backgroundda tıklamada deep-link
- [ ] Mobile: notification preferences ekranında push toggle gerçek `notify_push` kolonuna bağlanır

**Efor**: ~2-3 gün. **Bağımlılık**: B1, B2. Web tarafında `users.fcm_token` kolonu eklemek + endpoint sadece backend işi (gelecekteki mobile'i hazırlamak için A1 sırasında yapılabilir).

---

## B4. Mobil-Spesifik Özellikler

Web'de olmayan ama mobilde değer katan özellikler.

**Yapılacaklar**
- [ ] **Background location tracking** (kurye) — `expo-location` background mode; uygulama kapalıyken bile her 30-60 sn `POST /locations/` (kullanıcı izniyle)
- [ ] **Kamera entegrasyonu** — proof fotoğrafı için `expo-camera`; native kamera UI'ı
- [ ] **Biometric login** — `expo-local-authentication` (Touch ID / Face ID)
- [ ] **Haptic feedback** — kabul / teslim / hata noktalarında dokunsal geri bildirim
- [ ] **Deep linking** — `handpocket://delivery/{id}` + universal links (iOS) + app links (Android)
- [ ] **Offline cache** — `react-query` veya `zustand persist` ile son çekilen teslimat listesi offline'da görünür
- [ ] **App Store / Play Store assets** — ikon, splash, screenshot'lar, store listing

**Efor**: ~3-4 gün.

---

## B5. Yayın Süreci

**Yapılacaklar**
- [ ] **Apple Developer Account** ($99/yıl) + **Google Play Developer** ($25 tek seferlik) hesapları
- [ ] **EAS Build** — Expo'nun CI/CD'si ile iOS .ipa + Android .aab build
- [ ] **TestFlight** + **Internal testing track** — closed beta
- [ ] **App Store Review** — ilk submit + ret düzeltmeleri (genelde 1-2 iterasyon)
- [ ] **Privacy policy URL** (zorunlu) — A5'te eklenen KVKK sayfasına link

**Efor**: ~2-5 gün (review beklemesi dahil).

---

## Part B Özet Tablosu

| Sıra | Madde | Efor | Bağımlılık |
|------|-------|------|------------|
| B0 | Framework kararı | — | Karar |
| B1 | Proje kurulumu | 2 gün | B0 |
| B2 | Ekran portları | 7-10 gün | B1 |
| B3 | FCM push | 2-3 gün | B1, B2 |
| B4 | Mobil-spesifik özellikler | 3-4 gün | B2 |
| B5 | App Store + Play Store yayın | 2-5 gün | B2-B4 |

**Toplam**: ~16-24 iş günü.

---

# Kararlaştırılması Gereken Sorular

**Part A için**:
1. **Ödeme sağlayıcı**: iyzico sandbox ile başlayalım mı? (alternatifler: Stripe, PayTR)
2. **AI doğrulama derinliği**: Claude Vision (c) önerisini kabul ediyor musun?
3. **Email sağlayıcı**: Resend uygun mu? (alternatifler: SendGrid, Postmark)
4. **Deploy hedefi**: Render mı, Fly.io mu, başka mı?

**Part B için**:
5. **Mobil framework**: React Native + Expo (önerilen) — onay?
6. **Push sağlayıcı**: FCM (Firebase) — onay? (alternatif: OneSignal — daha kolay ama vendor lock-in)
7. **Sıralama**: Önce Part A tamamen, sonra Part B mi? Yoksa A1 + A3 (deploy + AI) sonrası Part B paralel mi başlasın?

**Genel**:
8. **v1.0 takvim hedefi**: Part A 10-11 gün + Part B 16-24 gün = **toplam ~26-35 iş günü** (paralel değil). Bu seninle uyumlu mu?
