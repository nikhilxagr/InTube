# InTube — Modern Media Utility & Downloader

A fast, compliant, and privacy-focused media utility web application. InTube allows users to analyze public media URLs and extract authorized streams into standard video and audio formats without requiring accounts, databases, or tracking.

---

## 🌟 Key Features

- **Zero-Account Stateless Architecture**: No login, no database, no persistent history, and no user tracking.
- **Provider-Based Extensibility**: Modular provider design for YouTube and Instagram with strict contract isolation.
- **Truthful Metadata & Formats**: Displays genuine resolutions and bitrates available from public media sources.
- **Safe & Ephemeral Processing**: Processing is performed in isolated temp directories and cleaned up immediately.
- **Security-First**: SSRF protection, loopback/private IP blocking, Zod request validation, and safe FFmpeg argument lists.
- **Modern UI/UX**: Clean, responsive, dark/light theme, accessible design built with React, Vite, and Tailwind CSS.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v18.0.0+` (Recommended `v20.x` or `v22.x`)
- **FFmpeg**: Required on the server host (see [docs/development.md](docs/development.md))

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd InTube

# Install all dependencies (root, server, and client)
npm run install:all
```

### 3. Environment Setup
```bash
# Setup backend environment
cp server/.env.example server/.env

# Setup frontend environment
cp client/.env.example client/.env
```

### 4. Run Development Server
```bash
# Run both client and server concurrently
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 📂 Project Structure

```
InTube/
├── client/          # React + Vite + Tailwind CSS Frontend
├── server/          # Node.js + Express + FFmpeg Backend
├── docs/            # Architecture, API, Security, & Deployment Specs
├── .env.example     # Reference Environment Configuration
├── package.json     # Root Workspace Orchestration
└── README.md
```

---

## 📖 Documentation
- [Architecture & Design](docs/architecture.md)
- [API Specifications](docs/api.md)
- [Security Guidelines & SSRF Defense](docs/security.md)
- [Local Development Setup](docs/development.md)
- [Deployment Guide (Vercel + Render)](docs/deployment.md)

---

## ⚖️ Legal & Compliance
This software is intended solely for public media and content that the user owns or is authorized to process and download. It does not bypass DRM, paywalls, private access controls, or platform authentication mechanisms.
