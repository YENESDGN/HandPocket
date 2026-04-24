import { useState } from 'react';
import NavBar from './NavBar';

export default function LgnRgstrBtns() {
    const [activeForm, setActiveForm] = useState<'login' | 'register'>('login');

    return (
        <>
        <img 
        className='absolute left-0 w-full h-full object-cover z-[-1] opacity-75 bg-cover bg-center blur-sm'
        src="assets/RgLg_bg.png"
        alt="Register-Login Background" />
        <div className="z-10">
            <NavBar />
        </div>
        <hr className="border-s border-black-100 border-opacity-50 w-full my-30 mb-0 p-0 relative z-10" />
        <section className="grid grid-cols-2 max-w-6xl mx-auto my-10 mt-0 p-10 font-tertiary font-bold pt-20 relative z-10">
            <div 
                onClick={() => setActiveForm('login')}
                className={`cursor-pointer rounded-xl p-8 transition-all duration-300 ${
                    activeForm === 'login' 
                        ? 'bg-white border-2 border-primary-blue' 
                        : 'bg-[#004561]'
                }`}
            >
                {activeForm === 'login' ? (
                    <form className="flex flex-col gap-8 min-h-[700px] justify-between">
                        <div className="flex flex-col gap-8">
                            <h2 className="text-2xl font-bold font-tertiary text-center mb-4">Giriş Yap</h2>
                            <div className="flex flex-col gap-1">
                                <span>Kullanıcı Adı</span>
                                <input 
                                    type="text" 
                                    name="username" 
                                    placeholder="Kullanıcı Adı"
                                    className="text-white border border-gray-300 bg-darker-blue rounded-full p-2"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span>E-posta</span>
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="E-posta"
                                    className="text-white border border-gray-300 bg-darker-blue rounded-full p-2"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span>Parola</span>
                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="Parola"
                                    className="text-white border border-gray-300 bg-darker-blue rounded-full p-2"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                className="inline-block px-6 py-2 bg-darker-blue rounded-full text-white btn-hover-rg-lg"
                            >
                                Giriş Yap
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                        <h2 className="text-white text-5xl font-bold font-tertiary text-center">
                            Zaten Hesabın mı Var? Giriş Yap!
                        </h2>
                    </div>
                )}
            </div>
            
            <div 
                onClick={() => setActiveForm('register')}
                className={`cursor-pointer rounded-xl p-8  ${
                    activeForm === 'register' 
                        ? 'bg-white border-2 border-primary-blue' 
                        : 'bg-[#004561]'
                }`}
            >
                {activeForm === 'register' ? (
                    <form className="flex flex-col gap-8 min-h-[600px] justify-between">
                        <h2 className="text-2xl font-bold font-tertiary text-center mb-4">Kayıt Ol</h2>
                        <div className="flex flex-col gap-1">
                            <span>Kullanıcı Adı</span>
                            <input 
                                type="text" 
                                name="username" 
                                placeholder="Kullanıcı Adı"
                                className="text-white border border-gray-300 bg-darker-blue rounded-full p-2"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span>E-posta</span>
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="E-posta"
                                className="text-white border border-gray-300 bg-darker-blue rounded-full p-2"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span>Tekrar E-posta</span>
                            <input 
                                type="email" 
                                name="emailConfirm" 
                                placeholder="Tekrar E-Posta"
                                className="text-white border border-gray-300 bg-darker-blue rounded-full p-2"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span>Parola</span>
                            <input 
                                type="password" 
                                name="password" 
                                placeholder="Parola"
                                className="text-white border border-gray-300 bg-darker-blue rounded-full p-2"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span>Tekrar Parola</span>
                            <input 
                                type="password" 
                                name="passwordConfirm" 
                                placeholder="Tekrar Parola"
                                className="text-white border border-gray-300 bg-darker-blue rounded-full p-2"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                className="text-white inline-block px-6 py-2 bg-darker-blue rounded-full btn-hover-rg-lg"
                            >
                                Kayıt Ol
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                        <h2 className="text-white text-5xl font-bold font-tertiary text-center">
                            Hesabın mı Yok? Kayıt Ol!
                        </h2>
                    </div>
                )}
            </div>
        </section>
        </>
    )
}