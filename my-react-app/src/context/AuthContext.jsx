/**
 * Authentication Context Provider
 * Exposes current Firebase user, verified Admin UID status, and auth actions.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  signInAdmin,
  signOutAdmin,
  subscribeToAuthChanges,
} from '../services/authService';
import {
  ADMIN_UID,
  isFirebaseConfigured,
  isAdminUidConfigured,
} from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(({ user: currentUser, isAdmin: adminVerified }) => {
      setUser(currentUser);
      setIsAdmin(adminVerified);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      loading,
      isFirebaseConfigured,
      isAdminUidConfigured,
      configuredAdminUid: ADMIN_UID,
      signIn: signInAdmin,
      signOut: signOutAdmin,
    }),
    [user, isAdmin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return ctx;
}

