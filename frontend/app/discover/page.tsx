import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCOUNT_COOKIE_NAME, decodeActiveUserEmail } from "@/lib/account-session";
import { AnimeLibrary } from "@/components/anime-library";
import { AppShell } from "@/components/app-shell";
import { DiscoverPanel } from "@/components/discover-panel";
import { getCurrentUser, getEntries, getTrendingAnime } from "@/lib/api";

export default async function DiscoverPage() {
  const cookieStore = await cookies();
  const activeUserEmail = decodeActiveUserEmail(cookieStore.get(ACCOUNT_COOKIE_NAME)?.value);

  if (!activeUserEmail) {
    redirect("/auth");
  }

  const [currentUser, entries, trending] = await Promise.all([
    getCurrentUser(activeUserEmail),
    getEntries(activeUserEmail),
    getTrendingAnime(),
  ]);

  if (currentUser.email !== activeUserEmail) {
    redirect("/auth");
  }

  return (
    <AppShell
      currentPath="/discover"
      currentUser={currentUser}
      title="Discover"
      description="Search AniList and add a title directly to your list."
    >
      <DiscoverPanel entries={entries} activeUserEmail={activeUserEmail} />
      <AnimeLibrary items={trending} />
    </AppShell>
  );
}
