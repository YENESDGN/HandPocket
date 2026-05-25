# HandPocket - Proje Bağlamı

> **Session init**: At the start of every conversation, read all files in `.cursor/rules/` before doing anything else.

## Proje
- **Tip**: React/TypeScript kargo uygulaması
- **Renk**: #08b4fb (mavi tema)
- **Dil**: Türkçe

## Yön (2026-05-25 itibariyle) — ÖNEMLİ
- **Web geliştirme durduruldu.** v0.1 (Faz 1-8.1) demo edilebilir durumda. Kullanıcı açıkça istemedikçe `frontend/`, `backend/` veya web ile ilgili hiçbir dosyada değişiklik / yeni feature / refactor yapma.
- **Sıradaki odak: Mobil uygulama** (bkz. [Plan.md](Plan.md) Part B). Framework kararı + kurulum sonraki oturumda başlayacak — bu oturumda mobil kod yazılmaz.
- Backend mobil için hazır (auth, tasks, locations, notifications, wallet, reviews, disputes — hepsi REST + JWT). Mobil istemci yeni codebase olacak.

## Aktif Değişiklikler
### NavBar.tsx
- Nav linkleri: Anasayfa, Hakkımızda, İletişim
- Giriş yokken: Giriş Yap, Kayıt Ol (pill butonlar — `bg-primary-blue` pill)
- Giriş varken: profil avatarı → /profil
- Rol bazlı ek link: `sender` → **Talep Oluştur** (/talep), `courier` → **Talep Al** (/talep-al); diğer rolde karşı tarafın linki gösterilmez
- `useAuthStore`: `isLoggedIn`, `role`
- **Karanlık mod toggle**: `useDarkMode()` hook, Sun/Moon Lucide ikon, `.theme-toggle-btn` CSS sınıfı (index.css'de tanımlı)

### LandingPage.tsx (85 satır)
- 2 kolonlu grid layout
- Sol: Mavi panel (#08b4fb) + slogan "HIZLI VE GÜVENLİ"
- Sağ: NavBar komponenti
- Alt: 3 özellik kartı (Gönderim, Teslimat, Memnuniyet)
- Asset'ler: Logo, yol, ikonlar, store logoları
- fade-in-up animasyonu kullanımı
- **Karanlık mod resim değişimi**: `useDarkMode()` hook (`lib/useDarkMode.ts`); dark → `bg_img1.png`, light → `bg_img.png`

### AuthPage.tsx (/giris, /kayit)
- Arka plan: `profile-bg` (RgLg_bg.png blurred pseudo-element); overlay kaldırıldı
- Üst navbar: `.auth-navbar` CSS sınıfı (frosted glass — `rgba(255,255,255,0.65)` + `backdrop-filter: blur`; dark modda `rgba(4,20,33,0.70)`)
- Tek ortalanmış kart (`bg-primary-blue`), Lucide ikonlar (Mail, Lock, User, ArrowRight, Loader2)
- Giriş / Kayıt tek kart içinde `activeForm` ile; alt linkten form değişimi; `fade-in-up` ile geçiş animasyonu
- Kontrollü input state; hata bandı (`useAuthStore.error` + `clearError`); gönderimde `loading` + spinner
- **Kayıt**: Ad Soyad, E-posta, E-posta Tekrar, Parola, Parola Tekrar, Gönderici/Kurye seçici → `signUp` (Supabase + profil satırı)
- **Giriş**: E-posta, Parola → `signIn` (Supabase + `GET /users/me` ile rol)
- **Karanlık mod**: Tamamen CSS-tabanlı (`html.dark .auth-navbar`, `html.dark .text-gray-800\/90` vb.) — Tailwind `dark:` varyantı yok

### Contact.tsx (91 satır)
- İletişim formu sayfası
- Form: Tam Ad, Email, Konu, Mesaj alanları
- bg-tertiary-blue (#1e91c1) form arka planı
- Google Maps iframe entegrasyonu (İstanbul konumu)
- ContactInfo komponenti kullanımı
- 2 kolonlu grid layout

### ContactInfo.tsx (52 satır)
- İletişim bilgileri komponenti
- 4 satır grid: Adres, Telefon, Email, Saatler
- Her satır: Icon + başlık + bilgi
- bg-dark-blue arka plan
- Text-white renk

### RequestPage.tsx
- Kargo talebi oluşturma sayfası (gönderici rolü)
- SecondNavBar kullanımı
- 23/77 grid layout: sol form paneli + sağ Mapbox harita
- Sol: Kargo Adı, Başlangıç/Bitiş Konumu, Paket Fotoğrafı (opsiyonel), Ağırlık, Öncelik
- Sağ harita: h-[900px] inline Mapbox GL JS (MapboxMap komponenti değil, doğrudan mapboxgl)
- Harita üstünde toggle butonu (isPanelVisible useState) + compact hesaplama paneli (w-56, absolute bottom-4 right-4)
- Hesaplama paneli: Mesafe / Süre / Hesaplanan Ücret + "Teslimat Oluştur" butonu
- **Fiyat formülü**: `distance_km × weight_kg × open_time_multiplier` — backend ile birebir aynı; eski additive formül (BASE_COST + rate*d + rate*w + rate*p) kaldırıldı
- **Ücret dağılımı**: panel Mesafe / Ağırlık / Öncelik çarpanı olarak gösterir
- **Bakiye kontrolü**: `handleSubmit` çağrılmadan önce `user.wallet_balance >= calcResult.price` kontrolü; yetersizse "Yetersiz bakiye." modal gösterilir, "Bakiye Yükle" butonu `/profil`'e yönlendirir
- Backend 402 hatası da yakalanır; başarılı submitten sonra `refreshUser()` çağrılır
- **Kullanıcı konumu**: `navigator.geolocation.getCurrentPosition` → `jumpTo` + özel mavi nokta marker; `GeolocateControl` canlı takip butonu olarak eklendi

### RecieverPage.tsx
- Kurye rolü için açık talepleri görme ve kabul etme sayfası
- Route: /talep-al
- 3-kolon grid: [22%_1fr_22%] — sol detay paneli + orta harita + sağ bekleyen talepler listesi
- ReceiverNavBar + DeliveryAmountCard kullanımı
- Sol panel: seçili talebin read-only alanları (Kargo Adı, Başlangıç, Bitiş, Ağırlık, Öncelik badge) + DeliveryAmountCard
- Orta: h-[850px] **MapboxMap** (Nominatim geocoding + OSRM rota) — `showUserLocation` açık
- Sağ: kaydırılabilir bekleyen talepler listesi (bg-secondary-blue header, beyaz kartlar, aktif seçim ring)
- `getOpenTasks()` ile gerçek API verisi; useState ile seçili talep yönetimi
- priorityLabel / priorityBadge yardımcı fonksiyonlar
- **Kabul Et** (`DeliveryAmountCard.onAccept`): `acceptTask(id)` → `useNavigate` ile **/navigasyon** (state: { request })

### TrackingPage.tsx
- Gönderi canlı takip sayfası (gönderici rolü)
- Route: /takip
- ReceiverNavBar kullanımı
- **Veri kaynağı**: `location.state.request` (DeliveryDetailPage `<Link state={{ request }}>` ile geçirir); null ise "Gönderi bulunamadı" fallback ekranı
- `getUserById(request.courier_id)` ile kurye adı çekilir (loading spinner)
- ETA: `new Date() + estimated_time_mins` → `HH:MM` formatı
- Harita merkezi: `request.pickup_address` Nominatim geocoding ile
- 23/77 grid: sol 3 kart + sağ tam yükseklik harita
- Sol kartlar: Status Card (Gönderi ID + ETA + Mesafe), Cargo Details Card (Timeline: BAŞLANGIÇ→TESLİMAT + ağırlık/öncelik), Courier Card (full_name + email, telefon butonu)
- Sağ harita: h-[calc(100vh-160px)], `showUserLocation` açık
- **Canlı kurye konumu**: 15 sn'de bir `getLatestLocation(request.id)` polling; kurye marker'ı (secondary-blue) gerçek koordinata göre çizilir. Status `delivered/cancelled` olduğunda polling durur. Konum henüz yoksa "Kurye konumu bekleniyor..." rozeti.

### DeliveryDetailPage.tsx
- Tekil teslimat detay sayfası
- Route: /talep/:id (useParams ile id okuma)
- ReceiverNavBar kullanımı
- 30/70 grid: sol kartlar + sağ harita
- Sol kartlar: ID+Status Card, Durum Zaman Çizelgesi (5-adım: Talep → Kabul → Alındı → Teslim → Gönderici Onayladı), **Teslimat Kanıtı kartı** (status `delivered`/`completed` iken), Kargo Bilgileri
- StatusBadge inline component — `delivered/completed/disputed/cancelled` dahil tüm statüler için renk kodlu badge'ler (Lucide: ShieldCheck, AlertTriangle vb.)
- Kabul durumunda "Canlı Takip" linki (/takip)
- Bulunamayan ID için 404 fallback ekranı
- Harita: `showUserLocation` açık
- **Sender confirmation flow** (`status === delivered && currentUser.id === sender_id`):
  - Proof fotoğrafı büyük gösterilir (tıklanınca tam ekran açılır)
  - "Teslimatı Onayla" → `verifyTask(id)` → status `completed`, kurye cüzdanı kredilenir, `refreshUser()`
  - "İtiraz Et" → `DisputeModal` → `createDispute({ request_id, reason })` → status `disputed`
- **Review flow** (`status === completed`, sender veya courier):
  - "Değerlendir" butonu → `ReviewModal` (5 yıldız + opsiyonel yorum) → `createReview({ request_id, reviewee_id, score, comment })`
  - Karşı taraf: sender ise courier_id, courier ise sender_id; backend ortalama puanı otomatik günceller

### NavigationPage.tsx
- Kurye navigasyon sayfası (tam ekran harita)
- Route: /navigasyon
- Full-screen **MapboxMap** (Nominatim + OSRM adım adım yön) — `showUserLocation` açık
- Sol üst: Dönüş talimatı kartı (mesafe + talimat) + Tahmini varış / kalan km kartı
- Sağ üst: Rota Zaman Çizelgesi paneli (Alım → Yolda → Varış → Teslim)
- Alt: Kargo Özellikleri (ağırlık/mesafe/ID) + İptal / Tamamla butonları
- **ProofOfDeliveryModal** entegrasyonu: "Tamamla" → modal açılır → `onConfirm(file)` → Supabase Storage `delivery-proofs` bucket'a yükleme (best-effort) → `setProofPhoto(id, url)` → `updateTaskStatus` picked_up + delivered → `refreshUser()` → `/profil`
- İptal: `updateTaskStatus(id, 'cancelled')` → `/talep-al`
- **Canlı konum push**: `request.status ∈ {accepted, picked_up}` iken `navigator.geolocation.watchPosition` aktif; `lastPushRef` ile 30 sn throttle → `postLocation(request.id, lat, lng)`. İzin reddi sessiz fallback.

### AboutUs.tsx (116 satır)
- Hakkımızda sayfası
- Route: /hakkimizda
- SecondNavBar + Footer kullanımı
- 2 kolonlu (md:flex-row): sol bg-secondary-blue + sağ bg-darker-blue
- Sol: Misyon, Kuruluş (2024), Temel Değerler (Hız/Güvenlik/Güvenilirlik/Şeffaflık)
- Sağ: İstatistik kartları (50K+ Teslimat, 81 Şehir, 4.9 Puan, 2K+ Kurye) + hero görsel + "Hemen Başla" CTA

### ForgotPasswordPage.tsx (84 satır)
- Şifre sıfırlama sayfası
- Route: /sifremi-unuttum
- Merkezi beyaz kart (max-w-md, rounded-2xl), bg-dark-blue arka plan
- E-posta input → gönder → başarı durumu (sent useState)
- Logo + başlık + açıklama metni, giriş sayfasına dön linki

### NotFoundPage.tsx (36 satır)
- 404 sayfası
- Route: * (catch-all)
- bg-dark-blue, TinyHp_Logo.png, "404" büyük metin
- "Anasayfaya Dön" + "Geri Git" (useNavigate(-1)) butonları
- fade-in-up animasyonu

### AdminDashboard.tsx
- Admin paneli
- Route: /admin
- ProfilePage ile aynı sidebar+main layout (profile-bg, relative flex h-screen)
- Sidebar (bg-darker-blue, w-52): ShieldCheck ikon, Admin Paneli başlık, 4 nav: Genel Bakış/Kullanıcılar/Teslimatlar/**İtirazlar** (Lucide ikonlar), Çıkış Yap
- **Çıkış Yap**: `useAuthStore.signOut` + `navigate('/')` (Supabase oturumu kapanır)
- Header: logo sol + "Admin Paneli" merkez
- AdminNav tipi: 'genel' | 'kullanicilar' | 'teslimatlar' | 'itirazlar'
- **Genel Bakış**: 4 stat kartı (Kullanıcı/Kurye/Teslimat/Gelir) + Son Teslimatlar tablosu + Son Kullanıcılar tablosu
- **Kullanıcılar**: Tüm kullanıcılar tablosu (Ad, E-Posta, Rol badge, Bakiye, Puan, Durum, Yasakla/Kaldır butonu)
- **Teslimatlar**: Tüm teslimatlar tablosu (ID, Açıklama, Güzergah, Mesafe, Ücret, Durum badge)
- **İtirazlar**: `getAllDisputes()` ile gerçek API; tablo: Talep ID (link), Açan, Sebep, Tarih, Durum (Çözüldü/Açık badge); açık satırlarda "Çözüldü olarak işaretle" → `resolveDispute(id)`

### Footer.tsx (27 satır) - eski FooterButtons
- 3 kolonlu footer layout
- Logo + Hizmetler/Hakkımızda/İletişim linkleri + Copyright
- btn-hover-blue efektleri

### ProfilePage.tsx
- Route: /profil
- relative flex h-screen layout: sol sidebar + sağ main content
- Arka plan: assets/RgLg_bg.png (absolute, opacity-50, blur-sm, z-[-1])
- **Sidebar** (bg-darker-blue, w-52):
  - Üst: Profil fotoğrafı (yuvarlak, tıklanabilir → file picker), Ad, Telefon, Email
  - Orta nav: Teslimatlar, Ayarlar, Güvenlik, Tercihler (Lucide ikonlar)
  - Aktif nav item: bg-dark-blue + beyaz yazı (useState ile)
  - Alt: Cüzdan, Yardım Merkezi (NeedHelpPanel), Çıkış Yap (kırmızı) — `showLogout` modal ile onay alınır, sonra `signOut()` + `navigate('/')`
- **Navbar** (bg-white, py-5): Logo sol, Anasayfa/Hakkımızda/İletişim sağ, profil avatarı sağda (tıklanınca file picker açar)
- **NavItem tipi**: 'teslimatlar' | 'ayarlar' | 'guvenlik' | 'tercihler' | 'yardim' | 'cuzdan'
- **Tablolar** (DeliveryTable komponenti — teslimatlar sekmesi):
  - table-fixed + colgroup ile sabit kolon genişlikleri (15/45/20/20%)
  - Başlık satırı: bg-darker-blue, beyaz bold yazı
  - Gövde: beyaz arka plan
  - Durum kolonu: StatusBadge (rounded-full pill) — yeşil/kırmızı/sarı
- **Panel bileşenleri**: her sekme için ayrı component import edilir:
  - ayarlar → SettingsPanel (settings.tsx)
  - guvenlik → SecurityPanel (Security.tsx)
  - tercihler → PreferencesPanel (Preferences.tsx)
  - yardim → NeedHelpPanel (NeedHelp.tsx)
  - cuzdan → WalletPanel (ProfilePage içinde tanımlı)
- **WalletPanel**: `getWalletSummary()` ile gerçek bakiye + istatistikler + işlem geçmişi; WalletModal komponenti ile Bakiye Yükle (`deposit(amount)`) ve Para Çek (`withdraw(amount)`) işlemleri; işlem sonrası `refreshUser()` + panel yenileme
- **Geçmiş Teslimatlar dropdown** (teslimatlar sekmesi):
  - Terminal statüsler (completed / cancelled / disputed) < 7 gün → ana bölümde görünür; ≥ 7 gün → "Geçmiş Teslimatlar" collapsible dropdown'a düşer
  - `isOlderThan7Days(dateStr)` + `SEVEN_DAYS_MS` sabiti ile hesaplanır
  - Lazy load: `allRowsRef` (useRef) mount'ta tüm satırları saklar, dropdown ilk açıldığında filtre yapılır (`historyLoadedRef`); sonraki toggle'larda yeniden fetch/filtre yok
  - Ana bölüm tabloları: AKTİF TESLİMATLAR (courier) / ONAY BEKLEYEN + BEKLEYEN TALEPLER (sender) + BAŞARILI TESLİMATLAR (completed, recent) + BAŞARISIZ TALEPLER (disputed + cancelled, recent)
  - Dropdown tabloları: BAŞARILI (completed, old) + BAŞARISIZ TALEPLER (disputed + cancelled, old)
  - `DeliveryRow` interface'e `createdAt: string` eklendi; `ChevronDown` Lucide ikonu (rotate-180 açıkken)

### settings.tsx — Ayarlar sekmesi
- font-sextary, rounded-lg, shadow-md kartlar
- **Kişisel Bilgiler** (bg-dark-blue header + bg-dark-blue/90 body):
  - Sol: profil fotoğrafı (rounded-lg, w-36 h-36)
  - Sağ: 2-kolon grid — İsim, Soyisim, E-Posta, Telefon Numarası
  - "Profili Güncelle" butonu: bg-darker-blue, rounded-xl
- **Dil ve Zaman** (bg-white):
  - Tercih Edilen Dil: Globe ikonu + select dropdown (TR/EN/DE/FR/ES)
  - Zaman Formatı: Clock ikonu + 24 Saat / 12 Saat toggle butonları (useState)
- **İstatistikler & Üyelik** (bg-white):
  - Teslimat sayısı (128) + Puan (4.9), dikey ayırıcı, üyelik progress bar (%75)
  - Standart Üyelik + AKTİF badge (bg-primary-blue)
- **Güvenlik** (bg-white):
  - 2-kolon grid: Şifre Güvenliği + 2FA Doğrulama kartları (bg-primary-blue/10)
  - Her kart: bg-dark-blue ikon tile + açıklama + aksiyon linki
- **Hesabı Kapat** (bg-red-500/10, border-red-300/50):
  - AlertTriangle ikonu, uyarı metni, "Hesabı Sil" butonu (bg-red-500/15)
  - "Hesabı Sil" → `showDelete` modal (absolute overlay, backdrop-blur-sm, NavigationPage cancel modal stili)
  - Modal onay: `deleteAccount()` (store) → `window.location.href = '/'`
  - `deleteAccount` store aksiyonu: `DELETE /users/me` (backend) → `supabase.auth.signOut` → store sıfırlama

### Security.tsx (156 satır) — Güvenlik sekmesi
- Flex layout: sol kolon (flex-[3]) + sağ kolon (flex-[2], self-start)
- **Sol kolon** (sırasıyla):
  - Parola Güncelle (bg-dark-blue): Mevcut/Yeni parola 2-kolon + Yeni Tekrar tam genişlik + bg-primary-blue "Parolayı Güncelle" butonu
  - Mail Güncelle (bg-dark-blue): Mevcut/Yeni mail 2-kolon + Tekrar tam genişlik + bg-primary-blue "Maili Güncelle" butonu
  - İki Adımlı Doğrulama (bg-white): AKTİF/PASİF badge, açıklama kutusu, bg-primary-blue toggle butonu (useState)
- **Sağ kolon**:
  - Aktif Oturumlar (bg-white): 3 oturum (Web/Mobil/Masaüstü), cihaz ikonu, konum+IP+tarih, AKTİF badge
  - Alt: "Diğer Tüm Oturumları Sonlandır" linki

### Preferences.tsx (185 satır) — Tercihler sekmesi
- Flex layout: sol kolon (flex-[3]) + sağ kolon (flex-[2], self-stretch)
- **Sol kolon**:
  - Görsel Arayüz (bg-white): Açık Mod / Koyu Mod önizleme kartları (tıklanabilir, border-primary-blue seçili)
  - Bölge & Dil (bg-white): Sistem Dili select + Saat Dilimi select
- **Sağ kolon**:
  - Bildirim Kanalları (bg-white, flex-1 tam yükseklik): E-Posta/SMS/Push toggle'ları (useState), SMS uyarı notu (sarı)
- **Alt aksiyon barı**: "Değişiklikleri İptal Et" + bg-primary-blue "Ayarları Uygula" butonu

### NeedHelp.tsx (125 satır) — Yardım Merkezi sekmesi
- **Hero banner** (bg-dark-blue): "Bugün size nasıl yardımcı olabiliriz?" + arama input'u
- **3-kolon kategori kartları** (bg-white): Kargolar, Faturalandırma, Teknik Destek
  - Her kart: bg-primary-blue/10 ikon tile, başlık, açıklama, ChevronRight linkleri
- **"Hâlâ yardıma mı ihtiyacınız var?"** (bg-darker-blue): Headphones+MessageSquare ikonlar, 24/7 destek açıklaması, yanıt süresi istatistikleri, bg-primary-blue CTA butonu

## Yapı
```
frontend/src/
├── lib/
│   ├── supabase.ts              (@supabase/supabase-js client — VITE_SUPABASE_*)
│   ├── api.ts                   (axios instance, JWT interceptor → FastAPI)
│   └── useDarkMode.ts           (MutationObserver hook — { dark, toggle }; shared by NavBar + LandingPage)
├── store/
│   └── auth.ts                  (Zustand: signUp, signIn, signOut, initialize, role, user, setAvatarUrl, updateProfile, refreshUser, deleteAccount)
├── services/                    (tüm API çağrıları buradan — lazy, sayfa içinde doğrudan api.* yok)
│   ├── taskService.ts           (getOpenTasks, getMyTasks, getTaskById, createTask, acceptTask, updateTaskStatus, setProofPhoto, verifyTask)
│   ├── walletService.ts         (getWalletSummary, deposit, withdraw)
│   ├── userService.ts           (createUser, getMe, updateMe, getUserById, deleteMe)
│   ├── locationService.ts       (postLocation, getLatestLocation)
│   ├── reviewService.ts         (createReview, getReviewsForUser)
│   └── disputeService.ts        (createDispute, getAllDisputes, resolveDispute)
├── components/
│   ├── NavBar.tsx               (LandingPage nav + rol bazlı Talep Oluştur / Talep Al)
│   ├── SecondNavBar.tsx         (blur-bg navbar — RequestPage, AboutUs)
│   ├── ReceiverNavBar.tsx       (beyaz navbar — kurye/takip/detay sayfaları)
│   ├── MapboxMap.tsx            (Mapbox GL JS wrapper — center, zoom, markers, route, showUserLocation props)
│   ├── Footer.tsx               (3-kolon footer)
│   ├── ContactInfo.tsx          (iletişim bilgileri — bg-dark-blue)
│   ├── DeliveryAmountCard.tsx   (TESLİMAT MİKTARI kartı — RecieverPage)
│   ├── WalletModal.tsx          (Bakiye Yükle / Para Çek modal — onConfirm(amount), ModalType export)
│   ├── ProofOfDeliveryModal.tsx (teslimat kanıtı modal — onConfirm(file: File|null))
│   ├── ReviewModal.tsx          (5 yıldız + yorum — onConfirm(score, comment))
│   ├── DisputeModal.tsx         (itiraz sebebi textarea — onConfirm(reason); min 5 karakter)
│   ├── settings.tsx             (ProfilePage — Ayarlar sekmesi)
│   ├── Security.tsx             (ProfilePage — Güvenlik sekmesi)
│   ├── Preferences.tsx          (ProfilePage — Tercihler sekmesi)
│   └── NeedHelp.tsx             (ProfilePage — Yardım Merkezi sekmesi)
├── pages/
│   ├── LandingPage.tsx          (/)
│   ├── AuthPage.tsx             (/giris, /kayit — Supabase auth)
│   ├── ForgotPasswordPage.tsx   (/sifremi-unuttum)
│   ├── Contact.tsx              (/iletisim)
│   ├── AboutUs.tsx              (/hakkimizda)
│   ├── RequestPage.tsx          (/talep)
│   ├── RecieverPage.tsx         (/talep-al)
│   ├── DeliveryDetailPage.tsx   (/talep/:id)
│   ├── TrackingPage.tsx         (/takip)
│   ├── NavigationPage.tsx       (/navigasyon)
│   ├── ProfilePage.tsx          (/profil)
│   ├── AdminDashboard.tsx       (/admin)
│   └── NotFoundPage.tsx         (* catch-all)
└── types/
    └── index.ts

frontend/.env                    (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL — gitignore)

backend/
├── requirements.txt
├── .env                         (DATABASE_URL, SUPABASE_JWT_SECRET — gitignore)
└── src/
    ├── main.py
    ├── database.py
    ├── security.py
    ├── models/                  (user, task_model, review, dispute, location, wallet)
    └── routers/                 (users, tasks, reviews, disputes, locations, wallet)

.vscode/
└── settings.json (CSS linter ayarları)
```

## CSS Değişkenler (index.css)
**Tailwind v4 @theme:**
```css
--font-primary: "Open Sans"
--font-secondary: "Roboto"
--font-tertiary: "Elms Sans"
--font-quertanary: "Anton"
--font-quintary: "Crimson Text"
--font-sextary: "Google Sans Flex"   /* varsayılan — tüm profil panellerinde kullanılır */
--color-primary-blue: #08b4fb
--color-secondary-blue: #1ea4dc
--color-tertiary-blue: #1e91c1
--color-dark-blue: #206988
--color-darker-blue: #004561
```

**Custom Classes:**
```css
.btn-hover-blue {
  transition: all 0.3s ease;
}
.btn-hover-blue:hover {
  background-color: var(--color-primary-blue);
  color: white;
}

.btn-hover-blue-secondary {
  transition: all 0.3s ease;
}

.btn-hover-blue-secondary:hover {
  background-color: var(--color-tertiary-blue);
  border-color: black;
  padding: 0px 15px 0px 15px;
  border-radius: 30px;
  color: white;
}

.btn-hover-shadow:hover {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
  transition: all ease 0.3;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

.fade-in-up-delay-1 {
  animation: fadeInUp 0.6s ease-out 0.2s forwards;
  opacity: 0;
}

.fade-in-up-delay-2 {
  animation: fadeInUp 0.6s ease-out 0.4s forwards;
  opacity: 0;
}

.fade-in-up-delay-3 {
  animation: fadeInUp 0.6s ease-out 0.6s forwards;
  opacity: 0;
}
```

**Kullanım:**
- Font: `className="font-primary"`
- Renkler: `bg-primary-blue`, `text-primary-blue` vb.
- Button hover: `className="btn-hover-blue"`
- Animasyonlar: `fade-in-up`, `fade-in-up-delay-1/2/3`

## Karanlık Mod Sistemi

**Kural**: Tüm dark mode overrides `html.dark .class` kurallarıyla `index.css`'de tanımlanır. Tailwind `dark:bg-*` / `dark:text-*` varyantları **kullanılmaz** — iki sistem aynı property'de çakışır.

- `html.dark` sınıfı `<html>` elementine `localStorage.setItem('hp_theme', ...)` + `document.documentElement.classList.toggle('dark', ...)` ile eklenir/çıkarılır
- Toggle: `useDarkMode()` hook (`frontend/src/lib/useDarkMode.ts`) — `{ dark: boolean, toggle: () => void }`; MutationObserver ile reaktif
- `index.html`'de sayfa yüklenmeden önce `hp_theme` localStorage'dan okunur ve `html` sınıfına uygulanır (flash yok)
- `dark:border-*` Tailwind varyantları kabul edilebilir (sadece renk değil, opacity modifier ile border)
- `bg-primary-blue` için hem light hem dark explicit kural var: `.bg-primary-blue { #08b4fb }` / `html.dark .bg-primary-blue { #0D2534 }`
- Özel sınıflar: `.auth-navbar`, `.theme-toggle-btn`, `.profile-bg::before` dark mod kuralları index.css'de tanımlı

## Güvenlik Katmanı (Faz 3 — tamamlandı)

### Backend güvenlik düzeltmeleri
- **`security.py`**: `get_jwt_sub()` bağımlılığı eklendi — JWT doğrular, DB lookup yapmadan `sub` UUID döner (kayıt endpoint'i için)
- **`routers/users.py` — `POST /users/`**: `get_jwt_sub` ile korunuyor; `payload.id != jwt_sub` ise 403, `role` allowlist dışındaysa 422 (Literal tip zorlaması)
- **`models/user.py` — `UserCreate.role`**: `str` → `Literal["sender", "courier"]` — admin rolü hiçbir zaman kayıt yoluyla atanamaz
- **`routers/tasks.py` — `PATCH /{id}/status`**: `cancelled` geçişinde sahiplik kontrolü eklendi (`current_user.id not in (sender_id, courier_id)` → 403)
- **`routers/tasks.py` — `POST /`**: `calculated_price` artık client'tan alınmıyor; `distance_km * weight_kg * open_time_multiplier` ile sunucu tarafında hesaplanıyor
- **`routers/wallet.py`**: `POST /deposit` için `_MAX_DEPOSIT = 10_000.0` üst sınırı eklendi
- **`main.py`**: CORS `allow_origins=["*"]` → `os.getenv("FRONTEND_URL", "http://localhost:5173")` (production'da `.env`'ye `FRONTEND_URL` eklenecek)

### Frontend güvenlik düzeltmeleri (`App.tsx`)
- **`PrivateRoute`**: `isLoggedIn` kontrolü — değilse `/giris`'e yönlendir
- **`SenderRoute`**: `isLoggedIn` + `role === 'sender'` — değilse `/giris` veya `/`'e yönlendir
- **`CourierRoute`**: `isLoggedIn` + `role === 'courier'` — değilse `/giris` veya `/`'e yönlendir
- **`AdminRoute`**: `isLoggedIn` + `role === 'admin'` — değilse `/giris` veya `/`'e yönlendir
- Route korumaları:
  - `/talep` → `SenderRoute`
  - `/talep/:id` → `PrivateRoute`
  - `/profil` → `PrivateRoute`
  - `/talep-al` → `CourierRoute`
  - `/takip` → `SenderRoute`
  - `/navigasyon` → `CourierRoute`
  - `/admin` → `AdminRoute`

### Güvenlik notları
- `FRONTEND_URL` production `.env`'ye eklenmeli: `FRONTEND_URL=https://handpocket.com`
- Supabase Dashboard → Auth → JWT expiry kısaltılabilir (varsayılan 1 saat)
- Supabase Dashboard → Auth → Refresh token rotation açık olmalı
- HTTPS deployment zorunlu (Render/Fly.io TLS termination)
- Kalan öneri: `DeliveryRequestCreate` modelinde `weight_kg`, `distance_km`, `open_time_multiplier` için Pydantic `Field(gt=0)` sınırları eklenebilir

---

## Production Hazırlık Katmanı (Faz 4 — tamamlandı)

### Güvenlik eklentileri
- **`main.py` — Rate limiting** (`slowapi>=0.1.9`): `POST /users/` → 5/dk, `POST /wallet/deposit` + `/withdraw` → 10/dk, `POST /tasks/` → 20/dk; 429 döner
- **`main.py` — HSTS middleware**: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` her yanıtta
- **`main.py` — Global exception handler**: yakalanmayan tüm hatalar `handpocket` logger'dan geçer, client'a traceback sızmaz
- **`models/user.py` — `UserPublicLimited`**: `GET /users/{user_id}` artık `wallet_balance` ve `is_banned` dönmüyor; yalnızca `GET /users/me` tam `UserPublic` döner
- **`security.py` — JWKS timeout**: `PyJWKClient(timeout=5, cache_keys=True)` — Supabase JWKS endpoint takılırsa auth istekleri sonsuza asılı kalmaz
- **Frontend — `npm audit fix`**: vite (high) + postcss (moderate) güvenlik açıkları kapatıldı

### Performans
- **`main.py` — GZipMiddleware**: `minimum_size=500` — JSON liste yanıtları ~%70 küçülür
- **`database.py` — Connection pooling**: `pool_size=10, max_overflow=20, pool_pre_ping=True, pool_recycle=300` — Supabase pooler ile stale connection hatası önlendi
- **`models/task_model.py` — Composite index**: `(status, created_at)` — `GET /tasks/open` sorgusu için optimize
- **`models/wallet.py` — Index**: `created_at` — işlem geçmişi sıralaması için
- **`routers/tasks.py` — TTLCache**: `GET /tasks/open` sonuçları 10 saniye bellekte; task oluşturma/kabul etmede anında temizlenir (`cachetools>=5.3.0`)

### Gözlemlenebilirlik
- **`main.py` — RequestLoggingMiddleware**: her istek için `method`, `path`, `status`, `duration_ms`, `ip` loglanır; 4xx+ WARNING seviyesinde
- **`security.py`**: auth hataları `reason` + `user_id` ile loglanır
- **`routers/wallet.py`**: deposit/withdraw işlemleri amount + yeni bakiye ile loglanır
- **`routers/tasks.py`**: task oluşturma `task_id`, `sender_id`, `price` ile loglanır

### Güvenilirlik
- **`main.py` — Health check (derin)**: `GET /health` artık `SELECT 1` ile DB bağlantısını doğrular; DB erişilemezse `503` döner — load balancer hatalı instance'ı devre dışı bırakır
- **`requirements.txt`**: `slowapi>=0.1.9`, `cachetools>=5.3.0` eklendi

### Üretim öncesi yapılacaklar (kod dışı)
- **Alembic**: `metadata.create_all()` schema migration için yetersiz — mevcut tablolarda kolon değişikliğini yaymaz; ilk deploy öncesi Alembic kurulmalı
- **Sentry**: `sentry-sdk[fastapi]` + 3 satır `main.py`'de; deploy günü ekle
- **Staging ortamı**: `staging` branch'inden Render/Fly.io free instance
- **Horizontal scale**: birden fazla instance'da `slowapi` Redis backend'e geçmeli (`Limiter(storage_uri="redis://...")`)

### Düzeltilen buglar
- **`RequestPage.tsx` — fiyat formülü uyumsuzluğu**: frontend `BASE_COST + distance×1.5 + weight×1.0 + priority×1.2` kullanıyordu; backend `distance × weight × multiplier` hesaplıyordu → gösterilen ücret ile kesilen ücret farklıydı. Frontend backend formülüyle eşleştirildi.
- **`routers/tasks.py` — kurye cüzdan kredisi**: önce `COMPLETED`'taydı, Faz 4'te geçici olarak `DELIVERED`'a taşındı, **Faz 5'te gönderici onay UI'ı geldikten sonra tekrar `COMPLETED`'a geri taşındı** — kurye sadece gönderici "Teslimatı Onayla" dediğinde kredilenir.
- **`NavigationPage.tsx` — profil yönlendirmesi**: teslimattan sonra `refreshUser()` eklendi, böylece `/profil`'e gidince cüzdan bakiyesi güncel görünür.

---

## v0.1 Mimari Boşluk Kapatma (Faz 5 — kısmen tamamlandı)

[Plan.md](Plan.md) yol haritasının ilk 3 maddesi tamamlandı.

### 1. Canlı Kurye Takibi — ✅ tamamlandı
- **`services/locationService.ts`**: `postLocation(task_id, lat, lng)`, `getLatestLocation(task_id)`; `LocationPin` interface'de `courier_id` yok (gereksiz exposure kaldırıldı)
- **`NavigationPage.tsx`**: status `accepted | picked_up` iken `watchPosition` + 30 sn throttled push (`lastPushRef`)
- **`TrackingPage.tsx`**: 15 sn polling, gerçek marker; sahte `animate-ping` overlay kaldırıldı; "Kurye konumu bekleniyor..." rozeti

#### Location endpoint güvenlik & performans (Faz 6)
- **Rate limit**: `POST /locations/` → `4/minute` (30-60 sn push aralığına 2× buffer); `slowapi` + `get_remote_address`
- **`courier_id` kaldırıldı**: `LocationPublic` response'dan çıkarıldı; DB'de saklanmaya devam eder
- **Lat/lng doğrulama**: `LocationCreate.latitude = Field(ge=-90, le=90)`, `longitude = Field(ge=-180, le=180)` — 422 döner
- **Task status guard**: sadece `accepted | picked_up` statüsündeki task'lara push izni; terminal/delivered task → 409
- **`timestamp` index**: `ORDER BY timestamp DESC` sorgusunu hızlandırır
- **`datetime.utcnow` → `datetime.now(timezone.utc)`**: Python 3.12+ deprecation düzeltildi

### 2. Gönderici Onayı (Sender Confirmation) — ✅ tamamlandı
- **Backend `routers/tasks.py`**: `PATCH /tasks/{id}/verify` endpoint (sender-only, `delivered → completed`, kurye cüzdanını kredilendirir)
- **Backend**: kurye kredilendirme `DELIVERED`'dan `COMPLETED`'a geri taşındı; hem `/verify` hem de generic `/status` (status=completed) bu noktada krediyi yatırır
- **Frontend `taskService.ts`**: `verifyTask(id)`
- **`DeliveryDetailPage.tsx`**: status `delivered` && sender → büyük proof fotoğrafı + "Teslimatı Onayla" butonu + "İtiraz Et" butonu
- **`types/index.ts`**: `RequestStatus` artık `COMPLETED` + `DISPUTED` içeriyor; `DeliveryRequest.delivery_proof_photo_url` eklendi

### 3. Reviews & Disputes UI — ✅ tamamlandı (admin resolve kısıtlı)
- **`services/reviewService.ts`**: `createReview`, `getReviewsForUser`
- **`services/disputeService.ts`**: `createDispute`, `getAllDisputes`, `resolveDispute`
- **`components/ReviewModal.tsx`**: 5 yıldız + opsiyonel yorum
- **`components/DisputeModal.tsx`**: sebep textarea (min 5 karakter)
- **`DeliveryDetailPage.tsx`**:
  - status `completed` && (sender || courier) → "Değerlendir" butonu
  - status `delivered` && sender → "İtiraz Et" butonu (verify ile yan yana)
- **`components/settings.tsx`**: "İstatistikler & Üyelik" puan değeri artık `user.average_rating?.toFixed(1)` (sabit 4.9 kaldırıldı)
- **`AdminDashboard.tsx`**: yeni "İtirazlar" sekmesi — `getAllDisputes()` tablosu, "Çözüldü olarak işaretle" aksiyonu
- **`types/index.ts`**: `User.avarage_rating` typo'su `average_rating` olarak düzeltildi (backend ile aynı); `Dispute` ve `Review` interface'leri eklendi/güncellendi
- **Kısıt**: Backend `resolve_dispute` sadece `resolved=True` flag çevirir; "kurye lehine / gönderici lehine bakiye transferi" Plan.md'de önerildi ama backend bunu desteklemiyor — kapsamı genişletmemek için sadece flag flip'lendi. İhtiyaç olursa `Dispute.outcome` kolonu + wallet adjustment eklenmeli.

### 4–6. Sıradakiler (henüz yapılmadı)
- **Bildirim Servisi** (Flow 1.7 / 2.8 / 3.3) — sağlayıcı kararı bekleniyor (in-app + email Resend / FCM / OneSignal)
- **Ödeme Hizmetleri** — iyzico/Stripe/PayTR kararı bekleniyor
- **AI Görüntü Doğrulama** — Claude Vision / Cloud Vision / EXIF kararı bekleniyor

---

## Kimlik doğrulama ve API (Faz 2 — başlangıç)

### Ortam değişkenleri
- **frontend** (`frontend/.env`, git'te yok): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (yalnızca tarayıcıda kullanılır; `sb_publishable_...`), `VITE_API_URL` (varsayılan `http://localhost:8000`)
- **backend** (`backend/.env`, git'te yok): `DATABASE_URL` (Supabase Postgres pooler), `SUPABASE_JWT_SECRET` (JWT doğrulama — `sb_secret_...` sadece sunucuda)

### Akış
1. **Kayıt**: `supabase.auth.signUp` → ardından `POST /users` ile `users` tablosuna profil (Supabase `auth.users` id ile); `POST` başarısız olsa bile auth kullanıcısı oluşmuş olur (best-effort, backend kapalıyken)
2. **Giriş**: `signInWithPassword` → `GET /users/me` ile rol ve profil
3. **Axios** (`api.ts`): her istekte `supabase.auth.getSession()` ile `Authorization: Bearer <access_token>`
4. **Uygulama açılışı**: `App.tsx` içinde `useAuthStore.initialize()` — geçerli session varsa profil yüklenir; `/users/me` başarısızsa Supabase oturumu temizlenir
5. **Çıkış**: `supabase.auth.signOut` + store sıfırlama (`ProfilePage`, `AdminDashboard`)

### MapboxMap.tsx
- Props: `center`, `zoom`, `markers`, `route`, `showUserLocation`
- `showUserLocation=true`: `navigator.geolocation.getCurrentPosition` ile kullanıcı koordinatları alınır → `jumpTo` ile harita oraya taşınır → özel mavi nokta marker eklenir; `GeolocateControl` de eklenir (canlı takip için)
- Konum alınamazsa (hata / izin reddedilmiş): sessizce fallback, harita prop'taki `center`'da kalır
- **Contact.tsx haritasında `showUserLocation` yok** — İstanbul sabit konumunda kalır

### Cüzdan API
- `GET /wallet/` → `WalletSummary { balance, stats, transactions }` — stats tamamlanan teslimatlardan hesaplanır
- `POST /wallet/deposit` → `{ amount }` — bakiye yükler, `credit` transaction kaydeder
- `POST /wallet/withdraw` → `{ amount }` — yetersiz bakiyede 400 döner, `debit` transaction kaydeder
- `POST /tasks/` — bakiye < `calculated_price` ise 402 döner; başarılıysa bakiyeyi düşer ve `debit` transaction kaydeder
- Task iptalinde gönderici bakiyesi iade edilir (`credit` transaction); tamamlamada kurye bakiyesi artırılır (`credit` transaction)
- `PATCH /tasks/{id}/proof` → `{ proof_url: string }` (JSON body) — teslimat kanıtı fotoğraf URL'ini kaydeder (yalnızca atanmış kurye)
- `GET /users/{id}` — giriş yapmış herhangi bir kullanıcı erişebilir; `UserPublicLimited` döner (`wallet_balance` ve `is_banned` hariç)

### Supabase Storage
- Teslimat kanıtı fotoğrafları için `delivery-proofs` adında **public** bucket oluşturulmalı (Supabase Dashboard → Storage)
- Upload path: `{task_id}/proof.{ext}` — upsert açık, bucket yoksa yükleme sessizce atlanır, teslimat yine de tamamlanır

### Güvenlik notu
- `sb_secret_` (service / JWT secret) **asla** frontend'e konmamalı; sadece backend `.env`.

### Test ipucu
- Supabase **Authentication → Providers → Email**: geliştirmede "Confirm email" kapalı olabilir; açıksa kullanıcı önce e-postayı onaylamalıdır.

## Kargo Talebi Formu Planı (DeliveryRequests)
### Kullanıcı Girdileri:
- package_description (text): Kargo içeriği açıklaması
- pickup_address (text): Alış adresi
- delivery_address (text): Teslim adresi
- package_photo_url (file upload): Ürün fotoğrafı
- weight_kg (decimal): Kargo ağırlığı (kg)
- open_time_multiplier (select): Aciliyet seviyesi (1.0=Normal, 1.5=Acil, 2.0=Çok Acil)

### Otomatik Hesaplananlar:
- distance_km: Harita API ile hesaplanır
- estimated_time_mins: Mesafe + trafik durumu
- calculated_price: (mesafe * ağırlık * aciliyet) formülü
- sender_id: Aktif kullanıcı
- status: "pending"

### İlgili Sistemler (System Context):
- Haritada İzleme (Google Maps API)
- Cloud Depolama (Fotoğraf upload)
- Ödeme Hizmetleri
- Bildirim Servisi

---

## v0.1 Mimari Boşluklar — Diagram Karşılaştırması

[Architecture/ER_Diagram.pdf](Architecture/ER_Diagram.pdf), [Architecture/System_Contex_Diagram.pdf](Architecture/System_Contex_Diagram.pdf) ve [Architecture/API_Sequence_Diagram.pdf](Architecture/API_Sequence_Diagram.pdf) ile yapılan denetim sonucu — **v0.1 demo için yeterli**, üretim için kapatılması gereken boşluklar:

### ER Diagram — ✅ Tam (extension'larla)
- Users, DeliveryRequests, Reviews (diagramda "Transactions" etiketli), Disputes — hepsi mevcut
- Ekstra: `wallet_transactions`, `locations` tabloları, `cancelled` status, `admin` rolü (kasıtlı)

### System Context dış servisler
- ✅ **Haritada İzleme** — Mapbox + OSRM + Nominatim
- ✅ **Cloud Depolama** — Supabase Storage (`delivery-proofs`)
- ❌ **Bildirim Servisi** — FCM/OneSignal/WebSocket yok. `Preferences.tsx`'teki email/SMS/push toggle'ları sadece `useState`, backend'e bağlı değil
- ❌ **Ödeme Hizmetleri** — Stripe/iyzico/PayTR yok. Cüzdan "deposit" gerçek para akışı olmadan sadece sayıyı artırıyor
- ❌ **Görüntü İşleme / Yapay Zeka** — teslimat kanıtı fotoğrafları yükleniyor ama AI doğrulaması yok

### API Sequence Diagram — eksik adımlar
- **Flow 1, adım 7**: "Çevredeki aktif kuryelere bildirim tetikle" → ❌ uygulanmadı (Bildirim Servisi yok)
- **Flow 2, adım 8**: "Göndericiye bilgilendirme mesajı" → ❌ uygulanmadı
- **Flow 3, adım 3**: "Göndericiye kanıt fotoğrafıyla bildirim ilet" → ❌ uygulanmadı
- **Flow 2, adım 6**: `POST /verify` (gönderici onayı → completed) → ✅ **Faz 5'te tamamlandı** (`PATCH /tasks/{id}/verify` + DeliveryDetailPage UI)

### Frontend service katmanı eksikleri — ✅ Faz 5'te tamamlandı
- `/reviews` → ✅ `reviewService.ts` + ReviewModal + DeliveryDetailPage entegrasyonu
- `/disputes` → ✅ `disputeService.ts` + DisputeModal + DeliveryDetailPage + AdminDashboard "İtirazlar" sekmesi
- `/locations` → ✅ `locationService.ts` + NavigationPage push + TrackingPage polling (sahte marker kaldırıldı)

### Mobil branch'e geçmeden önce notlar
- Bildirim servisi mobilde daha kritik (push notifications) — backend tarafında entegrasyon kararı verilmeli (FCM önerilir)
- Live tracking için locations endpoint'i hazır; mobilde courier app'ten her 30-60 sn `POST /locations/` atılmalı, sender app'te de `GET /locations/{id}/latest` polling
- Reviews/Disputes UI mobile-first tasarlanabilir; web'de eksik kalsa da olur

---

## Bildirim Servisi (Faz 7 — Mimari)

Plan.md item 4 (Bildirim Servisi) için seçilen mimari — **bu faz yalnızca karar kaydı, kod yok**. Web kapsamlıdır; mobil entegrasyonu kendi branch'inde planlanacak.

### Kapsam ve kanal seçimi
- **v0.1 = yalnızca uygulama içi (in-app) DB tabanlı bildirim akışı.** FCM (push), Email (Resend), SMS — ileri faza ertelendi.
- [Preferences.tsx](frontend/src/components/Preferences.tsx) içindeki E-Posta / SMS / Push toggle'ları görsel olarak kalır ama "yakında" rozeti ile işaretlenir; gerçek backend kolonuna bağlanmaz.
- WebSocket / SSE yok; bell ikonu 60 sn'de bir `unread-count` polling yapar.

### Veri modeli
- Yeni tablo `notifications`:
  - `id` (uuid pk), `user_id` (fk `users.id`, indexed)
  - `type` (str): `task_created` (rezerve, henüz tetiklenmiyor), `task_accepted`, `task_picked_up`, `task_delivered`, `task_verified`, `task_cancelled`, `dispute_opened`, `dispute_resolved`
  - `title` (str, TR) — bell satırında kalın başlık
  - `body` (str, TR) — kısa açıklama
  - `data_json` (jsonb) — örn. `{ "request_id": "...", "actor_id": "..." }`; deep-link için
  - `read_at` (nullable datetime), `created_at` (datetime)
- Composite index: `(user_id, read_at)` — unread count sorgusu için
- Index: `created_at desc` — liste sıralaması için
- **Yeni `users` kolonu yok.** Notification preferences tablosu yok (v0.1 scope dışı).

### Backend servis katmanı
- `backend/src/services/notify.py` — tek fonksiyon:
  - `notify(session, user_id: str, type: str, title: str, body: str, data: dict | None = None) -> Notification`
  - Saf DB insert + commit. Dış IO yok.
  - **Tek soyutlama noktası**: gelecekte FCM/Email/SMS eklendiğinde fan-out burada yapılır; çağıran yerler (`tasks.py`, `disputes.py`) değişmez.

### REST kontratı
- `GET /notifications/` — current user'ın bildirimleri, `created_at desc`, default limit 50
- `GET /notifications/unread-count` — `{ count: int }` (bell badge için)
- `PATCH /notifications/{id}/read` — tek bildirimi okundu işaretler
- `POST /notifications/read-all` — tüm bildirimleri okundu işaretler ("Tümünü oku" linki)
- Yazma uçları (yeni bildirim oluşturma) **public değildir**; yalnızca `services/notify.py` çağırır.

### Tetikleyici noktalar (Faz 1'de bildirilir, Faz 3'te bağlanır)
Sadece bu yedi noktadan `notify()` çağrılır:
- [tasks.py:44-77](backend/src/routers/tasks.py#L44-L77) `create_task` → **bildirim yok** (Flow 1.7 — coğrafi kurye filtresi olmadan tüm kuryelere spam olur)
- [tasks.py:119-138](backend/src/routers/tasks.py#L119-L138) `accept_task` → göndericiye `task_accepted`
- [tasks.py:141-200](backend/src/routers/tasks.py#L141-L200) `update_status` → `picked_up` / `delivered` / `cancelled` için göndericiye; gönderici iptalinde kuryeye
- [tasks.py:203-237](backend/src/routers/tasks.py#L203-L237) `verify_task` → kuryeye `task_verified` ("kredilendiniz")
- [tasks.py:240-256](backend/src/routers/tasks.py#L240-L256) `set_proof` → `delivered` transition zaten kapsar, ayrı bildirim yok
- [disputes.py:13-30](backend/src/routers/disputes.py#L13-L30) `raise_dispute` → karşı tarafa `dispute_opened`
- [disputes.py:43-55](backend/src/routers/disputes.py#L43-L55) `resolve_dispute` → açan kişiye `dispute_resolved`

### Frontend kontratı
- `frontend/src/services/notificationService.ts` — `getNotifications()`, `getUnreadCount()`, `markRead(id)`, `markAllRead()`
- `frontend/src/components/NotificationBell.tsx` — ortak bell komponenti; üç navbar'da da kullanılır:
  - [NavBar.tsx](frontend/src/components/NavBar.tsx) (Landing)
  - [ReceiverNavBar.tsx](frontend/src/components/ReceiverNavBar.tsx) (kurye/takip sayfaları)
  - [SecondNavBar.tsx](frontend/src/components/SecondNavBar.tsx) (RequestPage, AboutUs)
- Davranış: 60 sn'de bir `getUnreadCount()`; dropdown açıldığında `getNotifications()` çekilir; satır tıklanınca `markRead(id)` + `/talep/{request_id}`'e yönlendirme

### Kapsam dışı (scope creep'i engellemek için açıkça)
- Push notifications (FCM / OneSignal / Web Push)
- Email (Resend / SendGrid)
- SMS
- In-app ses / masaüstü browser notifikasyonu
- Notification grouping / mute-by-type
- Eski bildirim temizlik cron'u (retention)
- Mobil istemci entegrasyonu

### Sıradaki fazlar
- **Faz 2 — Framework**: ✅ tamamlandı (aşağıda)
- **Faz 3 — Wiring**: yedi tetik noktasına `notify(...)` çağrıları eklenir; E2E akış doğrulanır.

---

## Bildirim Servisi (Faz 7 — Framework) — ✅ tamamlandı

İskelet kuruldu, tetikleyici henüz bağlanmadı. Mimariye birebir uyar (Faz 7 — Mimari'deki kararlar).

### Backend
- **`backend/src/models/notification.py`**: `Notification` tablosu — `id`, `user_id` (fk + index), `type`, `title`, `body`, `data_json` (Postgres JSONB), `read_at`, `created_at`. Composite index `(user_id, read_at)` (`ix_notifications_user_read`). `created_at` index'i unread sorgusunu hızlandırır. `NotificationPublic` ve `UnreadCount` response modelleri.
- **`backend/src/services/notify.py`**: tek fonksiyon `notify(session, user_id, type, title, body, data=None) -> Notification`. Pure DB insert + commit + logger info. Dış IO yok. **Routers dışından çağrılmaz** — Faz 3'te tetikleyici noktalardan kullanılacak.
- **`backend/src/routers/notifications.py`**: 4 endpoint, hepsi `get_current_user` ile korunuyor:
  - `GET /notifications/` — limit query (default 50, max 200), `created_at desc`
  - `GET /notifications/unread-count` → `{ count }`
  - `PATCH /notifications/{id}/read` — sahiplik kontrolü; idempotent (zaten okunduysa no-op)
  - `POST /notifications/read-all` → `{ updated: int }`
- **`backend/src/main.py`**: `notifications` router import edildi ve `app.include_router(notifications.router)` ile kaydedildi (line 117 civarı). `services/__init__.py` boş paket olarak eklendi.

### Frontend
- **`frontend/src/types/index.ts`**: `NotificationType` union + `AppNotification` interface (backend `NotificationPublic` ile birebir).
- **`frontend/src/services/notificationService.ts`**: `getNotifications(limit=50)`, `getUnreadCount()`, `markRead(id)`, `markAllRead()` — diğer servislerle aynı axios + JWT pattern.
- **`frontend/src/components/NotificationBell.tsx`**: ortak bell komponenti
  - Props: `variant?: 'dark' | 'light'` (NavBar/SecondNavBar light arka plan → `dark` ikon; LandingPage NavBar zaten kullanıyor)
  - **60 sn polling**: `getUnreadCount()` `setInterval` ile; cleanup mount/unmount + `isLoggedIn` değişiminde
  - Dropdown açılışında `getNotifications()` çekilir (lazy)
  - Outside-click handler ile dropdown kapanır
  - Satır tıklama: `markRead(id)` (zaten okunmadıysa) → state güncelleme → `data_json.request_id` varsa `/talep/{id}`'e yönlendirme
  - "Tümünü oku" butonu sadece okunmamış satır varken görünür
  - Badge: 99+ cap, kırmızı, sağ üst köşe
  - `formatRelative()`: "şimdi" / "X dk" / "X sa" / "X g" (TR kısaltma)
- **Mount noktaları**: `isLoggedIn && <NotificationBell />` üç navbar'da da, avatar'ın solunda:
  - [NavBar.tsx](frontend/src/components/NavBar.tsx) (LandingPage)
  - [ReceiverNavBar.tsx](frontend/src/components/ReceiverNavBar.tsx)
  - [SecondNavBar.tsx](frontend/src/components/SecondNavBar.tsx)

### Test ipucu
Bildirim akışı tetiklenmediğinden el ile test edilir:
1. Supabase Studio → `notifications` tablosuna satır ekle: `user_id` = giriş yapmış kullanıcının UUID'si, `type = 'task_accepted'`, `title = 'Test'`, `body = 'Test bildirimi'`, `data_json = {"request_id": "<bir task id>"}`
2. Bell ikonu 60 sn içinde "1" badge gösterir (veya sayfa yenileme anında)
3. Dropdown aç → satıra tıkla → `read_at` set olur, badge 0'a düşer, `/talep/{id}` yönlendirmesi çalışır

### Faz 3'e kalan
- `tasks.py` ve `disputes.py` tetik noktalarından `notify(session, ...)` çağrıları (Faz 7 — Mimari §5'teki yedi nokta) → ✅ aşağıda

---

## Bildirim Servisi (Faz 7 — Wiring) — ✅ tamamlandı

### Refactor (önce)
- `tasks.py` içindeki **kurye kredilendirme** mantığı iki yerde (update_status → completed ve verify_task) birebir tekrarlanıyordu → `_credit_courier_for_delivery(session, task)` helper'ına çıkarıldı.
- `tasks.py` içindeki **gönderici iade** mantığı (cancelled) tek yerde kullanılıyor ama tutarlılık için aynı pattern ile `_refund_sender_for_cancellation(session, task)` helper'ına çıkarıldı.
- Her iki helper saf state mutation yapar; commit'i çağıran fonksiyon yapar.

### `_safe_notify` wrapper
- `tasks.py` ve `disputes.py` içinde aynı imzalı `_safe_notify(session, user_id, type, title, body, request_id, actor_id=None)` helper'ı var.
- `notify()` başarısız olursa (DB hatası vb.) `logger.warning` ile loglanır, **kullanıcının asıl aksiyonu (accept/verify/cancel/dispute) etkilenmez**.
- `user_id` None ise sessizce no-op (örn. gönderici henüz kabul edilmemiş bir talebi iptal ediyorsa kuryeye bildirim atılmaz).

### Tetik noktaları (yedisi de bağlandı)

| Konum | Tetik | Alıcı | type | Başlık | Body |
|-------|-------|-------|------|--------|------|
| `tasks.py` `accept_task` | kurye kabul eder | `task.sender_id` | `task_accepted` | Talebiniz kabul edildi | Kuryeniz yola çıkıyor. |
| `tasks.py` `update_status` `picked_up` | kurye yola çıkar | `task.sender_id` | `task_picked_up` | Kargonuz alındı | Kuryeniz kargoyu teslim aldı. |
| `tasks.py` `update_status` `delivered` | kurye teslim eder | `task.sender_id` | `task_delivered` | Kargo teslim edildi | Kanıt fotoğrafını inceleyip teslimatı onaylayabilirsiniz. |
| `tasks.py` `update_status` `cancelled` | herhangi bir taraf iptal eder | **karşı taraf** | `task_cancelled` | Teslimat iptal edildi | (kim iptal ettiğine göre asimetrik metin) |
| `tasks.py` `update_status` `completed` | gönderici generic endpoint'ten onaylar | `task.courier_id` | `task_verified` | Ödemeniz cüzdanınıza geçti | Gönderici teslimatı onayladı. |
| `tasks.py` `verify_task` | gönderici `/verify` ile onaylar | `task.courier_id` | `task_verified` | Ödemeniz cüzdanınıza geçti | Gönderici teslimatı onayladı. |
| `disputes.py` `raise_dispute` | itiraz açılır | **karşı taraf** | `dispute_opened` | Teslimat için itiraz açıldı | Karşı taraf bu teslimat için itiraz açtı. |
| `disputes.py` `resolve_dispute` | admin çözer | `dispute.raised_by` | `dispute_resolved` | İtirazınız çözüldü | Açtığınız itiraz çözümlendi olarak işaretlendi. |

- `data_json` her zaman `{ "request_id": <id>, "actor_id": <current_user.id> }` içerir; `NotificationBell` satır tıklamada `/talep/{request_id}`'e yönlendirir.
- `set_proof_photo` ayrı bildirim atmaz — `delivered` transition'ı zaten kapsar (mimari §5 kararı).

### E2E test
1. Gönderici hesabıyla talep oluştur (`/talep`) — sender'ın cüzdanından ücret düşer.
2. Kurye hesabıyla `/talep-al`'dan kabul et → **sender'ın bell'i 60 sn içinde 1 olur**, "Talebiniz kabul edildi" satırı görünür.
3. Navigasyon sayfasında "Tamamla" → `delivered` → sender'a bildirim.
4. Sender `/talep/{id}`'de "Teslimatı Onayla" → kurye'ye `task_verified` bildirim + cüzdan kredisi.
5. Sender "İtiraz Et" → kurye'ye `dispute_opened` bildirim.
6. Admin panelinde "Çözüldü" → itiraz açan kişiye `dispute_resolved` bildirim.

### Plan.md item 4 — durum
- ✅ Bildirim Servisi (in-app, web) tamamlandı. Email/SMS/Push hala ertelenmiş durumda; Preferences toggle'ları ileride bağlanacak.

---

## Bildirim & İtiraz Sertleştirme (Faz 8 — Güvenlik & Performans)

Faz 5 (Reviews/Disputes) ve Faz 7 (Bildirim Servisi) eklendikten sonra yapılan denetim sonucu uygulandı.

### Performans
- **`GET /notifications/unread-count`**: artık `select(func.count())` kullanıyor — tüm satırları materialize etmek yerine tek `int` döner. 60 sn polling × N kullanıcı yüküne uygun.
- **`POST /notifications/read-all`**: tek bulk `UPDATE notifications SET read_at = :now WHERE user_id = :u AND read_at IS NULL` — N round-trip yerine 1.
- **`GET /disputes/mine`**: önce iki sorgu + Python tarafında `IN (...)` listesi vardı; artık tek `JOIN` ile `Dispute → DeliveryRequest` üzerinden `OR (raised_by | sender_id | courier_id == me)` filtresi. `Dispute.created_at desc` ile sıralı.

### Güvenlik
- **Rate limit (`slowapi`)** `/notifications/*` üzerine eklendi:
  - `GET /` → 30/dk
  - `GET /unread-count` → 120/dk (60 sn polling × 2 buffer)
  - `PATCH /{id}/read` → 60/dk
  - `POST /read-all` → 10/dk
- **`notify()` tip imzası sertleştirildi**: `type` parametresi artık `NotificationType = Literal[...]` (8 değer). `_safe_notify` helper'ları da aynı tipi alır — IDE/static check yanlış string'i yakalar.
- **`data_json` artık Pydantic model**: `NotificationData(request_id: str, actor_id: Optional[str])`. `notify()` raw dict yerine model alır; `model_dump()` ile JSONB'ye yazılır. DB kolonu hâlâ JSONB (esneklik), ama yazma yolu tip-güvenli.

### Retention
- **Yeni endpoint**: `DELETE /notifications/purge?older_than_days=30` (admin-only) — read olup verilen günden eski bildirimleri siler. Cron tetiklemesi için: `curl -X DELETE -H "Authorization: Bearer <admin_jwt>" .../notifications/purge?older_than_days=30`.
- Alembic + cron entegrasyonu Plan.md "Üretim öncesi yapılacaklar"da; endpoint hazır, planlayıcı bekliyor.

### Frontend
- `NotificationBell` üstüne tek-mount uyarısı yorumu eklendi. Her instance kendi 60 sn `setInterval`'ini tutar; aynı sayfada iki bell render edilirse polling iki katına çıkar.

### Değiştirilen dosyalar
- [backend/src/routers/notifications.py](backend/src/routers/notifications.py) — perf rewrite + rate limit + `/purge`
- [backend/src/routers/disputes.py](backend/src/routers/disputes.py) — `/mine` JOIN
- [backend/src/routers/tasks.py](backend/src/routers/tasks.py) — `_safe_notify` tip imzası
- [backend/src/services/notify.py](backend/src/services/notify.py) — tipli signature
- [backend/src/models/notification.py](backend/src/models/notification.py) — `NotificationType` Literal + `NotificationData` model
- [frontend/src/components/NotificationBell.tsx](frontend/src/components/NotificationBell.tsx) — tek-mount yorumu

---

## İkinci Tur Sertleştirme (Faz 8.1)

Faz 8 sonrası son denetimde tespit edilen kalan iyileştirmeler uygulandı.

### DRY
- **`safe_notify` artık `services/notify.py`'da**: önceden `tasks.py` ve `disputes.py` içinde birebir tekrarlanan `_safe_notify` helper'ı kaldırıldı; her ikisi de `from ..services.notify import safe_notify` ile aynı fonksiyonu kullanıyor. Tek değişiklik noktası — Sentry/email ileride eklenirse iki dosyayı senkron tutmak zorunda değiliz.

### Güvenlik
- **`POST /disputes/`** artık `slowapi.limit("10/minute")` ile rate-limit'li. Auth'lu kötü niyetli kullanıcı karşı tarafa bildirim spam'leyemez.

### Performans / pagination
- **`GET /tasks/my`** artık `limit` (1-500, default 200) + `offset` query parametreleri kabul ediyor; `created_at desc` ile sıralı. ProfilePage uzun vadede tüm geçmişi tek çağrıda çekmeyecek.
- **`GET /disputes/`** (admin) artık `limit` (1-500, default 100) + `offset` parametreleri kabul ediyor; `created_at desc` ile sıralı. AdminDashboard İtirazlar sekmesi büyük tablo altında çökmeyecek.

### NotificationBell
- **Tab gizliyken polling duruyor**: `document.visibilityState !== 'visible'` iken `getUnreadCount` çağrısı atlanır.
- **Visibility resume**: tab tekrar görünür olduğunda anında bir `tick()` tetiklenir (60 sn beklemez).
- **Skip-refetch heuristiği**: dropdown açılışında `count` son fetch'ten beri değişmemişse ve `items` zaten varsa, `getNotifications()` tekrar çağrılmaz. `lastFetchedCountRef` ile takip edilir.

### Kalan kabul edilebilir konular (v0.1 dışında ele alınacak)
- `slowapi` in-memory (horizontal scale → Redis)
- Alembic migration
- `notify()` ek bir commit yapar (BG queue ile çözülebilir)
- `locations` retention
- `notifications` retention için cron tetiklemesi (endpoint hazır: `DELETE /notifications/purge`)
- Kalan unbounded list'ler: `GET /users/` admin endpoint'i (varsa) ileride paginate edilebilir.