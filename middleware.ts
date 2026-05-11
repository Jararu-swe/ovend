import { auth } from '@/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;
  const subscriptionExpiresAt = (req.auth?.user as any)?.subscription_expires_at as string | null | undefined;
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');
  const isProfileRoute = req.nextUrl.pathname.startsWith('/profile');

  if (!isLoggedIn && (isDashboardRoute || isProfileRoute)) {
    const loginUrl = isProfileRoute ? new URL('/customer/login', req.url) : new URL('/login', req.url);
    return Response.redirect(loginUrl);
  }

  if (isLoggedIn) {
    if (isDashboardRoute && role === 'customer') {
      return Response.redirect(new URL('/profile', req.url));
    }
    if (isProfileRoute && role === 'vendor') {
      return Response.redirect(new URL('/dashboard', req.url));
    }

    // Vendor subscription gating (UX-level). Real enforcement also exists in server actions.
    if (isDashboardRoute && role === 'vendor') {
      const pathname = req.nextUrl.pathname;
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
  matcher: ['/dashboard/:path*', '/profile/:path*'],
};

