import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, Loader2, Scale, User as UserIcon } from 'lucide-react';
import { getMyDisputes } from '../services/disputeService';
import { useAuthStore } from '../store/auth';
import type { Dispute } from '../types';

function formatDate(raw: string): string {
  return new Date(raw).toLocaleDateString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function DisputesPanel() {
  const userId = useAuthStore((s) => s.user?.id);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyDisputes()
      .then(setDisputes)
      .catch(() => setError('İtirazlar yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

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

  const open = disputes.filter((d) => !d.resolved);
  const resolved = disputes.filter((d) => d.resolved);

  return (
    <div className='flex flex-col gap-6 font-sextary'>
      <div className='bg-darker-blue rounded-2xl p-6 flex items-center gap-4 drop-shadow-[0_0_15px_rgba(0,0,0,0.3)] fade-in-up'>
        <div className='bg-white/10 rounded-xl p-3'>
          <Scale size={28} className='text-white' />
        </div>
        <div className='flex-1'>
          <h2 className='text-white font-bold text-xl'>İtirazlarım</h2>
          <p className='text-white/70 text-sm'>Açtığınız veya tarafı olduğunuz itirazları buradan takip edebilirsiniz.</p>
        </div>
        <div className='flex gap-3'>
          <div className='bg-white/10 rounded-xl px-4 py-2 text-center'>
            <span className='text-white/70 text-xs block'>Açık</span>
            <span className='text-white font-bold text-2xl'>{open.length}</span>
          </div>
          <div className='bg-white/10 rounded-xl px-4 py-2 text-center'>
            <span className='text-white/70 text-xs block'>Çözüldü</span>
            <span className='text-white font-bold text-2xl'>{resolved.length}</span>
          </div>
        </div>
      </div>

      {disputes.length === 0 ? (
        <div className='bg-white rounded-xl py-16 text-center drop-shadow-[0_0_8px_rgba(0,0,0,0.1)] fade-in-up-delay-1'>
          <Scale size={40} className='text-gray-300 mx-auto mb-3' />
          <p className='text-gray-500 text-sm'>Henüz bir itirazınız bulunmuyor.</p>
        </div>
      ) : (
        <div className='bg-white rounded-xl overflow-hidden drop-shadow-[0_0_8px_rgba(0,0,0,0.1)] fade-in-up-delay-1'>
          <div className='bg-darker-blue px-5 py-3'>
            <span className='text-white font-bold text-sm tracking-wide uppercase'>Tüm İtirazlar</span>
          </div>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-gray-100'>
                <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Talep</th>
                <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Sebep</th>
                <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Açan</th>
                <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Tarih</th>
                <th className='text-left px-5 py-3 text-gray-500 font-semibold'>Durum</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id} className='border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors'>
                  <td className='px-5 py-3'>
                    <Link to={`/talep/${d.request_id}`} className='text-secondary-blue font-mono text-xs font-semibold hover:underline'>
                      {d.request_id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className='px-5 py-3 text-gray-800 max-w-xs truncate' title={d.reason}>{d.reason}</td>
                  <td className='px-5 py-3'>
                    <span className='inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700'>
                      <UserIcon size={12} />
                      {d.raised_by === userId ? 'Siz' : 'Karşı taraf'}
                    </span>
                  </td>
                  <td className='px-5 py-3 text-gray-500'>{formatDate(d.created_at)}</td>
                  <td className='px-5 py-3'>
                    {d.resolved ? (
                      <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-300'>
                        <CheckCircle2 size={12} /> Çözüldü
                      </span>
                    ) : (
                      <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-300'>
                        <Clock size={12} /> Açık
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className='bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 fade-in-up-delay-2'>
        <AlertTriangle size={18} className='text-amber-600 flex-shrink-0 mt-0.5' />
        <p className='text-amber-800 text-xs leading-relaxed'>
          İtirazlar, ekibimizce incelendikten sonra çözümlenir. Açık itirazlarda teslimat ücreti tutulur ve karara göre yeniden değerlendirilir.
        </p>
      </div>
    </div>
  );
}
