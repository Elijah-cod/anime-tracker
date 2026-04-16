import Image from "next/image";
import { ArrowUpRight, Sparkles, Workflow } from "lucide-react";

import { AnimeLibrary } from "@/components/anime-library";
import { CurrentProgress } from "@/components/current-progress";
import { DiscoverPanel } from "@/components/discover-panel";
import { LibraryManager } from "@/components/library-manager";
import { MalImportPanel } from "@/components/mal-import-panel";
import { ReleaseCalendar } from "@/components/release-calendar";
import { ReviewsPanel } from "@/components/reviews-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { getEntries, getReleaseCalendar, getReviews, getTrendingAnime } from "@/lib/api";

export default async function HomePage() {
  const [trending, calendar, entries, reviews] = await Promise.all([
    getTrendingAnime(),
    getReleaseCalendar(),
    getEntries(),
    getReviews(),
  ]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-8 px-4 py-6 md:px-8 md:py-8">
      <section className="overflow-hidden rounded-[2.25rem] border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur dark:border-white/10 dark:bg-slate-950/70 md:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-4 rounded-full border border-white/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl">
                <Image
                  src="/anime-tracker-logo.png"
                  alt="Anime Tracker logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">Anime Tracker</p>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                  Your anime command center
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200">
              <Sparkles className="h-4 w-4" />
              AniList powered
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-6xl">
              A fast anime tracker built for one-click progress, local release times, and clean
              discovery.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
              Next.js on the front, FastAPI in the middle, PostgreSQL underneath. The whole app is
              structured to stay deployment-friendly for Vercel, Render or Railway, and serverless
              Postgres.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <ThemeToggle />
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                <Workflow className="h-4 w-4" />
                Agile Stream branch flow
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
                  <code className="font-mono">feature/*</code>
                  <ArrowUpRight className="h-4 w-4" />
                  <code className="font-mono">develop</code>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
                  <code className="font-mono">develop</code>
                  <ArrowUpRight className="h-4 w-4" />
                  <code className="font-mono">main</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <CurrentProgress entries={entries} />
        <ReleaseCalendar items={calendar} />
      </section>

      <DiscoverPanel entries={entries} />

      <LibraryManager entries={entries} />

      <AnimeLibrary items={trending} />

      <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <MalImportPanel />
        <ReviewsPanel entries={entries} initialReviews={reviews} />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Future Proofing
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            Social login ready
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            The repo is structured so Clerk or NextAuth.js can slot in later for Google, GitHub,
            or Discord sign-in without reshaping the app shell.
          </p>
        </article>
        <article className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Analytics
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            Vercel Analytics enabled
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            The frontend layout already includes the analytics hook so usage insights can flow as
            soon as the app is deployed on Vercel.
          </p>
        </article>
      </section>
    </main>
  );
}
