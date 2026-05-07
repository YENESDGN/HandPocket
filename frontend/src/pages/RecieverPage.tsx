import ReceiverNavBar from '../components/ReceiverNavBar';
import DeliveryAmountCard from '../components/DeliveryAmountCard';
import type { DeliveryRequest } from '../types';

const mockRequest: DeliveryRequest = {
    id: '1',
    sender_id: 'user-1',
    package_photo_url: '',
    package_description: 'Elektronik Eşya',
    pickup_address: 'Kadıköy, İstanbul',
    distance_km: 1.2,
    estimated_time_mins: 15,
    weight_kg: 2.5,
    open_time_multiplier: 1.0,
    calculated_price: 27,
    status: 'pending',
    created_at: new Date(),
    updated_at: new Date(),
};

const priorityLabel = (multiplier: number): string => {
    if (multiplier >= 2.0) return 'Çok Acil';
    if (multiplier >= 1.5) return 'Acil';
    return 'Normal';
};

export default function RecieverPage() {
    const handleAccept = () => {
        // TODO: API call to accept delivery
    };

    return (
        <>
            <ReceiverNavBar />
            <section className='grid grid-cols-[23%_77%] p-10 gap-10 items-start bg-dark-blue font-sextary'>
                <div className='bg-tertiary-blue w-full rounded-xl p-4 flex flex-col gap-2 drop-shadow-[0_0_15px_rgba(0,0,0,0.7)]'>
                    <div className='flex flex-col gap-1'>
                        <span className='text-white text-lg'>Kargo Adı</span>
                        <input
                            type='text'
                            readOnly
                            value={mockRequest.package_description}
                            className='bg-white text-black rounded px-3 py-2 cursor-default'
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <span className='text-white text-lg'>Başlangıç Konumu</span>
                        <input
                            type='text'
                            readOnly
                            value={mockRequest.pickup_address}
                            className='bg-white text-black rounded px-3 py-2 cursor-default'
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <span className='text-white text-lg'>Bitiş Konumu</span>
                        <input
                            type='text'
                            readOnly
                            value='Beşiktaş, İstanbul'
                            className='bg-white text-black rounded px-3 py-2 cursor-default'
                        />
                    </div>

                    <div className='grid grid-cols-2 gap-2'>
                        <div className='flex flex-col gap-1'>
                            <span className='text-white text-lg'>Ağırlık (kg)</span>
                            <input
                                type='number'
                                readOnly
                                value={mockRequest.weight_kg}
                                className='bg-white text-black rounded px-3 py-2 cursor-default'
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <span className='text-white text-lg'>Öncelik</span>
                            <input
                                type='text'
                                readOnly
                                value={priorityLabel(mockRequest.open_time_multiplier)}
                                className='bg-white text-black rounded px-3 py-2 cursor-default'
                            />
                        </div>
                    </div>

                    <DeliveryAmountCard
                        distanceKm={mockRequest.distance_km}
                        estimatedTimeMins={mockRequest.estimated_time_mins}
                        calculatedPrice={mockRequest.calculated_price}
                        onAccept={handleAccept}
                    />
                </div>

                <div className='relative w-full h-[850px] rounded-xl overflow-hidden'>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d385396.60516460294!2d28.682528!3d41.005369!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa7040068086b%3A0xe1ccfe98bc01b0d0!2zxLBzdGFuYnVsLCBUw7xya2l5ZQ!5e0!3m2!1str!2str!4v1234567890"
                        className="w-full h-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Kargo Haritası"
                    />
                </div>
            </section>
        </>
    );
}
