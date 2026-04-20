export default function Buttons() {
    return (
        <>
        <section className="flex flex-row gap-7 items-center top-10 right-15 absolute">
        <div className="text-black p-2 flex flex-row gap-7">
                <button>Hakkımızda</button>
                <button>İletişim</button>
                <button>Şikayet</button>
        </div>
            <div className='text-white bg-[#08b4fb] p-1 pr-3 pl-3 rounded-[30px] flex flex-row justify-between items-center gap-3'>
                <button>
                    Giriş Yap
                </button>
                <button>
                    Kayıt Ol
                </button>
            </div>
        </section>
        </>
    )
}