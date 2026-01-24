import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/auth";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle i18n routing first
  const response = intlMiddleware(request);

  // If next-intl is already redirecting (e.g. to add locale prefix), follow that
  if (response.status === 307 || response.status === 308) {
    return response;
  }

  // 2. Define session
  const session = request.cookies.get("session")?.value;

  // 3. Get locale for redirects
  const segments = pathname.split('/');
  const localeFromPath = segments[1];
  const isLocaleSupported = routing.locales.includes(localeFromPath as "en" | "hi");
  const currentLocale = isLocaleSupported ? (localeFromPath as "en" | "hi") : routing.defaultLocale;
  
  const loginPath = `/${currentLocale}`;
  const dashboardPath = `/${currentLocale}/dashboard`;

  // 4. Auth Logic
  const isDashboardPage = pathname.startsWith(`/${currentLocale}/dashboard`) || pathname.startsWith('/dashboard');

  // Prevent redirect loops by checking if we are already on the login page
  const isExactLocalePath = routing.locales.some(loc => pathname === `/${loc}` || pathname === `/${loc}/`);
  const isLoginPage = isExactLocalePath || pathname === '/' || pathname === '';

  if (isDashboardPage) {
    if (!session) {
      console.log(`[Middleware] No session, redirecting to ${loginPath}`);
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    try {
      const decoded = await decrypt(session);
      if (!decoded) {
        console.log(`[Middleware] Invalid session, clearing and redirecting to ${loginPath}`);
        const redirectResponse = NextResponse.redirect(new URL(loginPath, request.url));
        redirectResponse.cookies.set("session", "", { expires: new Date(0) });
        return redirectResponse;
      }
      return response;
    } catch (error) {
      console.error(`[Middleware] Decrypt error, clearing and redirecting to ${loginPath}`, error);
      const redirectResponse = NextResponse.redirect(new URL(loginPath, request.url));
      redirectResponse.cookies.set("session", "", { expires: new Date(0) });
      return redirectResponse;
    }
  }

  // Redirect to dashboard if already logged in and visiting login/root page
  if (isLoginPage && session) {
    try {
      const decoded = await decrypt(session);
      if (decoded) {
        console.log(`[Middleware] Already logged in, redirecting to ${dashboardPath}`);
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
    } catch (error) {
      console.error(`[Middleware] Session invalid on login page, clearing cookie`, error);
      response.cookies.set("session", "", { expires: new Date(0) });
    }
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_static (inside /public)
  // - all root files inside /public (e.g. /favicon.ico)
  matcher: ['/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)']
};
