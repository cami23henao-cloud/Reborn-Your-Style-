import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { X, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, KeyRound, ExternalLink, ShieldCheck, Settings, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { loginWithGoogleFirebase } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [step, setStep] = useState<'form' | 'verify'>('form');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'normal' | 'confeccionista'>('normal');

  // Verification code
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState<number>(600); // 10 minutes

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Active Google OAuth Client ID from environment variable VITE_GOOGLE_CLIENT_ID
  const activeClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').replace(/^["']|["']$/g, '').trim();
  const hasValidClientId = Boolean(activeClientId && activeClientId.length > 5);

  // Countdown timer for 6-digit code
  useEffect(() => {
    let timer: any;
    if (step === 'verify' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Google Identity Services (GSI) One Tap background initialization
  useEffect(() => {
    if (!isOpen || step !== 'form' || mode === 'forgot') return;
    if (!hasValidClientId) return;

    let isMounted = true;
    let attempts = 0;

    const initGsi = () => {
      if ((window as any).google?.accounts?.id && isMounted) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: activeClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              locale: 'es',
              width: 320,
            });
          }
          return true;
        } catch (err) {
          console.error('Error al inicializar Google Identity Services:', err);
        }
      }
      return false;
    };

    if (!initGsi()) {
      const interval = setInterval(() => {
        attempts++;
        if (initGsi() || attempts >= 20) {
          clearInterval(interval);
        }
      }, 250);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }

    return () => {
      isMounted = false;
    };
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

  // Direct Google Login Trigger (Powered by Firebase Authentication + GSI Fallback)
  const handleGoogleLoginClick = async () => {
    setErrorMessage('');
    setInfoMessage('');
    setLoading(true);

    try {
      // 1. Primary: Use Firebase Authentication Google popup flow
      const fbUser = await loginWithGoogleFirebase();
      if (fbUser) {
        // Synchronize session token with server
        try {
          const syncRes = await fetch('/api/auth/firebase-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: fbUser }),
          });
          const syncData = await syncRes.json();
          if (syncData.token) {
            localStorage.setItem('reborn_session_token', syncData.token);
          }
        } catch (e) {}

        onLoginSuccess(fbUser);
        onClose();
        return;
      }
    } catch (fbErr: any) {
      if (
        fbErr?.code === 'auth/popup-closed-by-user' ||
        fbErr?.code === 'auth/cancelled-popup-request'
      ) {
        setLoading(false);
        return;
      }

      console.warn('Firebase login attempt, checking GSI fallback:', fbErr);

      // 2. Fallback to Google Identity Services if Client ID is configured
      if (hasValidClientId) {
        runGoogleIdentityFlow();
        return;
      }

      setLoading(false);
      setErrorMessage(
        fbErr?.message || 'Error al conectar con Google. Por favor intenta de nuevo.'
      );
    }
  };

  const runGoogleIdentityFlow = () => {
    try {
      if ((window as any).google?.accounts?.oauth2) {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: activeClientId,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              setLoading(false);
              if (tokenResponse.error !== 'popup_closed_by_user') {
                if (tokenResponse.error === 'access_denied') {
                  setErrorMessage(
                    'Google indicó acceso denegado: En Google Cloud Console tu pantalla de consentimiento OAuth está en modo "En prueba". Para que cualquier usuario de Google pueda entrar libremente sin que tengas que registrarlo manualmente, haz clic en "Publicar aplicación" en Google Cloud Console.'
                  );
                } else {
                  setErrorMessage(
                    `Error de Google (${tokenResponse.error}): ${
                      tokenResponse.error_description ||
                      'Verifica que tu dominio esté agregado en Orígenes de JavaScript autorizados en Google Cloud Console.'
                    }`
                  );
                }
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
                  onClose();
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
      } else if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.prompt();
        setLoading(false);
      } else {
        setLoading(false);
        setErrorMessage('Servicio de Google no disponible temporalmente.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage('Error al abrir la ventana de autenticación de Google.');
    }
  };

  // 1. Login with email & password
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
        onClose();
      } else {
        setErrorMessage(data.error || 'El correo o la contraseña no son correctos.');
      }
    } catch (err) {
      setErrorMessage('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Register: Send real verification code
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
          role: selectedRole,
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

  // 3. Register: Verify 6-digit code
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

  // 4. Forgot password request
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

  // 5. Reset password submit
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
        onClose();
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#e5decb] overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#e5decb] flex items-center justify-between bg-[#f5f0e6]/50">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#2e4c2c] block">
              Acceso Seguro
            </span>
            <h2 className="text-xl font-bold font-['Outfit',sans-serif] text-[#0f291e]">
              {mode === 'forgot'
                ? step === 'verify'
                  ? 'Nueva Contraseña'
                  : 'Recuperar Contraseña'
                : step === 'verify'
                ? 'Verificación de Correo'
                : mode === 'login'
                ? 'Iniciar sesión'
                : 'Crear cuenta circular'}
            </h2>
          </div>
          <button
            id="btn-close-auth-modal"
            onClick={onClose}
            className="p-2 rounded-full text-[#64748b] hover:text-[#0f291e] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch if on form step & not forgot */}
        {mode !== 'forgot' && step === 'form' && (
          <div className="flex border-b border-[#e5decb] bg-[#faf8f5] text-xs font-semibold">
            <button
              id="modal-tab-login"
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setInfoMessage('');
              }}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                mode === 'login'
                  ? 'border-[#9bb593] text-[#1c2e1b] font-bold bg-white'
                  : 'border-transparent text-[#64748b] hover:text-[#0f291e]'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              id="modal-tab-register"
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setInfoMessage('');
              }}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                mode === 'register'
                  ? 'border-[#9bb593] text-[#1c2e1b] font-bold bg-white'
                  : 'border-transparent text-[#64748b] hover:text-[#0f291e]'
              }`}
            >
              Crear una cuenta
            </button>
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Error Message Alert */}
          {errorMessage && (
            <div
              id="modal-auth-error-alert"
              className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Info Message Alert */}
          {infoMessage && (
            <div
              id="modal-auth-info-alert"
              className="p-3 bg-[#caecc6]/30 border border-[#aecfab] text-[#032517] rounded-xl text-xs flex items-start gap-2 animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 text-[#486548] shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed font-medium">{infoMessage}</div>
            </div>
          )}

          {/* Google Sign-in */}
          {mode !== 'forgot' && step === 'form' && (
            <div className="space-y-3">
              <div className="flex flex-col items-center justify-center">
                <button
                  id="modal-btn-google-action"
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleLoginClick}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-full border border-[#e6e2dd] bg-white hover:bg-[#f8f3ee] text-[#1d1b19] text-xs font-semibold transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <span>{loading ? 'Conectando con Google...' : 'Continuar con Google'}</span>
                </button>
                <div ref={googleBtnRef} className="hidden" aria-hidden="true" />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#e6e2dd]"></div>
                <span className="flex-shrink mx-3 text-[10px] font-semibold text-[#727973] uppercase tracking-wider">
                  o con correo
                </span>
                <div className="flex-grow border-t border-[#e6e2dd]"></div>
              </div>
            </div>
          )}

          {/* Form Step: Login */}
          {mode === 'login' && step === 'form' && (
            <form onSubmit={handleEmailPasswordLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#727973] absolute left-3 top-2.5" />
                  <input
                    id="modal-login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tunombre@correo.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:border-[#032517]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#032517]">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setStep('form');
                      setErrorMessage('');
                      setInfoMessage('');
                    }}
                    className="text-[11px] text-[#486548] hover:text-[#032517] font-semibold"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#727973] absolute left-3 top-2.5" />
                  <input
                    id="modal-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 bg-white border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:border-[#032517]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#727973] hover:text-[#032517]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="modal-btn-submit-login"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#9bb593] text-white rounded-full text-xs font-bold hover:bg-[#2e4c2c] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Iniciar sesión</span>}
              </button>
            </form>
          )}

          {/* Form Step: Register */}
          {mode === 'register' && step === 'form' && (
            <form onSubmit={handleSendVerificationCode} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1">
                  Nombre completo
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#727973] absolute left-3 top-2.5" />
                  <input
                    id="modal-reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Camila Henao"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:border-[#032517]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#727973] absolute left-3 top-2.5" />
                  <input
                    id="modal-reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tunombre@correo.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:border-[#032517]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1">
                  Crear contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#727973] absolute left-3 top-2.5" />
                  <input
                    id="modal-reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-9 py-2 bg-white border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:border-[#032517]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#727973] hover:text-[#032517]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1.5">
                  Tipo de cuenta
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('normal')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRole === 'normal'
                        ? 'border-[#032517] bg-[#f0f4f0] ring-1 ring-[#032517]'
                        : 'border-[#e6e2dd] bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#032517]">Usuario normal</span>
                      {selectedRole === 'normal' && (
                        <div className="w-2 h-2 rounded-full bg-[#032517]"></div>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-500 leading-tight">
                      Para renovar prendas y participar en la comunidad.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('confeccionista')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRole === 'confeccionista'
                        ? 'border-[#032517] bg-[#f0f4f0] ring-1 ring-[#032517]'
                        : 'border-[#e6e2dd] bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#032517]">Confeccionista</span>
                      {selectedRole === 'confeccionista' && (
                        <div className="w-2 h-2 rounded-full bg-[#032517]"></div>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-500 leading-tight">
                      Para modistas, costura y transformación textil.
                    </p>
                  </button>
                </div>
              </div>

              <button
                id="modal-btn-submit-register"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#9bb593] text-white rounded-full text-xs font-bold hover:bg-[#2e4c2c] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Continuar y verificar código</span>}
              </button>
            </form>
          )}

          {/* Verify Step: Register */}
          {mode === 'register' && step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="text-center p-3 bg-[#f8f3ee] rounded-xl border border-[#e6e2dd]">
                <p className="text-xs text-[#424843]">Código enviado a:</p>
                <p className="font-semibold text-xs text-[#032517]">{email}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1.5 text-center">
                  Ingresa el código numérico de 6 dígitos
                </label>
                <input
                  id="modal-verify-input"
                  type="text"
                  maxLength={6}
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-[8px] font-mono text-2xl font-bold py-2.5 bg-white border-2 border-[#032517] rounded-xl text-[#032517] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#727973]">
                <span>Expira en: <strong className="text-[#032517]">{formatTime(countdown)}</strong></span>
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={loading || countdown > 540}
                  className="text-[#486548] hover:text-[#032517] font-semibold underline disabled:opacity-50"
                >
                  Reenviar código
                </button>
              </div>

              <button
                id="modal-btn-confirm-code"
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full py-2.5 bg-[#9bb593] text-white rounded-full text-xs font-bold hover:bg-[#2e4c2c] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Activar y Entrar</span>}
              </button>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full text-center text-xs text-[#727973] hover:text-[#032517]"
              >
                ← Volver a editar datos
              </button>
            </form>
          )}

          {/* Mode: Forgot Password Form */}
          {mode === 'forgot' && step === 'form' && (
            <form onSubmit={handleRequestPasswordReset} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#727973] absolute left-3 top-2.5" />
                  <input
                    id="modal-forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tunombre@correo.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:border-[#032517]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#9bb593] text-white rounded-full text-xs font-bold hover:bg-[#2e4c2c] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Enviar código de recuperación</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setStep('form');
                  setErrorMessage('');
                }}
                className="w-full text-center text-xs text-[#486548] font-semibold hover:text-[#032517] flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Volver a iniciar sesión</span>
              </button>
            </form>
          )}

          {/* Mode: Forgot Password Verify & Reset */}
          {mode === 'forgot' && step === 'verify' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1 text-center">
                  Código de 6 dígitos
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-[6px] font-mono text-xl font-bold py-2 bg-white border-2 border-[#032517] rounded-xl text-[#032517] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 bg-white border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full px-3 py-2 bg-white border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19]"
                />
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full py-2.5 bg-[#9bb593] text-white rounded-full text-xs font-bold hover:bg-[#2e4c2c] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Guardar contraseña y entrar</span>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
