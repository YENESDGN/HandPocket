import { useState } from 'react';
import type { ReactNode } from 'react';
import { Palette, Globe, Bell, Mail, MessageSquare, Smartphone, Info } from 'lucide-react';

type Theme = 'light' | 'dark';

interface NotificationChannel {
  id: 'email' | 'sms' | 'push';
  label: string;
  description: string;
  icon: ReactNode;
}

const channels: NotificationChannel[] = [
  { id: 'email', label: 'E-Posta Bildirimleri', description: 'Günlük özet ve kritik uyarılar', icon: <Mail size={17} className="text-white" /> },
  { id: 'sms',   label: 'SMS / Mobil',          description: 'Acil kargo transit güncellemeleri', icon: <MessageSquare size={17} className="text-white" /> },
  { id: 'push',  label: 'Uygulama Push',         description: 'Tarayıcı içi ve masaüstü bildirimler', icon: <Smartphone size={17} className="text-white" /> },
];

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${enabled ? 'bg-primary-blue' : 'bg-dark-blue/30'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

export default function PreferencesPanel() {
  const [theme, setTheme] = useState<Theme>('light');
  const [notifications, setNotifications] = useState<Record<string, boolean>>({ email: true, sms: false, push: true });

  const toggleNotification = (id: string) =>
    setNotifications(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex flex-col gap-6 font-sextary">

      <div className="flex gap-6 items-start">

        {/* Left column */}
        <div className="flex flex-col gap-6 flex-[3]">

          {/* Görsel Arayüz */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-secondary-blue px-10 py-6 border-b border-primary-blue/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-darker-blue flex items-center justify-center">
                <Palette size={18} className="text-white" />
              </div>
              <span className="text-white font-bold text-2xl tracking-wide font-sextary">Görsel Arayüz</span>
            </div>
            <div className="bg-white px-10 py-9">
              <div className="flex gap-6">
                {/* Light Mode */}
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 rounded-lg overflow-hidden border-2 transition-all ${theme === 'light' ? 'border-primary-blue shadow-md' : 'border-primary-blue/20'}`}
                >
                  <div className="bg-secondary-blue/10 px-6 pt-6 pb-3">
                    <div className="bg-white rounded-md px-4 py-4 shadow-sm space-y-2">
                      <div className="h-2.5 bg-darker-blue/20 rounded w-full" />
                      <div className="h-2.5 bg-darker-blue/10 rounded w-3/4" />
                      <div className="h-2.5 bg-darker-blue/10 rounded w-1/2" />
                      <div className="flex gap-2 mt-3">
                        <div className="w-4 h-4 rounded-full bg-primary-blue" />
                        <div className="w-4 h-4 rounded-full bg-darker-blue" />
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-3 text-base font-semibold font-sextary ${theme === 'light' ? 'text-primary-blue' : 'text-dark-blue'}`}>
                    Açık Mod
                  </div>
                </button>

                {/* Dark Mode */}
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 rounded-lg overflow-hidden border-2 transition-all ${theme === 'dark' ? 'border-primary-blue shadow-md' : 'border-primary-blue/20'}`}
                >
                  <div className="bg-darker-blue px-6 pt-6 pb-3">
                    <div className="bg-dark-blue/80 rounded-md px-4 py-4 shadow-sm space-y-2">
                      <div className="h-2.5 bg-white/20 rounded w-full" />
                      <div className="h-2.5 bg-white/10 rounded w-3/4" />
                      <div className="h-2.5 bg-white/10 rounded w-1/2" />
                      <div className="flex gap-2 mt-3">
                        <div className="w-4 h-4 rounded-full bg-primary-blue" />
                        <div className="w-4 h-4 rounded-full bg-white/40" />
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-3 text-base font-semibold font-sextary ${theme === 'dark' ? 'text-primary-blue' : 'text-dark-blue'}`}>
                    Koyu Mod
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Bölge & Dil */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-secondary-blue px-10 py-6 border-b border-primary-blue/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-darker-blue flex items-center justify-center">
                <Globe size={18} className="text-white" />
              </div>
              <span className="text-white font-bold text-2xl tracking-wide font-sextary">Bölge & Dil</span>
            </div>
            <div className="bg-white px-10 py-9">
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-darker-blue text-xs font-semibold uppercase tracking-wider font-sextary">Sistem Dili</label>
                  <select className="bg-secondary-blue rounded-lg font-bold px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary-blue border border-primary-blue/20 shadow-sm font-sextary appearance-none cursor-pointer">
                    <option value="tr">Türkçe</option>
                    <option value="en">English (US)</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-darker-blue text-xs font-semibold uppercase tracking-wider font-sextary">Saat Dilimi</label>
                  <select className="bg-secondary-blue rounded-lg px-4 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary-blue border border-primary-blue/20 shadow-sm font-sextary appearance-none cursor-pointer">
                    <option value="europe/istanbul">(UTC+03:00) İstanbul</option>
                    <option value="europe/london">(UTC+00:00) Londra</option>
                    <option value="america/new_york">(UTC-05:00) New York</option>
                    <option value="asia/tokyo">(UTC+09:00) Tokyo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right column */}
        <div className="flex-[2] self-stretch flex flex-col">

          {/* Bildirim Kanalları */}
          <div className="rounded-lg overflow-hidden shadow-md flex flex-col flex-1">
            <div className="bg-secondary-blue px-8 py-6 border-b border-primary-blue/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-darker-blue flex items-center justify-center">
                <Bell size={18} className="text-white" />
              </div>
              <span className="text-white font-bold text-2xl tracking-wide font-sextary">Bildirim Kanalları</span>
            </div>
            <div className="bg-white px-8 py-4 flex flex-col divide-y divide-primary-blue/10 flex-1 justify-between">
              {channels.map((ch) => (
                <div key={ch.id} className="flex items-center gap-5 py-5 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-dark-blue flex items-center justify-center flex-shrink-0">
                    {ch.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-darker-blue text-base font-semibold font-sextary">{ch.label}</p>
                    <p className="text-dark-blue text-xs mt-0.5 font-sextary">{ch.description}</p>
                  </div>
                  <Toggle enabled={notifications[ch.id]} onToggle={() => toggleNotification(ch.id)} />
                </div>
              ))}
              <div className="flex items-start gap-2 bg-yellow-50/60 -mx-8 px-8 py-4 border-t border-yellow-200/60">
                <Info size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-yellow-700 text-xs leading-relaxed font-sextary">
                  SMS bildirimleri, konumunuza ve planınıza bağlı olarak ek operatör ücretlerine yol açabilir.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <button className="text-dark-blue text-sm font-semibold font-sextary hover:text-darker-blue transition-colors px-4 py-2">
          Değişiklikleri İptal Et
        </button>
        <button className="bg-secondary-blue text-white font-bold py-3 px-8 text-sm rounded-lg hover:opacity-90 transition-opacity tracking-widest uppercase font-sextary shadow-sm">
          Ayarları Uygula
        </button>
      </div>

    </div>
  );
}
