import { CalendarDays } from "lucide-react";
import { format, fromUnixTime } from "date-fns";

import { SafeImage } from "@/components/safe-image";
import { AnimeCalendarItem } from "@/types/anime";

export function ReleaseCalendar({ items }: { items: AnimeCalendarItem[] }) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-accent" />
        <h2 className="text-2xl font-bold tracking-[-0.025em] text-ink">Upcoming Releases</h2>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {items.map((item, index) => (
          <article
            key={`${item.id}-${item.episode}`}
            className={`grid grid-cols-[54px_minmax(0,1fr)] items-center gap-3 p-3 sm:grid-cols-[54px_minmax(0,1fr)_auto] sm:px-4 ${index ? "border-t border-line" : ""}`}
          >
            <div className="relative h-[68px] overflow-hidden rounded-lg bg-muted">
              <SafeImage src={item.cover_image} alt={item.title.romaji} fill className="object-cover" sizes="54px" />
            </div>
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-semibold text-ink sm:text-base">
                {item.title.english ?? item.title.romaji}
              </h3>
              <p className="mt-1 text-xs text-subtle">Episode {item.episode ?? "?"}</p>
              <p className="mt-1 text-xs font-medium text-accent sm:hidden">
                {item.airing_at ? format(fromUnixTime(item.airing_at), "EEE, MMM d · h:mm a") : "Time TBA"}
              </p>
            </div>
            <time className="hidden rounded-lg bg-accent-soft px-3 py-2 text-xs font-semibold text-accent sm:block">
              {item.airing_at ? format(fromUnixTime(item.airing_at), "EEE, MMM d · h:mm a") : "Time TBA"}
            </time>
          </article>
        ))}
      </div>
    </section>
  );
}
