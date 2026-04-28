import NavBar from "../components/NavBar";
import ContactInfo from "../components/ContactInfo";

export default function Contact() {
    return (
        <>
        <img 
        className='absolute left-0 w-full h-full object-cover overflow-hidden z-[-1] opacity-75 bg-cover bg-center blur-sm'
        src="assets/RgLg_bg.png"
        alt="Register-Login Background" />
        <div className='border-b-1 border-thin relative h-[150px]'>
            <div className='grid grid-cols-2 items-center justify-start gap-0'>
                <div className='flex flex-row items-center justify-start gap-0'>
                    <img 
                        className='w-20 h-20 object-contain relative left-5 top-5'
                        src="/assets/favicon.png" 
                        alt="HandPocket Logo" />
                </div>
            </div>
            <NavBar />
        </div>
            <div className="p-10 bg-dark-blue">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d385396.60516460294!2d28.682528!3d41.005369!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa7040068086b%3A0xe1ccfe98bc01b0d0!2zxLBzdGFuYnVsLCBUw7xya2l5ZQ!5e0!3m2!1str!2str!4v1234567890"
                    className="w-full h-[1000px] rounded-lg border-2 border-primary-blue"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="HandPocket Konum - İstanbul, Türkiye"
                />
                </div>
            <section className="grid grid-cols-2 gap-70 p-10 bg-dark-blue">
                <div className="rounded-lg p-10 bg-darker-blue text-white w-[150%]">
                    <form className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-white font-sextary">Tam Ad</label>
                                <input 
                                    type="text"
                                    name="fullName"
                                    className="p-3 rounded-md border-none outline-none bg-white text-black"
                                    placeholder=""
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-white font-sextary">E-mail Adresi</label>
                                <input 
                                    type="email"
                                    name="email"
                                    className="p-3 rounded-md border-none outline-none bg-white text-black"
                                    placeholder=""
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-white font-sextary">Konu</label>
                            <input 
                                type="text"
                                name="subject"
                                className="p-3 rounded-md border-none outline-none bg-white text-black"
                                placeholder=""
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-white font-sextary">Mesaj</label>
                            <textarea 
                                name="message"
                                rows={8}
                                className="p-3 rounded-md border-none outline-none resize-none bg-white text-black"
                                placeholder=""
                            />
                        </div>
                        
                        <div className="flex justify-start">
                            <button 
                                type="submit"
                                className="bg-white text-primary-blue font-sextary font-bold px-12 py-3 rounded-md btn-hover-shadow"
                            >
                                GÖNDER
                            </button>
                        </div>
                    </form>
                </div>
                <div className="flex flex-row items-center">
                    <ContactInfo />
                </div>
            </section>
        </>
    )
}