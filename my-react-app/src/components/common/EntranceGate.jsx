/**
 * High-Tech Minimalist Entrance Gate (`<EntranceGate />`)
 *
 * Full-viewport containment blast shutter that remains closed while site assets,
 * fonts, and Firestore data initialize:
 * - Desktop (> 768px): Horizontal split (Top & Bottom blast shutters parting vertically)
 * - Mobile (<= 768px): Vertical split (Left & Right blast doors parting horizontally)
 * - Features monochrome architectural hazard strips along the interlocking seam,
 *   a live telemetry loading indicator, and a pressurized <canvas> smoke plume on release.
 * - Unmounts completely from the DOM (`return null`) once open to guarantee zero CLS.
 */
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useSitePreloader } from '../../hooks/useSitePreloader';
import styles from './EntranceGate.module.css';

function createSmokeParticles(width, height, isMobile) {
  const count = isMobile ? 40 : 54;
  const particles = [];

  for (let i = 0; i < count; i += 1) {
    const spreadRatio = (i + Math.random()) / count;
    const baseRadius = (isMobile ? Math.min(width, height) : Math.max(width, height)) * (0.045 + Math.random() * 0.065);

    if (isMobile) {
      // Vertical seam at x = width / 2
      const x = width * 0.5 + (Math.random() - 0.5) * 18;
      const y = spreadRatio * height;
      const dirX = i % 2 === 0 ? -1 : 1;
      particles.push({
        x,
        y,
        vx: dirX * (1.4 + Math.random() * 3.6),
        vy: (Math.random() - 0.5) * 1.6,
        radius: baseRadius * 0.65,
        growth: 0.9 + Math.random() * 1.35,
        alpha: 0.11 + Math.random() * 0.09,
        decay: 0.968 + Math.random() * 0.014,
        turbulencePhase: Math.random() * Math.PI * 2,
      });
    } else {
      // Horizontal seam at y = height / 2
      const x = spreadRatio * width;
      const y = height * 0.5 + (Math.random() - 0.5) * 18;
      const dirY = i % 2 === 0 ? -1 : 1;
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.8,
        vy: dirY * (1.5 + Math.random() * 3.8),
        radius: baseRadius * 0.65,
        growth: 1.05 + Math.random() * 1.5,
        alpha: 0.11 + Math.random() * 0.09,
        decay: 0.968 + Math.random() * 0.014,
        turbulencePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  return particles;
}

export default function EntranceGate({
  dataLoading = false,
  imageUrls = [],
  onGateOpening,
  onGateUnmounted,
}) {
  const prefersReducedMotion = useReducedMotion();
  const { progress, isReady } = useSitePreloader({
    dataLoading,
    imageUrls,
    minHoldMs: prefersReducedMotion ? 250 : 650,
    maxTimeoutMs: 3800,
  });

  // Phases: 'loading' -> 'unlocking' -> 'opening' -> 'unmounted'
  const [phase, setPhase] = useState('loading');
  const canvasRef = useRef(null);
  const openingCallbackFiredRef = useRef(false);

  // Advance state machine once preloader reaches 100%
  useEffect(() => {
    if (!isReady || phase !== 'loading') return undefined;

    const unlockTimer = setTimeout(() => {
      setPhase('unlocking');
    }, 80);

    return () => clearTimeout(unlockTimer);
  }, [isReady, phase]);

  // Transition from 'unlocking' (seam pressurization) -> 'opening' (shutter slide + smoke)
  useEffect(() => {
    if (phase !== 'unlocking') return undefined;

    const openDelay = prefersReducedMotion ? 40 : 220;
    const openTimer = setTimeout(() => {
      setPhase('opening');
      if (!openingCallbackFiredRef.current) {
        openingCallbackFiredRef.current = true;
        onGateOpening?.();
      }
    }, openDelay);

    return () => clearTimeout(openTimer);
  }, [phase, prefersReducedMotion, onGateOpening]);

  // Transition from 'opening' -> 'unmounted' (complete DOM removal)
  useEffect(() => {
    if (phase !== 'opening') return undefined;

    const unmountDelay = prefersReducedMotion ? 250 : 1250;
    const unmountTimer = setTimeout(() => {
      setPhase('unmounted');
      onGateUnmounted?.();
    }, unmountDelay);

    return () => clearTimeout(unmountTimer);
  }, [phase, prefersReducedMotion, onGateUnmounted]);

  // Lock page scroll while gate is closed; release as soon as gate starts opening
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    if (phase === 'loading' || phase === 'unlocking') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);

  // Render pressurized decompression smoke on <canvas> during 'unlocking' & 'opening'
  useEffect(() => {
    if (
      prefersReducedMotion ||
      (phase !== 'unlocking' && phase !== 'opening')
    ) {
      return undefined;
    }

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const isMobile = width <= 768;
    const particles = createSmokeParticles(width, height, isMobile);
    let rafId = null;
    let frame = 0;

    const renderSmoke = () => {
      frame += 1;
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        if (p.alpha <= 0.004) continue;
        aliveCount += 1;

        p.x += p.vx + Math.sin(frame * 0.04 + p.turbulencePhase) * 0.45;
        p.y += p.vy + Math.cos(frame * 0.04 + p.turbulencePhase) * 0.45;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.radius += p.growth;
        p.alpha *= p.decay;

        const grad = ctx.createRadialGradient(
          p.x,
          p.y,
          p.radius * 0.08,
          p.x,
          p.y,
          p.radius
        );
        grad.addColorStop(0, `rgba(250, 250, 250, ${p.alpha.toFixed(3)})`);
        grad.addColorStop(
          0.45,
          `rgba(161, 161, 170, ${(p.alpha * 0.52).toFixed(3)})`
        );
        grad.addColorStop(1, 'rgba(10, 10, 10, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (aliveCount > 0) {
        rafId = requestAnimationFrame(renderSmoke);
      }
    };

    rafId = requestAnimationFrame(renderSmoke);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [phase, prefersReducedMotion]);

  // Remove completely from DOM once finished to prevent any layout shift or memory overhead
  if (phase === 'unmounted') {
    return null;
  }

  const formattedProgress = String(progress).padStart(3, '0');
  const statusLabel =
    phase === 'loading'
      ? 'INITIALIZING PORTFOLIO'
      : 'ACCESS GRANTED // OPENING';

  return (
    <div
      className={`${styles.gateViewport} ${
        phase === 'unlocking' ? styles.unlocking : ''
      } ${phase === 'opening' ? styles.opening : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading portfolio: ${progress}%`}
    >
      {/* Top Shutter (Desktop) / Left Door (Mobile) */}
      <div className={`${styles.gatePanel} ${styles.panelA}`}>
        <div className={styles.panelSurface}>
          <div className={styles.panelCornerTop}>
            <span className={styles.cornerCross}>+</span>
            <span className={styles.metaCode}>GATE // SEC-01.A</span>
            <span className={styles.metaCode}>SYSTEM INITIALIZATION</span>
          </div>

          <div className={styles.structuralWatermark} aria-hidden="true">
            SYS // 01
          </div>

          {/* Monochrome Hazard Strip Channel along the Interlocking Seam */}
          <div className={styles.hazardEdge} aria-hidden="true">
            <div className={styles.hazardLabelRow}>
              <span>CAUTION // SECURE ACCESS SEAM</span>
              <span>CLEARANCE LEVEL // 00</span>
            </div>
            <div className={styles.hazardStripeBar} />
          </div>
        </div>
      </div>

      {/* Bottom Shutter (Desktop) / Right Door (Mobile) */}
      <div className={`${styles.gatePanel} ${styles.panelB}`}>
        <div className={styles.panelSurface}>
          {/* Monochrome Hazard Strip Channel along the Interlocking Seam */}
          <div className={styles.hazardEdge} aria-hidden="true">
            <div className={styles.hazardStripeBar} />
            <div className={styles.hazardLabelRow}>
              <span>MECHANICAL INTERLOCK // ACTIVE</span>
              <span>JOHN CHRISTIAN ISAAC // 2026</span>
            </div>
          </div>

          <div className={styles.structuralWatermark} aria-hidden="true">
            LOCK // 02
          </div>

          <div className={styles.panelCornerBottom}>
            <span className={styles.metaCode}>STATUS: READY</span>
            <span className={styles.metaCode}>GATE // SEC-01.B</span>
            <span className={styles.cornerCross}>+</span>
          </div>
        </div>
      </div>

      {/* Central Seam Filament Line */}
      <div className={styles.seamLine} aria-hidden="true">
        <div
          className={styles.seamProgressFill}
          style={{
            '--seam-progress': `${progress}%`,
          }}
        />
      </div>

      {/* Subtle Pressurized Smoke Plume Canvas */}
      <canvas
        ref={canvasRef}
        className={styles.smokeCanvas}
        aria-hidden="true"
      />

      {/* Central Minimalist Lock & Loading Indicator */}
      <div className={styles.lockModule}>
        <div className={styles.lockHeader}>
          <span className={styles.lockTag}>GATE // 00</span>
          <span className={styles.lockStateBadge}>
            {phase === 'loading' ? 'LOCKED' : 'RELEASED'}
          </span>
        </div>

        <div className={styles.progressReadoutRow}>
          <span className={styles.progressNumber}>{formattedProgress}</span>
          <span className={styles.progressUnit}>%</span>
        </div>

        <div className={styles.progressBarTrack} aria-hidden="true">
          <div
            className={styles.progressBarFill}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className={styles.lockFooter}>
          <span className={styles.statusText}>{statusLabel}</span>
        </div>
      </div>
    </div>
  );
}

