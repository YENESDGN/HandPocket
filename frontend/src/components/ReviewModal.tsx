import { useState } from 'react';
import { Star, Loader2, X } from 'lucide-react';

interface ReviewModalProps {
  onClose: () => void;
  onConfirm: (score: number, comment: string) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
  revieweeName?: string;
}

export default function ReviewModal({ onClose, onConfirm, loading = false, error = null, revieweeName }: ReviewModalProps) {
  const [score, setScore]   = useState(5);
  const [hover, setHover]   = useState(0);
  const [comment, setComment] = useState('');

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm font-sextary'>
      <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 relative'>
        <button onClick={onClose} className='absolute top-4 right-4 text-gray-400 hover:text-darker-blue transition-colors'>
          <X size={18} />
        </button>
        <h3 className='text-darker-blue font-bold text-lg text-center mb-1'>Değerlendir</h3>
        {revieweeName && <p className='text-gray-500 text-sm text-center mb-5'>{revieweeName}</p>}

        <div className='flex justify-center gap-2 mb-5'>
          {[1, 2, 3, 4, 5].map((n) => {
            const active = n <= (hover || score);
            return (
              <button
                key={n}
                type='button'
                onClick={() => setScore(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className='transition-transform active:scale-95'
              >
                <Star
                  size={32}
                  className={active ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
              </button>
            );
          })}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder='Yorum (opsiyonel)'
          rows={3}
          className='w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-darker-blue resize-none focus:outline-none focus:ring-2 focus:ring-secondary-blue'
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
            onClick={() => onConfirm(score, comment.trim())}
            disabled={loading}
            className='flex-1 bg-secondary-blue text-white font-semibold py-2.5 rounded-xl hover:bg-dark-blue transition-all disabled:opacity-60 flex items-center justify-center gap-2'
          >
            {loading && <Loader2 size={14} className='animate-spin' />}
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
