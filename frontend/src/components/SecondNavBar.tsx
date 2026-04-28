import { Link } from 'react-router-dom'

export default function SecondNavBar() {
    return (
        <>
        <img 
        className='absolute left-0 w-full h-full object-cover z-[-1] opacity-75 bg-cover bg-center blur-sm'
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
            <section className="grid grid-cols-3 gap-7 items-center justify-between relative bottom-15 font-tertiary">
                    <div>

                    </div>
            <div className="text-black p-2 relative items-center justify-center flex bottom-1 flex-row gap-15 text-lg font-tertiary">
                    <Link to="/" className="cursor-pointer btn-hover-blue">Anasayfa</Link>
                    <button className="cursor-pointer btn-hover-blue">Hakkımızda</button>
                    <button className="cursor-pointer btn-hover-blue">İletişim</button>
            </div>
                <div className='w-24 h-24 bg-primary-blue  relative bottom-2 rounded-[1000px] left-80'>
                </div>
            </section>
        </div>
        </>
    )
}