# SetiMitra (शेतकरी मित्र) - Direct Farm-to-Fork Agricultural Platform

A full-stack agricultural marketplace platform connecting farmers, bulk buyers, and consumers directly with APMC Mandi rates, AI advisory, logistics booking, and contract farming.

---

## 🚀 Quick Start (Run locally with npm)

### Prerequisites
- **Node.js**: version 18, 20, or 22+
- **npm**: version 9 or 10+

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
*(Optional: Add your `GEMINI_API_KEY` in `.env` if you want to use the AI Agronomist advisory features.)*

### 3. Run in Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Run

### 1. Build the Application
```bash
npm run build
```
This builds both the client frontend bundle and compiles the backend server into `dist/server.cjs`.

### 2. Start Production Server
```bash
npm start
```
The server will start listening on port 3000 at `http://localhost:3000`.

---

## 🌐 Server Deployment Guide

### Option A: Render / Railway / Heroku
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 20+

### Option B: Linux VPS (Ubuntu / Debian / CentOS with PM2)
1. Install Node.js & PM2:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```
2. Clone/Extract the project and run:
   ```bash
   npm install
   npm run build
   pm2 start dist/server.cjs --name setimitra
   pm2 save
   pm2 startup
   ```
3. Set up Nginx reverse proxy to forward traffic to `http://127.0.0.1:3000`.

### Option C: Docker Deployment
Build and run using standard Docker:
```bash
docker build -t setimitra .
docker run -p 3000:3000 setimitra
```

---

## 🛠 Available NPM Scripts
- `npm run dev`: Starts development server with hot-reload via `tsx`.
- `npm run build`: Compiles client and bundles server into `dist/`.
- `npm start`: Runs the compiled production server (`node dist/server.cjs`).
- `npm run lint`: Validates TypeScript types across the project.
- `npm run clean`: Cleans previous build artifacts.
