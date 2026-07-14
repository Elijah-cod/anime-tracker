import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCOUNT_COOKIE_NAME, decodeActiveUserEmail } from "@/lib/account-session";
import { AccountPanel } from "@/components/account-panel";
import { ActivityTimeline } from "@/components/activity-timeline";
import { AppShell } from "@/components/app-shell";
import { LibraryInsights } from "@/components/library-insights";
import { ProfileOverview } from "@/components/profile-overview";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  getCurrentUser,
  getLibrarySummary,
  getUserDashboard,
  getUsers,
} from "@/lib/api";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const activeUserEmail = decodeActiveUserEmail(cookieStore.get(ACCOUNT_COOKIE_NAME)?.value);

  if (!activeUserEmail) {
    redirect("/auth");
  }

  const currentUser = await getCurrentUser(activeUserEmail);
  if (currentUser.email !== activeUserEmail) {
    redirect("/auth");
  }

  const [users, summary, dashboard] = await Promise.all([
    getUsers(activeUserEmail),
    getLibrarySummary(activeUserEmail),
    getUserDashboard(activeUserEmail),
  ]);

  return (
    <AppShell
      currentPath="/profile"
      currentUser={currentUser}
      title="Settings"
      description="Manage your profile, appearance, and account activity."
      actions={<ThemeToggle />}
    >
      <ProfileOverview currentUser={currentUser} dashboard={dashboard} />
      <AccountPanel currentUser={currentUser} users={users} />
      <LibraryInsights summary={summary} compact />
      <ActivityTimeline items={dashboard.recent_activity} />
    </AppShell>
  );
}
