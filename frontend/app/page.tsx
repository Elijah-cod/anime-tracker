import Image from "next/image";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpenCheck, PlayCircle, Sparkles } from "lucide-react";

import { ACCOUNT_COOKIE_NAME, decodeActiveUserEmail } from "@/lib/account-session";
import { AnimeLibrary } from "@/components/anime-library";
import { SiteNav } from "@/components/site-nav";
import { CurrentProgress } from "@/components/current-progress";
import { DiscoverPanel } from "@/components/discover-panel";
import { LibraryInsights } from "@/components/library-insights";
import { MalImportPanel } from "@/components/mal-import-panel";
import { ReleaseCalendar } from "@/components/release-calendar";
import { ReviewsPanel } from "@/components/reviews-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  getCurrentUser,
  getEntries,
  getLibrarySummary,
  getReleaseCalendar,
  getReviews,
  getTrendingAnime,
} from "@/lib/api";

export default async function HomePage() {
  const cookieStore = await cookies();
  const activeUserEmail = decodeActiveUserEmail(cookieStore.get(ACCOUNT_COOKIE_NAME)?.value);

  const [currentUser, trending, calendar, entries, reviews, summary] = await Promise.all([
    getCurrentUser(activeUserEmail),
    getTrendingAnime(),
    getReleaseCalendar(),
    getEntries(activeUserEmail),
    getReviews(activeUserEmail, { scope: "all" }),
    getLibrarySummary(activeUserEmail),
  ]);

  if (!activeUserEmail || currentUser.email !== activeUserEmail) {
    redirect("/auth");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-8 px-4 py-6 md:px-8 md:py-8">
      <SiteNav currentPath="/" currentUser={currentUser} />

      <section className="overflow-hidden rounded-[2.25rem] border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur dark:border-white/10 dark:bg-slate-950/70 md:p-8">
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
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
              Track, queue, and comment without the clutter.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
              Your dashboard keeps progress, release times, queue, and community comments in one
              clean workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/library"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <BookOpenCheck className="h-4 w-4" />
                Open library
              </Link>
              <Link
                href="/calendar"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <PlayCircle className="h-4 w-4" />
                View schedule
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[auto_1fr] xl:grid-cols-1">
            <div className="sm:justify-self-start xl:justify-self-end">
              <ThemeToggle />
            </div>
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <article className="rounded-[1.75rem] border border-sky-200 bg-sky-50/80 p-5 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
                <p className="text-sm font-semibold">Tracked</p>
                <p className="mt-3 text-3xl font-semibold">{summary.total_entries}</p>
              </article>
              <article className="rounded-[1.75rem] border border-orange-200 bg-orange-50/80 p-5 text-orange-800 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                <p className="text-sm font-semibold">Watching</p>
                <p className="mt-3 text-3xl font-semibold">{summary.watching_entries}</p>
              </article>
              <article className="rounded-[1.75rem] border border-fuchsia-200 bg-fuchsia-50/80 p-5 text-fuchsia-800 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/10 dark:text-fuchsia-200">
                <p className="text-sm font-semibold">Comments</p>
                <p className="mt-3 text-3xl font-semibold">{reviews.length}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <CurrentProgress entries={entries} activeUserEmail={activeUserEmail} />
        <ReleaseCalendar items={calendar} />
      </section>

      <DiscoverPanel entries={entries} activeUserEmail={activeUserEmail} />

      <LibraryInsights summary={summary} />

      <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Library
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
              Use the library workspace for cleanup and status edits
            </h2>
          </div>
          <Link
            href="/library"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Open library
          </Link>
        </div>
      </section>

      <AnimeLibrary items={trending} />

      <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <MalImportPanel activeUserEmail={activeUserEmail} />
        <ReviewsPanel
          entries={entries}
          initialReviews={reviews}
          activeUserEmail={activeUserEmail}
        />
      </section>
    </main>
  );
}
