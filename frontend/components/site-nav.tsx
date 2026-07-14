import {
  Bookmark,
  CalendarDays,
  Compass,
  Home,
  Settings,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getPublicUserMeta } from "@/lib/user-privacy";
import { User } from "@/types/anime";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home, mobile: true },
  { href: "/library", label: "My List", icon: Bookmark, mobile: true },
  { href: "/discover", label: "Discover", icon: Compass, mobile: true },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, mobile: false },
  { href: "/community", label: "Community", icon: Users, mobile: true },
  { href: "/profile", label: "Settings", icon: Settings, mobile: true },
];

function isActivePath(currentPath: string, href: string) {
  return href === "/" ? currentPath === href : currentPath.startsWith(href);
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Anime Tracker home">
      <Image
        src="/anime-tracker-icon.png"
        alt=""
        width={42}
        height={42}
        className="h-10 w-10 object-contain"
        priority
      />
      <div className="min-w-0">
        <p className="truncate text-base font-bold tracking-[-0.02em] text-ink">Anime Tracker</p>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">Account Hub</p>
      </div>
    </Link>
  );
}

export function SiteNav({
  currentPath,
  currentUser,
}: {
  currentPath: string;
  currentUser: User;
}) {
  const publicMeta = getPublicUserMeta(currentUser);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] flex-col border-r border-line bg-surface px-5 py-7 lg:flex">
        <Brand />

        <nav className="mt-14 space-y-2" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(currentPath, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-[15px] font-medium transition-colors duration-200 ${
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-subtle hover:bg-muted hover:text-ink"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.3 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-line pt-5">
          <div className="min-w-0 px-1">
            <p className="truncate text-sm font-semibold text-ink">{currentUser.username}</p>
            <p className="mt-0.5 truncate text-xs text-subtle">{publicMeta ?? "Private profile"}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <SignOutButton compact />
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-surface/95 px-5 lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <SignOutButton compact />
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-line bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_color-mix(in_oklch,var(--ink)_8%,transparent)] lg:hidden"
        aria-label="Mobile navigation"
      >
        {NAV_ITEMS.filter((item) => item.mobile).map((item) => {
          const Icon = item.icon;
          const active = isActivePath(currentPath, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[72px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                active ? "text-accent" : "text-subtle"
              }`}
            >
              <Icon className="h-6 w-6" strokeWidth={active ? 2.4 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
