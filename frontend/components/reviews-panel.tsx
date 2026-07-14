"use client";

import Link from "next/link";
import { MessageSquareQuote, Send } from "lucide-react";
import { FormEvent, useEffect, useMemo, useOptimistic, useState, useTransition } from "react";

import { SafeImage } from "@/components/safe-image";
import { createReview } from "@/lib/api";
import { AnimeEntry, Review } from "@/types/anime";

function formatReviewDate(createdAt?: string | null) {
  if (!createdAt) {
    return "Just now";
  }

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function buildCommentPlaceholder(title?: string) {
  if (!title) {
    return "What stood out in the last episode?";
  }

  return `What do you want to say about ${title}?`;
}

export function ReviewsPanel({
  entries,
  initialReviews,
  activeUserEmail,
}: {
  entries: AnimeEntry[];
  initialReviews: Review[];
  activeUserEmail?: string;
}) {
  const defaultAnimeId = entries[0]?.anime_id ?? 0;
  const [selectedAnimeId, setSelectedAnimeId] = useState(defaultAnimeId);
  const [content, setContent] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState(initialReviews);
  const [optimisticReviews, addOptimisticReview] = useOptimistic(
    reviews,
    (currentState, newReview: Review) => [newReview, ...currentState],
  );
  const [isPending, startTransition] = useTransition();

  const selectedEntry = entries.find((entry) => entry.anime_id === selectedAnimeId) ?? entries[0];
  const hasEntries = entries.length > 0;
  const visibleReviews = useMemo(
    () =>
      optimisticReviews.filter((review) =>
        selectedAnimeId ? review.anime_id === selectedAnimeId : true,
      ),
    [optimisticReviews, selectedAnimeId],
  );

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  useEffect(() => {
    if (!entries.length) {
      setSelectedAnimeId(0);
      return;
    }

    if (!entries.some((entry) => entry.anime_id === selectedAnimeId)) {
      setSelectedAnimeId(entries[0].anime_id);
    }
  }, [entries, selectedAnimeId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!selectedEntry) {
      setError("Pick an anime before posting a comment.");
      return;
    }

    if (!content.trim()) {
      setError("Write a few thoughts before posting.");
      return;
    }

    const optimisticReview: Review = {
      id: Date.now(),
      user_id: 1,
      anime_id: selectedEntry.anime_id,
      anime_title: selectedEntry.title,
      cover_image: selectedEntry.cover_image ?? null,
      content: content.trim(),
      is_spoiler: isSpoiler,
      username: "You",
      created_at: new Date().toISOString(),
    };

    startTransition(() => {
      addOptimisticReview(optimisticReview);
    });

    startTransition(async () => {
      try {
        const created = await createReview({
          anime_id: selectedEntry.anime_id,
          anime_title: selectedEntry.title,
          cover_image: selectedEntry.cover_image ?? null,
          content: content.trim(),
          is_spoiler: isSpoiler,
          user_id: 1,
        }, activeUserEmail);
        setReviews((current) => [created, ...current]);
        setContent("");
        setIsSpoiler(false);
      } catch {
        setError("Could not publish the comment right now.");
      }
    });
  }

  return (
    <section className="grid items-start gap-6 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
      <div className="rounded-[1.5rem] border border-border bg-surface p-5 shadow-card lg:sticky lg:top-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent">
            <MessageSquareQuote className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">New comment</p>
            <h2 className="font-semibold text-ink">Share a quick thought</h2>
          </div>
        </div>

        {hasEntries ? (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-subtle">Anime</span>
              <select
                value={selectedAnimeId}
                onChange={(event) => setSelectedAnimeId(Number.parseInt(event.target.value, 10))}
                className="min-h-11 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-ink outline-none transition focus:border-accent"
              >
                {entries.map((entry) => (
                  <option key={entry.anime_id} value={entry.anime_id}>
                    {entry.title}
                  </option>
                ))}
              </select>
            </label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              placeholder={buildCommentPlaceholder(selectedEntry?.title)}
              className="w-full resize-y rounded-xl border border-border bg-canvas px-3 py-3 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-accent"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex min-h-11 items-center gap-2 text-sm text-subtle">
                <input
                  type="checkbox"
                  checked={isSpoiler}
                  onChange={(event) => setIsSpoiler(event.target.checked)}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
                Contains spoilers
              </label>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                Post
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-border bg-canvas p-4 text-sm leading-6 text-subtle">
            Track a title first, then return here to comment. Visit{" "}
            <Link href="/discover" className="font-semibold text-accent hover:underline">
              Discover
            </Link>
            .
          </div>
        )}
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </div>

      <div className="min-w-0">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">Community feed</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">
              {selectedEntry?.title ?? "Recent comments"}
            </h2>
          </div>
          <span className="text-sm text-subtle">{visibleReviews.length} comments</span>
        </div>
        <div className="space-y-3">
          {visibleReviews.map((review) => (
            <article key={review.id} className="rounded-[1.5rem] border border-border bg-surface p-4 shadow-card sm:p-5">
              <div className="flex gap-4">
                <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-canvas">
                  <SafeImage
                    src={review.cover_image}
                    alt={review.anime_title ?? "Anime cover"}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/10 text-xs font-bold uppercase text-accent">
                      {(review.username ?? "A").slice(0, 1)}
                    </span>
                    <p className="font-semibold text-ink">{review.username ?? "Anime fan"}</p>
                    <span className="text-xs text-subtle">{formatReviewDate(review.created_at)}</span>
                    {review.is_spoiler ? (
                      <span className="rounded-full bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                        Spoiler
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-subtle">
                    {review.anime_title ?? `Anime #${review.anime_id}`}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/80">{review.content}</p>
                </div>
              </div>
            </article>
          ))}
          {!visibleReviews.length ? (
            <div className="rounded-[1.5rem] border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-subtle">
              No comments for this title yet.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
