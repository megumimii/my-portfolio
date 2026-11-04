/**
 * Firebase Authentication & Administrator Verification Service
 *
 * Enforces that simply logging in is NOT enough: the authenticated user's UID
 * must match the configured `VITE_ADMIN_UID` allowlist (and is also verified
 * server-side by `firestore.rules` and `storage.rules`).
 */
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  auth,
  ADMIN_UID,
  isFirebaseConfigured,
  isAdminUidConfigured,
} from '../config/firebase';

/**
 * Checks whether a Firebase User object matches the single administrator UID.
 * @param {import('firebase/auth').User | null} user
 * @returns {boolean}
 */
export function verifyIsAdminUser(user) {
  if (!user || !user.uid) return false;
  if (!isAdminUidConfigured) {
    // If VITE_ADMIN_UID is not yet set in .env, return false for admin write guard
    // so the setup screen can display the user's UID to copy into .env & rules.
    return false;
  }
  return user.uid === ADMIN_UID;
}

/**
 * Signs in the administrator with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: import('firebase/auth').User, isAdmin: boolean }>}
 */
export async function signInAdmin(email, password) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error(
      'Firebase is not configured yet. Please add your VITE_FIREBASE_* keys to the .env file.'
    );
  }

  const trimmedEmail = String(email || '').trim();
  if (!trimmedEmail || !password) {
    throw new Error('Please enter both email address and password.');
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
    const isAdmin = verifyIsAdminUser(credential.user);
    return { user: credential.user, isAdmin };
  } catch (err) {
    const code = err?.code || '';
    if (
      code === 'auth/invalid-credential' ||
      code === 'auth/user-not-found' ||
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-email'
    ) {
      throw new Error('Invalid administrator email or password.');
    }
    if (code === 'auth/too-many-requests') {
      throw new Error('Too many failed sign-in attempts. Please wait a few minutes and try again.');
    }
    throw new Error(err?.message || 'Authentication failed. Please verify your Firebase configuration.');
  }
}

/**
 * Signs out the current user.
 * @returns {Promise<void>}
 */
export async function signOutAdmin() {
  if (!auth) return;
  await firebaseSignOut(auth);
}

/**
 * Subscribes to Firebase Authentication state changes.
 * @param {(state: { user: import('firebase/auth').User | null, isAdmin: boolean }) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function subscribeToAuthChanges(callback) {
  if (!isFirebaseConfigured || !auth) {
    callback({ user: null, isAdmin: false });
    return () => {};
  }

  return onAuthStateChanged(
    auth,
    (user) => {
      callback({
        user,
        isAdmin: verifyIsAdminUser(user),
      });
    },
    (error) => {
      console.error('[Auth State Listener Error]:', error);
      callback({ user: null, isAdmin: false });
    }
  );
}

