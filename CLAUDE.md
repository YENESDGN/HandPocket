# HandPocket - Proje Bağlamı

## Proje
- **Tip**: React/TypeScript kargo uygulaması
- **Renk**: #08b4fb (mavi tema)
- **Dil**: Türkçe

## Aktif Değişiklikler
### Button.tsx (21 satır)
- Nav butonları: Hakkımızda, İletişim, Şikayet
- Auth butonları: Giriş Yap, Kayıt Ol
- Flexbox layout, Tailwind CSS

### LandingPage.tsx (88 satır)
- 2 kolonlu grid layout
- Sol: Mavi panel (#08b4fb) + slogan "HIZLI VE GÜVENLİ"
- Sağ: NavBar komponenti
- Alt: 3 özellik kartı (Gönderim, Teslimat, Memnuniyet)
- Asset'ler: Logo, yol, ikonlar, store logoları

### LgnRgstrBtns.tsx (134 satır)
- Toggle tabanlı auth sistemi (modal kaldırıldı)
- İki form yan yana grid layout
- Aktif form: Beyaz arka plan + mavi border vurgusu
- Pasif form: Koyu mavi (#004561) arka plan + opacity azaltılmış
- onClick ile form geçişi: Forma tıklanınca aktif hale gelir
- useState hook: activeForm ('login' | 'register')
- Input'lar disabled durumda pasif formda

## Yapı
```
frontend/src/
├── components/
│   ├── Button.tsx (nav + auth)
│   ├── NavBar.tsx
│   ├── FooterButtons.tsx
│   └── LgnRgstrBtns.tsx (modal auth)
└── pages/
    └── LandingPage.tsx

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
--color-primary-blue: #08b4fb
--color-secondary-blue: #1ea4dc
--color-tertiary-blue: #1e91c1
--color-dark-blue: #206988
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
```

**Kullanım:**
- Font: `className="font-primary"`
- Renkler: `bg-primary-blue`, `text-primary-blue` vb.
- Button hover: `className="btn-hover-blue"`

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