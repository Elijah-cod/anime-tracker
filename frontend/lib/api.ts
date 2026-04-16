import { mockCalendar, mockEntries, mockImportResponse, mockReviews, mockTrending } from "@/lib/mock-data";
import {
  AnimeCalendarItem,
  AnimeEntry,
  AnimeEntryCreatePayload,
  AnimeEntryStatusCount,
  AnimeEntryUpdatePayload,
  AnimeNode,
  ImportResponse,
  LibrarySummary,
  Review,
  ReviewCreatePayload,
  UserActivityItem,
  UserDashboard,
  User,
} from "@/types/anime";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

type FetchJsonOptions = {
  userEmail?: string;
  revalidate?: number;
  noStore?: boolean;
};

function normalizeEntry(entry: AnimeEntry): AnimeEntry {
  const parsedScore =
    typeof entry.score === "string" ? Number.parseFloat(entry.score) : entry.score;

  return {
    ...entry,
    score: Number.isNaN(parsedScore ?? NaN) ? null : parsedScore,
  };
}

function buildHeaders(userEmail?: string, headers?: HeadersInit): HeadersInit {
  return {
    ...(headers ?? {}),
    ...(userEmail ? { "x-anime-tracker-user-email": userEmail } : {}),
  };
}

async function fetchJson<T>(path: string, options?: FetchJsonOptions): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...(options?.noStore
      ? { cache: "no-store" as const }
      : { next: { revalidate: options?.revalidate ?? 300 } }),
    headers: buildHeaders(options?.userEmail),
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

export async function getEntries(userEmail?: string): Promise<AnimeEntry[]> {
  try {
    const response = await fetchJson<{ items: AnimeEntry[] }>("/entries", {
      userEmail,
      noStore: true,
    });
    return response.items.map(normalizeEntry);
  } catch {
    return mockEntries;
  }
}

function buildSummary(entries: AnimeEntry[]): LibrarySummary {
  const statusCounts = entries.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.status] = (counts[entry.status] ?? 0) + 1;
    return counts;
  }, {});

  const status_breakdown: AnimeEntryStatusCount[] = Object.entries(statusCounts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([status, count]) => ({ status, count }));

  const scoredEntries = entries
    .map((entry) =>
      typeof entry.score === "string" ? Number.parseFloat(entry.score) : entry.score,
    )
    .filter((score): score is number => score !== null && score !== undefined && !Number.isNaN(score));

  return {
    total_entries: entries.length,
    total_episodes_watched: entries.reduce((sum, entry) => sum + entry.episodes_watched, 0),
    average_score: scoredEntries.length
      ? Number((scoredEntries.reduce((sum, score) => sum + score, 0) / scoredEntries.length).toFixed(2))
      : null,
    completed_entries: entries.filter((entry) => entry.status === "COMPLETED").length,
    watching_entries: entries.filter((entry) => entry.status === "WATCHING").length,
    planning_entries: entries.filter((entry) => entry.status === "PLANNING").length,
    status_breakdown,
    watch_queue: entries.filter((entry) => ["WATCHING", "PLANNING"].includes(entry.status)).slice(0, 4),
  };
}

export async function getLibrarySummary(userEmail?: string): Promise<LibrarySummary> {
  try {
    const response = await fetchJson<LibrarySummary>("/entries/summary", {
      userEmail,
      noStore: true,
    });
    return {
      ...response,
      watch_queue: response.watch_queue.map(normalizeEntry),
    };
  } catch {
    return buildSummary(mockEntries);
  }
}

export async function incrementEpisodeProgress(
  entry: AnimeEntry,
  userEmail?: string,
): Promise<AnimeEntry> {
  try {
    const response = await fetch(`${API_URL}/entries/${entry.anime_id}/progress`, {
      method: "PATCH",
      headers: buildHeaders(userEmail, {
        "Content-Type": "application/json",
      }),
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

export async function createEntry(
  payload: AnimeEntryCreatePayload,
  userEmail?: string,
): Promise<AnimeEntry> {
  try {
    const response = await fetch(`${API_URL}/entries`, {
      method: "POST",
      headers: buildHeaders(userEmail, {
        "Content-Type": "application/json",
      }),
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
  userEmail?: string,
): Promise<AnimeEntry> {
  try {
    const response = await fetch(`${API_URL}/entries/${animeId}`, {
      method: "PATCH",
      headers: buildHeaders(userEmail, {
        "Content-Type": "application/json",
      }),
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

export async function deleteEntry(animeId: number, userEmail?: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/entries/${animeId}`, {
      method: "DELETE",
      headers: buildHeaders(userEmail),
    });

    if (!response.ok) {
      throw new Error("Delete entry request failed");
    }
  } catch {
    return;
  }
}

export async function getReviews(
  userEmail?: string,
  options?: { scope?: "mine" | "all"; animeId?: number },
): Promise<Review[]> {
  try {
    const searchParams = new URLSearchParams();
    if (options?.scope) {
      searchParams.set("scope", options.scope);
    }
    if (options?.animeId) {
      searchParams.set("anime_id", String(options.animeId));
    }
    const query = searchParams.toString();
    const response = await fetchJson<{ items: Review[] }>(
      `/reviews${query ? `?${query}` : ""}`,
      {
        userEmail,
        noStore: true,
      },
    );
    return response.items;
  } catch {
    return mockReviews;
  }
}

export async function createReview(
  payload: ReviewCreatePayload,
  userEmail?: string,
): Promise<Review> {
  try {
    const response = await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: buildHeaders(userEmail, {
        "Content-Type": "application/json",
      }),
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

export async function importMalList(username: string, userEmail?: string): Promise<ImportResponse> {
  try {
    const response = await fetch(`${API_URL}/imports/mal`, {
      method: "POST",
      headers: buildHeaders(userEmail, {
        "Content-Type": "application/json",
      }),
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

export async function getUsers(userEmail?: string): Promise<User[]> {
  try {
    const response = await fetchJson<{ items: User[] }>("/users", {
      userEmail,
      noStore: true,
    });
    return response.items;
  } catch {
    return [
      {
        id: 1,
        username: "demo-user",
        email: "demo@anime-tracker.local",
        auth_provider: "demo",
      },
    ];
  }
}

export async function getCurrentUser(userEmail?: string): Promise<User> {
  try {
    return await fetchJson<User>("/users/me", {
      userEmail,
      noStore: true,
    });
  } catch {
    return {
      id: 1,
      username: "demo-user",
      email: userEmail ?? "demo@anime-tracker.local",
      auth_provider: "demo",
    };
  }
}

export async function createUserAccount(
  payload: { username: string; email: string },
  userEmail?: string,
): Promise<User> {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: buildHeaders(userEmail, {
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Create user request failed");
    }

    return response.json();
  } catch {
    return {
      id: Date.now(),
      username: payload.username,
      email: payload.email.toLowerCase(),
      auth_provider: "local",
      created_at: new Date().toISOString(),
    };
  }
}

function buildUserDashboardFallback(userEmail?: string): UserDashboard {
  const now = new Date();
  const scoredEntries = mockEntries
    .map((entry) =>
      typeof entry.score === "string" ? Number.parseFloat(entry.score) : entry.score,
    )
    .filter((score): score is number => score !== null && score !== undefined && !Number.isNaN(score));

  const recentEntryActivity: UserActivityItem[] = mockEntries.slice(0, 4).map((entry, index) => ({
    kind: "entry_updated",
    anime_id: entry.anime_id,
    anime_title: entry.title,
    cover_image: entry.cover_image ?? null,
    detail: `${entry.status} · ${entry.episodes_watched} episodes logged`,
    occurred_at: new Date(now.getTime() - index * 1000 * 60 * 90).toISOString(),
  }));

  const recentReviewActivity: UserActivityItem[] = mockReviews.slice(0, 2).map((review, index) => ({
    kind: "review_created",
    anime_id: review.anime_id,
    anime_title: review.anime_title ?? `Anime #${review.anime_id}`,
    cover_image: review.cover_image ?? null,
    detail: review.is_spoiler ? "Spoiler review" : "Review posted",
    occurred_at: new Date(now.getTime() - index * 1000 * 60 * 60 * 7).toISOString(),
  }));

  return {
    stats: {
      tracked_entries: mockEntries.length,
      reviews_written: mockReviews.length,
      total_episodes_watched: mockEntries.reduce((sum, entry) => sum + entry.episodes_watched, 0),
      average_score: scoredEntries.length
        ? Number((scoredEntries.reduce((sum, score) => sum + score, 0) / scoredEntries.length).toFixed(2))
        : null,
      watching_entries: mockEntries.filter((entry) => entry.status === "WATCHING").length,
      completed_entries: mockEntries.filter((entry) => entry.status === "COMPLETED").length,
      account_age_days: 21,
    },
    recent_activity: [...recentEntryActivity, ...recentReviewActivity]
      .sort((left, right) => {
        const leftTime = new Date(left.occurred_at ?? 0).getTime();
        const rightTime = new Date(right.occurred_at ?? 0).getTime();
        return rightTime - leftTime;
      })
      .slice(0, 6),
  };
}

export async function getUserDashboard(userEmail?: string): Promise<UserDashboard> {
  try {
    return await fetchJson<UserDashboard>("/users/me/dashboard", {
      userEmail,
      noStore: true,
    });
  } catch {
    return buildUserDashboardFallback(userEmail);
  }
}
