import { Link } from "react-router-dom";

export default function FooterButtons() {
    return (
        <>
        <footer className="flex flex-col text-black border-t border-gray-600 border-opacity-50 font-tertiary">
            <section className="grid grid-cols-3 gap-50 items-center justify-center text-center pt-5 pb-5">
                <div className="flex flex-row items-center justify-center">
                    <img 
                    src="/assets/favicon.png"
                    alt="HandPocket Logo"
                    className="w-16 h-16 object-contain" />
                    <h1 className="text-xl font-bold text-blue">HandPocket</h1>
                </div>

                <div className="flex flex-row gap-20 items-center text-lg justify-center">
                    <Link to="/hakkimizda" className="cursor-pointer btn-hover-blue">Hakkımızda</Link>
                    <Link to="/iletisim" className="cursor-pointer btn-hover-blue">İletişim</Link>
                </div>

                <div className="flex items-center justify-center">
                    <p className="text-sm text-gray-600">© 2026 HandPocket. Tüm hakları saklıdır.</p>
                </div>
            </section>
        </footer>
        </>
    )
}