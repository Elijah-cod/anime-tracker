import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCOUNT_COOKIE_NAME, decodeActiveUserEmail } from "@/lib/account-session";
import { AppShell } from "@/components/app-shell";
import { LibraryInsights } from "@/components/library-insights";
import { LibraryManager } from "@/components/library-manager";
import { MalImportPanel } from "@/components/mal-import-panel";
import { getCurrentUser, getEntries, getLibrarySummary } from "@/lib/api";

export default async function LibraryPage() {
  const cookieStore = await cookies();
  const activeUserEmail = decodeActiveUserEmail(cookieStore.get(ACCOUNT_COOKIE_NAME)?.value);

  if (!activeUserEmail) {
    redirect("/auth");
  }

  const currentUser = await getCurrentUser(activeUserEmail);
  if (currentUser.email !== activeUserEmail) {
    redirect("/auth");
  }

  const [entries, summary] = await Promise.all([
    getEntries(activeUserEmail),
    getLibrarySummary(activeUserEmail),
  ]);

  return (
    <AppShell
      currentPath="/library"
      currentUser={currentUser}
      title="My List"
      description="Filter, score, and update every tracked title."
    >
      <LibraryInsights summary={summary} compact />
      <LibraryManager entries={entries} activeUserEmail={activeUserEmail} />
      <MalImportPanel activeUserEmail={activeUserEmail} />
    </AppShell>
  );
}
