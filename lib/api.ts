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

const DEFAULT_BACKEND_URL =
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
 * Builds a clean, fully-qualified URL for any backend API endpoint,
 * safely handling query tokens (such as GoDaddy Airo airoShareToken) and paths.
 */
export function buildApiUrl(endpoint: string, queryParams: Record<string, string> = {}): string {
  let rawBase = getBackendUrl();

  // If user entered the airo.ai share wrapper link, translate directly to the preview container
  if (
    rawBase.includes('airo.ai/share/c200aHhveDQ0dDpjMzU6U2NDcHRkYkhfTXRC') ||
    rawBase.includes('airo-builder.godaddy.com/share/c200aHhveDQ0dDpjMzU6U2NDcHRkYkhfTXRC')
  ) {
    rawBase = 'https://sm4hxox44t.preview.c35.airoapp.ai/?airoShareToken=ScCptdbH_MtB';
  }

  let parsed: URL;
  try {
    parsed = new URL(rawBase);
  } catch {
    parsed = new URL(DEFAULT_BACKEND_URL);
  }

  const basePath = parsed.pathname.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Preserve base query params (e.g. airoShareToken) and merge with endpoint query params
  const searchParams = new URLSearchParams(parsed.search);
  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, value);
    }
  }

  const queryStr = searchParams.toString();
  return `${parsed.origin}${basePath}${cleanEndpoint}${queryStr ? `?${queryStr}` : ''}`;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const url = buildApiUrl('/api/health');
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(id);

    // Accept 200 (ok) or 503 (degraded/starting)
    if (!res.ok && res.status !== 503) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    return await res.json();
  } catch (err: unknown) {
    clearTimeout(id);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Backend connection timed out (10s). Check if backend server is awake.');
    }
    throw err;
  }
}

export async function extractMedia(videoUrl: string): Promise<VideoMetadata> {
  const url = buildApiUrl('/api/info');
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ url: videoUrl }),
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

export function buildDownloadUrl(videoUrl: string, formatId: string, title?: string): string {
  const params: Record<string, string> = {
    url: videoUrl,
    format: formatId,
  };
  if (title) {
    params.title = title;
  }
  return buildApiUrl('/api/download', params);
}
