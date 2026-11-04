/**
 * Projects Domain Service (Cloud Firestore)
 *
 * Implements:
 * - Realtime `onSnapshot` with server-side Firestore `query` (`where('published', '==', true)`)
 *   for the public portfolio.
 * - One-time GET (`getDocs`) and realtime subscription for Admin management.
 * - Validated CUD operations with automatic Firebase Storage cleanup on deletion.
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
import { validateProjectPayload } from '../utils/validationUtils';
import { deleteStorageFile } from './storageService';

const COLLECTION_NAME = 'projects';

/**
 * Subscribes to published projects in real time for the public portfolio.
 * Uses Firestore `query()` constraints to avoid client-side over-fetching.
 *
 * @param {(projects: Array<Object>) => void} onData
 * @param {(error: Error) => void} [onError]
 * @returns {() => void} Unsubscribe function
 */
export function subscribePublishedProjects(onData, onError) {
  if (!isFirebaseConfigured || !db) {
    onData([]);
    return () => {};
  }

  const projectsRef = collection(db, COLLECTION_NAME);
  const publishedQuery = query(projectsRef, where('published', '==', true));

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
      console.error('[subscribePublishedProjects Error]:', err);
      onError?.(err);
      onData([]);
    }
  );
}

/**
 * Fetches all projects (including unpublished drafts) via a GET request for Admin tables.
 * @returns {Promise<Array<Object>>}
 */
export async function fetchAllProjectsAdmin() {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  const projectsRef = collection(db, COLLECTION_NAME);
  const q = query(projectsRef, orderBy('displayOrder', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

/**
 * Subscribes to all projects (published + drafts) in real time for the Admin CMS.
 * @param {(projects: Array<Object>) => void} onData
 * @param {(error: Error) => void} [onError]
 * @returns {() => void}
 */
export function subscribeAllProjectsAdmin(onData, onError) {
  if (!isFirebaseConfigured || !db) {
    onData([]);
    return () => {};
  }

  const projectsRef = collection(db, COLLECTION_NAME);
  const q = query(projectsRef, orderBy('displayOrder', 'asc'));

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
      console.error('[subscribeAllProjectsAdmin Error]:', err);
      onError?.(err);
    }
  );
}

/**
 * Creates a new project document in Firestore after strict schema validation.
 * @param {Object} rawProjectData
 * @returns {Promise<string>} Created document ID
 */
export async function createProject(rawProjectData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured.');
  }

  const { valid, errors, payload } = validateProjectPayload(rawProjectData);
  if (!valid) {
    const firstError = Object.values(errors)[0] || 'Invalid project data.';
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
 * Updates an existing project document in Firestore.
 * @param {string} projectId
 * @param {Object} rawProjectData
 * @returns {Promise<void>}
 */
export async function updateProject(projectId, rawProjectData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured.');
  }
  if (!projectId) {
    throw new Error('Project ID is required for update.');
  }

  const { valid, errors, payload } = validateProjectPayload(rawProjectData);
  if (!valid) {
    const firstError = Object.values(errors)[0] || 'Invalid project data.';
    throw new Error(firstError);
  }

  const projectRef = doc(db, COLLECTION_NAME, projectId);
  await updateDoc(projectRef, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a project and cleans up its associated cover image and screenshots from Firebase Storage.
 * @param {Object} project - Full project object (or `{ id, coverImagePath, screenshots }`)
 * @returns {Promise<void>}
 */
export async function deleteProject(project) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured.');
  }
  const projectId = typeof project === 'string' ? project : project?.id;
  if (!projectId) {
    throw new Error('Project ID is required for deletion.');
  }

  if (typeof project === 'object' && project !== null) {
    if (project.coverImagePath) {
      await deleteStorageFile(project.coverImagePath);
    }
    if (Array.isArray(project.screenshots)) {
      await Promise.all(
        project.screenshots.map((shot) => deleteStorageFile(shot?.storagePath))
      );
    }
  }

  await deleteDoc(doc(db, COLLECTION_NAME, projectId));
}

/**
 * Batch updates displayOrder across multiple projects when reordered in the CMS.
 * @param {Array<{ id: string, displayOrder: number }>} orderedItems
 * @returns {Promise<void>}
 */
export async function reorderProjects(orderedItems) {
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

