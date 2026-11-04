/**
 * Firebase Core Initialization & Configuration Module
 *
 * Reads configuration strictly from Vite environment variables (`import.meta.env`).
 * Never hardcodes credentials. Provides `isFirebaseConfigured` so the UI and Admin
 * setup guide can detect when `.env` still needs to be populated.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const ADMIN_UID = (import.meta.env.VITE_ADMIN_UID || '').trim();

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'your_api_key_here' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'your_project_id'
);

export const isAdminUidConfigured = Boolean(
  ADMIN_UID && ADMIN_UID !== 'REPLACE_WITH_YOUR_FIREBASE_ADMIN_UID'
);

let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('[Firebase Initialization Error]:', error);
  }
}

export { app, auth, db, storage };

