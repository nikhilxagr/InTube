import path from 'path';

const WINDOWS_RESERVED_NAMES = new Set([
  'con', 'prn', 'aux', 'nul',
  'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9',
  'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9'
]);

/**
 * Generates a filesystem-safe, clean, and normalized filename.
 * Prevents path traversal, illegal characters, duplicate extensions, and Windows reserved names.
 *
 * @param {string} title - Raw title or original filename
 * @param {string} targetExt - Expected file extension (e.g. 'mp4', 'mp3', 'jpg')
 * @param {string} [prefix='media'] - Fallback prefix if title is empty
 * @param {number} [maxLen=80] - Maximum base name length
 * @returns {string} Safe filename with single extension
 */
export function generateSafeFilename(title, targetExt, prefix = 'media', maxLen = 80) {
  const cleanExt = (targetExt || '').replace(/^\.+/, '').toLowerCase().trim();

  if (!title || typeof title !== 'string') {
    return `${prefix}_${Date.now()}.${cleanExt || 'bin'}`;
  }

  // 1. Strip any incoming directory paths
  let base = path.basename(title);

  // 2. If base already ends with the target extension, strip it before processing
  if (cleanExt && base.toLowerCase().endsWith(`.${cleanExt}`)) {
    base = base.slice(0, -(cleanExt.length + 1));
  }

  // 3. Remove non-printable / control characters and illegal filesystem chars: <>:"/\|?*
  base = base
    .replace(/[\x00-\x1F\x7F<>:"/\\|?*]/g, ' ')
    // Replace sequences of dots (prevent .. path traversal)
    .replace(/\.{2,}/g, '.')
    // Normalize whitespace to hyphens
    .replace(/\s+/g, '-')
    // Remove repeated hyphens
    .replace(/-+/g, '-')
    // Trim leading/trailing hyphens and dots
    .replace(/^[-.]+|[-.]+$/g, '')
    .trim();

  // 4. Check for Windows reserved device names
  const lowerBase = base.toLowerCase();
  if (!base || WINDOWS_RESERVED_NAMES.has(lowerBase)) {
    base = `${prefix}_${Date.now()}`;
  }

  // 5. Truncate to maximum length safely
  if (base.length > maxLen) {
    base = base.slice(0, maxLen).replace(/[-.]+$/, '');
  }

  if (!base) {
    base = `${prefix}_${Date.now()}`;
  }

  return cleanExt ? `${base}.${cleanExt}` : base;
}
