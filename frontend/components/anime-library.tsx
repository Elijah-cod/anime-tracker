import { Star } from "lucide-react";

import { SafeImage } from "@/components/safe-image";
import { AnimeNode } from "@/types/anime";

export function AnimeLibrary({ items }: { items: AnimeNode[] }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold tracking-[-0.025em] text-ink">Trending Now</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => {
          const title = item.title.english ?? item.title.romaji;
          return (
            <article key={item.id} className="min-w-0">
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted shadow-card">
                <SafeImage
                  src={item.cover_image}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-200 hover:scale-[1.025]"
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                />
              </div>
              <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-ink sm:text-base">
                {title}
              </h3>
              <div className="mt-1 flex items-center gap-1 text-sm text-subtle">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{item.average_score ? (item.average_score / 10).toFixed(1) : "New"}</span>
                {item.episodes ? <span className="ml-1">· {item.episodes} eps</span> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
