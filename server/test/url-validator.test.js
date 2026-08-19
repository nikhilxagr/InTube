import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateMediaUrl, isPrivateOrReservedHost } from '../src/utils/url-validator.js';
import { InvalidUrlError } from '../src/utils/errors.js';

describe('URL Validator & Advanced SSRF Defenses', () => {
  test('allows valid public HTTPS URLs', () => {
    const validUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/shorts/abcdefgh123',
      'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.instagram.com/reel/C3abc123/',
      'https://instagram.com/p/C3xyz789/',
      'https://www.instagram.com/stories/creator/1234567890/',
      'https://instagr.am/reel/abc123xyz'
    ];

    for (const url of validUrls) {
      const parsed = validateMediaUrl(url);
      assert.ok(parsed instanceof URL);
      assert.equal(parsed.protocol, 'https:');
    }
  });

  test('rejects non-HTTP/HTTPS protocols', () => {
    const forbiddenProtocols = [
      'file:///etc/passwd',
      'file:///C:/Windows/win.ini',
      'ftp://ftp.example.com/file.mp4',
      'gopher://gopher.example.com',
      'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
      'javascript:alert(document.domain)',
      'blob:https://example.com/uuid',
      'ws://example.com/socket'
    ];

    for (const url of forbiddenProtocols) {
      assert.throws(() => validateMediaUrl(url), InvalidUrlError);
    }
  });

  test('rejects URLs containing embedded userinfo / credentials', () => {
    const credentialUrls = [
      'https://user:password@www.youtube.com/watch?v=123',
      'https://admin@instagram.com/reel/123',
      'https://user:pass@127.0.0.1/video'
    ];

    for (const url of credentialUrls) {
      assert.throws(() => validateMediaUrl(url), InvalidUrlError);
    }
  });

  test('blocks standard IPv4 private and loopback addresses', () => {
    const targets = [
      '127.0.0.1',
      '127.0.0.2',
      '127.255.255.254',
      '0.0.0.0',
      '10.0.0.1',
      '10.254.12.34',
      '172.16.0.1',
      '172.20.10.5',
      '172.31.255.254',
      '192.168.0.1',
      '192.168.1.1',
      '192.168.254.254',
      '100.64.0.1', // CGNAT
      '100.127.255.254',
      '192.0.2.1', // TEST-NET-1
      '198.51.100.1', // TEST-NET-2
      '203.0.113.1', // TEST-NET-3
      '224.0.0.1', // Multicast
      '240.0.0.1', // Reserved
      '255.255.255.255'
    ];

    for (const host of targets) {
      assert.equal(isPrivateOrReservedHost(host), true, `Expected host "${host}" to be detected as private/reserved.`);
      assert.throws(() => validateMediaUrl(`https://${host}/watch?v=123`), InvalidUrlError);
    }
  });

  test('blocks obfuscated IPv4 formats: decimal integer, octal, and hex', () => {
    const obfuscated = [
      '2130706433', // 127.0.0.1 in decimal integer
      '0x7f000001', // 127.0.0.1 in hex
      '0177.0.0.1', // 127.0.0.1 in octal
      '0x7f.0.0.1', // hex + decimal
      '2886729729', // 172.16.0.1 in integer
      '3232235521', // 192.168.0.1 in integer
      '0x0a000001', // 10.0.0.1 in hex
      '012.0.0.1', // 10.0.0.1 in octal
      '2852039166' // 169.254.169.254 in decimal integer
    ];

    for (const host of obfuscated) {
      assert.equal(isPrivateOrReservedHost(host), true, `Expected obfuscated host "${host}" to be detected as private/reserved.`);
    }
  });

  test('blocks cloud metadata endpoints and internal names', () => {
    const metadataTargets = [
      '169.254.169.254', // AWS / GCP / Azure / DigitalOcean metadata
      '169.254.1.1',
      'metadata.google.internal',
      'instance-data',
      'router.local',
      'database.internal',
      'redis.lan',
      'service.corp',
      'api.home',
      'hidden.onion',
      'mock.test',
      'sample.example',
      'localhost',
      'api.localhost'
    ];

    for (const host of metadataTargets) {
      assert.equal(isPrivateOrReservedHost(host), true, `Expected "${host}" to be blocked.`);
      assert.throws(() => validateMediaUrl(`https://${host}/meta-data`), InvalidUrlError);
    }
  });

  test('blocks IPv6 loopback, link-local, unique-local, and mapped IPv4', () => {
    const ipv6Targets = [
      '::1',
      '[::1]',
      '::',
      '[::]',
      'fe80::1',
      '[fe80::1]',
      'fe80::abcd:1234',
      'fc00::1',
      '[fc00::1]',
      'fd00::1',
      'ff02::1', // Multicast
      '::ffff:127.0.0.1', // IPv4 mapped
      '[::ffff:127.0.0.1]',
      '::ffff:10.0.0.1',
      '2001:db8::1' // Documentation
    ];

    for (const host of ipv6Targets) {
      assert.equal(isPrivateOrReservedHost(host), true, `Expected IPv6 host "${host}" to be blocked.`);
    }
  });

  test('rejects malformed URLs, empty strings, and long payloads', () => {
    assert.throws(() => validateMediaUrl(''), InvalidUrlError);
    assert.throws(() => validateMediaUrl('   '), InvalidUrlError);
    assert.throws(() => validateMediaUrl('not-a-url'), InvalidUrlError);
    assert.throws(() => validateMediaUrl('https://'), InvalidUrlError);
    assert.throws(() => validateMediaUrl(null), InvalidUrlError);
    assert.throws(() => validateMediaUrl(undefined), InvalidUrlError);
    assert.throws(() => validateMediaUrl('https://youtube.com/' + 'a'.repeat(2100)), InvalidUrlError);
  });
});
