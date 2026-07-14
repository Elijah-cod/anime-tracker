"use client";

import { BookmarkPlus, Check, LoaderCircle, Play, Search } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
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
  const searchRequestId = useRef(0);
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
    const requestId = ++searchRequestId.current;

    if (normalizedQuery.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    setError(null);
    startSearchTransition(async () => {
      try {
        const items = await searchAnime(normalizedQuery);
        if (searchRequestId.current === requestId) setResults(items);
      } catch (searchError) {
        if (searchRequestId.current !== requestId) return;
        setResults([]);
        setError(searchError instanceof Error ? searchError.message : "Search is unavailable.");
      }
    });
  }, [deferredQuery]);

  async function handleAdd(item: AnimeNode, status: AddStatus) {
    setAddingKey(`${item.id}:${status}`);
    setError(null);

    try {
      await createEntry(
        {
          anime_id: item.id,
          title: item.title.english ?? item.title.romaji,
          cover_image: item.cover_image ?? `/api/poster/${item.id}`,
          status,
          episodes_watched: 0,
          total_episodes: item.episodes ?? null,
        },
        activeUserEmail,
      );
      setAddedItems((current) => ({ ...current, [item.id]: status }));
      router.refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "That title could not be added.");
    } finally {
      setAddingKey(null);
    }
  }

  const hasSearch = deferredQuery.trim().length >= 2;

  return (
    <section>
      <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-surface px-4 text-subtle shadow-sm focus-within:border-accent">
        {searching ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search anime, titles, or genres"
          className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-subtle"
        />
      </label>

      {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-300">{error}</p> : null}

      {hasSearch ? (
        <div className="mt-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink">Search Results</h2>
            {!searching ? <span className="text-sm text-subtle">{results.length} titles</span> : null}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((item) => {
              const title = item.title.english ?? item.title.romaji;
              const trackedStatus = addedItems[item.id] ?? trackedStatusByAnimeId[item.id];
              const isTracked = Boolean(trackedStatus);
              const isBusy = addingKey?.startsWith(`${item.id}:`) ?? false;

              return (
                <article key={item.id} className="min-w-0">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted shadow-card">
                    <SafeImage
                      src={item.cover_image}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                    />
                    {trackedStatus ? (
                      <span className="absolute left-2 top-2 rounded-lg bg-surface/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-accent shadow-sm">
                        {trackedStatus === "PLANNING" ? "In queue" : "Watching"}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 line-clamp-3 text-sm font-semibold leading-5 text-ink sm:text-base">
                    {title}
                  </h3>
                  <p className="mt-1 text-xs text-subtle">
                    {item.episodes ? `${item.episodes} episodes` : "Episode count TBA"}
                  </p>
                  <div className="mt-3 grid grid-cols-[1fr_44px] gap-2">
                    <button
                      type="button"
                      onClick={() => handleAdd(item, "WATCHING")}
                      disabled={isTracked || isBusy}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-3 text-xs font-bold text-white transition-colors hover:bg-accent/90 disabled:bg-muted disabled:text-subtle"
                    >
                      {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : isTracked ? <Check className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isTracked ? "Added" : "Watch"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdd(item, "PLANNING")}
                      disabled={isTracked || isBusy}
                      aria-label={`Add ${title} to queue`}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-surface text-subtle transition-colors hover:bg-muted hover:text-ink disabled:opacity-50"
                    >
                      <BookmarkPlus className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {!searching && !results.length ? (
            <p className="rounded-2xl border border-dashed border-line bg-surface p-5 text-sm text-subtle">
              No matching titles. Try a broader title.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
