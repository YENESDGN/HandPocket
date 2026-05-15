import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

export type ModalType = 'deposit' | 'withdraw' | null;

interface WalletModalProps {
  type: ModalType;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void>;
  loading: boolean;
}

export default function WalletModal({ type, onClose, onConfirm, loading }: WalletModalProps) {
  const [amount, setAmount] = useState('');
  const [error, setError]   = useState('');

  if (!type) return null;

  const isDeposit = type === 'deposit';
  const title     = isDeposit ? 'Bakiye Yükle' : 'Para Çek';

  const handleSubmit = async () => {
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) { setError('Geçerli bir miktar girin.'); return; }
    setError('');
    await onConfirm(val);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4 font-sextary'>
        <div className='flex items-center justify-between mb-5'>
          <h2 className='text-darker-blue font-bold text-lg'>{title}</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600'><X size={18} /></button>
        </div>
        <input
          type='number'
          min='1'
          step='1'
          placeholder='Miktar (TL)'
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className='w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-primary-blue transition-colors mb-2'
        />
        {error && <p className='text-red-500 text-xs mb-2'>{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className='w-full bg-primary-blue text-white font-bold py-3 rounded-xl hover:bg-secondary-blue transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-1'
        >
          {loading && <Loader2 size={16} className='animate-spin' />}
          {title}
        </button>
      </div>
    </div>
  );
}
