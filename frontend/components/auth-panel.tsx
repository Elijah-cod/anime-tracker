"use client";

import { ArrowRight, LoaderCircle, ShieldCheck, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";

import { setActiveUserEmail } from "@/lib/account-session";
import { createUserAccount, getUsers } from "@/lib/api";
import { getPrivateUserHint, getPublicUserMeta } from "@/lib/user-privacy";
import { User } from "@/types/anime";

export function AuthPanel({ initialUsers = [] }: { initialUsers?: User[] }) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [usersLoading, setUsersLoading] = useState(initialUsers.length === 0);
  const [formState, setFormState] = useState({ username: "", email: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        const nextUsers = await getUsers();
        if (isMounted) {
          setUsers(nextUsers);
        }
      } finally {
        if (isMounted) {
          setUsersLoading(false);
        }
      }
    }

    if (!initialUsers.length) {
      void loadUsers();
    } else {
      setUsersLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [initialUsers]);

  function enterDashboard(email: string) {
    setActiveUserEmail(email);

    if (typeof window !== "undefined") {
      window.location.assign("/");
      return;
    }

    router.replace("/");
    router.refresh();
  }

  function continueAs(email: string) {
    startTransition(() => {
      enterDashboard(email);
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
        setFormState({ username: "", email: "" });
        enterDashboard(user.email);
      } catch (createError) {
        setMessage(
          createError instanceof Error
            ? createError.message
            : "Could not create that account right now.",
        );
      }
    });
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
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
          {usersLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
              Loading profiles...
            </div>
          ) : null}

          {users.map((user) => {
            const publicMeta = getPublicUserMeta(user);

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => continueAs(user.email)}
                disabled={isPending}
                className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-left transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-800"
              >
                <div>
                  <p className="font-semibold text-slate-950 dark:text-slate-50">{user.username}</p>
                  {publicMeta ? (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{publicMeta}</p>
                  ) : (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {getPrivateUserHint(user)}
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-slate-950">
                  Continue
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}

          {!usersLoading && !users.length ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400">
              No profiles yet. Create the first account to get started.
            </div>
          ) : null}
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
