import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, KeyRound, ExternalLink, ShieldCheck, Settings, Eye, EyeOff, Sparkles, Scissors, Leaf, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  // Modes: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  // Steps: 'form' | 'verify'
  const [step, setStep] = useState<'form' | 'verify'>('form');

  // Login & Registration Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Recovery & Verification Fields
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState<number>(600); // 10 min

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Active Google OAuth Client ID from environment
  const activeClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  const hasValidClientId = Boolean(
    activeClientId &&
    activeClientId.includes('.apps.googleusercontent.com')
  );

  // Countdown timer
  useEffect(() => {
    let timer: any;
    if (step === 'verify' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Google Identity Services (GSI) initialization
  useEffect(() => {
    if (step !== 'form' || mode === 'forgot') return;

    if (hasValidClientId && (window as any).google?.accounts?.id && googleBtnRef.current) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: activeClientId,
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
  }, [step, mode, activeClientId, hasValidClientId]);

  // Handle Google Credential Response (ID Token JWT)
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
      } else {
        setErrorMessage(data.error || 'Error al validar la cuenta con Google.');
      }
    } catch (err: any) {
      setErrorMessage('Error de conexión al validar con el servidor de Google.');
    } finally {
      setLoading(false);
    }
  };

  // Direct Google Login Trigger (OAuth2 Popup Flow)
  const handleGoogleLoginClick = () => {
    setErrorMessage('');
    setInfoMessage('');

    if (!activeClientId) {
      setErrorMessage(
        'Para activar "Continuar con Google", configura la variable de entorno VITE_GOOGLE_CLIENT_ID en Settings con tu Client ID de Google Cloud Console.'
      );
      return;
    }

    if (!(window as any).google?.accounts) {
      setErrorMessage('Los servicios de Google Identity se están cargando. Por favor, reintenta en un momento.');
      return;
    }

    try {
      setLoading(true);
      if ((window as any).google.accounts.oauth2) {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: activeClientId,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              setLoading(false);
              if (tokenResponse.error !== 'popup_closed_by_user') {
                setErrorMessage(`Error en autenticación de Google: ${tokenResponse.error_description || tokenResponse.error}`);
              }
              return;
            }

            if (tokenResponse?.access_token) {
              try {
                const res = await fetch('/api/auth/google', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ accessToken: tokenResponse.access_token }),
                });

                const data = await res.json();
                if (res.ok && data.user) {
                  if (data.token) {
                    localStorage.setItem('reborn_session_token', data.token);
                  }
                  onLoginSuccess(data.user);
                } else {
                  setErrorMessage(data.error || 'No se pudo verificar la cuenta con Google.');
                }
              } catch (err) {
                setErrorMessage('Error al conectar con el servidor.');
              } finally {
                setLoading(false);
              }
            }
          },
        });

        tokenClient.requestAccessToken();
      } else if ((window as any).google.accounts.id) {
        (window as any).google.accounts.id.prompt();
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage('Error al abrir la ventana de autenticación de Google.');
    }
  };

  // 1. Iniciar sesión con correo y contraseña
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMessage('El correo o la contraseña no son correctos.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        if (data.token) {
          localStorage.setItem('reborn_session_token', data.token);
        }
        onLoginSuccess(data.user);
      } else {
        setErrorMessage(data.error || 'El correo o la contraseña no son correctos.');
      }
    } catch (err) {
      setErrorMessage('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Registro: Enviar código real de verificación
  const handleRegisterSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Ingresa una dirección de correo válida (ejemplo: usuario@dominio.com).');
      return;
    }

    if (!name.trim()) {
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

  // 3. Registro: Verificar código de 6 dígitos
  const handleVerifyRegisterCode = async (e: React.FormEvent) => {
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
      } else {
        setErrorMessage(data.error || 'Código incorrecto o expirado.');
      }
    } catch (err: any) {
      setErrorMessage('Error al validar código con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Recuperación: Solicitar código de recuperación
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Por favor ingresa un correo electrónico con formato válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStep('verify');
        setCountdown(600);
        setInfoMessage(data.message || `Código enviado a ${cleanEmail}. Revisa tu bandeja de entrada.`);
      } else {
        setErrorMessage(data.error || 'No se pudo enviar el código de recuperación.');
      }
    } catch (err) {
      setErrorMessage('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Recuperación: Verificar código y guardar nueva contraseña
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!verificationCode || verificationCode.trim().length !== 6) {
      setErrorMessage('El código debe contener exactamente 6 dígitos.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: verificationCode.trim(),
          newPassword: password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        if (data.token) {
          localStorage.setItem('reborn_session_token', data.token);
        }
        onLoginSuccess(data.user);
      } else {
        setErrorMessage(data.error || 'El código es incorrecto o ha expirado.');
      }
    } catch (err) {
      setErrorMessage('Error al actualizar contraseña.');
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
    <div className="min-h-screen bg-[#fef8f3] text-[#1d1b19] flex flex-col justify-between selection:bg-[#caecc6] selection:text-[#032517]">
      {/* Top Brand Banner */}
      <header className="w-full border-b border-[#e6e2dd] bg-[#f8f3ee]/80 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#032517] text-[#caecc6] flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-['Bodoni_Moda',serif] text-xl font-medium tracking-tight text-[#032517] block">
                Reborn Your Style
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#486548] font-bold block">
                Moda Circular & Transformación Textil
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#486548] font-semibold bg-[#caecc6]/40 px-3 py-1.5 rounded-full border border-[#aecfab]">
            <ShieldCheck className="w-4 h-4 text-[#032517]" />
            <span>Acceso Privado & Cuentas Independientes</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#e6e2dd] overflow-hidden transition-all duration-300">
          {/* Card Top Title */}
          <div className="p-6 pb-4 border-b border-[#e6e2dd] bg-[#f8f3ee] text-center relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#caecc6]/50 text-[#032517] text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plataforma Protegida</span>
            </div>

            <h1 className="text-2xl font-normal font-['Bodoni_Moda',serif] text-[#032517]">
              {mode === 'forgot'
                ? step === 'verify'
                  ? 'Nueva Contraseña'
                  : 'Recuperar Contraseña'
                : step === 'verify'
                ? 'Verificación de Correo'
                : mode === 'login'
                ? 'Iniciar sesión'
                : 'Crear una cuenta'}
            </h1>
            <p className="text-xs text-[#727973] mt-1 font-light">
              {mode === 'forgot'
                ? 'Sigue las instrucciones para restablecer tu acceso seguro'
                : step === 'verify'
                ? 'Ingresa los 6 dígitos enviados a tu correo'
                : mode === 'login'
                ? 'Inicia sesión para acceder a Reborn Your Style'
                : 'Únete a la red de transformación textil y upcycling'}
            </p>
          </div>

          {/* Mode Switcher Tabs (Only if not in forgot mode and not in verify step) */}
          {mode !== 'forgot' && step === 'form' && (
            <div className="flex border-b border-[#e6e2dd] bg-[#f8f3ee]/40 text-xs font-semibold">
              <button
                id="tab-login-btn"
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                  setInfoMessage('');
                }}
                className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                  mode === 'login'
                    ? 'border-[#032517] text-[#032517] bg-white'
                    : 'border-transparent text-[#727973] hover:text-[#032517]'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                id="tab-register-btn"
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                  setInfoMessage('');
                }}
                className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                  mode === 'register'
                    ? 'border-[#032517] text-[#032517] bg-white'
                    : 'border-transparent text-[#727973] hover:text-[#032517]'
                }`}
              >
                Crear una cuenta
              </button>
            </div>
          )}

          {/* Card Body */}
          <div className="p-6 space-y-5">
            {/* Error Message Alert */}
            {errorMessage && (
              <div
                id="auth-error-alert"
                className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Info Message Alert */}
            {infoMessage && (
              <div
                id="auth-info-alert"
                className="p-3.5 bg-[#caecc6]/30 border border-[#aecfab] text-[#032517] rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4 text-[#486548] shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed font-medium">{infoMessage}</div>
              </div>
            )}

            {/* -------------------- 1. GOOGLE SIGN-IN SECTION -------------------- */}
            {mode !== 'forgot' && step === 'form' && (
              <div className="space-y-3">
                <div className="flex flex-col items-center justify-center">
                  {/* Container for Official Google GSI Button or direct action */}
                  {hasValidClientId ? (
                    <div
                      ref={googleBtnRef}
                      id="google-official-btn-container"
                      className="w-full flex justify-center min-h-[44px]"
                    />
                  ) : (
                    <button
                      id="btn-google-login-action"
                      type="button"
                      disabled={loading}
                      onClick={handleGoogleLoginClick}
                      className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-full border border-[#e6e2dd] bg-white hover:bg-[#f8f3ee] text-[#1d1b19] text-xs font-semibold transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50"
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
                </div>

                {/* Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[#e6e2dd]"></div>
                  <span className="flex-shrink mx-4 text-[11px] font-semibold text-[#727973] uppercase tracking-wider">
                    o con correo electrónico
                  </span>
                  <div className="flex-grow border-t border-[#e6e2dd]"></div>
                </div>
              </div>
            )}

            {/* -------------------- 2. FORM STEP: LOGIN -------------------- */}
            {mode === 'login' && step === 'form' && (
              <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1.5">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#727973] absolute left-3.5 top-3" />
                    <input
                      id="input-login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tunombre@correo.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#fef8f3] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:border-[#032517] focus:ring-1 focus:ring-[#032517] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#032517]">
                      Contraseña
                    </label>
                    <button
                      id="btn-forgot-password-link"
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setStep('form');
                        setErrorMessage('');
                        setInfoMessage('');
                      }}
                      className="text-xs text-[#486548] hover:text-[#032517] font-semibold transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#727973] absolute left-3.5 top-3" />
                    <input
                      id="input-login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#fef8f3] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:border-[#032517] focus:ring-1 focus:ring-[#032517] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-[#727973] hover:text-[#032517]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#032517] text-white rounded-full text-xs font-semibold hover:bg-[#1b3b2b] transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verificando credenciales...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar sesión</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* -------------------- 3. FORM STEP: REGISTER -------------------- */}
            {mode === 'register' && step === 'form' && (
              <form onSubmit={handleRegisterSendCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1.5">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#727973] absolute left-3.5 top-3" />
                    <input
                      id="input-register-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Camila Henao"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#fef8f3] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:border-[#032517] focus:ring-1 focus:ring-[#032517] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1.5">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#727973] absolute left-3.5 top-3" />
                    <input
                      id="input-register-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tunombre@correo.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#fef8f3] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:border-[#032517] focus:ring-1 focus:ring-[#032517] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1.5">
                    Crear contraseña segura
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#727973] absolute left-3.5 top-3" />
                    <input
                      id="input-register-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#fef8f3] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:border-[#032517] focus:ring-1 focus:ring-[#032517] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-[#727973] hover:text-[#032517]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-submit-register"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#032517] text-white rounded-full text-xs font-semibold hover:bg-[#1b3b2b] transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generando código de verificación...</span>
                    </>
                  ) : (
                    <>
                      <span>Continuar y verificar correo</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* -------------------- 4. VERIFY STEP: REGISTER (6 DÍGITOS) -------------------- */}
            {mode === 'register' && step === 'verify' && (
              <form onSubmit={handleVerifyRegisterCode} className="space-y-4">
                <div className="text-center p-3 bg-[#f8f3ee] rounded-2xl border border-[#e6e2dd]">
                  <p className="text-xs text-[#424843]">
                    Hemos enviado un código confidencial de 6 dígitos a:
                  </p>
                  <p className="font-semibold text-xs text-[#032517] mt-0.5">{email}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1.5 text-center">
                    Ingresa el código numérico de 6 dígitos
                  </label>
                  <input
                    id="input-verify-register-code"
                    type="text"
                    maxLength={6}
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center tracking-[8px] font-mono text-2xl font-bold py-3 bg-[#fef8f3] border-2 border-[#032517] rounded-xl text-[#032517] focus:outline-none focus:ring-2 focus:ring-[#032517]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#727973]">
                  <span>Expira en: <strong className="text-[#032517]">{formatTime(countdown)}</strong></span>
                  <button
                    type="button"
                    onClick={handleRegisterSendCode}
                    disabled={loading || countdown > 540}
                    className="text-[#486548] hover:text-[#032517] font-semibold underline disabled:opacity-50"
                  >
                    Reenviar código
                  </button>
                </div>

                <button
                  id="btn-confirm-register-verify"
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full py-3 px-4 bg-[#032517] text-white rounded-full text-xs font-semibold hover:bg-[#1b3b2b] transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validando código...</span>
                    </>
                  ) : (
                    <>
                      <span>Activar cuenta y entrar</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setErrorMessage('');
                  }}
                  className="w-full text-center text-xs text-[#727973] hover:text-[#032517]"
                >
                  ← Cambiar correo o datos
                </button>
              </form>
            )}

            {/* -------------------- 5. FORGOT PASSWORD: STEP FORM -------------------- */}
            {mode === 'forgot' && step === 'form' && (
              <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1.5">
                    Correo electrónico de tu cuenta
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#727973] absolute left-3.5 top-3" />
                    <input
                      id="input-forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tunombre@correo.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#fef8f3] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:border-[#032517] focus:ring-1 focus:ring-[#032517] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-[#727973] mt-1.5">
                    Te enviaremos un código de seguridad de 6 dígitos para validar tu identidad.
                  </p>
                </div>

                <button
                  id="btn-submit-forgot-request"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#032517] text-white rounded-full text-xs font-semibold hover:bg-[#1b3b2b] transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generando código de recuperación...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar código de recuperación</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setStep('form');
                    setErrorMessage('');
                    setInfoMessage('');
                  }}
                  className="w-full text-center text-xs text-[#486548] font-semibold hover:text-[#032517] flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a iniciar sesión</span>
                </button>
              </form>
            )}

            {/* -------------------- 6. FORGOT PASSWORD: STEP VERIFY & RESET -------------------- */}
            {mode === 'forgot' && step === 'verify' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="text-center p-3 bg-[#f8f3ee] rounded-2xl border border-[#e6e2dd]">
                  <p className="text-xs text-[#424843]">
                    Código enviado al correo:
                  </p>
                  <p className="font-semibold text-xs text-[#032517] mt-0.5">{email}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1.5 text-center">
                    Código de 6 dígitos
                  </label>
                  <input
                    id="input-verify-reset-code"
                    type="text"
                    maxLength={6}
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center tracking-[8px] font-mono text-2xl font-bold py-3 bg-[#fef8f3] border-2 border-[#032517] rounded-xl text-[#032517] focus:outline-none focus:ring-2 focus:ring-[#032517]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1.5">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#727973] absolute left-3.5 top-3" />
                    <input
                      id="input-reset-new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#fef8f3] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:border-[#032517] focus:ring-1 focus:ring-[#032517] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-[#727973] hover:text-[#032517]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1.5">
                    Confirmar nueva contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#727973] absolute left-3.5 top-3" />
                    <input
                      id="input-reset-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#fef8f3] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:border-[#032517] focus:ring-1 focus:ring-[#032517] transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#727973]">
                  <span>Expira en: <strong className="text-[#032517]">{formatTime(countdown)}</strong></span>
                  <button
                    type="button"
                    onClick={handleRequestPasswordReset}
                    disabled={loading || countdown > 540}
                    className="text-[#486548] hover:text-[#032517] font-semibold underline disabled:opacity-50"
                  >
                    Reenviar código
                  </button>
                </div>

                <button
                  id="btn-submit-reset-password"
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full py-3 px-4 bg-[#032517] text-white rounded-full text-xs font-semibold hover:bg-[#1b3b2b] transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Actualizando contraseña...</span>
                    </>
                  ) : (
                    <>
                      <span>Guardar contraseña y entrar</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setErrorMessage('');
                  }}
                  className="w-full text-center text-xs text-[#727973] hover:text-[#032517]"
                >
                  ← Cambiar correo
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer Pillar Badges */}
      <footer className="w-full border-t border-[#e6e2dd] bg-[#f8f3ee] py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 text-center text-xs text-[#727973]">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[#486548]" />
            <span>Rediseño con modistas de proximidad</span>
          </div>
          <div className="hidden sm:block text-[#e6e2dd]">•</div>
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#486548]" />
            <span>Cero residuos y moda regenerativa</span>
          </div>
          <div className="hidden sm:block text-[#e6e2dd]">•</div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#486548]" />
            <span>Sesiones 100% privadas y seguras</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
