import { InvalidUrlError } from './errors.js';

const MAX_URL_LENGTH = 2048;

/**
 * Checks if an IP or hostname belongs to a private/loopback/cloud metadata address range (SSRF guard).
 * @param {string} hostname
 * @returns {boolean}
 */
export function isPrivateOrReservedHost(hostname) {
  const host = hostname.toLowerCase().trim();

  // Localhost check
  if (host === 'localhost' || host.endsWith('.localhost') || host === '127.0.0.1' || host === '::1') {
    return true;
  }

  // IPv4 regex patterns for private / reserved networks
  // 127.0.0.0/8 (Loopback)
  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;

  // 10.0.0.0/8 (Class A Private)
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;

  // 172.16.0.0/12 (Class B Private: 172.16.x.x - 172.31.x.x)
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)) return true;

  // 192.168.0.0/16 (Class C Private)
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true;

  // 169.254.0.0/16 (Link-Local & Cloud Instance Metadata, e.g. 169.254.169.254)
  if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(host)) return true;

  // 0.0.0.0/8 (Current network)
  if (/^0\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;

  // IPv6 checks (e.g. fe80::, fc00::, ::ffff:127.0.0.1)
  if (host.startsWith('fe80:') || host.startsWith('fc00:') || host.startsWith('fd00:') || host.includes('::ffff:')) {
    return true;
  }

  // Internal common TLDs / names
  if (host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.lan') || host.endsWith('.corp')) {
    return true;
  }

  return false;
}

/**
 * Validates and parses a user-provided media URL against SSRF and syntax rules.
 * @param {string} rawUrl
 * @returns {URL}
 */
export function validateMediaUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new InvalidUrlError('A valid URL string is required.');
  }

  const trimmed = rawUrl.trim();

  if (trimmed.length === 0) {
    throw new InvalidUrlError('URL cannot be empty.');
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    throw new InvalidUrlError(`URL exceeds maximum allowable length of ${MAX_URL_LENGTH} characters.`);
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    throw new InvalidUrlError('The provided string is not a valid URL.');
  }

  // Enforce http/https protocol
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new InvalidUrlError(`Protocol "${parsedUrl.protocol}" is not supported. Use HTTPS.`);
  }

  // Block SSRF targets
  if (isPrivateOrReservedHost(parsedUrl.hostname)) {
    throw new InvalidUrlError('Access to local, private, or metadata networks is prohibited.');
  }

  return parsedUrl;
}
