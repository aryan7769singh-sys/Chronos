import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

/**
 * Route protection middleware using Auth.js (NextAuth v5).
 *
 * Protects:
 * - App routes: /dashboard, /projects, /tasks, /calendar, /habits, /focus, /analytics, /notes, /settings
 * - API routes: /api/* (excluding /api/auth/*)
 *
 * Redirects:
 * - Unauthenticated requests → /login?callbackUrl=...
 * - Authenticated requests visiting /login → /dashboard
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Allow Auth.js endpoints and static assets
  const isAuthRoute = pathname.startsWith("/api/auth");
  const isLoginPage = pathname === "/login";

  if (isAuthRoute) {
    return NextResponse.next();
  }

  // If already logged in and visiting /login, redirect to /dashboard
  if (isLoginPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protect all application and API routes
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (*.svg, *.png, *.jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
