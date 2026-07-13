import { NextRequest, NextResponse } from "next/server";

const ACCOUNT_COOKIE_NAME = "anime_tracker_user_email";
const PROTECTED_PATHS = ["/", "/library", "/calendar", "/profile"];

function hasAccountCookie(request: NextRequest): boolean {
  const value = request.cookies.get(ACCOUNT_COOKIE_NAME)?.value;
  return Boolean(value?.trim());
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = hasAccountCookie(request);

  if (PROTECTED_PATHS.includes(pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/library", "/calendar", "/profile"],
};
