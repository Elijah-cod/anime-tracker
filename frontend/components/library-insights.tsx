import { BarChart3, CheckCircle2, PlayCircle, Star } from "lucide-react";

import { LibrarySummary } from "@/types/anime";

const metrics = [
  { key: "total_entries", label: "Titles", icon: BarChart3 },
  { key: "total_episodes_watched", label: "Episodes", icon: PlayCircle },
  { key: "average_score", label: "Avg. score", icon: Star },
] as const;

function prettyStatus(status: string) {
  return status.toLowerCase().replaceAll("_", " ");
}

export function LibraryInsights({
  summary,
  compact = false,
}: {
  summary: LibrarySummary;
  compact?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="grid grid-cols-3 divide-x divide-line">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const value = metric.key === "average_score"
            ? summary.average_score?.toFixed(1) ?? "N/A"
            : summary[metric.key];
          return (
            <div key={metric.key} className="min-w-0 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-subtle">
                <Icon className="hidden h-4 w-4 sm:block" />
                <span className="truncate text-xs font-medium sm:text-sm">{metric.label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">{value}</p>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-subtle">
          <CheckCircle2 className="h-4 w-4 text-accent" /> Status
        </div>
        {summary.status_breakdown.map((item) => (
          <div key={item.status} className="flex items-center gap-2 text-xs text-subtle">
            <span className="capitalize">{prettyStatus(item.status)}</span>
            <span className="font-bold text-ink">{item.count}</span>
          </div>
        ))}
        {!compact ? (
          <span className="ml-auto text-xs text-subtle">{summary.watch_queue.length} queued next</span>
        ) : null}
      </div>
    </section>
  );
}
