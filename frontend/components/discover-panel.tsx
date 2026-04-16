"use client";

import { CheckCircle2, LoaderCircle, Plus, Search } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { SafeImage } from "@/components/safe-image";
import { createEntry, searchAnime } from "@/lib/api";
import { AnimeEntry, AnimeNode } from "@/types/anime";

export function DiscoverPanel({ entries }: { entries: AnimeEntry[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [results, setResults] = useState<AnimeNode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searching, startSearchTransition] = useTransition();
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<number[]>([]);

  const existingEntryIds = useMemo(
    () => new Set([...entries.map((entry) => entry.anime_id), ...addedIds]),
    [entries, addedIds],
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

  async function handleAdd(item: AnimeNode) {
    setAddingId(item.id);
    setError(null);

    try {
      await createEntry({
        anime_id: item.id,
        title: item.title.english ?? item.title.romaji,
        cover_image: item.cover_image ?? `/api/poster/${item.id}`,
        status: "PLANNING",
        episodes_watched: 0,
        total_episodes: item.episodes ?? null,
      });
      setAddedIds((current) => [...current, item.id]);
      router.refresh();
    } catch {
      setError("Could not add that anime to your tracker.");
    } finally {
      setAddingId(null);
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Discover
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            Search AniList and save titles
          </h2>
        </div>
        <p className="max-w-sm text-right text-sm text-slate-600 dark:text-slate-300">
          Find a show, add it to your tracker, and refresh the rest of the dashboard instantly.
        </p>
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

      {searching ? (
        <div className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Searching AniList…
        </div>
      ) : null}

      {!searching && deferredQuery.trim().length >= 2 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {results.map((item) => {
            const isAdded = existingEntryIds.has(item.id);
            const isBusy = addingId === item.id;

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
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="line-clamp-2 font-semibold text-slate-950 dark:text-slate-50">
                      {item.title.english ?? item.title.romaji}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {item.episodes ? `${item.episodes} episodes` : "Episode count TBA"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdd(item)}
                    disabled={isAdded || isBusy}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
                  >
                    {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    {isAdded ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {isAdded ? "In tracker" : "Add to tracker"}
                  </button>
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
