import { fallbackImageResponse, fetchAniListPosterUrl, proxyImageFromUrl } from "@/lib/server-image";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ animeId: string }> },
) {
  const { animeId } = await context.params;
  const parsedId = Number.parseInt(animeId, 10);

  if (Number.isNaN(parsedId)) {
    return fallbackImageResponse();
  }

  const posterUrl = await fetchAniListPosterUrl(parsedId);
  if (!posterUrl) {
    return fallbackImageResponse();
  }

  return proxyImageFromUrl(posterUrl);
}
