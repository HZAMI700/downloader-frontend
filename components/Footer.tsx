'use client';

import React from 'react';
import { Heart, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950/60 mt-20 py-8 px-4 text-center text-xs text-slate-500">
      <div className="max-w-4xl mx-auto space-y-3">
        <p className="flex items-center justify-center gap-1">
          Built with Next.js, Express, yt-dlp, FFmpeg &amp; Deno
        </p>
        <p className="text-[11px] text-slate-600 max-w-xl mx-auto">
          Notice: This application is intended for personal backup and educational use. Only download media you have the right or permission to access.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2 text-slate-400">
          <a
            href="https://github.com/HZAMI700/downloader-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-200 transition"
          >
            Frontend Repo
          </a>
          <span>•</span>
          <a
            href="https://github.com/HZAMI700/downloader-backend"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-200 transition"
          >
            Backend Repo
          </a>
        </div>
      </div>
    </footer>
  );
};
