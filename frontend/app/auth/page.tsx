import Image from "next/image";

import { AuthPanel } from "@/components/auth-panel";

export default function AuthPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-8 sm:px-6">
      <header className="mb-8 flex items-center gap-3">
        <div className="relative h-11 w-11 overflow-hidden rounded-xl">
          <Image
            src="/anime-tracker-icon.png"
            alt="Anime Tracker logo"
            fill
            className="object-cover"
            sizes="44px"
            priority
          />
        </div>
        <div>
          <p className="font-semibold text-ink">Anime Tracker</p>
          <p className="text-xs text-subtle">Your watchlist, in sync</p>
        </div>
      </header>
      <div className="mb-7 max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Pick up where you left off.</h1>
        <p className="mt-3 text-sm leading-6 text-subtle sm:text-base">Choose a profile or create a new private tracker.</p>
      </div>
      <AuthPanel
        initialUsers={[
          {
            id: 1,
            username: "demo-user",
            email: "demo@anime-tracker.local",
            auth_provider: "demo",
          },
        ]}
      />
    </main>
  );
}
