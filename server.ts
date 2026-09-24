import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import { INITIAL_GARMENTS } from './src/data/initialData';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory verification codes store (keyed by email)
interface VerificationEntry {
  code: string;
  expiresAt: number;
  createdAt: number;
  lastSentAt: number;
  email: string;
  name?: string;
  passwordHash?: string;
  salt?: string;
  role?: 'usuario' | 'modista' | 'normal' | 'confeccionista';
}

const verificationStore = new Map<string, VerificationEntry>();

// In-memory password reset store (keyed by email)
interface PasswordResetEntry {
  code: string;
  token?: string;
  expiresAt: number;
  createdAt: number;
  lastSentAt: number;
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
  role?: 'usuario' | 'modista' | 'admin' | 'normal' | 'confeccionista';
  isBlocked?: boolean;
  status?: 'activo' | 'bloqueado';
}

// Stores keyed by clean email
const usersStore = new Map<string, ServerUser>();

// Active user sessions (sessionToken -> userId)
const sessionsStore = new Map<string, string>();

// Active admin sessions (adminToken -> userId)
const adminSessionsStore = new Map<string, string>();

// Garments store
let garmentsStore: any[] = [];

// Chat conversations store - private per user
let conversationsStore: any[] = [];

// Advisor inquiries store
let advisorInquiriesStore: any[] = [];

// Contact form submissions
let contactSubmissionsStore: any[] = [];

// User reports store for administrator review
let reportsStore: any[] = [];

// Newsletter subscribers
const newsletterSubscribers = new Set<string>();

// Database persistence file
const DB_FILE = path.join(process.cwd(), 'data', 'reborn-db.json');

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.users)) {
        for (const u of data.users) {
          usersStore.set(u.email.toLowerCase().trim(), u);
        }
      }
      if (Array.isArray(data.garments) && data.garments.length > 0) {
        garmentsStore = data.garments;
      }
      if (Array.isArray(data.reports)) {
        reportsStore = data.reports;
      }
      if (Array.isArray(data.conversations)) {
        conversationsStore = data.conversations;
      }
      if (Array.isArray(data.advisorInquiries)) {
        advisorInquiriesStore = data.advisorInquiries;
      }
    }
  } catch (err) {
    console.warn('Advertencia al cargar base de datos local:', err);
  }
}

function saveDatabase() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = {
      users: Array.from(usersStore.values()),
      garments: garmentsStore,
      reports: reportsStore,
      conversations: conversationsStore,
      advisorInquiries: advisorInquiriesStore,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Advertencia al guardar base de datos local:', err);
  }
}

// Initialize administrator account securely
function initAdminUser() {
  const adminEmail = 'admin@rebornyourstyle.com';
  const existing = usersStore.get(adminEmail);
  if (!existing) {
    const adminSalt = crypto.randomBytes(16).toString('hex');
    const adminHash = crypto.createHash('sha256').update('RebornAdmin2026!' + adminSalt).digest('hex');
    const adminUser: ServerUser = {
      id: 'admin_rys_master',
      name: 'Administrador Reborn',
      email: adminEmail,
      role: 'admin',
      status: 'activo',
      isBlocked: false,
      isVerified: true,
      avatar: '',
      bio: 'Cuenta oficial de Administración y Moderación de Reborn Your Style.',
      country: 'Colombia',
      department: 'Antioquia',
      city: 'Medellín',
      neighborhood: 'El Poblado',
      address: 'Sede Administrativa Reborn',
      phone: '+57 300 000 0000',
      preferences: ['Administración', 'Moda circular', 'Sostenibilidad'],
      joinedDate: 'Septiembre 2026',
      authProvider: 'email',
      passwordHash: adminHash,
      salt: adminSalt,
    };
    usersStore.set(adminEmail, adminUser);
  } else {
    // Ensure role is admin
    existing.role = 'admin';
    existing.isBlocked = false;
    existing.status = 'activo';
  }
}

// Initialize default sample garments and reports if empty
function initDefaultData() {
  if (garmentsStore.length === 0 && Array.isArray(INITIAL_GARMENTS)) {
    garmentsStore = [...INITIAL_GARMENTS];
  }

  if (reportsStore.length === 0) {
    reportsStore = [
      {
        id: 'rep-001',
        targetType: 'prenda',
        targetId: 'garment-1',
        targetTitle: 'Chaqueta Denim Vintage Bordada',
        reportedBy: 'Laura Restrepo',
        reporterEmail: 'laura.restrepo@example.com',
        reason: 'Verificación de estado de la tela',
        details: 'El usuario solicita confirmar el porcentaje de algodón en la ficha descriptiva.',
        createdAt: 'Hace 1 día',
        status: 'pendiente',
      },
      {
        id: 'rep-002',
        targetType: 'confeccionista',
        targetId: 'prof-1',
        targetTitle: 'Elena Gómez (Sastrería & Upcycling)',
        reportedBy: 'Carlos Mario',
        reporterEmail: 'carlos.mario@example.com',
        reason: 'Consulta de disponibilidad',
        details: 'Solicita confirmar horarios de atención en taller de El Poblado.',
        createdAt: 'Hace 3 días',
        status: 'resuelto',
      },
    ];
  }
}

// Run initial loading
loadDatabase();
initAdminUser();
initDefaultData();
saveDatabase();

// Helper: SMTP Configuration status and validation
function getMailerConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = parseInt(process.env.SMTP_PORT?.trim() || '587', 10);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() ||
    (user ? `"Reborn Your Style" <${user}>` : '"Reborn Your Style" <no-reply@rebornyourstyle.com>');

  const missing: string[] = [];
  if (!host) missing.push('SMTP_HOST');
  if (!user) missing.push('SMTP_USER');
  if (!pass) missing.push('SMTP_PASS');

  return {
    isConfigured: missing.length === 0,
    missing,
    host: host || '',
    port,
    user: user || '',
    pass: pass || '',
    from,
  };
}

// Helper: Email Transporter for real email delivery
function getMailer() {
  const config = getMailerConfig();

  if (config.isConfigured && config.host && config.user && config.pass) {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
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

    // Check if account has been blocked by an administrator
    if (user.isBlocked || user.status === 'bloqueado') {
      return res.status(403).json({
        error: 'Tu cuenta ha sido bloqueada por un administrador. Contacta al equipo de soporte.',
      });
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

// 1b. Auth: Registro directo con rol (Usuario normal o Confeccionista)
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const cleanEmail = email?.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Ingresa una dirección de correo electrónico válida (ej. usuario@dominio.com).' });
    }

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Por favor ingresa tu nombre completo.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const existing = usersStore.get(cleanEmail);
    if (existing && existing.passwordHash) {
      return res.status(409).json({
        error: 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión o recupera tu contraseña.',
        alreadyRegistered: true,
      });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.createHash('sha256').update(password + salt).digest('hex');
    const assignedRole: 'normal' | 'confeccionista' = role === 'confeccionista' ? 'confeccionista' : 'normal';

    const newUser: ServerUser = {
      id: `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      name: name.trim(),
      email: cleanEmail,
      avatar: '',
      bio: assignedRole === 'confeccionista'
        ? 'Confeccionista en Reborn Your Style. Ofrezco servicios de costura, confección y transformación textil sostenible.'
        : 'Miembro de Reborn Your Style interesado en moda circular y reutilización textil.',
      country: 'Colombia',
      department: 'Antioquia',
      city: 'Medellín',
      neighborhood: 'Buenos Aires',
      address: '',
      phone: '',
      preferences: ['Moda circular', 'Upcycling', 'Sastrería'],
      isVerified: true,
      joinedDate: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      authProvider: 'email',
      passwordHash,
      salt,
      role: assignedRole,
      isBlocked: false,
      status: 'activo',
    };

    usersStore.set(cleanEmail, newUser);
    saveDatabase();

    const sessionToken = `rys_sec_${crypto.randomBytes(32).toString('hex')}`;
    sessionsStore.set(sessionToken, newUser.id);

    return res.json({
      success: true,
      user: sanitizeUser(newUser),
      token: sessionToken,
    });
  } catch (err: any) {
    console.error('Error in register:', err);
    return res.status(500).json({ error: 'Error al procesar el registro.' });
  }
});

// 2. Auth: Send REAL verification code to user email (con detección de cuentas existentes y rol)
app.post('/api/auth/send-verification-code', async (req, res) => {
  try {
    const { email, name, password, role } = req.body;
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

    // Rate-limiting / Cooldown check: allow resend after 60 seconds
    const existingEntry = verificationStore.get(cleanEmail);
    if (existingEntry && existingEntry.lastSentAt) {
      const elapsed = Date.now() - existingEntry.lastSentAt;
      const cooldownMs = 60 * 1000;
      if (elapsed < cooldownMs) {
        const remainingSec = Math.ceil((cooldownMs - elapsed) / 1000);
        return res.status(429).json({
          error: `Por favor espera ${remainingSec} segundos antes de solicitar otro código de verificación.`,
          remainingSeconds: remainingSec,
        });
      }
    }

    // Check SMTP configuration strictly
    const mailConfig = getMailerConfig();
    if (!mailConfig.isConfigured) {
      console.error(
        `[Servidor SMTP] No se pudo enviar el código de registro a ${cleanEmail}. ` +
        `Faltan variables en .env: ${mailConfig.missing.join(', ')}`
      );
      return res.status(503).json({
        error:
          'El servicio de envío de correos no está configurado en el servidor. ' +
          `Faltan las variables en .env: ${mailConfig.missing.join(', ')}. ` +
          'Configura las credenciales SMTP para enviar correos reales.',
        configured: false,
        missing: mailConfig.missing,
      });
    }

    const mailer = getMailer();
    if (!mailer) {
      return res.status(503).json({
        error: 'No se pudo conectar con el transporte de correo Nodemailer.',
        configured: false,
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

    const assignedRole: 'usuario' | 'modista' =
      role === 'modista' || role === 'confeccionista' ? 'modista' : 'usuario';

    try {
      await mailer.sendMail({
        from: mailConfig.from,
        to: cleanEmail,
        subject: `${code} es tu código de verificación - Reborn Your Style`,
        text: `Hola ${name || 'estimad@ usuario'},\n\nGracias por unirte a la comunidad de moda consciente y upcycling.\nTu código de verificación de 6 dígitos es: ${code}\n\nEste código es de un solo uso y expira en 10 minutos.\n\nReborn Your Style`,
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

      verificationStore.set(cleanEmail, {
        code,
        expiresAt,
        createdAt: Date.now(),
        lastSentAt: Date.now(),
        email: cleanEmail,
        name: name?.trim() || (assignedRole === 'modista' ? 'Modista Reborn' : 'Usuario Reborn'),
        passwordHash,
        salt,
        role: assignedRole,
      });

      console.log(`[SMTP Éxito] Correo de verificación enviado a ${cleanEmail}`);

      return res.json({
        success: true,
        message: `Código enviado con éxito a ${cleanEmail}. Revisa tu bandeja de entrada o spam.`,
      });
    } catch (err: any) {
      console.error(`[SMTP Error] Error enviando correo de registro a ${cleanEmail}:`, err?.message || err);
      return res.status(500).json({
        error: 'Ocurrió un problema al enviar el correo electrónico con tu servidor SMTP.',
        details: process.env.NODE_ENV !== 'production' ? err?.message : undefined,
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

    const assignedRole: 'usuario' | 'modista' =
      entry.role === 'modista' || entry.role === 'confeccionista' ? 'modista' : 'usuario';

    // Retrieve existing user or create a new independent user
    let user = usersStore.get(cleanEmail);
    if (!user) {
      user = {
        id: `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        name: entry.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: '',
        bio: assignedRole === 'modista'
          ? 'Modista profesional en Reborn Your Style. Especializada en arreglos a medida, confección y transformación textil sostenible.'
          : 'Miembro de la comunidad Reborn Your Style apasionad@ por la moda circular.',
        country: 'Colombia',
        department: 'Antioquia',
        city: 'Medellín',
        neighborhood: 'Buenos Aires',
        address: '',
        phone: '',
        preferences: assignedRole === 'modista'
          ? ['Patronaje', 'Arreglos y entalles', 'Upcycling y rediseño']
          : ['Upcycling', 'Bordado', 'Sastrería'],
        isVerified: true,
        joinedDate: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        authProvider: 'email',
        passwordHash: entry.passwordHash,
        salt: entry.salt,
        role: assignedRole,
        isBlocked: false,
        status: 'activo',
      };
      usersStore.set(cleanEmail, user);
    } else {
      user.isVerified = true;
      if (entry.passwordHash) {
        user.passwordHash = entry.passwordHash;
        user.salt = entry.salt;
      }
      user.role = assignedRole;
      usersStore.set(cleanEmail, user);
    }
    saveDatabase();

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
// NO requiere registro previo del correo; envía código numérico de 6 dígitos real
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email?.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Ingresa un correo electrónico con formato válido.' });
    }

    // Rate-limiting / Cooldown check: allow resend after 60 seconds
    const existingEntry = passwordResetStore.get(cleanEmail);
    if (existingEntry && existingEntry.lastSentAt) {
      const elapsed = Date.now() - existingEntry.lastSentAt;
      const cooldownMs = 60 * 1000;
      if (elapsed < cooldownMs) {
        const remainingSec = Math.ceil((cooldownMs - elapsed) / 1000);
        return res.status(429).json({
          error: `Por favor espera ${remainingSec} segundos antes de solicitar un nuevo código de recuperación.`,
          remainingSeconds: remainingSec,
        });
      }
    }

    // Check SMTP configuration strictly
    const mailConfig = getMailerConfig();
    if (!mailConfig.isConfigured) {
      console.error(
        `[Servidor SMTP] No se pudo enviar el código de recuperación a ${cleanEmail}. ` +
        `Faltan variables en .env: ${mailConfig.missing.join(', ')}`
      );
      return res.status(503).json({
        error:
          'El servicio de correo electrónico no está configurado en el servidor. ' +
          `Faltan las variables en .env: ${mailConfig.missing.join(', ')}. ` +
          'Configura tus credenciales SMTP para habilitar el envío real de correos.',
        configured: false,
        missing: mailConfig.missing,
      });
    }

    const mailer = getMailer();
    if (!mailer) {
      console.error('[Servidor SMTP] No se pudo inicializar el transporte de correo Nodemailer.');
      return res.status(503).json({
        error: 'No se pudo conectar con el transporte de correo. Revisa la configuración SMTP.',
        configured: false,
      });
    }

    // No se exige registro previo: si el usuario ya existe se usa su nombre, si no, su prefijo
    const user = usersStore.get(cleanEmail);
    const displayName = user?.name || cleanEmail.split('@')[0];

    const code = Math.floor(100000 + crypto.randomInt(0, 900000)).toString();
    const token = `rys_rst_${crypto.randomBytes(24).toString('hex')}`;
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos de validez
    const resetLink = `/recuperar-clave?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

    try {
      await mailer.sendMail({
        from: mailConfig.from,
        to: cleanEmail,
        subject: `${code} es tu código de recuperación de contraseña - Reborn Your Style`,
        text: `Hola ${displayName},\n\nHemos recibido una solicitud para restablecer tu contraseña en Reborn Your Style.\n\nTu código de verificación de 6 dígitos es: ${code}\n\nEste código expira en 15 minutos y es de un solo uso.\nSi no realizaste esta solicitud, puedes ignorar este mensaje de forma segura.\n\nReborn Your Style - Moda Circular & Transformación Textil`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #fef8f3; color: #1d1b19; border-radius: 12px; border: 1px solid #e6e2dd;">
            <h2 style="font-family: Georgia, serif; color: #032517; font-size: 26px; margin-bottom: 8px;">Reborn Your Style</h2>
            <p style="color: #486548; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0;">Recuperación y Acceso de Contraseña</p>
            <hr style="border: none; border-top: 1px solid #e6e2dd; margin: 24px 0;" />
            <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${displayName}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6;">Hemos recibido una solicitud para crear o actualizar tu contraseña en Reborn Your Style. Tu código de verificación confidencial de 6 dígitos es:</p>
            <div style="background-color: #032517; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 18px 24px; border-radius: 8px; margin: 28px 0;">
              ${code}
            </div>
            <p style="font-size: 14px; text-align: center; margin: 20px 0;">
              <a href="${resetLink}" style="display: inline-block; background-color: #2d4f30; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Restablecer mi contraseña en Reborn
              </a>
            </p>
            <p style="font-size: 13px; color: #727973; line-height: 1.5;">Este código es de un solo uso y expira en 15 minutos. Si no realizaste esta solicitud, puedes ignorar este mensaje.</p>
            <hr style="border: none; border-top: 1px solid #e6e2dd; margin: 24px 0;" />
            <p style="font-size: 12px; color: #727973; text-align: center;">Reborn Your Style · Cada puntada cuenta una nueva historia.</p>
          </div>
        `,
      });

      // ONLY save to store AFTER the email is successfully delivered
      passwordResetStore.set(cleanEmail, {
        code,
        token,
        expiresAt,
        createdAt: Date.now(),
        lastSentAt: Date.now(),
        email: cleanEmail,
      });

      console.log(`[SMTP Éxito] Correo de recuperación con código de 6 dígitos enviado a ${cleanEmail}`);

      return res.json({
        success: true,
        message: `Código de verificación de 6 dígitos enviado a ${cleanEmail}. Revisa tu bandeja de entrada o spam.`,
      });
    } catch (sendErr: any) {
      console.error(`[SMTP Error] Error enviando correo de recuperación a ${cleanEmail}:`, sendErr?.message || sendErr);
      return res.status(500).json({
        error:
          'Ocurrió un problema al enviar el correo electrónico con tu servidor SMTP. ' +
          'Verifica que el servidor SMTP y las credenciales sean válidas.',
        details: process.env.NODE_ENV !== 'production' ? sendErr?.message : undefined,
      });
    }
  } catch (error: any) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud de recuperación.' });
  }
});

// 4. Auth: Verificar código o token de recuperación de contraseña
app.post('/api/auth/verify-reset-code', (req, res) => {
  try {
    const { email, code, token } = req.body;
    if (!email || (!code && !token)) {
      return res.status(400).json({ error: 'El correo y el código o token son obligatorios.' });
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

    const isTokenMatch = token && entry.token === token;
    const isCodeMatch = code && entry.code === code.trim();

    if (!isTokenMatch && !isCodeMatch) {
      return res.status(400).json({ error: 'El código ingresado no coincide con el enviado a tu correo.' });
    }

    return res.json({ success: true, message: 'Código verificado correctamente. Ahora puedes crear tu nueva contraseña.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al verificar el código.' });
  }
});

// 5. Auth: Restablecer contraseña con código o token validado
app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { email, code, token, newPassword } = req.body;
    if (!email || (!code && !token) || !newPassword) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const entry = passwordResetStore.get(cleanEmail);

    if (!entry) {
      return res.status(400).json({ error: 'No hay ninguna solicitud de recuperación activa para este correo. Solicita un nuevo código.' });
    }

    if (Date.now() > entry.expiresAt) {
      passwordResetStore.delete(cleanEmail);
      return res.status(400).json({ error: 'El enlace o código de recuperación ha expirado. Solicita uno nuevo.' });
    }

    const isTokenMatch = token && entry.token === token;
    const isCodeMatch = code && entry.code === code.trim();

    if (!isTokenMatch && !isCodeMatch) {
      return res.status(400).json({ error: 'El enlace o código de recuperación no es válido.' });
    }

    // El código se invalida inmediatamente para que NO pueda volver a usarse
    passwordResetStore.delete(cleanEmail);

    let user = usersStore.get(cleanEmail);
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.createHash('sha256').update(newPassword + salt).digest('hex');

    if (!user) {
      // Si el correo no estaba registrado previamente, se crea automáticamente en segundo plano
      user = {
        id: `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: '',
        bio: 'Miembro de la comunidad Reborn Your Style con correo verificado.',
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
        passwordHash,
        salt,
        role: 'usuario',
        isBlocked: false,
        status: 'activo',
      };
      usersStore.set(cleanEmail, user);
    } else {
      user.passwordHash = passwordHash;
      user.salt = salt;
      user.isVerified = true;
      usersStore.set(cleanEmail, user);
    }
    saveDatabase();

    const sessionToken = `rys_sec_${crypto.randomBytes(32).toString('hex')}`;
    sessionsStore.set(sessionToken, user.id);

    return res.json({
      success: true,
      message: '¡Contraseña actualizada exitosamente! Ahora puedes iniciar sesión con tu nueva contraseña.',
      user: sanitizeUser(user),
      token: sessionToken,
    });
  } catch (err: any) {
    console.error('Error in reset-password:', err);
    return res.status(500).json({ error: 'Error al restablecer la contraseña.' });
  }
});

// 5b. Auth: Diagnóstico de estado SMTP (seguro, sin exponer contraseñas)
app.get('/api/auth/smtp-status', (req, res) => {
  const config = getMailerConfig();
  return res.json({
    configured: config.isConfigured,
    host: config.host || null,
    port: config.port,
    userConfigured: !!config.user,
    from: config.from,
    missingVariables: config.missing,
  });
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
  // Public catalog only returns garments that are not hidden
  const publicGarments = garmentsStore.filter((g) => g.status !== 'oculta');
  res.json({ garments: publicGarments });
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
    saveDatabase();
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

// ---------------- ADMINISTRATOR API ROUTES ----------------

// Middleware to ensure administrator access
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = (req.headers.authorization?.replace('Bearer ', '') || req.headers['x-admin-token']) as string;
  if (!token || !adminSessionsStore.has(token)) {
    return res.status(401).json({ error: 'Acceso no autorizado. Se requiere iniciar sesión como administrador.' });
  }

  const adminUserId = adminSessionsStore.get(token);
  let adminUser: ServerUser | undefined;
  for (const u of usersStore.values()) {
    if (u.id === adminUserId) {
      adminUser = u;
      break;
    }
  }

  if (!adminUser || adminUser.role !== 'admin' || adminUser.isBlocked) {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de administrador.' });
  }

  (req as any).adminUser = adminUser;
  next();
}

// 1. Admin Login (Privado e independiente para administradores)
app.post('/api/admin/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'El correo y la contraseña son obligatorios.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = usersStore.get(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales de administrador incorrectas.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Acceso denegado: Esta cuenta no posee privilegios de administrador para el panel de control.',
      });
    }

    if (user.isBlocked || user.status === 'bloqueado') {
      return res.status(403).json({ error: 'Esta cuenta administrativa se encuentra suspendida.' });
    }

    if (!user.passwordHash || !user.salt) {
      return res.status(401).json({ error: 'Credenciales de administrador no configuradas.' });
    }

    const computedHash = crypto
      .createHash('sha256')
      .update(password + user.salt)
      .digest('hex');

    if (computedHash !== user.passwordHash) {
      return res.status(401).json({ error: 'Credenciales de administrador incorrectas.' });
    }

    const adminToken = `rys_adm_${crypto.randomBytes(32).toString('hex')}`;
    adminSessionsStore.set(adminToken, user.id);

    return res.json({
      success: true,
      user: sanitizeUser(user),
      token: adminToken,
    });
  } catch (err: any) {
    console.error('Error in admin login:', err);
    return res.status(500).json({ error: 'Error al procesar acceso administrativo.' });
  }
});

// 2. Admin Me: Check active admin session
app.get('/api/admin/me', requireAdmin, (req, res) => {
  const adminUser = (req as any).adminUser as ServerUser;
  return res.json({ success: true, user: sanitizeUser(adminUser) });
});

// 3. Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const token = (req.headers.authorization?.replace('Bearer ', '') || req.headers['x-admin-token']) as string;
  if (token) {
    adminSessionsStore.delete(token);
  }
  return res.json({ success: true, message: 'Sesión administrativa cerrada exitosamente.' });
});

// 4. Admin Change Password (Permite cambiar la clave temporal con total seguridad)
app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  try {
    const adminUser = (req as any).adminUser as ServerUser;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Debes proporcionar la contraseña actual y la nueva contraseña.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener un mínimo de 8 caracteres por seguridad.' });
    }

    const computedCurrentHash = crypto
      .createHash('sha256')
      .update(currentPassword + (adminUser.salt || ''))
      .digest('hex');

    if (computedCurrentHash !== adminUser.passwordHash) {
      return res.status(400).json({ error: 'La contraseña actual ingresada es incorrecta.' });
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = crypto
      .createHash('sha256')
      .update(newPassword + newSalt)
      .digest('hex');

    adminUser.passwordHash = newHash;
    adminUser.salt = newSalt;
    usersStore.set(adminUser.email.toLowerCase(), adminUser);
    saveDatabase();

    return res.json({ success: true, message: 'Contraseña de administrador actualizada con éxito.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al actualizar la contraseña de administrador.' });
  }
});

// 5. Admin Stats: Métricas del sistema en tiempo real
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const allUsers = Array.from(usersStore.values());
  const normalUsers = allUsers.filter((u) => u.role !== 'admin' && u.role !== 'confeccionista').length;
  const confeccionistasCount = allUsers.filter((u) => u.role === 'confeccionista').length;
  const totalGarments = garmentsStore.length;
  const activeGarments = garmentsStore.filter((g) => g.status !== 'oculta').length;
  const hiddenGarments = garmentsStore.filter((g) => g.status === 'oculta').length;
  const totalReports = reportsStore.length;
  const pendingReports = reportsStore.filter((r) => r.status === 'pendiente').length;
  const totalInquiries = advisorInquiriesStore.length;

  res.json({
    totalUsers: allUsers.length,
    normalUsers,
    confeccionistasCount,
    totalGarments,
    activeGarments,
    hiddenGarments,
    totalReports,
    pendingReports,
    totalInquiries,
  });
});

// 6. Admin Users Management
app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = Array.from(usersStore.values()).map((u) => sanitizeUser(u));
  res.json({ users });
});

// 7. Admin Block/Unblock User
app.post('/api/admin/users/:id/block', requireAdmin, (req, res) => {
  const { id } = req.params;
  let targetUser: ServerUser | undefined;
  for (const u of usersStore.values()) {
    if (u.id === id) {
      targetUser = u;
      break;
    }
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  if (targetUser.role === 'admin' || targetUser.email === 'admin@rebornyourstyle.com') {
    return res.status(400).json({ error: 'No es posible bloquear la cuenta principal de administración.' });
  }

  targetUser.isBlocked = !targetUser.isBlocked;
  targetUser.status = targetUser.isBlocked ? 'bloqueado' : 'activo';

  usersStore.set(targetUser.email.toLowerCase(), targetUser);
  saveDatabase();

  res.json({
    success: true,
    message: targetUser.isBlocked ? 'Usuario bloqueado exitosamente.' : 'Usuario desbloqueado exitosamente.',
    user: sanitizeUser(targetUser),
  });
});

// 8. Admin Delete User
app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  let targetEmail: string | undefined;
  let targetUser: ServerUser | undefined;

  for (const [email, u] of usersStore.entries()) {
    if (u.id === id) {
      targetEmail = email;
      targetUser = u;
      break;
    }
  }

  if (!targetUser || !targetEmail) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  if (targetUser.role === 'admin' || targetUser.email === 'admin@rebornyourstyle.com') {
    return res.status(400).json({ error: 'No es posible eliminar la cuenta principal de administración.' });
  }

  usersStore.delete(targetEmail);
  conversationsStore = conversationsStore.filter((c) => c.userId !== id);
  saveDatabase();

  res.json({ success: true, message: 'Usuario eliminado del sistema exitosamente.' });
});

// 9. Admin Garments Management
app.get('/api/admin/garments', requireAdmin, (req, res) => {
  res.json({ garments: garmentsStore });
});

// 10. Admin Toggle Garment Visibility (Ocultar / Mostrar)
app.post('/api/admin/garments/:id/toggle-visibility', requireAdmin, (req, res) => {
  const { id } = req.params;
  const garment = garmentsStore.find((g) => g.id === id);

  if (!garment) {
    return res.status(404).json({ error: 'Prenda no encontrada.' });
  }

  garment.status = garment.status === 'oculta' ? 'disponible' : 'oculta';
  saveDatabase();

  res.json({
    success: true,
    message: garment.status === 'oculta' ? 'Prenda ocultada del catálogo.' : 'Prenda visible en el catálogo.',
    garment,
  });
});

// 11. Admin Delete Garment
app.delete('/api/admin/garments/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const initialLength = garmentsStore.length;
  garmentsStore = garmentsStore.filter((g) => g.id !== id);

  if (garmentsStore.length === initialLength) {
    return res.status(404).json({ error: 'Prenda no encontrada.' });
  }

  saveDatabase();
  res.json({ success: true, message: 'Prenda eliminada exitosamente del catálogo.' });
});

// 12. Admin Reports Management
app.get('/api/admin/reports', requireAdmin, (req, res) => {
  res.json({ reports: reportsStore });
});

app.post('/api/admin/reports/:id/status', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const report = reportsStore.find((r) => r.id === id);

  if (!report) {
    return res.status(404).json({ error: 'Reporte no encontrado.' });
  }

  report.status = status;
  saveDatabase();

  res.json({ success: true, message: 'Estado del reporte actualizado.', report });
});

// 13. Public Endpoint to submit a report on a garment or user
app.post('/api/reports', (req, res) => {
  try {
    const { targetType, targetId, targetTitle, reportedBy, reporterEmail, reason, details } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'El motivo del reporte es obligatorio.' });
    }

    const newReport = {
      id: `rep-${Date.now()}`,
      targetType: targetType || 'general',
      targetId: targetId || '',
      targetTitle: targetTitle || 'Elemento reportado',
      reportedBy: reportedBy || 'Usuario de la comunidad',
      reporterEmail: reporterEmail || '',
      reason,
      details: details || '',
      createdAt: 'Hace unos momentos',
      status: 'pendiente',
    };

    reportsStore.unshift(newReport);
    saveDatabase();

    res.json({ success: true, message: 'Reporte recibido. El equipo de administración lo revisará a la brevedad.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al enviar reporte.' });
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
