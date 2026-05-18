import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Star } from 'lucide-react';
import { getReviewsForUser } from '../services/reviewService';
import { useAuthStore } from '../store/auth';
import type { Review } from '../types';

function formatDate(raw: string): string {
  return new Date(raw).toLocaleDateString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function Stars({ score, size = 16 }: { score: number; size?: number }) {
  return (
    <div className='inline-flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= score ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

export default function ReviewsPanel() {
  const userId = useAuthStore((s) => s.user?.id);
  const averageRating = useAuthStore((s) => s.user?.average_rating);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    getReviewsForUser(userId)
      .then(setReviews)
      .catch(() => setError('Değerlendirmeler yüklenemedi.'))
      .finally(() => setLoading(false));
  }, [userId]);

  const distribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    for (const r of reviews) {
      if (r.score >= 1 && r.score <= 5) dist[r.score - 1] += 1;
    }
    return dist;
  }, [reviews]);

  const total = reviews.length;
  const computedAvg = total > 0 ? reviews.reduce((a, r) => a + r.score, 0) / total : 0;
  const displayAvg = averageRating ?? computedAvg;

  if (loading) {
    return (
      <div className='flex justify-center py-16'>
        <Loader2 size={32} className='text-primary-blue animate-spin' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl'>
        {error}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6 font-sextary'>
      <div className='bg-secondary-blue rounded-2xl p-8 grid grid-cols-2 gap-8 drop-shadow-[0_0_15px_rgba(0,0,0,0.3)] fade-in-up'>
        <div className='flex flex-col items-center justify-center text-white'>
          <span className='text-7xl font-bold leading-none'>{displayAvg.toFixed(1)}</span>
          <div className='mt-2'><Stars score={Math.round(displayAvg)} size={22} /></div>
          <span className='text-white/80 text-sm mt-2'>{total} değerlendirme</span>
        </div>
        <div className='flex flex-col gap-2 justify-center'>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star - 1];
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={star} className='flex items-center gap-3 text-white text-sm'>
                <span className='w-3 text-right'>{star}</span>
                <Star size={14} className='fill-amber-400 text-amber-400' />
                <div className='flex-1 bg-white/15 rounded-full h-2 overflow-hidden'>
                  <div className='bg-amber-400 h-full rounded-full transition-all' style={{ width: `${pct}%` }} />
                </div>
                <span className='w-6 text-right text-white/80 text-xs'>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className='bg-white rounded-xl py-16 text-center drop-shadow-[0_0_8px_rgba(0,0,0,0.1)] fade-in-up-delay-1'>
          <Star size={40} className='text-gray-300 mx-auto mb-3' />
          <p className='text-gray-500 text-sm'>Henüz bir değerlendirme almadınız.</p>
        </div>
      ) : (
        <div className='flex flex-col gap-3 fade-in-up-delay-1'>
          {reviews.map((r) => (
            <div key={r.id} className='bg-white rounded-xl p-5 drop-shadow-[0_0_8px_rgba(0,0,0,0.1)]'>
              <div className='flex items-center justify-between mb-2'>
                <Stars score={r.score} />
                <div className='flex items-center gap-3 text-xs text-gray-400'>
                  <Link to={`/talep/${r.request_id}`} className='font-mono text-secondary-blue font-semibold hover:underline'>
                    {r.request_id.slice(0, 8).toUpperCase()}
                  </Link>
                  <span>{formatDate(r.created_at)}</span>
                </div>
              </div>
              {r.comment ? (
                <p className='text-gray-700 text-sm leading-relaxed'>{r.comment}</p>
              ) : (
                <p className='text-gray-400 text-sm italic'>Yorum eklenmedi.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
