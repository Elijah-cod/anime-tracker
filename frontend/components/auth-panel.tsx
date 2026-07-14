"use client";

import { ArrowRight, LoaderCircle, UserPlus } from "lucide-react";
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

    void loadUsers();

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
    <section className="grid overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-card lg:grid-cols-[1.05fr_0.95fr]">
      <div className="p-5 sm:p-8 lg:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">Choose profile</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Welcome back</h2>

        <div className="mt-6 divide-y divide-border">
          {usersLoading ? (
            <div className="py-4 text-sm text-subtle">
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
                className="group flex min-h-[72px] w-full items-center gap-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent/10 font-bold uppercase text-accent">
                  {user.username.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink group-hover:text-accent">{user.username}</p>
                  {publicMeta ? (
                    <p className="mt-1 truncate text-sm text-subtle">{publicMeta}</p>
                  ) : (
                    <p className="mt-1 text-sm text-subtle">{getPrivateUserHint(user)}</p>
                  )}
                </div>
                <ArrowRight className="h-5 w-5 text-subtle transition group-hover:translate-x-1 group-hover:text-accent" />
              </button>
            );
          })}

          {!usersLoading && !users.length ? (
            <div className="rounded-xl border border-dashed border-border bg-canvas px-4 py-5 text-sm text-subtle">
              No profiles yet. Create the first account to get started.
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border bg-canvas p-5 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
          <UserPlus className="h-4 w-4" />
          New profile
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Start fresh
        </h2>

        <form onSubmit={handleCreate} className="mt-6 space-y-3">
          <input
            value={formState.username}
            onChange={(event) =>
              setFormState((current) => ({ ...current, username: event.target.value }))
            }
            placeholder="username"
            aria-label="Username"
            className="min-h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition focus:border-accent"
          />
          <input
            value={formState.email}
            onChange={(event) =>
              setFormState((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="email@example.com"
            type="email"
            aria-label="Email"
            className="min-h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition focus:border-accent"
          />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Create profile
          </button>
        </form>

        {message ? (
          <p className="mt-4 text-sm text-rose-600">{message}</p>
        ) : null}
        <p className="mt-5 text-xs leading-5 text-subtle">Your email is private. Other profiles only see your username.</p>
      </div>
    </section>
  );
}
