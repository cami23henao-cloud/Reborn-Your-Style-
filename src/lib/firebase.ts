import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, UserRole, UserStatus } from '../types';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore (using custom database ID if present in config)
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Validate connection to Firestore on initialization
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Revisa la configuración de Firebase: cliente sin conexión.');
    }
  }
}
testFirestoreConnection();

/**
 * Sends a real official password reset email via Firebase Authentication
 */
export async function sendFirebasePasswordReset(email: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return true;
  } catch (err: any) {
    console.warn('Firebase sendPasswordResetEmail:', err);
    throw err;
  }
}

/**
 * Synchronizes Firebase User with Firestore user document
 */
export async function syncFirebaseUserProfile(fbUser: FirebaseUser, initialRole?: UserRole): Promise<User> {
  const userDocRef = doc(db, 'users', fbUser.uid);
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<User>;
      const user: User = {
        id: fbUser.uid,
        name: data.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuario',
        email: fbUser.email || '',
        avatar: data.avatar || fbUser.photoURL || '',
        bio: data.bio || 'Miembro de Reborn Your Style con cuenta verificada.',
        country: data.country || 'Colombia',
        department: data.department || 'Antioquia',
        city: data.city || 'Medellín',
        neighborhood: data.neighborhood || 'Buenos Aires',
        address: data.address || '',
        phone: data.phone || fbUser.phoneNumber || '',
        preferences: data.preferences || ['Moda circular', 'Upcycling de proximidad', 'Sastrería'],
        isVerified: fbUser.emailVerified ?? true,
        joinedDate: data.joinedDate || new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        authProvider: 'google',
        role: (data.role as UserRole) || (fbUser.email === 'admin@rebornyourstyle.com' ? 'admin' : 'normal'),
        isBlocked: Boolean(data.isBlocked),
        status: (data.status as UserStatus) || (data.isBlocked ? 'bloqueado' : 'activo'),
      };
      if (!data.avatar && fbUser.photoURL) {
        await setDoc(userDocRef, { avatar: fbUser.photoURL }, { merge: true });
      }
      return user;
    }
  } catch (e) {
    console.warn('Leyendo perfil de Firestore:', e);
  }

  // Create new profile in Firestore
  const determinedRole: UserRole = initialRole || (fbUser.email === 'admin@rebornyourstyle.com' ? 'admin' : 'normal');
  const newUser: User = {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuario',
    email: fbUser.email || '',
    avatar: fbUser.photoURL || '',
    bio: determinedRole === 'confeccionista' 
      ? 'Confeccionista en Reborn Your Style. Ofrezco servicios de costura, patronaje y transformación textil sostenible.'
      : 'Miembro de Reborn Your Style con cuenta verificada.',
    country: 'Colombia',
    department: 'Antioquia',
    city: 'Medellín',
    neighborhood: 'Buenos Aires',
    address: '',
    phone: fbUser.phoneNumber || '',
    preferences: ['Moda circular', 'Upcycling de proximidad', 'Sastrería'],
    isVerified: true,
    joinedDate: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
    authProvider: 'google',
    role: determinedRole,
    isBlocked: false,
    status: 'activo',
  };

  try {
    await setDoc(userDocRef, newUser, { merge: true });
  } catch (err) {
    console.warn('Guardando nuevo usuario en Firestore:', err);
  }

  return newUser;
}

/**
 * Initiates Google sign-in using Firebase Authentication popup
 */
export async function loginWithGoogleFirebase(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return await syncFirebaseUserProfile(result.user);
}

/**
 * Updates a user profile in Firestore
 */
export async function updateUserProfileInFirestore(user: User): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', user.id);
    await setDoc(userDocRef, user, { merge: true });
  } catch (err) {
    console.warn('Error al guardar cambios de perfil en Firestore:', err);
  }
}

export async function logoutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribes to Firebase Auth state changes
 */
export function onFirebaseAuthStateChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const user = await syncFirebaseUserProfile(fbUser);
      callback(user);
    } else {
      callback(null);
    }
  });
}
