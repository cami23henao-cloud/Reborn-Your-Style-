import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { X, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, KeyRound, ExternalLink, ShieldCheck, Settings } from 'lucide-react';

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
  const [countdown, setCountdown] = useState<number>(600); // 10 minutes

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [showGoogleConfigHelper, setShowGoogleConfigHelper] = useState(false);
  const [customClientId, setCustomClientId] = useState(() => {
    return localStorage.getItem('reborn_custom_google_client_id') || '';
  });

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Active Client ID resolution
  const activeClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || customClientId || '';
  const hasValidClientId = Boolean(
    activeClientId &&
    activeClientId.includes('.apps.googleusercontent.com') &&
    !activeClientId.includes('demo-')
  );

  // Countdown timer for 6-digit code
  useEffect(() => {
    let timer: any;
    if (step === 'verify' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Google Identity Services (GSI) initialization
  useEffect(() => {
    if (!isOpen || step !== 'form') return;

    if (hasValidClientId && (window as any).google?.accounts?.id && googleBtnRef.current) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: activeClientId.trim(),
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render official Google button
        (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          locale: 'es',
          width: 320,
        });
      } catch (err) {
        console.error('Error al inicializar Google Identity Services:', err);
      }
    }
  }, [isOpen, step, mode, activeClientId, hasValidClientId]);

  // Handle Google Credential Response
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) {
      setErrorMessage('No se recibió la credencial de autenticación de Google.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      // Send token to backend for cryptographic verification
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        if (data.token) {
          localStorage.setItem('reborn_session_token', data.token);
        }
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMessage(data.error || 'Error al validar la cuenta con Google.');
      }
    } catch (err: any) {
      setErrorMessage('Error de conexión al validar con el servidor de Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomClientId = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = customClientId.trim();
    if (!cleanId || !cleanId.includes('.apps.googleusercontent.com')) {
      setErrorMessage('El Client ID debe terminar en .apps.googleusercontent.com');
      return;
    }

    localStorage.setItem('reborn_custom_google_client_id', cleanId);
    setShowGoogleConfigHelper(false);
    setInfoMessage('Client ID guardado correctamente. Inicializando Google Sign-In...');
    setErrorMessage('');
  };

  // Send real verification code
  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Por favor ingresa una dirección de correo electrónico válida (ej. nombre@dominio.com).');
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
        body: JSON.stringify({
          email: cleanEmail,
          name: name.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep('verify');
        setCountdown(600);
        setInfoMessage(`Código de verificación enviado a ${cleanEmail}. Revisa tu bandeja de entrada.`);
      } else {
        setErrorMessage(data.error || 'No se pudo enviar el código de verificación.');
      }
    } catch (err: any) {
      setErrorMessage('Error de conexión al servidor de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  // Verify 6-digit code
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
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: verificationCode.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        if (data.token) {
          localStorage.setItem('reborn_session_token', data.token);
        }
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

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-7hcy3n5dieqvkwh4ajbnde-612995330455.us-east1.run.app';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#fef8f3] w-full max-w-md rounded-3xl shadow-2xl border border-[#e6e2dd] overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#e6e2dd] flex items-center justify-between bg-[#f8f3ee]">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#486548] block">
              Acceso Seguro
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
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
                {errorMessage.includes('Client ID') || errorMessage.includes('Google') ? (
                  <button
                    onClick={() => setShowGoogleConfigHelper(true)}
                    className="block mt-1 font-semibold text-[#032517] underline hover:text-[#486548]"
                  >
                    Ver guía de configuración de Google Cloud
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 bg-[#caecc6]/40 border border-[#aecfab] rounded-xl text-xs text-[#032517] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#032517]" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Google Configuration Helper Drawer/Dialog */}
          {showGoogleConfigHelper && (
            <div className="p-4 bg-[#f8f3ee] border border-[#e6e2dd] rounded-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between font-bold text-[#032517]">
                <span className="flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-[#486548]" />
                  Configuración de Google OAuth Real
                </span>
                <button
                  onClick={() => setShowGoogleConfigHelper(false)}
                  className="text-[#727973] hover:text-[#032517]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[#424843] leading-relaxed">
                Para evitar el mensaje <strong>"Acceso bloqueado"</strong>, Google requiere registrar este dominio exacto en Google Cloud Console:
              </p>

              <div className="p-2.5 bg-white border border-[#e6e2dd] rounded-xl space-y-1 font-mono text-[11px] text-[#032517]">
                <div className="text-[10px] text-[#727973] uppercase font-sans font-bold">
                  Origen de JavaScript Autorizado:
                </div>
                <div className="select-all break-all">{currentOrigin}</div>
              </div>

              <form onSubmit={handleSaveCustomClientId} className="space-y-2 pt-1">
                <label className="block text-[11px] font-semibold text-[#032517]">
                  Pega aquí tu OAuth 2.0 Client ID:
                </label>
                <input
                  type="text"
                  placeholder="ejemplo-12345.apps.googleusercontent.com"
                  value={customClientId}
                  onChange={(e) => setCustomClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517]"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-semibold text-white bg-[#032517] hover:bg-[#1b3b2b] rounded-xl transition-all"
                  >
                    Guardar y Activar Google Sign-In
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'form' ? (
            <>
              {/* Official Google Sign-In */}
              <div className="flex flex-col items-center justify-center space-y-2 pt-1">
                {hasValidClientId ? (
                  <div
                    ref={googleBtnRef}
                    id="google-auth-button-container"
                    className="w-full flex justify-center min-h-[44px]"
                  />
                ) : (
                  <button
                    type="button"
                    id="btn-google-signin-custom"
                    onClick={() => setShowGoogleConfigHelper(true)}
                    className="w-full flex items-center justify-center gap-3 px-5 py-3 border border-[#dadce0] rounded-full bg-white hover:bg-[#f8f9fa] transition-all text-xs font-semibold text-[#3c4043] shadow-sm hover:shadow active:scale-98"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continuar con Google</span>
                  </button>
                )}

                <p className="text-[11px] text-[#727973] text-center">
                  Autenticación oficial y segura con Google
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
                        placeholder="Tu nombre completo"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1">
                    Correo electrónico real *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#727973] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@tudominio.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] focus:bg-white"
                    />
                  </div>
                  <span className="text-[10px] text-[#727973] mt-1 block">
                    Te enviaremos un código numérico real de 6 dígitos a esta dirección.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1">
                    Contraseña privada *
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
                      ? 'Enviando código...'
                      : mode === 'register'
                      ? 'Solicitar código de verificación'
                      : 'Continuar con verificación'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            /* Step 2: Verification Code Entry (NEVER displays the code) */
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-[#caecc6]/60 text-[#032517] flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <p className="text-xs text-[#424843]">
                  Hemos enviado un código de 6 dígitos a tu correo:
                </p>
                <p className="text-xs font-bold text-[#032517]">{email}</p>
                <p className="text-[11px] text-[#727973]">
                  Tiempo restante: <span className="font-semibold text-[#032517]">{formatTime(countdown)}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-center text-[#032517] mb-2">
                  Ingresa el código recibido en tu correo *
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
                <p className="text-[10px] text-center text-[#727973] mt-2">
                  Revisa también tu carpeta de spam o no deseados.
                </p>
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
                      setErrorMessage('');
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
