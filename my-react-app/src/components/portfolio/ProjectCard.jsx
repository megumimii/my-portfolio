/**
 * Editorial Project Item Component (`<ProjectCard />`)
 *
 * Rejects uniform SaaS card grids in favor of varying editorial compositions:
 * - `variant="featured"` (Full-bleed 12-col asymmetric 7:5 editorial feature spread)
 * - `variant="wide"` (7-col cinematic landscape composition)
 * - `variant="tall"` (5-col offset portrait/editorial composition)
 */
import ImageWithFallback from '../common/ImageWithFallback';
import { formatEditorialIndex } from '../../utils/formatters';
import { useIntersectionObserver } from '../../utils/observerUtils';
import styles from './ProjectCard.module.css';

export default function ProjectCard({
  project,
  index = 1,
  variant = 'wide',
  reversed = false,
  onSelect,
}) {
  const [cardRef, isVisible] = useIntersectionObserver({
    once: true,
    threshold: 0.12,
  });

  if (!project) return null;

  const formattedIndex = formatEditorialIndex(index);
  const tags = Array.isArray(project.techTags) ? project.techTags : [];

  return (
    <article
      ref={cardRef}
      className={`${styles.projectEntry} ${styles[variant]} ${
        reversed ? styles.reversed : ''
      } ${isVisible ? styles.visible : ''}`}
    >
      {/* Image Plane */}
      <div
        className={styles.mediaColumn}
        onClick={() => onSelect?.(project)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.(project);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Inspect project details for ${project.title}`}
      >
        <div className={styles.imageFrame}>
          <ImageWithFallback
            src={project.coverImageUrl}
            fallbackType="project"
            alt={project.title}
            className={styles.coverImageWrapper}
            imgClassName={styles.coverImage}
          />
          <div className={styles.imageOverlay}>
            <span className={styles.inspectBadge}>VIEW PROJECT ↗</span>
          </div>
        </div>
      </div>

      {/* Editorial Information Plane */}
      <div className={styles.infoColumn}>
        <div className={styles.topMeta}>
          <div className={styles.indexAndCategory}>
            <span className={styles.indexNumber}>{formattedIndex}</span>
            <span className={styles.metaSeparator}>//</span>
            <span className={styles.categoryLabel}>
              {project.category || 'SOFTWARE ENGINEERING'}
            </span>
          </div>

          {project.featured && (
            <span className={styles.featuredStamp}>★ FEATURED</span>
          )}
        </div>

        <h3 className={styles.projectTitle}>
          <button
            type="button"
            onClick={() => onSelect?.(project)}
            className={styles.titleTrigger}
          >
            {project.title}
          </button>
        </h3>

        <p className={styles.shortDesc}>{project.shortDescription}</p>

        {/* Technology Tags in Minimalist Monospace Brackets */}
        {tags.length > 0 && (
          <ul className={styles.tagList} aria-label="Technologies used">
            {tags.slice(0, 6).map((tag, i) => (
              <li key={i} className={styles.tagItem}>
                [{tag}]
              </li>
            ))}
            {tags.length > 6 && (
              <li className={styles.tagItem}>+{tags.length - 6} MORE</li>
            )}
          </ul>
        )}

        {/* Action Row */}
        <div className={styles.actionRow}>
          <button
            type="button"
            onClick={() => onSelect?.(project)}
            className={styles.caseStudyBtn}
          >
            <span>VIEW DETAILS</span>
            <span className={styles.arrow}>→</span>
          </button>

          <div className={styles.externalLinks}>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.extLink}
              >
                LIVE DEMO ↗
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.extLink}
              >
                SOURCE CODE ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

