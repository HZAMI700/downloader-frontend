import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OmniStream - YouTube & Instagram Video Downloader',
  description:
    'Download YouTube videos, Shorts, Instagram Reels, and MP3 audio in full high quality. Powered by Next.js, yt-dlp, FFmpeg, and Deno.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased min-h-screen selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
