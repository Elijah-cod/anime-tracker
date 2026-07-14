import { CalendarDays } from "lucide-react";

import { UserDashboard, User } from "@/types/anime";

function formatMemberSince(createdAt?: string | null) {
  if (!createdAt) return "New member";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "New member";
  return `Member since ${date.toLocaleDateString(undefined, { month: "short", year: "numeric" })}`;
}

export function ProfileOverview({
  currentUser,
  dashboard,
}: {
  currentUser: User;
  dashboard: UserDashboard;
}) {
  const stats = [
    ["Tracked", dashboard.stats.tracked_entries],
    ["Watching", dashboard.stats.watching_entries],
    ["Completed", dashboard.stats.completed_entries],
    ["Episodes", dashboard.stats.total_episodes_watched],
    ["Comments", dashboard.stats.reviews_written],
    ["Avg. score", dashboard.stats.average_score?.toFixed(2) ?? "N/A"],
  ];

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-border bg-surface shadow-card">
      <div className="flex flex-col gap-5 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-accent text-2xl font-bold uppercase text-white">
            {currentUser.username.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold text-ink">{currentUser.username}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-subtle">
              <CalendarDays className="h-4 w-4" />
              {formatMemberSince(currentUser.created_at)}
            </p>
          </div>
        </div>
        <span className="w-fit rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold capitalize text-accent">
          {currentUser.auth_provider} profile
        </span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
        {stats.map(([label, value]) => (
          <div key={label} className="px-4 py-5 text-center">
            <p className="text-2xl font-semibold text-ink">{value}</p>
            <p className="mt-1 text-xs font-medium text-subtle">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
