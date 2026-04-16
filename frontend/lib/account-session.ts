export const ACCOUNT_COOKIE_NAME = "anime_tracker_user_email";

export function setActiveUserEmail(email: string) {
  document.cookie = `${ACCOUNT_COOKIE_NAME}=${encodeURIComponent(email.trim().toLowerCase())}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function clearActiveUserEmail() {
  document.cookie = `${ACCOUNT_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

export function decodeActiveUserEmail(value?: string) {
  if (!value) {
    return undefined;
  }

  try {
    return decodeURIComponent(value).trim().toLowerCase();
  } catch {
    return value.trim().toLowerCase();
  }
}
