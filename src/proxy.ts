import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/auth";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define session
  const session = request.cookies.get("session")?.value;

  const loginPath = "/";
  const dashboardPath = "/dashboard";

  // Auth Logic
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isLoginPage = pathname === "/";

  if (isDashboardPage) {
    if (!session) {
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    try {
      const decoded = await decrypt(session);
      if (!decoded) {
        const response = NextResponse.redirect(new URL(loginPath, request.url));
        response.cookies.set("session", "", { expires: new Date(0) });
        return response;
      }
      return NextResponse.next();
    } catch (error) {
      const response = NextResponse.redirect(new URL(loginPath, request.url));
      response.cookies.set("session", "", { expires: new Date(0) });
      return response;
    }
  }

  // Redirect to dashboard if already logged in and visiting login page
  if (isLoginPage && session) {
    try {
      const decoded = await decrypt(session);
      if (decoded) {
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
    } catch (error) {
      const response = NextResponse.next();
      response.cookies.set("session", "", { expires: new Date(0) });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_static (inside /public)
  // - all root files inside /public (e.g. /favicon.ico)
  matcher: ['/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)']
};
