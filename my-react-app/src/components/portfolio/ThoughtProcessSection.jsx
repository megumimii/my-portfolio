/**
 * C. ThoughtProcessSection Component
 *
 * Implements the signature 80:20 asymmetric split layout:
 * - 80% Dominant Arena (Dark): Interactive node-based engineering system diagram
 * - 20% Contrasting Rail (Pure White `#FFFFFF` with soft gray wave overlay):
 *   Customizable personal engineering quote & handwritten signature
 */
import SectionHeader from '../common/SectionHeader';
import FlowingWaves from '../common/FlowingWaves';
import ThoughtProcessGraph from './ThoughtProcessGraph';
import { useIntersectionObserver } from '../../utils/observerUtils';
import styles from './ThoughtProcessSection.module.css';

export default function ThoughtProcessSection({ data = {} }) {
  const [sectionRef, isVisible] = useIntersectionObserver({
    once: true,
    threshold: 0.1,
  });

  const {
    sectionLabel = '02 // ENGINEERING APPROACH',
    heading = 'MY THOUGHT PROCESS',
    subtitle = '',
    quoteText = '',
    quoteAuthorSignature = '',
    quoteSubtext = '',
    nodes = [],
  } = data || {};

  return (
    <section
      id="thought-process"
      className={styles.thoughtSection}
      aria-label="My Thought Process"
    >
      <div className={styles.container}>
        <SectionHeader
          indexLabel={sectionLabel}
          title={heading}
          subtitle={subtitle}
          handwrittenNote="How I architect systems"
          theme="dark"
        />

        {/* 80:20 Split Layout */}
        <div
          ref={sectionRef}
          className={`${styles.splitLayout} ${isVisible ? styles.visible : ''}`}
        >
          {/* 80% Main Content Arena: Interactive Node Topology */}
          <div className={styles.mainArena80}>
            <ThoughtProcessGraph nodes={nodes} />
          </div>

          {/* 20% Contrasting White Quote Rail */}
          <aside className={styles.quoteRail20} aria-label="Personal engineering quote">
            <FlowingWaves variant="quote" />

            <div className={styles.quoteTop}>
              <span className={styles.quoteMark} aria-hidden="true">
                “
              </span>
              <blockquote className={styles.quoteText}>{quoteText}</blockquote>
            </div>

            <div className={styles.quoteBottom}>
              <div className={styles.signatureLine}>
                <span className={styles.signatureScript}>
                  {quoteAuthorSignature}
                </span>
              </div>
              <div className={styles.quoteRule} aria-hidden="true" />
              <p className={styles.quoteSubtext}>{quoteSubtext}</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

