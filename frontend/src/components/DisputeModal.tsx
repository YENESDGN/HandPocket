import { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface DisputeModalProps {
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
}

export default function DisputeModal({ onClose, onConfirm, loading = false, error = null }: DisputeModalProps) {
  const [reason, setReason] = useState('');

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm font-sextary'>
      <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 relative'>
        <button onClick={onClose} className='absolute top-4 right-4 text-gray-400 hover:text-darker-blue transition-colors'>
          <X size={18} />
        </button>
        <div className='flex items-center gap-2 justify-center mb-4'>
          <AlertTriangle size={20} className='text-orange-500' />
          <h3 className='text-darker-blue font-bold text-lg'>İtiraz Aç</h3>
        </div>
        <p className='text-gray-500 text-xs text-center mb-4'>
          Lütfen yaşadığınız sorunu açıklayın. Yöneticilerimiz inceleyecektir.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder='Anlaşmazlığın nedeni…'
          rows={4}
          className='w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-darker-blue resize-none focus:outline-none focus:ring-2 focus:ring-orange-400'
        />

        {error && <p className='text-red-500 text-xs mt-2'>{error}</p>}

        <div className='flex gap-3 mt-5'>
          <button
            onClick={onClose}
            disabled={loading}
            className='flex-1 border border-gray-300 text-gray-500 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-60'
          >
            Vazgeç
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={loading || reason.trim().length < 5}
            className='flex-1 bg-orange-500 text-white font-semibold py-2.5 rounded-xl hover:bg-orange-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2'
          >
            {loading && <Loader2 size={14} className='animate-spin' />}
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
