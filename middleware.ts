import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight auth handler that runs on Edge Runtime.
// We use authConfig directly instead of importing from @/auth to avoid
// loading the `postgres` driver (which requires Node.js 'perf_hooks'
// not available in Edge Runtime).
const { auth } = NextAuth(authConfig);

// Cache for hostname -> slug lookups to avoid DB calls on every request
const domainCache = new Map<string, { slug: string; expiresAt: number }>();
const CACHE_TTL = 60_000; // 1 minute cache

async function lookupSlugByDomain(hostname: string): Promise<string | null> {
  // Check cache first
  const cached = domainCache.get(hostname);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.slug;
  }

  try {
    // Dynamic import to avoid loading the entire domain module at startup
    const { getStoreSlugByDomain } = await import('@/app/lib/domains');
    const slug = await getStoreSlugByDomain(hostname);

    if (slug) {
      domainCache.set(hostname, { slug, expiresAt: Date.now() + CACHE_TTL });
      return slug;
    }
  } catch {
    // If DB call fails, continue without custom domain routing
  }

  return null;
}

export default auth(async (req) => {
  const pathname = req.nextUrl.pathname;
  
  // Skip auth middleware entirely for login/signup pages to prevent loops
  if (pathname === '/login' || pathname === '/signup') {
    return NextResponse.next();
  }
  
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;
  const subscriptionExpiresAt = (req.auth?.user as any)?.subscription_expires_at as string | null | undefined;
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // ── Custom Domain Routing ───────────────────────────────────
  const hostname = req.headers.get('host') || '';
  const rootDomain = process.env.NEXT_PUBLIC_BASE_URL 
    ? new URL(process.env.NEXT_PUBLIC_BASE_URL).hostname 
    : 'vendle.com.ng';

  // Check if this is a custom domain (not our root domain)
  if (hostname !== rootDomain && !hostname.endsWith(`.${rootDomain}`)) {
    // Skip middleware handling for Next.js internals and API routes
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/static')
    ) {
      return NextResponse.next();
    }

    // Look up the store slug for this custom domain
    const slug = await lookupSlugByDomain(hostname);

    if (slug) {
      // Rewrite to the storefront page - URL stays as custom domain in browser
      const url = req.nextUrl.clone();
      url.pathname = `/s/${slug}${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.rewrite(url);
    }

    // Allow localhost / 127.0.0.1 through for local development
    const isLocalhost = hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1') || hostname.startsWith('0.0.0.0');
    if (!isLocalhost && !pathname.startsWith('/s/')) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head><title>Domain Not Connected</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f8fafc;">
          <div style="text-align: center; max-width: 480px; padding: 2rem;">
            <div style="width: 64px; height: 64px; margin: 0 auto 1.5rem; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="2" x2="22" y2="22"/>
              </svg>
            </div>
            <h1 style="font-size: 1.5rem; color: #0f172a; margin: 0 0 0.5rem; font-weight: 600;">Domain Not Connected</h1>
            <p style="color: #64748b; margin: 0 0 1.5rem; line-height: 1.5; font-size: 0.875rem;">
              This domain has not been connected to any Vendle store yet. If you are the store owner, verify your domain is set up correctly in your dashboard.
            </p>
            <a href="https://${rootDomain}" style="color: #10b981; text-decoration: underline; font-size: 0.875rem; font-weight: 500;">Go to Vendle →</a>
          </div>
        </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' }, status: 404 }
      );
    }
  }

  // ── Authentication & Subscription Gating ────────────────────
  if (!isLoggedIn && isDashboardRoute) {
    const loginUrl = new URL('/login', req.url);
    return Response.redirect(loginUrl);
  }

  if (isLoggedIn) {
    // Vendor subscription gating (UX-level). Real enforcement also exists in server actions.
    if (isDashboardRoute && role === 'vendor') {
      const allowlist = ['/dashboard/billing', '/dashboard/settings', '/dashboard/onboarding'];
      const isAllowed = allowlist.some((p) => pathname === p || pathname.startsWith(p + '/'));

      if (!isAllowed) {
        const expiresAtMs = subscriptionExpiresAt ? new Date(subscriptionExpiresAt).getTime() : 0;
        const active = !!expiresAtMs && expiresAtMs > Date.now();
        if (!active) {
          return Response.redirect(new URL('/dashboard/billing', req.url));
        }
      }
    }
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
