# InTube — Modern Media Utility & Downloader

A fast, compliant, and privacy-focused media utility web application. InTube allows users to analyze public media URLs and extract authorized streams into standard video and audio formats without requiring user accounts, databases, or permanent storage.

---

## 🌟 Key Features

- **Zero-Account Stateless Architecture**: No login, no database, no persistent history, and no user tracking.
- **Vercel & Render Ready**: Optimized for serverless frontend (Vercel) and low-memory native Linux backend (Render).
- **Compliant Public Media Access**: Public metadata inspection for YouTube and Instagram without DRM circumvention, session hijacking, or private access tampering.
- **Authentic Metadata & Formats**: Displays genuine resolutions and bitrates available from public media sources.
- **Memory-Safe Streaming**: Direct read-stream piping between disk and HTTP response sockets; zero multi-megabyte RAM buffering.
- **Guaranteed Ephemeral Cleanup**: Automatic deletion of isolated UUID job folders on stream finish, client disconnect, process error, or garbage sweep.
- **Defense-in-Depth Security**: Multi-representation SSRF protection, command injection prevention (`shell: false`), path traversal containment, Windows reserved device name guards, and multi-tier rate limiting.
- **Modern UI/UX**: 15 accessible SPA routes with dark/light mode, responsive cards, format selectors, and live health telemetry.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v18.0.0+` (Recommended `v20.x` or `v22.x` LTS)
- **FFmpeg**: (Optional for local media transcoding; native on Render Linux)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/nikhilxagr/InTube.git
cd InTube

# Install all dependencies (root, server, and client)
npm install
npm run install:all
```

### 3. Run Development Server
```bash
# Run both client (5173) and server (5000) concurrently
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 🧪 Testing & Verification

InTube uses Node.js's native test runner (`node:test`) for fast, zero-dependency testing.

```bash
# Run all 83 automated tests across 25 suites
npm test

# Run workspace ESLint
npm run lint

# Build client production bundle
npm run build:client
```

---

## 🚢 Deployment (Vercel + Render)

| Component | Target Platform | Build Command | Output / Start |
| :--- | :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com) | `npm run build` (in `client/`) | `dist` |
| **Backend** | [Render](https://render.com) | `npm install --prefix server` | `npm start --prefix server` |

For full deployment documentation, environment variables, and free-tier optimization details, see [docs/deployment.md](docs/deployment.md).

---

## 📂 Project Structure

```
InTube/
├── client/                     # React 18 + Vite + Tailwind CSS Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Downloader, MediaPreview, FormatSelector, UI primitives
│   │   ├── pages/              # 15 accessible SPA pages
│   │   ├── services/           # Axios API client & MediaService
│   │   └── context/            # Theme context (Dark/Light)
│   └── vercel.json             # Vercel SPA rewrite configuration
│
├── server/                     # Express.js API & FFmpeg Streaming Backend
│   ├── src/
│   │   ├── config/             # Zod environment schema & limits
│   │   ├── controllers/        # MediaController & HealthController
│   │   ├── services/           # MediaService, FFmpegService, CleanupService
│   │   ├── providers/          # YouTube & Instagram compliant providers
│   │   ├── middleware/         # Rate limiting, Security headers, Request ID, Errors
│   │   └── utils/              # SSRF URL validator, Logger, File utils, Error classes
│   └── test/                   # Comprehensive Node.js native test suite
│
├── docs/                       # Architectural & operational documentation
│   ├── api.md                  # REST API specifications
│   ├── deployment.md           # Step-by-step Vercel & Render guide
│   ├── development.md          # Local developer workflows
│   ├── architecture.md         # Architecture blueprint
│   └── security.md             # Threat model & security hardening
│
├── render.yaml                 # Render Blueprint specification
└── package.json                # Root monorepo orchestration
```

---

## 📖 Detailed Documentation
- [Architecture & Design](docs/architecture.md)
- [API Specifications](docs/api.md)
- [Deployment Guide (Vercel + Render)](docs/deployment.md)
- [Security & SSRF Architecture](docs/security.md)
- [Local Development Guide](docs/development.md)

---

## ⚖️ Legal & Compliance
This software is intended solely for public media and content that the user owns or is authorized to process and download. It does not bypass DRM, paywalls, private access controls, or platform authentication mechanisms.
