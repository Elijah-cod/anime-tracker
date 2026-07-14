import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCOUNT_COOKIE_NAME, decodeActiveUserEmail } from "@/lib/account-session";
import { AppShell } from "@/components/app-shell";
import { ReviewsPanel } from "@/components/reviews-panel";
import { getCurrentUser, getEntries, getReviews } from "@/lib/api";

export default async function CommunityPage() {
  const cookieStore = await cookies();
  const activeUserEmail = decodeActiveUserEmail(cookieStore.get(ACCOUNT_COOKIE_NAME)?.value);

  if (!activeUserEmail) {
    redirect("/auth");
  }

  const [currentUser, entries, reviews] = await Promise.all([
    getCurrentUser(activeUserEmail),
    getEntries(activeUserEmail),
    getReviews(activeUserEmail, { scope: "all" }),
  ]);

  if (currentUser.email !== activeUserEmail) {
    redirect("/auth");
  }

  return (
    <AppShell
      currentPath="/community"
      currentUser={currentUser}
      title="Community"
      description="Share quick thoughts and browse comments from other profiles."
    >
      <ReviewsPanel
        entries={entries}
        initialReviews={reviews}
        activeUserEmail={activeUserEmail}
      />
    </AppShell>
  );
}
