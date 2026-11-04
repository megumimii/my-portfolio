/**
 * D. ToolsMarquee Component ("My Tools and Technologies")
 *
 * Seamless infinite horizontal scrolling carousel with zero loop jump.
 * - Initial items: JavaScript, Node.js, Express.js, Python, Django, Java, React, Firebase, SQL
 * - Hovering pauses/decelerates the track and inverts the hovered item to crisp white
 * - Respects `prefers-reduced-motion` by displaying a responsive architectural grid
 */
import { useMemo } from 'react';
import { formatEditorialIndex } from '../../utils/formatters';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import styles from './ToolsMarquee.module.css';

export default function ToolsMarquee({ tools: propTools }) {
  const prefersReducedMotion = useReducedMotion();

  const items = useMemo(() => {
    if (Array.isArray(propTools)) {
      return propTools;
    }
    return [];
  }, [propTools]);

  // Duplicate the array identically inside two sibling flex groups so `translate3d(-50%, 0, 0)`
  // loops seamlessly with zero pixel jump regardless of screen width.
  const repeatedGroup = useMemo(() => [...items, ...items], [items]);

  return (
    <section
      id="tools"
      className={styles.toolsSection}
      aria-label="My Tools and Technologies"
    >
      <div className={styles.metaBar}>
        <div className={styles.metaContainer}>
          <span className={styles.sectionCode}>03 // TECHNOLOGIES & TOOLS</span>
          <span className={styles.sectionHint}>
            HOVER TO INSPECT // CURRENT STACK
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyNotice}>
          <span className={styles.emptyCode}>[ STACK REGISTRY EMPTY ]</span>
          <span className={styles.emptyDesc}>
            Add technologies in the Admin Panel to populate this carousel.
          </span>
        </div>
      ) : prefersReducedMotion ? (
        <div className={styles.reducedMotionGrid}>
          {items.map((tool, idx) => (
            <div key={tool.id || idx} className={styles.toolCell}>
              <span className={styles.toolIndex}>
                {formatEditorialIndex(idx + 1)}
              </span>
              <span className={styles.toolName}>{tool.name}</span>
              <span className={styles.toolCategory}>
                {tool.category || 'STACK'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.marqueeViewport}>
          <div className={styles.marqueeTrack}>
            {/* Group A */}
            <div className={styles.marqueeGroup}>
              {repeatedGroup.map((tool, idx) => (
                <div
                  key={`a-${tool.id || idx}-${idx}`}
                  className={styles.toolCell}
                >
                  <div className={styles.toolTopMeta}>
                    <span className={styles.toolIndex}>
                      {formatEditorialIndex((idx % items.length) + 1)}
                    </span>
                    <span className={styles.toolCategory}>
                      {tool.category || 'CORE STACK'}
                    </span>
                  </div>
                  <span className={styles.toolName}>{tool.name}</span>
                </div>
              ))}
            </div>

            {/* Group B (Identical twin for seamless -50% translation loop) */}
            <div className={styles.marqueeGroup} aria-hidden="true">
              {repeatedGroup.map((tool, idx) => (
                <div
                  key={`b-${tool.id || idx}-${idx}`}
                  className={styles.toolCell}
                >
                  <div className={styles.toolTopMeta}>
                    <span className={styles.toolIndex}>
                      {formatEditorialIndex((idx % items.length) + 1)}
                    </span>
                    <span className={styles.toolCategory}>
                      {tool.category || 'CORE STACK'}
                    </span>
                  </div>
                  <span className={styles.toolName}>{tool.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

