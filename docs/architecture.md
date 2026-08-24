# Architecture Design Document

## 1. Overview & System Philosophy

**InTube** is a lightweight, stateless, and high-performance **Universal Media Toolkit** designed to analyze public media URLs and provide client-side and server-side utilities (video-to-audio extraction, video format conversion, thumbnail extraction, technical metadata inspection, and QR mobile transfers).

### Foundational Principles:
1. **Stateless Operations**: No database (MongoDB, SQL), no long-term media storage, no user accounts, and no persistent download histories.
2. **Provider Abstraction**: Decoupled platform extractors (YouTube, Instagram, Facebook) adhering to a standardized interface.
3. **Ephemeral & Safe Media Processing**: Media is processed inside unique, isolated temporary directories (`server/temp/<uuid>/`) and cleaned up immediately upon completion, error, client abort, or timeout.
4. **Defense in Depth**: Zero-trust approach to user input, SSRF defenses blocking private/loopback/cloud IP addresses, strict schema validation using Zod, rate limiting, and safe discrete argument invocation for FFmpeg.
5. **Decoupled Client-Server**: React + Vite frontend communicating over clean RESTful endpoints (`/api/v1`) with CORS protection.

---

## 2. High-Level Architecture Diagram

```
+-------------------------------------------------------------------------+
|                              Client (Vercel)                            |
|  - React 18 + Vite SPA                                                 |
|  - TanStack Query + React Router v6                                     |
|  - Tailwind CSS + Lucide Icons                                          |
|  - Universal Media Toolbox Dashboard (/tools)                          |
|  - Video → Audio (/tools/video-to-audio)                                |
|  - Video Converter (/tools/converter)                                   |
|  - HD Thumbnail Downloader (/tools/thumbnail)                           |
|  - Metadata Inspector (/tools/metadata)                                 |
|  - Standalone Mobile Transfer (/transfer/:token)                        |
|  - Keyboard Shortcut System (Ctrl+V, Ctrl+Enter, Esc, ?)               |
+------------------------------------+------------------------------------+
                                     |
                          HTTPS / REST API JSON & Multipart Streams
                                     |
+------------------------------------v------------------------------------+
|                              Server (Render)                            |
|                                                                         |
|  [Security Middlewares]                                                 |
|    - Helmet (Security Headers)                                          |
|    - CORS (Whitelisted Origin Verification)                             |
|    - Rate Limiter (Global, Analyze, Download tiers)                     |
|    - Multer Upload Guard (50MB size limit, MIME & extension whitelist)  |
|                                                                         |
|  [Routers & Controllers]                                                |
|    - mediaRouter (health, analyze, job, download)                       |
|    - toolsRouter (inspect, video-to-audio, convert, thumbnail, transfer)|
|                                                                         |
|  [Service & Business Layer]                                             |
|    - URL Validator & SSRF Guard                                         |
|    - Platform Detector & Provider Registry (YT, IG, FB)                 |
|    - MediaService & JobService (In-memory download jobs)                |
|    - TransferService (64-char crypto tokens, in-memory transfer store)  |
|    - FFmpegService (Probe, WAV/MP3 audio, MP4/WebM/MOV transcode)       |
|    - CleanupService (Lifecycle directory purging & stale sweeps)        |
|                                                                         |
|  [Ephemeral Storage]                                                    |
|    - server/temp/<job-uuid>/... (Purged via finally/signal handlers)    |
+-------------------------------------------------------------------------+
```

---

## 3. Ephemeral Storage & QR Transfer Model

### Ephemeral Storage
- Every job/upload allocates a random UUID folder: `server/temp/<uuid>/`.
- Input filenames are stripped of control characters, path separators, and Windows reserved names.
- Files are cleaned up in `finally` blocks, `res.on('finish')`, and `res.on('close')`.
- Orphaned directories older than 1 hour are purged on server startup and periodic background intervals.

### QR Transfer Security Model
1. Completed media downloads or conversions can create a transfer record via `TransferService`.
2. A cryptographically random 256-bit token is generated: `crypto.randomBytes(32).toString('hex')`.
3. The token is bound to the file with an expiration timestamp (default: 600s / 10 minutes).
4. The client renders an SVG QR code pointing to `${origin}/transfer/${token}`.
5. The mobile phone scans the QR code and opens the lightweight mobile landing page.
6. When downloaded, the file streams directly to the phone and is cleaned up.
