/**
 * Playful & Expressive Interest / Hobby Specimen Component (`<InterestItem />`)
 *
 * Noticeably different presentation from Projects:
 * - Designed for the luminous white & soft-gray wave backdrop
 * - Uses an editorial "Field Notes / Personal Artifact" layout with:
 *   - Handwritten specimen numbering & rotated Polaroid/film frame
 *   - Flexible Custom Attributes Key-Value ledger (e.g. Current Rotation, Platform, PR)
 *   - Expandable multi-image filmstrip
 *   - Custom freeform tags & external links
 */
import { useState } from 'react';
import ImageWithFallback from '../common/ImageWithFallback';
import { formatEditorialIndex } from '../../utils/formatters';
import { useIntersectionObserver } from '../../utils/observerUtils';
import styles from './InterestItem.module.css';

export default function InterestItem({ interest, index = 1 }) {
  const [itemRef, isVisible] = useIntersectionObserver({
    once: true,
    threshold: 0.15,
  });

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!interest) return null;

  const allPhotos = [
    ...(interest.coverImageUrl
      ? [{ url: interest.coverImageUrl, caption: interest.title }]
      : []),
    ...(Array.isArray(interest.images) ? interest.images : []),
  ];

  const currentPhoto = allPhotos[activePhotoIdx] || {
    url: '/assets/interest-placeholder.svg',
    caption: interest.title,
  };

  const attributes = Array.isArray(interest.customAttributes)
    ? interest.customAttributes
    : [];
  const tags = Array.isArray(interest.customTags) ? interest.customTags : [];
  const links = Array.isArray(interest.links) ? interest.links : [];

  return (
    <article
      ref={itemRef}
      className={`${styles.specimenCard} ${
        index % 2 === 0 ? styles.evenTilt : styles.oddTilt
      } ${isVisible ? styles.visible : ''}`}
    >
      {/* Top Specimen Tape & Handwritten Note */}
      <div className={styles.specimenHeader}>
        <span className={styles.specimenCode}>
          ENTRY // {formatEditorialIndex(index)}
        </span>
        {interest.subtitle && (
          <span className={styles.handwrittenSubtitle}>{interest.subtitle}</span>
        )}
      </div>

      {/* Tactile Visual Frame + Filmstrip */}
      <div className={styles.visualBlock}>
        <div className={styles.photoFrame}>
          <ImageWithFallback
            src={currentPhoto.url}
            fallbackType="interest"
            alt={currentPhoto.caption || interest.title}
            className={styles.photoWrapper}
            imgClassName={styles.photoImg}
          />
        </div>

        {allPhotos.length > 1 && (
          <div className={styles.filmstrip} aria-label="Additional hobby photos">
            {allPhotos.map((photo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhotoIdx(idx)}
                className={`${styles.filmThumb} ${
                  idx === activePhotoIdx ? styles.filmThumbActive : ''
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <ImageWithFallback
                  src={photo.url}
                  fallbackType="interest"
                  alt={photo.caption || `${interest.title} ${idx + 1}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editorial Narrative & Custom Metadata Ledger */}
      <div className={styles.bodyBlock}>
        <h3 className={styles.title}>{interest.title}</h3>
        <p className={styles.description}>{interest.description}</p>

        {/* Flexible Custom Metadata / Attributes Table */}
        {attributes.length > 0 && (
          <dl className={styles.attributesLedger}>
            {attributes.map((attr, idx) => (
              <div key={idx} className={styles.attributeRow}>
                <dt className={styles.attrKey}>{attr.key}</dt>
                <dd className={styles.attrValue}>{attr.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* Custom Tags & Optional Links */}
        <div className={styles.footerMeta}>
          {tags.length > 0 && (
            <div className={styles.tagCluster}>
              {tags.map((tag, idx) => (
                <span key={idx} className={styles.customTag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {links.length > 0 && (
            <div className={styles.linksRow}>
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.interestLink}
                >
                  <span>{link.label}</span>
                  <span>↗</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

