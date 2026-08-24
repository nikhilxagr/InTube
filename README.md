# InTube — Universal Media Toolkit

A fast, compliant, and privacy-focused universal media utility web application. InTube provides a comprehensive suite of media processing tools — URL downloading, video-to-audio extraction, container format transcoding, official thumbnail extraction, technical metadata inspection, and zero-cable QR mobile transfers — without requiring accounts, databases, or permanent media storage.

---

## 🌟 Universal Media Suite

### 1. 🔗 Universal URL Downloader
- **YouTube**: 1080p, 720p, 480p MP4 videos, Shorts, and 320kbps MP3 audio.
- **Instagram**: Public Reels, photo albums, carousels, stories, and video posts.
- **Facebook**: HD and SD public videos and Reels.
- **Live Stream / Dual-Engine Fallback**: Native JavaScript Innertube engine + high-performance yt-dlp backend.

### 2. 🎵 Video → Audio Converter (`/tools/video-to-audio`)
- Upload local video files (MP4, WebM, MOV, MKV, AVI) and extract studio-quality audio.
- Supported output formats: **MP3**, **M4A / AAC**, **WAV** (lossless PCM), and **OGG**.
- Selectable bitrates: 128 kbps, 192 kbps, 256 kbps, 320 kbps.

### 3. 🎬 Video Format Converter (`/tools/converter`)
- Transcode local video files to standard **MP4**, **WebM**, or **MOV**.
- Presets: Balanced (Fast 1080p CRF 22), High Quality (CRF 18), Small File (CRF 28).
- Streamable faststart container normalization.

### 4. 🖼️ HD Thumbnail Downloader (`/tools/thumbnail`)
- Extract official highest-resolution covers from YouTube, Instagram, and Facebook.
- Instant single-click downloads in **JPG** or **PNG** format.

### 5. 🔍 Media Metadata Inspector (`/tools/metadata`)
- Deep technical spec inspection with FFmpeg / ffprobe.
- Inspects codecs, frame rate, sample rate, channels, bitrate, dimensions, and duration.
- One-click `Copy JSON` for developers and creators.

### 6. 📱 QR Mobile Direct Transfer (`/tools/qr-transfer` & `/transfer/:token`)
- Beam processed downloads or audio conversions directly from PC to mobile phone.
- Single-use, cryptographically secure 64-character token with live 10-minute expiration timer.
- Ultra-clean mobile landing page with zero ads, zero tracking, and zero login required.

### 7. ⚡ Keyboard Shortcut Workflow & Smart Dropzone
- `Ctrl/Cmd + V`: Auto-populate media URL from clipboard into downloader.
- `Enter`: Instant analyze on focused input.
- `Ctrl/Cmd + Enter`: Trigger primary action (Analyze / Download / Convert).
- `Escape`: Clear active alerts, modals, or error notices.
- `?`: Open keyboard shortcuts helper modal.
- Smart Dropzone: Automatically detects local media files dropped into the URL bar and offers quick converter tools.

---

## 🔒 Privacy & Security Model

- **Zero Accounts & Zero Tracking**: No logins, passwords, emails, cookies, or user databases.
- **Stateless & Ephemeral**: Media files reside strictly inside isolated UUID temp folders and are purged immediately upon download completion, connection abort, or expiration.
- **Cryptographic QR Tokens**: Unguessable 256-bit random tokens (`crypto.randomBytes(32).toString('hex')`) with automatic garbage collection after 10 minutes.
- **Strict Compliance**: No DRM circumvention, no session scraping, and no private access bypass. Only processes authorized, public media.
- **Defense in Depth**: Multi-representation SSRF validation, discrete argument execution (`shell: false`), path traversal containment guards, and multi-tier rate limiting.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v18.0.0+` (Recommended `v20.x` or `v22.x` LTS)
- **FFmpeg**: Bundled via `ffmpeg-static` for zero-setup execution.

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/nikhilxagr/InTube.git
cd InTube

# Install all dependencies (server and client)
npm install --prefix server
npm install --prefix client
```

### 3. Run Development Server
```bash
# Terminal 1 - Backend Server (Port 5000)
npm run dev --prefix server

# Terminal 2 - Frontend Client (Port 5173)
npm run dev --prefix client
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 🧪 Testing & Verification

```bash
# Run server test suite
npm test --prefix server

# Run client and server linters
npm run lint --prefix client
npm run lint --prefix server

# Production build verification
npm run build --prefix client
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service health telemetry, memory stats & uptime |
| `POST` | `/api/v1/media/analyze` | Analyzes public media URL metadata |
| `POST` | `/api/v1/media/job` | Initiates background download job with progress tracking |
| `GET` | `/api/v1/media/job/:jobId/progress` | Polls active download percentage, speed, and ETA |
| `GET` | `/api/v1/media/job/:jobId/file` | Streams completed media binary with cleanup |
| `POST` | `/api/v1/tools/inspect` | Multipart upload for technical metadata inspection |
| `POST` | `/api/v1/tools/video-to-audio` | Converts uploaded video to MP3, M4A, WAV, AAC, or OGG |
| `POST` | `/api/v1/tools/convert` | Converts uploaded video to MP4, WebM, or MOV |
| `POST` | `/api/v1/tools/thumbnail` | Retrieves authentic HD cover image URL |
| `POST` | `/api/v1/transfer/create` | Registers an ephemeral QR transfer token |
| `GET` | `/api/v1/transfer/:token` | Retrieves transfer metadata for mobile phone landing |
| `GET` | `/api/v1/transfer/:token/download` | Streams file to mobile device |

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
HOST=0.0.0.0
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,https://intubedl.vercel.app
MAX_FILE_SIZE_MB=100
MAX_UPLOAD_SIZE_MB=50
MAX_PROCESSING_TIME_MS=120000
TRANSFER_EXPIRATION_SECONDS=600
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DOWNLOAD_RATE_LIMIT_MAX=20
```

### Frontend (`client/.env`)
```env
VITE_API_BASE_URL=https://intube-backend-lj8g.onrender.com/api/v1
```

---

## ☁️ Deployment

- **Frontend Target**: Vercel (`https://intubedl.vercel.app/`)
- **Backend Target**: Render Linux Web Service (`https://intube-backend-lj8g.onrender.com`)

### Render / Vercel Architecture Notes
- Render free tier instances operate on an ephemeral filesystem with 512MB RAM.
- All temporary files and QR transfers are cleaned up aggressively to ensure lightweight memory and disk footprints.

---

## 📄 License

MIT © Nikhil Projects
