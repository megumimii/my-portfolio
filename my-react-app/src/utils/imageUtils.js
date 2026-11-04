/**
 * Client-Side Image Optimization & WebP Conversion Utility
 * Automatically resizes oversized uploads and converts raster images to optimized WebP
 * before uploading to Firebase Storage.
 */

/**
 * Compresses and converts a raster image File (PNG/JPEG/WebP) into an optimized WebP File.
 * Leaves SVGs and AVIFs untouched.
 *
 * @param {File} file - Original file selected by the user
 * @param {Object} [options]
 * @param {number} [options.maxWidth=1920] - Maximum width in pixels
 * @param {number} [options.maxHeight=1920] - Maximum height in pixels
 * @param {number} [options.quality=0.86] - WebP compression quality (0 to 1)
 * @returns {Promise<File>} Optimized File ready for Firebase Storage upload
 */
export async function optimizeImageForUpload(
  file,
  { maxWidth = 1920, maxHeight = 1920, quality = 0.86 } = {}
) {
  if (!file || typeof document === 'undefined') return file;

  // Keep vector SVGs or already-compact AVIFs intact
  if (file.type === 'image/svg+xml' || file.type === 'image/avif') {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const optimizedFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(optimizedFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

