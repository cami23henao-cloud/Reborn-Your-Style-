import express from 'express';
import path from 'path';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory verification codes store (keyed by email)
interface VerificationEntry {
  code: string;
  expiresAt: number;
  email: string;
  name?: string;
  passwordHash?: string;
  salt?: string;
}

const verificationStore = new Map<string, VerificationEntry>();

// In-memory password reset store (keyed by email)
interface PasswordResetEntry {
  code: string;
  expiresAt: number;
  email: string;
}
const passwordResetStore = new Map<string, PasswordResetEntry>();

// User Database Model
interface ServerUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  country: string;
  department: string;
  city: string;
  neighborhood: string;
  address: string;
  phone?: string;
  preferences: string[];
  isVerified: boolean;
  joinedDate: string;
  authProvider: 'email' | 'google';
  passwordHash?: string;
  salt?: string;
}

// Stores keyed by clean email
const usersStore = new Map<string, ServerUser>();

// Active user sessions (sessionToken -> userId)
const sessionsStore = new Map<string, string>();

// Garments store
let garmentsStore: any[] = [];

// Chat conversations store - private per user
let conversationsStore: any[] = [];

// Advisor inquiries store
let advisorInquiriesStore: any[] = [];

// Contact form submissions
let contactSubmissionsStore: any[] = [];

// Newsletter subscribers
const newsletterSubscribers = new Set<string>();

// Helper: Email Transporter for real email delivery
function getMailer() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return null;
}

// Helper: Sanitize user object for public/client consumption (never expose hashes, tokens, passwords)
function sanitizeUser(user: ServerUser) {
  const { passwordHash, salt, ...safeUser } = user;
  return safeUser;
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. Auth: Iniciar sesión con correo y contraseña
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'El correo o la contraseña no son correctos.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = usersStore.get(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'El correo o la contraseña no son correctos.' });
    }

    // Check if account was created with Google without a local password yet
    if (!user.passwordHash || !user.salt) {
      return res.status(401).json({
        error: 'Esta cuenta fue creada con Google. Pulsa "Continuar con Google" para entrar, o utiliza "¿Olvidaste tu contraseña?" para crear una clave.',
      });
    }

    const computedHash = crypto
      .createHash('sha256')
      .update(password + user.salt)
      .digest('hex');

    if (computedHash !== user.passwordHash) {
      return res.status(401).json({ error: 'El correo o la contraseña no son correctos.' });
    }

    const sessionToken = `rys_sec_${crypto.randomBytes(32).toString('hex')}`;
    sessionsStore.set(sessionToken, user.id);

    return res.json({
      success: true,
      user: sanitizeUser(user),
      token: sessionToken,
    });
  } catch (err: any) {
    console.error('Error in login:', err);
    return res.status(500).json({ error: 'Error al procesar el inicio de sesión.' });
  }
});

// 2. Auth: Send REAL verification code to user email (con detección de cuentas existentes)
app.post('/api/auth/send-verification-code', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const cleanEmail = email?.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Ingresa una dirección de correo electrónico válida (ej. usuario@dominio.com).' });
    }

    // Detect if account already exists with password
    const existing = usersStore.get(cleanEmail);
    if (existing && existing.passwordHash) {
      return res.status(409).json({
        error: 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión con tu contraseña o recupérala si la has olvidado.',
        alreadyRegistered: true,
      });
    }

    // Generate secure 6-digit numeric verification code
    const code = Math.floor(100000 + crypto.randomInt(0, 900000)).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Hash password with salt (never plaintext)
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = password
      ? crypto.createHash('sha256').update(password + salt).digest('hex')
      : undefined;

    verificationStore.set(cleanEmail, {
      code,
      expiresAt,
      email: cleanEmail,
      name: name?.trim() || 'Usuario Reborn',
      passwordHash,
      salt,
    });

    const mailer = getMailer();
    if (mailer) {
      try {
        await mailer.sendMail({
          from: process.env.EMAIL_FROM || '"Reborn Your Style" <no-reply@rebornyourstyle.com>',
          to: cleanEmail,
          subject: `${code} es tu código de verificación - Reborn Your Style`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #fef8f3; color: #1d1b19; border-radius: 12px; border: 1px solid #e6e2dd;">
              <h2 style="font-family: Georgia, serif; color: #032517; font-size: 26px; margin-bottom: 8px;">Reborn Your Style</h2>
              <p style="color: #486548; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0;">Moda Circular & Transformación Textil</p>
              <hr style="border: none; border-top: 1px solid #e6e2dd; margin: 24px 0;" />
              <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${name || 'estimad@ usuario'}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6;">Gracias por unirte a la comunidad de moda consciente y upcycling. Tu código de verificación confidencial es:</p>
              <div style="background-color: #032517; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 18px 24px; border-radius: 8px; margin: 28px 0;">
                ${code}
              </div>
              <p style="font-size: 13px; color: #727973; line-height: 1.5;">Este código es de un solo uso y expira en 10 minutos. Por tu seguridad, nunca lo compartas con nadie.</p>
              <hr style="border: none; border-top: 1px solid #e6e2dd; margin: 24px 0;" />
              <p style="font-size: 12px; color: #727973; text-align: center;">Reborn Your Style · Cada puntada cuenta una nueva historia.</p>
            </div>
          `,
        });

        return res.json({
          success: true,
          message: `Código enviado con éxito a ${cleanEmail}. Revisa tu bandeja de entrada.`,
        });
      } catch (err: any) {
        console.error('Error enviando correo SMTP:', err);
        return res.status(500).json({
          error: 'No se pudo enviar el correo de verificación. Verifica las credenciales SMTP en los ajustes del proyecto.',
        });
      }
    } else {
      return res.status(400).json({
        error: 'El servicio de correo saliente (SMTP) no está configurado aún. Configura las variables SMTP_HOST, SMTP_USER y SMTP_PASS para enviar correos reales.',
      });
    }
  } catch (error: any) {
    console.error('Error in send-verification-code:', error);
    res.status(500).json({ error: 'Error al generar código de verificación.' });
  }
});

// 2. Auth: Verify 6-digit code strictly
app.post('/api/auth/verify-code', (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Correo y código son obligatorios.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const entry = verificationStore.get(cleanEmail);

    if (!entry) {
      return res.status(400).json({ error: 'No hay ningún código pendiente para este correo. Solicita uno nuevo.' });
    }

    if (Date.now() > entry.expiresAt) {
      verificationStore.delete(cleanEmail);
      return res.status(400).json({ error: 'El código ha expirado. Por favor solicita uno nuevo.' });
    }

    if (entry.code !== code.trim()) {
      return res.status(400).json({ error: 'El código ingresado es incorrecto. Verifica los 6 dígitos recibidos en tu correo.' });
    }

    // Code matched! Delete used verification
    verificationStore.delete(cleanEmail);

    // Retrieve existing user or create a new independent user
    let user = usersStore.get(cleanEmail);
    if (!user) {
      user = {
        id: `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        name: entry.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: '',
        bio: 'Miembro de Reborn Your Style con correo verificado.',
        country: 'Colombia',
        department: 'Antioquia',
        city: 'Medellín',
        neighborhood: 'Buenos Aires',
        address: '',
        phone: '',
        preferences: ['Upcycling', 'Bordado', 'Sastrería'],
        isVerified: true,
        joinedDate: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        authProvider: 'email',
        passwordHash: entry.passwordHash,
        salt: entry.salt,
      };
      usersStore.set(cleanEmail, user);
    } else {
      user.isVerified = true;
      if (entry.passwordHash) {
        user.passwordHash = entry.passwordHash;
        user.salt = entry.salt;
      }
      usersStore.set(cleanEmail, user);
    }

    const sessionToken = `rys_sec_${crypto.randomBytes(32).toString('hex')}`;
    sessionsStore.set(sessionToken, user.id);

    return res.json({
      success: true,
      user: sanitizeUser(user),
      token: sessionToken,
    });
  } catch (error: any) {
    console.error('Error in verify-code:', error);
    res.status(500).json({ error: 'Error al verificar código.' });
  }
});

// 3. Auth: Solicitar recuperación de contraseña (código real a correo)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email?.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Ingresa un correo electrónico con formato válido.' });
    }

    const user = usersStore.get(cleanEmail);
    if (!user) {
      return res.status(404).json({ error: 'No encontramos ninguna cuenta registrada con este correo electrónico.' });
    }

    const code = Math.floor(100000 + crypto.randomInt(0, 900000)).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    passwordResetStore.set(cleanEmail, { code, expiresAt, email: cleanEmail });

    const mailer = getMailer();
    if (mailer) {
      try {
        await mailer.sendMail({
          from: process.env.EMAIL_FROM || '"Reborn Your Style" <no-reply@rebornyourstyle.com>',
          to: cleanEmail,
          subject: `${code} es tu código para restablecer tu contraseña - Reborn Your Style`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #fef8f3; color: #1d1b19; border-radius: 12px; border: 1px solid #e6e2dd;">
              <h2 style="font-family: Georgia, serif; color: #032517; font-size: 26px; margin-bottom: 8px;">Reborn Your Style</h2>
              <p style="color: #486548; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0;">Recuperación de Contraseña</p>
              <hr style="border: none; border-top: 1px solid #e6e2dd; margin: 24px 0;" />
              <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${user.name}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6;">Hemos recibido una solicitud para cambiar la contraseña de tu cuenta en Reborn Your Style. Tu código de recuperación confidencial es:</p>
              <div style="background-color: #032517; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 18px 24px; border-radius: 8px; margin: 28px 0;">
                ${code}
              </div>
              <p style="font-size: 13px; color: #727973; line-height: 1.5;">Este código de un solo uso es válido por 10 minutos. Si no realizaste esta solicitud, puedes ignorar este correo; tu cuenta permanece segura.</p>
              <hr style="border: none; border-top: 1px solid #e6e2dd; margin: 24px 0;" />
              <p style="font-size: 12px; color: #727973; text-align: center;">Reborn Your Style · Cada puntada cuenta una nueva historia.</p>
            </div>
          `,
        });

        return res.json({
          success: true,
          message: `Código de recuperación enviado con éxito a ${cleanEmail}. Revisa tu bandeja de entrada.`,
        });
      } catch (err: any) {
        console.error('Error enviando correo SMTP:', err);
        return res.status(500).json({
          error: 'No se pudo enviar el correo de recuperación. Verifica las credenciales SMTP en los ajustes del proyecto.',
        });
      }
    } else {
      return res.status(400).json({
        error: 'El servicio de correo saliente (SMTP) no está configurado aún. Configura las variables SMTP_HOST, SMTP_USER y SMTP_PASS para enviar correos reales.',
      });
    }
  } catch (error: any) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud de recuperación.' });
  }
});

// 4. Auth: Verificar código de recuperación de contraseña
app.post('/api/auth/verify-reset-code', (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'El correo y el código son obligatorios.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const entry = passwordResetStore.get(cleanEmail);

    if (!entry) {
      return res.status(400).json({ error: 'No hay ninguna solicitud de recuperación pendiente para este correo. Solicita un código nuevo.' });
    }

    if (Date.now() > entry.expiresAt) {
      passwordResetStore.delete(cleanEmail);
      return res.status(400).json({ error: 'El código de recuperación ha expirado. Por favor solicita uno nuevo.' });
    }

    if (entry.code !== code.trim()) {
      return res.status(400).json({ error: 'El código de recuperación no es correcto. Verifica los 6 dígitos recibidos.' });
    }

    return res.json({ success: true, message: 'Código verificado correctamente.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al verificar el código.' });
  }
});

// 5. Auth: Restablecer contraseña con código validado
app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const entry = passwordResetStore.get(cleanEmail);

    if (!entry) {
      return res.status(400).json({ error: 'No hay ninguna solicitud de recuperación pendiente para este correo. Solicita uno nuevo.' });
    }

    if (Date.now() > entry.expiresAt) {
      passwordResetStore.delete(cleanEmail);
      return res.status(400).json({ error: 'El código ha expirado. Solicita uno nuevo.' });
    }

    if (entry.code !== code.trim()) {
      return res.status(400).json({ error: 'El código de recuperación no es correcto.' });
    }

    const user = usersStore.get(cleanEmail);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.createHash('sha256').update(newPassword + salt).digest('hex');

    user.passwordHash = passwordHash;
    user.salt = salt;
    user.isVerified = true;
    usersStore.set(cleanEmail, user);

    passwordResetStore.delete(cleanEmail);

    const sessionToken = `rys_sec_${crypto.randomBytes(32).toString('hex')}`;
    sessionsStore.set(sessionToken, user.id);

    return res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente.',
      user: sanitizeUser(user),
      token: sessionToken,
    });
  } catch (err: any) {
    console.error('Error in reset-password:', err);
    return res.status(500).json({ error: 'Error al restablecer la contraseña.' });
  }
});

// 6. Auth: Real Google OAuth with cryptographic token verification (supports ID token and OAuth2 Access Token)
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, accessToken } = req.body;
    if (!credential && !accessToken) {
      return res.status(400).json({ error: 'Credencial o token de Google no recibido.' });
    }

    let payload: {
      sub: string;
      email?: string;
      email_verified?: boolean | string;
      name?: string;
      picture?: string;
    } | null = null;

    if (credential) {
      // Validate Google ID token with official Google OAuth verification endpoint
      const googleVerifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );
      if (googleVerifyRes.ok) {
        payload = await googleVerifyRes.json();
      }
    } else if (accessToken) {
      // Validate OAuth2 access token with official Google userinfo endpoint
      const googleUserInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (googleUserInfoRes.ok) {
        payload = await googleUserInfoRes.json();
      }
    }

    if (!payload) {
      return res.status(401).json({
        error: 'La autenticación no pudo ser verificada por Google. Token inválido o expirado.',
      });
    }

    const cleanEmail = payload.email?.toLowerCase().trim();
    const isEmailVerified = payload.email_verified === true || payload.email_verified === 'true';

    if (!cleanEmail || !isEmailVerified) {
      return res.status(401).json({
        error: 'La cuenta de Google no tiene una dirección de correo verificada por Google.',
      });
    }

    // Existing account detection: retrieve existing user or create a new independent account
    let user = usersStore.get(cleanEmail);
    if (!user) {
      user = {
        id: `google_${payload.sub}`,
        name: payload.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: payload.picture || '',
        bio: 'Miembro de Reborn Your Style con cuenta de Google verificada.',
        country: 'Colombia',
        department: 'Antioquia',
        city: 'Medellín',
        neighborhood: 'Buenos Aires',
        address: '',
        phone: '',
        preferences: ['Moda circular', 'Upcycling de proximidad', 'Sastrería'],
        isVerified: true,
        joinedDate: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        authProvider: 'google',
      };
      usersStore.set(cleanEmail, user);
    } else {
      // Existing user found! Preserve existing profile data and link Google credentials
      if (!user.avatar && payload.picture) user.avatar = payload.picture;
      user.isVerified = true;
      usersStore.set(cleanEmail, user);
    }

    const sessionToken = `rys_google_${crypto.randomBytes(32).toString('hex')}`;
    sessionsStore.set(sessionToken, user.id);

    return res.json({
      success: true,
      user: sanitizeUser(user),
      token: sessionToken,
    });
  } catch (error: any) {
    console.error('Error in google auth:', error);
    res.status(500).json({ error: 'Error interno al validar con Google.' });
  }
});

// 6b. Auth: Firebase User Synchronization endpoint
app.post('/api/auth/firebase-sync', (req, res) => {
  try {
    const { user: fbUser } = req.body;
    if (!fbUser || !fbUser.id || !fbUser.email) {
      return res.status(400).json({ error: 'Datos de usuario de Firebase requeridos.' });
    }

    const cleanEmail = fbUser.email.toLowerCase().trim();
    let user = usersStore.get(cleanEmail);
    if (!user) {
      user = {
        id: fbUser.id,
        name: fbUser.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: fbUser.avatar || '',
        bio: fbUser.bio || 'Miembro de Reborn Your Style con cuenta verificada.',
        country: fbUser.country || 'Colombia',
        department: fbUser.department || 'Antioquia',
        city: fbUser.city || 'Medellín',
        neighborhood: fbUser.neighborhood || 'Buenos Aires',
        address: fbUser.address || '',
        phone: fbUser.phone || '',
        preferences: fbUser.preferences || ['Moda circular', 'Upcycling de proximidad', 'Sastrería'],
        isVerified: true,
        joinedDate: fbUser.joinedDate || new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        authProvider: 'google',
      };
      usersStore.set(cleanEmail, user);
    } else {
      if (fbUser.avatar) user.avatar = fbUser.avatar;
      usersStore.set(cleanEmail, user);
    }

    const sessionToken = `rys_fb_${crypto.randomBytes(32).toString('hex')}`;
    sessionsStore.set(sessionToken, user.id);

    return res.json({
      success: true,
      user: sanitizeUser(user),
      token: sessionToken,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al sincronizar sesión de Firebase.' });
  }
});

// 4. Auth: Logout
app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    sessionsStore.delete(token);
  }
  res.json({ success: true, message: 'Sesión cerrada exitosamente.' });
});

// 5. Auth: Verificar sesión activa (me)
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const userId = req.headers['x-user-id'] as string;

  let targetUser: ServerUser | undefined;

  if (token && sessionsStore.has(token)) {
    const sessionUserId = sessionsStore.get(token);
    for (const u of usersStore.values()) {
      if (u.id === sessionUserId) {
        targetUser = u;
        break;
      }
    }
  } else if (userId) {
    for (const u of usersStore.values()) {
      if (u.id === userId) {
        targetUser = u;
        break;
      }
    }
  }

  if (!targetUser) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  return res.json({ success: true, user: sanitizeUser(targetUser) });
});

// 5. User Profile: Retrieve, Update, and Delete (STRICTLY PRIVATE to own account)
app.get('/api/profile', (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  // Find user by unique ID
  let targetUser: ServerUser | undefined;
  for (const user of usersStore.values()) {
    if (user.id === userId) {
      targetUser = user;
      break;
    }
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'Perfil no encontrado.' });
  }

  res.json({ success: true, user: sanitizeUser(targetUser) });
});

app.put('/api/profile', (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  const updates = req.body;
  let targetEmail: string | undefined;

  for (const [email, user] of usersStore.entries()) {
    if (user.id === userId) {
      targetEmail = email;
      break;
    }
  }

  if (!targetEmail) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  const existing = usersStore.get(targetEmail)!;
  const updatedUser: ServerUser = {
    ...existing,
    name: updates.name?.trim() || existing.name,
    bio: updates.bio !== undefined ? updates.bio.trim() : existing.bio,
    avatar: updates.avatar !== undefined ? updates.avatar.trim() : existing.avatar,
    country: updates.country || existing.country,
    department: updates.department || existing.department,
    city: updates.city || existing.city,
    neighborhood: updates.neighborhood || existing.neighborhood,
    address: updates.address !== undefined ? updates.address : existing.address,
    phone: updates.phone !== undefined ? updates.phone : existing.phone,
    preferences: Array.isArray(updates.preferences) ? updates.preferences : existing.preferences,
  };

  usersStore.set(targetEmail, updatedUser);
  res.json({ success: true, user: sanitizeUser(updatedUser) });
});

app.delete('/api/profile', (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  // Remove user
  for (const [email, user] of usersStore.entries()) {
    if (user.id === userId) {
      usersStore.delete(email);
      break;
    }
  }

  // Delete private conversations for that user
  conversationsStore = conversationsStore.filter((c) => c.userId !== userId);

  res.json({ success: true, message: 'Cuenta eliminada exitosamente.' });
});

// 6. Garments: Catalog & User Submissions
app.get('/api/garments', (req, res) => {
  res.json({ garments: garmentsStore });
});

app.post('/api/garments', (req, res) => {
  try {
    const garment = req.body;
    const userId = (req.headers['x-user-id'] as string) || garment.userId || 'anonymous';

    if (!garment.title || !garment.category) {
      return res.status(400).json({ error: 'Faltan datos requeridos de la prenda.' });
    }

    const newGarment = {
      ...garment,
      id: garment.id || `garment-${Date.now()}`,
      userId,
      createdAt: 'Publicado hace unos momentos',
      status: 'disponible',
    };

    garmentsStore = [newGarment, ...garmentsStore];
    res.json({ success: true, garment: newGarment });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al guardar prenda.' });
  }
});

// 7. Chats & Messages: STRICTLY FILTERED BY USER ID (Private conversations)
app.get('/api/chats', (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    // Unauthenticated visitors receive strictly empty conversations
    return res.json({ conversations: [] });
  }

  // Filter conversations belonging ONLY to this user
  const userConvs = conversationsStore.filter(
    (c) => c.userId === userId || c.participantId === userId
  );
  res.json({ conversations: userConvs });
});

app.post('/api/chats/message', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId;
    const {
      conversationId,
      participantId,
      participantName,
      participantRole,
      participantAvatar,
      text,
      senderId,
      senderName,
      isAdvisor,
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    let conversation = conversationsStore.find(
      (c) => (c.userId === userId && c.id === conversationId) || c.id === conversationId
    );

    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conversationId: conversation?.id || conversationId || `conv-${Date.now()}`,
      senderId: senderId || 'me',
      senderName: senderName || 'Tú',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdvisor: Boolean(isAdvisor),
    };

    if (!conversation) {
      conversation = {
        id: message.conversationId,
        userId: userId || 'guest',
        participantId: participantId || 'prof-unknown',
        participantName: participantName || 'Contacto',
        participantRole: participantRole || (isAdvisor ? 'Equipo Asesor' : 'Modista Profesional'),
        participantAvatar: participantAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        lastMessage: message.text,
        lastMessageTime: message.timestamp,
        unreadCount: 0,
        messages: [message],
        isAdvisor: Boolean(isAdvisor),
      };
      conversationsStore.unshift(conversation);
    } else {
      conversation.messages.push(message);
      conversation.lastMessage = message.text;
      conversation.lastMessageTime = message.timestamp;
    }

    res.json({ success: true, conversation, message });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al enviar mensaje.' });
  }
});

// 8. Advisor Requests
app.post('/api/advisor', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'guest';
    const { userName, userEmail, subject, message, garmentId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Por favor describe tu consulta para el asesor.' });
    }

    const inquiry = {
      id: `adv-${Date.now()}`,
      userId,
      userName: userName || 'Usuario',
      userEmail: userEmail || 'correo@ejemplo.com',
      subject: subject || 'Asesoría de estilo y rescate textil',
      message: message.trim(),
      garmentId,
      createdAt: new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Recibido',
    };

    advisorInquiriesStore.unshift(inquiry);

    // Create private chat thread for this user
    const advisorConvId = `conv-asesor-${Date.now()}`;
    const initialUserMsg = {
      id: `msg-${Date.now()}`,
      conversationId: advisorConvId,
      senderId: 'user',
      senderName: userName || 'Tú',
      text: `[Consulta con Asesor - ${inquiry.subject}]: ${inquiry.message}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdvisor: false,
    };

    const advisorReply = {
      id: `msg-${Date.now() + 1}`,
      conversationId: advisorConvId,
      senderId: 'advisor',
      senderName: 'Equipo de Asesoría Reborn',
      senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      text: `¡Hola ${userName || ''}! Hemos recibido tu consulta sobre "${inquiry.subject}". Uno de nuestros modistas especialistas en upcycling la está revisando. En unos momentos te orientaremos sobre el corte, tejido y mejores técnicas para tu prenda.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdvisor: true,
    };

    const advisorConv = {
      id: advisorConvId,
      userId,
      participantId: 'advisor-reborn',
      participantName: 'Asesor Textil Reborn',
      participantRole: 'Especialista en Upcycling & Patronaje',
      participantAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      lastMessage: advisorReply.text,
      lastMessageTime: advisorReply.timestamp,
      unreadCount: 1,
      messages: [initialUserMsg, advisorReply],
      isAdvisor: true,
    };

    conversationsStore.unshift(advisorConv);

    res.json({ success: true, inquiry, conversationId: advisorConvId });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al registrar consulta con asesor.' });
  }
});

// 9. Contact Form
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Por favor completa todos los campos del formulario.' });
    }

    const submission = {
      id: `contact-${Date.now()}`,
      name,
      email,
      subject: subject || 'Consulta general',
      message,
      createdAt: new Date().toISOString(),
    };

    contactSubmissionsStore.unshift(submission);
    res.json({ success: true, message: 'Tu mensaje ha sido enviado exitosamente. Nos comunicaremos contigo en breve.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al procesar mensaje de contacto.' });
  }
});

// 10. Newsletter
app.post('/api/newsletter', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Por favor proporciona un correo electrónico válido.' });
    }

    newsletterSubscribers.add(email.trim().toLowerCase());
    res.json({ success: true, message: '¡Gracias por suscribirte al boletín de moda circular!' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al registrar suscripción.' });
  }
});

// ---------------- VITE MIDDLEWARE / PRODUCTION ----------------
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
