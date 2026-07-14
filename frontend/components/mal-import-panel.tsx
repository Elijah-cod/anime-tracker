"use client";

import { LoaderCircle, Upload } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";

import { importMalList } from "@/lib/api";
import { ImportResponse } from "@/types/anime";

export function MalImportPanel({ activeUserEmail }: { activeUserEmail?: string }) {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Enter a MyAnimeList username to import a library.");
      return;
    }

    startTransition(async () => {
      try {
        const imported = await importMalList(username.trim(), activeUserEmail);
        setResult(imported);
      } catch {
        setError("Import failed. Try again in a moment.");
      }
    });
  }

  return (
    <section className="rounded-[1.5rem] border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">Import</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">MyAnimeList</h2>
        </div>
        <Upload className="h-5 w-5 text-subtle" />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 md:flex-row">
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="myanimelist_username"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-canvas px-4 text-sm text-ink outline-none transition focus:border-accent"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Import list
        </button>
      </form>

      {error ? (
        <p className="mt-4 text-sm text-rose-600">{error}</p>
      ) : null}

      {result ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            Imported {result.imported_count} entries from MAL.
          </div>
          <div className="space-y-3">
            {result.items.slice(0, 5).map((item) => (
              <article
                key={`${item.anime_id}-${item.status}`}
                className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm last:border-0"
              >
                <div>
                  <p className="font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-subtle">
                    {item.episodes_watched} episodes watched
                  </p>
                </div>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  {item.status}
                </span>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
