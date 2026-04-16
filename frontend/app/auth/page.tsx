import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CheckCircle2, Sparkles, Users } from "lucide-react";

import { AuthPanel } from "@/components/auth-panel";
import { decodeActiveUserEmail, ACCOUNT_COOKIE_NAME } from "@/lib/account-session";
import { getCurrentUser, getUsers } from "@/lib/api";

export default async function AuthPage() {
  const cookieStore = await cookies();
  const activeUserEmail = decodeActiveUserEmail(cookieStore.get(ACCOUNT_COOKIE_NAME)?.value);

  if (activeUserEmail) {
    const currentUser = await getCurrentUser(activeUserEmail);
    if (currentUser.email === activeUserEmail) {
      redirect("/");
    }
  }

  const users = await getUsers();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-8 px-4 py-6 md:px-8 md:py-8">
      <section className="overflow-hidden rounded-[2.25rem] border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur dark:border-white/10 dark:bg-slate-950/70 md:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
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
                  Account Hub
                </p>
              </div>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-6xl">
              Sign in to your anime space and keep every watchlist scoped to you.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
              Choose an existing profile or create a fresh one. Once you enter, your dashboard,
              release calendar, reviews, and imports stay tied to the active account.
            </p>
          </div>

          <div className="grid gap-4 md:min-w-[320px]">
            <article className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50/85 p-5 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                <Users className="h-4 w-4" />
                Shared workstation friendly
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Quick account switching makes it easy to demo the app or keep separate personal
                tracker profiles on one machine.
              </p>
            </article>
            <article className="rounded-[1.75rem] border border-orange-200/80 bg-orange-50/85 p-5 dark:border-orange-500/20 dark:bg-orange-500/10">
              <div className="flex items-center gap-3 text-sm font-medium text-orange-800 dark:text-orange-200">
                <Sparkles className="h-4 w-4" />
                Next step ready
              </div>
              <p className="mt-3 text-sm leading-7 text-orange-700/90 dark:text-orange-100/90">
                This local auth layer keeps the UX moving now and leaves a clean upgrade path for
                Clerk or NextAuth later.
              </p>
            </article>
            <article className="rounded-[1.75rem] border border-emerald-200/80 bg-emerald-50/85 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <div className="flex items-center gap-3 text-sm font-medium text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                Fully scoped
              </div>
              <p className="mt-3 text-sm leading-7 text-emerald-700/90 dark:text-emerald-100/90">
                Library edits, progress updates, reviews, and MAL imports all follow the active
                account you choose here.
              </p>
            </article>
          </div>
        </div>
      </section>

      <AuthPanel users={users} />
    </main>
  );
}
