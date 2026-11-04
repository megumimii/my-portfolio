/**
 * G. ContactSection Component ("Let's Talk")
 *
 * Concludes the portfolio with:
 * - Monumental "LET'S TALK" typographic heading & handwritten invitation
 * - Architectural hairline contact channels (Email with 1-click copy, GitHub, LinkedIn, custom socials)
 * - Validated inquiry form connected to Firestore `messages` collection (viewable in `/admin/messages`)
 * - Footer with live local time & discreet `/admin/login` CMS link
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import FlowingWaves from '../common/FlowingWaves';
import { submitContactMessage } from '../../services/messageService';
import { useIntersectionObserver } from '../../utils/observerUtils';
import styles from './ContactSection.module.css';

const CURRENT_YEAR = new Date().getFullYear();

export default function ContactSection({ data = {} }) {
  const [sectionRef, isVisible] = useIntersectionObserver({
    once: true,
    threshold: 0.12,
  });

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formState, setFormState] = useState({
    senderName: '',
    senderEmail: '',
    subject: '',
    message: '',
    websiteHoneypot: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const {
    sectionLabel = '06 // GET IN TOUCH',
    heading = "LET'S TALK",
    handwrittenPrompt = "Let's build something remarkable together.",
    invitationText = 'Currently open to software engineering roles, technical collaborations, and ambitious digital projects. Reach out directly or send a message below.',
    email = '',
    githubUrl = '',
    linkedinUrl = '',
    location = '',
    socials = [],
  } = data || {};

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2400);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      await submitContactMessage(formState);
      setFeedback({
        type: 'success',
        text: 'Message transmitted. It is now logged in the private inbox—thank you for reaching out.',
      });
      setFormState({
        senderName: '',
        senderEmail: '',
        subject: '',
        message: '',
        websiteHoneypot: '',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Unable to send message right now. Please use the direct email link.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer
      id="contact"
      ref={sectionRef}
      className={`${styles.contactSection} ${isVisible ? styles.visible : ''}`}
      aria-label="Contact and Let's Talk"
    >
      <FlowingWaves variant="dark" />

      <div className={styles.container}>
        {/* Top Monumental Heading */}
        <div className={styles.headerBlock}>
          <div className={styles.metaRow}>
            <span className={styles.sectionCode}>{sectionLabel}</span>
            <span className={styles.metaRule} aria-hidden="true" />
            <span className={styles.handwrittenPrompt}>{handwrittenPrompt}</span>
          </div>

          <h2 className={styles.monumentHeading}>{heading}</h2>
          <p className={styles.invitationCopy}>{invitationText}</p>
        </div>

        {/* Main 5:7 Split: Direct Channels vs. Inquiry Form */}
        <div className={styles.contactGrid}>
          {/* Left Column: Architectural Hairline Contact Channels */}
          <div className={styles.channelsColumn}>
            {email && (
              <div className={styles.channelRow}>
                <div className={styles.channelMeta}>
                  <span className={styles.channelIdx}>01 // EMAIL</span>
                  <a href={`mailto:${email}`} className={styles.channelPrimaryValue}>
                    {email}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className={styles.copyBtn}
                >
                  {copiedEmail ? 'COPIED [✓]' : 'COPY EMAIL'}
                </button>
              </div>
            )}

            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.channelRow}
              >
                <div className={styles.channelMeta}>
                  <span className={styles.channelIdx}>02 // GITHUB</span>
                  <span className={styles.channelPrimaryValue}>GITHUB PROFILE</span>
                </div>
                <span className={styles.channelArrow}>↗</span>
              </a>
            )}

            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.channelRow}
              >
                <div className={styles.channelMeta}>
                  <span className={styles.channelIdx}>03 // LINKEDIN</span>
                  <span className={styles.channelPrimaryValue}>LINKEDIN</span>
                </div>
                <span className={styles.channelArrow}>↗</span>
              </a>
            )}

            {(Array.isArray(socials) ? socials : [])
              .filter(
                (s) =>
                  s?.url &&
                  s.label?.toLowerCase() !== 'github' &&
                  s.label?.toLowerCase() !== 'linkedin'
              )
              .map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.channelRow}
                >
                  <div className={styles.channelMeta}>
                    <span className={styles.channelIdx}>
                      {String(idx + 4).padStart(2, '0')} // SOCIAL LINK
                    </span>
                    <span className={styles.channelPrimaryValue}>{social.label}</span>
                  </div>
                  <span className={styles.channelArrow}>↗</span>
                </a>
              ))}

            <div className={styles.locationFooterBox}>
              <span className={styles.channelIdx}>LOCATION</span>
              <p className={styles.locationValue}>{location}</p>
            </div>
          </div>

          {/* Right Column: Validated Direct Message Transmission Form */}
          <div className={styles.formColumn}>
            <div className={styles.formHeader}>
              <span className={styles.formCode}>DIRECT INQUIRY // FORM</span>
              <span className={styles.formStatus}>SECURE DISPATCH</span>
            </div>

            <form onSubmit={handleFormSubmit} className={styles.form} noValidate>
              {/* Hidden Honeypot Input for Bot Mitigation */}
              <input
                type="text"
                name="websiteHoneypot"
                value={formState.websiteHoneypot}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    websiteHoneypot: e.target.value,
                  }))
                }
                tabIndex={-1}
                autoComplete="off"
                className={styles.honeypot}
                aria-hidden="true"
              />

              <div className={styles.inputRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="contact-name" className={styles.label}>
                    01 // YOUR NAME *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Jane Doe"
                    value={formState.senderName}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        senderName: e.target.value,
                      }))
                    }
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="contact-email" className={styles.label}>
                    02 // YOUR EMAIL *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    maxLength={150}
                    placeholder="jane@studio.com"
                    value={formState.senderEmail}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        senderEmail: e.target.value,
                      }))
                    }
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="contact-subject" className={styles.label}>
                  03 // SUBJECT OR CONTEXT
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  maxLength={160}
                  placeholder="Engineering Role / Project Collaboration"
                  value={formState.subject}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="contact-message" className={styles.label}>
                  04 // MESSAGE *
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  maxLength={3000}
                  placeholder="Tell me about your team, project, or idea..."
                  value={formState.message}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  className={styles.textarea}
                />
              </div>

              {feedback.text && (
                <div
                  className={`${styles.feedbackBanner} ${
                    feedback.type === 'success'
                      ? styles.feedbackSuccess
                      : styles.feedbackError
                  }`}
                  role="status"
                >
                  {feedback.text}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={styles.submitBtn}
              >
                <span>{submitting ? 'SENDING...' : 'SEND MESSAGE'}</span>
                <span>→</span>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Colophon & Discreet Admin Link */}
        <div className={styles.colophon}>
          <p className={styles.copyright}>
            © {CURRENT_YEAR} John Christian Isaac A. Gacosta. All rights reserved.
          </p>

          <div className={styles.colophonRight}>
            <a href="#hero" className={styles.backToTop}>
              BACK TO TOP ↑
            </a>
            <Link
              to="/admin/login"
              className={styles.discreetAdminLink}
              title="Administrator Portal"
            >
              [ ADMIN ]
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

