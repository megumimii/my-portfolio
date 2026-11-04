/**
 * Messages Domain Service (Cloud Firestore)
 *
 * Powers the public "Let's Talk" contact form submission and the private
 * Admin Panel Messages Inbox (`/admin/messages`).
 */
import {
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { validateContactMessage } from '../utils/validationUtils';

const COLLECTION_NAME = 'messages';
const RATE_LIMIT_STORAGE_KEY = 'portfolio_last_message_ts';
const COOLDOWN_MS = 45 * 1000; // 45-second client-side rate-limit cooldown

/**
 * Submits a validated contact inquiry from the public "Let's Talk" section.
 * Enforces client-side rate-limiting and schema validation (backed by `firestore.rules`).
 *
 * @param {Object} rawData
 * @returns {Promise<string>} Created message document ID
 */
export async function submitContactMessage(rawData) {
  // Check honeypot field against automated spam bots
  if (rawData?.websiteHoneypot) {
    return 'filtered';
  }

  if (typeof window !== 'undefined') {
    const lastSent = Number(sessionStorage.getItem(RATE_LIMIT_STORAGE_KEY) || 0);
    if (Date.now() - lastSent < COOLDOWN_MS) {
      const remainingSec = Math.ceil((COOLDOWN_MS - (Date.now() - lastSent)) / 1000);
      throw new Error(`Please wait ${remainingSec} seconds before sending another message.`);
    }
  }

  const { valid, errors, payload } = validateContactMessage(rawData);
  if (!valid) {
    const firstError = Object.values(errors)[0] || 'Please check your message fields.';
    throw new Error(firstError);
  }

  if (!isFirebaseConfigured || !db) {
    throw new Error(
      'Message service is temporarily unavailable. Please use the direct email link above.'
    );
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...payload,
    createdAt: serverTimestamp(),
  });

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(RATE_LIMIT_STORAGE_KEY, String(Date.now()));
  }

  return docRef.id;
}

/**
 * Performs a one-time GET request for all messages in the Admin Inbox.
 * @returns {Promise<Array<Object>>}
 */
export async function fetchMessagesAdmin() {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  const messagesRef = collection(db, COLLECTION_NAME);
  const q = query(messagesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

/**
 * Subscribes to the `messages` collection in real time for the Admin Messages Inbox.
 * @param {(messages: Array<Object>) => void} onData
 * @param {(error: Error) => void} [onError]
 * @returns {() => void}
 */
export function subscribeMessagesAdmin(onData, onError) {
  if (!isFirebaseConfigured || !db) {
    onData([]);
    return () => {};
  }

  const messagesRef = collection(db, COLLECTION_NAME);
  const q = query(messagesRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      onData(items);
    },
    (err) => {
      console.error('[subscribeMessagesAdmin Error]:', err);
      onError?.(err);
    }
  );
}

/**
 * Toggles the `read` boolean flag on a message document in the Admin Inbox.
 * @param {string} messageId
 * @param {boolean} readState
 * @returns {Promise<void>}
 */
export async function updateMessageReadStatus(messageId, readState) {
  if (!isFirebaseConfigured || !db || !messageId) return;
  await updateDoc(doc(db, COLLECTION_NAME, messageId), {
    read: Boolean(readState),
  });
}

/**
 * Permanently deletes a message from the Admin Inbox.
 * @param {string} messageId
 * @returns {Promise<void>}
 */
export async function deleteMessage(messageId) {
  if (!isFirebaseConfigured || !db || !messageId) return;
  await deleteDoc(doc(db, COLLECTION_NAME, messageId));
}

