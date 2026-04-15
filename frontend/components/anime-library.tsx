"use client";

import { Search } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { SafeImage } from "@/components/safe-image";
import { AnimeNode } from "@/types/anime";

export function AnimeLibrary({ items }: { items: AnimeNode[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const filteredItems = items.filter((item) => {
    const haystack = `${item.title.romaji} ${item.title.english ?? ""}`.toLowerCase();
    return haystack.includes(deferredQuery.toLowerCase());
  });

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Anime Library
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            Responsive discovery grid
          </h2>
        </div>
        <p className="max-w-sm text-right text-sm text-slate-600 dark:text-slate-300">
          Tailwind grid shifts from one card column on mobile to six on large desktop layouts.
        </p>
      </div>

      <label className="mt-6 flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <Search className="h-4 w-4" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter your library view"
          className="w-full bg-transparent outline-none placeholder:text-slate-400"
        />
      </label>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {filteredItems.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50/80 transition hover:-translate-y-1 hover:shadow-card dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div className="relative aspect-[3/4]">
              {item.cover_image ? (
                <SafeImage
                  src={item.cover_image}
                  alt={item.title.romaji}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 20vw"
                />
              ) : (
                <div className="h-full w-full bg-slate-200 dark:bg-slate-800" />
              )}
            </div>
            <div className="space-y-2 p-4">
              <h3 className="line-clamp-2 font-semibold text-slate-950 dark:text-slate-50">
                {item.title.english ?? item.title.romaji}
              </h3>
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>{item.episodes ? `${item.episodes} eps` : "Unknown length"}</span>
                <span>{item.average_score ? `${item.average_score}%` : "TBD"}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!filteredItems.length ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          No titles match that filter yet.
        </p>
      ) : null}
    </section>
  );
}
