/**
 * F. InterestsSection Component ("Interests and Hobbies")
 *
 * Uses a distinct visual presentation from the Projects section:
 * - Pure-white surface (`#FFFFFF`) layered with translucent flowing gray SVG wave ribbons
 *   (`<FlowingWaves variant="light" />`) inspired by Reference Image 2
 * - Reusable `<FilterChips theme="light" />` (by custom tags) & debounced `<SearchBar theme="light" />`
 * - Playful, staggered editorial Field-Notes Specimen layout (`<InterestItem />`)
 */
import { useMemo, useState } from 'react';
import FlowingWaves from '../common/FlowingWaves';
import SectionHeader from '../common/SectionHeader';
import SearchBar from '../common/SearchBar';
import FilterChips from '../common/FilterChips';
import InterestItem from './InterestItem';
import { useDebounce } from '../../utils/debounce';
import styles from './InterestsSection.module.css';

export default function InterestsSection({ interests = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');

  const debouncedSearch = useDebounce(searchTerm, 280);

  // Build tag filter options from customTags across all entries
  const tagOptions = useMemo(() => {
    const tagSet = new Set();
    interests.forEach((item) => {
      if (Array.isArray(item.customTags)) {
        item.customTags.forEach((t) => tagSet.add(t));
      }
    });
    return ['ALL', ...Array.from(tagSet).slice(0, 8)];
  }, [interests]);

  const filteredInterests = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();
    return interests.filter((item) => {
      const matchesTag =
        selectedTag === 'ALL' ||
        (Array.isArray(item.customTags) && item.customTags.includes(selectedTag));
      if (!matchesTag) return false;
      if (!query) return true;

      const haystack = [
        item.title,
        item.subtitle,
        item.description,
        ...(Array.isArray(item.customTags) ? item.customTags : []),
        ...(Array.isArray(item.customAttributes)
          ? item.customAttributes.map((a) => `${a.key} ${a.value}`)
          : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [interests, selectedTag, debouncedSearch]);

  return (
    <section
      id="interests"
      className={styles.interestsSection}
      aria-label="Interests and Hobbies"
    >
      {/* Soft Gray Wave Patterns Against White Background (Reference 2) */}
      <FlowingWaves variant="light" />

      <div className={styles.container}>
        <SectionHeader
          indexLabel="05 // BEYOND CODE"
          title="INTERESTS & HOBBIES"
          handwrittenNote="Life beyond the terminal"
          subtitle="What fuels my curiosity, discipline, and creative perspective when I step away from writing code."
          theme="light"
        />

        {interests.length > 1 && (
          <div className={styles.controlsRow}>
            <FilterChips
              options={tagOptions}
              activeValue={selectedTag}
              onSelect={setSelectedTag}
              theme="light"
            />
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="FILTER INTERESTS..."
              theme="light"
            />
          </div>
        )}

        {filteredInterests.length === 0 ? (
          <div className={styles.emptyBox}>
            <p>No matching interests or hobbies found.</p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedTag('ALL');
              }}
              className={styles.resetButton}
            >
              SHOW ALL ENTRIES
            </button>
          </div>
        ) : (
          <div className={styles.specimenGrid}>
            {filteredInterests.map((item, idx) => (
              <InterestItem
                key={item.id || idx}
                interest={item}
                index={idx + 1}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

