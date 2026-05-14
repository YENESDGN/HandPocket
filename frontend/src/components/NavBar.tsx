import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function NavBar() {
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const role = useAuthStore((s) => s.role);

    return (
        <section className="flex flex-row gap-7 items-center top-10 right-15 absolute font-tertiary">
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

            {isLoggedIn ? (
                <Link to="/profil">
                    <div className='w-12 h-12 rounded-full overflow-hidden bg-gray-300 border-2 border-primary-blue'>
                        <img
                            src="/assets/favicon.png"
                            alt="Profil"
                            className='w-full h-full object-cover'
                        />
                    </div>
                </Link>
            ) : (
                <div className='text-white bg-[#08b4fb] p-1 pr-3 pl-3 rounded-[30px] flex flex-row justify-between items-center gap-3'>
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
