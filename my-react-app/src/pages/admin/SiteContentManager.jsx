/**
 * D. SiteContentManager Page (`/admin/content`)
 *
 * Structured Page & Stack Modification Interface (no raw JSON editing):
 * - Tab 1: Hero Section (Greeting, Full Name, Role, Short Bio, Backdrop Word, Portrait Upload, Metrics)
 * - Tab 2: About Me (Headline, Pull Quote, Background, History, Education Builder, Dev Journey, Tech Interests)
 * - Tab 3: Thought Process & 20% Quote Rail (Section Heading, Personal Quote, Handwritten Signature, 8 Interactive Nodes)
 * - Tab 4: Tools & Technologies Carousel (Add, Edit, Reorder, Delete technologies)
 * - Tab 5: Let's Talk & Social Links (CTA Heading, Invitation, Email, GitHub, LinkedIn, Additional Socials)
 */
import { useEffect, useState } from 'react';
import FilterChips from '../../components/common/FilterChips';
import { SingleImageUploader } from '../../components/admin/ImageUploader';
import CustomAttributeBuilder from '../../components/admin/CustomAttributeBuilder';
import {
  subscribeSiteContent,
  saveSiteContentSection,
  subscribeTools,
  createToolItem,
  deleteToolItem,
  reorderTools,
} from '../../services/contentService';
import styles from './AdminPages.module.css';

const CONTENT_TABS = [
  { value: 'hero', label: '01 HERO SECTION' },
  { value: 'about', label: '02 ABOUT & EDUCATION' },
  { value: 'thoughtProcess', label: '03 THOUGHT PROCESS & QUOTE' },
  { value: 'tools', label: '04 TOOLS CAROUSEL' },
  { value: 'contact', label: "05 LET'S TALK & SOCIALS" },
];

const EMPTY_SITE_CONTENT = {
  hero: {
    greeting: '',
    fullName: '',
    role: '',
    shortIntro: '',
    backdropWord: '',
    portraitUrl: '',
    availabilityText: '',
    locationText: '',
    stats: [],
  },
  about: {
    sectionLabel: '',
    headline: '',
    pullQuote: '',
    personalBackground: '',
    historyJourney: '',
    education: [],
    devJourney: '',
    techInterests: '',
  },
  thoughtProcess: {
    sectionLabel: '',
    heading: '',
    subtitle: '',
    quoteText: '',
    quoteAuthorSignature: '',
    quoteSubtext: '',
    nodes: [],
  },
  contact: {
    sectionLabel: '',
    heading: '',
    handwrittenPrompt: '',
    invitationText: '',
    email: '',
    githubUrl: '',
    linkedinUrl: '',
    location: '',
    socials: [],
  },
};

export default function SiteContentManager() {
  const [activeTab, setActiveTab] = useState('hero');
  const [content, setContent] = useState(EMPTY_SITE_CONTENT);
  const [tools, setTools] = useState([]);

  const [newToolName, setNewToolName] = useState('');
  const [newToolCategory, setNewToolCategory] = useState('CORE STACK');

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const unsubContent = subscribeSiteContent((data) => {
      setContent({
        hero: { ...EMPTY_SITE_CONTENT.hero, ...(data?.hero || {}) },
        about: { ...EMPTY_SITE_CONTENT.about, ...(data?.about || {}) },
        thoughtProcess: { ...EMPTY_SITE_CONTENT.thoughtProcess, ...(data?.thoughtProcess || {}) },
        contact: { ...EMPTY_SITE_CONTENT.contact, ...(data?.contact || {}) },
      });
    });
    const unsubTools = subscribeTools(setTools);
    return () => {
      unsubContent();
      unsubTools();
    };
  }, []);

  const updateSectionField = (section, field, value) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (activeTab === 'tools') return;

    setSaving(true);
    setStatusMsg('');
    setErrorMsg('');
    try {
      await saveSiteContentSection(activeTab, content[activeTab]);
      setStatusMsg(
        `Saved "${activeTab.toUpperCase()}" section to Cloud Firestore.`
      );
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to save section content.');
    } finally {
      setSaving(false);
    }
  };

  // Education Array Helpers
  const handleAddEducation = () => {
    const current = Array.isArray(content.about?.education)
      ? content.about.education
      : [];
    updateSectionField('about', 'education', [
      ...current,
      { period: '2024 - PRESENT', degree: '', institution: '', details: '' },
    ]);
  };

  const handleUpdateEducation = (idx, key, val) => {
    const current = [...(content.about?.education || [])];
    current[idx] = { ...current[idx], [key]: val };
    updateSectionField('about', 'education', current);
  };

  const handleRemoveEducation = (idx) => {
    const current = (content.about?.education || []).filter((_, i) => i !== idx);
    updateSectionField('about', 'education', current);
  };

  // Thought Process Node Helpers
  const handleUpdateNode = (idx, key, val) => {
    const current = [...(content.thoughtProcess?.nodes || [])];
    current[idx] = { ...current[idx], [key]: val };
    updateSectionField('thoughtProcess', 'nodes', current);
  };

  // Tools Carousel Helpers
  const handleAddTool = async (e) => {
    e.preventDefault();
    if (!newToolName.trim()) return;
    setErrorMsg('');
    try {
      await createToolItem({
        name: newToolName,
        category: newToolCategory,
        displayOrder: tools.length + 1,
      });
      setNewToolName('');
      setStatusMsg(`Added "${newToolName}" to Tools Carousel.`);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to add technology.');
    }
  };

  const handleMoveTool = async (idx, dir) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= tools.length) return;
    const next = [...tools];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    await reorderTools(next);
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <div className={styles.headerMeta}>
          <span className={styles.pageCode}>ADMIN // 04 SITE CONTENT EDITOR</span>
          <h1 className={styles.pageTitle}>SITE CONTENT & STACK EDITOR</h1>
          <p className={styles.pageSubtitle}>
            Modify Hero typography, About Me biography, Education history, Thought
            Process diagram nodes & personal quote, Infinite Technology Carousel, and
            Contact details without touching source code.
          </p>
        </div>
      </header>

      <FilterChips
        options={CONTENT_TABS}
        activeValue={activeTab}
        onSelect={(tab) => {
          setActiveTab(tab);
          setStatusMsg('');
          setErrorMsg('');
        }}
        theme="dark"
      />

      {statusMsg && <div className={styles.statusToast}>{statusMsg}</div>}
      {errorMsg && <div className={styles.errorToast}>{errorMsg}</div>}

      {/* TAB 1: HERO SECTION */}
      {activeTab === 'hero' && (
        <form onSubmit={handleSaveSection} className={styles.editorCard}>
          <div className={styles.editorHeader}>
            <h2 className={styles.editorTitle}>01 // HERO SECTION CONTENT</h2>
            <button type="submit" disabled={saving} className={styles.primaryBtn}>
              {saving ? 'SAVING...' : 'SAVE HERO CONTENT'}
            </button>
          </div>

          <div className={styles.formGrid3}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>HANDWRITTEN GREETING</label>
              <input
                type="text"
                value={content.hero?.greeting || ''}
                onChange={(e) =>
                  updateSectionField('hero', 'greeting', e.target.value)
                }
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>FULL NAME *</label>
              <input
                type="text"
                required
                value={content.hero?.fullName || ''}
                onChange={(e) =>
                  updateSectionField('hero', 'fullName', e.target.value)
                }
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>GIANT BACKDROP WORD</label>
              <input
                type="text"
                value={content.hero?.backdropWord || 'DEV'}
                onChange={(e) =>
                  updateSectionField('hero', 'backdropWord', e.target.value)
                }
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>ROLE / DISCIPLINE HEADLINE</label>
            <input
              type="text"
              value={content.hero?.role || ''}
              onChange={(e) => updateSectionField('hero', 'role', e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>SHORT PERSONAL INTRODUCTION</label>
            <textarea
              rows={3}
              value={content.hero?.shortIntro || ''}
              onChange={(e) =>
                updateSectionField('hero', 'shortIntro', e.target.value)
              }
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGrid2}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>LOCATION COORDINATE TEXT</label>
              <input
                type="text"
                value={content.hero?.locationText || ''}
                onChange={(e) =>
                  updateSectionField('hero', 'locationText', e.target.value)
                }
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>AVAILABILITY STATUS TEXT</label>
              <input
                type="text"
                value={content.hero?.availabilityText || ''}
                onChange={(e) =>
                  updateSectionField('hero', 'availabilityText', e.target.value)
                }
                className={styles.input}
              />
            </div>
          </div>

          <SingleImageUploader
            label="PORTRAIT PHOTO (DEFAULT: /assets/portrait.webp)"
            storageDirectory="site-assets"
            imageUrl={content.hero?.portraitUrl || '/assets/portrait.webp'}
            storagePath={content.hero?.portraitStoragePath || ''}
            fallbackType="portrait"
            onChange={({ url, storagePath }) => {
              updateSectionField('hero', 'portraitUrl', url);
              updateSectionField('hero', 'portraitStoragePath', storagePath);
            }}
          />

          <CustomAttributeBuilder
            label="HERO RIGHT-RAIL METRICS (VALUE / LABEL)"
            items={content.hero?.stats || []}
            onChange={(stats) => updateSectionField('hero', 'stats', stats)}
            keyField="value"
            valueField="label"
            keyPlaceholder="Metric Value (e.g. 09+)"
            valuePlaceholder="Metric Label (e.g. CORE STACK TECHNOLOGIES)"
            addButtonLabel="+ ADD METRIC"
          />
        </form>
      )}

      {/* TAB 2: ABOUT ME & EDUCATION */}
      {activeTab === 'about' && (
        <form onSubmit={handleSaveSection} className={styles.editorCard}>
          <div className={styles.editorHeader}>
            <h2 className={styles.editorTitle}>02 // ABOUT ME & EDUCATION</h2>
            <button type="submit" disabled={saving} className={styles.primaryBtn}>
              {saving ? 'SAVING...' : 'SAVE ABOUT CONTENT'}
            </button>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>EDITORIAL HEADLINE</label>
            <input
              type="text"
              value={content.about?.headline || ''}
              onChange={(e) =>
                updateSectionField('about', 'headline', e.target.value)
              }
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>STICKY RAIL PULL-QUOTE</label>
            <textarea
              rows={2}
              value={content.about?.pullQuote || ''}
              onChange={(e) =>
                updateSectionField('about', 'pullQuote', e.target.value)
              }
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGrid2}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>PERSONAL BACKGROUND</label>
              <textarea
                rows={5}
                value={content.about?.personalBackground || ''}
                onChange={(e) =>
                  updateSectionField('about', 'personalBackground', e.target.value)
                }
                className={styles.textarea}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>MY HISTORY & JOURNEY</label>
              <textarea
                rows={5}
                value={content.about?.historyJourney || ''}
                onChange={(e) =>
                  updateSectionField('about', 'historyJourney', e.target.value)
                }
                className={styles.textarea}
              />
            </div>
          </div>

          <div className={styles.formGrid2}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>DEVELOPMENT JOURNEY</label>
              <textarea
                rows={5}
                value={content.about?.devJourney || ''}
                onChange={(e) =>
                  updateSectionField('about', 'devJourney', e.target.value)
                }
                className={styles.textarea}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                INTERESTS IN TECHNOLOGY & PROGRAMMING
              </label>
              <textarea
                rows={5}
                value={content.about?.techInterests || ''}
                onChange={(e) =>
                  updateSectionField('about', 'techInterests', e.target.value)
                }
                className={styles.textarea}
              />
            </div>
          </div>

          {/* Structured Education Builder */}
          <div className={styles.fieldGroup}>
            <div className={styles.editorHeader}>
              <span className={styles.fieldLabel}>EDUCATIONAL BACKGROUND ENTRIES</span>
              <button
                type="button"
                onClick={handleAddEducation}
                className={styles.secondaryBtn}
              >
                + ADD EDUCATION ENTRY
              </button>
            </div>

            <div className={styles.subCardList}>
              {(content.about?.education || []).map((edu, idx) => (
                <div key={idx} className={styles.subCard}>
                  <div className={styles.subCardHeader}>
                    <span className={styles.subCardTitle}>
                      EDUCATION ENTRY #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className={styles.dangerBtn}
                    >
                      REMOVE
                    </button>
                  </div>

                  <div className={styles.formGrid3}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>PERIOD / YEARS</label>
                      <input
                        type="text"
                        value={edu.period || ''}
                        onChange={(e) =>
                          handleUpdateEducation(idx, 'period', e.target.value)
                        }
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>DEGREE / PROGRAM</label>
                      <input
                        type="text"
                        value={edu.degree || ''}
                        onChange={(e) =>
                          handleUpdateEducation(idx, 'degree', e.target.value)
                        }
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>INSTITUTION</label>
                      <input
                        type="text"
                        value={edu.institution || ''}
                        onChange={(e) =>
                          handleUpdateEducation(idx, 'institution', e.target.value)
                        }
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>DETAILS / COURSEWORK</label>
                    <textarea
                      rows={2}
                      value={edu.details || ''}
                      onChange={(e) =>
                        handleUpdateEducation(idx, 'details', e.target.value)
                      }
                      className={styles.textarea}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: THOUGHT PROCESS & 20% WHITE QUOTE RAIL */}
      {activeTab === 'thoughtProcess' && (
        <form onSubmit={handleSaveSection} className={styles.editorCard}>
          <div className={styles.editorHeader}>
            <h2 className={styles.editorTitle}>
              03 // THOUGHT PROCESS NODES & 20% QUOTE RAIL
            </h2>
            <button type="submit" disabled={saving} className={styles.primaryBtn}>
              {saving ? 'SAVING...' : 'SAVE THOUGHT PROCESS'}
            </button>
          </div>

          <div className={styles.formGrid2}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>SECTION HEADING</label>
              <input
                type="text"
                value={content.thoughtProcess?.heading || ''}
                onChange={(e) =>
                  updateSectionField('thoughtProcess', 'heading', e.target.value)
                }
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>SECTION SUBTITLE</label>
              <input
                type="text"
                value={content.thoughtProcess?.subtitle || ''}
                onChange={(e) =>
                  updateSectionField('thoughtProcess', 'subtitle', e.target.value)
                }
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.subCard}>
            <div className={styles.subCardHeader}>
              <span className={styles.subCardTitle}>
                20% CONTRASTING WHITE QUOTE RAIL CONTENT
              </span>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>PERSONAL QUOTE TEXT</label>
              <textarea
                rows={3}
                value={content.thoughtProcess?.quoteText || ''}
                onChange={(e) =>
                  updateSectionField('thoughtProcess', 'quoteText', e.target.value)
                }
                className={styles.textarea}
              />
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  HANDWRITTEN SIGNATURE TEXT
                </label>
                <input
                  type="text"
                  value={content.thoughtProcess?.quoteAuthorSignature || ''}
                  onChange={(e) =>
                    updateSectionField(
                      'thoughtProcess',
                      'quoteAuthorSignature',
                      e.target.value
                    )
                  }
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>QUOTE FOOTER SUBTEXT</label>
                <input
                  type="text"
                  value={content.thoughtProcess?.quoteSubtext || ''}
                  onChange={(e) =>
                    updateSectionField(
                      'thoughtProcess',
                      'quoteSubtext',
                      e.target.value
                    )
                  }
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          {/* 8 Engineering Thought Process Nodes */}
          <div className={styles.subCardList}>
            {(content.thoughtProcess?.nodes || []).map((node, idx) => (
              <div key={node.id || idx} className={styles.subCard}>
                <div className={styles.subCardHeader}>
                  <span className={styles.subCardTitle}>
                    NODE {node.index || idx + 1} // {node.label}
                  </span>
                </div>

                <div className={styles.formGrid3}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>NODE LABEL</label>
                    <input
                      type="text"
                      value={node.label || ''}
                      onChange={(e) =>
                        handleUpdateNode(idx, 'label', e.target.value)
                      }
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>STAGE CATEGORY</label>
                    <input
                      type="text"
                      value={node.category || ''}
                      onChange={(e) =>
                        handleUpdateNode(idx, 'category', e.target.value)
                      }
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>SHORT SUMMARY</label>
                    <input
                      type="text"
                      value={node.summary || ''}
                      onChange={(e) =>
                        handleUpdateNode(idx, 'summary', e.target.value)
                      }
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    DETAILED ENGINEERING COMMENTARY
                  </label>
                  <textarea
                    rows={2}
                    value={node.details || ''}
                    onChange={(e) =>
                      handleUpdateNode(idx, 'details', e.target.value)
                    }
                    className={styles.textarea}
                  />
                </div>
              </div>
            ))}
          </div>
        </form>
      )}

      {/* TAB 4: TOOLS & TECHNOLOGIES CAROUSEL */}
      {activeTab === 'tools' && (
        <div className={styles.editorCard}>
          <div className={styles.editorHeader}>
            <h2 className={styles.editorTitle}>
              04 // INFINITE TECHNOLOGY CAROUSEL ITEMS
            </h2>
          </div>

          <form onSubmit={handleAddTool} className={styles.formGrid3}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>TECHNOLOGY NAME *</label>
              <input
                type="text"
                required
                value={newToolName}
                onChange={(e) => setNewToolName(e.target.value)}
                placeholder="e.g. TypeScript, Docker, PostgreSQL"
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>CATEGORY MICRO-LABEL</label>
              <input
                type="text"
                value={newToolCategory}
                onChange={(e) => setNewToolCategory(e.target.value)}
                placeholder="e.g. LANGUAGE, RUNTIME, DATABASE"
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup} style={{ justifyContent: 'flex-end' }}>
              <button type="submit" className={styles.primaryBtn}>
                + ADD TO CAROUSEL
              </button>
            </div>
          </form>

          <div className={styles.recordsList}>
            {tools.map((tool, idx) => (
              <div
                key={tool.id || idx}
                className={styles.recordRow}
                style={{ gridTemplateColumns: 'auto 1fr auto' }}
              >
                <div className={styles.orderControls}>
                  <button
                    type="button"
                    onClick={() => handleMoveTool(idx, -1)}
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
                    onClick={() => handleMoveTool(idx, 1)}
                    disabled={idx === tools.length - 1}
                    className={styles.orderBtn}
                  >
                    ↓
                  </button>
                </div>

                <div className={styles.recordMain}>
                  <span className={styles.recordTitle}>{tool.name}</span>
                  <span className={styles.pageCode}>{tool.category}</span>
                </div>

                <div className={styles.recordActions}>
                  <button
                    type="button"
                    onClick={() => deleteToolItem(tool.id)}
                    className={styles.dangerBtn}
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: LET'S TALK & SOCIAL LINKS */}
      {activeTab === 'contact' && (
        <form onSubmit={handleSaveSection} className={styles.editorCard}>
          <div className={styles.editorHeader}>
            <h2 className={styles.editorTitle}>
              05 // LET&apos;S TALK & SOCIAL CHANNELS
            </h2>
            <button type="submit" disabled={saving} className={styles.primaryBtn}>
              {saving ? 'SAVING...' : 'SAVE CONTACT DETAILS'}
            </button>
          </div>

          <div className={styles.formGrid2}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>CTA HEADING</label>
              <input
                type="text"
                value={content.contact?.heading || ''}
                onChange={(e) =>
                  updateSectionField('contact', 'heading', e.target.value)
                }
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>HANDWRITTEN PROMPT</label>
              <input
                type="text"
                value={content.contact?.handwrittenPrompt || ''}
                onChange={(e) =>
                  updateSectionField(
                    'contact',
                    'handwrittenPrompt',
                    e.target.value
                  )
                }
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>INVITATION PARAGRAPH</label>
            <textarea
              rows={3}
              value={content.contact?.invitationText || ''}
              onChange={(e) =>
                updateSectionField('contact', 'invitationText', e.target.value)
              }
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGrid2}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>DIRECT EMAIL ADDRESS *</label>
              <input
                type="email"
                required
                value={content.contact?.email || ''}
                onChange={(e) =>
                  updateSectionField('contact', 'email', e.target.value)
                }
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>BASE LOCATION</label>
              <input
                type="text"
                value={content.contact?.location || ''}
                onChange={(e) =>
                  updateSectionField('contact', 'location', e.target.value)
                }
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGrid2}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>GITHUB PROFILE URL</label>
              <input
                type="url"
                value={content.contact?.githubUrl || ''}
                onChange={(e) =>
                  updateSectionField('contact', 'githubUrl', e.target.value)
                }
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>LINKEDIN PROFILE URL</label>
              <input
                type="url"
                value={content.contact?.linkedinUrl || ''}
                onChange={(e) =>
                  updateSectionField('contact', 'linkedinUrl', e.target.value)
                }
                className={styles.input}
              />
            </div>
          </div>

          <CustomAttributeBuilder
            label="ADDITIONAL SOCIAL MEDIA LINKS"
            items={content.contact?.socials || []}
            onChange={(socials) =>
              updateSectionField('contact', 'socials', socials)
            }
            keyField="label"
            valueField="url"
            keyPlaceholder="Platform Name (e.g. X / Twitter, CodePen, Read.cv)"
            valuePlaceholder="https://..."
            addButtonLabel="+ ADD SOCIAL LINK"
          />
        </form>
      )}
    </div>
  );
}

