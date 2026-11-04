/**
 * Input Validation & Sanitization Utilities
 * Enforces client-side schema integrity before any Firebase CUD or Storage operation.
 */

const ALLOWED_IMAGE_MIME_TYPES = [
  'image/webp',
  'image/avif',
  'image/png',
  'image/jpeg',
  'image/svg+xml',
];

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Trims and strips dangerous control characters from plain text inputs.
 * @param {unknown} input
 * @param {number} [maxLength=2000]
 * @returns {string}
 */
export function sanitizeText(input, maxLength = 2000) {
  if (typeof input !== 'string') return '';
  // Strip control characters while allowing standard whitespace
  // eslint-disable-next-line no-control-regex
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates whether a URL is a safe http/https or mailto link.
 * Allows empty strings when optional.
 * @param {string} url
 * @param {boolean} [required=false]
 * @returns {{ valid: boolean, error?: string, sanitizedUrl: string }}
 */
export function validateUrl(url, required = false) {
  const clean = sanitizeText(url, 500);
  if (!clean) {
    return required
      ? { valid: false, error: 'URL is required.', sanitizedUrl: '' }
      : { valid: true, sanitizedUrl: '' };
  }

  try {
    const parsed = new URL(clean);
    if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return {
        valid: false,
        error: 'URL must start with https://, http://, or mailto:.',
        sanitizedUrl: clean,
      };
    }
    return { valid: true, sanitizedUrl: parsed.toString() };
  } catch {
    return {
      valid: false,
      error: 'Please enter a valid URL (including https://).',
      sanitizedUrl: clean,
    };
  }
}

/**
 * Validates an uploaded image file against allowed MIME types and 5MB size cap.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file) {
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'No valid file provided.' };
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type (${file.type || 'unknown'}). Allowed: WebP, AVIF, PNG, JPEG, SVG.`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds the 5 MB maximum limit.`,
    };
  }

  return { valid: true };
}

/**
 * Validates a Project payload before saving to Firestore.
 * @param {Object} data
 * @returns {{ valid: boolean, errors: Record<string, string>, payload: Object }}
 */
export function validateProjectPayload(data) {
  const errors = {};
  const title = sanitizeText(data?.title, 140);
  const shortDescription = sanitizeText(data?.shortDescription, 600);
  const detailedDescription = sanitizeText(data?.detailedDescription, 8000);
  const category = sanitizeText(data?.category || 'Web Application', 80);

  if (!title) errors.title = 'Project title is required.';
  if (!shortDescription) errors.shortDescription = 'Short description is required.';

  const githubCheck = validateUrl(data?.githubUrl, false);
  if (!githubCheck.valid) errors.githubUrl = githubCheck.error;

  const liveCheck = validateUrl(data?.liveUrl, false);
  if (!liveCheck.valid) errors.liveUrl = liveCheck.error;

  const techTags = Array.isArray(data?.techTags)
    ? data.techTags.map((t) => sanitizeText(t, 50)).filter(Boolean)
    : [];

  const customLinks = Array.isArray(data?.customLinks)
    ? data.customLinks
        .map((link) => ({
          label: sanitizeText(link?.label, 60),
          url: sanitizeText(link?.url, 500),
        }))
        .filter((link) => link.label && link.url)
    : [];

  const screenshots = Array.isArray(data?.screenshots)
    ? data.screenshots
        .map((shot) => ({
          url: sanitizeText(shot?.url, 1000),
          storagePath: sanitizeText(shot?.storagePath, 500),
          caption: sanitizeText(shot?.caption, 200),
        }))
        .filter((shot) => shot.url)
    : [];

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    payload: {
      title,
      shortDescription,
      detailedDescription,
      category,
      coverImageUrl: sanitizeText(data?.coverImageUrl, 1000),
      coverImagePath: sanitizeText(data?.coverImagePath, 500),
      screenshots,
      techTags,
      githubUrl: githubCheck.sanitizedUrl,
      liveUrl: liveCheck.sanitizedUrl,
      customLinks,
      featured: Boolean(data?.featured),
      published: data?.published !== undefined ? Boolean(data.published) : true,
      displayOrder: Number.isFinite(Number(data?.displayOrder)) ? Number(data.displayOrder) : 0,
    },
  };
}

/**
 * Validates an Interest / Hobby payload before saving to Firestore.
 * @param {Object} data
 * @returns {{ valid: boolean, errors: Record<string, string>, payload: Object }}
 */
export function validateInterestPayload(data) {
  const errors = {};
  const title = sanitizeText(data?.title, 140);
  const description = sanitizeText(data?.description, 4000);
  const subtitle = sanitizeText(data?.subtitle, 140);

  if (!title) errors.title = 'Interest title is required.';
  if (!description) errors.description = 'Description is required.';

  const customTags = Array.isArray(data?.customTags)
    ? data.customTags.map((t) => sanitizeText(t, 50)).filter(Boolean)
    : [];

  const customAttributes = Array.isArray(data?.customAttributes)
    ? data.customAttributes
        .map((attr) => ({
          key: sanitizeText(attr?.key, 60),
          value: sanitizeText(attr?.value, 200),
        }))
        .filter((attr) => attr.key && attr.value)
    : [];

  const links = Array.isArray(data?.links)
    ? data.links
        .map((l) => ({
          label: sanitizeText(l?.label, 60),
          url: sanitizeText(l?.url, 500),
        }))
        .filter((l) => l.label && l.url)
    : [];

  const images = Array.isArray(data?.images)
    ? data.images
        .map((img) => ({
          url: sanitizeText(img?.url, 1000),
          storagePath: sanitizeText(img?.storagePath, 500),
          caption: sanitizeText(img?.caption, 200),
        }))
        .filter((img) => img.url)
    : [];

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    payload: {
      title,
      subtitle,
      description,
      coverImageUrl: sanitizeText(data?.coverImageUrl, 1000),
      coverImagePath: sanitizeText(data?.coverImagePath, 500),
      images,
      customTags,
      customAttributes,
      links,
      published: data?.published !== undefined ? Boolean(data.published) : true,
      displayOrder: Number.isFinite(Number(data?.displayOrder)) ? Number(data.displayOrder) : 0,
    },
  };
}

/**
 * Validates a Contact Form message submission.
 * @param {Object} data
 * @returns {{ valid: boolean, errors: Record<string, string>, payload: Object }}
 */
export function validateContactMessage(data) {
  const errors = {};
  const senderName = sanitizeText(data?.senderName, 100);
  const senderEmail = sanitizeText(data?.senderEmail, 150);
  const subject = sanitizeText(data?.subject || 'Portfolio Inquiry', 160);
  const message = sanitizeText(data?.message, 3000);

  if (!senderName) errors.senderName = 'Please enter your name.';
  if (!senderEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(senderEmail)) {
    errors.senderEmail = 'Please enter a valid email address.';
  }
  if (!message || message.length < 5) {
    errors.message = 'Please enter a message (at least 5 characters).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    payload: {
      senderName,
      senderEmail,
      subject,
      message,
      read: false,
    },
  };
}

