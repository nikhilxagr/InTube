# InTube Local Development Guide

This document covers local setup, project structure, testing workflows, and best practices for developing InTube.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ / v22 LTS recommended)
- **npm**: v9.0.0 or higher
- **FFmpeg**: (Optional for local media transcoding tests). If not installed on your system PATH, basic metadata and mocks run normally, but local media conversions will require FFmpeg on PATH.

### Installing FFmpeg Locally
- **Windows**: `winget install Gyan.FFmpeg` or `choco install ffmpeg`
- **macOS**: `brew install ffmpeg`
- **Linux (Ubuntu/Debian)**: `sudo apt update && sudo apt install -y ffmpeg`

---

## 2. Project Architecture & Monorepo Layout

```
InTube/
├── client/                     # Vite + React 18 frontend
│   ├── public/                 # Favicons & static assets
│   ├── src/
│   │   ├── components/         # Reusable UI primitives, downloader, media previews
│   │   ├── pages/              # 15 accessible SPA routes
│   │   ├── services/           # Axios API client & MediaService
│   │   ├── context/            # Theme context (Light/Dark mode)
│   │   └── constants/          # Platforms, downloader states, navigation
│   └── package.json
│
├── server/                     # Express.js Node backend
│   ├── src/
│   │   ├── config/             # Zod environment validation
│   │   ├── controllers/        # Express route handlers
│   │   ├── services/           # MediaService, FFmpegService, CleanupService
│   │   ├── providers/          # YouTube & Instagram compliant providers
│   │   ├── middleware/         # Security, Rate Limiting, Request ID, Error handling
│   │   └── utils/              # SSRF URL validator, logger, file utils, errors
│   ├── test/                   # Comprehensive Node.js native test suite
│   └── package.json
│
├── docs/                       # Architectural & operational documentation
│   ├── api.md                  # REST API specifications
│   ├── deployment.md           # Vercel + Render production guide
│   ├── development.md          # Local developer workflows
│   └── security.md             # Security threat model & hardening
│
├── render.yaml                 # Render Blueprint configuration
└── package.json                # Root monorepo scripts & dependencies
```

---

## 3. Getting Started

### 3.1 Initial Setup
Clone the repository and install dependencies across root, server, and client:

```bash
git clone https://github.com/nikhilxagr/InTube.git
cd InTube

# Install root, server, and client packages
npm install
npm run install:all
```

### 3.2 Environment Setup
The server automatically loads environment variables with safe defaults. To customize:

```bash
# In server/
cp .env.example .env
```

Default `.env` settings:
```ini
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=info
MAX_FILE_SIZE_MB=100
MAX_PROCESSING_TIME_MS=120000
```

### 3.3 Running Development Servers
To run both backend (port 5000) and frontend (port 5173 with proxy) concurrently:

```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api/v1`
- **Health Telemetry**: `http://localhost:5000/api/v1/health`

---

## 4. Running Tests & Quality Verification

InTube uses Node.js's native test runner (`node:test`) with zero test dependencies for maximum performance and stability.

### 4.1 Run All Tests
```bash
npm test
```

### 4.2 Run Test Suites Selectively
```bash
# Server unit & integration tests
npm test --prefix server

# Specific test suite
node --test server/test/youtube.test.js
node --test server/test/security-hardening.test.js
node --test server/test/download.test.js
```

### 4.3 Linting
```bash
npm run lint
```

### 4.4 Production Build Verification
```bash
npm run build:client
```
