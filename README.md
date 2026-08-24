<div align="center">

![Header](https://capsule-render.vercel.app/api?type=waving&color=0:3B82F6,25:6366F1,50:8B5CF6,75:EC4899,100:EF4444&height=220&section=header&text=InTube%20%7C%20Media%20Toolkit&fontSize=46&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Universal%20Downloader%20%7C%20Video%20%26%20Audio%20Converters%20%7C%20Image%20Suite%20%7C%20QR%20Transfer&descAlignY=56&descSize=16)

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=2400&pause=900&color=3B82F6&center=true&vCenter=true&width=900&lines=Universal+Downloader%3A+YouTube%2C+Instagram+%26+Facebook;Batch+URL+Processing+%2B+Client+Download+Queue;Video+%E2%86%92+Audio+%2B+Frame+Extractor+%2B+Format+Transcoding;Sharp+Image+Suite%3A+Convert%2C+Compress+%26+Resize;Zero-Cable+QR+Mobile+Transfer+%2B+PWA+%2B+Privacy-First" alt="Typing animation" />

### High-performance, privacy-first Universal Media Processing Suite for downloading, converting, compressing, extracting, and transferring public media — with zero accounts, zero tracking, and zero permanent storage.

<br/>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://intubedl.vercel.app/)
[![GitHub Release](https://img.shields.io/badge/Release-v1.0.0-00C2FF?style=for-the-badge&logo=github&logoColor=white)](https://github.com/nikhilxagr/InTube/releases/tag/v1.0.0)
[![Source Code](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/nikhilxagr/InTube)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%206-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Backend](https://img.shields.io/badge/Backend-Node.js%2022%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Processing](https://img.shields.io/badge/Media-FFmpeg%20%2B%20Sharp-0078D7?style=for-the-badge&logo=ffmpeg&logoColor=white)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PWA](https://img.shields.io/badge/App-PWA%20Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Stateless-success?style=for-the-badge)

</div>

---

## 🚀 Live Access & Mirrors

<table>
  <tr>
    <td align="center">
      <a href="https://intubedl.vercel.app/">
        <img src="https://img.shields.io/badge/Launch%20InTube-Live%20Web%20App-3B82F6?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Launch InTube" />
      </a>
    </td>
    <td>
      <ul>
        <li>🌐 <b>Official Production Web App:</b> <a href="https://intubedl.vercel.app/">https://intubedl.vercel.app/</a></li>
        <li>📱 <b>PWA Ready:</b> Open in Chrome / Safari on Mobile or Desktop and tap <b>"Install App"</b> in the menu for native fullscreen mode.</li>
        <li>💻 <b>GitHub Repository:</b> <a href="https://github.com/nikhilxagr/InTube">https://github.com/nikhilxagr/InTube</a></li>
      </ul>
    </td>
  </tr>
</table>

---

## 🌟 Key Features & Capabilities

### 🔗 1. Universal URL Downloader
- **Multi-Platform Coverage**: Download public videos, audio, and reels from **YouTube** (Videos, Shorts, 320kbps MP3), **Instagram** (Reels, Posts, Carousels, Stories), and **Facebook** (Public HD & SD Videos).
- **Dual-Engine Architecture**: Native JS Innertube client engine paired with resilient backend `yt-dlp` fallback.
- **Smart Presets**: Switch instantly between **Smart (Auto)**, **Best Quality (4K/1080p)**, **Mobile (720p)**, **Audio Only (320kbps MP3)**, and **Small File (480p)**.
- **Honest File Size Estimator**: Real-time calculated file size indicators (`~XX MB`) computed from duration and bitrate without fake precision.

### ⚡ 2. Batch URL Downloader (`/tools/batch`)
- **Multi-Link Input**: Paste up to **5 URLs** across YouTube, Instagram, or Facebook in a single submission.
- **URL Deduplication**: Automatic detection and filtering of duplicate URLs.
- **Parallel Analysis**: Analyzes metadata in parallel and enables one-click enqueueing into the global download manager.

### 📥 3. Global Download Queue
- **2-Job Concurrency Limiter**: Client-side background queue designed to prevent browser socket exhaustion.
- **Live Progress Metrics**: Real-time percentage bars, elapsed time, and status tracking.
- **Queue Controls**: Cancel running jobs, retry failed items, and clear completed entries.
- **Slide-Over Drawer**: Floating drawer accessible from any page in the toolkit.

### 🎬 4. Video & Audio Processing Suite
- 🎵 **Video → Audio Extractor (`/tools/video-to-audio`)**: Extract studio-quality **MP3**, **M4A / AAC**, **WAV (16-bit Lossless PCM)**, and **OGG** from local video files.
- 🎧 **Audio Converter (`/tools/audio-converter`)**: Transcode between all popular audio containers with customizable bitrates (128 kbps to 320 kbps).
- 🎥 **Video Format Converter (`/tools/converter`)**: Transcode local videos between **MP4**, **WebM**, and **MOV** with streamable `faststart` container normalization.
- 🎞️ **Video → Image Frames (`/tools/video-to-image`)**: Extract first frame covers, specific timestamp snapshots, or frame interval sequences packaged into a `.zip` archive.

### 🖼️ 5. Sharp Image Processing Suite (`/tools/image`)
- 🔄 **Image Converter (`/tools/image/convert`)**: Convert graphics and photos between **JPG**, **PNG**, **WebP**, and ultra-compact **AVIF**.
- 📉 **Image Compressor (`/tools/image/compress`)**: High-efficiency compression with live before/after byte reduction metrics (up to 75% savings).
- 🎛️ **Image Resizer (`/tools/image/resize`)**: Resize pixel dimensions with strict aspect ratio lock and optional upscale prevention.
- 🖼️ **HD Thumbnail Extractor (`/tools/thumbnail`)**: Single-click downloads of official maximum-resolution cover art from YouTube, Instagram, and Facebook in JPG or PNG.

### 📱 6. Zero-Cable QR Mobile Transfer (`/tools/qr-transfer` & `/transfer/:token`)
- **Direct PC-to-Phone Transfer**: Beam completed downloads or converted files directly to your mobile device via QR scan.
- **Cryptographic Security**: Unguessable 256-bit random tokens (`crypto.randomBytes(32).toString('hex')`) with a live **10-minute countdown**.
- **Ultra-Clean Mobile Landing**: Clean, responsive mobile download page with zero ads, zero tracking, and zero login.

### ⌨️ 7. Command Palette & Productivity Shortcuts
- **Command Palette (`Ctrl/Cmd + K`)**: Fuzzy search and execute any tool, change themes, or navigate pages instantly.
- **`Ctrl/Cmd + V`**: Auto-populates clipboard media URLs directly into the downloader input.
- **`Ctrl/Cmd + Enter`**: Triggers primary actions without lifting hands from the keyboard.
- **`?`**: Displays the interactive keyboard shortcut dialog.

### 🔒 8. Privacy by Design & Automatic Cleanup (`/privacy`)
- **Zero User Accounts**: No logins, passwords, emails, cookies, or user databases.
- **Isolated UUID Sandboxes**: Every job executes inside an isolated ephemeral directory (`/tmp/job-<uuid>`).
- **5-Minute Sweep Purges**: Automated background sweep timers permanently delete temporary directories older than 10 minutes (TTL 600s).
- **Security Hardening**: Multi-representation anti-SSRF validation, discrete child processes (`shell: false`), path traversal sanitization, and Sharp decompression bomb limits (25 MP max).

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite 6** (Modern SPA build pipeline)
- **Tailwind CSS** (Custom theme tokens, glassmorphism & responsive layouts)
- **Lucide Icons** (Clean, lightweight vector iconography)
- **React Router v6** (Client-side routing)
- **TanStack Query** (Server state management & caching)
- **Canvas Confetti** (Micro-animations on successful downloads)
- **PWA** (`manifest.webmanifest`, `sw.js` stale-while-revalidate shell caching)

### Backend
- **Node.js 22** (ES Modules) + **Express 4.x**
- **FFmpeg & ffprobe** (High-performance audio/video transcoding & frame extraction)
- **Sharp (libvips)** (High-speed native image conversion, compression & resizing)
- **Archiver** (Multi-frame ZIP archive streaming)
- **Zod** (Strict runtime schema validation)
- **Pino & Pino-HTTP** (Sanitized, structured JSON logging)

---

## 📁 Repository Structure

```text
InTube/
│
├── client/                          # React + Vite Frontend Application
│   ├── public/
│   │   ├── manifest.webmanifest     # PWA manifest with Web Share Target
│   │   ├── sw.js                    # Service Worker shell caching
│   │   ├── pwa-192x192.svg          # PWA vector icon 192px
│   │   └── pwa-512x512.svg          # PWA vector icon 512px
│   ├── src/
│   │   ├── components/
│   │   │   ├── command-palette/     # Ctrl+K Command Palette fuzzy search
│   │   │   ├── common/              # Buttons, Cards, Header, Footer, SEO, InstallAppButton
│   │   │   ├── downloader/          # Universal downloader input & dropzone
│   │   │   ├── media/               # Format selectors, presets, previewers, size estimators
│   │   │   ├── queue/               # Floating Download Queue drawer
│   │   │   └── tools/               # ToolLayout, FileDropzone, ProcessingState
│   │   ├── context/                 # DownloadQueueContext with concurrency limiter
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Main universal downloader landing page
│   │   │   ├── Tools.jsx            # All-in-one Media Toolbox dashboard
│   │   │   ├── Privacy.jsx          # Interactive privacy & lifecycle dashboard
│   │   │   ├── tools/               # Batch, Audio, Video-to-Image, Image Tools pages
│   │   │   └── QrLanding.jsx        # Mobile QR transfer receiver landing page
│   │   ├── services/                # API client services (MediaService, ToolsService)
│   │   └── routes/                  # App routes configuration
│   └── package.json
│
├── server/                          # Node.js + Express Backend API
│   ├── src/
│   │   ├── config/                  # Environment variables & constants
│   │   ├── controllers/             # Media, Tools, QR Transfer & Health controllers
│   │   ├── middleware/              # SSRF validation, multer uploads, rate limiting, errors
│   │   ├── providers/               # YouTube (Innertube), Instagram, Facebook providers
│   │   ├── routes/                  # Express REST API routes (/api/v1/* and /api/*)
│   │   ├── services/                # FFmpeg, Sharp Image, QR Transfer, TempFileManager
│   │   └── utils/                   # Safe filename sanitizers, stream helpers, errors
│   ├── test/                        # Node.js native test suite
│   └── package.json
│
├── docs/                            # In-depth architectural & API documentation
│   ├── api.md                       # REST API endpoint contracts
│   ├── tools.md                     # Comprehensive tools specification
│   ├── privacy.md                   # Privacy by design documentation
│   └── security.md                  # Security controls & SSRF defense
│
├── RELEASE_v1.0.0.md                # Official GitHub v1.0.0 Release Notes
└── README.md                        # Project documentation
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (Node 20+ / 22 recommended)
- **npm**: `v9.0.0` or higher
- **FFmpeg**: Installed in system PATH (or pre-bundled via `ffmpeg-static`)

---

### 2. Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/nikhilxagr/InTube.git
cd InTube

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in `server/`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
TEMP_DIR=./tmp
MAX_CONCURRENT_DOWNLOADS=2
TEMP_FILE_TTL_SECONDS=600
RATE_LIMIT_MAX_REQUESTS=100
```

---

### 4. Run Locally

**Start Backend (Port 5000):**
```bash
cd server
npm run dev
```

**Start Frontend (Port 5173):**
```bash
cd client
npm run dev
```

Open **`http://localhost:5173`** in your browser!

---

### 5. Running Tests & Linters

```bash
# Run backend test suite (Node test runner)
cd server
npm test

# Run ESLint across backend
npm run lint

# Run ESLint across frontend & production build
cd ../client
npm run lint
npm run build
```

---

## 🌐 API Reference

### Media Downloader Endpoints (`/api/v1/media`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/media/analyze` | Analyzes YouTube, Instagram, or Facebook URL and returns available video/audio streams |
| `GET` | `/api/v1/media/download` | Streams processed media directly to client with safe `Content-Disposition` |
| `POST` | `/api/v1/media/process` | Asynchronously initiates server-side transcoding job |
| `GET` | `/api/v1/media/job/:jobId` | Polls status of an in-flight background processing job |

### Media Tools Endpoints (`/api/v1/tools`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/tools/batch/analyze` | Analyzes an array of up to 5 URLs in parallel with automatic deduplication |
| `POST` | `/api/v1/tools/video-to-audio` | Uploads local video file and extracts MP3, M4A, WAV, or OGG audio |
| `POST` | `/api/v1/tools/audio-converter` | Transcodes between audio container formats with bitrate controls |
| `POST` | `/api/v1/tools/video-to-image` | Extracts first frame, timestamp screenshot, or frame interval ZIP archive |
| `POST` | `/api/v1/tools/image/convert` | Converts local image between JPG, PNG, WebP, and AVIF formats |
| `POST` | `/api/v1/tools/image/compress` | High-efficiency Sharp image compression with before/after reduction stats |
| `POST` | `/api/v1/tools/image/resize` | Resizes pixel dimensions while preserving aspect ratio |
| `POST` | `/api/v1/tools/thumbnail` | Retrieves official HD cover image from supported video platforms |

### QR Transfer Endpoints (`/api/v1/transfer`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/transfer/create` | Generates a 64-character ephemeral transfer token for a completed file (10-min TTL) |
| `GET` | `/api/v1/transfer/:token` | Retrieves transfer metadata for mobile phone landing view |
| `GET` | `/api/v1/transfer/:token/download` | Downloads the media file directly to the mobile phone |

---

## 👨‍💻 Connect With the Author

<div align="center">

[![Portfolio](https://img.shields.io/badge/Live%20Portfolio-00C2FF?style=for-the-badge&logo=vercel&logoColor=white)](https://nikhilxagr.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/nikhilxagr)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/nikhilxagr)

**Made with ❤️ by [Nikhil Agrahari](https://github.com/nikhilxagr)**

</div>
