export interface BinaryStatus {
  available: boolean;
  version: string | null;
  path: string;
  error?: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  ytdlp: BinaryStatus;
  ffmpeg: BinaryStatus;
  deno: BinaryStatus;
  ytdlpEjsSupported: boolean;
  platform: string;
  nodeVersion: string;
  memoryUsageMb: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  uptimeSeconds: number;
  timestamp: string;
}

export interface VideoFormatOption {
  formatId: string;
  label: string;
  extension: 'mp4' | 'mp3';
  type: 'video' | 'audio';
  resolution?: string;
  filesizeApproxMb?: number;
  qualityNote?: string;
}

export interface VideoMetadata {
  id: string;
  title: string;
  thumbnail: string;
  durationSeconds: number;
  durationFormatted: string;
  uploader: string;
  platform: 'youtube' | 'instagram';
  originalUrl: string;
  formats: VideoFormatOption[];
  viewCount?: number;
}

export interface ExtractResponse {
  success: boolean;
  data?: VideoMetadata;
  error?: string;
}

export function getBackendUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('custom_backend_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  }
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://localhost:5000';
}

export function setCustomBackendUrl(url: string | null): void {
  if (typeof window !== 'undefined') {
    if (!url) {
      localStorage.removeItem('custom_backend_url');
    } else {
      localStorage.setItem('custom_backend_url', url.trim());
    }
  }
}

export async function fetchHealth(): Promise<HealthResponse> {
  const base = getBackendUrl();
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${base}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    return await res.json();
  } catch (err: unknown) {
    clearTimeout(id);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Backend connection timed out (6s). Check if backend server is running.');
    }
    throw err;
  }
}

export async function extractMedia(url: string): Promise<VideoMetadata> {
  const base = getBackendUrl();
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 45000); // 45s max

  try {
    const res = await fetch(`${base}/api/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    clearTimeout(id);

    const json = (await res.json()) as ExtractResponse;
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error || `Server responded with status ${res.status}`);
    }
    return json.data;
  } catch (err: unknown) {
    clearTimeout(id);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out. The video may be heavy or rate-limited.');
    }
    throw err;
  }
}

export function buildDownloadUrl(url: string, formatId: string, title?: string): string {
  const base = getBackendUrl();
  const params = new URLSearchParams({
    url,
    format: formatId,
  });
  if (title) {
    params.set('title', title);
  }
  return `${base}/api/download?${params.toString()}`;
}
