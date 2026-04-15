import { format, fromUnixTime } from "date-fns";

import { SafeImage } from "@/components/safe-image";
import { AnimeCalendarItem } from "@/types/anime";

export function ReleaseCalendar({ items }: { items: AnimeCalendarItem[] }) {
  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
        Release Calendar
      </p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
          Upcoming drops in local time
        </h2>
        <p className="max-w-sm text-right text-sm text-slate-600 dark:text-slate-300">
          AniList timestamps are formatted in the browser using date-fns.
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {items.map((item) => (
          <article
            key={`${item.id}-${item.episode}`}
            className="grid items-center gap-4 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/80 md:grid-cols-[72px_1fr_auto]"
          >
            <div className="relative h-[88px] overflow-hidden rounded-2xl">
              {item.cover_image ? (
                <SafeImage src={item.cover_image} alt={item.title.romaji} fill className="object-cover" />
              ) : (
                <div className="h-full w-full bg-slate-200 dark:bg-slate-800" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-950 dark:text-slate-50">
                {item.title.english ?? item.title.romaji}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Episode {item.episode ?? "?"}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-100 px-4 py-3 text-sm font-medium text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
              {item.airing_at ? format(fromUnixTime(item.airing_at), "EEE, MMM d • h:mm a") : "TBA"}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
