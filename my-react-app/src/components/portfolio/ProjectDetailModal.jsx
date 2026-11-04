/**
 * Dedicated Project Case Study Modal (`<ProjectDetailModal />`)
 *
 * Displays:
 * - Cover image & interactive screenshot gallery switcher
 * - Full detailed project description
 * - Technology stack tags
 * - GitHub repository link, Live deployment link, and custom links
 */
import { useState, useEffect } from 'react';
import ModalOverlay from '../common/ModalOverlay';
import ImageWithFallback from '../common/ImageWithFallback';
import styles from './ProjectDetailModal.module.css';

export default function ProjectDetailModal({ project, onClose }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [project?.id]);

  if (!project) return null;

  const allMedia = [
    ...(project.coverImageUrl
      ? [{ url: project.coverImageUrl, caption: `${project.title} — Primary View` }]
      : []),
    ...(Array.isArray(project.screenshots) ? project.screenshots : []),
  ];

  const currentMedia = allMedia[activeImageIndex] || {
    url: '/assets/project-placeholder.svg',
    caption: project.title,
  };

  return (
    <ModalOverlay
      isOpen={Boolean(project)}
      onClose={onClose}
      title={`PROJECT // ${project.category || 'OVERVIEW'}`}
      subtitle={project.title}
      maxWidth="1120px"
    >
      <div className={styles.modalLayout}>
        {/* Top Hero Image & Screenshot Gallery Switcher */}
        <div className={styles.gallerySection}>
          <div className={styles.stageImageFrame}>
            <ImageWithFallback
              src={currentMedia.url}
              fallbackType="project"
              alt={currentMedia.caption || project.title}
              className={styles.stageImage}
            />
            {currentMedia.caption && (
              <div className={styles.captionBar}>
                <span>FIG. {String(activeImageIndex + 1).padStart(2, '0')} //</span>
                <span>{currentMedia.caption}</span>
              </div>
            )}
          </div>

          {allMedia.length > 1 && (
            <div className={styles.thumbnailStrip} role="tablist" aria-label="Project screenshots">
              {allMedia.map((media, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeImageIndex}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`${styles.thumbButton} ${
                    idx === activeImageIndex ? styles.thumbActive : ''
                  }`}
                >
                  <ImageWithFallback
                    src={media.url}
                    fallbackType="project"
                    alt={media.caption || `Screenshot ${idx + 1}`}
                    className={styles.thumbImage}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom 8:4 Split Details & Metadata */}
        <div className={styles.contentSplit}>
          <div className={styles.narrativeCol}>
            <div className={styles.titleBlock}>
              {project.featured && (
                <span className={styles.featuredBadge}>★ FEATURED PROJECT</span>
              )}
              <h2 className={styles.projectTitle}>{project.title}</h2>
              <p className={styles.leadText}>{project.shortDescription}</p>
            </div>

            <div className={styles.divider} />

            <div className={styles.detailedSection}>
              <h3 className={styles.sectionHeading}>
                01 // OVERVIEW & IMPLEMENTATION
              </h3>
              <div className={styles.detailedCopy}>
                {String(project.detailedDescription || project.shortDescription)
                  .split('\n')
                  .filter(Boolean)
                  .map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
              </div>
            </div>
          </div>

          <aside className={styles.sidebarCol}>
            {/* Links Block */}
            <div className={styles.sidebarBox}>
              <h4 className={styles.sidebarHeading}>DEPLOYMENT & SOURCE</h4>
              <div className={styles.linkButtons}>
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.primaryAction}
                  >
                    <span>LAUNCH LIVE PROJECT</span>
                    <span>↗</span>
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.secondaryAction}
                  >
                    <span>GITHUB REPOSITORY</span>
                    <span>↗</span>
                  </a>
                )}
                {(Array.isArray(project.customLinks) ? project.customLinks : []).map(
                  (link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.secondaryAction}
                    >
                      <span>{link.label}</span>
                      <span>↗</span>
                    </a>
                  )
                )}
                {!project.liveUrl &&
                  !project.githubUrl &&
                  (!project.customLinks || project.customLinks.length === 0) && (
                    <p className={styles.noLinksNote}>
                      Private or internal deployment — request a walkthrough via the contact section.
                    </p>
                  )}
              </div>
            </div>

            {/* Technology Tags */}
            <div className={styles.sidebarBox}>
              <h4 className={styles.sidebarHeading}>TECHNOLOGY STACK</h4>
              <div className={styles.techGrid}>
                {(Array.isArray(project.techTags) ? project.techTags : []).map(
                  (tag, idx) => (
                    <span key={idx} className={styles.techBadge}>
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </ModalOverlay>
  );
}

