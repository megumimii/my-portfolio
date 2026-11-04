/**
 * Reusable Formatting Utilities (DRY Principle)
 * Editorial index numbers, dates, timestamps, and string slugs.
 */

/**
 * Formats an integer into a zero-padded two-digit editorial index ('01', '02', ...).
 * @param {number} index - 1-based or 0-based number
 * @returns {string}
 */
export function formatEditorialIndex(index) {
  const num = Number(index);
  if (!Number.isFinite(num) || num < 0) return '00';
  return String(num).padStart(2, '0');
}

/**
 * Converts a Firestore Timestamp, Date, or ISO string into a readable editorial date.
 * @param {any} value
 * @returns {string}
 */
export function formatDate(value) {
  if (!value) return '—';
  try {
    let dateObj;
    if (typeof value?.toDate === 'function') {
      dateObj = value.toDate();
    } else if (typeof value?.seconds === 'number') {
      dateObj = new Date(value.seconds * 1000);
    } else {
      dateObj = new Date(value);
    }

    if (Number.isNaN(dateObj.getTime())) return '—';

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(dateObj);
  } catch {
    return '—';
  }
}

/**
 * Formats a Firestore Timestamp or Date with time for the Admin Messages & Activity log.
 * @param {any} value
 * @returns {string}
 */
export function formatDateTime(value) {
  if (!value) return 'Just now';
  try {
    let dateObj;
    if (typeof value?.toDate === 'function') {
      dateObj = value.toDate();
    } else if (typeof value?.seconds === 'number') {
      dateObj = new Date(value.seconds * 1000);
    } else {
      dateObj = new Date(value);
    }

    if (Number.isNaN(dateObj.getTime())) return 'Just now';

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch {
    return 'Just now';
  }
}

/**
 * Generates a URL/storage-safe slug from any string.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

