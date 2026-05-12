import { useState } from 'react';
import { Search, Truck, CreditCard, Wrench, ChevronRight, Headphones, MessageSquare, Clock, PhoneCall } from 'lucide-react';

interface HelpCategory {
  icon: React.ReactNode;
  title: string;
  description: string;
  links: string[];
}

const categories: HelpCategory[] = [
  {
    icon: <Truck size={22} className="text-dark-blue" />,
    title: 'Kargolar',
    description: 'Gerçek zamanlı takip, uluslararası lojistik protokolleri ve transit süreler.',
    links: ['Yüksek öncelikli kargoları takip et', 'Gümrük dokümantasyon rehberi', 'Rota optimizasyon ayarları'],
  },
  {
    icon: <CreditCard size={22} className="text-dark-blue" />,
    title: 'Faturalandırma',
    description: 'Kurumsal faturaları, ödeme döngülerini ve vergi dökümantasyonunu yönetin.',
    links: ['Aylık ekstreleri görüntüle', 'Kurumsal ödeme yöntemlerini güncelle', 'Kargo ücretine itiraz et'],
  },
  {
    icon: <Wrench size={22} className="text-dark-blue" />,
    title: 'Teknik Destek',
    description: 'API entegrasyonları, donanım yapılandırması ve sistem durumu bilgileri.',
    links: ["Webhook'lar ve bildirimler", 'Donanım tanılama araçları', 'API oran limitleri ve dökümantasyon'],
  },
];

export default function NeedHelpPanel() {
  const [query, setQuery] = useState('');

  return (
    <div className="flex flex-col gap-6 font-sextary">

      {/* Hero banner */}
      <div className="rounded-lg overflow-hidden shadow-md bg-dark-blue px-10 py-12 flex flex-col items-center gap-5 text-center help-hero">
        <h1 className="text-white font-bold text-3xl tracking-wide font-sextary">
          Bugün size nasıl yardımcı olabiliriz?
        </h1>
        <p className="text-white/70 text-sm font-sextary max-w-lg">
          Tüm lojistik sorularınız için bilgi tabanımızı arayın.
        </p>
        <div className="relative w-full max-w-xl mt-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-blue/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sorunuzu yazın (ör. kargo takibi, fatura detayı…)"
            className="w-full bg-white rounded-lg pl-10 pr-4 py-3 text-sm text-darker-blue placeholder-dark-blue/40 outline-none focus:ring-2 focus:ring-primary-blue shadow-sm font-sextary"
          />
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.title} className="rounded-lg overflow-hidden shadow-md bg-white flex flex-col help-card">
            <div className="px-7 pt-7 pb-4">
              <div className="w-12 h-12 rounded-lg bg-primary-blue/10 border border-primary-blue/20 flex items-center justify-center mb-4">
                {cat.icon}
              </div>
              <h2 className="text-darker-blue font-bold text-lg font-sextary">{cat.title}</h2>
              <p className="text-dark-blue text-xs mt-2 leading-relaxed font-sextary">{cat.description}</p>
            </div>
            <div className="px-7 pb-6 flex flex-col gap-1 mt-auto border-t border-primary-blue/10 pt-4">
              {cat.links.map((link) => (
                <button
                  key={link}
                  className="flex items-center justify-between text-primary-blue text-xs font-semibold font-sextary hover:text-darker-blue transition-colors py-1 text-left group"
                >
                  <span>{link}</span>
                  <ChevronRight size={13} className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Still need help */}
      <div className="rounded-lg overflow-hidden shadow-md bg-darker-blue px-10 py-8 flex items-center justify-between gap-8 help-contact">
        <div className="flex items-center gap-5">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-lg bg-dark-blue flex items-center justify-center">
              <Headphones size={20} className="text-white" />
            </div>
            <div className="w-12 h-12 rounded-lg bg-dark-blue flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-lg font-sextary">Hâlâ yardıma mı ihtiyacınız var?</p>
            <p className="text-white/70 text-xs mt-1 font-sextary">
              Uzman destek ekibimiz kritik kargo sorunları için 7/24 hizmetinizdedir.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-8 flex-shrink-0">
          <div className="flex flex-col gap-2 text-right">
            <div className="flex items-center gap-2 justify-end">
              <Clock size={12} className="text-white/50" />
              <span className="text-white/50 text-xs font-sextary">Ortalama Yanıt Süresi</span>
              <span className="text-white font-bold text-xs font-sextary">&lt; 2 Dakika</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <PhoneCall size={12} className="text-white/50" />
              <span className="text-white/50 text-xs font-sextary">Kanal</span>
              <span className="text-white font-bold text-xs font-sextary">Sohbet, Telefon, E-Posta</span>
            </div>
          </div>
          <button className="bg-primary-blue text-white font-bold px-7 py-3 rounded-lg text-sm hover:opacity-90 transition-opacity tracking-wide font-sextary flex items-center gap-2 whitespace-nowrap">
            Destekle İletişime Geç
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

    </div>
  );
}
