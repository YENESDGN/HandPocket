# Plan.md — v0.1 Mimari Boşlukların Kapatılması

Bu plan, [CLAUDE.md](CLAUDE.md) "v0.1 Mimari Boşluklar" bölümünde tespit edilen ve [Architecture/System_Contex_Diagram.pdf](Architecture/System_Contex_Diagram.pdf) + [Architecture/API_Sequence_Diagram.pdf](Architecture/API_Sequence_Diagram.pdf) ile uyumsuz olan altı eksiği kapatma yol haritasıdır.

Sıralama; **bağımlılık + iş etkisi + efor** kriterlerine göre yapılmıştır. Düşük efor / yüksek etki olan kalemler önce.

---

## 1. Live Courier Tracking (backend hazır, frontend sahte)

**Mevcut durum**
- Backend: [backend/src/routers/locations.py](backend/src/routers/locations.py) tam (`POST /locations/`, `GET /locations/{task_id}/latest`).
- Frontend: `locationService.ts` yok. [TrackingPage.tsx](frontend/src/pages/TrackingPage.tsx) sahte `animate-ping` marker gösteriyor. [NavigationPage.tsx](frontend/src/pages/NavigationPage.tsx) konum push etmiyor.

**Yapılacaklar**
- [ ] `frontend/src/services/locationService.ts` — `postLocation(taskId, lat, lng)` + `getLatestLocation(taskId)` fonksiyonları
- [ ] `NavigationPage.tsx` — `navigator.geolocation.watchPosition` ile 30 sn'de bir `postLocation` (durum `accepted | picked_up` iken)
- [ ] `TrackingPage.tsx` — 15 sn'de bir `getLatestLocation` polling; gerçek koordinata göre marker hareket
- [ ] Polling temizliği: component unmount + status `delivered/completed/cancelled` olunca durdur
- [ ] Konum izni reddedildiğinde sessiz fallback (mevcut MapboxMap davranışı)

**Efor**: ~½ gün. **Bağımlılık**: yok. **İlk yapılacak.**

---

## 2. Sender Confirmation UI (Flow 2, adım 6 — `POST /verify`)

**Mevcut durum**
- Backend: `tasks.py` `DELIVERED` statüsünde kuryeye krediyi yatırıyor (geçici çözüm, CLAUDE.md'de belgelenmiş).
- Sequence Diagram: gönderici kanıt fotoğrafını görüp `completed`'a onay vermeli.

**Yapılacaklar**
- [ ] Backend: `routers/tasks.py` — `PATCH /tasks/{id}/verify` endpoint (gönderici sahiplik kontrolü, `delivered → completed` geçişi)
- [ ] Backend: kurye kredilendirme `DELIVERED`'dan `COMPLETED`'a geri taşınır (CLAUDE.md "Düzeltilen buglar" notu güncellenir)
- [ ] Frontend: `taskService.ts` — `verifyTask(id)` fonksiyonu
- [ ] Frontend: [DeliveryDetailPage.tsx](frontend/src/pages/DeliveryDetailPage.tsx) — status `delivered` ve `current_user.id === sender_id` ise:
  - Proof fotoğrafını büyük göster
  - "Teslimatı Onayla" butonu → `verifyTask` → status `completed`
  - "İtiraz Et" linki → Disputes UI'ına (bkz. 5. madde)

**Efor**: ~½ gün. **Bağımlılık**: yok. **Bu olmadan ödeme/itiraz akışı eksik.**

---

## 3. Reviews & Disputes UI (backend tam, frontend yok)

**Mevcut durum**
- Backend: `reviews.py` (ortalama puan yeniden hesaplama dahil), `disputes.py` (admin resolve dahil) tam.

**Yapılacaklar — Reviews**
- [ ] `frontend/src/services/reviewService.ts` — `createReview`, `getReviewsForUser`, `getMyReviews`
- [ ] [DeliveryDetailPage.tsx](frontend/src/pages/DeliveryDetailPage.tsx) — status `completed` olduğunda "Değerlendir" butonu → modal (5 yıldız + yorum)
- [ ] [settings.tsx](frontend/src/components/settings.tsx) "İstatistikler & Üyelik" kartı — sabit `4.9` yerine kullanıcının gerçek `average_rating`'i

**Yapılacaklar — Disputes**
- [ ] `frontend/src/services/disputeService.ts` — `createDispute`, `getMyDisputes`, `getAllDisputes` (admin), `resolveDispute` (admin)
- [ ] [DeliveryDetailPage.tsx](frontend/src/pages/DeliveryDetailPage.tsx) — "İtiraz Aç" butonu (status `delivered | completed`) → modal (sebep + açıklama)
- [ ] [ProfilePage.tsx](frontend/src/pages/ProfilePage.tsx) — yeni nav sekmesi **"İtirazlarım"** veya teslimatlar tablosunda dispute durumu kolonu
- [ ] [AdminDashboard.tsx](frontend/src/pages/AdminDashboard.tsx) — yeni sekme **"İtirazlar"**: liste + "Çöz" aksiyonu (kurye lehine / gönderici lehine → bakiye transferi)

**Efor**: ~1.5 gün. **Bağımlılık**: 2. madde (verify) tamamlanırsa "completed" akışı doğru çalışır.

---

## 4. Bildirim Servisi (Notification Service)

**Mevcut durum**
- Hiç yok. [Preferences.tsx](frontend/src/components/Preferences.tsx) toggle'ları sadece `useState`.
- Sequence Diagram'da 3 kritik tetikleme noktası var (Flow 1.7, Flow 2.8, Flow 3.3).

**Karar gerekli (kullanıcıya soru)**
- Sağlayıcı seçimi: **FCM** (Firebase, ücretsiz, mobil için zorunlu), **OneSignal** (basit web push), veya başlangıçta yalnızca **in-app + email** (Resend / SendGrid)?
- v0.1 web demosu için en hafif yol: **in-app notification tablosu + email (Resend)**. FCM mobil branch'ine ertelenebilir.

**Yapılacaklar (in-app + email senaryosu)**
- [ ] Backend: `models/notification.py` — `Notification(id, user_id, type, title, body, data_json, read_at, created_at)`
- [ ] Backend: `routers/notifications.py` — `GET /notifications/` (kendi), `PATCH /notifications/{id}/read`
- [ ] Backend: `services/notify.py` — `send_notification(user_id, type, title, body, data)` (DB insert + email best-effort)
- [ ] Backend tetikleyiciler:
  - `routers/tasks.py POST /` → tüm `role=courier` kullanıcılara "Yeni talep" bildirimi (geçici çözüm; ileride coğrafi filtre)
  - `routers/tasks.py PATCH /{id}/status` (`accepted`) → gönderici bilgilendirme
  - `routers/tasks.py PATCH /{id}/status` (`delivered`) → gönderici "kanıt fotoğrafı yüklendi" bildirimi
- [ ] Frontend: `services/notificationService.ts`
- [ ] Frontend: NavBar/ReceiverNavBar — bell ikonu + okunmamış sayı + dropdown liste
- [ ] Frontend: [Preferences.tsx](frontend/src/components/Preferences.tsx) toggle'ları gerçek `PATCH /users/me`'ye bağlanır (kolonlar: `notify_email`, `notify_sms`, `notify_push`)
- [ ] Email: Resend SDK + basit HTML şablonu (Türkçe)

**Efor**: ~2 gün. **Bağımlılık**: yok ama mobil branch öncesi FCM kararı verilmeli.

---

## 5. Ödeme Hizmetleri (Payment)

**Mevcut durum**
- [wallet.py](backend/src/routers/wallet.py) `deposit` yalnızca bir sayıyı artırıyor. Gerçek para akışı yok.

**Karar gerekli (kullanıcıya soru)**
- **iyzico** (TR pazarı, TRY native, daha kolay onboarding) vs **Stripe** (uluslararası, gelişmiş araçlar, TR'de "Atlas" gerekli) vs **PayTR** (TR, küçük işletme dostu).
- v0.1 için **iyzico sandbox** önerilir.

**Yapılacaklar (iyzico senaryosu)**
- [ ] Backend: `iyzipay` paketi + `.env` → `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `IYZICO_BASE_URL`
- [ ] Backend: `routers/wallet.py` — `POST /wallet/deposit/init` (iyzico checkout form token döner) + `POST /wallet/deposit/callback` (iyzico webhook → bakiyeyi gerçekten yükle)
- [ ] Backend: mevcut basit `POST /wallet/deposit` ya kaldırılır ya da `dev-only` flag arkasına alınır
- [ ] Backend: `wallet_transactions` tablosuna `provider_ref` (iyzico paymentId) kolonu
- [ ] Backend: ödeme başarısızlığı / iade akışı (`/refund`)
- [ ] Frontend: [WalletModal.tsx](frontend/src/components/WalletModal.tsx) — Bakiye Yükle → iyzico checkout sayfasına yönlendirme; dönüşte `/profil?deposit=success`
- [ ] Para çekme (withdraw): v0.1'de **manuel banka transferi talebi** olarak işaretle (admin paneline iş kuyruğu); gerçek IBAN dağıtımı v0.2

**Efor**: ~3 gün (sandbox + test). **Bağımlılık**: yok.
**Risk**: KYC / sözleşme / TC kimlik doğrulama → demo için iyzico sandbox yeterli; production öncesi yasal süreç.

---

## 6. AI Görüntü Doğrulama (Proof Photo Verification)

**Mevcut durum**
- Kanıt fotoğrafı Supabase Storage'a yükleniyor. AI kontrolü yok. Sequence Diagram'da "görüntü işleme" dış servisi var.

**Karar gerekli (kullanıcıya soru)**
- Hangi seviyede doğrulama?
  - **(a) Hafif**: yüklenen dosya gerçekten görüntü mü + EXIF GPS teslimat adresine yakın mı (`piexif` + Nominatim reverse)
  - **(b) Orta**: Cloud Vision / AWS Rekognition ile "paket / kapı / adres etiketi" tespiti (label detection)
  - **(c) Tam**: Claude Vision API ile "bu fotoğraf bir teslim edilmiş kargo görüntüsü mü?" — başarı puanı + ret nedeni

**Yapılacaklar (önerilen: c — Claude Vision)**
- [ ] Backend: `services/proof_ai.py` — Anthropic SDK ile fotoğrafı analiz et, `{ verdict: "accept"|"review"|"reject", confidence: 0..1, reason: str }` döner
- [ ] Backend: `PATCH /tasks/{id}/proof` — yükleme sonrası `proof_ai_result` jsonb kolonuna sonucu yaz
- [ ] Backend: `verdict === "reject"` ise gönderici onayı zorunlu hale gelir (otomatik `completed` yok); `accept` ise gönderici 24 saat içinde itiraz etmezse otomatik `completed` (cron job)
- [ ] Frontend: [DeliveryDetailPage.tsx](frontend/src/pages/DeliveryDetailPage.tsx) — AI sonucu rozeti ("AI Doğruladı ✓" / "İnceleme Gerekli ⚠")

**Efor**: ~1.5 gün. **Bağımlılık**: 2. madde (sender confirmation) — AI sonucu o akışı tetikler.

---

## Önerilen sıra ve tahmini takvim

| Sıra | Madde | Efor | Bağımlılık |
|------|-------|------|------------|
| 1 | Live tracking (locationService) | 0.5 gün | — |
| 2 | Sender confirmation UI | 0.5 gün | — |
| 3 | Reviews + Disputes UI | 1.5 gün | 2 |
| 4 | Bildirim servisi (in-app + email) | 2 gün | — |
| 5 | Ödeme (iyzico sandbox) | 3 gün | — |
| 6 | AI proof verification (Claude Vision) | 1.5 gün | 2 |

**Toplam**: ~9 iş günü (tek geliştirici, paralel değil).

---

## Kararlaştırılması gereken sorular

1. **Bildirim sağlayıcı**: in-app + email (Resend) ile başla, FCM mobil branch'e ertele — onaylar mısın?
2. **Ödeme sağlayıcı**: iyzico sandbox yeterli mi, yoksa Stripe mı tercih edersin?
3. **AI doğrulama derinliği**: (a) EXIF, (b) Cloud Vision label, veya (c) Claude Vision — hangisi?
4. **Sıralamayı kabul ediyor musun**, yoksa öncelikleri değiştirmek ister misin? (Örn. demo için 5. ve 6. ertelenebilir.)
