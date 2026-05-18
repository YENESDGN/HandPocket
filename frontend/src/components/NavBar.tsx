import { Link } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { useDarkMode } from '../lib/useDarkMode'
import NotificationBell from './NotificationBell'

export default function NavBar() {
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const role       = useAuthStore((s) => s.role);
    const user       = useAuthStore((s) => s.user);
    const { dark, toggle } = useDarkMode();

    return (
        <section className="flex flex-row gap-7 items-center top-10 right-15 absolute font-tertiary">
            <button
                onClick={toggle}
                aria-label="Tema değiştir"
                className="theme-toggle-btn"
            >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="text-black p-2 flex flex-row gap-7 text-lg">
                <Link to="/" className="cursor-pointer btn-hover-blue">Anasayfa</Link>
                <Link to="/hakkimizda" className="cursor-pointer btn-hover-blue">Hakkımızda</Link>
                <Link to="/iletisim" className="cursor-pointer btn-hover-blue">İletişim</Link>
                {isLoggedIn && role === 'sender' && (
                    <Link to="/talep" className="cursor-pointer btn-hover-blue font-bold text-dark-blue">
                        Talep Oluştur
                    </Link>
                )}
                {isLoggedIn && role === 'courier' && (
                    <Link to="/talep-al" className="cursor-pointer btn-hover-blue font-bold text-dark-blue">
                        Talep Al
                    </Link>
                )}
            </div>

            {isLoggedIn && <NotificationBell />}

            {isLoggedIn ? (
                <Link to="/profil">
                    <div className='w-12 h-12 rounded-full overflow-hidden bg-primary-blue border-2 border-primary-blue'>
                        <img
                            key={user?.avatar_url ?? 'default'}
                            src={user?.avatar_url ?? '/assets/favicon.png'}
                            alt="Profil"
                            className='w-full h-full object-cover'
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                    </div>
                </Link>
            ) : (
                <div className='text-white bg-primary-blue p-1 pr-3 pl-3 rounded-[30px] flex flex-row justify-between items-center gap-3'>
                    <Link to="/giris" className="cursor-pointer btn-hover-blue-secondary">
                        Giriş Yap
                    </Link>
                    <Link to="/kayit" className="cursor-pointer btn-hover-blue-secondary">
                        Kayıt Ol
                    </Link>
                </div>
            )}
        </section>
    )
}
