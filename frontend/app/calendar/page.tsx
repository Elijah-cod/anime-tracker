import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCOUNT_COOKIE_NAME, decodeActiveUserEmail } from "@/lib/account-session";
import { AppShell } from "@/components/app-shell";
import { CurrentProgress } from "@/components/current-progress";
import { ReleaseCalendar } from "@/components/release-calendar";
import { getCurrentUser, getEntries, getReleaseCalendar } from "@/lib/api";

export default async function CalendarPage() {
  const cookieStore = await cookies();
  const activeUserEmail = decodeActiveUserEmail(cookieStore.get(ACCOUNT_COOKIE_NAME)?.value);

  if (!activeUserEmail) {
    redirect("/auth");
  }

  const [currentUser, entries, calendar] = await Promise.all([
    getCurrentUser(activeUserEmail),
    getEntries(activeUserEmail),
    getReleaseCalendar(),
  ]);

  if (currentUser.email !== activeUserEmail) {
    redirect("/auth");
  }

  return (
    <AppShell
      currentPath="/calendar"
      currentUser={currentUser}
      title="Release Calendar"
      description="Upcoming episodes shown in your local time."
    >
      <ReleaseCalendar items={calendar} />
      <CurrentProgress entries={entries} activeUserEmail={activeUserEmail} compact />
    </AppShell>
  );
}
