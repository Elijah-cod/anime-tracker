import { mockCalendar, mockEntries, mockImportResponse, mockReviews, mockTrending } from "@/lib/mock-data";
import {
  AnimeCalendarItem,
  AnimeEntry,
  AnimeEntryCreatePayload,
  AnimeEntryUpdatePayload,
  AnimeNode,
  ImportResponse,
  Review,
  ReviewCreatePayload,
} from "@/types/anime";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

function normalizeEntry(entry: AnimeEntry): AnimeEntry {
  const parsedScore =
    typeof entry.score === "string" ? Number.parseFloat(entry.score) : entry.score;

  return {
    ...entry,
    score: Number.isNaN(parsedScore ?? NaN) ? null : parsedScore,
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}`);
  }

  return response.json();
}

export async function getTrendingAnime(): Promise<AnimeNode[]> {
  try {
    const response = await fetchJson<{ items: AnimeNode[] }>("/anime/trending?per_page=6");
    return response.items;
  } catch {
    return mockTrending;
  }
}

export async function searchAnime(query: string): Promise<AnimeNode[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  try {
    const response = await fetchJson<{ items: AnimeNode[] }>(
      `/anime/search?query=${encodeURIComponent(trimmedQuery)}&per_page=8`,
    );
    return response.items;
  } catch {
    return mockTrending.filter((item) => {
      const haystack = `${item.title.romaji} ${item.title.english ?? ""}`.toLowerCase();
      return haystack.includes(trimmedQuery.toLowerCase());
    });
  }
}

export async function getReleaseCalendar(): Promise<AnimeCalendarItem[]> {
  try {
    const response = await fetchJson<{ items: AnimeCalendarItem[] }>(
      "/anime/release-calendar?per_page=8",
    );
    return response.items;
  } catch {
    return mockCalendar;
  }
}

export async function getEntries(): Promise<AnimeEntry[]> {
  try {
    const response = await fetchJson<{ items: AnimeEntry[] }>("/entries");
    return response.items.map(normalizeEntry);
  } catch {
    return mockEntries;
  }
}

export async function incrementEpisodeProgress(entry: AnimeEntry): Promise<AnimeEntry> {
  try {
    const response = await fetch(`${API_URL}/entries/${entry.anime_id}/progress`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...entry,
        increment_by: 1,
      }),
    });

    if (!response.ok) {
      return {
        ...entry,
        episodes_watched: entry.episodes_watched + 1,
      };
    }

    return normalizeEntry(await response.json());
  } catch {
    return {
      ...entry,
      episodes_watched: entry.episodes_watched + 1,
    };
  }
}

export async function createEntry(payload: AnimeEntryCreatePayload): Promise<AnimeEntry> {
  try {
    const response = await fetch(`${API_URL}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: payload.user_id ?? 1,
        episodes_watched: 0,
        ...payload,
      }),
    });

    if (!response.ok) {
      throw new Error("Create entry request failed");
    }

    return normalizeEntry(await response.json());
  } catch {
    return normalizeEntry({
      anime_id: payload.anime_id,
      title: payload.title,
      cover_image: payload.cover_image ?? null,
      status: payload.status,
      episodes_watched: payload.episodes_watched ?? 0,
      total_episodes: payload.total_episodes ?? null,
      score: payload.score ?? null,
    });
  }
}

export async function updateEntry(
  animeId: number,
  payload: AnimeEntryUpdatePayload,
): Promise<AnimeEntry> {
  try {
    const response = await fetch(`${API_URL}/entries/${animeId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Update entry request failed");
    }

    return normalizeEntry(await response.json());
  } catch {
    return normalizeEntry({
      anime_id: animeId,
      title: payload.title ?? "Untitled anime",
      cover_image: payload.cover_image ?? null,
      status: payload.status ?? "PLANNING",
      episodes_watched: payload.episodes_watched ?? 0,
      total_episodes: payload.total_episodes ?? null,
      score: payload.score ?? null,
    });
  }
}

export async function deleteEntry(animeId: number): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/entries/${animeId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Delete entry request failed");
    }
  } catch {
    return;
  }
}

export async function getReviews(): Promise<Review[]> {
  try {
    const response = await fetchJson<{ items: Review[] }>("/reviews");
    return response.items;
  } catch {
    return mockReviews;
  }
}

export async function createReview(payload: ReviewCreatePayload): Promise<Review> {
  try {
    const response = await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Review request failed");
    }

    return response.json();
  } catch {
    return {
      id: Date.now(),
      user_id: payload.user_id ?? 1,
      anime_id: payload.anime_id,
      anime_title: payload.anime_title ?? "Untitled anime",
      cover_image: payload.cover_image ?? null,
      content: payload.content,
      is_spoiler: payload.is_spoiler ?? false,
      created_at: new Date().toISOString(),
    };
  }
}

export async function importMalList(username: string): Promise<ImportResponse> {
  try {
    const response = await fetch(`${API_URL}/imports/mal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        user_id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error("Import request failed");
    }

    return response.json();
  } catch {
    return {
      ...mockImportResponse,
      items: mockImportResponse.items.map((item) => ({
        ...item,
        title: `${item.title} (demo import for ${username})`,
      })),
    };
  }
}
