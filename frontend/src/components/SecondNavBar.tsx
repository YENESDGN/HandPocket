import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function SecondNavBar() {
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const user       = useAuthStore((s) => s.user);

    return (
        <nav className='profile-bg px-8 py-4 flex items-center justify-between font-tertiary'>
            <div className='flex items-center gap-2'>
                <img
                    src="/assets/favicon.png"
                    alt="HandPocket Logo"
                    className='w-12 h-12 object-contain'
                />
            </div>

            <div className='flex gap-10 relative left-10 text-lg text-black'>
                <Link to="/" className='btn-hover-blue'>Anasayfa</Link>
                <Link to="/hakkimizda" className='btn-hover-blue'>Hakkımızda</Link>
                <Link to="/iletisim" className='btn-hover-blue'>İletişim</Link>
            </div>

            {isLoggedIn ? (
                <Link to="/profil">
                    <div className='w-14 h-14 rounded-full overflow-hidden bg-primary-blue border-2 border-primary-blue'>
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
                <div className='flex items-center gap-5 bg-secondary-blue rounded-full px-3 py-1'>
                    <Link to="/giris" className='text-white text-sm btn-hover-blue-secondary'>Giriş Yap</Link>
                    <Link to="/kayit" className='text-white text-sm btn-hover-blue-secondary'>Kayıt Ol</Link>
                </div>
            )}
        </nav>
    );
}
