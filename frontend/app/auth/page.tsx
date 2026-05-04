import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AuthPanel } from "@/components/auth-panel";
import { decodeActiveUserEmail, ACCOUNT_COOKIE_NAME } from "@/lib/account-session";
import { getCurrentUser } from "@/lib/api";

export default async function AuthPage() {
  const cookieStore = await cookies();
  const activeUserEmail = decodeActiveUserEmail(cookieStore.get(ACCOUNT_COOKIE_NAME)?.value);

  if (activeUserEmail) {
    const currentUser = await getCurrentUser(activeUserEmail);
    if (currentUser.email === activeUserEmail) {
      redirect("/");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-8 px-4 py-6 md:px-8 md:py-8">
      <section className="overflow-hidden rounded-[2.25rem] border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur dark:border-white/10 dark:bg-slate-950/70 md:p-8">
        <div className="flex flex-col gap-6">
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
              Pick a profile and jump back in.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
              Existing accounts stay scoped to their own watchlists, progress, and comments.
            </p>
          </div>
        </div>
      </section>

      <AuthPanel />
    </main>
  );
}
