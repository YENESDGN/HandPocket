import { Link } from 'react-router-dom';

export default function ReceiverNavBar() {
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

            <div className='w-14 h-14 rounded-full overflow-hidden bg-gray-300 border-2 border-primary-blue'>
                <img
                    src="/assets/favicon.png"
                    alt="Profil"
                    className='w-full h-full object-cover'
                />
            </div>
        </nav>
    );
}
