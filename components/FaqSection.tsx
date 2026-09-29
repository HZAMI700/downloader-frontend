'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Shield, Cpu, Zap, Server } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'How do I download a YouTube video or Shorts?',
    answer:
      'Copy the full URL from YouTube (e.g., https://www.youtube.com/watch?v=... or https://youtube.com/shorts/...), paste it into the search bar above, and click "Fetch Video". Select your desired resolution (1080p Full HD, 720p HD, or MP3 Audio) and click Download.',
  },
  {
    question: 'How do I download an Instagram Reel or Post?',
    answer:
      'Copy the link to any public Instagram Reel or post (e.g., https://www.instagram.com/reel/...), paste it into the field, and click "Fetch Video". You can download the video in original MP4 format or extract the audio as MP3.',
  },
  {
    question: 'Why is the backend hosted separately from Vercel?',
    answer:
      'Vercel serverless functions have strict execution limits (10–60s timeout, read-only filesystem, 50MB-250MB size limits) and do not support bundling heavy binaries like FFmpeg, yt-dlp, and Deno. A separate backend allows long-running downloads, custom FFmpeg muxing, and Deno JavaScript challenge solving without constraints.',
  },
  {
    question: 'Can I deploy the backend on GoDaddy?',
    answer:
      'GoDaddy Shared/cPanel/Free hosting does not support custom binaries (FFmpeg/Deno), root access, or background daemons due to CloudLinux process timeouts. However, GoDaddy VPS (Virtual Private Server) or any standard Linux VPS (DigitalOcean, Hetzner, AWS) with root access is 100% compatible using our included Dockerfile or systemd service.',
  },
  {
    question: 'What is Deno and yt-dlp-ejs used for?',
    answer:
      'YouTube frequently protects its video streams using obfuscated JavaScript challenges (such as n-parameter and signature decryption). yt-dlp now utilizes Deno as an external JavaScript runtime (yt-dlp-ejs) to solve these challenges in real time, guaranteeing access to high-definition 1080p and 4K streams.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 space-y-8">
      {/* Feature cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-sm text-white">Full HD &amp; Audio</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Extract up to 1080p Full HD video streams or high-bitrate 320kbps MP3 audio via FFmpeg.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-sm text-white">Deno &amp; EJS Solver</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automatic resolution of YouTube JavaScript challenges using Deno runtime and yt-dlp-ejs.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-sm text-white">Private &amp; Secure</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Zero logs of personal data. Temporary media files are automatically cleaned up immediately after streaming.
          </p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Frequently Asked Questions &amp; Architecture</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800/80 bg-slate-950/40 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-900/40 transition"
                >
                  <span className="font-medium text-sm text-slate-200">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
