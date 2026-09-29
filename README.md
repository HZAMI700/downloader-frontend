# Video Downloader Frontend (Next.js)

A modern, responsive, high-performance web interface built with **Next.js 15**, **React 19**, and **Tailwind CSS** for downloading YouTube videos, Shorts, Instagram Reels, and MP3 audio.

---

## Key Features

- **Separate Architecture:** Communicates via REST API to a dedicated backend server (`yt-dlp` + `FFmpeg` + `Deno`). Never runs heavy extraction directly inside Vercel serverless functions.
- **Configurable Backend:** Connects to any backend via `NEXT_PUBLIC_BACKEND_URL` environment variable with in-app runtime settings and health monitoring.
- **Formats & Quality Selection:** Supports 1080p Full HD, 720p HD, 480p, 360p, and high-quality 320kbps MP3 audio extraction.
- **Live Health Monitor:** Real-time ping displaying yt-dlp, FFmpeg, and Deno availability on the backend.
- **Responsive & Modern Design:** Dark-themed UI with glassmorphism, responsive video cards, paste-from-clipboard button, and FAQ section.

---

## Environment Variables

Create `.env.local` based on `.env.example`:

```ini
# URL pointing to your separate backend API
# Local development:
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Production (e.g. your VPS or cloud server):
# NEXT_PUBLIC_BACKEND_URL=https://api.yourdownloader.com
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

---

## Deploying to Vercel

1. Push your code to your GitHub repository: `https://github.com/HZAMI700/downloader-frontend`
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the `downloader-frontend` repository.
4. Under **Environment Variables**, add:
   - **Key:** `NEXT_PUBLIC_BACKEND_URL`
   - **Value:** `https://your-backend-api-url.com` (Your live backend VPS / cloud URL)
5. Click **Deploy**. Vercel will build and deploy the Next.js frontend globally on edge CDN.

---

## Connecting with the Backend

The frontend requires a running backend API. Ensure your backend repository (`downloader-backend`) is deployed to a VPS or server with `yt-dlp`, `FFmpeg`, and `Deno` installed.

For full backend deployment and GoDaddy hosting analysis, see the [downloader-backend repository](https://github.com/HZAMI700/downloader-backend).
