# 🎉 InTube v1.0.0 — The Universal Media Toolkit

> **Welcome to the official initial release of InTube (v1.0.0)!** 🚀  
> InTube is a modern, fast, and privacy-first **Universal Media Toolkit** designed to simplify downloading, converting, extracting, and transferring public media — with zero user accounts, zero tracking, and zero permanent file storage.

---

## 🌐 Live Links & Project Info

- 🚀 **Live Application**: [https://intubedl.vercel.app/](https://intubedl.vercel.app/)
- 💻 **Source Code (GitHub)**: [https://github.com/nikhilxagr/InTube](https://github.com/nikhilxagr/InTube)
- 🏷️ **Release Tag**: `v1.0.0`
- 👨‍💻 **Author**: **Nikhil Projects** ([@nikhilxagr](https://github.com/nikhilxagr))

---

## ✨ What's Included in v1.0.0

### 🔗 1. Universal URL Downloader
- **Multi-Platform Support**: High-speed downloads from **YouTube** (Videos, Shorts, 320kbps MP3), **Instagram** (Reels, Posts, Stories, Carousels), and **Facebook** (Public Videos & Reels).
- **Dual-Engine Architecture**: Native JS Innertube stream extraction with resilient `yt-dlp` fallback.
- **Smart Presets**: Choose between **Smart Auto**, **Best Quality (4K/1080p)**, **Mobile (720p)**, **Audio Only (MP3)**, and **Small File**.
- **Honest File Size Estimator**: Real-time accurate stream size calculations (`~XX MB`) before downloading.

---

### ⚡ 2. Batch URL Downloader (`/tools/batch`)
- Process up to **5 media URLs** simultaneously in a single operation.
- Automatic duplicate detection and URL deduplication.
- Parallel multi-URL analysis with one-click enqueueing into the global download manager.

---

### 📥 3. Global Download Queue
- Client-side background download queue with a strict **2-job concurrency limiter**.
- Real-time percentage progress bar, download speeds, and ETA metrics.
- Full queue management: cancel in-flight jobs, retry failed items, and clear completed tasks.
- Floating slide-over queue drawer accessible across all pages.

---

### 🎬 4. Video & Audio Processing Suite
- 🎵 **Video → Audio Extractor (`/tools/video-to-audio`)**: Extract studio-quality **MP3**, **M4A**, **WAV (16-bit Lossless PCM)**, **AAC**, and **OGG** from local video files.
- 🎼 **Audio Converter (`/tools/audio-converter`)**: Transcode between all popular audio containers with customizable bitrates (128k to 320k).
- 🎥 **Video Format Converter (`/tools/converter`)**: Transcode local videos between **MP4**, **WebM**, and **MOV** with streamable `faststart` optimization.
- 🎞️ **Video → Image Frames (`/tools/video-to-image`)**: Extract cover photos, snapshots at exact timestamps, or full frame intervals packaged into a `.zip` archive.

---

### 🖼️ 5. Sharp Image Processing Suite (`/tools/image`)
- 🔄 **Image Format Converter (`/tools/image/convert`)**: Convert graphics and photos between **JPG**, **PNG**, **WebP**, and ultra-compact **AVIF**.
- 🗜️ **Image Compressor (`/tools/image/compress`)**: High-efficiency compression with live before/after file size reduction metrics (up to 75% savings).
- 📐 **Image Resizer (`/tools/image/resize`)**: Change pixel dimensions with strict aspect ratio preservation and optional upscale lock.
- 🖼️ **HD Thumbnail Extractor (`/tools/thumbnail`)**: Grab original maximum resolution cover art from YouTube, Instagram, and Facebook in one click.

---

### 📱 6. QR Mobile Transfer (`/tools/qr-transfer` & `/transfer/:token`)
- Beam downloaded media or converted files directly to your phone without USB cables or third-party apps.
- Single-use, cryptographically secure 64-character token with a live **10-minute countdown**.
- Clean, responsive mobile landing page for instant direct downloads.

---

### ⌨️ 7. Command Palette & Global Productivity Shortcuts
- **Command Palette (`Ctrl/Cmd + K`)**: Fuzzy search and launch any tool, change themes, or navigate pages instantly.
- **`Ctrl/Cmd + V`**: Auto-populates clipboard media URLs directly into the downloader.
- **`Ctrl/Cmd + Enter`**: Triggers primary actions without taking your hands off the keyboard.
- **`?`**: Displays the interactive keyboard shortcut cheat sheet.

---

### 📲 8. Progressive Web App (PWA) & Native Share Target
- **PWA Installation**: Install InTube as a standalone native-like desktop or mobile application.
- **Web Share Target**: Share video links directly from Instagram, YouTube, or browsers directly to InTube via the native OS share sheet.
- **Service Worker Shell**: Fast caching and reliable offline shell availability.

---

### 🔒 9. Privacy by Design & Automatic Cleanup (`/privacy`)
- **Zero Accounts**: No signups, logins, emails, cookies, or databases.
- **Ephemeral Sandbox**: Each conversion executes in an isolated temporary directory (`job-uuid`).
- **Automated Purge Sweeps**: Background cleanup sweeps run every 5 minutes to purge files older than 10 minutes (TTL 600s).
- **Security Hardening**: Anti-SSRF validation, discrete child process execution (`shell: false`), Sharp decompression bomb limits (25 MP max), and strict rate-limiting.

---

## 🛠️ Technical Specifications

| Component | Technology / Stack |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, Lucide Icons, React Router v6, TanStack Query |
| **Backend** | Node.js 22 (ESM), Express 4.x, Sharp (libvips), FFmpeg / ffprobe, Archiver, Zod |
| **Deployment** | Vercel (Frontend SPA) + Render (Linux Backend Web Service) |
| **Testing** | Node.js native test runner (`node:test`, `node:assert/strict`) — 100% passing |
| **Code Quality** | ESLint — 0 errors, 0 warnings |

---

## 📦 Getting Started

```bash
# Clone the repository
git clone https://github.com/nikhilxagr/InTube.git
cd InTube

# Backend setup
cd server
npm install
npm run dev

# Frontend setup (in a new terminal)
cd ../client
npm install
npm run dev
```

---

<p align="center">
  <b>Built with ❤️ by <a href="https://github.com/nikhilxagr">Nikhil Projects</a></b><br>
  <i>Universal Media Toolkit — Fast, Stateless & Privacy-First.</i>
</p>
