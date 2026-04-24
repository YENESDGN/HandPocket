export default function Buttons() {
    return (
        <>
        <section className="flex flex-row gap-7 items-center top-10 right-15 absolute font-tertiary ">
        <div className="text-black p-2 flex flex-row gap-7 text-xl">
                <button className="cursor-pointer btn-hover-blue">Anasayfa</button>
                <button className="cursor-pointer btn-hover-blue">Hakkımızda</button>
                <button className="cursor-pointer btn-hover-blue">İletişim</button>
                <button className="cursor-pointer btn-hover-blue">Şikayet</button>
        </div>
            <div className='text-white bg-[#08b4fb] p-1 pr-3 pl-3 rounded-[30px] flex flex-row justify-between items-center gap-3'>
                <button className="cursor-pointer btn-hover-blue-secondary">
                    Giriş Yap
                </button>
                <button className="cursor-pointer btn-hover-blue-secondary">
                    Kayıt Ol
                </button>
            </div>
        </section>
        </>
    )
}