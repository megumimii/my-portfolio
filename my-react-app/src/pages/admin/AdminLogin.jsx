/**
 * Private Administrator Login Page (`/admin/login`)
 *
 * Accessible via the discreet link in the public Navbar or Footer.
 * Authenticates via Firebase Authentication and redirects to `/admin/dashboard`.
 */
import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FlowingWaves from '../../components/common/FlowingWaves';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
  const { user, isAdmin, signIn, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (user && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await signIn(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err?.message || 'Sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <FlowingWaves variant="dark" />

      <div className={styles.loginContainer}>
        <div className={styles.topReturnRow}>
          <Link to="/" className={styles.returnLink}>
            ← RETURN TO PUBLIC PORTFOLIO
          </Link>
          <span className={styles.securityTag}>RESTRICTED // ADMIN PORTAL</span>
        </div>

        <div className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIndex}>SECURITY // AUTHENTICATION</span>
            <h1 className={styles.cardTitle}>ADMINISTRATOR ACCESS</h1>
            <p className={styles.cardSubtitle}>
              Sign in with your administrator account to manage portfolio projects,
              interests, site content, and messages.
            </p>
          </div>

          {!isFirebaseConfigured && (
            <div className={styles.configNotice}>
              <strong>SETUP REQUIRED:</strong> Configuration variables are not
              yet detected in <code>.env</code>. Copy <code>.env.example</code> to{' '}
              <code>.env</code> and enter your credentials and{' '}
              <code>VITE_ADMIN_UID</code>.
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="admin-email" className={styles.label}>
                01 // ADMINISTRATOR EMAIL
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourdomain.com"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="admin-password" className={styles.label}>
                02 // PASSWORD
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={styles.input}
              />
            </div>

            {error && (
              <div className={styles.errorBanner} role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={styles.submitBtn}
            >
              <span>
                {submitting ? 'VERIFYING CREDENTIALS...' : 'SIGN IN TO ADMIN PANEL'}
              </span>
              <span>→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

