import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import NavBar from '../components/NavBar';
import { useAuthStore } from '../store/auth';

type UserRole = 'sender' | 'courier';

interface AuthPageProps {
    initialForm?: 'login' | 'register';
}

export default function AuthPage({ initialForm = 'login' }: AuthPageProps) {
    const [activeForm, setActiveForm] = useState<'login' | 'register'>(initialForm);
    const [registerRole, setRegisterRole] = useState<UserRole>('sender');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerFullName, setRegisterFullName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');

    const { signIn, signUp, loading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signIn(loginEmail, loginPassword);
            navigate('/profil');
        } catch {
            // error is set in store
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signUp(registerEmail, registerPassword, registerFullName, registerRole);
            navigate('/profil');
        } catch {
            // error is set in store
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background */}
            <img
                className="absolute inset-0 w-full h-full object-cover z-0 opacity-75 blur-sm"
                src="/assets/RgLg_bg.png"
                alt=""
            />
            <div className="absolute inset-0 bg-darker-blue/40 z-0" />

            {/* NavBar */}
            <div className="relative flex flex-col justify-between border-b bg-white/85 border-white/70 bottom-4 h-[130px]">
                <div className="flex items-center h-full px-6">
                    <img
                        className="w-16 h-16 relative top-3 object-contain"
                        src="/assets/favicon.png"
                        alt="HandPocket Logo"
                    />
                </div>
                <NavBar />
            </div>

            {/* Centered Card */}
            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-10">
                <div className="w-full max-w-[460px] fade-in-up">

                    {/* Brand */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 bg-white border-2 border-secondary-blue/30 rounded-3xl flex items-center justify-center mb-3">
                            <img src="/assets/favicon.png" alt="HandPocket Logo" className="w-16 h-16 object-contain" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight font-tertiary">HandPocket</h1>
                        <p className="text-sm text-white/60 uppercase tracking-widest mt-1 font-secondary">
                            Hızlı & Güvenli Kargo Platformu
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-primary-blue border border-white/20 rounded-2xl shadow-2xl shadow-black/20 p-8">

                        {error && (
                            <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-400/40 rounded-xl text-sm text-red-200 flex justify-between items-center">
                                <span>{error}</span>
                                <button onClick={clearError} className="text-red-300 hover:text-white ml-3 font-bold">✕</button>
                            </div>
                        )}

                        {activeForm === 'login' ? (
                            <div key="login" className="fade-in-up">
                                <header className="mb-7">
                                    <h2 className="text-2xl font-bold text-white font-tertiary">Giriş Yap</h2>
                                    <p className="text-sm text-white/80 mt-1">Hesabınıza erişmek için bilgilerinizi girin</p>
                                </header>

                                <form onSubmit={handleLogin} className="space-y-5">
                                    <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-white uppercase tracking-wider">E-posta</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-blue" size={17} />
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="ornek@mail.com"
                                                required
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-white/20 rounded-xl text-sm text-darker-blue placeholder:text-dark-blue/50 focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-xs font-semibold text-white uppercase tracking-wider">Parola</label>
                                            <Link to="/sifremi-unuttum" className="text-xs text-white hover:text-white/70 font-semibold transition-colors">
                                                Şifremi Unuttum
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-blue" size={17} />
                                            <input
                                                type="password"
                                                name="password"
                                                placeholder="••••••••"
                                                required
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-white/20 rounded-xl text-sm text-darker-blue placeholder:text-dark-blue/50 focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-white hover:bg-white/80 hover:text-primary-blue text-primary-blue font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-blue/25 active:scale-[0.98] transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Giriş Yap</span><ArrowRight size={18} /></>}
                                    </button>
                                </form>

                                <div className="mt-7 pt-6 border-t border-white/10 text-center">
                                    <p className="text-sm text-white/80">
                                        Hesabın yok mu?{' '}
                                        <button
                                            onClick={() => setActiveForm('register')}
                                            className="text-white font-semibold hover:text-white/70 transition-colors"
                                        >
                                            Kayıt Ol
                                        </button>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div key="register" className="fade-in-up">
                                <header className="mb-7">
                                    <h2 className="text-2xl font-bold text-white font-tertiary">Kayıt Ol</h2>
                                    <p className="text-sm text-white/80 mt-1">Platforma katılmak için bilgilerinizi girin</p>
                                </header>

                                <form onSubmit={handleRegister} className="space-y-5">
                                    <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-white uppercase tracking-wider">Ad Soyad</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-blue" size={17} />
                                            <input
                                                type="text"
                                                name="fullName"
                                                placeholder="Ad Soyad"
                                                required
                                                value={registerFullName}
                                                onChange={(e) => setRegisterFullName(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-white/20 rounded-xl text-sm text-darker-blue placeholder:text-dark-blue/50 focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-white uppercase tracking-wider">E-posta</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-blue" size={17} />
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="ornek@mail.com"
                                                required
                                                value={registerEmail}
                                                onChange={(e) => setRegisterEmail(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-white/20 rounded-xl text-sm text-darker-blue placeholder:text-dark-blue/50 focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider">E-posta Tekrar</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-blue" size={17} />
                                            <input
                                                type="email"
                                                name="emailConfirm"
                                                placeholder="ornek@mail.com"
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-white/20 rounded-xl text-sm text-darker-blue placeholder:text-dark-blue/50 focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-white uppercase tracking-wider">Parola</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-blue" size={17} />
                                            <input
                                                type="password"
                                                name="password"
                                                placeholder="••••••••"
                                                required
                                                value={registerPassword}
                                                onChange={(e) => setRegisterPassword(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-white/20 rounded-xl text-sm text-darker-blue placeholder:text-dark-blue/50 focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-white uppercase tracking-wider">Parola Tekrar</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-blue" size={17} />
                                            <input
                                                type="password"
                                                name="passwordConfirm"
                                                placeholder="••••••••"
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-white/20 rounded-xl text-sm text-darker-blue placeholder:text-dark-blue/50 focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Role Toggle */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-primary-blue uppercase tracking-wider">Hesap Türü</label>
                                        <div className="flex rounded-xl overflow-hidden border border-white/20 bg-white">
                                            <button
                                                type="button"
                                                onClick={() => setRegisterRole('sender')}
                                                className={`flex-1 py-3 text-sm font-bold transition-all duration-200 ${
                                                    registerRole === 'sender'
                                                        ? 'bg-primary-blue text-white shadow-sm'
                                                        : 'text-primary-blue hover:text-primary-blue/70'
                                                }`}
                                            >
                                                Gönderici
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRegisterRole('courier')}
                                                className={`flex-1 py-3 text-sm font-bold transition-all duration-200 ${
                                                    registerRole === 'courier'
                                                        ? 'bg-primary-blue text-white shadow-sm'
                                                        : 'text-primary-blue hover:text-primary-blue/70'
                                                }`}
                                            >
                                                Kurye
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-white hover:bg-white/80 hover:text-primary-blue text-primary-blue font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-blue/25 active:scale-[0.98] transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Hesap Oluştur</span><ArrowRight size={18} /></>}
                                    </button>
                                </form>

                                <div className="mt-7 pt-6 border-t border-white/10 text-center">
                                    <p className="text-sm text-white/80">
                                        Zaten hesabın var mı?{' '}
                                        <button
                                            onClick={() => setActiveForm('login')}
                                            className="text-white font-semibold hover:text-white/70 transition-colors"
                                        >
                                            Giriş Yap
                                        </button>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer hint */}
                    <div className="mt-6 flex items-center justify-center gap-1 text-white/40">
                        <ShieldCheck size={14} />
                        <p className="text-xs uppercase tracking-widest">256-bit şifreli güvenli bağlantı</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
