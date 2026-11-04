/**
 * B. AboutSection Component
 *
 * Uses an asymmetrical 12-column editorial layout instead of a conventional
 * profile card. Features:
 * - Sticky 4-column editorial pull-statement & personal index
 * - 8-column narrative grid covering Personal Background, History & Journey,
 *   Educational Background timeline, and Development & Tech Interests
 */
import SectionHeader from '../common/SectionHeader';
import { useIntersectionObserver } from '../../utils/observerUtils';
import { formatEditorialIndex } from '../../utils/formatters';
import styles from './AboutSection.module.css';

export default function AboutSection({ data = {} }) {
  const [gridRef, isVisible] = useIntersectionObserver({
    once: true,
    threshold: 0.12,
  });

  const {
    sectionLabel = '01 // BACKGROUND & ORIGIN',
    headline = '',
    pullQuote = '',
    personalBackground = '',
    historyJourney = '',
    education = [],
    devJourney = '',
    techInterests = '',
  } = data || {};

  return (
    <section id="about" className={styles.aboutSection} aria-label="About Me">
      <div className={styles.container}>
        <SectionHeader
          indexLabel={sectionLabel}
          title="ABOUT ME"
          handwrittenNote="Who I am & how I got here"
          theme="dark"
        />

        <div
          ref={gridRef}
          className={`${styles.editorialGrid} ${isVisible ? styles.visible : ''}`}
        >
          {/* Left 4-Column Sticky Editorial Rail */}
          <aside className={styles.leftRail}>
            <div className={styles.stickyBox}>
              <span className={styles.railTag}>PROFILE // 01</span>
              <h3 className={styles.headline}>{headline}</h3>
              <blockquote className={styles.pullQuote}>
                <p>“{pullQuote}”</p>
              </blockquote>
              <div className={styles.handwrittenSignature}>
                — Built with intention, line by line.
              </div>
            </div>
          </aside>

          {/* Right 8-Column Narrative Spread */}
          <div className={styles.rightNarrative}>
            {/* Row 1: Personal Background & History */}
            <div className={styles.twoColBlock}>
              <article className={styles.narrativeCell}>
                <div className={styles.cellHeader}>
                  <span className={styles.cellIndex}>01.A</span>
                  <h4 className={styles.cellTitle}>PERSONAL BACKGROUND</h4>
                </div>
                <p className={styles.bodyText}>{personalBackground}</p>
              </article>

              <article className={styles.narrativeCell}>
                <div className={styles.cellHeader}>
                  <span className={styles.cellIndex}>01.B</span>
                  <h4 className={styles.cellTitle}>HISTORY & JOURNEY</h4>
                </div>
                <p className={styles.bodyText}>{historyJourney}</p>
              </article>
            </div>

            {/* Row 2: Educational Background */}
            <div className={styles.educationBlock}>
              <div className={styles.cellHeader}>
                <span className={styles.cellIndex}>01.C</span>
                <h4 className={styles.cellTitle}>EDUCATIONAL BACKGROUND</h4>
              </div>

              <div className={styles.educationList}>
                {(Array.isArray(education) ? education : []).map((edu, idx) => (
                  <div key={idx} className={styles.educationRow}>
                    <div className={styles.eduMeta}>
                      <span className={styles.eduIndex}>
                        {formatEditorialIndex(idx + 1)}
                      </span>
                      <span className={styles.eduPeriod}>{edu.period}</span>
                    </div>
                    <div className={styles.eduContent}>
                      <h5 className={styles.eduDegree}>{edu.degree}</h5>
                      <p className={styles.eduInstitution}>{edu.institution}</p>
                      {edu.details && (
                        <p className={styles.eduDetails}>{edu.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 3: Development Journey & Programming Interests */}
            <div className={styles.twoColBlock}>
              <article className={styles.narrativeCell}>
                <div className={styles.cellHeader}>
                  <span className={styles.cellIndex}>01.D</span>
                  <h4 className={styles.cellTitle}>DEVELOPMENT JOURNEY</h4>
                </div>
                <p className={styles.bodyText}>{devJourney}</p>
              </article>

              <article className={styles.narrativeCell}>
                <div className={styles.cellHeader}>
                  <span className={styles.cellIndex}>01.E</span>
                  <h4 className={styles.cellTitle}>INTERESTS IN TECH & CODE</h4>
                </div>
                <p className={styles.bodyText}>{techInterests}</p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

