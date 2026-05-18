import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import NotificationBell from './NotificationBell';

export default function ReceiverNavBar() {
    const user       = useAuthStore((s) => s.user);
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    return (
        <nav className='profile-bg px-8 py-4 flex items-center justify-between font-tertiary'>
            <div className='flex items-center gap-2'>
                <img
                    src="/assets/favicon.png"
                    alt="HandPocket Logo"
                    className='w-12 h-12 object-contain'
                />
            </div>

            <div className='flex gap-10 text-lg text-black'>
                <Link to="/" className='btn-hover-blue'>Anasayfa</Link>
                <Link to="/hakkimizda" className='btn-hover-blue'>Hakkımızda</Link>
                <Link to="/iletisim" className='btn-hover-blue'>İletişim</Link>
            </div>

            <div className='flex items-center gap-3'>
                {isLoggedIn && <NotificationBell />}
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
            </div>
        </nav>
    );
}
