"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { clearActiveUserEmail } from "@/lib/account-session";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(() => {
      clearActiveUserEmail();
      router.push("/auth");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      aria-label="Sign out"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface text-sm font-semibold text-subtle transition-colors hover:bg-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-60 ${compact ? "w-11 px-0" : "px-4"}`}
    >
      <LogOut className="h-4 w-4" />
      {!compact ? <span>Sign out</span> : null}
    </button>
  );
}
