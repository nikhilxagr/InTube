# Security Architecture & Hardening Guide

InTube is built with defense-in-depth security principles across all networking, process execution, input parsing, and filesystem layers.

---

## 1. Threat Model & Mitigations

### 1.1 SSRF (Server-Side Request Forgery)
- **Attack Vector**: An attacker supplies internal IP addresses (`127.0.0.1`, `10.0.0.0/8`, `169.254.169.254`) or obfuscated formats (hex, octal, decimal integer) to probe internal network services or cloud metadata.
- **Defenses**:
  - `url-validator.js` enforces strict protocol whitelisting (`http:`, `https:` only).
  - Normalizes and decodes dotted IPv4, hex (`0x7f000001`), octal (`0177.0.0.1`), and integer (`2130706433`) IP formats.
  - Blocks all loopback (`127.0.0.0/8`), private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `100.64.0.0/10`), documentation IPs (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`), multicast, and broadcast.
  - Blocks cloud instance metadata endpoints (`169.254.169.254`, `metadata.google.internal`, `100.100.100.200`, `instance-data`).
  - Blocks IPv6 loopback (`::1`), link-local (`fe80::/10`), unique-local (`fc00::/7`), and IPv4-mapped IPv6 (`::ffff:127.0.0.1`).
  - Rejects embedded userinfo credentials (`https://user:pass@host`).
  - Clamps URL length to a maximum of 2,048 characters.

---

### 1.2 Command Injection
- **Attack Vector**: An attacker crafts malicious media titles or parameters to execute arbitrary shell commands via FFmpeg.
- **Defenses**:
  - `FFmpegService` uses `child_process.spawn` exclusively with discrete string arrays.
  - `shell: false` is strictly enforced, preventing any shell evaluation (`sh`, `bash`, `cmd.exe`, `powershell`).
  - Path arguments starting with a dash `-` are prefixed with `./` to prevent FFmpeg option injection.
  - All operations are bounded by execution timeouts (`SIGKILL` on timeout).

---

### 1.3 Path Traversal
- **Attack Vector**: An attacker injects `../` sequences or reserved filenames to access or overwrite arbitrary files on disk.
- **Defenses**:
  - `isPathContained()` uses `path.resolve` and `path.relative` to ensure all filesystem operations remain strictly inside designated `temp/` boundaries.
  - `sanitizeFilename()` strips path separators (`/`, `\`), null bytes (`\0`), control characters, and leading/trailing dots and dashes.
  - Blocks Windows reserved device names (`CON`, `PRN`, `AUX`, `NUL`, `COM1-9`, `LPT1-9`).
  - Every job runs in an isolated UUID v4 directory.

---

### 1.4 DoS & Resource Exhaustion
- **Attack Vector**: An attacker streams multi-gigabyte files to overwhelm server RAM or fill server disk.
- **Defenses**:
  - **Memory-Safe Streaming**: Binary downloads pipe filesystem streams directly to response sockets without accumulating multi-megabyte buffers in Node.js heap memory.
  - **Body Parser Limits**: Request payloads are clamped to 50KB.
  - **Download Stream Size Limits**: `streamUrlToFile` verifies `Content-Length` and tracks stream byte counters in real time. If downloaded bytes exceed `MAX_FILE_SIZE_MB` (default 100MB), the stream is destroyed and `FileTooLargeError` (HTTP 413) is thrown.
  - **Multi-Tier Rate Limiting**: Global (100 req/15m), Analyze (30 req/5m), Download (20 req/15m).
  - **Guaranteed Ephemeral Cleanup**: Isolated job folders are deleted on stream finish, client socket abort, process errors, and server sweep crons.

---

### 1.5 Sensitive Data & Header Hardening
- **Pino Logger Redaction**: Automatically redacts `authorization`, `cookie`, `set-cookie`, `x-auth-token`, `x-api-key`, `password`, `token`, and `secret`.
- **Helmet Security Headers**: Enforces strict CSP, HSTS (`max-age=31536000`), X-Content-Type-Options (`nosniff`), X-Frame-Options (`SAMEORIGIN`), Referrer-Policy (`no-referrer`).
- **CORS Policy**: Restricts cross-origin requests to configured frontend origin in production and exposes standard download headers (`Content-Disposition`, `Content-Length`, `X-Request-ID`).
