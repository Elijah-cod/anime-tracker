import { readFile } from "fs/promises";
import path from "path";

const FALLBACK_IMAGE_PATH = path.join(
  process.cwd(),
  "public",
  "anime-poster-placeholder.svg",
);

const ANILIST_GRAPHQL_URL = "https://graphql.anilist.co";

const POSTER_QUERY = `
query PosterById($id: Int!) {
  Media(id: $id, type: ANIME) {
    coverImage {
      extraLarge
      large
    }
  }
}
`;

export async function fallbackImageResponse() {
  const body = await readFile(FALLBACK_IMAGE_PATH);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

export async function proxyImageFromUrl(imageUrl: string) {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        Accept: "image/*",
      },
    });

    if (!response.ok) {
      return fallbackImageResponse();
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      return fallbackImageResponse();
    }

    return new Response(response.body, {
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

export async function fetchAniListPosterUrl(animeId: number) {
  try {
    const response = await fetch(ANILIST_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: POSTER_QUERY,
        variables: { id: animeId },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const coverImage = payload?.data?.Media?.coverImage;
    return coverImage?.extraLarge ?? coverImage?.large ?? null;
  } catch {
    return null;
  }
}
