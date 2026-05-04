export default function SettingsPanel() {
    return (
      <div className="flex flex-col gap-6">
        {/* Kişisel Bilgiler */}
        <div className="rounded-xl overflow-hidden shadow-sm">
          <div className="bg-dark-blue px-6 py-4 flex items-center justify-between">
            <span className="text-white font-bold text-xl tracking-wide">Kişisel Bilgiler</span>
            <button className="bg-darker-blue text-white text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Profili Güncelle
            </button>
          </div>
          <div className="bg-dark-blue/90 px-6 py-5 flex gap-6 items-start">
            <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 border border-white/20">
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
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 flex-1">
              {[
                { label: 'İsim' },
                { label: 'Soyisim' },
                { label: 'Kullanıcı ID' },
                { label: 'Telefon Numarası' },
              ].map(({ label }) => (
                <div key={label} className="flex flex-col gap-1">
                  <label className="text-white/80 text-xs font-medium">{label}</label>
                  <input
                    type="text"
                    className="bg-white rounded px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
  
        {/* Dil ve Zaman */}
        <div className="rounded-xl overflow-hidden shadow-sm">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <span className="text-gray-900 font-bold text-xl tracking-wide">Dil ve Zaman</span>
          </div>
          <div className="bg-white px-6 py-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                { label: 'Tercih Edilen Dil' },
                { label: 'Zaman Formatı' },
              ].map(({ label }) => (
                <div key={label} className="flex flex-col gap-1">
                  <label className="text-gray-600 text-xs font-medium">{label}</label>
                  <input
                    type="text"
                    className="bg-gray-100 rounded px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-primary-blue border border-gray-200"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }