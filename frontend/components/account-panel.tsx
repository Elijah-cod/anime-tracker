"use client";

import { Check, ChevronRight, LoaderCircle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { setActiveUserEmail } from "@/lib/account-session";
import { createUserAccount } from "@/lib/api";
import { getPrivateUserHint, getPublicUserMeta } from "@/lib/user-privacy";
import { User } from "@/types/anime";

export function AccountPanel({
  currentUser,
  users,
}: {
  currentUser: User;
  users: User[];
}) {
  const router = useRouter();
  const [formState, setFormState] = useState({ username: "", email: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reloadProfile(email: string) {
    setActiveUserEmail(email);

    if (typeof window !== "undefined") {
      window.location.assign("/profile");
      return;
    }

    router.replace("/profile");
    router.refresh();
  }

  function switchAccount(email: string) {
    reloadProfile(email);
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
        reloadProfile(user.email);
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
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-[1.5rem] border border-border bg-surface p-5 shadow-card sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">Profiles</p>
        <h2 className="mt-1 text-xl font-semibold text-ink">Switch account</h2>
        <div className="mt-5 divide-y divide-border">
          {users.map((user) => {
            const isActive = user.email === currentUser.email;
            const publicMeta = getPublicUserMeta(user);
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => switchAccount(user.email)}
                className="flex min-h-[68px] w-full items-center gap-3 py-3 text-left transition hover:text-accent"
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold uppercase ${isActive ? "bg-accent text-white" : "bg-canvas text-subtle"}`}>
                  {user.username.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink">{user.username}</span>
                  <span className="mt-0.5 block text-sm text-subtle">
                    {publicMeta ?? getPrivateUserHint(user)}
                  </span>
                </span>
                {isActive ? <Check className="h-5 w-5 text-accent" /> : <ChevronRight className="h-5 w-5 text-subtle" />}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleCreate} className="rounded-[1.5rem] border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
          <UserPlus className="h-4 w-4" />
          New profile
        </div>
        <h2 className="mt-1 text-xl font-semibold text-ink">Create an account</h2>
        <div className="mt-5 space-y-3">
        <input
          value={formState.username}
          onChange={(event) =>
            setFormState((current) => ({ ...current, username: event.target.value }))
          }
          placeholder="username"
          aria-label="Username"
          className="min-h-11 w-full rounded-xl border border-border bg-canvas px-4 text-sm text-ink outline-none transition focus:border-accent"
        />
        <input
          value={formState.email}
          onChange={(event) =>
            setFormState((current) => ({ ...current, email: event.target.value }))
          }
          placeholder="email@example.com"
          type="email"
          aria-label="Email"
          className="min-h-11 w-full rounded-xl border border-border bg-canvas px-4 text-sm text-ink outline-none transition focus:border-accent"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Create and switch
        </button>
        </div>
        {message ? <p className="mt-4 text-sm text-subtle">{message}</p> : null}
        <p className="mt-5 text-xs leading-5 text-subtle">Email addresses stay private and are only used to keep each profile&apos;s library separate.</p>
      </form>
    </section>
  );
}
