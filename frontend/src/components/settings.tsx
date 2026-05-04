import { useState } from 'react';
import { Globe, Clock, Shield, Smartphone, AlertTriangle, Package, Star } from 'lucide-react';

export default function SettingsPanel() {
  const [timeFormat, setTimeFormat] = useState<'12' | '24'>('24');

  return (
      <div className="flex flex-col gap-6 font-sextary">
        {/* Kişisel Bilgiler */}
        <div className="rounded-lg overflow-hidden shadow-md">
          <div className="bg-dark-blue px-8 py-5 flex items-center justify-between">
            <span className="text-white font-bold text-xl tracking-wide font-sextary">Kişisel Bilgiler</span>
            <button className="bg-primary-blue text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity tracking-wide font-sextary">
              Profili Güncelle
            </button>
          </div>
          <div className="bg-darker-blue px-8 py-7 flex gap-8 items-start">
            <div className="w-36 h-36 rounded-lg overflow-hidden flex-shrink-0 border border-white/20 shadow-lg">
              <img
                src="/assets/avatar-placeholder.png"
                alt="Profil"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.background = '#206988';
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 flex-1">
              {[
                { label: 'İsim' },
                { label: 'Soyisim' },
                { label: 'E-Posta' },
                { label: 'Telefon Numarası' },
              ].map(({ label }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <label className="text-white/80 text-xs font-semibold uppercase tracking-wider font-sextary">{label}</label>
                  <input
                    type="text"
                    className="bg-white rounded-lg px-4 py-2.5 text-sm text-darker-blue outline-none focus:ring-2 focus:ring-primary-blue shadow-sm font-sextary"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dil ve Zaman */}
        <div className="rounded-lg overflow-hidden shadow-md">
          <div className="bg-dark-blue px-8 py-5 border-b border-primary-blue/20">
            <span className="text-white font-bold text-xl tracking-wide font-sextary">Dil ve Zaman</span>
          </div>
          <div className="bg-darker-blue px-8 py-7">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 font-sextary">
                  <Globe size={13} />
                  Tercih Edilen Dil
                </label>
                <select className="bg-darker-blue rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary-blue border border-primary-blue/20 shadow-sm font-sextary appearance-none cursor-pointer">
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 font-sextary">
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
                          ? 'bg-white text-white-blue border-white shadow-sm'
                          : 'bg-primary-blue/10 text-white border-primary-blue/20 hover:bg-primary-blue/20'
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

        {/* İstatistikler & Üyelik */}
        <div className="rounded-lg overflow-hidden shadow-md">
          <div className="bg-dark-blue px-8 py-5 border-b border-primary-blue/20">
            <span className="text-white font-bold text-xl tracking-wide font-sextary">İstatistikler & Üyelik</span>
          </div>
          <div className="bg-darker-blue px-8 py-7 flex gap-8 items-center">
            <div className="flex gap-10">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-white">
                  <Package size={18} className="text-white" />
                  <span className="text-2xl font-bold font-sextary">128</span>
                </div>
                <span className="text-white text-xs font-semibold uppercase tracking-wider font-sextary">Teslimat</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-white">
                  <Star size={18} className="text-white" />
                  <span className="text-2xl font-bold font-sextary">4.9</span>
                </div>
                <span className="text-white text-xs font-semibold uppercase tracking-wider font-sextary">Puan</span>
              </div>
            </div>
            <div className="h-10 w-px bg-primary-blue/20 mx-2" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-semibold font-sextary">Standart Üyelik</span>
                <span className="bg-primary-blue text-white text-xs font-bold px-3 py-0.5 rounded-full font-sextary">AKTİF</span>
              </div>
              <div className="w-full bg-primary-blue/15 rounded-full h-2">
                <div className="bg-primary-blue h-2 rounded-full" style={{ width: '75%' }} />
              </div>
              <span className="text-white text-xs font-sextary">Bu ay %75 kullanım</span>
            </div>
          </div>
        </div>

        {/* Güvenlik */}
        <div className="rounded-sm overflow-hidden shadow-md">
          <div className="bg-dark-blue px-8 py-5 border-b border-primary-blue/20">
            <span className="text-white font-bold text-xl tracking-wide font-sextary">Güvenlik</span>
          </div>
          <div className="bg-darker-blue px-8 py-7 grid grid-cols-2 gap-6">
            <div className="flex items-center gap-4 bg-dark-blue rounded-xl px-5 py-4">
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
            <div className="flex items-center gap-4 bg-dark-blue rounded-xl px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-dark-blue flex items-center justify-center flex-shrink-0">
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

        {/* Hesabı Kapat */}
        <div className="rounded-lg overflow-hidden shadow-md border border-red-300/50">
          <div className="bg-red-500/10 px-8 py-5 border-b border-red-300/40 flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-500" />
            <span className="text-red-600 font-bold text-xl tracking-wide font-sextary">Hesabı Kapat</span>
          </div>
          <div className="bg-red-500/5 px-8 py-7 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-red-700 font-semibold text-sm font-sextary">Bu işlem geri alınamaz</span>
              <span className="text-red-500/80 text-xs font-sextary">Hesabınız kalıcı olarak silinecek ve tüm verileriniz kaldırılacaktır.</span>
            </div>
            <button className="bg-red-500/15 border border-red-400/50 text-red-600 text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-red-500/25 transition-colors font-sextary tracking-wide">
              Hesabı Sil
            </button>
          </div>
        </div>

      </div>
    );
  }