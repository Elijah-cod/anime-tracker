import { MessageSquareQuote, PencilLine } from "lucide-react";

import { SafeImage } from "@/components/safe-image";
import { UserActivityItem } from "@/types/anime";

function formatActivityTime(occurredAt?: string | null) {
  if (!occurredAt) return "Just now";
  const date = new Date(occurredAt);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityTimeline({ items }: { items: UserActivityItem[] }) {
  return (
    <section className="rounded-[1.5rem] border border-border bg-surface p-5 shadow-card sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">Activity</p>
        <h2 className="mt-1 text-xl font-semibold text-ink">Recent updates</h2>
      </div>
      <div className="mt-5 divide-y divide-border">
        {items.map((item) => {
          const Icon = item.kind === "review_created" ? MessageSquareQuote : PencilLine;
          return (
            <article key={`${item.kind}-${item.anime_id}-${item.occurred_at}`} className="flex gap-3 py-4 first:pt-0 last:pb-0">
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-canvas">
                <SafeImage src={item.cover_image} alt={item.anime_title} fill className="object-cover" sizes="48px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="truncate font-semibold text-ink">{item.anime_title}</p>
                  <span className="shrink-0 text-xs text-subtle">{formatActivityTime(item.occurred_at)}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-subtle">{item.detail}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent">
                  <Icon className="h-3.5 w-3.5" />
                  {item.kind === "review_created" ? "Comment" : "List update"}
                </span>
              </div>
            </article>
          );
        })}
      </div>
      {!items.length ? <p className="mt-4 text-sm text-subtle">Your latest list updates will appear here.</p> : null}
    </section>
  );
}
