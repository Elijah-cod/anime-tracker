import { CalendarClock, CheckCircle2, PlayCircle, Star, UserCircle2 } from "lucide-react";

import { UserDashboard, User } from "@/types/anime";

function formatMemberSince(createdAt?: string | null) {
  if (!createdAt) {
    return "Just joined";
  }

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "Just joined";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statCards = [
  {
    key: "tracked_entries",
    label: "Tracked titles",
    icon: UserCircle2,
    tone:
      "border-sky-200 bg-sky-50/80 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200",
  },
  {
    key: "reviews_written",
    label: "Reviews written",
    icon: CheckCircle2,
    tone:
      "border-fuchsia-200 bg-fuchsia-50/80 text-fuchsia-800 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/10 dark:text-fuchsia-200",
  },
  {
    key: "total_episodes_watched",
    label: "Episodes watched",
    icon: PlayCircle,
    tone:
      "border-orange-200 bg-orange-50/80 text-orange-800 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200",
  },
  {
    key: "average_score",
    label: "Average score",
    icon: Star,
    tone:
      "border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
] as const;

export function ProfileOverview({
  currentUser,
  dashboard,
}: {
  currentUser: User;
  dashboard: UserDashboard;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Account Overview
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            {currentUser.username}&apos;s tracking pulse
          </h2>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <span className="font-semibold text-slate-950 dark:text-slate-50">
            {currentUser.auth_provider}
          </span>
          <span className="mx-2 text-slate-400">•</span>
          <span>Member since {formatMemberSince(currentUser.created_at)}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const rawValue = dashboard.stats[card.key];
          const value =
            card.key === "average_score"
              ? dashboard.stats.average_score?.toFixed(2) ?? "N/A"
              : rawValue;

          return (
            <article key={card.key} className={`rounded-[1.75rem] border p-4 ${card.tone}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{card.label}</span>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-3xl font-semibold">{value}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <CalendarClock className="h-4 w-4" />
            Account age
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">
            {dashboard.stats.account_age_days}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">days active</p>
        </article>
        <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Watching now</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">
            {dashboard.stats.watching_entries}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            active titles in progress
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Completed</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">
            {dashboard.stats.completed_entries}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            finished series in your tracker
          </p>
        </article>
      </div>
    </section>
  );
}
