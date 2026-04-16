import { Clock3, MessageSquareQuote, PencilLine } from "lucide-react";

import { SafeImage } from "@/components/safe-image";
import { UserActivityItem } from "@/types/anime";

function formatActivityTime(occurredAt?: string | null) {
  if (!occurredAt) {
    return "Just now";
  }

  const date = new Date(occurredAt);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityTimeline({ items }: { items: UserActivityItem[] }) {
  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Recent Activity
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            What this account changed lately
          </h2>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 p-3 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <Clock3 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <article
            key={`${item.kind}-${item.anime_id}-${item.occurred_at}`}
            className="grid gap-4 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/80 md:grid-cols-[72px_1fr_auto]"
          >
            <div className="relative h-[88px] overflow-hidden rounded-2xl">
              <SafeImage src={item.cover_image} alt={item.anime_title} fill className="object-cover" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-base font-semibold text-slate-950 dark:text-slate-50">
                  {item.anime_title}
                </h3>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-slate-950">
                  {item.kind === "review_created" ? (
                    <>
                      <MessageSquareQuote className="h-3.5 w-3.5" />
                      Review
                    </>
                  ) : (
                    <>
                      <PencilLine className="h-3.5 w-3.5" />
                      Update
                    </>
                  )}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
            </div>
            <div className="self-start text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              {formatActivityTime(item.occurred_at)}
            </div>
          </article>
        ))}
      </div>

      {!items.length ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Activity will show up here after you update entries or post reviews.
        </p>
      ) : null}
    </section>
  );
}
