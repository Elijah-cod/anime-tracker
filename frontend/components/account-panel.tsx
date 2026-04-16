"use client";

import { LoaderCircle, ShieldCheck, UserPlus } from "lucide-react";
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
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Account Scope
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            Switch or create profiles
          </h2>
        </div>
        <div className="rounded-full border border-emerald-300/70 bg-emerald-100/70 p-3 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/80">
        <p className="text-sm text-slate-600 dark:text-slate-300">Active account</p>
        <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">
          {currentUser.username}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {getPublicUserMeta(currentUser) ?? getPrivateUserHint(currentUser)}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {users.map((user) => {
          const isActive = user.email === currentUser.email;
          const publicMeta = getPublicUserMeta(user);
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => switchAccount(user.email)}
              className={`flex w-full items-center justify-between rounded-3xl border px-4 py-4 text-left transition ${
                isActive
                  ? "border-sky-300 bg-sky-50/80 dark:border-sky-500/30 dark:bg-sky-500/10"
                  : "border-slate-200 bg-slate-50/80 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-800"
              }`}
            >
              <div>
                <p className="font-semibold text-slate-950 dark:text-slate-50">{user.username}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {publicMeta ?? getPrivateUserHint(user)}
                </p>
              </div>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-slate-950">
                {isActive ? "Active" : user.auth_provider}
              </span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleCreate} className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <UserPlus className="h-4 w-4" />
          Create local account
        </div>
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
          Create and switch
        </button>
      </form>

      {message ? (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{message}</p>
      ) : null}
    </section>
  );
}
