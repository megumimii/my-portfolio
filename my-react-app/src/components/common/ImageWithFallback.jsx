/**
 * ImageWithFallback Component
 *
 * Ensures missing manual assets (e.g., `/assets/portrait.webp`) or broken URLs
 * automatically fall back to curated monochrome SVG art without layout shift.
 */
import { useState } from 'react';
import styles from './ImageWithFallback.module.css';

const FALLBACK_MAP = {
  portrait: '/assets/portrait-fallback.svg',
  project: '/assets/project-placeholder.svg',
  interest: '/assets/interest-placeholder.svg',
};

export default function ImageWithFallback({
  src,
  fallbackType = 'project',
  customFallbackSrc = '',
  alt = '',
  className = '',
  imgClassName = '',
  loading = 'lazy',
  onLoad,
  ...rest
}) {
  const fallbackUrl =
    customFallbackSrc || FALLBACK_MAP[fallbackType] || FALLBACK_MAP.project;

  const [hasError, setHasError] = useState(false);

  // Directly derive the active image source during render
  const effectiveSrc = hasError ? fallbackUrl : (src || fallbackUrl);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  return (
    <div className={`${styles.wrapper} ${className}`} {...rest}>
      <img
        key={src || fallbackUrl}
        src={effectiveSrc}
        alt={alt}
        loading={loading}
        onLoad={onLoad}
        onError={handleError}
        className={`${styles.image} ${imgClassName}`}
      />
    </div>
  );
}

