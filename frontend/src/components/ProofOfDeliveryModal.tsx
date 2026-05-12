import { useState } from 'react';

interface ProofOfDeliveryModalProps {
    onClose: () => void;
    onConfirm?: () => void;
}

export default function ProofOfDeliveryModal({ onClose, onConfirm }: ProofOfDeliveryModalProps) {
    const [notes, setNotes] = useState('');
    const [hasPhoto, setHasPhoto] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const dismiss = () => {
        setIsClosing(true);
        setTimeout(onClose, 180);
    };

    const handleConfirm = () => {
        onConfirm?.();
        dismiss();
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-darker-blue/60 font-sextary modal-backdrop${isClosing ? ' closing' : ''}`}
        >
            <div className={`bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 modal-card${isClosing ? ' closing' : ''}`}>

                {/* Header */}
                <div className='px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50'>
                    <div className='flex items-center gap-2'>
                        <div className='bg-secondary-blue text-white p-1.5 rounded-full'>
                            <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                        <h2 className='text-lg font-bold text-darker-blue'>Teslimat Kanıtı</h2>
                    </div>
                    <button
                        onClick={dismiss}
                        className='p-1.5 hover:bg-gray-100 rounded-full transition-colors'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5 text-gray-500' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className='p-6 flex flex-col gap-5'>

                    {/* Upload Zone */}
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>Kargo Doğrulama Fotoğrafı</label>
                        <label className='relative group border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-secondary-blue/5 hover:border-secondary-blue transition-all cursor-pointer min-h-[200px]'>
                            <div className='text-secondary-blue mb-3'>
                                <svg xmlns="http://www.w3.org/2000/svg" className='w-12 h-12' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            {hasPhoto ? (
                                <p className='text-secondary-blue font-semibold text-sm'>Fotoğraf yüklendi ✓</p>
                            ) : (
                                <>
                                    <p className='font-semibold text-darker-blue text-sm'>Fotoğraf Yüklemek İçin Tıklayın</p>
                                    <p className='text-gray-400 text-xs mt-1'>JPG, PNG desteklenir (Maks. 10MB)</p>
                                </>
                            )}
                            <input
                                type='file'
                                className='absolute inset-0 opacity-0 cursor-pointer'
                                accept='image/jpeg,image/png'
                                onChange={() => setHasPhoto(true)}
                            />
                        </label>
                    </div>

                    {/* Notes */}
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>Teslimat Notu</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder='Teslimat hakkında özel bir not ekleyin...'
                            className='w-full h-24 p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-secondary-blue focus:border-secondary-blue outline-none transition-all resize-none placeholder:text-gray-400'
                        />
                    </div>

                    {/* Info Strip */}
                    <div className='flex items-center gap-3 p-3 bg-secondary-blue/10 rounded-xl'>
                        <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5 text-secondary-blue flex-shrink-0' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className='text-xs text-secondary-blue'>Konum verisi ve zaman damgası bu gönderime otomatik olarak eklenecektir.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className='px-6 py-4 bg-gray-50 flex gap-3'>
                    <button
                        onClick={dismiss}
                        className='flex-1 py-2.5 border border-gray-300 text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors'
                    >
                        Vazgeç
                    </button>
                    <button
                        onClick={handleConfirm}
                        className='flex-[2] py-2.5 bg-secondary-blue text-white rounded-xl text-base font-bold flex items-center justify-center gap-2 hover:bg-dark-blue transition-all active:scale-[0.98]'
                    >
                        Teslimatı Onayla
                        <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
