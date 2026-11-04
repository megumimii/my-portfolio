/**
 * Reusable ModalOverlay Component
 *
 * Accessible dialog wrapper supporting Escape key dismissal, backdrop click,
 * body scroll lock, and architectural monochrome framing.
 */
import { useEffect } from 'react';
import styles from './ModalOverlay.module.css';

export default function ModalOverlay({
  isOpen,
  onClose,
  title = 'DETAIL VIEW',
  subtitle = '',
  maxWidth = '1040px',
  children,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={styles.dialog} style={{ maxWidth }}>
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.headerTitle}>{title}</span>
            {subtitle && <span className={styles.headerSubtitle}>// {subtitle}</span>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close modal"
          >
            CLOSE [ESC]
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}

