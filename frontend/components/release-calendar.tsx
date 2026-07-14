"use client";

import { CalendarDays } from "lucide-react";
import { format, fromUnixTime } from "date-fns";
import { useEffect, useState } from "react";

import { SafeImage } from "@/components/safe-image";
import { AnimeCalendarItem } from "@/types/anime";

function LocalAiringTime({ airingAt, mobile = false }: { airingAt?: number | null; mobile?: boolean }) {
  const [label, setLabel] = useState("Time TBA");

  useEffect(() => {
    if (airingAt) {
      setLabel(format(fromUnixTime(airingAt), "EEE, MMM d · h:mm a"));
    }
  }, [airingAt]);

  return (
    <time
      dateTime={airingAt ? fromUnixTime(airingAt).toISOString() : undefined}
      className={
        mobile
          ? "mt-1 block text-xs font-medium text-accent sm:hidden"
          : "hidden rounded-lg bg-accent-soft px-3 py-2 text-xs font-semibold text-accent sm:block"
      }
    >
      {label}
    </time>
  );
}

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
              <LocalAiringTime airingAt={item.airing_at} mobile />
            </div>
            <LocalAiringTime airingAt={item.airing_at} />
          </article>
        ))}
      </div>
    </section>
  );
}
