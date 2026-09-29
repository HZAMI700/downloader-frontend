import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_TARGET =
  'https://sm4hxox44t.preview.c35.airoapp.ai/?airoShareToken=ScCptdbH_MtB';

function resolveTargetBase(req: NextRequest): string {
  // Allow client override from header if custom backend was set in UI
  const headerOverride = req.headers.get('x-custom-backend');
  if (headerOverride && headerOverride.trim()) {
    return headerOverride.trim();
  }

  const envUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim();
  }

  return DEFAULT_TARGET;
}

function buildTargetUrl(rawBase: string, subPath: string[], incomingUrl: URL): string {
  // If user entered the airo.ai share wrapper link, translate directly to preview container
  let base = rawBase;
  if (
    base.includes('airo.ai/share/c200aHhveDQ0dDpjMzU6U2NDcHRkYkhfTXRC') ||
    base.includes('airo-builder.godaddy.com/share/c200aHhveDQ0dDpjMzU6U2NDcHRkYkhfTXRC')
  ) {
    base = 'https://sm4hxox44t.preview.c35.airoapp.ai/?airoShareToken=ScCptdbH_MtB';
  }

  let parsed: URL;
  try {
    parsed = new URL(base);
  } catch {
    parsed = new URL(DEFAULT_TARGET);
  }

  const basePath = parsed.pathname.replace(/\/+$/, '');
  const targetPath = `${basePath}/api/${subPath.join('/')}`;

  // Merge search params (preserving airoShareToken from base URL)
  const searchParams = new URLSearchParams(parsed.search);
  incomingUrl.searchParams.forEach((val, key) => {
    searchParams.set(key, val);
  });

  const queryStr = searchParams.toString();
  return `${parsed.origin}${targetPath}${queryStr ? `?${queryStr}` : ''}`;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: subPath } = await context.params;
    const base = resolveTargetBase(req);
    const targetUrl = buildTargetUrl(base, subPath, req.nextUrl);

    const backendRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: req.headers.get('accept') || '*/*',
        Range: req.headers.get('range') || '',
      },
      cache: 'no-store',
    });

    const isDownload = subPath.includes('download');

    if (isDownload) {
      const headers = new Headers();
      const disposition = backendRes.headers.get('content-disposition');
      const contentType = backendRes.headers.get('content-type') || 'application/octet-stream';
      const contentLength = backendRes.headers.get('content-length');

      if (disposition) headers.set('Content-Disposition', disposition);
      headers.set('Content-Type', contentType);
      if (contentLength) headers.set('Content-Length', contentLength);

      return new NextResponse(backendRes.body, {
        status: backendRes.status,
        headers,
      });
    }

    const contentType = backendRes.headers.get('content-type') || 'application/json';
    const text = await backendRes.text();

    return new NextResponse(text, {
      status: backendRes.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        error: `Proxy error reaching backend: ${errorMsg}`,
      },
      { status: 502 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: subPath } = await context.params;
    const base = resolveTargetBase(req);
    const targetUrl = buildTargetUrl(base, subPath, req.nextUrl);

    const bodyText = await req.text();

    const backendRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': req.headers.get('content-type') || 'application/json',
        Accept: req.headers.get('accept') || 'application/json',
      },
      body: bodyText,
      cache: 'no-store',
    });

    const contentType = backendRes.headers.get('content-type') || 'application/json';
    const text = await backendRes.text();

    return new NextResponse(text, {
      status: backendRes.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        error: `Proxy error reaching backend: ${errorMsg}`,
      },
      { status: 502 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range, X-Custom-Backend',
    },
  });
}
