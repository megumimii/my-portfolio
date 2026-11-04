/**
 * Reusable FilterChips Component (Per AGENTS.md)
 *
 * Uses crisp architectural rectangles (`0px`–`2px` radius) instead of generic
 * pill containers, maintaining the Anti-UI Slop aesthetic.
 */
import styles from './FilterChips.module.css';

export default function FilterChips({
  options = [],
  activeValue = 'ALL',
  onSelect,
  theme = 'dark',
  ariaLabel = 'Filter items by category',
}) {
  if (!Array.isArray(options) || options.length === 0) return null;

  return (
    <div
      className={`${styles.chipGroup} ${styles[theme]}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const value = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const count = typeof opt === 'object' ? opt.count : undefined;
        const isActive = activeValue === value;

        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(value)}
            className={`${styles.chip} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.chipLabel}>{label}</span>
            {count !== undefined && (
              <span className={styles.chipCount}>
                [{String(count).padStart(2, '0')}]
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

