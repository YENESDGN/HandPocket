import NavBar from "../components/NavBar";

export default function LandingPage() {
    return (
        <>
            <section className="grid grid-cols-2">
                <div className="bg-[#08b4fb] w-full h-full grid grid-cols-1 text-white gap-20 p-10">
                    <div>
                        <img 
                        className="relative top-5"
                        src="../assets/Hp_Logo.png" 
                        alt="HandPocket_Logo" />
                    </div>
                    <div> 
                    <h1 className="font-bold text-[9rem] leading-[9rem]">
                        HIZLI VE <span className="relative right-1.5">GÜVENLİ</span>
                    </h1>
                    </div>
                    <div>
                        <p className="text-[1.5rem]">
                        Sıfır stres, <br />
                        Zamanında teslimat.
                        </p>
                    </div>
                    <div className="grid gap-1">
                        <p className="font-bold text-[1rem]">
                            Tek Tıkla İndirin,<br />
                            Kargolarınızı Gönderelim!
                        </p>
                        <img 
                        src="../assets/Stores.png" 
                        alt="store_logos"
                         />
                    </div>
                </div>
                <div>
                    <nav>
                        <NavBar />
                    </nav>
                </div>
                <div className="col-span-2 text-white text-center relative">
                    <section className="grid grid-cols-3 w-full">
                        <img
                        className="absolute top-5 left-1/2 -translate-x-1/2 w-2xl" 
                        src="../assets/Road.png" 
                        alt="Road Icon" />
                        <div className="bg-[#1ea4dc] text-white flex flex-col items-center pt-16 pb-16 gap-5">
                            <img 
                            src="../assets/Cargo_Icon.png" 
                            alt="Cargo Icon" />
                            <h1 className="text-[3.5rem] leading-[3.5rem]">Gönderim Kolaylığı!</h1>
                            <p className="text-[2rem] p-2">Artık kargo göndermek için binbir türlü zahmete girmenize gerek yok.</p>
                        </div>
                        <div className="bg-[#1e91c1] flex flex-col items-center pt-[4.3rem] pb-16 gap-5">
                            <img 
                            src="../assets/HandCargo_Icon.png" 
                            alt="HandCargo Icon" />
                            <h1 className="text-[3.5rem] leading-[3.5rem]">Zamanında Teslimat!</h1>
                            <p className="text-[2rem] p-2">Uygulamamız üzerinden teslimat talebi oluşturun ve en kısa zamanda elinize veya dilediğiniz lokasyona ulaşsın!</p>
                        </div>
                        <div className="bg-[#206988] flex flex-col items-center pt-[4.3rem] pb-16 gap-5">
                            <img 
                            src="../assets/Customer_Icon.png"
                            alt="Customer Icon" />
                            <h1 className="text-[3.5rem] leading-[3.5rem]">Müşteri Memnuniyeti!</h1>
                            <p className="text-[2rem] p-2">Artık kargo göndermek için binbir türlü zahmete girmenize gerek yok.</p>
                        </div>
                    </section>
                    <img 
                    className="absolute bottom-2 right-2"
                    src="../assets/TinyHp_Logo.png" 
                    alt="HandPocket Logo" 
                    />
                </div>
            </section>
        </>
    )
}
