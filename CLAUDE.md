# HandPocket - Proje Bağlamı

## Proje
- **Tip**: React/TypeScript kargo uygulaması
- **Renk**: #08b4fb (mavi tema)
- **Dil**: Türkçe

## Aktif Değişiklikler
### NavBar.tsx
- Nav linkleri: Anasayfa, Hakkımızda, İletişim
- Giriş yokken: Giriş Yap, Kayıt Ol (pill butonlar)
- Giriş varken: profil avatarı → /profil
- Rol bazlı ek link: `sender` → **Talep Oluştur** (/talep), `courier` → **Talep Al** (/talep-al); diğer rolde karşı tarafın linki gösterilmez
- `useAuthStore`: `isLoggedIn`, `role`

### LandingPage.tsx (85 satır)
- 2 kolonlu grid layout
- Sol: Mavi panel (#08b4fb) + slogan "HIZLI VE GÜVENLİ"
- Sağ: NavBar komponenti
- Alt: 3 özellik kartı (Gönderim, Teslimat, Memnuniyet)
- Asset'ler: Logo, yol, ikonlar, store logoları
- fade-in-up animasyonu kullanımı

### AuthPage.tsx (/giris, /kayit)
- Arka plan: `RgLg_bg.png` (blur + koyu overlay), üstte logo + NavBar
- Stitch referansına yakın tek ortalanmış kart (`bg-secondary-blue`), Lucide ikonlar (Mail, Lock, User, ArrowRight, ShieldCheck, Loader2)
- Giriş / Kayıt tek kart içinde `activeForm` ile; alt linkten form değişimi; `fade-in-up` ile geçiş animasyonu
- Kontrollü input state; hata bandı (`useAuthStore.error` + `clearError`); gönderimde `loading` + spinner
- **Kayıt**: Ad Soyad, E-posta, E-posta Tekrar, Parola, Parola Tekrar, Gönderici/Kurye seçici → `signUp` (Supabase + profil satırı)
- **Giriş**: E-posta, Parola → `signIn` (Supabase + `GET /users/me` ile rol)

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

### RequestPage.tsx (127 satır)
- Kargo talebi oluşturma sayfası (gönderici rolü)
- SecondNavBar kullanımı
- 23/77 grid layout: sol form paneli + sağ Google Maps iframe
- Sol: Kargo Adı, Başlangıç/Bitiş Konumu, Paket Fotoğrafı (opsiyonel), Ağırlık, Öncelik
- Sağ harita: h-[850px] Google Maps iframe
- Harita üstünde toggle butonu (isPanelVisible useState) + compact hesaplama paneli (w-56, absolute bottom-4 right-4)
- Hesaplama paneli: Mesafe / Süre / Hesaplanan Ücret + "Teslimat Oluştur" butonu

### RecieverPage.tsx
- Kurye rolü için açık talepleri görme ve kabul etme sayfası
- Route: /talep-al
- 3-kolon grid: [22%_1fr_22%] — sol detay paneli + orta harita + sağ bekleyen talepler listesi
- ReceiverNavBar + DeliveryAmountCard kullanımı
- Sol panel: seçili talebin read-only alanları (Kargo Adı, Başlangıç, Bitiş, Ağırlık, Öncelik badge) + DeliveryAmountCard
- Orta: h-[850px] Google Maps iframe
- Sağ: kaydırılabilir bekleyen talepler listesi (bg-secondary-blue header, beyaz kartlar, aktif seçim ring)
- availableRequests mock data (6 talep), useState ile seçili talep yönetimi
- priorityLabel / priorityBadge yardımcı fonksiyonlar
- **Kabul Et** (`DeliveryAmountCard.onAccept`): `useNavigate` ile **/navigasyon** (NavigationPage) — API henüz bağlı değil

### TrackingPage.tsx (176 satır)
- Gönderi canlı takip sayfası (gönderici rolü)
- Route: /takip
- ReceiverNavBar kullanımı
- 23/77 grid: sol 3 kart + sağ tam yükseklik harita
- Sol kartlar: Status Card (Gönderi ID + ETA + Mesafe), Cargo Details Card (Timeline: BAŞLANGIÇ→TESLİMAT + ağırlık/öncelik), Courier Card (ad, filo ID, araç/plaka, telefon butonu)
- Sağ harita: h-[calc(100vh-160px)], pulsing kurye marker overlay (animate-ping + bg-secondary-blue)

### DeliveryDetailPage.tsx (327 satır)
- Tekil teslimat detay sayfası
- Route: /talep/:id (useParams ile id okuma)
- ReceiverNavBar kullanımı
- 30/70 grid: sol 3 kart + sağ harita
- Sol kartlar: ID+Status Card, Durum Zaman Çizelgesi (4-adım timeline: Talep → Kabul → Alındı → Teslim), Kargo Bilgileri (açıklama, ağırlık, öncelik, mesafe, güzergah)
- StatusBadge inline component (renk kodlu, Lucide ikonlar)
- statusOrder / statusSteps ile timeline render
- Kabul durumunda "Canlı Takip" linki (/takip)
- Bulunamayan ID için 404 fallback ekranı

### NavigationPage.tsx (157 satır)
- Kurye navigasyon sayfası (tam ekran harita)
- Route: /navigasyon
- Full-screen iframe harita (absolute inset-0)
- Sol üst: Dönüş talimatı kartı (mesafe + talimat) + Tahmini varış / kalan km kartı
- Sağ üst: Rota Zaman Çizelgesi paneli (Alım → Yolda → Varış → Teslim)
- Alt: Kargo Özellikleri (ağırlık/mesafe/ID) + İptal / Tamamla butonları
- ProofOfDeliveryModal entegrasyonu (useState showProofModal)

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

### AdminDashboard.tsx (268 satır)
- Admin paneli
- Route: /admin
- ProfilePage ile aynı sidebar+main layout (profile-bg, relative flex h-screen)
- Sidebar (bg-darker-blue, w-52): ShieldCheck ikon, Admin Paneli başlık, 3 nav: Genel Bakış/Kullanıcılar/Teslimatlar (Lucide ikonlar), Çıkış Yap
- **Çıkış Yap**: `useAuthStore.signOut` + `navigate('/')` (Supabase oturumu kapanır)
- Header: logo sol + "Admin Paneli" merkez
- AdminNav tipi: 'genel' | 'kullanicilar' | 'teslimatlar'
- **Genel Bakış**: 4 stat kartı (Kullanıcı/Kurye/Teslimat/Gelir) + Son Teslimatlar tablosu + Son Kullanıcılar tablosu
- **Kullanıcılar**: Tüm kullanıcılar tablosu (Ad, E-Posta, Rol badge, Bakiye, Puan, Durum, Yasakla/Kaldır butonu)
- **Teslimatlar**: Tüm teslimatlar tablosu (ID, Açıklama, Güzergah, Mesafe, Ücret, Durum badge)

### Footer.tsx (27 satır) - eski FooterButtons
- 3 kolonlu footer layout
- Logo + Hizmetler/Hakkımızda/İletişim linkleri + Copyright
- btn-hover-blue efektleri

### ProfilePage.tsx (188 satır)
- Route: /profil
- relative flex h-screen layout: sol sidebar + sağ main content
- Arka plan: assets/RgLg_bg.png (absolute, opacity-50, blur-sm, z-[-1])
- **Sidebar** (bg-darker-blue, w-52):
  - Üst: Profil fotoğrafı (yuvarlak), Ad, Telefon, Email
  - Orta nav: Teslimatlar, Ayarlar, Güvenlik, Tercihler (Lucide ikonlar)
  - Aktif nav item: bg-dark-blue + beyaz yazı (useState ile)
  - Alt: Yardım Merkezi (NeedHelpPanel), Çıkış Yap (kırmızı) — `signOut()` + ana sayfaya yönlendirme
- **Navbar** (bg-white, py-5): Logo sol, Anasayfa/Hakkımızda/İletişim sağ
- **NavItem tipi**: 'teslimatlar' | 'ayarlar' | 'guvenlik' | 'tercihler' | 'yardim'
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

### settings.tsx (181 satır) — Ayarlar sekmesi
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
│   └── api.ts                   (axios instance, JWT interceptor → FastAPI)
├── store/
│   └── auth.ts                  (Zustand: signUp, signIn, signOut, initialize, role, user)
├── components/
│   ├── NavBar.tsx               (LandingPage nav + rol bazlı Talep Oluştur / Talep Al)
│   ├── SecondNavBar.tsx         (blur-bg navbar — RequestPage, AboutUs)
│   ├── ReceiverNavBar.tsx       (beyaz navbar — kurye/takip/detay sayfaları)
│   ├── Footer.tsx               (3-kolon footer)
│   ├── ContactInfo.tsx          (iletişim bilgileri — bg-dark-blue)
│   ├── DeliveryAmountCard.tsx   (TESLİMAT MİKTARI kartı — RecieverPage)
│   ├── ProofOfDeliveryModal.tsx (teslimat kanıtı modal — NavigationPage)
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
    ├── models/                  (user, task_model, review, dispute, location)
    └── routers/                 (users, tasks, reviews, disputes, locations)

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