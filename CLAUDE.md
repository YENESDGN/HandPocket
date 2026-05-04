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

### RequestPage.tsx (148 satır)
- Kargo talebi oluşturma sayfası
- SecondNavBar kullanımı

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
│   ├── NavBar.tsx          (navigation + auth butonları)
│   ├── SecondNavBar.tsx
│   ├── Footer.tsx
│   ├── ContactInfo.tsx     (iletişim bilgileri)
│   ├── settings.tsx        (ProfilePage — Ayarlar sekmesi)
│   ├── Security.tsx        (ProfilePage — Güvenlik sekmesi)
│   ├── Preferences.tsx     (ProfilePage — Tercihler sekmesi)
│   └── NeedHelp.tsx        (ProfilePage — Yardım Merkezi sekmesi)
├── pages/
│   ├── LandingPage.tsx
│   ├── AuthPage.tsx        (login/register)
│   ├── Contact.tsx         (iletişim formu + harita)
│   ├── RequestPage.tsx     (kargo talebi)
│   └── ProfilePage.tsx     (kullanıcı profili — sidebar + tüm sekmeler)
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