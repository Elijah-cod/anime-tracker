"use client";

import { ArrowRight, LoaderCircle, ShieldCheck, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { setActiveUserEmail } from "@/lib/account-session";
import { createUserAccount } from "@/lib/api";
import { User } from "@/types/anime";

export function AuthPanel({ users }: { users: User[] }) {
  const router = useRouter();
  const [formState, setFormState] = useState({ username: "", email: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function continueAs(email: string) {
    startTransition(() => {
      setActiveUserEmail(email);
      router.push("/");
      router.refresh();
    });
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!formState.username.trim() || !formState.email.trim()) {
      setMessage("Username and email are required.");
      return;
    }

    startTransition(async () => {
      try {
        const user = await createUserAccount({
          username: formState.username.trim(),
          email: formState.email.trim(),
        });
        setActiveUserEmail(user.email);
        setFormState({ username: "", email: "" });
        router.push("/");
        router.refresh();
      } catch {
        setMessage("Could not create that account right now.");
      }
    });
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-card backdrop-blur dark:border-white/10 dark:bg-slate-950/75 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Sign In
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              Pick an existing tracker profile
            </h2>
          </div>
          <div className="rounded-full border border-emerald-300/70 bg-emerald-100/70 p-3 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => continueAs(user.email)}
              disabled={isPending}
              className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-left transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-800"
            >
              <div>
                <p className="font-semibold text-slate-950 dark:text-slate-50">{user.username}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-slate-950">
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 md:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          <UserPlus className="h-4 w-4" />
          Create Account
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
          Start a fresh anime profile
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          This local auth flow is lightweight on purpose so we can keep building without waiting on
          Clerk or NextAuth. Your selected account becomes the active scope for the whole app.
        </p>

        <form
          onSubmit={handleCreate}
          className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/80"
        >
          <input
            value={formState.username}
            onChange={(event) =>
              setFormState((current) => ({ ...current, username: event.target.value }))
            }
            placeholder="username"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-500"
          />
          <input
            value={formState.email}
            onChange={(event) =>
              setFormState((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="email@example.com"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-500"
          />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Create and enter dashboard
          </button>
        </form>

        {message ? (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        ) : null}
      </div>
    </section>
  );
}
