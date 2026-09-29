'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Sparkles,
  Clipboard,
  X,
  AlertCircle,
  Loader2,
  Video,
  Play,
  Instagram,
  Youtube,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Header } from '../components/Header';
import { VideoCard } from '../components/VideoCard';
import { FaqSection } from '../components/FaqSection';
import { Footer } from '../components/Footer';
import {
  VideoMetadata,
  HealthResponse,
  fetchHealth,
  extractMedia,
  getBackendUrl,
} from '../lib/api';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [activePlatformFilter, setActivePlatformFilter] = useState<'all' | 'youtube' | 'instagram'>('all');

  const loadHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError(null);
      }
    } catch {
      // Browser permissions denied
    }
  };

  const handleClear = () => {
    setUrl('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please paste or enter a valid YouTube or Instagram link');
      return;
    }

    const trimmed = url.trim();
    const isYoutube = trimmed.includes('youtube.com') || trimmed.includes('youtu.be');
    const isInstagram = trimmed.includes('instagram.com') || trimmed.includes('instagr.am');

    if (!isYoutube && !isInstagram) {
      setError('Only YouTube (videos, shorts) and Instagram (reels, posts) links are supported.');
      return;
    }

    setLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const data = await extractMedia(trimmed);
      setMetadata(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to extract video information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 glow-gradient relative overflow-hidden">
      {/* Decorative gradient blur background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Header */}
      <Header
        health={health}
        healthLoading={healthLoading}
        onRefreshHealth={loadHealth}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 md:py-16 space-y-10">
        {/* Hero title & description */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>High-Speed Extractor with FFmpeg &amp; Deno</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Universal{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              Video &amp; Audio
            </span>{' '}
            Downloader
          </h1>

          <p className="text-sm md:text-base text-slate-400 leading-relaxed">
            Download YouTube videos &amp; Shorts in up to 1080p Full HD, Instagram Reels, and extract crystal-clear MP3 audio.
          </p>
        </div>

        {/* Platform Selection Badges */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActivePlatformFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activePlatformFilter === 'all'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-900'
            }`}
          >
            <span>All Supported</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePlatformFilter('youtube')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activePlatformFilter === 'youtube'
                ? 'bg-red-950/70 text-red-300 border border-red-800/80'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-900'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-500" />
            <span>YouTube &amp; Shorts</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePlatformFilter('instagram')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activePlatformFilter === 'instagram'
                ? 'bg-pink-950/70 text-pink-300 border border-pink-800/80'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-900'
            }`}
          >
            <Instagram className="w-4 h-4 text-pink-500" />
            <span>Instagram Reels</span>
          </button>
        </div>

        {/* Search / Input Box */}
        <div className="max-w-3xl mx-auto w-full">
          <form
            onSubmit={handleSubmit}
            className="glass-panel rounded-2xl p-2 md:p-3 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center gap-2 transition-all focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20"
          >
            <div className="flex items-center gap-2 w-full px-3 py-2 flex-1">
              <Search className="w-5 h-5 text-slate-500 shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube or Instagram link here..."
                disabled={loading}
                className="w-full bg-transparent text-sm md:text-base text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
              />
              {url ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 transition shrink-0"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Paste</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Fetch Video</span>
                </>
              )}
            </button>
          </form>

          {/* Quick example hints */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 mt-3 px-2">
            <span>Try:</span>
            <button
              type="button"
              onClick={() => setUrl('https://www.youtube.com/watch?v=jNQXAC9IVRw')}
              className="text-slate-400 hover:text-indigo-400 underline underline-offset-2 transition"
            >
              YouTube: Me at the zoo
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setUrl('https://youtube.com/shorts/5_XTe0iK7z8')}
              className="text-slate-400 hover:text-indigo-400 underline underline-offset-2 transition"
            >
              YouTube Shorts
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-3xl mx-auto w-full p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">Extraction Failed</p>
              <p className="text-xs text-rose-300/90 leading-relaxed">{error}</p>
              {!health && (
                <p className="text-[11px] text-rose-400 pt-1">
                  Note: Backend API appears offline. Please check your backend connection via the settings icon in the top header.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Video Card Result */}
        {metadata && (
          <div className="max-w-3xl mx-auto w-full transition-all duration-300">
            <VideoCard
              metadata={metadata}
              onReset={() => {
                setMetadata(null);
                setUrl('');
              }}
            />
          </div>
        )}

        {/* Features & FAQ */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
