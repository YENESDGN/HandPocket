export default function FooterButtons() {
    return (
        <>
        <footer className="flex flex-col text-black border-t border-gray-600 border-opacity-50 font-tertiary">
            <section className="grid grid-cols-3 gap-50 items-center justify-center text-center pt-5 pb-5">
                <div className="flex flex-row items-center justify-center">
                    <img 
                    src="/assets/favicon.png"
                    alt="HandPocket Logo"
                    className="w-30 h-30 object-contain" />
                    <h1 className="text-2xl font-bold text-blue">HandPocket</h1>
                </div>

                <div className="flex flex-row gap-20 items-center text-xl justify-center">
                    <h3 className="cursor-pointer btn-hover-blue">Hizmetler</h3>
                    <h3 className="cursor-pointer btn-hover-blue">Hakkımızda</h3>
                    <h3 className="cursor-pointer btn-hover-blue">İletişim</h3>
                </div>

                <div className="flex items-center justify-center">
                    <p className="text-sm text-gray-600">© 2026 HandPocket. Tüm hakları saklıdır.</p>
                </div>
            </section>
            <section>
                <div className="flex flex-row gap-35 items-center justify-center pb-5 border-t border-gray-600 border-opacity-50 pt-15 pb-10">
                    <a href="mailto:info@handpocket.com" className="btn-hover-blue">
                        📧 info@handpocket.com
                    </a>
                    <a href="tel:+905551234567" className="btn-hover-blue">
                        📞 +90 555 123 45 67
                    </a>
                    <a href="https://maps.google.com/?q=HandPocket" target="_blank" rel="noopener noreferrer" className="btn-hover-blue">
                        📍 İstanbul, Türkiye
                    </a>
                </div>
            </section>
        </footer>
        </>
    )
}