import { useRef, useState, useEffect } from 'react';
import { Globe, Clock, Shield, Smartphone, AlertTriangle, Package, Star, Camera, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/auth';

const COUNTRIES = [
  { code: '+90', label: '🇹🇷 +90' },
  { code: '+1',  label: '🇺🇸 +1'  },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+49', label: '🇩🇪 +49' },
  { code: '+33', label: '🇫🇷 +33' },
  { code: '+39', label: '🇮🇹 +39' },
  { code: '+34', label: '🇪🇸 +34' },
  { code: '+31', label: '🇳🇱 +31' },
  { code: '+7',  label: '🇷🇺 +7'  },
  { code: '+86', label: '🇨🇳 +86' },
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+81', label: '🇯🇵 +81' },
];

function formatPhone(digits: string): string {
  const d = digits.slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

function parseStoredPhone(stored: string): { code: string; digits: string } {
  for (const c of COUNTRIES) {
    if (stored.startsWith(c.code)) {
      const rest = stored.slice(c.code.length).replace(/\D/g, '').slice(0, 10);
      return { code: c.code, digits: rest };
    }
  }
  return { code: '+90', digits: stored.replace(/\D/g, '').slice(0, 10) };
}

export default function SettingsPanel() {
  const [timeFormat,   setTimeFormat]   = useState<'12' | '24'>('24');
  const [firstName,    setFirstName]    = useState('');
  const [lastName,     setLastName]     = useState('');
  const [countryCode,  setCountryCode]  = useState('+90');
  const [phoneDigits,  setPhoneDigits]  = useState('');
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [showDelete,   setShowDelete]   = useState(false);
  const [deleting,     setDeleting]     = useState(false);

  const user          = useAuthStore((s) => s.user);
  const setAvatarUrl  = useAuthStore((s) => s.setAvatarUrl);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const fileInputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const parts = user.full_name?.split(' ') ?? [];
    setFirstName(parts[0] ?? '');
    setLastName(parts.slice(1).join(' '));
    if (user.phone_number) {
      const { code, digits } = parseStoredPhone(user.phone_number);
      setCountryCode(code);
      setPhoneDigits(digits);
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneDigits(e.target.value.replace(/\D/g, '').slice(0, 10));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const fullPhone = phoneDigits ? `${countryCode} ${formatPhone(phoneDigits)}` : undefined;
      await updateProfile(`${firstName} ${lastName}`.trim(), fullPhone);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
      <div className="relative flex flex-col gap-10 font-sextary">

        {/* Row 1 — Kişisel Bilgiler + Dil ve Zaman */}
        <div className="grid grid-cols-2 gap-6">

          {/* Kişisel Bilgiler */}
          <div className="rounded-lg overflow-hidden shadow-md settings-card-left">
            <div className="bg-secondary-blue px-8 py-5  flex items-center justify-between">
              <span className="text-white font-bold text-xl tracking-wide font-sextary">Kişisel Bilgiler</span>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-dark-blue text-white text-sm font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition-opacity tracking-wide font-sextary disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? '✓' : null}
                {saved ? 'Kaydedildi' : 'Profili Güncelle'}
              </button>
            </div>
            <div className="bg-white px-8 py-10 flex gap-6 items-start">
              <div
                className="relative w-34 h-34 rounded-lg overflow-hidden flex-shrink-0 border border-white/20 shadow-lg cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <img
                  key={user?.avatar_url ?? 'default'}
                  src={user?.avatar_url ?? '/assets/favicon.png'}
                  alt="Profil"
                  className="w-full h-full px-2 py-2 object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                  <span className="text-white text-xs mt-1 font-sextary">Değiştir</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 flex-1">
                {/* İsim */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-darker-blue text-xs font-semibold uppercase tracking-wider font-sextary">İsim</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className="bg-secondary-blue rounded-lg px-3 py-2 text-sm text-white font-bold outline-none focus:ring-2 focus:ring-primary-blue shadow-sm font-sextary" />
                </div>
                {/* Soyisim */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-darker-blue text-xs font-semibold uppercase tracking-wider font-sextary">Soyisim</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className="bg-secondary-blue rounded-lg px-3 py-2 text-sm text-white font-bold outline-none focus:ring-2 focus:ring-primary-blue shadow-sm font-sextary" />
                </div>
                {/* E-Posta */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-darker-blue text-xs font-semibold uppercase tracking-wider font-sextary">E-Posta</label>
                  <input type="text" value={user?.email ?? ''} readOnly
                    className="bg-secondary-blue rounded-lg px-3 py-2 text-sm text-white font-bold outline-none shadow-sm font-sextary opacity-60 cursor-not-allowed" />
                </div>
                {/* Telefon */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-darker-blue text-xs font-semibold uppercase tracking-wider font-sextary">Telefon Numarası</label>
                  <div className="flex rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary-blue">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-darker-blue text-white text-xs font-bold px-2 outline-none cursor-pointer font-sextary appearance-none flex-shrink-0"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatPhone(phoneDigits)}
                      onChange={handlePhoneInput}
                      maxLength={12}
                      placeholder="535 000 0000"
                      className="bg-secondary-blue flex-1 min-w-0 px-3 py-2 text-sm text-white font-bold outline-none font-sextary placeholder:text-white/40"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dil ve Zaman */}
          <div className="rounded-lg overflow-hidden shadow-md settings-card-right">
            <div className="bg-secondary-blue px-8 py-6 border-b border-primary-blue/20">
              <span className="text-white font-bold text-xl tracking-wide font-sextary">Dil ve Zaman</span>
            </div>
            <div className="bg-white px-8 py-8">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-darker-blue text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 font-sextary">
                    <Globe size={13} />
                    Tercih Edilen Dil
                  </label>
                  <select className="bg-secondary-blue rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary-blue border border-primary-blue/20 shadow-sm font-sextary appearance-none cursor-pointer">
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-darker-blue text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 font-sextary">
                    <Clock size={13} />
                    Zaman Formatı
                  </label>
                  <div className="flex gap-3 mt-0.5">
                    {(['24', '12'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setTimeFormat(fmt)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all font-sextary ${
                          timeFormat === fmt
                            ? 'bg-secondary-blue text-white border-white shadow-sm'
                            : 'bg-secondary-blue/10 text-darker-blue border-primary-blue/20 hover:bg-secondary-blue/20'
                        }`}
                      >
                        {fmt === '24' ? '24 Saat' : '12 Saat (AM/PM)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 — İstatistikler & Üyelik + Güvenlik */}
        <div className="grid grid-cols-2 gap-6 items-stretch settings-card-bottom">

          {/* İstatistikler & Üyelik */}
          <div className="rounded-lg overflow-hidden shadow-md h-full flex flex-col">
            <div className="bg-secondary-blue px-8 py-6 border-b border-primary-blue/20">
              <span className="text-white font-bold text-xl tracking-wide font-sextary">İstatistikler & Üyelik</span>
            </div>
            <div className="bg-white px-8 py-8 flex gap-6 items-center flex-1">
              <div className="flex gap-8">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2 text-darker-blue">
                    <Package size={18} className="text-darker-blue" />
                    <span className="text-2xl font-bold font-sextary">128</span>
                  </div>
                  <span className="text-darker-blue text-xs font-semibold uppercase tracking-wider font-sextary">Teslimat</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2 text-darker-blue">
                    <Star size={18} className="text-darker-blue" />
                    <span className="text-2xl font-bold font-sextary">
                      {user?.average_rating != null ? user.average_rating.toFixed(1) : '—'}
                    </span>
                  </div>
                  <span className="text-darker-blue text-xs font-semibold uppercase tracking-wider font-sextary">Puan</span>
                </div>
              </div>
              <div className="h-10 w-px bg-secondary-blue/20 mx-2" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-darker-blue text-sm font-semibold font-sextary">Standart Üyelik</span>
                  <span className="bg-secondary-blue text-white text-xs font-bold px-3 py-0.5 rounded-full font-sextary">AKTİF</span>
                </div>
                <div className="w-full bg-secondary-blue/15 rounded-full h-2">
                  <div className="bg-secondary-blue h-2 rounded-full" style={{ width: '75%' }} />
                </div>
                <span className="text-darker-blue text-xs font-sextary">Bu ay %75 kullanım</span>
              </div>
            </div>
          </div>

          {/* Güvenlik */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-secondary-blue px-8 py-6 border-b border-primary-blue/20">
              <span className="text-white font-bold text-xl tracking-wide font-sextary">Güvenlik</span>
            </div>
            <div className="bg-white px-8 py-8 flex flex-col gap-5">
              <div className="flex items-center gap-4 bg-secondary-blue rounded-xl px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-darker-blue flex items-center justify-center flex-shrink-0">
                  <Shield size={18} className="text-white" />
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="text-white font-semibold text-sm font-sextary">Şifre Güvenliği</span>
                  <span className="text-white text-xs font-sextary">14 gün önce güncellendi</span>
                </div>
                <button className="text-white text-xs font-bold uppercase tracking-wide font-sextary hover:text-darker-blue transition-colors">
                  Güncelle
                </button>
              </div>
              <div className="flex items-center gap-4 bg-secondary-blue rounded-xl px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-darker-blue flex items-center justify-center flex-shrink-0">
                  <Smartphone size={18} className="text-white" />
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="text-white font-semibold text-sm font-sextary">2FA Doğrulama</span>
                  <span className="text-white text-xs font-sextary">Çok faktörlü doğrulama aktif</span>
                </div>
                <button className="text-white text-xs font-bold uppercase tracking-wide font-sextary hover:text-darker-blue transition-colors">
                  Yapılandır
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hesabı Kapat */}
        <div className="rounded-lg overflow-hidden shadow-md border border-red-300 settings-danger">
          <div className="bg-red-500/75 px-8 py-5 border-b border-red-300/40 flex items-center gap-3">
            <AlertTriangle size={18} className="text-white" />
            <span className="text-white font-bold text-xl tracking-wide font-sextary">Hesabı Kapat</span>
          </div>
          <div className="bg-white/90 px-8 py-7 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-red-700 font-semibold text-sm font-sextary">Bu işlem geri alınamaz</span>
              <span className="text-red-500/80 text-xs font-sextary">Hesabınız kalıcı olarak silinecek ve tüm verileriniz kaldırılacaktır.</span>
            </div>
            <button
              onClick={() => setShowDelete(true)}
              className="bg-red-600/75 border border-red-400/50 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-red-500/25 transition-colors font-sextary tracking-wide"
            >
              Hesabı Sil
            </button>
          </div>
        </div>

      {showDelete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 font-sextary">
            <p className="text-darker-blue font-bold text-lg text-center mb-6">
              Hesabını silmek istediğine emin misin?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                disabled={deleting}
                className="flex-1 border border-gray-300 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Hayır
              </button>
              <button
                onClick={async () => {
                  setDeleting(true);
                  await deleteAccount();
                  window.location.href = '/';
                }}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-xl hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Evet
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    );
  }