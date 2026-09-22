import express from 'express';
import path from 'path';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory persistent state stores
interface VerificationEntry {
  code: string;
  expiresAt: number;
  email: string;
  name?: string;
  password?: string;
}

const verificationStore = new Map<string, VerificationEntry>();

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
}

const usersStore = new Map<string, ServerUser>();

// Initial garments store
let garmentsStore: any[] = [];

// Chat conversations store - starts STRICTLY EMPTY per user requirement
let conversationsStore: any[] = [];

// Advisor inquiries store
let advisorInquiriesStore: any[] = [];

// Contact form submissions
let contactSubmissionsStore: any[] = [];

// Newsletter subscribers
const newsletterSubscribers = new Set<string>();

// Email Transporter helper
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

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. Auth: Send verification code
app.post('/api/auth/send-verification-code', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Correo electrónico inválido.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Generate secure 6-digit numeric verification code
    const code = Math.floor(100000 + crypto.randomInt(0, 900000)).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    verificationStore.set(cleanEmail, {
      code,
      expiresAt,
      email: cleanEmail,
      name: name?.trim() || 'Usuario Reborn',
      password,
    });

    const mailer = getMailer();
    let emailSent = false;
    let emailError = '';

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
              <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${name || 'estimad@ artesano'}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6;">Gracias por unirte a la comunidad de moda consciente y upcycling. Tu código de verificación para completar el registro es:</p>
              <div style="background-color: #032517; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 18px 24px; border-radius: 8px; margin: 28px 0;">
                ${code}
              </div>
              <p style="font-size: 13px; color: #727973; line-height: 1.5;">Este código es válido por 10 minutos. Si no has solicitado este código, puedes ignorar este mensaje con total seguridad.</p>
              <hr style="border: none; border-top: 1px solid #e6e2dd; margin: 24px 0;" />
              <p style="font-size: 12px; color: #727973; text-align: center;">Reborn Your Style · Cada puntada cuenta una nueva historia.</p>
            </div>
          `,
        });
        emailSent = true;
      } catch (err: any) {
        console.error('Error enviando correo SMTP:', err);
        emailError = err.message;
      }
    } else {
      console.log(`[Reborn Auth Code] Correo a ${cleanEmail} -> Código: ${code}`);
    }

    return res.json({
      success: true,
      message: emailSent
        ? `Código enviado con éxito a ${cleanEmail}.`
        : `Código generado. ${mailer ? 'No se pudo enviar por SMTP' : 'Servidor listo'}`,
      emailSent,
      // For immediate preview and testing when SMTP credentials are not yet configured in .env
      devCode: !emailSent ? code : undefined,
    });
  } catch (error: any) {
    console.error('Error in send-verification-code:', error);
    res.status(500).json({ error: 'Error al generar código de verificación.' });
  }
});

// 2. Auth: Verify 6-digit code
app.post('/api/auth/verify-code', (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Correo y código son requeridos.' });
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
      return res.status(400).json({ error: 'El código ingresado es incorrecto. Verifica los 6 dígitos.' });
    }

    // Code is valid! Create or update user
    verificationStore.delete(cleanEmail);

    const user: ServerUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: entry.name || 'Artesano Consciente',
      email: cleanEmail,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Amante de la moda circular, el upcycling y el rescate de prendas de calidad.',
      country: 'Colombia',
      department: 'Antioquia',
      city: 'Medellín',
      neighborhood: 'Buenos Aires',
      address: 'Calle 49 #35-12',
      phone: '+57 300 123 4567',
      preferences: ['Upcycling deconstruido', 'Bordado botánico', 'Denim artesanal'],
      isVerified: true,
      joinedDate: 'Recientemente',
      authProvider: 'email',
    };

    usersStore.set(cleanEmail, user);

    return res.json({
      success: true,
      user,
      token: `rys_token_${Buffer.from(cleanEmail).toString('base64')}_${Date.now()}`,
    });
  } catch (error: any) {
    console.error('Error in verify-code:', error);
    res.status(500).json({ error: 'Error al verificar código.' });
  }
});

// 3. Auth: Google Login
app.post('/api/auth/google', (req, res) => {
  try {
    const { email, name, picture, sub } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Datos de Google incompletos.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = usersStore.get(cleanEmail);

    if (!user) {
      user = {
        id: `google_${sub || Date.now()}`,
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Miembro de Reborn Your Style mediante Google.',
        country: 'Colombia',
        department: 'Antioquia',
        city: 'Medellín',
        neighborhood: 'Buenos Aires',
        address: 'Calle 49 #35-12',
        preferences: ['Upcycling', 'Sastrería', 'Sostenibilidad'],
        isVerified: true,
        joinedDate: 'Hoy',
        authProvider: 'google',
      };
      usersStore.set(cleanEmail, user);
    }

    return res.json({
      success: true,
      user,
      token: `rys_google_${Buffer.from(cleanEmail).toString('base64')}_${Date.now()}`,
    });
  } catch (error: any) {
    console.error('Error in google auth:', error);
    res.status(500).json({ error: 'Error al autenticar con Google.' });
  }
});

// 4. Garments
app.get('/api/garments', (req, res) => {
  res.json({ garments: garmentsStore });
});

app.post('/api/garments', (req, res) => {
  try {
    const garment = req.body;
    if (!garment.title || !garment.category) {
      return res.status(400).json({ error: 'Faltan datos requeridos de la prenda.' });
    }

    const newGarment = {
      ...garment,
      id: garment.id || `garment-${Date.now()}`,
      createdAt: 'Publicado hace unos momentos',
      status: 'disponible',
    };

    garmentsStore = [newGarment, ...garmentsStore];
    res.json({ success: true, garment: newGarment });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al guardar prenda.' });
  }
});

// 5. Chats & Messages
app.get('/api/chats', (req, res) => {
  // Returns conversations - starts clean/empty
  res.json({ conversations: conversationsStore });
});

app.post('/api/chats/message', (req, res) => {
  try {
    const { conversationId, participantId, participantName, participantRole, participantAvatar, text, senderId, senderName, isAdvisor } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    let conversation = conversationsStore.find(c => c.id === conversationId || c.participantId === participantId);

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

// 6. Advisor Requests
app.post('/api/advisor', (req, res) => {
  try {
    const { userName, userEmail, subject, message, garmentId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Por favor describe tu consulta para el asesor.' });
    }

    const inquiry = {
      id: `adv-${Date.now()}`,
      userName: userName || 'Usuario',
      userEmail: userEmail || 'correo@ejemplo.com',
      subject: subject || 'Asesoría de estilo y rescate textil',
      message: message.trim(),
      garmentId,
      createdAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      status: 'Recibido',
    };

    advisorInquiriesStore.unshift(inquiry);

    // Also auto-create a real thread with the Advisor in the chat system!
    const advisorConvId = 'conv-asesor-reborn';
    let advisorConv = conversationsStore.find(c => c.id === advisorConvId);
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

    if (!advisorConv) {
      advisorConv = {
        id: advisorConvId,
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
    } else {
      advisorConv.messages.push(initialUserMsg, advisorReply);
      advisorConv.lastMessage = advisorReply.text;
      advisorConv.lastMessageTime = advisorReply.timestamp;
      advisorConv.unreadCount += 1;
    }

    res.json({ success: true, inquiry, conversationId: advisorConvId });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al registrar consulta con asesor.' });
  }
});

// 7. Contact Form
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

// 8. Newsletter
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
