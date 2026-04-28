import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

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
                    <h1 className="font-primary font-[760] text-[9rem] leading-[9rem] text-shadow-sm drop-shadow-[0_0_15px_rgba(0,0,0,0.7)]">
                        HIZLI VE <span className="relative right-1.5">GÜVENLİ</span>
                    </h1>
                    </div>
                    <div>
                        <p className="leading-[2.5rem] text-[2.5rem] font-secondary font-light drop-shadow-[0_0_15px_rgba(0,0,0,0.75)] text-shadow-sm">
                        Sıfır stres, <br />
                        Zamanında teslimat.
                        </p>
                    </div>
                    <div className="grid gap-1">
                        <p className="font-[1000] text-[1.5rem] font-quertanary drop-shadow-[0_0_15px_rgba(0,0,0,0.75)] text-shadow-sm">
                            Tek Tıkla İndirin,<br />
                            Kargolarınızı Gönderelim!
                        </p>
                        <img 
                        src="../assets/Stores.png" 
                        alt="store_logos"
                         />
                    </div>
                </div>
                <div className="relative overflow-hidden">
                    <img
                    className="w-full h-full object-none"
                    src="../assets/bg_img.png"
                    alt="Background Layout"     
                    />
                    <nav>
                        <NavBar />
                    </nav>
                </div>
                <div className="col-span-2 text-white text-center relative font-quintary">
                    <section className="grid grid-cols-3 w-full h-[890px]">
                        <img
                        className="absolute top-5 left-1/2 -translate-x-1/2 w-2xl" 
                        src="../assets/Road.png" 
                        alt="Road Icon" />
                        <div className="bg-secondary-blue text-white flex flex-col items-center pt-28 gap-5">
                            <img 
                            src="../assets/Cargo_Icon.png" 
                            alt="Cargo Icon" />
                                <h1 className="text-[3rem] leading-[3rem]">Gönderim <br /> Kolaylığı!</h1>
                            <p className="text-[1.5rem] leading-[1.5rem] p-2">Artık kargo göndermek için <br /> binbir türlü zahmete girmenize <br /> gerek yok.</p>
                        </div>
                        <div className="bg-tertiary-blue flex flex-col items-center pt-29 gap-5">
                            <img 
                            src="../assets/HandCargo_Icon.png" 
                            alt="HandCargo Icon" />
                            <h1 className="text-[3rem] leading-[3rem]">Zamanında <br /> Teslimat!</h1>
                            <p className="text-[1.5rem] leading-[1.5rem] p-2">Uygulamamız üzerinden teslimat talebi <br /> oluşturun ve gün içerisinde en kısa <br /> zamanda elinize veya dilediğiniz <br /> lokasyona ulaşsın!</p>
                        </div>
                        <div className="bg-dark-blue flex flex-col items-center pt-29 gap-5">
                            <img 
                            src="../assets/Customer_Icon.png"
                            alt="Customer Icon" />
                                <h1 className="text-[3rem] leading-[3rem]">Müşteri <br /> Memnuniyeti!</h1>
                                <p className="text-[1.5rem] leading-[1.5rem] p-2">Siz müşterilerimizin memnuniyeti <br /> bizler için çok kıymetli</p>
                        </div>
                    </section>
                    <img 
                    className="absolute bottom-2 right-2"
                    src="../assets/TinyHp_Logo.png" 
                    alt="HandPocket Logo" 
                    />
                </div>
            </section>
            <Footer />
        </>
    )
}