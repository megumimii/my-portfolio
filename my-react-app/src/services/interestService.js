/**
 * Interests & Hobbies Domain Service (Cloud Firestore)
 *
 * Supports flexible custom tags, custom key-value attributes/metadata,
 * multiple images, display order reordering, and storage cleanup.
 */
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { validateInterestPayload } from '../utils/validationUtils';
import { deleteStorageFile } from './storageService';

const COLLECTION_NAME = 'interests';

/**
 * Subscribes to published interests/hobbies in real time for the public portfolio.
 * @param {(interests: Array<Object>) => void} onData
 * @param {(error: Error) => void} [onError]
 * @returns {() => void} Unsubscribe function
 */
export function subscribePublishedInterests(onData, onError) {
  if (!isFirebaseConfigured || !db) {
    onData([]);
    return () => {};
  }

  const interestsRef = collection(db, COLLECTION_NAME);
  const publishedQuery = query(interestsRef, where('published', '==', true));

  return onSnapshot(
    publishedQuery,
    (snapshot) => {
      if (snapshot.empty) {
        onData([]);
        return;
      }
      const items = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      onData(items);
    },
    (err) => {
      console.error('[subscribePublishedInterests Error]:', err);
      onError?.(err);
      onData([]);
    }
  );
}

/**
 * Performs a one-time GET request for all interests/hobbies (Admin view).
 * @returns {Promise<Array<Object>>}
 */
export async function fetchAllInterestsAdmin() {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  const interestsRef = collection(db, COLLECTION_NAME);
  const q = query(interestsRef, orderBy('displayOrder', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

/**
 * Subscribes to all interests/hobbies (published + drafts) for the Admin CMS.
 * @param {(interests: Array<Object>) => void} onData
 * @param {(error: Error) => void} [onError]
 * @returns {() => void}
 */
export function subscribeAllInterestsAdmin(onData, onError) {
  if (!isFirebaseConfigured || !db) {
    onData([]);
    return () => {};
  }

  const interestsRef = collection(db, COLLECTION_NAME);
  const q = query(interestsRef, orderBy('displayOrder', 'asc'));

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
      console.error('[subscribeAllInterestsAdmin Error]:', err);
      onError?.(err);
    }
  );
}

/**
 * Creates a new interest/hobby entry in Firestore.
 * @param {Object} rawInterestData
 * @returns {Promise<string>} Created document ID
 */
export async function createInterest(rawInterestData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured.');
  }

  const { valid, errors, payload } = validateInterestPayload(rawInterestData);
  if (!valid) {
    const firstError = Object.values(errors)[0] || 'Invalid interest data.';
    throw new Error(firstError);
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Updates an existing interest/hobby entry in Firestore.
 * @param {string} interestId
 * @param {Object} rawInterestData
 * @returns {Promise<void>}
 */
export async function updateInterest(interestId, rawInterestData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured.');
  }
  if (!interestId) {
    throw new Error('Interest ID is required for update.');
  }

  const { valid, errors, payload } = validateInterestPayload(rawInterestData);
  if (!valid) {
    const firstError = Object.values(errors)[0] || 'Invalid interest data.';
    throw new Error(firstError);
  }

  const interestRef = doc(db, COLLECTION_NAME, interestId);
  await updateDoc(interestRef, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes an interest/hobby entry and removes its images from Firebase Storage.
 * @param {Object | string} interest
 * @returns {Promise<void>}
 */
export async function deleteInterest(interest) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured.');
  }
  const interestId = typeof interest === 'string' ? interest : interest?.id;
  if (!interestId) {
    throw new Error('Interest ID is required for deletion.');
  }

  if (typeof interest === 'object' && interest !== null) {
    if (interest.coverImagePath) {
      await deleteStorageFile(interest.coverImagePath);
    }
    if (Array.isArray(interest.images)) {
      await Promise.all(interest.images.map((img) => deleteStorageFile(img?.storagePath)));
    }
  }

  await deleteDoc(doc(db, COLLECTION_NAME, interestId));
}

/**
 * Batch updates displayOrder across interests/hobbies.
 * @param {Array<{ id: string }>} orderedItems
 * @returns {Promise<void>}
 */
export async function reorderInterests(orderedItems) {
  if (!isFirebaseConfigured || !db || !Array.isArray(orderedItems)) return;

  const batch = writeBatch(db);
  orderedItems.forEach((item, index) => {
    if (item?.id) {
      const ref = doc(db, COLLECTION_NAME, item.id);
      batch.update(ref, {
        displayOrder: index + 1,
        updatedAt: serverTimestamp(),
      });
    }
  });

  await batch.commit();
}

