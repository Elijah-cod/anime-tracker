import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ACCOUNT_COOKIE_NAME, decodeActiveUserEmail } from "@/lib/account-session";
import { AnimeLibrary } from "@/components/anime-library";
import { AppShell } from "@/components/app-shell";
import { CurrentProgress } from "@/components/current-progress";
import { LibraryInsights } from "@/components/library-insights";
import { ReleaseCalendar } from "@/components/release-calendar";
import {
  getCurrentUser,
  getEntries,
  getLibrarySummary,
  getReleaseCalendar,
  getTrendingAnime,
} from "@/lib/api";

export default async function HomePage() {
  const cookieStore = await cookies();
  const activeUserEmail = decodeActiveUserEmail(cookieStore.get(ACCOUNT_COOKIE_NAME)?.value);

  if (!activeUserEmail) {
    redirect("/auth");
  }

  const currentUser = await getCurrentUser(activeUserEmail);
  if (currentUser.email !== activeUserEmail) {
    redirect("/auth");
  }

  const [trending, calendar, entries, summary] = await Promise.all([
    getTrendingAnime(),
    getReleaseCalendar(),
    getEntries(activeUserEmail),
    getLibrarySummary(activeUserEmail),
  ]);

  return (
    <AppShell
      currentPath="/"
      currentUser={currentUser}
      title={`Welcome back, ${currentUser.username}`}
      description="Pick up where you left off or find your next show."
      actions={
        <Link
          href="/calendar"
          className="inline-flex min-h-11 items-center rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:bg-muted"
        >
          Release calendar
        </Link>
      }
    >
      <CurrentProgress entries={entries} activeUserEmail={activeUserEmail} />
      <AnimeLibrary items={trending} />
      <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <LibraryInsights summary={summary} compact />
        <ReleaseCalendar items={calendar.slice(0, 4)} />
      </div>
    </AppShell>
  );
}
