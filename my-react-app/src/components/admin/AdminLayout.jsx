/**
 * AdminLayout Component
 *
 * Shared layout shell for `/admin/*` pages.
 * Follows the same monochrome architectural visual identity as the public website
 * (white top bar, crisp 1px hairlines, Space Grotesk + IBM Plex Mono) while
 * prioritizing CMS usability and responsive navigation.
 */
import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscribeMessagesAdmin } from '../../services/messageService';
import styles from './AdminLayout.module.css';

const CMS_NAV_LINKS = [
  { to: '/admin/dashboard', index: '01', label: 'DASHBOARD' },
  { to: '/admin/projects', index: '02', label: 'PROJECTS' },
  { to: '/admin/interests', index: '03', label: 'INTERESTS & HOBBIES' },
  { to: '/admin/content', index: '04', label: 'PAGE CONTENT & STACK' },
  { to: '/admin/messages', index: '05', label: 'MESSAGES INBOX', showBadge: true },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeMessagesAdmin((messages) => {
      const unread = messages.filter((m) => !m.read).length;
      setUnreadCount(unread);
    });
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className={styles.adminShell}>
      {/* Top White Navbar */}
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <span className={styles.brandSquare} aria-hidden="true" />
          <span className={styles.cmsTitle}>PORTFOLIO // ADMIN PANEL</span>
          <span className={styles.authBadge}>UID VERIFIED</span>
        </div>

        <div className={styles.topBarRight}>
          <span className={styles.adminEmail}>{user?.email}</span>
          <Link to="/" className={styles.publicSiteLink}>
            VIEW PUBLIC SITE ↗
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className={styles.logoutBtn}
          >
            SIGN OUT
          </button>
        </div>
      </header>

      <div className={styles.workspace}>
        {/* Left Navigation Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.navMenu} aria-label="Admin sections">
            {CMS_NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`
                }
              >
                <div className={styles.linkTextGroup}>
                  <span className={styles.linkIndex}>{item.index} //</span>
                  <span className={styles.linkLabel}>{item.label}</span>
                </div>
                {item.showBadge && unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{unreadCount} NEW</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            <p className={styles.securityNote}>
              SECURITY: SINGLE-ADMIN UID ALLOWLIST ACTIVE
            </p>
          </div>
        </aside>

        {/* Main CMS Content Area */}
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

