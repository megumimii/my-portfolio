/**
 * C. InterestsManager Page (`/admin/interests`)
 *
 * Flexible CRUD & Specimen Editor for "Interests and Hobbies":
 * - Create custom tags (`<TagInput />`)
 * - Add arbitrary custom metadata fields (`<CustomAttributeBuilder />`)
 * - Upload cover image & multiple gallery images (`interests/{id}/`)
 * - Add descriptions & external links
 * - Reorder entries & preview changes live before saving
 */
import { useEffect, useMemo, useState } from 'react';
import SearchBar from '../../components/common/SearchBar';
import ModalOverlay from '../../components/common/ModalOverlay';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import InterestItem from '../../components/portfolio/InterestItem';
import {
  SingleImageUploader,
  MultiImageUploader,
} from '../../components/admin/ImageUploader';
import TagInput from '../../components/admin/TagInput';
import CustomAttributeBuilder from '../../components/admin/CustomAttributeBuilder';
import {
  subscribeAllInterestsAdmin,
  createInterest,
  updateInterest,
  deleteInterest,
  reorderInterests,
} from '../../services/interestService';
import { useDebounce } from '../../utils/debounce';
import { slugify } from '../../utils/formatters';
import styles from './AdminPages.module.css';

const EMPTY_INTEREST_FORM = {
  title: '',
  subtitle: '',
  description: '',
  coverImageUrl: '',
  coverImagePath: '',
  images: [],
  customTags: [],
  customAttributes: [
    { key: 'Current Focus', value: '' },
    { key: 'Favorite Aspect', value: '' },
  ],
  links: [],
  published: true,
  displayOrder: 1,
};

export default function InterestsManager() {
  const [interests, setInterests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_INTEREST_FORM);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  // Deletion Confirmation Modal State
  const [interestToDelete, setInterestToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 250);

  useEffect(() => {
    const unsub = subscribeAllInterestsAdmin(setInterests);
    return () => unsub();
  }, []);

  const filteredInterests = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    if (!term) return interests;
    return interests.filter((item) => {
      const hay = [
        item.title,
        item.subtitle,
        item.description,
        ...(Array.isArray(item.customTags) ? item.customTags : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(term);
    });
  }, [interests, debouncedSearch]);

  const handleStartNew = () => {
    setEditingId(null);
    setFormData({
      ...EMPTY_INTEREST_FORM,
      displayOrder: interests.length + 1,
    });
    setIsEditing(true);
    setStatusMsg('');
    setErrorMsg('');
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      subtitle: item.subtitle || '',
      description: item.description || '',
      coverImageUrl: item.coverImageUrl || '',
      coverImagePath: item.coverImagePath || '',
      images: Array.isArray(item.images) ? item.images : [],
      customTags: Array.isArray(item.customTags) ? item.customTags : [],
      customAttributes: Array.isArray(item.customAttributes)
        ? item.customAttributes
        : [],
      links: Array.isArray(item.links) ? item.links : [],
      published: item.published !== false,
      displayOrder: item.displayOrder ?? 1,
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
        await updateInterest(editingId, formData);
        setStatusMsg(`Updated interest "${formData.title}".`);
      } else {
        await createInterest(formData);
        setStatusMsg(`Created interest "${formData.title}".`);
      }
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to save interest.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!interestToDelete) return;
    setDeleting(true);
    setErrorMsg('');
    try {
      await deleteInterest(interestToDelete);
      setStatusMsg(`Deleted interest "${interestToDelete.title}".`);
      setInterestToDelete(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to delete interest.');
    } finally {
      setDeleting(false);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= interests.length) return;

    const next = [...interests];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);

    try {
      await reorderInterests(next);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to reorder interests.');
    }
  };

  const storageDir = `interests/${editingId || slugify(formData.title || 'draft')}`;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <div className={styles.headerMeta}>
          <span className={styles.pageCode}>ADMIN // 03 INTERESTS & HOBBIES</span>
          <h1 className={styles.pageTitle}>INTERESTS & HOBBIES</h1>
          <p className={styles.pageSubtitle}>
            Showcase your life beyond code with custom metadata fields, custom tags,
            and multi-image filmstrips.
          </p>
        </div>

        <div className={styles.headerActions}>
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartNew}
              className={styles.primaryBtn}
            >
              + NEW INTEREST / HOBBY
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className={styles.secondaryBtn}
            >
              ← BACK TO LIST
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
              {editingId ? `EDIT INTEREST // ${formData.title}` : 'NEW INTEREST / HOBBY'}
            </h2>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className={styles.secondaryBtn}
            >
              👁 PREVIEW CARD
            </button>
          </div>

          <div className={styles.formGrid2}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>TITLE *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Strategic & Atmospheric Gaming, Strength Training, Photography"
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                HANDWRITTEN ANNOTATION / SUBTITLE
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, subtitle: e.target.value }))
                }
                placeholder="e.g. Interactive Worldbuilding & Systems Design"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>DESCRIPTION *</label>
            <textarea
              rows={5}
              required
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Share why you enjoy this hobby and how it connects to who you are..."
              className={styles.textarea}
            />
          </div>

          <CustomAttributeBuilder
            label="FLEXIBLE CUSTOM METADATA FIELDS (KEY / VALUE PAIRS)"
            items={formData.customAttributes}
            onChange={(customAttributes) =>
              setFormData((p) => ({ ...p, customAttributes }))
            }
            keyField="key"
            valueField="value"
            keyPlaceholder="Field Name (e.g. Current Rotation, Gear, PR, Genre)"
            valuePlaceholder="Field Value (e.g. Elden Ring, 4-Day Split, Monochrome)"
            addButtonLabel="+ ADD CUSTOM METADATA FIELD"
          />

          <TagInput
            label="CUSTOM TAGS"
            tags={formData.customTags}
            onChange={(customTags) =>
              setFormData((p) => ({ ...p, customTags }))
            }
            placeholder="Add custom tag (e.g. Gaming, Fitness, Music, Photography)..."
          />

          <SingleImageUploader
            label="COVER PHOTO"
            storageDirectory={storageDir}
            imageUrl={formData.coverImageUrl}
            storagePath={formData.coverImagePath}
            fallbackType="interest"
            onChange={({ url, storagePath }) =>
              setFormData((p) => ({
                ...p,
                coverImageUrl: url,
                coverImagePath: storagePath,
              }))
            }
          />

          <MultiImageUploader
            label="ADDITIONAL FILMSTRIP PHOTOS"
            storageDirectory={`${storageDir}/gallery`}
            images={formData.images}
            fallbackType="interest"
            onChange={(images) => setFormData((p) => ({ ...p, images }))}
          />

          <CustomAttributeBuilder
            label="OPTIONAL EXTERNAL LINKS (PLAYLIST, GALLERY, PROFILE)"
            items={formData.links}
            onChange={(links) => setFormData((p) => ({ ...p, links }))}
            keyField="label"
            valueField="url"
            keyPlaceholder="Link Label (e.g. Spotify Playlist, VSCO)"
            valuePlaceholder="https://..."
            addButtonLabel="+ ADD OPTIONAL LINK"
          />

          <div className={styles.checkboxRow}>
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
                👁 PREVIEW ENTRY
              </button>
              <button
                type="submit"
                disabled={saving}
                className={styles.primaryBtn}
              >
                {saving ? 'SAVING...' : 'SAVE INTEREST ENTRY'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <>
          <div className={styles.toolbar}>
            <span className={styles.pageCode}>
              SHOWING {filteredInterests.length} OF {interests.length} ENTRIES
            </span>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="SEARCH INTERESTS..."
              theme="dark"
            />
          </div>

          <div className={styles.recordsList}>
            {filteredInterests.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <p className={styles.pageSubtitle}>No interests found.</p>
              </div>
            ) : (
              filteredInterests.map((item, idx) => (
                <div key={item.id || idx} className={styles.recordRow}>
                  <div className={styles.orderControls}>
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(idx, -1)}
                      disabled={idx === 0}
                      className={styles.orderBtn}
                    >
                      ↑
                    </button>
                    <span className={styles.orderIdx}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(idx, 1)}
                      disabled={idx === filteredInterests.length - 1}
                      className={styles.orderBtn}
                    >
                      ↓
                    </button>
                  </div>

                  <div className={styles.recordThumb}>
                    <ImageWithFallback
                      src={item.coverImageUrl}
                      fallbackType="interest"
                      alt={item.title}
                    />
                  </div>

                  <div className={styles.recordMain}>
                    <div className={styles.recordTitleRow}>
                      <span className={styles.recordTitle}>{item.title}</span>
                      {item.published === false && (
                        <span className={styles.badgeDraft}>DRAFT</span>
                      )}
                    </div>
                    <p className={styles.recordDesc}>{item.description}</p>
                    <div className={styles.recordMetaTags}>
                      {(Array.isArray(item.customAttributes)
                        ? item.customAttributes
                        : []
                      ).map((attr, i) => (
                        <span key={i} className={styles.miniTag}>
                          {attr.key}: {attr.value}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.recordActions}>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className={styles.actionMiniBtn}
                    >
                      EDIT
                    </button>
                    <button
                      type="button"
                      onClick={() => setInterestToDelete(item)}
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

      {/* Live Specimen Preview Modal */}
      <ModalOverlay
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="LIVE PREVIEW // INTERESTS & HOBBIES"
        subtitle={formData.title || 'Untitled Interest'}
        maxWidth="560px"
      >
        <div style={{ backgroundColor: '#F4F4F5', padding: '1.5rem' }}>
          <InterestItem interest={formData} index={formData.displayOrder || 1} />
        </div>
      </ModalOverlay>

      {/* Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(interestToDelete)}
        title="CONFIRM INTEREST DELETION"
        subtitle={interestToDelete?.title || 'INTEREST ENTRY'}
        message={`Are you sure you want to permanently delete "${interestToDelete?.title}"? All uploaded gallery photos will be permanently removed.`}
        confirmLabel="DELETE INTEREST"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setInterestToDelete(null)}
      />
    </div>
  );
}

