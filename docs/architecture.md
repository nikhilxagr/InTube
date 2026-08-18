# Architecture Design Document

## 1. Overview & System Philosophy

**InTube** is a lightweight, stateless, and high-performance media utility web application designed to analyze public media URLs and extract/process authorized streams into user-selected formats (e.g., MP4 video, MP3/M4A audio).

The application is architected around the following foundational principles:

1. **Stateless Operations**: No database (MongoDB, SQL), no long-term media storage, no user accounts, and no persistent download histories.
2. **Provider Abstraction**: Decoupled platform-specific extractors (YouTube, Instagram, etc.) adhering to a standardized interface, allowing rapid expansion to future providers without modifying routing or business logic.
3. **Ephemeral & Safe Media Processing**: Media is processed inside unique, isolated temporary directories (`server/temp/<uuid>/`) and cleaned up immediately upon completion, error, client abort, or timeout.
4. **Defense in Depth**: Zero-trust approach to user input, SSRF defenses blocking private/loopback/cloud IP addresses, strict schema validation using Zod, rate limiting, and safe argument invocation for FFmpeg.
5. **Decoupled Client-Server**: React + Vite frontend communicating over clean RESTful endpoints (`/api/v1`) with CORS protection.

---

## 2. High-Level Architecture Diagram

```
+-------------------------------------------------------------------------+
|                              Client (Vercel)                            |
|  - React 18 + Vite SPA                                                 |
|  - TanStack Query (Server State) + React Router v6                      |
|  - Tailwind CSS + Lucide Icons                                          |
|  - Truthful Progress & Health State Monitoring                          |
+------------------------------------+------------------------------------+
                                     |
                          HTTPS / REST API JSON
                                     |
+------------------------------------v------------------------------------+
|                              Server (Render)                            |
|                                                                         |
|  [Security Middlewares]                                                 |
|    - Helmet (Headers)                                                   |
|    - CORS (Frontend Origin Verification)                                |
|    - Rate Limiter (IP-based windowing)                                  |
|    - Request Size Limits & Sanitization                                 |
|                                                                         |
|  [Routers & Controllers]                                                |
|    - GET  /api/v1/health                                                |
|    - POST /api/v1/media/analyze                                         |
|    - POST /api/v1/media/download                                        |
|                                                                         |
|  [Service & Business Layer]                                             |
|    - URL Validator & SSRF Guard                                         |
|    - Platform Detector                                                  |
|    - Provider Registry                                                  |
|        ├── YouTubeProvider                                              |
|        └── InstagramProvider                                            |
|    - MediaService (Coordination & Normalization)                        |
|    - FFmpegService (Safe Process Spawning & Media Transformation)       |
|    - CleanupService (Guaranteed Lifecycle Directory Purging)            |
|                                                                         |
|  [Ephemeral Storage]                                                    |
|    - server/temp/<job-uuid>/... (Purged via finally/signal handlers)    |
+-------------------------------------------------------------------------+
```

---

## 3. Core Component Responsibilities

### 3.1 Server Layer
- **`src/config/config.js`**: Environment variable parsing and strict validation with Zod.
- **`src/utils/url-validator.js`**: Rejects invalid protocols, malformed URLs, localhost, private IP ranges (RFC 1918, RFC 4193), AWS/GCP metadata endpoints (169.254.169.254), and loopback interfaces.
- **`src/utils/platform-detector.js`**: Inspects domain names and route patterns to match the corresponding provider key (`youtube`, `instagram`, or `unknown`).
- **`src/providers/provider.interface.js`**: Standardized contract containing `canHandle`, `validate`, `getMetadata`, `getFormats`, `processDownload`, and `normalizeMetadata`.
- **`src/providers/provider-registry.js`**: Central singleton maintaining registered providers.
- **`src/services/media.service.js`**: Coordinates validation, provider selection, metadata retrieval, and preparation of download streams.
- **`src/services/ffmpeg.service.js`**: Wraps FFmpeg process invocation using argument arrays (preventing shell injection) with configurable processing timeouts.
- **`src/services/cleanup.service.js`**: Cleans individual job directories and performs background sweep of stale orphaned directories on server initialization.

### 3.2 Client Layer
- **`src/services/api.js`**: Configured Axios client with standardized timeout and interceptors.
- **`src/services/media.service.js`**: Frontend service querying the `/api/v1` endpoints.
- **`src/components/downloader/Downloader.jsx`**: Central workflow state machine (`IDLE` -> `VALIDATING` -> `ANALYZING` -> `READY` -> `PROCESSING` -> `COMPLETED` / `ERROR`).
- **`src/components/media/MediaPreview.jsx`**: Displays truthful metadata (thumbnail, title, author, duration, dimensions, formats).
- **`src/components/media/FormatSelector.jsx`**: Allows selecting only authentic, verified formats.

---

## 4. Future Scalability Path

While initially operating without Redis or external job queues to keep maintenance simple, the boundary separation:
```
Controller -> MediaService -> Provider -> ProcessingService
```
ensures that when user volume grows, the application can switch to:
```
Controller -> JobQueue (BullMQ/Redis) -> Worker Pool -> ProcessingService -> Object Storage / Direct CDN Pipe
```
with zero modifications to core provider extraction or validation logic.
