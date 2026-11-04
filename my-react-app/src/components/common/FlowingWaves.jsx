/**
 * FlowingWaves Component
 *
 * Renders layered, organic SVG Bezier wave ribbons and subtle flowing contours.
 * Supports:
 * - `variant="dark"` (Subtle translucent white/gray ribbons on #0A0A0A canvas — Ref 1)
 * - `variant="light"` (Layered soft-gray silk waves on #FFFFFF canvas — Ref 2)
 * - `variant="quote"` (Compact wave treatment for the 20% White Quote Rail)
 */
import styles from './FlowingWaves.module.css';

export default function FlowingWaves({ variant = 'dark', className = '' }) {
  if (variant === 'light' || variant === 'quote') {
    return (
      <div
        className={`${styles.waveContainer} ${styles[variant]} ${className}`}
        aria-hidden="true"
      >
        <svg
          className={styles.waveSvg}
          viewBox="0 0 1920 1080"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`lw1-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#D4D4D8" stopOpacity="0.6" />
              <stop offset="50%" stop-color="#71717A" stopOpacity="0.26" />
              <stop offset="100%" stop-color="#E4E4E7" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id={`lw2-${variant}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#A1A1AA" stopOpacity="0.38" />
              <stop offset="55%" stop-color="#52525B" stopOpacity="0.16" />
              <stop offset="100%" stop-color="#F4F4F5" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id={`lw3-${variant}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#71717A" stopOpacity="0.2" />
              <stop offset="60%" stop-color="#D4D4D8" stopOpacity="0.45" />
              <stop offset="100%" stop-color="#A1A1AA" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <path
            className={styles.wavePathSlow}
            d="M-140 720 C 320 390, 690 1040, 1160 660 C 1510 380, 1760 560, 2060 280 L 2060 1080 L -140 1080 Z"
            fill={`url(#lw1-${variant})`}
          />
          <path
            className={styles.wavePathMedium}
            d="M-140 850 C 280 590, 810 990, 1280 590 C 1630 310, 1840 480, 2060 400 L 2060 1080 L -140 1080 Z"
            fill={`url(#lw2-${variant})`}
          />
          <path
            className={styles.wavePathFast}
            d="M-140 600 C 440 930, 880 370, 1400 710 C 1710 910, 1890 620, 2060 520 L 2060 1080 L -140 1080 Z"
            fill={`url(#lw3-${variant})`}
          />
          <path
            d="M-140 680 C 370 440, 750 960, 1240 630 C 1580 390, 1800 530, 2060 320"
            stroke="#71717A"
            strokeOpacity="0.28"
            strokeWidth="1.4"
          />
          <path
            d="M-140 810 C 320 960, 830 450, 1360 730 C 1690 900, 1850 600, 2060 470"
            stroke="#A1A1AA"
            strokeOpacity="0.38"
            strokeWidth="1"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`${styles.waveContainer} ${styles.dark} ${className}`}
      aria-hidden="true"
    >
      <svg
        className={styles.waveSvg}
        viewBox="0 0 1920 1080"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="dwRibbon1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stopOpacity="0.07" />
            <stop offset="50%" stop-color="#A1A1AA" stopOpacity="0.025" />
            <stop offset="100%" stop-color="#FFFFFF" stopOpacity="0.09" />
          </linearGradient>
          <linearGradient id="dwRibbon2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#71717A" stopOpacity="0.11" />
            <stop offset="60%" stop-color="#27272A" stopOpacity="0.04" />
            <stop offset="100%" stop-color="#FAFAFA" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <path
          className={styles.wavePathSlow}
          d="M-200 180 C 360 520, 940 640, 2120 880 L 2120 1020 C 890 760, 310 620, -200 320 Z"
          fill="url(#dwRibbon1)"
        />
        <path
          className={styles.wavePathMedium}
          d="M 420 -140 C 350 280, 810 560, 2100 660 L 2100 540 C 910 440, 500 170, 580 -140 Z"
          fill="url(#dwRibbon2)"
        />
        <path
          d="M-160 640 C 420 340, 1080 940, 2080 420"
          stroke="#3F3F46"
          strokeOpacity="0.38"
          strokeWidth="1"
        />
        <path
          d="M-160 730 C 490 420, 1140 980, 2080 510"
          stroke="#27272A"
          strokeOpacity="0.55"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

