import Image from "next/image";
import Link from "next/link";

import { SignOutButton } from "@/components/sign-out-button";
import { User } from "@/types/anime";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/library", label: "Library" },
  { href: "/calendar", label: "Calendar" },
  { href: "/profile", label: "Profile" },
];

export function SiteNav({
  currentPath,
  currentUser,
}: {
  currentPath: string;
  currentUser: User;
}) {
  return (
    <header className="rounded-[2rem] border border-white/60 bg-white/70 px-4 py-4 shadow-card backdrop-blur dark:border-white/10 dark:bg-slate-950/70 sm:px-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex w-fit items-center gap-3 rounded-full bg-slate-950 px-3 py-2 text-white dark:bg-sky-500 dark:text-slate-950">
            <div className="relative h-9 w-9 overflow-hidden rounded-2xl bg-white/10">
              <Image
                src="/anime-tracker-logo.png"
                alt="Anime Tracker logo"
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">Anime Tracker</p>
              <p className="hidden text-[10px] uppercase tracking-[0.18em] text-white/70 dark:text-slate-950/70 sm:block">
                Agile Stream
              </p>
            </div>
          </div>
          <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {NAV_ITEMS.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-start xl:justify-end">
          <div className="min-w-0 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <span className="font-semibold text-slate-950 dark:text-slate-50">{currentUser.username}</span>
            <span className="mx-2 hidden text-slate-400 sm:inline">•</span>
            <span className="hidden sm:inline">{currentUser.email}</span>
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
