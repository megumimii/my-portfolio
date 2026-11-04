/**
 * Reusable ConfirmationModal Component for Admin CMS
 *
 * Replaces browser native window.confirm() / alert() with an authored,
 * accessible monochrome confirmation dialog consistent with the design system.
 */
import ModalOverlay from '../common/ModalOverlay';
import styles from './ConfirmationModal.module.css';

export default function ConfirmationModal({
  isOpen,
  title = 'CONFIRM ACTION',
  subtitle = 'IRREVERSIBLE OPERATION',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'CONFIRM & PROCEED',
  cancelLabel = 'CANCEL [ESC]',
  isDestructive = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={loading ? undefined : onCancel}
      title={title}
      subtitle={subtitle}
      maxWidth="520px"
    >
      <div className={styles.modalContent}>
        <div className={styles.messageBox}>
          <p className={styles.messageText}>{message}</p>
        </div>

        <div className={styles.actionsRow}>
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className={styles.cancelBtn}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`${styles.confirmBtn} ${
              isDestructive ? styles.destructive : ''
            }`}
          >
            {loading ? 'PROCESSING...' : confirmLabel}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

