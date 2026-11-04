/**
 * Reusable Debounce Utility & React Hook (DRY Principle)
 * Used across search bars, live filters, and preview synchronization.
 */
import { useEffect, useState } from 'react';

/**
 * Standard function debounce utility.
 * @param {Function} fn - Function to debounce
 * @param {number} [delay=300] - Delay in milliseconds
 * @returns {Function} Debounced function with a `.cancel()` method
 */
export function debounce(fn, delay = 300) {
  let timerId = null;

  const debounced = (...args) => {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}

/**
 * React hook that returns a debounced version of a reactive value.
 * @template T
 * @param {T} value - Input value to debounce
 * @param {number} [delay=300] - Debounce delay in ms
 * @returns {T} Debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

