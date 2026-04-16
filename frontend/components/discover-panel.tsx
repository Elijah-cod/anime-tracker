"use client";

import { BookmarkPlus, CheckCircle2, LoaderCircle, PlayCircle, Search } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { SafeImage } from "@/components/safe-image";
import { createEntry, searchAnime } from "@/lib/api";
import { AnimeEntry, AnimeNode } from "@/types/anime";

type AddStatus = "WATCHING" | "PLANNING";

export function DiscoverPanel({
  entries,
  activeUserEmail,
}: {
  entries: AnimeEntry[];
  activeUserEmail?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [results, setResults] = useState<AnimeNode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searching, startSearchTransition] = useTransition();
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<Record<number, AddStatus>>({});

  const trackedStatusByAnimeId = useMemo(
    () =>
      entries.reduce<Record<number, string>>((map, entry) => {
        map[entry.anime_id] = entry.status;
        return map;
      }, {}),
    [entries],
  );

  useEffect(() => {
    const normalizedQuery = deferredQuery.trim();
    if (normalizedQuery.length < 2) {
      setResults([]);
      return;
    }

    setError(null);
    startSearchTransition(async () => {
      try {
        const items = await searchAnime(normalizedQuery);
        setResults(items);
      } catch {
        setError("Search is unavailable right now.");
      }
    });
  }, [deferredQuery]);

  async function handleAdd(item: AnimeNode, status: AddStatus) {
    setAddingKey(`${item.id}:${status}`);
    setError(null);

    try {
      await createEntry({
        anime_id: item.id,
        title: item.title.english ?? item.title.romaji,
        cover_image: item.cover_image ?? `/api/poster/${item.id}`,
        status,
        episodes_watched: 0,
        total_episodes: item.episodes ?? null,
      }, activeUserEmail);
      setAddedItems((current) => ({
        ...current,
        [item.id]: status,
      }));
      router.refresh();
    } catch {
      setError("Could not add that anime to your tracker.");
    } finally {
      setAddingKey(null);
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Discover
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            Search AniList and save titles
          </h2>
        </div>
      </div>

      <label className="mt-6 flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <Search className="h-4 w-4" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for a title like Vinland Saga or Mob Psycho 100"
          className="w-full bg-transparent outline-none placeholder:text-slate-400"
        />
      </label>

      {error ? (
        <p className="mt-4 text-sm text-rose-600 dark:text-rose-300">{error}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-900">
          Start watching for one-click tracking
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-900">
          Add to queue for queue and snapshot
        </span>
      </div>

      {searching ? (
        <div className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Searching AniList…
        </div>
      ) : null}

      {!searching && deferredQuery.trim().length >= 2 ? (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => {
            const trackedStatus = addedItems[item.id] ?? trackedStatusByAnimeId[item.id];
            const isTracked = Boolean(trackedStatus);
            const isWatching = trackedStatus === "WATCHING";
            const isPlanning = trackedStatus === "PLANNING";
            const isWatchingBusy = addingKey === `${item.id}:WATCHING`;
            const isPlanningBusy = addingKey === `${item.id}:PLANNING`;

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/80"
              >
                <div className="relative aspect-[3/4]">
                  <SafeImage
                    src={item.cover_image}
                    alt={item.title.english ?? item.title.romaji}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1280px) 50vw, 25vw"
                  />
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <h3 className="line-clamp-3 min-h-[6.25rem] text-2xl font-semibold leading-9 text-slate-950 dark:text-slate-50">
                      {item.title.english ?? item.title.romaji}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span>{item.episodes ? `${item.episodes} episodes` : "Episode count TBA"}</span>
                      {trackedStatus ? (
                        <span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white dark:bg-white dark:text-slate-950">
                          {trackedStatus}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={() => handleAdd(item, "WATCHING")}
                      disabled={isTracked || isWatchingBusy || isPlanningBusy}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:bg-orange-500 dark:text-slate-950 dark:hover:bg-orange-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
                    >
                      {isWatchingBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                      {isWatching ? <CheckCircle2 className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                      {isWatching ? "In one-click tracking" : isTracked ? "Already tracked" : "Start watching"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAdd(item, "PLANNING")}
                      disabled={isTracked || isWatchingBusy || isPlanningBusy}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 dark:disabled:bg-slate-900 dark:disabled:text-slate-500"
                    >
                      {isPlanningBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                      {isPlanning ? <CheckCircle2 className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                      {isPlanning ? "In queue" : isTracked ? "Already tracked" : "Add to queue"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {!searching && deferredQuery.trim().length >= 2 && !results.length ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          No matching titles yet. Try a broader search phrase.
        </p>
      ) : null}
    </section>
  );
}
