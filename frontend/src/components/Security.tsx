import { useState } from 'react';
import { Lock, Mail, Smartphone, Monitor, Tablet, AlertCircle } from 'lucide-react';

interface Session {
  id: number;
  device: string;
  platform: string;
  location: string;
  ip: string;
  date: string;
  active: boolean;
  icon: 'monitor' | 'tablet' | 'mobile';
}

const sessions: Session[] = [
  { id: 1, device: 'Web Tarayıcı', platform: 'Chrome v121', location: 'İstanbul, TR', ip: '192.168.1.45', date: '04.05.2026 • 20:42', active: true, icon: 'monitor' },
  { id: 2, device: 'Mobil Uygulama', platform: 'iOS', location: 'Ankara, TR', ip: '45.22.10.1', date: '03.05.2026 • 16:15', active: false, icon: 'mobile' },
  { id: 3, device: 'Masaüstü İstemci', platform: 'Windows', location: 'İzmir, TR', ip: '88.19.0.22', date: '02.05.2026 • 11:20', active: false, icon: 'tablet' },
];

const DeviceIcon = ({ type }: { type: Session['icon'] }) => {
  if (type === 'monitor') return <Monitor size={16} className="text-white" />;
  if (type === 'mobile') return <Smartphone size={16} className="text-white" />;
  return <Tablet size={16} className="text-white" />;
};

export default function SecurityPanel() {
  const [twoFA, setTwoFA] = useState(false);

  return (
    <div className="flex gap-6 items-start font-sextary">

      {/* Left column */}
      <div className="flex flex-col gap-6 flex-[3]">

        {/* Parola Güncelle */}
        <div className="rounded-2xl overflow-hidden shadow-md">
          <div className="bg-dark-blue px-8 py-5 flex items-center gap-3">
            <Lock size={18} className="text-white/80" />
            <span className="text-white font-bold text-xl tracking-wide font-sextary">Parola Güncelle</span>
          </div>
          <div className="bg-dark-blue/90 px-8 py-7 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-x-8">
              <div className="flex flex-col gap-1.5">
                <label className="text-white/80 text-xs font-semibold uppercase tracking-wider font-sextary">Mevcut Parola</label>
                <input type="password" className="bg-white rounded-lg px-4 py-2.5 text-sm text-darker-blue outline-none focus:ring-2 focus:ring-primary-blue shadow-sm font-sextary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-white/80 text-xs font-semibold uppercase tracking-wider font-sextary">Yeni Parola</label>
                <input type="password" className="bg-white rounded-lg px-4 py-2.5 text-sm text-darker-blue outline-none focus:ring-2 focus:ring-primary-blue shadow-sm font-sextary" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-white/80 text-xs font-semibold uppercase tracking-wider font-sextary">Yeni Parola Tekrar</label>
              <input type="password" className="bg-white rounded-lg px-4 py-2.5 text-sm text-darker-blue outline-none focus:ring-2 focus:ring-primary-blue shadow-sm font-sextary" />
            </div>
            <button className="w-full bg-primary-blue text-white font-bold py-3 text-sm rounded-xl hover:opacity-90 transition-opacity tracking-widest uppercase font-sextary shadow-sm">
              Parolayı Güncelle
            </button>
          </div>
        </div>

        {/* Mail Güncelle */}
        <div className="rounded-2xl overflow-hidden shadow-md">
          <div className="bg-dark-blue px-8 py-5 flex items-center gap-3">
            <Mail size={18} className="text-white/80" />
            <span className="text-white font-bold text-xl tracking-wide font-sextary">Mail Güncelle</span>
          </div>
          <div className="bg-dark-blue/90 px-8 py-7 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-x-8">
              <div className="flex flex-col gap-1.5">
                <label className="text-white/80 text-xs font-semibold uppercase tracking-wider font-sextary">Mevcut Mail</label>
                <input type="email" className="bg-white rounded-lg px-4 py-2.5 text-sm text-darker-blue outline-none focus:ring-2 focus:ring-primary-blue shadow-sm font-sextary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-white/80 text-xs font-semibold uppercase tracking-wider font-sextary">Yeni Mail</label>
                <input type="email" className="bg-white rounded-lg px-4 py-2.5 text-sm text-darker-blue outline-none focus:ring-2 focus:ring-primary-blue shadow-sm font-sextary" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-white/80 text-xs font-semibold uppercase tracking-wider font-sextary">Yeni Mail Tekrar</label>
              <input type="email" className="bg-white rounded-lg px-4 py-2.5 text-sm text-darker-blue outline-none focus:ring-2 focus:ring-primary-blue shadow-sm font-sextary" />
            </div>
            <button className="w-full bg-primary-blue text-white font-bold py-3 text-sm rounded-xl hover:opacity-90 transition-opacity tracking-widest uppercase font-sextary shadow-sm">
              Maili Güncelle
            </button>
          </div>
        </div>

        {/* İki Adımlı Doğrulama — bottom of left column */}
        <div className="rounded-2xl overflow-hidden shadow-md">
          <div className="bg-white px-8 py-5 border-b border-primary-blue/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-dark-blue flex items-center justify-center">
                <Smartphone size={16} className="text-white" />
              </div>
              <span className="text-darker-blue font-bold text-xl tracking-wide font-sextary">İki Adımlı Doğrulama</span>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full font-sextary ${twoFA ? 'bg-primary-blue text-white' : 'bg-red-100 text-red-600'}`}>
              {twoFA ? 'AKTİF' : 'PASİF'}
            </span>
          </div>
          <div className="bg-white px-8 py-7 flex flex-col gap-5">
            <div className="flex items-start gap-3 bg-primary-blue/10 border border-primary-blue/20 rounded-xl px-4 py-4">
              <AlertCircle size={15} className="text-dark-blue mt-0.5 flex-shrink-0" />
              <p className="text-dark-blue text-sm leading-relaxed font-sextary">
                Giriş işlemlerinize ek bir güvenlik katmanı ekleyin. Her oturum açmada cihazınızdan benzersiz bir doğrulama kodu istenecektir.
              </p>
            </div>
            <button
              onClick={() => setTwoFA(!twoFA)}
              className="w-full bg-primary-blue text-white font-bold py-3 text-sm rounded-xl hover:opacity-90 transition-opacity tracking-widest uppercase font-sextary shadow-sm"
            >
              {twoFA ? 'Doğrulamayı Devre Dışı Bırak' : 'İki Adımlı Doğrulamayı Başlat'}
            </button>
          </div>
        </div>

      </div>

      {/* Right column — Aktif Oturumlar */}
      <div className="flex-[2] rounded-lg overflow-hidden shadow-md self-start">
        <div className="bg-white px-6 py-5 border-b border-primary-blue/20">
          <span className="text-darker-blue font-bold text-xl tracking-wide font-sextary">Aktif Oturumlar</span>
          <p className="text-dark-blue text-xs mt-1 font-sextary">Hesabınızdaki oturum geçmişi.</p>
        </div>
        <div className="bg-white px-6 flex flex-col divide-y divide-primary-blue/10">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center gap-4 py-4">
              <div className="w-9 h-9 rounded-xl bg-dark-blue flex items-center justify-center flex-shrink-0">
                <DeviceIcon type={s.icon} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-darker-blue text-sm font-semibold font-sextary truncate">{s.device} • {s.platform}</span>
                  {s.active && (
                    <span className="bg-primary-blue text-white text-xs font-bold px-2 py-0.5 rounded-full font-sextary flex-shrink-0">AKTİF</span>
                  )}
                </div>
                <span className="text-dark-blue text-xs font-sextary block">{s.location} • {s.ip}</span>
                <span className="text-dark-blue/60 text-xs font-sextary block">{s.date}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-primary-blue/20 bg-white">
          <button className="w-full text-primary-blue text-xs font-bold uppercase tracking-wider hover:text-darker-blue transition-colors font-sextary py-1">
            Diğer Tüm Oturumları Sonlandır
          </button>
        </div>
      </div>

    </div>
  );
}
