# Deployment Guide

InTube is architected for straightforward zero-cost deployment:
- **Frontend SPA**: Hosted on **Vercel** (Global Edge CDN)
- **Backend Node.js API**: Hosted on **Render** (Web Service with native Node.js and Linux FFmpeg)

No database, Redis cluster, Docker container, or VPS is required.

---

## 1. Backend Deployment (Render)

### 1.1 Web Service Configuration
1. Connect your repository to Render.
2. Select **Web Service**.
3. Set the following settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free / Starter

### 1.2 FFmpeg on Render
Render's default Linux environment includes `ffmpeg` pre-installed on standard Ubuntu/Debian bases. If not present on a minimal base, add a custom build command or use the standard Node runtime.

### 1.3 Backend Environment Variables
Set the following variables in the Render Dashboard:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode |
| `PORT` | `10000` (or leave default assigned by Render) | Listening port |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Vercel production frontend domain for CORS |
| `MAX_FILE_SIZE_MB` | `100` | Maximum media processing size |
| `MAX_PROCESSING_TIME_MS` | `120000` | Timeout for FFmpeg execution |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 15 minutes window |
| `RATE_LIMIT_MAX_REQUESTS`| `100` | Limit per IP |

---

## 2. Frontend Deployment (Vercel)

### 2.1 Project Configuration
1. Import your repository on Vercel.
2. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2.2 Frontend Environment Variables
Set the following environment variable on Vercel:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com/api/v1` | URL of your deployed Render backend |

### 2.3 SPA Routing Rewrites
Vercel handles client-side routing using the included `client/vercel.json` rewrite rules to ensure deep links (e.g. `/youtube/mp3`, `/faq`) load correctly on browser refresh.

---

## 3. Ephemeral File Considerations & Free-Tier Limitations
- **Stateless Filesystem**: Free tiers on Render use ephemeral disks. This aligns with InTube's architecture since temporary files in `server/temp/` are deleted immediately after download or error.
- **Sleep on Inactivity**: Free Render instances sleep after 15 minutes of inactivity. The first request after sleep may experience a 30-50s cold start. InTube's frontend incorporates an active health-check indicator to notify users during cold boot.
