/**
 * Reusable ImageUploader Component for Admin CMS
 *
 * Supports:
 * - Single Cover Image upload & replacement via Firebase Storage (`uploadPortfolioImage`)
 * - Direct URL input fallback (for local `/assets/...` or external images)
 * - Multi-Image / Screenshot gallery uploads with caption editing and individual deletion
 */
import { useState } from 'react';
import {
  uploadPortfolioImage,
  deleteStorageFile,
} from '../../services/storageService';
import ImageWithFallback from '../common/ImageWithFallback';
import styles from './ImageUploader.module.css';

export function SingleImageUploader({
  label = 'COVER IMAGE',
  storageDirectory = 'site-assets',
  imageUrl = '',
  storagePath = '',
  onChange,
  fallbackType = 'project',
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const result = await uploadPortfolioImage(file, storageDirectory, storagePath);
      onChange({ url: result.url, storagePath: result.storagePath });
    } catch (err) {
      setError(err?.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = async () => {
    if (storagePath) {
      await deleteStorageFile(storagePath);
    }
    onChange({ url: '', storagePath: '' });
  };

  return (
    <div className={styles.uploaderBox}>
      <div className={styles.headerRow}>
        <span className={styles.label}>{label}</span>
        <span className={styles.hint}>WEBP / AVIF / PNG / JPG (MAX 5MB)</span>
      </div>

      <div className={styles.singleGrid}>
        <div className={styles.previewFrame}>
          <ImageWithFallback
            src={imageUrl}
            fallbackType={fallbackType}
            alt="Preview"
            className={styles.previewImg}
          />
        </div>

        <div className={styles.controlsCol}>
          <div className={styles.buttonRow}>
            <label className={styles.uploadLabelBtn}>
              <span>{uploading ? 'OPTIMIZING & UPLOADING...' : 'UPLOAD IMAGE'}</span>
              <input
                type="file"
                accept="image/webp,image/avif,image/png,image/jpeg,image/svg+xml"
                onChange={handleFileSelect}
                disabled={uploading}
                className={styles.hiddenFileInput}
              />
            </label>

            {imageUrl && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className={styles.removeBtn}
              >
                REMOVE
              </button>
            )}
          </div>

          <div className={styles.urlFallbackField}>
            <span className={styles.subLabel}>OR IMAGE URL / ASSET PATH:</span>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => onChange({ url: e.target.value, storagePath })}
              placeholder="/assets/portrait.webp or https://..."
              className={styles.textInput}
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

export function MultiImageUploader({
  label = 'ADDITIONAL SCREENSHOTS / GALLERY IMAGES',
  storageDirectory = 'projects/gallery',
  images = [],
  onChange,
  fallbackType = 'project',
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFilesSelect = async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;

    setUploading(true);
    setError('');
    try {
      const uploadedItems = [];
      for (const file of fileList) {
        const res = await uploadPortfolioImage(file, storageDirectory);
        uploadedItems.push({
          url: res.url,
          storagePath: res.storagePath,
          caption: file.name.replace(/\.[^/.]+$/, ''),
        });
      }
      onChange([...images, ...uploadedItems]);
    } catch (err) {
      setError(err?.message || 'Failed to upload one or more images.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveIndex = async (indexToRemove) => {
    const target = images[indexToRemove];
    if (target?.storagePath) {
      await deleteStorageFile(target.storagePath);
    }
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCaptionChange = (index, caption) => {
    const next = images.map((item, idx) =>
      idx === index ? { ...item, caption } : item
    );
    onChange(next);
  };

  return (
    <div className={styles.uploaderBox}>
      <div className={styles.headerRow}>
        <span className={styles.label}>{label}</span>
        <label className={styles.uploadLabelBtn}>
          <span>{uploading ? 'UPLOADING...' : '+ UPLOAD IMAGES'}</span>
          <input
            type="file"
            multiple
            accept="image/webp,image/avif,image/png,image/jpeg,image/svg+xml"
            onChange={handleFilesSelect}
            disabled={uploading}
            className={styles.hiddenFileInput}
          />
        </label>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      {images.length === 0 ? (
        <p className={styles.emptyNote}>No gallery images added yet.</p>
      ) : (
        <div className={styles.galleryGrid}>
          {images.map((item, idx) => (
            <div key={idx} className={styles.galleryCard}>
              <div className={styles.galleryThumb}>
                <ImageWithFallback
                  src={item.url}
                  fallbackType={fallbackType}
                  alt={item.caption || `Image ${idx + 1}`}
                />
              </div>
              <input
                type="text"
                value={item.caption || ''}
                onChange={(e) => handleCaptionChange(idx, e.target.value)}
                placeholder="Image caption..."
                className={styles.captionInput}
              />
              <button
                type="button"
                onClick={() => handleRemoveIndex(idx)}
                className={styles.deleteMiniBtn}
              >
                DELETE [X]
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

