/**
 * Reusable SearchBar Component (Per AGENTS.md)
 *
 * Crisp architectural input with monospace label prefix, clear button,
 * and dark/light surface support. Paired with `useDebounce` by consumers.
 */
import styles from './SearchBar.module.css';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'SEARCH ARCHIVE...',
  theme = 'dark',
  ariaLabel = 'Search items',
  className = '',
}) {
  return (
    <div className={`${styles.searchContainer} ${styles[theme]} ${className}`}>
      <span className={styles.prefix} aria-hidden="true">
        //
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={styles.input}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className={styles.clearButton}
          aria-label="Clear search query"
        >
          [ESC]
        </button>
      )}
    </div>
  );
}

