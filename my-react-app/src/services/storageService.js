/**
 * Firebase Storage Service
 *
 * Manages organized directory uploads (`projects/{id}/`, `interests/{id}/`, `site-assets/`),
 * client-side WebP compression, atomic replacement of existing images, and cleanup.
 */
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage, isFirebaseConfigured } from '../config/firebase';
import { validateImageFile } from '../utils/validationUtils';
import { optimizeImageForUpload } from '../utils/imageUtils';
import { slugify } from '../utils/formatters';

/**
 * Uploads an image file to Firebase Storage after validation and WebP optimization.
 * If `previousStoragePath` is provided, deletes the old file after the new upload succeeds.
 *
 * @param {File} file - Image file to upload
 * @param {string} directory - Target folder e.g. `projects/proj-123` or `site-assets`
 * @param {string} [previousStoragePath=''] - Optional old storage path to clean up
 * @returns {Promise<{ url: string, storagePath: string }>}
 */
export async function uploadPortfolioImage(file, directory, previousStoragePath = '') {
  if (!isFirebaseConfigured || !storage) {
    throw new Error('Firebase Storage is not configured. Check your .env file.');
  }

  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const optimizedFile = await optimizeImageForUpload(file);
  const ext = optimizedFile.name.split('.').pop() || 'webp';
  const baseSlug = slugify(optimizedFile.name.replace(/\.[^/.]+$/, ''));
  const cleanDir = String(directory || 'site-assets').replace(/^\/+|\/+$/g, '');
  const storagePath = `${cleanDir}/${baseSlug}_${Date.now()}.${ext}`;

  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, optimizedFile, {
    contentType: optimizedFile.type,
    customMetadata: {
      uploadedAt: new Date().toISOString(),
    },
  });

  const url = await getDownloadURL(storageRef);

  // Clean up replaced image if applicable
  if (previousStoragePath && previousStoragePath !== storagePath) {
    await deleteStorageFile(previousStoragePath);
  }

  return { url, storagePath };
}

/**
 * Safely deletes a file from Firebase Storage by its storage path.
 * Ignores `storage/object-not-found` so deletions are idempotent.
 *
 * @param {string} storagePath
 * @returns {Promise<void>}
 */
export async function deleteStorageFile(storagePath) {
  if (!storagePath || !isFirebaseConfigured || !storage) return;
  // Never attempt to delete local static fallback assets in /assets/
  if (storagePath.startsWith('/assets/') || storagePath.startsWith('http')) return;

  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (error) {
    if (error?.code !== 'storage/object-not-found') {
      console.warn('[Storage Delete Warning]:', error?.message || error);
    }
  }
}

