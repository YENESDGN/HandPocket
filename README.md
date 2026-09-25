# HandPocket

Gönderici ve kuryeleri buluşturan bir kargo teslimat platformu. Gönderici bir teslimat talebi oluşturur, kurye talebi kabul edip paketi teslim eder, gönderici de teslimat kanıtını görüp onaylar. Talepten onaya kadar bütün süreç tek bir uygulama üzerinden yönetilir.

<!-- Buraya bir ekran görüntüsü veya demo GIF'i ekle -->

## Özellikler

- **Rol bazlı akışlar:** Gönderici, kurye ve admin rolleri için ayrı ekranlar ve yetkiler
- **Teslimat talebi:** Harita üzerinden başlangıç ve bitiş noktası seçimi, mesafe, ağırlık ve öncelik bazlı ücret hesaplama
- **Canlı takip:** Kurye konumunun periyodik olarak güncellendiği takip ekranı
- **Teslimat kanıtı:** Kuryenin yüklediği fotoğrafla teslimat doğrulama, gönderici onayı sonrası kurye ödemesi
- **İtiraz sistemi:** Gönderici teslimata itiraz edebilir, itirazlar admin panelinden çözülür
- **Değerlendirme:** Tamamlanan teslimatlarda karşılıklı puanlama ve yorum, ortalama puanın otomatik güncellenmesi
- **Bildirimler:** Teslimat durumu değiştikçe uygulama içi bildirim
- **Admin paneli:** Kullanıcı, teslimat ve itiraz yönetimi
- **Karanlık mod**

> Cüzdan şu an simülasyon olarak çalışıyor, gerçek ödeme entegrasyonu yol haritasında.

## Teknolojiler

**Backend:** FastAPI, SQLModel, PostgreSQL (Supabase), PyJWT, slowapi

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Zustand, Mapbox GL, React Router

**Altyapı:** Supabase Auth ve Storage

## Mimari

Tasarım diyagramları [`Architecture/`](Architecture) klasöründe:

- [Sistem Bağlam Diyagramı](Architecture/System_Contex_Diagram.pdf)
- [ER Diyagramı](Architecture/ER_Diagram.pdf)
- [API Sekans Diyagramı](Architecture/API_Sequence_Diagram.pdf)

Kimlik doğrulama Supabase Auth ile yapılır. Frontend, Supabase'den aldığı JWT'yi her istekte backend'e gönderir, backend de token'ı Supabase'in JWKS endpoint'i üzerinden doğrular. İş mantığı ve veri erişimi tamamen FastAPI tarafındadır.

### Teslimat yaşam döngüsü

```
pending → accepted → picked_up → delivered → completed
                                     │
                                     └──→ disputed
```

Talep her aşamada iptal edilebilir (`cancelled`).

## Proje Yapısı

```
HandPocket/
├── Architecture/        # Sistem, ER ve API sekans diyagramları
├── backend/
│   ├── requirements.txt
│   └── src/
│       ├── main.py      # Uygulama, middleware'ler, router kayıtları
│       ├── database.py  # Veritabanı bağlantısı
│       ├── security.py  # JWT doğrulama ve yetkilendirme
│       ├── models/      # SQLModel tabloları ve şemalar
│       ├── routers/     # API endpoint'leri
│       └── services/    # Bildirim servisi
└── frontend/
    └── src/
        ├── pages/       # Sayfa bileşenleri
        ├── components/  # Ortak bileşenler
        ├── services/    # API istemcileri
        ├── store/       # Zustand state yönetimi
        └── lib/         # API, Supabase ve yardımcılar
```

## Kurulum

### Gereksinimler

- Python 3.11+
- Node.js 18+
- Bir Supabase projesi
- Mapbox erişim token'ı

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

`backend/.env` dosyası oluştur:

```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://<proje-id>.supabase.co
FRONTEND_URL=http://localhost:5173
```

Sunucuyu başlat:

```bash
uvicorn src.main:app --reload
```

API dokümantasyonu: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
```

`frontend/.env` dosyası oluştur:

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://<proje-id>.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_MAPBOX_TOKEN=...
```

Geliştirme sunucusunu başlat:

```bash
npm run dev
```

Uygulama: `http://localhost:5173`

## API

| Kaynak | Açıklama |
|---|---|
| `/users` | Profil, kullanıcı bilgisi, admin için kullanıcı yasaklama |
| `/tasks` | Talep oluşturma, açık talepler, kabul, durum güncelleme, teslimat kanıtı, onay |
| `/locations` | Kurye konum kaydı ve son konum sorgusu |
| `/reviews` | Değerlendirme oluşturma ve listeleme |
| `/disputes` | İtiraz oluşturma ve admin çözümü |
| `/notifications` | Bildirim listesi, okunmamış sayısı, okundu işaretleme |
| `/wallet` | Bakiye, yükleme ve çekme (simülasyon) |
| `/health` | Servis ve veritabanı durumu |

Endpoint detayları için çalışan sunucuda `/docs` sayfasına bakabilirsin.

## Durum ve Yol Haritası

Web sürümü (v0.1) demo edilebilir durumda, tüm temel akışlar çalışıyor. Mobil uygulama `mobile` branch'inde geliştiriliyor.

Sıradaki adımlar [`Plan.md`](Plan.md) dosyasında:

- Gerçek ödeme entegrasyonu (iyzico)
- Teslimat kanıtı fotoğrafları için AI doğrulama
- E-posta bildirimleri
- Production deploy, migration ve hata izleme altyapısı

## Lisans

MIT
