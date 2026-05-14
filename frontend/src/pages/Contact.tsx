import SecondNavBar from "../components/SecondNavBar";
import ContactInfo from "../components/ContactInfo";
import MapboxMap from "../components/MapboxMap";

export default function Contact() {
    return (
        <>
            <SecondNavBar />
            <div className="p-10 bg-dark-blue contact-map">
                <div className="w-full h-[1000px] rounded-lg border-2 border-primary-blue overflow-hidden">
                    <MapboxMap
                        center={[28.97, 41.005]}
                        zoom={11}
                        markers={[{ lng: 28.97, lat: 41.005, color: '#08b4fb', popup: 'HandPocket Ofisi' }]}
                    />
                </div>
                </div>
            <section className="grid grid-cols-2 gap-70 p-10 bg-dark-blue">
                <div className="rounded-lg p-10 bg-darker-blue text-white w-[150%] contact-form">
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
                <div className="flex flex-row items-center contact-info">
                    <ContactInfo />
                </div>
            </section>
        </>
    )
}