import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCOUNT_COOKIE_NAME, decodeActiveUserEmail } from "@/lib/account-session";
import { CurrentProgress } from "@/components/current-progress";
import { LibraryInsights } from "@/components/library-insights";
import { ReleaseCalendar } from "@/components/release-calendar";
import { SiteNav } from "@/components/site-nav";
import { getCurrentUser, getEntries, getLibrarySummary, getReleaseCalendar } from "@/lib/api";

export default async function CalendarPage() {
  const cookieStore = await cookies();
  const activeUserEmail = decodeActiveUserEmail(cookieStore.get(ACCOUNT_COOKIE_NAME)?.value);

  const [currentUser, entries, summary, calendar] = await Promise.all([
    getCurrentUser(activeUserEmail),
    getEntries(activeUserEmail),
    getLibrarySummary(activeUserEmail),
    getReleaseCalendar(),
  ]);

  if (!activeUserEmail || currentUser.email !== activeUserEmail) {
    redirect("/auth");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-8 px-4 py-6 md:px-8 md:py-8">
      <SiteNav currentPath="/calendar" currentUser={currentUser} />

      <section className="rounded-[2.25rem] border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur dark:border-white/10 dark:bg-slate-950/70 md:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          Calendar
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-5xl">
          Upcoming releases at a glance.
        </h1>
      </section>

      <LibraryInsights summary={summary} />

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <ReleaseCalendar items={calendar} />
        <CurrentProgress entries={entries} activeUserEmail={activeUserEmail} />
      </section>
    </main>
  );
}
