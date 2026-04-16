import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCOUNT_COOKIE_NAME, decodeActiveUserEmail } from "@/lib/account-session";
import { AccountPanel } from "@/components/account-panel";
import { LibraryInsights } from "@/components/library-insights";
import { ReviewsPanel } from "@/components/reviews-panel";
import { SiteNav } from "@/components/site-nav";
import { getCurrentUser, getEntries, getLibrarySummary, getReviews, getUsers } from "@/lib/api";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const activeUserEmail = decodeActiveUserEmail(cookieStore.get(ACCOUNT_COOKIE_NAME)?.value);

  const [currentUser, users, entries, reviews, summary] = await Promise.all([
    getCurrentUser(activeUserEmail),
    getUsers(activeUserEmail),
    getEntries(activeUserEmail),
    getReviews(activeUserEmail),
    getLibrarySummary(activeUserEmail),
  ]);

  if (!activeUserEmail || currentUser.email !== activeUserEmail) {
    redirect("/auth");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-8 px-4 py-6 md:px-8 md:py-8">
      <SiteNav currentPath="/profile" currentUser={currentUser} />

      <section className="rounded-[2.25rem] border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur dark:border-white/10 dark:bg-slate-950/70 md:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          Profile
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-5xl">
          Manage accounts and review your tracking identity.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Switch between scoped accounts, create a new local profile, and see the stats and reviews
          tied to the active user.
        </p>
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <AccountPanel currentUser={currentUser} users={users} />
        <LibraryInsights summary={summary} />
      </section>

      <ReviewsPanel entries={entries} initialReviews={reviews} activeUserEmail={activeUserEmail} />
    </main>
  );
}
