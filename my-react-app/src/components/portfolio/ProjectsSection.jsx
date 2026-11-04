/**
 * E. ProjectsSection Component ("My Projects")
 *
 * Features:
 * - Reusable `<SearchBar />` with `useDebounce(searchQuery, 300)`
 * - Reusable `<FilterChips />` dynamically extracted from project categories
 * - Asymmetrical 12-column editorial layout:
 *   - Featured projects span full 12 columns with alternating 7:5 / 5:7 composition
 *   - Non-featured projects alternate 7-column wide and 5-column offset tall compositions
 * - Dedicated `<ProjectDetailModal />` for full case study inspection & screenshot browsing
 */
import { useMemo, useState } from 'react';
import SectionHeader from '../common/SectionHeader';
import SearchBar from '../common/SearchBar';
import FilterChips from '../common/FilterChips';
import ProjectCard from './ProjectCard';
import ProjectDetailModal from './ProjectDetailModal';
import { useDebounce } from '../../utils/debounce';
import styles from './ProjectsSection.module.css';

export default function ProjectsSection({ projects = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState(null);

  const debouncedSearch = useDebounce(searchQuery, 280);

  // Extract unique categories with counts for FilterChips
  const categoryOptions = useMemo(() => {
    const counts = {};
    projects.forEach((p) => {
      const cat = (p.category || 'Engineering').trim();
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return [
      { value: 'ALL', label: 'ALL WORK', count: projects.length },
      ...Object.entries(counts).map(([cat, count]) => ({
        value: cat,
        label: cat,
        count,
      })),
    ];
  }, [projects]);

  // Filter projects using debounced search term and selected category
  const filteredProjects = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    return projects.filter((project) => {
      const matchesCat =
        activeCategory === 'ALL' ||
        (project.category || 'Engineering').trim() === activeCategory;
      if (!matchesCat) return false;
      if (!term) return true;

      const haystack = [
        project.title,
        project.shortDescription,
        project.detailedDescription,
        project.category,
        ...(Array.isArray(project.techTags) ? project.techTags : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [projects, activeCategory, debouncedSearch]);

  // Separate featured projects for top visual emphasis, then standard archive
  const { featuredList, archiveList } = useMemo(() => {
    const featured = [];
    const standard = [];
    filteredProjects.forEach((p) => {
      if (p.featured) {
        featured.push(p);
      } else {
        standard.push(p);
      }
    });
    return { featuredList: featured, archiveList: standard };
  }, [filteredProjects]);

  return (
    <section id="projects" className={styles.projectsSection} aria-label="My Projects">
      <div className={styles.container}>
        <SectionHeader
          indexLabel="04 // SELECTED PROJECTS"
          title="MY PROJECTS"
          handwrittenNote="Built, tested & shipped"
          subtitle="A curated collection of full-stack applications, backend architectures, and interfaces. Select any project to view details and screenshots."
          theme="dark"
        />

        {/* Reusable Filter Chips & Debounced Search Toolbar */}
        <div className={styles.controlsBar}>
          <FilterChips
            options={categoryOptions}
            activeValue={activeCategory}
            onSelect={setActiveCategory}
            theme="dark"
          />
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="SEARCH BY TITLE OR TECH..."
            theme="dark"
          />
        </div>

        {filteredProjects.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>NO MATCHING PROJECTS FOUND</p>
            <p className={styles.emptySub}>
              Try clearing your search filter or selecting another category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('ALL');
              }}
              className={styles.resetBtn}
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div className={styles.asymmetricGrid}>
            {/* Featured Projects Receive Greater Visual Emphasis */}
            {featuredList.map((project, idx) => (
              <ProjectCard
                key={project.id || idx}
                project={project}
                index={idx + 1}
                variant="featured"
                reversed={idx % 2 === 1}
                onSelect={setSelectedProject}
              />
            ))}

            {/* Standard Projects Alternate Wide (7-col) and Tall Offset (5-col) */}
            {archiveList.map((project, idx) => {
              const globalIdx = featuredList.length + idx + 1;
              const isWide = idx % 2 === 0;
              return (
                <ProjectCard
                  key={project.id || globalIdx}
                  project={project}
                  index={globalIdx}
                  variant={isWide ? 'wide' : 'tall'}
                  onSelect={setSelectedProject}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Dedicated Project Case Study Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}

