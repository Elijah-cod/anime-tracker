import { User } from "@/types/anime";

export const DEMO_USER_EMAIL = "demo@anime-tracker.local";

export function isDemoUser(user: Pick<User, "email"> | string): boolean {
  const email = typeof user === "string" ? user : user.email;
  return email.trim().toLowerCase() === DEMO_USER_EMAIL;
}

export function getPublicUserMeta(user: User): string | null {
  if (isDemoUser(user)) {
    return user.email;
  }

  return null;
}

export function getPrivateUserHint(user: User): string {
  if (isDemoUser(user)) {
    return "Guide account";
  }

  return "Private profile";
}
