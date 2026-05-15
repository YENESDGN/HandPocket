import { useState, useEffect } from 'react';
import { Lock, Mail, Smartphone, Monitor, Tablet, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

interface SessionInfo {
  browser: string;
  os: string;
  icon: 'monitor' | 'mobile' | 'tablet';
  lastSignIn: string;
}

function detectDevice(ua: string): Pick<SessionInfo, 'browser' | 'os' | 'icon'> {
  const isMobile = /Mobile|Android|iPhone/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);

  let browser = 'Tarayıcı';
  if (/Edg/i.test(ua))                                  browser = 'Edge';
  else if (/OPR|Opera/i.test(ua))                       browser = 'Opera';
  else if (/Chrome/i.test(ua))                          browser = 'Chrome';
  else if (/Firefox/i.test(ua))                         browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua))  browser = 'Safari';

  let os = 'Bilinmeyen OS';
  if (/Windows/i.test(ua))         os = 'Windows';
  else if (/Android/i.test(ua))    os = 'Android';
  else if (/iPhone|iPad/i.test(ua))os = 'iOS';
  else if (/Mac OS/i.test(ua))     os = 'macOS';
  else if (/Linux/i.test(ua))      os = 'Linux';

  return { browser, os, icon: isTablet ? 'tablet' : isMobile ? 'mobile' : 'monitor' };
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' • ' +
    d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  );
}

const DeviceIcon = ({ type }: { type: SessionInfo['icon'] }) => {
  if (type === 'monitor') return <Monitor size={16} className="text-white" />;
  if (type === 'mobile')  return <Smartphone size={16} className="text-white" />;
  return <Tablet size={16} className="text-white" />;
};

function StatusBanner({ status, successMsg, errorMsg }: { status: FormStatus; successMsg: string; errorMsg: string }) {
  if (status === 'success') return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
      <CheckCircle2 size={15} className="text-green-600 flex-shrink-0" />
      <span className="text-green-700 text-sm font-sextary">{successMsg}</span>
    </div>
  );
  if (status === 'error') return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      <XCircle size={15} className="text-red-500 flex-shrink-0" />
      <span className="text-red-600 text-sm font-sextary">{errorMsg}</span>
    </div>
  );
  return null;
}

export default function SecurityPanel() {
  const user = useAuthStore((s) => s.user);
  const [twoFA, setTwoFA] = useState(false);

  // Password form
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [pwStatus,   setPwStatus]   = useState<FormStatus>('idle');
  const [pwError,    setPwError]    = useState('');

  // Email form
  const [newEmail,     setNewEmail]     = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailStatus,  setEmailStatus]  = useState<FormStatus>('idle');
  const [emailError,   setEmailError]   = useState('');

  // Sessions
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [terminatingOthers, setTerminatingOthers] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) return;
      const { browser, os, icon } = detectDevice(navigator.userAgent);
      setSession({
        browser,
        os,
        icon,
        lastSignIn: u.last_sign_in_at ?? new Date().toISOString(),
      });
    });
  }, []);

  const handlePasswordUpdate = async () => {
    if (newPw !== confirmPw) { setPwError('Yeni parolalar eşleşmiyor.'); setPwStatus('error'); return; }
    if (newPw.length < 6)    { setPwError('Parola en az 6 karakter olmalı.'); setPwStatus('error'); return; }
    setPwStatus('loading'); setPwError('');
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user?.email ?? '', password: currentPw,
      });
      if (signInErr) throw new Error('Mevcut parola hatalı.');
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPw });
      if (updateErr) throw new Error(updateErr.message);
      setPwStatus('success');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => setPwStatus('idle'), 3000);
    } catch (e) {
      setPwError(e instanceof Error ? e.message : 'Hata oluştu.');
      setPwStatus('error');
    }
  };

  const handleEmailUpdate = async () => {
    if (!newEmail.includes('@'))         { setEmailError('Geçerli bir e-posta girin.'); setEmailStatus('error'); return; }
    if (newEmail !== confirmEmail)       { setEmailError('E-postalar eşleşmiyor.'); setEmailStatus('error'); return; }
    if (newEmail === user?.email)        { setEmailError('Yeni e-posta mevcut ile aynı.'); setEmailStatus('error'); return; }
    setEmailStatus('loading'); setEmailError('');
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw new Error(error.message);
      setEmailStatus('success');
      setNewEmail(''); setConfirmEmail('');
      setTimeout(() => setEmailStatus('idle'), 5000);
    } catch (e) {
      setEmailError(e instanceof Error ? e.message : 'Hata oluştu.');
      setEmailStatus('error');
    }
  };

  const handleTerminateOthers = async () => {
    setTerminatingOthers(true);
    await supabase.auth.signOut({ scope: 'others' });
    setTerminatingOthers(false);
  };

  const inputCls = 'bg-secondary-blue rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary-blue shadow-sm font-sextary';
  const btnCls   = 'w-full bg-secondary-blue text-white font-bold py-3 text-sm rounded-xl hover:opacity-90 transition-opacity tracking-widest uppercase font-sextary shadow-sm disabled:opacity-60 flex items-center justify-center gap-2';
  const labelCls = 'text-darker-blue text-xs font-semibold uppercase tracking-wider font-sextary';

  return (
    <div className="flex gap-6 items-start font-sextary">

      {/* Left column */}
      <div className="flex flex-col gap-6 flex-[3] security-left">

        {/* Parola Güncelle */}
        <div className="rounded-2xl overflow-hidden shadow-md">
          <div className="bg-secondary-blue px-8 py-5 flex items-center gap-3">
            <Lock size={18} className="text-white/80" />
            <span className="text-white font-bold text-xl tracking-wide font-sextary">Parola Güncelle</span>
          </div>
          <div className="bg-white px-8 py-7 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-x-8">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Mevcut Parola</label>
                <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Yeni Parola</label>
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Yeni Parola Tekrar</label>
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className={inputCls} />
            </div>
            <StatusBanner status={pwStatus} successMsg="Parola başarıyla güncellendi." errorMsg={pwError} />
            <button onClick={handlePasswordUpdate} disabled={pwStatus === 'loading'} className={btnCls}>
              {pwStatus === 'loading' && <Loader2 size={15} className="animate-spin" />}
              Parolayı Güncelle
            </button>
          </div>
        </div>

        {/* Mail Güncelle */}
        <div className="rounded-2xl overflow-hidden shadow-md">
          <div className="bg-secondary-blue px-8 py-5 flex items-center gap-3">
            <Mail size={18} className="text-white" />
            <span className="text-white font-bold text-xl tracking-wide font-sextary">Mail Güncelle</span>
          </div>
          <div className="bg-white px-8 py-7 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-x-8">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Mevcut Mail</label>
                <input type="email" value={user?.email ?? ''} readOnly className={`${inputCls} opacity-60 cursor-not-allowed`} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Yeni Mail</label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Yeni Mail Tekrar</label>
              <input type="email" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} className={inputCls} />
            </div>
            <StatusBanner
              status={emailStatus}
              successMsg="Doğrulama e-postası gönderildi. Yeni adresinizi onaylayın."
              errorMsg={emailError}
            />
            <button onClick={handleEmailUpdate} disabled={emailStatus === 'loading'} className={btnCls}>
              {emailStatus === 'loading' && <Loader2 size={15} className="animate-spin" />}
              Maili Güncelle
            </button>
          </div>
        </div>

        {/* İki Adımlı Doğrulama */}
        <div className="rounded-2xl overflow-hidden shadow-md">
          <div className="bg-secondary-blue px-8 py-5 border-b border-primary-blue/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-darker-blue flex items-center justify-center">
                <Smartphone size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-wide font-sextary">İki Adımlı Doğrulama</span>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full font-sextary ${twoFA ? 'bg-primary-blue text-white' : 'bg-red-100 text-red-600'}`}>
              {twoFA ? 'AKTİF' : 'PASİF'}
            </span>
          </div>
          <div className="bg-white px-8 py-7 flex flex-col gap-5">
            <div className="flex items-start gap-3 bg-primary-blue/10 border border-primary-blue/20 rounded-xl px-4 py-4">
              <AlertCircle size={15} className="text-dark-blue mt-0.5 flex-shrink-0" />
              <p className="text-dark-blue text-sm leading-relaxed font-sextary">
                Giriş işlemlerinize ek bir güvenlik katmanı ekleyin. Her oturum açmada cihazınızdan benzersiz bir doğrulama kodu istenecektir.
              </p>
            </div>
            <button onClick={() => setTwoFA(!twoFA)} className={btnCls}>
              {twoFA ? 'Doğrulamayı Devre Dışı Bırak' : 'İki Adımlı Doğrulamayı Başlat'}
            </button>
          </div>
        </div>

      </div>

      {/* Right column — Aktif Oturumlar */}
      <div className="flex-[2] rounded-lg overflow-hidden shadow-md self-start security-right">
        <div className="bg-secondary-blue px-6 py-5 border-b border-primary-blue/20">
          <span className="text-white font-bold text-xl tracking-wide font-sextary">Aktif Oturumlar</span>
          <p className="text-white/80 text-xs mt-1 font-sextary">Hesabınızdaki oturum geçmişi.</p>
        </div>
        <div className="bg-white px-6 flex flex-col divide-y divide-primary-blue/10">
          {session ? (
            <div className="flex items-center gap-4 py-4">
              <div className="w-9 h-9 rounded-xl bg-darker-blue flex items-center justify-center flex-shrink-0">
                <DeviceIcon type={session.icon} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-darker-blue text-sm font-semibold font-sextary truncate">
                    {session.browser} • {session.os}
                  </span>
                  <span className="bg-primary-blue text-white text-xs font-bold px-2 py-0.5 rounded-full font-sextary flex-shrink-0">
                    AKTİF
                  </span>
                </div>
                <span className="text-dark-blue text-xs font-sextary block">Bu cihaz</span>
                <span className="text-dark-blue/60 text-xs font-sextary block">
                  Son giriş: {fmtDate(session.lastSignIn)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="text-primary-blue animate-spin" />
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-primary-blue/20 bg-white">
          <button
            onClick={handleTerminateOthers}
            disabled={terminatingOthers}
            className="w-full text-primary-blue text-xs font-bold uppercase tracking-wider hover:text-darker-blue transition-colors font-sextary py-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {terminatingOthers && <Loader2 size={12} className="animate-spin" />}
            Diğer Tüm Oturumları Sonlandır
          </button>
        </div>
      </div>

    </div>
  );
}
