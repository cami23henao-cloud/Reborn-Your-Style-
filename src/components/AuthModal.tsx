import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { X, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Sparkles, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'form' | 'verify'>('form');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Verification code
  const [verificationCode, setVerificationCode] = useState('');
  const [serverDevCode, setServerDevCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(600); // 10 minutes

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Countdown timer
  useEffect(() => {
    let timer: any;
    if (step === 'verify' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Google Identity Services integration
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if ((window as any).google?.accounts?.id && googleBtnRef.current) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId || 'demo-ai-studio-client-id.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
        });
        (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
          locale: 'es',
        });
      } catch (e) {
        console.log('Google Identity initialized in fallback mode');
      }
    }
  }, [isOpen, mode]);

  const handleGoogleCredentialResponse = async (response: any) => {
    try {
      setLoading(true);
      // Decode JWT token payload
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const profile = JSON.parse(jsonPayload);

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          sub: profile.sub,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMessage(data.error || 'Error al validar con Google.');
      }
    } catch (err: any) {
      setErrorMessage('No se pudo completar el inicio con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setErrorMessage('Por favor ingresa tu nombre completo.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep('verify');
        setCountdown(600);
        if (data.devCode) {
          setServerDevCode(data.devCode);
          setInfoMessage('Código generado por el servidor de autenticación.');
        } else {
          setInfoMessage(`Código enviado a ${email}. Revisa tu bandeja de entrada.`);
        }
      } else {
        setErrorMessage(data.error || 'No se pudo enviar el código de verificación.');
      }
    } catch (err: any) {
      setErrorMessage('Error de conexión al servidor de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!verificationCode || verificationCode.trim().length !== 6) {
      setErrorMessage('El código debe contener exactamente 6 dígitos numéricos.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMessage(data.error || 'Código incorrecto o expirado.');
      }
    } catch (err: any) {
      setErrorMessage('Error al validar código con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#fef8f3] w-full max-w-md rounded-3xl shadow-2xl border border-[#e6e2dd] overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#e6e2dd] flex items-center justify-between bg-[#f8f3ee]">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#486548] block">
              Comunidad Reborn
            </span>
            <h2 className="text-xl font-normal font-['Bodoni_Moda',serif] text-[#032517]">
              {step === 'verify'
                ? 'Verificación de Correo'
                : mode === 'login'
                ? 'Iniciar sesión'
                : 'Crear cuenta circular'}
            </h2>
          </div>
          <button
            id="btn-close-auth-modal"
            onClick={onClose}
            className="p-2 rounded-full text-[#424843] hover:text-[#032517] hover:bg-[#e6e2dd] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch if on form step */}
        {step === 'form' && (
          <div className="flex border-b border-[#e6e2dd] bg-[#f8f3ee]/50 text-xs font-semibold">
            <button
              id="auth-tab-login"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 text-center transition-all ${
                mode === 'login'
                  ? 'text-[#032517] border-b-2 border-[#032517] bg-[#fef8f3]'
                  : 'text-[#727973] hover:text-[#032517]'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              id="auth-tab-register"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 text-center transition-all ${
                mode === 'register'
                  ? 'text-[#032517] border-b-2 border-[#032517] bg-[#fef8f3]'
                  : 'text-[#727973] hover:text-[#032517]'
              }`}
            >
              Registrarse
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 bg-[#caecc6]/40 border border-[#aecfab] rounded-xl text-xs text-[#032517] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#032517]" />
              <span>{infoMessage}</span>
            </div>
          )}

          {step === 'form' ? (
            <>
              {/* Google Sign-in button */}
              <div className="flex flex-col items-center justify-center space-y-2 pt-1">
                <div ref={googleBtnRef} id="google-auth-button-container" className="w-full flex justify-center" />
                <p className="text-[11px] text-[#727973] text-center">
                  Acceso directo con tu cuenta de Google
                </p>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#e6e2dd]"></div>
                <span className="flex-shrink mx-4 text-[11px] font-medium text-[#727973] uppercase">
                  o con correo verificado
                </span>
                <div className="flex-grow border-t border-[#e6e2dd]"></div>
              </div>

              <form onSubmit={handleSendVerificationCode} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#032517] mb-1">
                      Nombre completo *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-[#727973] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Carmen Velásquez"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1">
                    Correo electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#727973] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#727973] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  id="btn-auth-submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 text-xs font-semibold text-white bg-[#032517] hover:bg-[#1b3b2b] rounded-full transition-all shadow active:scale-98 disabled:opacity-50"
                >
                  <span>
                    {loading
                      ? 'Procesando...'
                      : mode === 'register'
                      ? 'Solicitar código de verificación'
                      : 'Continuar con verificación'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            /* Step 2: Verification Code Entry */
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-[#caecc6]/60 text-[#032517] flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <p className="text-xs text-[#424843]">
                  Hemos generado un código de 6 dígitos para:
                </p>
                <p className="text-xs font-bold text-[#032517]">{email}</p>
                <p className="text-[11px] text-[#727973]">
                  Tiempo restante: <span className="font-semibold text-[#032517]">{formatTime(countdown)}</span>
                </p>
              </div>

              {/* Developer testing banner if SMTP credentials not configured */}
              {serverDevCode && (
                <div className="p-3 bg-[#f2ede8] border border-[#e6e2dd] rounded-xl text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#486548] tracking-wider block">
                    Código generado por el servidor
                  </span>
                  <span className="text-xl font-bold tracking-widest text-[#032517]">
                    {serverDevCode}
                  </span>
                  <p className="text-[10px] text-[#727973]">
                    Ingresa estos 6 dígitos para verificar el acceso real.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-center text-[#032517] mb-2">
                  Ingresa el código de 6 dígitos *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  className="w-full text-center tracking-[12px] text-2xl font-bold py-3 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-[#032517] focus:outline-none focus:ring-2 focus:ring-[#032517] focus:bg-white"
                />
              </div>

              <div className="space-y-2.5">
                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  id="btn-confirm-code"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 text-xs font-semibold text-white bg-[#032517] hover:bg-[#1b3b2b] rounded-full transition-all shadow active:scale-98 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Verificando...' : 'Verificar y Acceder'}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('form');
                      setVerificationCode('');
                    }}
                    className="text-[#424843] hover:underline"
                  >
                    Cambiar correo
                  </button>

                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    className="text-[#032517] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reenviar código</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
