import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
    const [email, setEmail]   = useState('');
    const [sent, setSent]     = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => { setLoading(false); setSent(true); }, 800);
    };

    return (
        <div className='min-h-screen bg-dark-blue flex items-center justify-center px-4 font-sextary'>
            <div className='bg-white rounded-2xl p-10 w-full max-w-md shadow-2xl drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] fade-in-up'>

                {/* Header */}
                <div className='flex flex-col items-center mb-8'>
                    <div className='w-16 h-16 bg-secondary-blue/10 border-2 border-secondary-blue/30 rounded-2xl flex items-center justify-center mb-4'>
                        <img src='/assets/favicon.png' alt='HandPocket' className='w-10 h-10 object-contain' />
                    </div>
                    <h1 className='text-2xl font-bold text-darker-blue'>Şifremi Unuttum</h1>
                    <p className='text-gray-500 text-sm mt-2 text-center leading-relaxed'>
                        {sent
                            ? 'Sıfırlama bağlantısı e-posta adresinize gönderildi.'
                            : 'Kayıtlı e-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.'}
                    </p>
                </div>

                {!sent ? (
                    <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
                        <div className='flex flex-col gap-1.5'>
                            <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                                E-Posta Adresi
                            </label>
                            <input
                                type='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='ornek@mail.com'
                                required
                                className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary-blue focus:border-secondary-blue outline-none transition-all placeholder:text-gray-300'
                            />
                        </div>

                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full bg-secondary-blue text-white py-3 rounded-xl font-bold text-sm hover:bg-dark-blue transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            {loading ? 'Gönderiliyor…' : 'Sıfırlama Bağlantısı Gönder'}
                        </button>
                    </form>
                ) : (
                    <div className='flex flex-col items-center gap-4'>
                        <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
                            <svg xmlns='http://www.w3.org/2000/svg' className='w-8 h-8 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                            </svg>
                        </div>
                        <p className='text-sm text-gray-500 text-center leading-relaxed'>
                            <span className='font-semibold text-darker-blue'>{email}</span> adresine bağlantı gönderildi.
                            Gelen kutunuzu kontrol edin.
                        </p>
                        <button
                            onClick={() => { setSent(false); setEmail(''); }}
                            className='text-secondary-blue text-xs font-semibold hover:text-dark-blue transition-colors'
                        >
                            Farklı bir e-posta dene
                        </button>
                    </div>
                )}

                <div className='mt-8 pt-6 border-t border-gray-100 text-center'>
                    <Link to='/giris' className='text-secondary-blue text-sm font-semibold hover:text-dark-blue transition-colors'>
                        ← Giriş Yap sayfasına dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
