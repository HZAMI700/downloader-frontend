'use client';

import React, { useState } from 'react';
import { Video, Settings2, Github, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { HealthResponse, getBackendUrl, setCustomBackendUrl } from '../lib/api';

interface HeaderProps {
  health: HealthResponse | null;
  healthLoading: boolean;
  onRefreshHealth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ health, healthLoading, onRefreshHealth }) => {
  const [showModal, setShowModal] = useState(false);
  const [customUrl, setCustomUrl] = useState(getBackendUrl());
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomBackendUrl(customUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    onRefreshHealth();
  };

  const isOnline = health && health.status !== 'error';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  OmniStream
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                YouTube &amp; Instagram Downloader
              </p>
            </div>
          </div>

          {/* Right status & tools */}
          <div className="flex items-center gap-3">
            {/* Backend status pill */}
            <button
              onClick={() => setShowModal(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                healthLoading
                  ? 'bg-slate-900 border-slate-800 text-slate-400'
                  : isOnline
                  ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/40'
                  : 'bg-rose-950/40 border-rose-800/50 text-rose-400 hover:bg-rose-900/40'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  healthLoading
                    ? 'bg-slate-500 animate-pulse'
                    : isOnline
                    ? 'bg-emerald-400 animate-ping shadow-sm'
                    : 'bg-rose-500'
                }`}
              />
              <span className="hidden sm:inline">Backend:</span>
              <span>{healthLoading ? 'Checking...' : isOnline ? 'Connected' : 'Offline'}</span>
              <Settings2 className="w-3.5 h-3.5 ml-1 opacity-70" />
            </button>

            {/* GitHub */}
            <a
              href="https://github.com/HZAMI700/downloader-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
              title="GitHub Repositories"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Backend Settings & Health Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white">Backend Configuration</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Config URL */}
            <form onSubmit={handleSaveUrl} className="space-y-3">
              <label className="text-xs font-medium text-slate-300 block">
                Backend API URL (<code className="text-indigo-300">BACKEND_URL</code>)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://api.yourdownloader.com"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
                >
                  Save
                </button>
              </div>
              {saveSuccess && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved successfully!
                </p>
              )}
            </form>

            {/* Health & Engine Status */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Engine Dependencies
                </span>
                <button
                  onClick={onRefreshHealth}
                  className="text-slate-400 hover:text-white p-1 rounded transition"
                  title="Refresh status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {health ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">yt-dlp</span>
                    <span className={health.ytdlp.available ? 'text-emerald-400 font-mono' : 'text-rose-400'}>
                      {health.ytdlp.available ? `✓ ${health.ytdlp.version}` : '✗ Not detected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">FFmpeg</span>
                    <span className={health.ffmpeg.available ? 'text-emerald-400 font-mono' : 'text-rose-400'}>
                      {health.ffmpeg.available ? `✓ ${health.ffmpeg.version}` : '✗ Not detected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Deno (EJS Solver)</span>
                    <span className={health.deno.available ? 'text-emerald-400 font-mono' : 'text-rose-400'}>
                      {health.deno.available ? `✓ ${health.deno.version}` : '✗ Not detected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400">Node.js Runtime</span>
                    <span className="text-slate-300 font-mono">{health.nodeVersion}</span>
                  </div>
                </div>
              ) : (
                <div className="text-rose-400 text-xs flex items-center gap-2 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Cannot reach backend API at {getBackendUrl()}. Ensure the backend server is running.</span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400">
              In production, configure <code className="text-slate-300">NEXT_PUBLIC_BACKEND_URL</code> in Vercel environment variables.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
