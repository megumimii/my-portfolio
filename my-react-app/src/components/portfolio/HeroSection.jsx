/**
 * A. HeroSection Component
 *
 * Art-directed multi-plane Hero composition:
 * - Plane 1: Oversized viewport-spanning "DEV" typographic monument (`100vw`)
 * - Plane 2: Subtle flowing dark wave ribbons (`<FlowingWaves variant="dark" />`)
 * - Plane 3: Central/offset portrait with entrance reveal & seamless bottom vignette
 * - Plane 4: Foreground handwritten "Hi, I'm...", stacked display name, intro & metrics
 */
import { useEffect, useState } from 'react';
import FlowingWaves from '../common/FlowingWaves';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import styles from './HeroSection.module.css';

export default function HeroSection({ data = {}, readyToEnter = true }) {
  const prefersReducedMotion = useReducedMotion();
  const [scrollY, setScrollY] = useState(0);

  const {
    greeting = "Hi, I'm",
    fullName = '',
    role = '',
    shortIntro = '',
    backdropWord = 'DEV',
    portraitUrl = '',
    availabilityText = '',
    locationText = '',
    stats = [],
  } = data || {};

  const [imageLoaded, setImageLoaded] = useState(() => !portraitUrl);
  const [entered, setEntered] = useState(false);

  // Wait for portrait image to fully load and decode
  useEffect(() => {
    if (!portraitUrl) return undefined;

    let active = true;
    const img = new Image();
    img.src = portraitUrl;

    const markLoaded = () => {
      if (!active) return;
      setImageLoaded(true);
    };

    if (img.complete) {
      if (typeof img.decode === 'function') {
        img.decode().then(markLoaded).catch(markLoaded);
      } else {
        Promise.resolve().then(markLoaded);
      }
    } else {
      img.onload = () => {
        if (typeof img.decode === 'function') {
          img.decode().then(markLoaded).catch(markLoaded);
        } else {
          markLoaded();
        }
      };
      img.onerror = markLoaded;
    }

    return () => {
      active = false;
    };
  }, [portraitUrl]);

  // Trigger Hero & Portrait entrance animations once both the image is decoded AND the Entrance Gate begins opening
  useEffect(() => {
    if (!imageLoaded || !readyToEnter) return undefined;

    const rafId = requestAnimationFrame(() => {
      setEntered(true);
    });

    return () => cancelAnimationFrame(rafId);
  }, [imageLoaded, readyToEnter]);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY < window.innerHeight * 1.2) {
            setScrollY(window.scrollY);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  const rawName = String(fullName || 'John Christian Isaac A. Gacosta').trim();
  const nameParts = rawName.split(/\s+/);
  let firstName = '';
  let restName = '';

  if (nameParts.length <= 2) {
    firstName = nameParts[0] || 'JOHN';
    restName = nameParts.slice(1).join(' ');
  } else {
    // For full names like "John Christian Isaac A. Gacosta", split cleanly across two stacked display lines
    const splitIndex = Math.ceil(nameParts.length / 2);
    firstName = nameParts.slice(0, splitIndex).join(' ');
    restName = nameParts.slice(splitIndex).join(' ');
  }

  const devParallaxY = prefersReducedMotion ? 0 : scrollY * 0.18;
  const portraitParallaxY = prefersReducedMotion ? 0 : scrollY * 0.07;

  return (
    <section
      id="hero"
      className={`${styles.heroSection} ${entered ? styles.entered : ''}`}
      aria-label="Introduction and Hero"
    >
      {/* Plane 0 & 2: Subtle Flowing Wave Ribbons */}
      <FlowingWaves variant="dark" />

      {/* Top Coordinate Strip */}
      <div className={styles.topStrip}>
        <div className={styles.topStripLeft}>
          <span className={styles.metaCode}>LOCATION // 00</span>
          <span className={styles.metaDivider}>—</span>
          <span className={styles.metaLabel}>{locationText || 'MANILA // WORLDWIDE'}</span>
        </div>
        <div className={styles.topStripRight}>
          <span className={styles.statusDot} aria-hidden="true" />
          <span className={styles.metaLabel}>{availabilityText}</span>
        </div>
      </div>

      {/* Plane 1: Oversized Full-Viewport "DEV" Typographic Monument */}
      <div
        className={styles.monumentBackdrop}
        style={{
          transform: `translate3d(0, ${devParallaxY}px, 0)`,
        }}
        aria-hidden="true"
      >
        <span className={styles.monumentWord}>{backdropWord || 'DEV'}</span>
        <span className={styles.monumentWordOutline}>{backdropWord || 'DEV'}</span>
      </div>

      {/* Main Layered Stage (Portrait + Foreground Editorial Lockup) */}
      <div className={styles.stageContainer}>
        {/* Left Editorial Identity Column */}
        <div className={styles.identityColumn}>
          <div className={styles.greetingWrapper}>
            <span className={styles.handwrittenGreeting}>{greeting}</span>
          </div>

          <h1 className={styles.fullName}>
            <span className={styles.nameLine}>
              <span className={styles.nameRevealInner}>{firstName}</span>
            </span>
            {restName && (
              <span className={styles.nameLine}>
                <span className={`${styles.nameRevealInner} ${styles.delay1}`}>
                  {restName}
                </span>
              </span>
            )}
          </h1>

          <div className={styles.roleTagRow}>
            <span className={styles.roleRule} aria-hidden="true" />
            <p className={styles.roleTitle}>{role}</p>
          </div>

          <p className={styles.shortIntro}>{shortIntro}</p>

          <div className={styles.ctaRow}>
            <a href="#projects" className={styles.primaryCta}>
              <span>SELECTED WORK</span>
              <span className={styles.ctaArrow}>↘</span>
            </a>
            <a href="#thought-process" className={styles.secondaryCta}>
              <span>THOUGHT PROCESS</span>
            </a>
          </div>
        </div>

        {/* Plane 3: Center-Right Cutout Portrait */}
        <div
          className={styles.portraitColumn}
          style={{
            transform: `translate3d(0, ${portraitParallaxY}px, 0)`,
          }}
        >
          <div className={styles.portraitFrame}>
            {imageLoaded && (
              <img
                src={portraitUrl}
                alt={`${fullName} portrait`}
                loading="eager"
                decoding="async"
                className={styles.portraitImg}
              />
            )}
            <div className={styles.portraitBottomVignette} aria-hidden="true" />
          </div>
        </div>

        {/* Right Architectural Metrics Column (Reference 3 Inspired) */}
        {Array.isArray(stats) && stats.length > 0 && (
          <aside className={styles.metricsColumn} aria-label="Key highlights">
            {stats.map((stat, idx) => (
              <div key={idx} className={styles.metricItem}>
                <span className={styles.metricValue}>{stat.value}</span>
                <span className={styles.metricLabel}>{stat.label}</span>
              </div>
            ))}

            <div className={styles.scrollCue}>
              <span className={styles.scrollCueText}>SCROLL TO EXPLORE</span>
              <span className={styles.scrollCueLine} aria-hidden="true" />
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}

