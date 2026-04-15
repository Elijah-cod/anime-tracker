import { readFile } from "fs/promises";
import path from "path";

import { NextRequest } from "next/server";

const FALLBACK_IMAGE_PATH = path.join(
  process.cwd(),
  "public",
  "anime-poster-placeholder.svg",
);

async function fallbackImageResponse() {
  const body = await readFile(FALLBACK_IMAGE_PATH);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get("url");

  if (!imageUrl) {
    return fallbackImageResponse();
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return fallbackImageResponse();
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return fallbackImageResponse();
  }

  try {
    const upstreamResponse = await fetch(parsedUrl.toString(), {
      headers: {
        Accept: "image/*",
      },
    });

    if (!upstreamResponse.ok) {
      return fallbackImageResponse();
    }

    const contentType = upstreamResponse.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      return fallbackImageResponse();
    }

    return new Response(upstreamResponse.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return fallbackImageResponse();
  }
}
