import { ReactNode } from "react";

import { SiteNav } from "@/components/site-nav";
import { User } from "@/types/anime";

export function AppShell({
  currentPath,
  currentUser,
  title,
  description,
  actions,
  children,
}: {
  currentPath: string;
  currentUser: User;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteNav currentPath={currentPath} currentUser={currentUser} />
      <main className="min-w-0 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:ml-[244px] lg:pb-0">
        <div className="mx-auto w-full max-w-[1280px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-[2rem] font-bold tracking-[-0.035em] text-ink sm:text-4xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-subtle sm:text-base">
                  {description}
                </p>
              ) : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </header>
          <div className="space-y-10">{children}</div>
        </div>
      </main>
    </div>
  );
}
