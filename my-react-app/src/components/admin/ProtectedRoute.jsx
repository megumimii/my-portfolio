/**
 * ProtectedRoute Component for Private Admin CMS
 *
 * Enforces two-factor authorization:
 * 1. User must be authenticated via Firebase Authentication (`user !== null`).
 * 2. User's Firebase UID must match the administrator UID allowlist (`isAdmin === true`).
 *
 * If the user has logged in with their newly created Firebase account before setting
 * `VITE_ADMIN_UID` in `.env`, renders a clean UID Setup Assistant so they can copy
 * their exact UID into `.env`, `firestore.rules`, and `storage.rules`.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminLayout.module.css';

export default function ProtectedRoute({ children }) {
  const {
    user,
    isAdmin,
    loading,
    isAdminUidConfigured,
    signOut,
  } = useAuth();
  const location = useLocation();
  const [copiedUid, setCopiedUid] = useState(false);

  if (loading) {
    return (
      <div className={styles.authGateScreen}>
        <div className={styles.authGateCard}>
          <span className={styles.gateCode}>SYS // AUTH VERIFICATION</span>
          <h1 className={styles.gateTitle}>VERIFYING ADMINISTRATOR SESSION...</h1>
        </div>
      </div>
    );
  }

  // If not signed in at all, redirect to /admin/login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Signed in, but either VITE_ADMIN_UID is not yet set in .env or UID does not match
  if (!isAdmin) {
    const handleCopyUid = async () => {
      try {
        await navigator.clipboard.writeText(user.uid);
        setCopiedUid(true);
        setTimeout(() => setCopiedUid(false), 2500);
      } catch {
        // Fallback no-op
      }
    };

    return (
      <div className={styles.authGateScreen}>
        <div className={styles.authGateCard}>
          <span className={styles.gateCode}>
            {isAdminUidConfigured
              ? 'SECURITY BLOCK // UNAUTHORIZED UID'
              : 'INITIAL SETUP // ADMIN UID ALLOWLIST'}
          </span>

          <h1 className={styles.gateTitle}>
            {isAdminUidConfigured
              ? 'ACCESS DENIED: ACCOUNT IS NOT THE ALLOWLISTED ADMINISTRATOR'
              : 'FINAL STEP: REGISTER YOUR ADMINISTRATOR UID'}
          </h1>

          <p className={styles.gateDesc}>
            Signed in as <strong>{user.email}</strong>. Only the explicit UID
            allowlisted in <code>.env</code>, <code>firestore.rules</code>, and{' '}
            <code>storage.rules</code> is granted administrator access.
          </p>

          <div className={styles.uidDisplayBox}>
            <div>
              <span className={styles.uidLabel}>YOUR ADMIN USER ID (UID)</span>
              <code className={styles.uidValue}>{user.uid}</code>
            </div>
            <button
              type="button"
              onClick={handleCopyUid}
              className={styles.uidCopyBtn}
            >
              {copiedUid ? 'COPIED [✓]' : 'COPY UID'}
            </button>
          </div>

          <ol className={styles.setupSteps}>
            <li>
              Open <code>.env</code> in your project root and set:{' '}
              <code>VITE_ADMIN_UID={user.uid}</code>
            </li>
            <li>
              Open <code>firestore.rules</code> and <code>storage.rules</code> and
              replace <code>REPLACE_WITH_YOUR_FIREBASE_ADMIN_UID</code> with{' '}
              <code>{user.uid}</code>.
            </li>
            <li>
              Deploy rules via <code>firebase deploy --only firestore:rules,storage</code>{' '}
              (or paste them into the Firebase Console Rules tab) and restart the Vite
              dev server.
            </li>
          </ol>

          <div className={styles.gateActions}>
            <button
              type="button"
              onClick={signOut}
              className={styles.signOutBtn}
            >
              SIGN OUT
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

