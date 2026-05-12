# HandPocket - Proje Bağlamı

## Proje
- **Tip**: React/TypeScript kargo uygulaması
- **Renk**: #08b4fb (mavi tema)
- **Dil**: Türkçe

## Aktif Değişiklikler
### NavBar.tsx (24 satır)
- Nav butonları: Anasayfa, Hakkımızda, İletişim, Şikayet
- Auth butonları: Giriş Yap, Kayıt Ol
- Flexbox layout, Tailwind CSS
- React Router Link kullanımı

### LandingPage.tsx (85 satır)
- 2 kolonlu grid layout
- Sol: Mavi panel (#08b4fb) + slogan "HIZLI VE GÜVENLİ"
- Sağ: NavBar komponenti
- Alt: 3 özellik kartı (Gönderim, Teslimat, Memnuniyet)
- Asset'ler: Logo, yol, ikonlar, store logoları
- fade-in-up animasyonu kullanımı

### AuthPage.tsx (163 satır) - eski LgnRgstrBtns
- Toggle tabanlı auth sistemi
- İki form yan yana grid layout
- Aktif form: Beyaz arka plan + mavi border vurgusu
- Pasif form: Koyu mavi arka plan
- onClick ile form geçişi
- useState hook: activeForm ('login' | 'register')
- Route: /giris ve /kayit

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

### RecieverPage.tsx (274 satır)
- Kurye rolü için açık talepleri görme ve kabul etme sayfası
- Route: /talep-al
- 3-kolon grid: [22%_1fr_22%] — sol detay paneli + orta harita + sağ bekleyen talepler listesi
- ReceiverNavBar + DeliveryAmountCard kullanımı
- Sol panel: seçili talebin read-only alanları (Kargo Adı, Başlangıç, Bitiş, Ağırlık, Öncelik badge) + DeliveryAmountCard
- Orta: h-[850px] Google Maps iframe
- Sağ: kaydırılabilir bekleyen talepler listesi (bg-secondary-blue header, beyaz kartlar, aktif seçim ring)
- availableRequests mock data (6 talep), useState ile seçili talep yönetimi
- priorityLabel / priorityBadge yardımcı fonksiyonlar

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
  - Alt: Yardım Merkezi (NeedHelpPanel), Çıkış Yap (kırmızı)
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
├── components/
│   ├── NavBar.tsx               (LandingPage nav + Giriş/Kayıt butonları)
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
│   ├── AuthPage.tsx             (/giris, /kayit)
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

## Sohbet
- [21/04] CLAUDE.md oluşturuldu
- [21/04] CSS root değişkenleri eklendi (renkler + fontlar)
- [21/04] Tailwind v4 @theme'e taşındı, font-primary class'ı çalışır hale getirildi
- [21/04] LandingPage overflow düzeltildi (section + sağ kolon)
- [22/04] CSS @import hatası düzeltildi (Google Fonts import'u Tailwind'den önce taşındı)
- [22/04] CSS linter hatası çözüldü (.vscode/settings.json ile @theme kuralı ignore edildi)
- [22/04] Font import'ları düzenlendi (Bowlby One SC, Anton, Crimson Text eklendi)
- [22/04] Font değişken yazım hatası düzeltildi (quertanary → quaternary)
- [22/04] Button hover class'ı eklendi (.btn-hover-blue - transition + mavi hover efekti)
- [24/04] FooterButtons komponenti oluşturuldu (2 section: logo/linkler ve iletişim bilgileri)
- [24/04] FooterButtons'a yatay ayırıcı çizgi eklendi (hr elementi)
- [24/04] LgnRgstrBtns'a modal tabanlı auth sistemi eklendi
- [24/04] Modal sistem: İlk ekranda 2 buton, seçime göre form açılır, formlar arası geçiş butonları
- [24/04] Modal yapısı kaldırıldı, toggle tabanlı sisteme geçildi
- [24/04] İki form sürekli yan yana görünür, tıklanan form aktif olur (koyu mavi pasif arka plan)
- [26/04] Fade in animasyonu eklendi (aşağıdan yukarı, 4 delay seviyesi)
- [26/04] ER Diagram incelendi, kargo talebi formu için gerekli alanlar belirlendi
- [26/04] DeliveryRequests modeli: package_description, pickup/delivery_address, weight_kg, open_time_multiplier, package_photo_url
- [26/04] Component vs Page yapısı netleştirildi (route'lar pages/, reusable'lar components/)
- [28/04] Component yapısı yeniden düzenlendi:
  - Button.tsx → NavBar.tsx rename
  - LgnRgstrBtns.tsx → pages/AuthPage.tsx taşındı
  - FooterButtons.tsx → Footer.tsx rename
- [28/04] ContactInfo komponenti oluşturuldu (adres, telefon, email, saatler - bg-dark-blue)
- [28/04] ContactInfo.tsx hizalama düzeltmesi (tüm div'lere flex-col gap-1 eklendi)
- [28/04] Contact.tsx sayfası oluşturuldu (iletişim formu + ContactInfo)
- [28/04] Contact.tsx'e Google Maps iframe eklendi (İstanbul lokasyonu, 500px, p-10 m-10)
- [28/04] Contact formu bg-tertiary-blue (#1e91c1) kullanımı
- [03/05] ProfilePage.tsx oluşturuldu (sidebar + navbar + 3 teslimat tablosu)
- [03/05] Aktif sidebar item highlight eklendi (useState, bg-dark-blue)
- [03/05] Tablo kolon hizalama düzeltildi (table-fixed + colgroup)
- [03/05] StatusBadge komponenti eklendi (pill şekli, renk kodlu durum)
- [04/05] ProfilePage'e RgLg_bg.png arka planı eklendi (absolute, opacity-50, blur-sm)
- [04/05] settings.tsx komponenti oluşturuldu (Kişisel Bilgiler, Dil ve Zaman, İstatistikler, Güvenlik, Hesabı Kapat)
- [04/05] settings.tsx — "Kullanıcı ID" → "E-Posta" olarak değiştirildi
- [04/05] settings.tsx — Tercih Edilen Dil select dropdown'a, Zaman Formatı toggle butonlara dönüştürüldü
- [04/05] settings.tsx — font-sextary ve tema renkleri (primary-blue/10, darker-blue vb.) uygulandı
- [04/05] settings.tsx — rounded-2xl → rounded-lg olarak güncellendi
- [04/05] Security.tsx komponenti oluşturuldu (Parola/Mail Güncelle, 2FA, Aktif Oturumlar)
- [04/05] Security.tsx — sol/sağ iki kolon layout (flex-[3] / flex-[2])
- [04/05] Security.tsx — Güncelle butonları bg-primary-blue + tam genişlik + büyük yapıldı
- [04/05] Security.tsx — Aktif Oturumlar sticky kaldırıldı, self-start yapıldı
- [04/05] Preferences.tsx komponenti oluşturuldu (Görsel Arayüz, Bölge & Dil, Bildirim Kanalları)
- [04/05] Preferences.tsx — "Yerleşim Yoğunluğu" ve "Uyarı Öncelik Eşiği" kaldırıldı, diğer elemanlar büyütüldü
- [04/05] Preferences.tsx — Bildirim Kanalları kartı tam yüksekliğe (self-stretch + flex-1) getirildi
- [04/05] NeedHelp.tsx komponenti oluşturuldu (hero banner, 3 kategori kartı, "Hâlâ yardım" barı)
- [04/05] ProfilePage.tsx — NavItem tipine 'yardim' eklendi, Yardım Merkezi butonu navItemClass'a bağlandı
- [04/05] ProfilePage.tsx — tüm panel bileşenleri (settings, Security, Preferences, NeedHelp) import edildi ve activeNav ile koşullu render edildi
- [07/05] RecieverPage.tsx oluşturuldu (kurye için açık talepleri listeleme ve kabul etme)
- [07/05] ReceiverNavBar.tsx komponenti oluşturuldu (beyaz navbar, logo+metin, Hakkımızda/Şikayet/İletişim, profil avatarı)
- [07/05] DeliveryAmountCard.tsx komponenti oluşturuldu (TESLİMAT MİKTARI kartı — Mesafe/Süre/Ücret + Kabul Et butonu)
- [07/05] RequestPage.tsx + RecieverPage.tsx harita placeholder → Google Maps iframe ile değiştirildi
- [07/05] Harita yükseklikleri h-[850px]'e çıkarıldı
- [07/05] RequestPage.tsx hesaplama paneli kompakt hale getirildi (w-56, bottom-4 right-4, küçük tipografi)
- [12/05] RecieverPage.tsx 3-kolon layout'a geçirildi (sol detay + orta harita + sağ bekleyen talepler listesi)
- [12/05] TrackingPage.tsx oluşturuldu (canlı takip — Status/Cargo/Courier kartları + pulsing marker)
- [12/05] DeliveryDetailPage.tsx oluşturuldu (/talep/:id — 4-adım timeline + kargo bilgileri + harita)
- [12/05] NavigationPage.tsx oluşturuldu (tam ekran harita, turn-by-turn overlay, ProofOfDeliveryModal)
- [12/05] ProofOfDeliveryModal.tsx komponenti oluşturuldu (fotoğraf upload + not alanı + onay)
- [12/05] AboutUs.tsx oluşturuldu (misyon, istatistikler, CTA)
- [12/05] ForgotPasswordPage.tsx oluşturuldu (e-posta → gönder → başarı durumu)
- [12/05] NotFoundPage.tsx oluşturuldu (404 catch-all)
- [12/05] AdminDashboard.tsx oluşturuldu (Genel Bakış / Kullanıcılar / Teslimatlar sekmeleri)
- [12/05] App.tsx routes güncellendi (8 yeni route eklendi: /sifremi-unuttum, /talep/:id, /talep-al, /takip, /navigasyon, /hakkimizda, /admin, *)
- [13/05] Backend tamamen iskeletlendi: FastAPI + SQLModel + Supabase mimarisi kuruldu
- [13/05] backend/src/models/ oluşturuldu: user.py, task_model.py, review.py, dispute.py, location.py
- [13/05] backend/src/routers/ oluşturuldu: users.py, tasks.py, reviews.py, disputes.py, locations.py
- [13/05] backend/src/security.py: Supabase JWT doğrulama + get_current_user + require_role(*roles)
- [13/05] backend/src/database.py: SQLModel engine + get_session dependency + create_db_and_tables
- [13/05] backend/src/main.py: FastAPI app + CORS middleware + lifespan + tüm router'lar kayıt edildi
- [13/05] backend/requirements.txt: fastapi, uvicorn, sqlmodel, psycopg2-binary, python-jose, python-dotenv
- [13/05] backend/.env: DATABASE_URL + SUPABASE_JWT_SECRET şablon oluşturuldu (git'e eklenmedi)
- [13/05] store/auth.ts güncellendi: role: 'sender' | 'courier' | null eklendi, login(role) imzası güncellendi
- [13/05] NavBar.tsx güncellendi: giriş yapan kullanıcıya rol bazlı nav item gösteriliyor (Gönderici → Talep Oluştur, Kurye → Talep Al)
- [13/05] AuthPage.tsx yeniden tasarlandı: tek ortalanmış kart + Lucide ikonlar + fade-in-up animasyonu
- [13/05] AuthPage.tsx — kayıt formuna Gönderici/Kurye rol seçici eklendi, giriş formundan rol seçici kaldırıldı
- [13/05] AuthPage.tsx — rol localStorage'a kaydedilir (hp_role), giriş sırasında otomatik okunur
- [13/05] AuthPage.tsx — kart arka planı bg-secondary-blue, inputlar bg-white + text-darker-blue yapıldı
- [13/05] Kök .gitignore oluşturuldu: Stitch/, backend/.env, backend/__pycache__/, frontend/node_modules/ vb.
- [13/05] backend/node_modules/, package.json, package-lock.json silindi (yanlışlıkla oluşturulmuştu)

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