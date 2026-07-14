const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const FORWARDED_HEADERS = ["content-type", "x-anime-tracker-user-email"];
const UPSTREAM_TIMEOUT_MS = 10_000;

const PUBLIC_CACHE_TTL: Record<string, number> = {
  users: 60,
  "anime/search": 300,
  "anime/trending": 300,
  "anime/release-calendar": 300,
};

function buildTargetUrl(pathSegments: string[], request: Request): string {
  const sanitizedBaseUrl = BACKEND_API_URL.replace(/\/$/, "");
  const joinedPath = pathSegments.map(encodeURIComponent).join("/");
  const search = new URL(request.url).search;

  return `${sanitizedBaseUrl}/${joinedPath}${search}`;
}

async function proxyRequest(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const targetUrl = buildTargetUrl(path, request);
  const joinedPath = path.join("/");

  const headers = new Headers();
  for (const headerName of FORWARDED_HEADERS) {
    const headerValue = request.headers.get(headerName);
    if (headerValue) {
      headers.set(headerName, headerValue);
    }
  }

  const cacheTtl =
    request.method === "GET" && !request.headers.has("x-anime-tracker-user-email")
      ? PUBLIC_CACHE_TTL[joinedPath]
      : undefined;

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      ...(cacheTtl ? { next: { revalidate: cacheTtl } } : { cache: "no-store" as const }),
    });
  } catch {
    return Response.json(
      { detail: "The API is temporarily unavailable. Please try again." },
      { status: 504, headers: { "cache-control": "no-store" } },
    );
  }

  const responseHeaders = new Headers();
  const contentType = upstreamResponse.headers.get("content-type");
  if (contentType) {
    responseHeaders.set("content-type", contentType);
  }
  if (cacheTtl) {
    responseHeaders.set(
      "cache-control",
      `public, s-maxage=${cacheTtl}, stale-while-revalidate=${cacheTtl * 5}`,
    );
  } else {
    responseHeaders.set("cache-control", "private, no-store");
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}

export async function PATCH(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}

export async function DELETE(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}
