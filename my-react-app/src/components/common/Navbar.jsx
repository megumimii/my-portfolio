/**
 * Public Portfolio Navigation Bar
 *
 * Strictly adheres to visual requirements:
 * - Crisp pure-white background (`#FFFFFF`) with `#0A0A0A` ink typography
 * - `1px solid` bottom architectural hairline
 * - Numbered technical navigation items (`01 ABOUT`, `02 PROCESS`, `03 WORK`, `04 LIFE`, `05 CONTACT`)
 * - Discreet `/admin/login` (or `/admin/dashboard` if logged in) terminal entry link
 * - Tracks active section via our DRY `createIntersectionObserver` utility
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const NAV_ITEMS = [
  { id: 'about', index: '01', label: 'ABOUT' },
  { id: 'thought-process', index: '02', label: 'PROCESS' },
  { id: 'tools', index: '03', label: 'STACK' },
  { id: 'projects', index: '04', label: 'PROJECTS' },
  { id: 'interests', index: '05', label: 'BEYOND CODE' },
  { id: 'contact', index: '06', label: "LET'S TALK" },
];

export default function Navbar({ brandName = 'JOHN CHRISTIAN ISAAC // DEV' }) {
  const { user, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;

    const determineActiveSection = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // 1. Top of page boundary: Hero is active (no navigation tab active)
      if (scrollY < 80) {
        setActiveSection('hero');
        ticking = false;
        return;
      }

      // 2. Bottom of page boundary: Last section ("contact") is active
      if (window.innerHeight + scrollY >= docHeight - 50) {
        setActiveSection('contact');
        ticking = false;
        return;
      }

      // 3. Focal line: Situated comfortably beneath sticky navbar (68px) in the user's primary reading zone
      const navbarHeight = 68;
      const focalLine = navbarHeight + Math.min(140, (viewportHeight - navbarHeight) * 0.18);

      let matchingId = null;

      // Check each section from top to bottom
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        if (rect.top <= focalLine && rect.bottom > focalLine) {
          matchingId = item.id;
          break;
        }
      }

      // Fallback: If between section paddings, select the latest section whose top has passed focalLine
      if (!matchingId) {
        for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
          const el = document.getElementById(NAV_ITEMS[i].id);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (rect.top <= focalLine) {
            matchingId = NAV_ITEMS[i].id;
            break;
          }
        }
      }

      setActiveSection(matchingId || 'hero');
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(determineActiveSection);
        ticking = true;
      }
    };

    // Initial check on mount
    determineActiveSection();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (targetId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection('hero');
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      const navbarHeight = 68;
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, elementTop - navbarHeight),
        behavior: 'smooth',
      });
      setActiveSection(targetId);
    }
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        {/* Left Brand Identity */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, 'hero')}
          className={styles.brand}
          aria-label="Scroll to top of portfolio"
        >
          <span className={styles.brandDot} aria-hidden="true" />
          <span className={styles.brandText}>{brandName}</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className={styles.desktopNav} aria-label="Primary portfolio navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`${styles.navLink} ${isActive ? styles.activeLink : ''}`}
              >
                <span className={styles.navIndex}>{item.index}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Right Utility: Status & Discreet Admin Link */}
        <div className={styles.utilityZone}>
          <Link
            to={user && isAdmin ? '/admin/dashboard' : '/admin/login'}
            className={styles.adminLink}
            title={user && isAdmin ? 'Open Admin Dashboard' : 'Administrator Login'}
          >
            <span className={styles.adminBracket}>[</span>
            <span>{user && isAdmin ? 'ADMIN // ACTIVE' : 'ADMIN'}</span>
            <span className={styles.adminBracket}>]</span>
          </Link>

          <button
            type="button"
            className={styles.mobileToggle}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <span className={styles.toggleText}>
              {mobileMenuOpen ? 'CLOSE [X]' : 'MENU [+]'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <nav className={styles.mobileDrawer} aria-label="Mobile portfolio navigation">
          <div className={styles.mobileList}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`${styles.mobileLink} ${activeSection === item.id ? styles.mobileActive : ''
                  }`}
              >
                <span className={styles.navIndex}>{item.index} //</span>
                <span>{item.label}</span>
              </a>
            ))}
            <Link
              to={user && isAdmin ? '/admin/dashboard' : '/admin/login'}
              onClick={() => setMobileMenuOpen(false)}
              className={styles.mobileAdminLink}
            >
              <span>[ ADMINISTRATOR PORTAL ]</span>
              <span>→</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

