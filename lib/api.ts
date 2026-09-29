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

export const DEFAULT_BACKEND_URL =
  'https://sm4hxox44t.preview.c35.airoapp.ai/?airoShareToken=ScCptdbH_MtB';

export function getBackendUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('custom_backend_url');
    if (custom && custom.trim()) {
      return custom.trim();
    }
  }
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim();
  }
  return DEFAULT_BACKEND_URL;
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

/**
 * Executes a request to the backend through the same-origin Next.js server proxy,
 * eliminating browser CORS blocking and preserving GoDaddy Airo preview share tokens.
 */
async function fetchThroughProxy(
  subPath: string,
  options: RequestInit = {},
  queryParams: Record<string, string> = {}
): Promise<Response> {
  const customBackend = typeof window !== 'undefined' ? localStorage.getItem('custom_backend_url') : null;

  const searchParams = new URLSearchParams(queryParams);
  const qs = searchParams.toString();
  const endpoint = `/api/backend/${subPath}${qs ? `?${qs}` : ''}`;

  const headers = new Headers(options.headers || {});
  if (customBackend) {
    headers.set('x-custom-backend', customBackend);
  }

  return fetch(endpoint, {
    ...options,
    headers,
  });
}

export async function fetchHealth(): Promise<HealthResponse> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetchThroughProxy(
      'health',
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }
    );
    clearTimeout(id);

    if (!res.ok && res.status !== 503) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    return await res.json();
  } catch (err: unknown) {
    clearTimeout(id);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Backend connection timed out (12s). Check if backend server is active.');
    }
    throw err;
  }
}

export async function extractMedia(videoUrl: string): Promise<VideoMetadata> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetchThroughProxy(
      'info',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ url: videoUrl }),
        signal: controller.signal,
      }
    );
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

export function buildDownloadUrl(videoUrl: string, formatId: string, title?: string): string {
  const params = new URLSearchParams({
    url: videoUrl,
    format: formatId,
  });
  if (title) {
    params.set('title', title);
  }
  return `/api/backend/download?${params.toString()}`;
}
