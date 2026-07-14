"use client";

import { Play, Plus } from "lucide-react";
import Link from "next/link";
import { startTransition, useEffect, useOptimistic, useState } from "react";

import { SafeImage } from "@/components/safe-image";
import { incrementEpisodeProgress } from "@/lib/api";
import { AnimeEntry } from "@/types/anime";

function progressFor(entry: AnimeEntry) {
  if (!entry.total_episodes) return 35;
  return Math.min((entry.episodes_watched / entry.total_episodes) * 100, 100);
}

export function CurrentProgress({
  entries,
  activeUserEmail,
  compact = false,
}: {
  entries: AnimeEntry[];
  activeUserEmail?: string;
  compact?: boolean;
}) {
  const [baseEntries, setBaseEntries] = useState(entries);
  const [error, setError] = useState<string | null>(null);
  const [optimisticEntries, addOptimisticEntry] = useOptimistic(
    baseEntries,
    (state, animeId: number) =>
      state.map((entry) =>
        entry.anime_id === animeId
          ? { ...entry, episodes_watched: entry.episodes_watched + 1 }
          : entry,
      ),
  );
  const watchEntries = optimisticEntries.filter((entry) => entry.status === "WATCHING");

  useEffect(() => {
    setBaseEntries(entries);
  }, [entries]);

  async function handleAdvance(entry: AnimeEntry) {
    setError(null);
    addOptimisticEntry(entry.anime_id);

    startTransition(async () => {
      try {
        const updated = await incrementEpisodeProgress(entry, activeUserEmail);
        setBaseEntries((current) =>
          current.map((item) => (item.anime_id === updated.anime_id ? updated : item)),
        );
      } catch {
        setError("Progress could not be synced. Try again.");
      }
    });
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-[-0.025em] text-ink">
          {compact ? "Continue Watching" : "Currently Watching"}
        </h2>
        <Link href="/library" className="text-sm font-semibold text-accent hover:underline">
          View list
        </Link>
      </div>

      {watchEntries.length ? (
        <div className="-mx-5 flex snap-x gap-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
          {watchEntries.map((entry) => (
            <article
              key={entry.anime_id}
              className="w-[286px] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-surface shadow-card sm:w-[340px]"
            >
              <div className="relative aspect-[16/9] bg-muted">
                <SafeImage
                  src={entry.cover_image}
                  alt={entry.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 286px, 340px"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-base font-bold leading-6 text-ink">
                      {entry.title}
                    </h3>
                    <p className="mt-1 text-sm text-subtle">
                      Episode {entry.episodes_watched} of {entry.total_episodes ?? "?"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAdvance(entry)}
                    aria-label={`Log the next episode of ${entry.title}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent/90"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-200"
                    style={{ width: `${progressFor(entry)}%` }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex min-h-36 items-center gap-4 rounded-2xl border border-dashed border-line bg-surface p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Play className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-ink">Nothing is currently playing.</p>
            <p className="mt-1 text-sm text-subtle">
              Add a title from <Link href="/discover" className="font-semibold text-accent">Discover</Link>.
            </p>
          </div>
        </div>
      )}

      {error ? <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p> : null}
    </section>
  );
}
