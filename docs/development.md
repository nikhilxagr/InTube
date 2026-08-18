# Local Development Guide

This guide walks you through setting up and running **InTube** locally.

---

## 1. Prerequisites

- **Node.js**: `v18.0.0` or newer (Recommended: `v20.x` or `v22.x`)
- **npm**: `v9.x` or newer
- **FFmpeg**: Required for media transformation and audio extraction.

### Installing FFmpeg

#### Windows
1. Using **Winget**:
   ```powershell
   winget install Gyan.FFmpeg
   ```
   or using **Chocolatey**:
   ```powershell
   choco install ffmpeg
   ```
2. Alternatively, download the static build from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) and add the `bin` folder to your system `PATH`.
3. In `server/.env`, you can also explicitly specify `FFMPEG_PATH=C:/path/to/ffmpeg.exe`.

#### macOS
```bash
brew install ffmpeg
```

#### Linux (Debian / Ubuntu)
```bash
sudo apt update && sudo apt install -y ffmpeg
```

---

## 2. Project Setup

### 2.1 Clone and Install Dependencies
From the repository root:
```bash
# Install root orchestration tools
npm install

# Install server dependencies
cd server
npm install
cp .env.example .env

# Install client dependencies
cd ../client
npm install
cp .env.example .env

# Return to root
cd ..
```

---

## 3. Running Locally

### Option A: Run Both Frontend & Backend Concurrently (Recommended)
From the project root:
```bash
npm run dev
```

### Option B: Run Independently in Separate Terminals

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

---

## 4. Verifying Health Endpoint

Open your browser or run:
```bash
curl http://localhost:5000/api/v1/health
```

Expected output:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "intube-backend",
    "version": "1.0.0"
  }
}
```

---

## 5. Scripts Reference

### Root
- `npm run dev`: Starts both client and server concurrently with colored prefix logs.
- `npm run dev:server`: Starts backend server in watch mode.
- `npm run dev:client`: Starts Vite development server.
- `npm run build:client`: Builds the client for production.
- `npm run lint`: Runs ESLint across client and server.

### Server (`server/`)
- `npm run dev`: Runs server with Node `--watch`.
- `npm start`: Runs server in production mode.
- `npm test`: Runs backend unit and integration tests.
- `npm run lint`: Checks server code formatting and rules.

### Client (`client/`)
- `npm run dev`: Starts Vite dev server with hot module replacement (HMR).
- `npm run build`: Bundles the React application into `client/dist/`.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs ESLint across client components.
