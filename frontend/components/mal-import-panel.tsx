"use client";

import { LoaderCircle, UploadCloud } from "lucide-react";
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
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            MAL Import
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            Bring your list across
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Paste a MyAnimeList username and let the backend pull entries through Jikan for a bulk
            import flow.
          </p>
        </div>
        <div className="rounded-full border border-sky-300/70 bg-sky-100/70 p-3 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
          <UploadCloud className="h-5 w-5" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 md:flex-row">
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="myanimelist_username"
          className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-slate-600"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Import list
        </button>
      </form>

      {error ? (
        <p className="mt-4 text-sm text-rose-600 dark:text-rose-300">{error}</p>
      ) : null}

      {result ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            Imported {result.imported_count} entries from MAL.
          </div>
          <div className="space-y-3">
            {result.items.slice(0, 5).map((item) => (
              <article
                key={`${item.anime_id}-${item.status}`}
                className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
              >
                <div>
                  <p className="font-semibold text-slate-950 dark:text-slate-50">{item.title}</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {item.episodes_watched} episodes watched
                  </p>
                </div>
                <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-950">
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
