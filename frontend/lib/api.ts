import { mockCalendar, mockEntries, mockTrending } from "@/lib/mock-data";
import { AnimeCalendarItem, AnimeEntry, AnimeNode } from "@/types/anime";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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
    return response.items;
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

    return response.json();
  } catch {
    return {
      ...entry,
      episodes_watched: entry.episodes_watched + 1,
    };
  }
}
