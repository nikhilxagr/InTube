/**
 * Supported platform identifiers
 */
export const PLATFORMS = {
  YOUTUBE: 'youtube',
  INSTAGRAM: 'instagram',
  UNKNOWN: 'unknown'
};

/**
 * Detects the media platform from a validated URL object.
 * @param {URL} parsedUrl
 * @returns {string} One of PLATFORMS enum
 */
export function detectPlatform(parsedUrl) {
  if (!parsedUrl || !parsedUrl.hostname) {
    return PLATFORMS.UNKNOWN;
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // YouTube matchers
  if (
    hostname === 'youtube.com' ||
    hostname.endsWith('.youtube.com') ||
    hostname === 'youtu.be' ||
    hostname.endsWith('.youtu.be')
  ) {
    return PLATFORMS.YOUTUBE;
  }

  // Instagram matchers
  if (
    hostname === 'instagram.com' ||
    hostname.endsWith('.instagram.com') ||
    hostname === 'instagr.am' ||
    hostname.endsWith('.instagr.am')
  ) {
    return PLATFORMS.INSTAGRAM;
  }

  return PLATFORMS.UNKNOWN;
}
