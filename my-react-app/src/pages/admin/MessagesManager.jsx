/**
 * E. MessagesManager Page (`/admin/messages`)
 *
 * Dedicated Messages Inbox in the Admin CMS for inquiries submitted
 * through the public "Let's Talk" contact section.
 *
 * Capabilities:
 * - Realtime subscription to `messages` collection
 * - Filter by ALL / UNREAD / READ via `<FilterChips />`
 * - Search by sender name, email, subject, or message body via debounced `<SearchBar />`
 * - Mark message as Read / Unread
 * - Direct 1-click Email Reply (`mailto:`)
 * - Delete message
 */
import { useEffect, useMemo, useState } from 'react';
import SearchBar from '../../components/common/SearchBar';
import FilterChips from '../../components/common/FilterChips';
import ModalOverlay from '../../components/common/ModalOverlay';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import {
  subscribeMessagesAdmin,
  updateMessageReadStatus,
  deleteMessage,
} from '../../services/messageService';
import { useDebounce } from '../../utils/debounce';
import { formatDateTime } from '../../utils/formatters';
import styles from './AdminPages.module.css';

export default function MessagesManager() {
  const [messages, setMessages] = useState([]);
  const [filterState, setFilterState] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMessage, setActiveMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Deletion Confirmation Modal State
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 250);

  useEffect(() => {
    const unsub = subscribeMessagesAdmin(setMessages, (err) => {
      setErrorMsg(err?.message || 'Unable to load messages.');
    });
    return () => unsub();
  }, []);

  const filteredMessages = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    return messages.filter((msg) => {
      if (filterState === 'UNREAD' && msg.read) return false;
      if (filterState === 'READ' && !msg.read) return false;

      if (!term) return true;
      const hay = [
        msg.senderName,
        msg.senderEmail,
        msg.subject,
        msg.message,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return hay.includes(term);
    });
  }, [messages, filterState, debouncedSearch]);

  const handleInspectMessage = async (msg) => {
    setActiveMessage(msg);
    if (!msg.read) {
      await updateMessageReadStatus(msg.id, true);
    }
  };

  const handleToggleRead = async (msg) => {
    await updateMessageReadStatus(msg.id, !msg.read);
    if (activeMessage?.id === msg.id) {
      setActiveMessage((prev) => (prev ? { ...prev, read: !msg.read } : null));
    }
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    setDeleting(true);
    try {
      await deleteMessage(messageToDelete.id);
      if (activeMessage?.id === messageToDelete.id) {
        setActiveMessage(null);
      }
      setMessageToDelete(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to delete message.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <div className={styles.headerMeta}>
          <span className={styles.pageCode}>ADMIN // 05 INBOX</span>
          <h1 className={styles.pageTitle}>MESSAGES INBOX</h1>
          <p className={styles.pageSubtitle}>
            Review and respond to direct inquiries transmitted from the public
            &ldquo;Let&apos;s Talk&rdquo; section.
          </p>
        </div>
      </header>

      {errorMsg && <div className={styles.errorToast}>{errorMsg}</div>}

      <div className={styles.toolbar}>
        <FilterChips
          options={[
            { value: 'ALL', label: 'ALL MESSAGES', count: messages.length },
            {
              value: 'UNREAD',
              label: 'UNREAD',
              count: messages.filter((m) => !m.read).length,
            },
            {
              value: 'READ',
              label: 'READ',
              count: messages.filter((m) => m.read).length,
            },
          ]}
          activeValue={filterState}
          onSelect={setFilterState}
          theme="dark"
        />

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="SEARCH SENDER OR MESSAGE..."
          theme="dark"
        />
      </div>

      <div className={styles.recordsList}>
        {filteredMessages.length === 0 ? (
          <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <p className={styles.pageSubtitle}>
              No messages in this view yet. Inquiries submitted via the public contact
              form will appear here automatically.
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={styles.recordRow}
              style={{
                gridTemplateColumns: '1fr auto',
                backgroundColor: msg.read
                  ? 'transparent'
                  : 'rgba(255, 255, 255, 0.03)',
              }}
            >
              <div
                className={styles.recordMain}
                style={{ cursor: 'pointer' }}
                onClick={() => handleInspectMessage(msg)}
              >
                <div className={styles.recordTitleRow}>
                  {!msg.read && (
                    <span className={styles.badgeFeatured}>● UNREAD</span>
                  )}
                  <span className={styles.recordTitle}>
                    {msg.subject || 'Portfolio Inquiry'}
                  </span>
                  <span className={styles.pageCode}>
                    // FROM: {msg.senderName} ({msg.senderEmail})
                  </span>
                </div>

                <p className={styles.recordDesc}>{msg.message}</p>

                <div className={styles.recordMetaTags}>
                  <span className={styles.miniTag}>
                    RECEIVED: {formatDateTime(msg.createdAt)}
                  </span>
                </div>
              </div>

              <div className={styles.recordActions}>
                <button
                  type="button"
                  onClick={() => handleInspectMessage(msg)}
                  className={styles.actionMiniBtn}
                >
                  OPEN
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleRead(msg)}
                  className={styles.actionMiniBtn}
                >
                  {msg.read ? 'MARK UNREAD' : 'MARK READ'}
                </button>
                <a
                  href={`mailto:${msg.senderEmail}?subject=${encodeURIComponent(
                    `Re: ${msg.subject || 'Portfolio Inquiry'}`
                  )}`}
                  className={styles.actionMiniBtn}
                >
                  REPLY ↗
                </a>
                <button
                  type="button"
                  onClick={() => setMessageToDelete(msg)}
                  className={styles.dangerBtn}
                >
                  DELETE
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full Message Inspection Modal */}
      <ModalOverlay
        isOpen={Boolean(activeMessage)}
        onClose={() => setActiveMessage(null)}
        title="INCOMING TRANSMISSION // MESSAGE DETAIL"
        subtitle={activeMessage?.senderEmail || ''}
        maxWidth="720px"
      >
        {activeMessage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-hairline-dark)',
              }}
            >
              <div>
                <span className={styles.pageCode}>
                  RECEIVED {formatDateTime(activeMessage.createdAt)}
                </span>
                <h2 className={styles.editorTitle} style={{ marginTop: '0.35rem' }}>
                  {activeMessage.subject || 'Portfolio Inquiry'}
                </h2>
                <p className={styles.pageSubtitle} style={{ marginTop: '0.25rem' }}>
                  From: <strong>{activeMessage.senderName}</strong> &lt;
                  {activeMessage.senderEmail}&gt;
                </p>
              </div>

              <a
                href={`mailto:${activeMessage.senderEmail}?subject=${encodeURIComponent(
                  `Re: ${activeMessage.subject || 'Portfolio Inquiry'}`
                )}`}
                className={styles.primaryBtn}
              >
                REPLY VIA EMAIL ↗
              </a>
            </div>

            <div
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-hairline-dark)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.75,
                color: 'var(--text-primary)',
              }}
            >
              {activeMessage.message}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => handleToggleRead(activeMessage)}
                className={styles.secondaryBtn}
              >
                {activeMessage.read ? 'MARK AS UNREAD' : 'MARK AS READ'}
              </button>

              <button
                type="button"
                onClick={() => setMessageToDelete(activeMessage)}
                className={styles.dangerBtn}
              >
                DELETE MESSAGE
              </button>
            </div>
          </div>
        )}
      </ModalOverlay>

      {/* Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(messageToDelete)}
        title="CONFIRM MESSAGE DELETION"
        subtitle={messageToDelete?.senderEmail || 'COMMUNICATIONS'}
        message={`Are you sure you want to delete the message from "${messageToDelete?.senderName}" regarding "${messageToDelete?.subject || 'Portfolio Inquiry'}"? This cannot be undone.`}
        confirmLabel="DELETE MESSAGE"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setMessageToDelete(null)}
      />
    </div>
  );
}

