export default function ContactInfo() {
    return (
        <>
            <section className="grid grid-rows-4 justify-start items-center text-xl font-tertiary mx-10 mb-30 h-[80%] rounded-lg bg-darker-blue py-10 w-full text-white">
                <div className="flex flex-row gap-10 items-center justify-center">
                    <img 
                    src="./assets/location.png"
                    alt="Location Icon"
                    className="w-10 h-10 object-contain relative left-1"
                     />
                     <div className="flex flex-col gap-1 relative right-2.5">
                        <h1 className="text-sm">Adres Bilgileri</h1>
                        <p className="text-2xl">İstanbul, Türkiye</p>
                     </div>
                </div>
                <div className="flex flex-row gap-10 items-center justify-center">
                <img 
                    src="./assets/Phone.png"
                    alt="Phone Icon"
                    className="w-10 h-10 object-contain relative left-5"
                     />
                     <div className="flex flex-col gap-1">
                        <h1 className="text-sm">Telefon Numarası</h1>
                        <p className="text-2xl">+90 555 123 45 67</p>
                     </div>
                </div>
                <div className="flex flex-row gap-10 items-center justify-center">
                <img 
                    src="./assets/mail.png"
                    alt="Email Icon"
                    className="w-10 h-10 object-contain mr-10 relative left-15"
                     />
                     <div className="flex flex-col gap-1">
                        <h1 className="text-sm">E-posta Adresi</h1>
                        <p className="text-2xl">info@handpocket.com</p>
                     </div>
                </div>
                <div className="flex flex-row gap-10 items-center justify-center">
                <img 
                    src="./assets/clock.png"
                    alt="Clock Icon"
                    className="w-10 h-10 object-contain relative right-3"
                     />
                     <div className="flex flex-col gap-1 relative right-8">
                        <h1 className="text-sm">Çalışma Saatleri</h1>
                        <p className="text-2xl">09:00 - 18:00</p>
                     </div>
                </div>
            </section>
        </>
    )
}