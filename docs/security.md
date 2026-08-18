# Security Architecture & Policies

Security is built into the core design of InTube. Because media processing deals with user-supplied URLs and external binary tools (FFmpeg), robust defense-in-depth measures are strictly enforced.

---

## 1. SSRF (Server-Side Request Forgery) Protection

User URLs are untrusted. The `url-validator` module checks every input before any network requests occur:

- **Protocol Whitelist**: Only `http:` and `https:` are permitted. Schemes like `file:`, `ftp:`, `gopher:`, `data:` are immediately rejected.
- **Loopback & Private Network Blocking**:
  - `127.0.0.0/8` (Localhost)
  - `10.0.0.0/8` (Private Class A)
  - `172.16.0.0/12` (Private Class B)
  - `192.168.0.0/16` (Private Class C)
  - `169.254.0.0/16` (Link-local & AWS/GCP/Azure Metadata Services, e.g., `169.254.169.254`)
  - `::1`, `fc00::/7`, `fe80::/10` (IPv6 loopback & private ranges)
- **Domain Verification**: Requests are only routed to registered, validated provider hostnames (e.g., `*.youtube.com`, `youtu.be`, `*.instagram.com`).

---

## 2. Command Injection & Safe Process Spawning

- **No Shell Execution**: The backend never constructs shell strings (`exec("ffmpeg -i " + input)`).
- **Safe Argument Arrays**: All process invocations use `spawn` or `execFile` with explicit argument arrays.
- **Sanitized Filenames**: User inputs (e.g., video titles) are never used directly as filesystem paths. Safe alphanumeric slugs and UUIDs are assigned for internal operations.

---

## 3. Ephemeral File Handling & Path Traversal

- **Isolated Temporary Directories**: Each processing job is allocated a unique path under `server/temp/<uuid>/`.
- **Path Traversal Guards**: Paths are checked using `path.resolve` to ensure they never escape the `temp/` base directory.
- **Guaranteed Cleanup**: Temporary directories are purged on:
  - Job completion
  - Job error / exception
  - Processing timeout
  - Client connection close (`req.on('close')`)
  - Server startup (orphaned sweep)

---

## 4. Rate Limiting & Denial of Service Defense

- **Windowed IP Limiting**: Express rate limiters protect the `/api/v1/media/analyze` and `/api/v1/media/download` endpoints.
- **Concurrency Guard**: Limits concurrent active FFmpeg transcode processes to prevent CPU/memory exhaustion on free-tier servers.
- **Body Size Caps**: JSON request bodies are capped at 50KB to prevent memory exhaustion.
- **Processing Timeouts**: Heavy FFmpeg operations are aborted after a hard limit (e.g., 120 seconds).

---

## 5. Privacy & Sensitive Data

- **No User Tracking**: No cookies, session storage, authentication tokens, or personal identifiers are stored.
- **Redacted Logging**: Structured logger (Pino) sanitizes log outputs, stripping query parameters, auth tokens, or signed URLs.
