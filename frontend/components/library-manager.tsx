"use client";

import { Check, Filter, LoaderCircle, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { SafeImage } from "@/components/safe-image";
import { deleteEntry, updateEntry } from "@/lib/api";
import { AnimeEntry } from "@/types/anime";

const STATUSES = ["ALL", "WATCHING", "PLANNING", "COMPLETED", "PAUSED", "DROPPED"] as const;
type StatusFilter = (typeof STATUSES)[number];

type DraftState = Record<
  number,
  {
    status: string;
    score: string;
  }
>;

function sortEntries(entries: AnimeEntry[]) {
  return [...entries].sort((left, right) => {
    const leftWatchingBias = left.status === "WATCHING" ? -1 : 0;
    const rightWatchingBias = right.status === "WATCHING" ? -1 : 0;
    if (leftWatchingBias !== rightWatchingBias) {
      return leftWatchingBias - rightWatchingBias;
    }
    return left.title.localeCompare(right.title);
  });
}

export function LibraryManager({
  entries,
  activeUserEmail,
}: {
  entries: AnimeEntry[];
  activeUserEmail?: string;
}) {
  const [libraryEntries, setLibraryEntries] = useState(sortEntries(entries));
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [drafts, setDrafts] = useState<DraftState>(
    Object.fromEntries(
      entries.map((entry) => [
        entry.anime_id,
        {
          status: entry.status,
          score: entry.score === null || entry.score === undefined ? "" : String(entry.score),
        },
      ]),
    ),
  );
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setMessage(null);
    }, 2800);

    return () => window.clearTimeout(timeoutId);
  }, [message]);

  const filteredEntries = useMemo(() => {
    if (filter === "ALL") {
      return libraryEntries;
    }
    return libraryEntries.filter((entry) => entry.status === filter);
  }, [filter, libraryEntries]);

  const statusCounts = useMemo(
    () =>
      libraryEntries.reduce<Record<string, number>>((counts, entry) => {
        counts[entry.status] = (counts[entry.status] ?? 0) + 1;
        return counts;
      }, {}),
    [libraryEntries],
  );

  function updateDraft(animeId: number, patch: Partial<DraftState[number]>) {
    setMessage(null);
    setDrafts((current) => ({
      ...current,
      [animeId]: {
        ...current[animeId],
        ...patch,
      },
    }));
  }

  function handleSave(entry: AnimeEntry) {
    const draft = drafts[entry.anime_id];
    setSavingId(entry.anime_id);
    setMessage(null);

    startTransition(async () => {
      try {
        const scoreValue = draft.score.trim() ? Number.parseFloat(draft.score) : null;
        const updated = await updateEntry(entry.anime_id, {
          status: draft.status,
          score: Number.isNaN(scoreValue ?? NaN) ? null : scoreValue,
        }, activeUserEmail);
        setLibraryEntries((current) =>
          sortEntries(current.map((item) => (item.anime_id === updated.anime_id ? updated : item))),
        );
        setDrafts((current) => ({
          ...current,
          [entry.anime_id]: {
            status: updated.status,
            score: updated.score === null || updated.score === undefined ? "" : String(updated.score),
          },
        }));
        setMessage(`Saved changes for ${updated.title}.`);
      } catch {
        setMessage("Could not save that entry right now.");
      } finally {
        setSavingId(null);
      }
    });
  }

  function handleDelete(entry: AnimeEntry) {
    setDeletingId(entry.anime_id);
    setMessage(null);

    startTransition(async () => {
      try {
        await deleteEntry(entry.anime_id, activeUserEmail);
        setLibraryEntries((current) =>
          current.filter((item) => item.anime_id !== entry.anime_id),
        );
        setMessage(`Removed ${entry.title} from your tracker.`);
      } catch {
        setMessage("Could not remove that entry right now.");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Library Manager
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            Filter statuses and tune entries
          </h2>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {libraryEntries.length} tracked entries
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === status
                ? "bg-slate-950 text-white dark:bg-sky-500 dark:text-slate-950"
                : "border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {status === "ALL" ? (
              <span className="inline-flex items-center gap-2">
                <Filter className="h-4 w-4" />
                All
              </span>
            ) : (
              status
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUSES.filter((status) => status !== "ALL").map((status) => (
          <div
            key={`count-${status}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            {status}: {statusCounts[status] ?? 0}
          </div>
        ))}
      </div>

      {message ? (
        <p className="mt-4 text-sm text-slate-600 transition-opacity dark:text-slate-300">
          {message}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4">
        {filteredEntries.map((entry) => {
          const draft = drafts[entry.anime_id] ?? {
            status: entry.status,
            score: entry.score === null || entry.score === undefined ? "" : String(entry.score),
          };
          const isSaving = savingId === entry.anime_id && isPending;
          const isDeleting = deletingId === entry.anime_id && isPending;

          return (
            <article
              key={entry.anime_id}
              className="grid gap-4 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/80 lg:grid-cols-[88px_1fr_auto]"
            >
              <div className="relative h-28 overflow-hidden rounded-2xl">
                <SafeImage src={entry.cover_image} alt={entry.title} fill className="object-cover" />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                    {entry.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {entry.episodes_watched} / {entry.total_episodes ?? "?"} episodes watched
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                  <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <span>Status</span>
                    <select
                      value={draft.status}
                      onChange={(event) =>
                        updateDraft(entry.anime_id, { status: event.target.value })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-500"
                    >
                      {STATUSES.filter((status) => status !== "ALL").map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Score
                    </span>
                    <input
                      value={draft.score}
                      onChange={(event) => updateDraft(entry.anime_id, { score: event.target.value })}
                      inputMode="decimal"
                      placeholder="8.5"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-500"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3">
                <button
                  type="button"
                  onClick={() => handleSave(entry)}
                  disabled={isSaving || isDeleting}
                  className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                >
                  {isSaving ? (
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Saving
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Save changes
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(entry)}
                  disabled={isSaving || isDeleting}
                  className="inline-flex rounded-full border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-rose-500/30 dark:bg-slate-950 dark:text-rose-300 dark:hover:bg-rose-500/10"
                >
                  {isDeleting ? (
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Removing
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </span>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {!filteredEntries.length ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          No entries match that status yet.
        </p>
      ) : null}
    </section>
  );
}
