/**
 * Reusable IntersectionObserver Utility & React Hook (DRY Principle)
 *
 * Allows observing any element, ID, or CSS selector with configurable threshold,
 * rootMargin, and automatic disconnect (`once: true` by default).
 */
import { useEffect, useRef, useState } from 'react';

/**
 * Resolves a target input (string ID/selector, Element, or NodeList/Array) into an array of DOM Elements.
 * @param {string | Element | NodeList | Array<Element>} target
 * @returns {Element[]}
 */
function resolveTargetElements(target) {
  if (!target || typeof document === 'undefined') return [];

  if (typeof target === 'string') {
    const trimmed = target.trim();
    if (!trimmed) return [];
    // Support both raw IDs ("hero-section") and selectors ("#hero-section", ".reveal-card")
    if (!trimmed.startsWith('#') && !trimmed.startsWith('.') && !trimmed.includes(' ') && !trimmed.includes('[')) {
      const byId = document.getElementById(trimmed);
      if (byId) return [byId];
    }
    return Array.from(document.querySelectorAll(trimmed));
  }

  if (target instanceof Element) {
    return [target];
  }

  if (NodeList.prototype.isPrototypeOf(target) || Array.isArray(target)) {
    return Array.from(target).filter((item) => item instanceof Element);
  }

  return [];
}

/**
 * Creates a reusable IntersectionObserver for an ID, class selector, or DOM element(s).
 *
 * @param {string | Element | NodeList | Array<Element>} target - Element, ID, or selector to observe
 * @param {(entry: IntersectionObserverEntry, observer: IntersectionObserver) => void} onIntersect - Callback when target intersects
 * @param {Object} [options]
 * @param {boolean} [options.once=true] - Whether to unobserve the element after first intersection
 * @param {number | number[]} [options.threshold=0.15] - Intersection ratio threshold
 * @param {string} [options.rootMargin='0px 0px -8% 0px'] - Root margin offset
 * @param {Element | null} [options.root=null] - Scroll container root
 * @param {(entry: IntersectionObserverEntry) => void} [options.onExit] - Optional callback when leaving viewport (`once: false`)
 * @returns {() => void} Cleanup function to disconnect the observer
 */
export function createIntersectionObserver(
  target,
  onIntersect,
  {
    once = true,
    threshold = 0.15,
    rootMargin = '0px 0px -8% 0px',
    root = null,
    onExit = null,
  } = {}
) {
  const elements = resolveTargetElements(target);
  if (elements.length === 0) {
    return () => {};
  }

  // Respect reduced motion or environments without IntersectionObserver
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    elements.forEach((el) => onIntersect?.({ target: el, isIntersecting: true }, null));
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onIntersect?.(entry, obs);
          if (once) {
            obs.unobserve(entry.target);
          }
        } else if (!once && onExit) {
          onExit(entry);
        }
      });
    },
    { root, rootMargin, threshold }
  );

  elements.forEach((el) => observer.observe(el));

  return () => {
    observer.disconnect();
  };
}

/**
 * React Hook wrapper around `createIntersectionObserver` for declarative scroll reveals.
 *
 * @param {Object} [options]
 * @param {boolean} [options.once=true]
 * @param {number} [options.threshold=0.15]
 * @param {string} [options.rootMargin='0px 0px -8% 0px']
 * @returns {[import('react').RefObject, boolean]} `[elementRef, isVisible]`
 */
export function useIntersectionObserver({
  once = true,
  threshold = 0.15,
  rootMargin = '0px 0px -8% 0px',
} = {}) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return undefined;

    const cleanup = createIntersectionObserver(
      node,
      () => setIsVisible(true),
      {
        once,
        threshold,
        rootMargin,
        onExit: once ? null : () => setIsVisible(false),
      }
    );

    return cleanup;
  }, [once, threshold, rootMargin]);

  return [elementRef, isVisible];
}

