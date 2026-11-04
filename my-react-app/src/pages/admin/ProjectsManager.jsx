/**
 * B. ProjectsManager Page (`/admin/projects`)
 *
 * Full CRUD & Editorial Management for Portfolio Projects:
 * - Add, Edit, Delete projects
 * - Upload cover image & multiple screenshots to Firebase Storage (`projects/{id}/`)
 * - Add/remove technology tags & custom links
 * - Mark projects as Featured or Published/Draft
 * - Reorder projects (`displayOrder`)
 * - Preview changes live before publishing (`<ProjectCard />` & `<ProjectDetailModal />`)
 */
import { useEffect, useMemo, useState } from 'react';
import SearchBar from '../../components/common/SearchBar';
import FilterChips from '../../components/common/FilterChips';
import ModalOverlay from '../../components/common/ModalOverlay';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import ProjectCard from '../../components/portfolio/ProjectCard';
import ProjectDetailModal from '../../components/portfolio/ProjectDetailModal';
import {
  SingleImageUploader,
  MultiImageUploader,
} from '../../components/admin/ImageUploader';
import TagInput from '../../components/admin/TagInput';
import CustomAttributeBuilder from '../../components/admin/CustomAttributeBuilder';
import {
  subscribeAllProjectsAdmin,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
} from '../../services/projectService';
import { useDebounce } from '../../utils/debounce';
import { slugify } from '../../utils/formatters';
import styles from './AdminPages.module.css';

const EMPTY_PROJECT_FORM = {
  title: '',
  category: 'Full-Stack Architecture',
  shortDescription: '',
  detailedDescription: '',
  coverImageUrl: '',
  coverImagePath: '',
  screenshots: [],
  techTags: [],
  githubUrl: '',
  liveUrl: '',
  customLinks: [],
  featured: false,
  published: true,
  displayOrder: 1,
};

export default function ProjectsManager() {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PROJECT_FORM);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Live Preview State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDetailOpen, setPreviewDetailOpen] = useState(false);

  // Deletion Confirmation Modal State
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 250);

  useEffect(() => {
    const unsub = subscribeAllProjectsAdmin(setProjects);
    return () => unsub();
  }, []);

  const filteredProjects = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    return projects.filter((p) => {
      if (filterStatus === 'FEATURED' && !p.featured) return false;
      if (filterStatus === 'PUBLISHED' && p.published === false) return false;
      if (filterStatus === 'DRAFT' && p.published !== false) return false;

      if (!term) return true;
      const hay = [
        p.title,
        p.category,
        p.shortDescription,
        ...(Array.isArray(p.techTags) ? p.techTags : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(term);
    });
  }, [projects, filterStatus, debouncedSearch]);

  const handleStartNew = () => {
    setEditingId(null);
    setFormData({
      ...EMPTY_PROJECT_FORM,
      displayOrder: projects.length + 1,
    });
    setIsEditing(true);
    setStatusMsg('');
    setErrorMsg('');
  };

  const handleStartEdit = (project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title || '',
      category: project.category || 'Full-Stack Architecture',
      shortDescription: project.shortDescription || '',
      detailedDescription: project.detailedDescription || '',
      coverImageUrl: project.coverImageUrl || '',
      coverImagePath: project.coverImagePath || '',
      screenshots: Array.isArray(project.screenshots) ? project.screenshots : [],
      techTags: Array.isArray(project.techTags) ? project.techTags : [],
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      customLinks: Array.isArray(project.customLinks) ? project.customLinks : [],
      featured: Boolean(project.featured),
      published: project.published !== false,
      displayOrder: project.displayOrder ?? 1,
    });
    setIsEditing(true);
    setStatusMsg('');
    setErrorMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setStatusMsg('');

    try {
      if (editingId) {
        await updateProject(editingId, formData);
        setStatusMsg(`Updated project "${formData.title}" in Firestore.`);
      } else {
        await createProject(formData);
        setStatusMsg(`Created project "${formData.title}" in Firestore.`);
      }
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    setErrorMsg('');
    try {
      await deleteProject(projectToDelete);
      setStatusMsg(`Deleted project "${projectToDelete.title}".`);
      setProjectToDelete(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to delete project.');
    } finally {
      setDeleting(false);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= projects.length) return;

    const next = [...projects];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);

    try {
      await reorderProjects(next);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to reorder projects.');
    }
  };

  const storageDir = `projects/${editingId || slugify(formData.title || 'draft')}`;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <div className={styles.headerMeta}>
          <span className={styles.pageCode}>ADMIN // 02 PROJECT ARCHIVE</span>
          <h1 className={styles.pageTitle}>PROJECT MANAGEMENT</h1>
          <p className={styles.pageSubtitle}>
            Add, edit, reorder, and preview portfolio projects. Uploaded cover images
            and screenshots are automatically converted to WebP.
          </p>
        </div>

        <div className={styles.headerActions}>
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartNew}
              className={styles.primaryBtn}
            >
              + NEW PROJECT
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className={styles.secondaryBtn}
            >
              ← BACK TO PROJECT LIST
            </button>
          )}
        </div>
      </header>

      {statusMsg && <div className={styles.statusToast}>{statusMsg}</div>}
      {errorMsg && <div className={styles.errorToast}>{errorMsg}</div>}

      {isEditing ? (
        <form onSubmit={handleSave} className={styles.editorCard}>
          <div className={styles.editorHeader}>
            <h2 className={styles.editorTitle}>
              {editingId ? `EDIT PROJECT // ${formData.title}` : 'CREATE NEW PROJECT'}
            </h2>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className={styles.secondaryBtn}
            >
              👁 PREVIEW BEFORE PUBLISHING
            </button>
          </div>

          <div className={styles.formGrid2}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>PROJECT TITLE *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Aether — High-Performance Cloud Platform"
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>PROJECT CATEGORY *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, category: e.target.value }))
                }
                placeholder="e.g. Full-Stack Architecture, Web Application, Systems"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              SHORT DESCRIPTION (DISPLAYED IN EDITORIAL INDEX) *
            </label>
            <textarea
              rows={3}
              required
              value={formData.shortDescription}
              onChange={(e) =>
                setFormData((p) => ({ ...p, shortDescription: e.target.value }))
              }
              placeholder="Concise 1–2 sentence overview of the project..."
              className={styles.textarea}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              DETAILED CASE STUDY DESCRIPTION (DISPLAYED IN PROJECT MODAL)
            </label>
            <textarea
              rows={6}
              value={formData.detailedDescription}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  detailedDescription: e.target.value,
                }))
              }
              placeholder="Explain the problem, architecture, technical trade-offs, and outcomes..."
              className={styles.textarea}
            />
          </div>

          <SingleImageUploader
            label="PROJECT COVER IMAGE"
            storageDirectory={storageDir}
            imageUrl={formData.coverImageUrl}
            storagePath={formData.coverImagePath}
            fallbackType="project"
            onChange={({ url, storagePath }) =>
              setFormData((p) => ({
                ...p,
                coverImageUrl: url,
                coverImagePath: storagePath,
              }))
            }
          />

          <MultiImageUploader
            label="ADDITIONAL PROJECT SCREENSHOTS"
            storageDirectory={`${storageDir}/screenshots`}
            images={formData.screenshots}
            fallbackType="project"
            onChange={(screenshots) =>
              setFormData((p) => ({ ...p, screenshots }))
            }
          />

          <TagInput
            label="TECHNOLOGY TAGS"
            tags={formData.techTags}
            onChange={(techTags) => setFormData((p) => ({ ...p, techTags }))}
            placeholder="Add technology (e.g. React, Node.js, TypeScript, SQL)..."
          />

          <div className={styles.formGrid2}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>GITHUB REPOSITORY URL</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, githubUrl: e.target.value }))
                }
                placeholder="https://github.com/..."
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>LIVE DEPLOYMENT URL</label>
              <input
                type="url"
                value={formData.liveUrl}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, liveUrl: e.target.value }))
                }
                placeholder="https://..."
                className={styles.input}
              />
            </div>
          </div>

          <CustomAttributeBuilder
            label="OPTIONAL CUSTOM LINKS (DOCS, CASE STUDY, DEMO VIDEO)"
            items={formData.customLinks}
            onChange={(customLinks) =>
              setFormData((p) => ({ ...p, customLinks }))
            }
            keyField="label"
            valueField="url"
            keyPlaceholder="Link Label (e.g. Architecture Diagram)"
            valuePlaceholder="https://..."
            addButtonLabel="+ ADD CUSTOM LINK"
          />

          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, featured: e.target.checked }))
                }
              />
              <span>★ MARK AS FEATURED PROJECT (FULL-WIDTH EMPHASIS)</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, published: e.target.checked }))
                }
              />
              <span>PUBLISHED ON PUBLIC PORTFOLIO</span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={styles.fieldLabel}>DISPLAY ORDER:</span>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    displayOrder: Number(e.target.value) || 1,
                  }))
                }
                className={styles.input}
                style={{ width: '80px', padding: '0.4rem 0.6rem' }}
              />
            </div>
          </div>

          <div className={styles.editorFooter}>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className={styles.secondaryBtn}
            >
              CANCEL
            </button>

            <div className={styles.headerActions}>
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className={styles.secondaryBtn}
              >
                👁 PREVIEW CARD & MODAL
              </button>
              <button
                type="submit"
                disabled={saving}
                className={styles.primaryBtn}
              >
                {saving
                  ? 'SAVING TO FIRESTORE...'
                  : editingId
                  ? 'SAVE PROJECT CHANGES'
                  : 'PUBLISH NEW PROJECT'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <>
          <div className={styles.toolbar}>
            <FilterChips
              options={[
                { value: 'ALL', label: 'ALL', count: projects.length },
                {
                  value: 'FEATURED',
                  label: 'FEATURED',
                  count: projects.filter((p) => p.featured).length,
                },
                {
                  value: 'PUBLISHED',
                  label: 'PUBLISHED',
                  count: projects.filter((p) => p.published !== false).length,
                },
                {
                  value: 'DRAFT',
                  label: 'DRAFTS',
                  count: projects.filter((p) => p.published === false).length,
                },
              ]}
              activeValue={filterStatus}
              onSelect={setFilterStatus}
              theme="dark"
            />

            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="SEARCH PROJECTS..."
              theme="dark"
            />
          </div>

          <div className={styles.recordsList}>
            {filteredProjects.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <p className={styles.pageSubtitle}>No projects match your filter.</p>
              </div>
            ) : (
              filteredProjects.map((project, idx) => (
                <div key={project.id || idx} className={styles.recordRow}>
                  <div className={styles.orderControls}>
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(idx, -1)}
                      disabled={idx === 0}
                      className={styles.orderBtn}
                      aria-label="Move project up"
                    >
                      ↑
                    </button>
                    <span className={styles.orderIdx}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(idx, 1)}
                      disabled={idx === filteredProjects.length - 1}
                      className={styles.orderBtn}
                      aria-label="Move project down"
                    >
                      ↓
                    </button>
                  </div>

                  <div className={styles.recordThumb}>
                    <ImageWithFallback
                      src={project.coverImageUrl}
                      fallbackType="project"
                      alt={project.title}
                    />
                  </div>

                  <div className={styles.recordMain}>
                    <div className={styles.recordTitleRow}>
                      <span className={styles.recordTitle}>{project.title}</span>
                      {project.featured && (
                        <span className={styles.badgeFeatured}>★ FEATURED</span>
                      )}
                      {project.published === false && (
                        <span className={styles.badgeDraft}>DRAFT</span>
                      )}
                    </div>
                    <p className={styles.recordDesc}>{project.shortDescription}</p>
                    <div className={styles.recordMetaTags}>
                      <span className={styles.miniTag}>{project.category}</span>
                      {(Array.isArray(project.techTags) ? project.techTags : []).map(
                        (t, i) => (
                          <span key={i} className={styles.miniTag}>
                            [{t}]
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className={styles.recordActions}>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(project)}
                      className={styles.actionMiniBtn}
                    >
                      EDIT
                    </button>
                    <button
                      type="button"
                      onClick={() => setProjectToDelete(project)}
                      className={styles.dangerBtn}
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Live Preview Modal */}
      <ModalOverlay
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="LIVE EDITORIAL PREVIEW // PROJECT"
        subtitle={formData.title || 'Untitled Project'}
        maxWidth="1140px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className={styles.pageCode}>
              CLICK THE PREVIEW CARD BELOW TO TEST THE FULL CASE STUDY MODAL
            </span>
            <button
              type="button"
              onClick={() => setPreviewDetailOpen(true)}
              className={styles.secondaryBtn}
            >
              OPEN CASE STUDY DETAIL VIEW ↗
            </button>
          </div>
          <ProjectCard
            project={formData}
            index={formData.displayOrder || 1}
            variant={formData.featured ? 'featured' : 'wide'}
            onSelect={() => setPreviewDetailOpen(true)}
          />
        </div>
      </ModalOverlay>

      <ProjectDetailModal
        project={previewDetailOpen ? formData : null}
        onClose={() => setPreviewDetailOpen(false)}
      />

      {/* Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(projectToDelete)}
        title="CONFIRM PROJECT DELETION"
        subtitle={projectToDelete?.title || 'PROJECT ARCHIVE'}
        message={`Are you sure you want to permanently delete "${projectToDelete?.title}"? All associated cover photos and screenshots will be permanently removed.`}
        confirmLabel="DELETE PROJECT"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
}

