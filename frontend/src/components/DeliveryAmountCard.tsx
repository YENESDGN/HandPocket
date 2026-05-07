interface DeliveryAmountCardProps {
    distanceKm: number;
    estimatedTimeMins: number;
    calculatedPrice: number;
    onAccept: () => void;
}

export default function DeliveryAmountCard({
    distanceKm,
    estimatedTimeMins,
    calculatedPrice,
    onAccept,
}: DeliveryAmountCardProps) {
    return (
        <div className='rounded-xl overflow-hidden mt-2 drop-shadow-[0_0_10px_rgba(0,0,0,0.4)]'>
            <div className='bg-darker-blue px-4 py-2'>
                <h2 className='text-white font-extrabold text-sm tracking-widest uppercase'>
                    Teslimat Miktarı
                </h2>
            </div>

            <div className='bg-white px-4 pt-3 pb-4 flex flex-col gap-3'>
                <div>
                    <span className='text-gray-500 text-xs block mb-1'>Mesafe</span>
                    <p className='text-[#808080] text-xl font-semibold'>{distanceKm} KM</p>
                    <div className='w-full h-[2px] bg-primary-blue mt-1 rounded-xl' />
                </div>

                <div>
                    <span className='text-gray-500 text-xs block mb-1'>Süre</span>
                    <p className='text-[#808080] text-xl font-semibold'>{estimatedTimeMins} dk</p>
                    <div className='w-full h-[2px] bg-primary-blue mt-1 rounded-xl' />
                </div>

                <div>
                    <span className='text-dark-blue font-bold text-lg block mb-1'>
                        Hesaplanan Ücret
                    </span>
                    <p className='text-dark-blue text-3xl font-extrabold'>{calculatedPrice} TL</p>
                </div>

                <button
                    onClick={onAccept}
                    className='btn-hover-shadow w-full bg-primary-blue text-white rounded px-4 py-3 font-extrabold text-base tracking-widest uppercase'
                >
                    Teslimatı Kabul Et
                </button>
            </div>
        </div>
    );
}
