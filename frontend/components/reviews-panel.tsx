"use client";

import Link from "next/link";
import { MessageSquareQuote } from "lucide-react";
import { FormEvent, useOptimistic, useState, useTransition } from "react";

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
      created_at: new Date().toISOString(),
    };

    addOptimisticReview(optimisticReview);

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
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Comments
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            Add a comment for a specific anime
          </h2>
        </div>
        <div className="rounded-full border border-fuchsia-300/70 bg-fuchsia-100/70 p-3 text-fuchsia-700 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-200">
          <MessageSquareQuote className="h-5 w-5" />
        </div>
      </div>

      {hasEntries ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/80">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Choose the anime you want to comment on
            </span>
            <select
              value={selectedAnimeId}
              onChange={(event) => setSelectedAnimeId(Number.parseInt(event.target.value, 10))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-500"
            >
              {entries.map((entry) => (
                <option key={entry.anime_id} value={entry.anime_id}>
                  {entry.title}
                </option>
              ))}
            </select>
          </label>

          {selectedEntry ? (
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/80">
              <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                Commenting on: {selectedEntry.title}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your comment will be attached to this anime specifically.
              </p>
            </div>
          ) : null}

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={4}
            placeholder={buildCommentPlaceholder(selectedEntry?.title)}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-500"
          />

          <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={isSpoiler}
              onChange={(event) => setIsSpoiler(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-sky-400"
            />
            Mark as spoiler
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-fuchsia-500 dark:text-slate-950 dark:hover:bg-fuchsia-400"
          >
            Post comment
          </button>
        </form>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
          <p className="font-semibold text-slate-950 dark:text-slate-50">
            Track an anime before posting a comment.
          </p>
          <p className="mt-2">
            Search for a title on the dashboard and use <span className="font-semibold">Start watching</span>{" "}
            or <span className="font-semibold">Add to queue</span>. Once it is tracked, it will show
            up here so you can attach a comment to that specific anime.
          </p>
          <p className="mt-2">
            You can also manage statuses from{" "}
            <Link href="/library" className="underline underline-offset-4">
              Library
            </Link>
            .
          </p>
        </div>
      )}

      {error ? (
        <p className="mt-4 text-sm text-rose-600 dark:text-rose-300">{error}</p>
      ) : null}

      <div className="mt-6 space-y-4">
        {optimisticReviews.map((review) => (
          <article
            key={review.id}
            className="grid gap-4 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/80 md:grid-cols-[72px_1fr]"
          >
            <div className="relative h-[92px] overflow-hidden rounded-2xl">
              <SafeImage
                src={review.cover_image}
                alt={review.anime_title ?? "Anime review"}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-base font-semibold text-slate-950 dark:text-slate-50">
                  {review.anime_title ?? `Anime #${review.anime_id}`}
                </h3>
                {review.is_spoiler ? (
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                    Spoiler
                  </span>
                ) : null}
                <span className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  {formatReviewDate(review.created_at)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {review.content}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
