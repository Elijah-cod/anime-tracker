import { BarChart3, CheckCircle2, Clock3, PlayCircle, Star } from "lucide-react";

import { SafeImage } from "@/components/safe-image";
import { LibrarySummary } from "@/types/anime";

const metricCards = [
  {
    key: "total_entries",
    label: "Tracked titles",
    icon: BarChart3,
    tone:
      "border-sky-200 bg-sky-50/80 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200",
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
      "border-fuchsia-200 bg-fuchsia-50/80 text-fuchsia-800 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/10 dark:text-fuchsia-200",
  },
] as const;

function prettyStatus(status: string) {
  return status.toLowerCase().replace("_", " ");
}

export function LibraryInsights({ summary }: { summary: LibrarySummary }) {
  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Library Insights
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            Watch queue and tracker snapshot
          </h2>
        </div>
        <p className="max-w-sm text-sm text-slate-600 dark:text-slate-300">
          A quick read on how much you are tracking, what is completed, and what is next in the
          queue.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {metricCards.map((card) => {
          const Icon = card.icon;
          const value =
            card.key === "average_score"
              ? summary.average_score?.toFixed(2) ?? "N/A"
              : summary[card.key];

          return (
            <article
              key={card.key}
              className={`rounded-[1.75rem] border p-4 ${card.tone}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{card.label}</span>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-3xl font-semibold">{value}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <CheckCircle2 className="h-4 w-4" />
            Status breakdown
          </div>
          <div className="mt-4 space-y-3">
            {summary.status_breakdown.map((item) => (
              <div key={item.status} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span className="capitalize">{prettyStatus(item.status)}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-300"
                    style={{
                      width: `${summary.total_entries ? (item.count / summary.total_entries) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl bg-white px-3 py-3 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <p className="font-semibold">{summary.watching_entries}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Watching
              </p>
            </div>
            <div className="rounded-2xl bg-white px-3 py-3 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <p className="font-semibold">{summary.planning_entries}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Planning
              </p>
            </div>
            <div className="rounded-2xl bg-white px-3 py-3 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <p className="font-semibold">{summary.completed_entries}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Completed
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Clock3 className="h-4 w-4" />
            Up next
          </div>
          <div className="mt-4 space-y-4">
            {summary.watch_queue.map((entry) => (
              <article
                key={entry.anime_id}
                className="grid gap-4 rounded-3xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/80 md:grid-cols-[72px_1fr_auto]"
              >
                <div className="relative h-[88px] overflow-hidden rounded-2xl">
                  <SafeImage src={entry.cover_image} alt={entry.title} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-950 dark:text-slate-50">{entry.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {entry.episodes_watched} / {entry.total_episodes ?? "?"} episodes logged
                  </p>
                </div>
                <div className="self-center rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white dark:bg-sky-500 dark:text-slate-950">
                  {prettyStatus(entry.status)}
                </div>
              </article>
            ))}
          </div>

          {!summary.watch_queue.length ? (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Add a few planning or watching titles to build your queue.
            </p>
          ) : null}
        </article>
      </div>
    </section>
  );
}
