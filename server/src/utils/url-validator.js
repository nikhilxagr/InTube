import { InvalidUrlError } from './errors.js';

const MAX_URL_LENGTH = 2048;

/**
 * Parses numeric IPv4 representations (standard dotted-decimal, hex, octal, single integer).
 * @param {string} host
 * @returns {number[] | null} Array of 4 octets [a, b, c, d] or null if not an IPv4 format
 */
function parseIPv4Octets(host) {
  // If single integer format (e.g. 2130706433 or 0x7f000001)
  if (/^(0x[0-9a-fA-F]+|\d+)$/.test(host)) {
    const num = host.startsWith('0x') ? parseInt(host, 16) : parseInt(host, 10);
    if (!isNaN(num) && num >= 0 && num <= 0xffffffff) {
      return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255
      ];
    }
    return null;
  }

  const parts = host.split('.');
  if (parts.length !== 4) return null;

  const octets = [];
  for (const part of parts) {
    if (!part || !/^(0x[0-9a-fA-F]+|0[0-7]+|\d+)$/.test(part)) {
      return null;
    }
    let val;
    if (part.startsWith('0x') || part.startsWith('0X')) {
      val = parseInt(part, 16);
    } else if (part.startsWith('0') && part.length > 1 && /^[0-7]+$/.test(part)) {
      val = parseInt(part, 8);
    } else {
      val = parseInt(part, 10);
    }

    if (isNaN(val) || val < 0 || val > 255) {
      return null;
    }
    octets.push(val);
  }

  return octets;
}

/**
 * Checks whether an IPv4 address is in a private, reserved, or loopback range.
 * @param {number[]} octets - [a, b, c, d]
 * @returns {boolean}
 */
function isPrivateIPv4(octets) {
  const [a, b] = octets;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 10.0.0.0/8 (Private Class A)
  if (a === 10) return true;

  // 100.64.0.0/10 (Shared Address Space / CGNAT RFC 6598: 100.64.0.0 - 100.127.255.255)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 169.254.0.0/16 (Link-Local & Cloud Metadata RFC 3927)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 (Private Class B: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (a === 192 && b === 0 && octets[2] === 0) return true;

  // 192.0.2.0/24 (TEST-NET-1 Documentation)
  if (a === 192 && b === 0 && octets[2] === 2) return true;

  // 192.88.99.0/24 (6to4 Relay Anycast)
  if (a === 192 && b === 88 && octets[2] === 99) return true;

  // 192.168.0.0/16 (Private Class C)
  if (a === 192 && b === 168) return true;

  // 198.18.0.0/15 (Benchmarking: 198.18.0.0 - 198.19.255.255)
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 198.51.100.0/24 (TEST-NET-2 Documentation)
  if (a === 198 && b === 51 && octets[2] === 100) return true;

  // 203.0.113.0/24 (TEST-NET-3 Documentation)
  if (a === 203 && b === 0 && octets[2] === 113) return true;

  // 224.0.0.0/4 (Multicast: 224.0.0.0 - 239.255.255.255)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reserved: 240.0.0.0 - 255.255.255.254)
  if (a >= 240) return true;

  return false;
}

/**
 * Checks whether an IPv6 address string is private, loopback, or metadata.
 * @param {string} host
 * @returns {boolean}
 */
function isPrivateIPv6(host) {
  const clean = host.replace(/^\[|\]$/g, '').toLowerCase();

  // Loopback and unspecified
  if (clean === '::1' || clean === '::' || clean === '0:0:0:0:0:0:0:1' || clean === '0:0:0:0:0:0:0:0') {
    return true;
  }

  // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1)
  if (clean.startsWith('::ffff:') || clean.includes(':ffff:')) {
    const ipv4Part = clean.split(':').pop();
    if (ipv4Part) {
      const octets = parseIPv4Octets(ipv4Part);
      if (octets && isPrivateIPv4(octets)) return true;
    }
    return true;
  }

  // Unique Local Addresses (ULA: fc00::/7 -> fc00... to fdff...)
  if (clean.startsWith('fc') || clean.startsWith('fd')) {
    return true;
  }

  // Link-Local Addresses (fe80::/10 -> fe80... to febf...)
  if (/^fe[89ab]/i.test(clean)) {
    return true;
  }

  // Multicast (ff00::/8)
  if (clean.startsWith('ff')) {
    return true;
  }

  // Documentation prefix (2001:db8::/32)
  if (clean.startsWith('2001:db8') || clean.startsWith('2001:0db8')) {
    return true;
  }

  return false;
}

/**
 * Checks if a hostname or IP targets a private, loopback, cloud metadata, or internal endpoint (SSRF defense).
 * @param {string} hostname
 * @returns {boolean}
 */
export function isPrivateOrReservedHost(hostname) {
  if (!hostname || typeof hostname !== 'string') return true;

  const host = hostname.toLowerCase().trim();

  // Localhost aliases
  if (host === 'localhost' || host.endsWith('.localhost')) {
    return true;
  }

  // Cloud metadata hostnames
  if (
    host === 'metadata.google.internal' ||
    host === 'metadata' ||
    host.endsWith('.metadata.google.internal') ||
    host === 'instance-data'
  ) {
    return true;
  }

  // Internal / intranet TLDs
  const forbiddenTlds = [
    '.local',
    '.internal',
    '.lan',
    '.corp',
    '.home',
    '.onion',
    '.test',
    '.example',
    '.invalid',
    '.arpa'
  ];
  if (forbiddenTlds.some((tld) => host === tld.slice(1) || host.endsWith(tld))) {
    return true;
  }

  // Check IPv4 format
  const ipv4Octets = parseIPv4Octets(host);
  if (ipv4Octets) {
    return isPrivateIPv4(ipv4Octets);
  }

  // Check IPv6 format (enclosed in square brackets in URL host)
  if (host.startsWith('[') || host.includes(':')) {
    return isPrivateIPv6(host);
  }

  return false;
}

/**
 * Validates a user-provided media URL against SSRF, credential stuffing, and syntax rules.
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

  // Enforce HTTP / HTTPS protocol
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new InvalidUrlError(`Protocol "${parsedUrl.protocol}" is not supported. Only HTTPS is accepted.`);
  }

  // Reject userinfo in URLs (e.g. https://user:password@evil.com)
  if (parsedUrl.username || parsedUrl.password) {
    throw new InvalidUrlError('Embedded user credentials in URLs are not permitted.');
  }

  // Block SSRF targets
  if (isPrivateOrReservedHost(parsedUrl.hostname)) {
    throw new InvalidUrlError('Access to local, private, or metadata networks is prohibited.');
  }

  return parsedUrl;
}
