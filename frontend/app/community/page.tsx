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

  const currentUser = await getCurrentUser(activeUserEmail);
  if (currentUser.email !== activeUserEmail) {
    redirect("/auth");
  }

  const [entries, reviews] = await Promise.all([
    getEntries(activeUserEmail),
    getReviews(activeUserEmail, { scope: "all" }),
  ]);

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
