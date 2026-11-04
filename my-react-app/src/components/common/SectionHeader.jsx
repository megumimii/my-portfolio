/**
 * SectionHeader Component
 *
 * Architectural section header combining:
 * - Monospace index coordinate (`01 // IDENTITY`)
 * - Bold geometric display heading
 * - Optional expressive handwritten annotation
 * - Optional right-side summary or control slot
 */
import { useIntersectionObserver } from '../../utils/observerUtils';
import styles from './SectionHeader.module.css';

export default function SectionHeader({
  indexLabel = '01 // SECTION',
  title,
  handwrittenNote = '',
  subtitle = '',
  theme = 'dark',
  rightSlot = null,
}) {
  const [headerRef, isVisible] = useIntersectionObserver({
    once: true,
    threshold: 0.15,
  });

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${styles[theme]} ${isVisible ? styles.visible : ''}`}
    >
      <div className={styles.topMetaRow}>
        <span className={styles.indexLabel}>{indexLabel}</span>
        <div className={styles.hairlineRule} aria-hidden="true" />
        {handwrittenNote && (
          <span className={styles.handwrittenNote}>{handwrittenNote}</span>
        )}
      </div>

      <div className={styles.mainRow}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {rightSlot && <div className={styles.rightSlot}>{rightSlot}</div>}
      </div>
    </header>
  );
}

