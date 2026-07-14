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

function normalizeScore(score: AnimeEntry["score"] | string) {
  if (score === null || score === undefined) {
    return "";
  }

  const rawValue = String(score).trim();
  if (!rawValue) {
    return "";
  }

  const parsed = Number.parseFloat(rawValue);
  return Number.isNaN(parsed) ? rawValue : parsed.toString();
}

function buildDrafts(entries: AnimeEntry[]): DraftState {
  return Object.fromEntries(
    entries.map((entry) => [
      entry.anime_id,
      {
        status: entry.status,
        score: entry.score === null || entry.score === undefined ? "" : String(entry.score),
      },
    ]),
  );
}

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
  const [drafts, setDrafts] = useState<DraftState>(buildDrafts(entries));
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLibraryEntries(sortEntries(entries));
    setDrafts(buildDrafts(entries));
  }, [entries]);

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
    if (!draft) {
      return;
    }
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
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-[-0.025em] text-ink">Library</h2>
        <div className="text-sm text-subtle">
          {libraryEntries.length} tracked entries
        </div>
      </div>

      <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto border-b border-line px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition-colors ${
              filter === status
                ? "border-accent text-accent"
                : "border-transparent text-subtle hover:text-ink"
            }`}
          >
            {status === "ALL" ? (
              <span className="inline-flex items-center gap-2">
                <Filter className="h-4 w-4" />
                All
              </span>
            ) : (
              <>
                <span className="capitalize">{status.toLowerCase().replace("_", " ")}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-subtle">
                  {statusCounts[status] ?? 0}
                </span>
              </>
            )}
          </button>
        ))}
      </div>

      {message ? (
        <p className="mt-4 text-sm font-medium text-accent transition-opacity">
          {message}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3">
        {filteredEntries.map((entry) => {
          const draft = drafts[entry.anime_id] ?? {
            status: entry.status,
            score: entry.score === null || entry.score === undefined ? "" : String(entry.score),
          };
          const isDirty =
            draft.status !== entry.status ||
            normalizeScore(draft.score) !== normalizeScore(entry.score);
          const isSaving = savingId === entry.anime_id && isPending;
          const isDeleting = deletingId === entry.anime_id && isPending;

          return (
            <article
              key={entry.anime_id}
              className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 rounded-2xl border border-line bg-surface p-3.5 sm:grid-cols-[82px_minmax(0,1fr)] lg:grid-cols-[82px_minmax(0,1fr)_auto] lg:p-4"
            >
              <div className="relative h-[104px] overflow-hidden rounded-xl bg-muted sm:h-[116px]">
                <SafeImage src={entry.cover_image} alt={entry.title} fill className="object-cover" sizes="82px" />
              </div>

              <div className="min-w-0 space-y-3">
                <div>
                  <h3 className="line-clamp-2 text-base font-bold text-ink sm:text-lg">
                    {entry.title}
                  </h3>
                  <p className="mt-1 text-xs text-subtle sm:text-sm">
                    {entry.episodes_watched} / {entry.total_episodes ?? "?"} episodes watched
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-[1fr_130px]">
                  <label className="space-y-1 text-xs font-medium text-subtle">
                    <span>Status</span>
                    <select
                      value={draft.status}
                      onChange={(event) =>
                        updateDraft(entry.anime_id, { status: event.target.value })
                      }
                      className="min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
                    >
                      {STATUSES.filter((status) => status !== "ALL").map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1 text-xs font-medium text-subtle">
                    <span className="inline-flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Score
                    </span>
                    <input
                      value={draft.score}
                      onChange={(event) => updateDraft(entry.anime_id, { score: event.target.value })}
                      inputMode="decimal"
                      placeholder="8.5"
                      className="min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
                    />
                  </label>
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-end gap-2 lg:col-span-1 lg:flex-col lg:items-stretch">
                <button
                  type="button"
                  onClick={() => handleSave(entry)}
                  disabled={!isDirty || isSaving || isDeleting}
                  className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    isDirty
                      ? "bg-accent text-white hover:bg-accent/90"
                      : "border border-line bg-muted text-subtle"
                  }`}
                >
                  {isSaving ? (
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Saving
                    </span>
                  ) : !isDirty ? (
                    <span className="inline-flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Up to date
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
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-300 dark:hover:bg-red-950/30"
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
        <p className="mt-4 text-sm text-subtle">
          No entries match that status yet.
        </p>
      ) : null}
    </section>
  );
}
