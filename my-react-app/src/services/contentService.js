/**
 * Site Content & Technologies Service (Cloud Firestore)
 *
 * Manages:
 * - `siteContent/{sectionId}` (`hero`, `about`, `thoughtProcess`, `contact`)
 * - `tools/{toolId}` (Technologies & Tools infinite horizontal carousel)
 */
import {
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { sanitizeText } from '../utils/validationUtils';

const SITE_CONTENT_COLLECTION = 'siteContent';
const TOOLS_COLLECTION = 'tools';

const EMPTY_SITE_CONTENT = {
  hero: {},
  about: {},
  thoughtProcess: {},
  contact: {},
};

/**
 * Subscribes to all `siteContent` documents (`hero`, `about`, `thoughtProcess`, `contact`).
 *
 * @param {(content: Object) => void} onData
 * @returns {() => void}
 */
export function subscribeSiteContent(onData) {
  if (!isFirebaseConfigured || !db) {
    onData(EMPTY_SITE_CONTENT);
    return () => {};
  }

  const contentRef = collection(db, SITE_CONTENT_COLLECTION);
  return onSnapshot(
    contentRef,
    (snapshot) => {
      if (snapshot.empty) {
        onData(EMPTY_SITE_CONTENT);
        return;
      }

      const content = {
        hero: {},
        about: {},
        thoughtProcess: {},
        contact: {},
      };

      snapshot.docs.forEach((docSnap) => {
        const id = docSnap.id;
        if (Object.prototype.hasOwnProperty.call(content, id)) {
          content[id] = docSnap.data();
        }
      });

      onData(content);
    },
    (err) => {
      console.error('[subscribeSiteContent Error]:', err);
      onData(EMPTY_SITE_CONTENT);
    }
  );
}

/**
 * Updates a specific section document inside `siteContent` (`hero`, `about`, `thoughtProcess`, `contact`).
 * @param {'hero' | 'about' | 'thoughtProcess' | 'contact'} sectionId
 * @param {Object} sectionData
 * @returns {Promise<void>}
 */
export async function saveSiteContentSection(sectionId, sectionData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured.');
  }
  const allowedSections = ['hero', 'about', 'thoughtProcess', 'contact', 'settings'];
  if (!allowedSections.includes(sectionId)) {
    throw new Error(`Invalid siteContent section: ${sectionId}`);
  }

  const ref = doc(db, SITE_CONTENT_COLLECTION, sectionId);
  await setDoc(
    ref,
    {
      ...sectionData,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Subscribes to the `tools` collection for the infinite horizontal technology carousel.
 * @param {(tools: Array<Object>) => void} onData
 * @returns {() => void}
 */
export function subscribeTools(onData) {
  if (!isFirebaseConfigured || !db) {
    onData([]);
    return () => {};
  }

  const toolsRef = collection(db, TOOLS_COLLECTION);
  const q = query(toolsRef, orderBy('displayOrder', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData([]);
        return;
      }
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      onData(items);
    },
    (err) => {
      console.error('[subscribeTools Error]:', err);
      onData([]);
    }
  );
}

/**
 * Adds a new technology item to the `tools` collection.
 * @param {{ name: string, category?: string, displayOrder?: number }} toolData
 * @returns {Promise<string>}
 */
export async function createToolItem(toolData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured.');
  }
  const name = sanitizeText(toolData?.name, 80);
  const category = sanitizeText(toolData?.category || 'TECHNOLOGY', 80);
  if (!name) {
    throw new Error('Technology name is required.');
  }

  const docRef = await addDoc(collection(db, TOOLS_COLLECTION), {
    name,
    category,
    displayOrder: Number.isFinite(Number(toolData?.displayOrder))
      ? Number(toolData.displayOrder)
      : 99,
    active: toolData?.active !== false,
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Updates an existing technology item in the `tools` collection.
 * @param {string} toolId
 * @param {Object} toolData
 * @returns {Promise<void>}
 */
export async function updateToolItem(toolId, toolData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured.');
  }
  const name = sanitizeText(toolData?.name, 80);
  const category = sanitizeText(toolData?.category || 'TECHNOLOGY', 80);
  if (!name) {
    throw new Error('Technology name is required.');
  }

  await updateDoc(doc(db, TOOLS_COLLECTION, toolId), {
    name,
    category,
    displayOrder: Number(toolData?.displayOrder) || 1,
    active: toolData?.active !== false,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a technology item from the `tools` collection.
 * @param {string} toolId
 * @returns {Promise<void>}
 */
export async function deleteToolItem(toolId) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured.');
  }
  await deleteDoc(doc(db, TOOLS_COLLECTION, toolId));
}

/**
 * Batch updates `displayOrder` for reordered tools.
 * @param {Array<{ id: string }>} orderedTools
 * @returns {Promise<void>}
 */
export async function reorderTools(orderedTools) {
  if (!isFirebaseConfigured || !db || !Array.isArray(orderedTools)) return;

  const batch = writeBatch(db);
  orderedTools.forEach((tool, idx) => {
    if (tool?.id) {
      batch.update(doc(db, TOOLS_COLLECTION, tool.id), {
        displayOrder: idx + 1,
        updatedAt: serverTimestamp(),
      });
    }
  });
  await batch.commit();
}

