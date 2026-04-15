"use client";

import Image from "next/image";
import { startTransition, useOptimistic, useState } from "react";

import { incrementEpisodeProgress } from "@/lib/api";
import { AnimeEntry } from "@/types/anime";

const statusAccent: Record<string, string> = {
  WATCHING: "bg-orange-500/15 text-orange-700 ring-orange-300 dark:text-orange-200 dark:ring-orange-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-700 ring-emerald-300 dark:text-emerald-200 dark:ring-emerald-500/30",
  PAUSED: "bg-amber-500/15 text-amber-700 ring-amber-300 dark:text-amber-200 dark:ring-amber-500/30",
  PLANNING: "bg-sky-500/15 text-sky-700 ring-sky-300 dark:text-sky-200 dark:ring-sky-500/30",
  DROPPED: "bg-rose-500/15 text-rose-700 ring-rose-300 dark:text-rose-200 dark:ring-rose-500/30",
};

export function CurrentProgress({ entries }: { entries: AnimeEntry[] }) {
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

  async function handleAdvance(entry: AnimeEntry) {
    setError(null);
    addOptimisticEntry(entry.anime_id);

    startTransition(async () => {
      try {
        const updated = await incrementEpisodeProgress(entry);
        setBaseEntries((current) =>
          current.map((item) => (item.anime_id === updated.anime_id ? updated : item)),
        );
      } catch {
        setError("Could not sync progress right now. The UI stayed optimistic.");
      }
    });
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Current Progress
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            One-click episode tracking
          </h2>
        </div>
        <div className="rounded-full border border-orange-300/70 bg-orange-100/80 px-4 py-2 text-sm font-medium text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200">
          Optimistic UI
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {optimisticEntries.map((entry) => (
          <article
            key={entry.anime_id}
            className="grid gap-4 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/80 md:grid-cols-[96px_1fr_auto]"
          >
            <div className="relative h-28 overflow-hidden rounded-2xl">
              {entry.cover_image ? (
                <Image src={entry.cover_image} alt={entry.title} fill className="object-cover" />
              ) : (
                <div className="h-full w-full bg-slate-200 dark:bg-slate-800" />
              )}
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                  {entry.title}
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusAccent[entry.status] ?? ""}`}
                >
                  {entry.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>
                    {entry.episodes_watched} / {entry.total_episodes ?? "?"} episodes
                  </span>
                  <span>{entry.score ? `${entry.score.toFixed(1)} score` : "No score yet"}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-300 transition-all"
                    style={{
                      width: `${
                        entry.total_episodes
                          ? Math.min((entry.episodes_watched / entry.total_episodes) * 100, 100)
                          : 35
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleAdvance(entry)}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-orange-500 dark:text-slate-950 dark:hover:bg-orange-400"
              >
                +1 episode
              </button>
            </div>
          </article>
        ))}
      </div>

      {error ? (
        <p className="mt-4 text-sm text-rose-600 dark:text-rose-300">{error}</p>
      ) : null}
    </section>
  );
}
