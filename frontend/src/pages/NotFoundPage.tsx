import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className='min-h-screen bg-dark-blue flex flex-col items-center justify-center gap-8 font-sextary text-center px-4'>

            <div className='fade-in-up flex flex-col items-center gap-4'>
                <div className='w-24 h-24 bg-secondary-blue/10 border-2 border-secondary-blue/30 rounded-3xl flex items-center justify-center mb-2'>
                    <img src='/assets/TinyHp_Logo.png' alt='HandPocket' className='w-14 h-14 object-contain' />
                </div>
                <p className='text-secondary-blue font-bold text-8xl leading-none tracking-tighter'>404</p>
                <h1 className='text-white text-2xl font-bold'>Sayfa Bulunamadı</h1>
                <p className='text-white/50 text-sm max-w-xs leading-relaxed'>
                    Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
                </p>
            </div>

            <div className='flex gap-3 fade-in-up-delay-1'>
                <Link
                    to='/'
                    className='bg-secondary-blue text-white px-7 py-2.5 rounded-full font-semibold text-sm hover:bg-primary-blue transition-all duration-200 active:scale-95'
                >
                    Anasayfaya Dön
                </Link>
                <button
                    onClick={() => navigate(-1)}
                    className='bg-white/10 border border-white/20 text-white px-7 py-2.5 rounded-full font-semibold text-sm hover:bg-white/20 transition-all duration-200 active:scale-95'
                >
                    Geri Git
                </button>
            </div>
        </div>
    );
}
