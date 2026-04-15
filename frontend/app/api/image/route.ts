import { NextRequest } from "next/server";

import { fallbackImageResponse, proxyImageFromUrl } from "@/lib/server-image";

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

  return proxyImageFromUrl(parsedUrl.toString());
}
