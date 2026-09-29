'use client';

import React, { useState } from 'react';
import { Download, Music, Video, Clock, Eye, User, Check, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { VideoMetadata, VideoFormatOption, buildDownloadUrl } from '../lib/api';

interface VideoCardProps {
  metadata: VideoMetadata;
  onReset: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ metadata, onReset }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [selectedFormat, setSelectedFormat] = useState<string>(() => {
    // Default to 1080p if available, else first format
    const f1080 = metadata.formats.find((f) => f.formatId === '1080p');
    if (f1080) return '1080p';
    const firstVideo = metadata.formats.find((f) => f.type === 'video');
    return firstVideo?.formatId || metadata.formats[0]?.formatId || 'best';
  });
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const videoFormats = metadata.formats.filter((f) => f.type === 'video');
  const audioFormats = metadata.formats.filter((f) => f.type === 'audio');
  const displayedFormats = activeTab === 'video' ? videoFormats : audioFormats;

  const handleDownload = () => {
    setDownloading(true);
    setDownloadSuccess(false);

    const downloadUrl = buildDownloadUrl(metadata.originalUrl, selectedFormat, metadata.title);

    // Trigger browser download via invisible link
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Give visual feedback
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 2500);
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-800 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Thumbnail Preview */}
        <div className="md:col-span-5 relative group rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video flex items-center justify-center">
          {metadata.thumbnail ? (
            <img
              src={metadata.thumbnail}
              alt={metadata.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500">
              <Video className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-xs">Preview unavailable</span>
            </div>
          )}

          {/* Duration badge */}
          {metadata.durationFormatted && (
            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 shadow">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{metadata.durationFormatted}</span>
            </div>
          )}

          {/* Platform badge */}
          <div className="absolute top-3 left-3">
            {metadata.platform === 'youtube' ? (
              <span className="bg-red-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow flex items-center gap-1">
                YouTube
              </span>
            ) : (
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow flex items-center gap-1">
                Instagram
              </span>
            )}
          </div>
        </div>

        {/* Video Info & Controls */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white leading-snug line-clamp-2">
              {metadata.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-300 font-medium">{metadata.uploader}</span>
              </div>
              {metadata.viewCount !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>{Number(metadata.viewCount).toLocaleString()} views</span>
                </div>
              )}
              <a
                href={metadata.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition"
              >
                <span>Original Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Format Tabs (Video vs Audio) */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('video');
                  if (videoFormats.length > 0) setSelectedFormat(videoFormats[0].formatId);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === 'video'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video (MP4)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('audio');
                  if (audioFormats.length > 0) setSelectedFormat(audioFormats[0].formatId);
                  else setSelectedFormat('mp3');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === 'audio'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Music className="w-4 h-4" />
                <span>Audio Only (MP3)</span>
              </button>
            </div>

            {/* Quality Options Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {displayedFormats.map((format) => {
                const isSelected = selectedFormat === format.formatId;
                return (
                  <button
                    key={format.formatId}
                    type="button"
                    onClick={() => setSelectedFormat(format.formatId)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-sm text-white">{format.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    {format.qualityNote && (
                      <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                        {format.qualityNote}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing &amp; Downloading...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Download Dispatched!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download {activeTab === 'audio' ? 'MP3 Audio' : 'MP4 Video'}</span>
                </>
              )}
            </button>

            <button
              onClick={onReset}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:text-white transition"
            >
              Download Another
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
